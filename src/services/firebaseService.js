// src/services/firebaseService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BARCODE_MAP } from '../data/barcodes';
import { db } from '../config/firebase';
import { doc, getDoc, getDocFromServer, setDoc } from 'firebase/firestore';

const STORAGE_KEY = 'localBarcodes';
let extraBarcodes = null; // cache for added barcodes

const ensureExtraBarcodesLoaded = async () => {
  if (extraBarcodes) return extraBarcodes;
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    extraBarcodes = stored ? JSON.parse(stored) : {};
  } catch (e) {
    extraBarcodes = {};
  }
  return extraBarcodes;
};

const persistExtraBarcodes = async () => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(extraBarcodes || {}));
  } catch (e) {
    console.log('[LocalBarcode] Persist error', e?.message);
  }
};

// Get product by barcode (Firestore first, then local fallback)
export const getProductByBarcode = async (barcode) => {
  // Try Firestore collection: 'barcodes' with document ID equal to barcode
  try {
    if (db) {
      // Prefer fresh read from server to avoid cached stale data
      let snap;
      try {
        snap = await getDocFromServer(doc(db, 'barcodes', String(barcode)));
      } catch (_) {
        // Fallback to regular getDoc if server read fails
        snap = await getDoc(doc(db, 'barcodes', String(barcode)));
      }
      if (snap.exists()) {
        const data = snap.data() || {};
        const name = data.name || data.productName || null;
        console.log('[Firestore] Doc data:', data);
        console.log('[Firestore] Resolved name:', name);
        if (name) {
          return { barcode, name, found: true, source: 'firestore' };
        }
      }
    }
  } catch (err) {
    console.log('[Firestore] Read error:', err?.message);
  }

  // Local static list
  const localName = BARCODE_MAP[barcode];
  if (localName) {
    return { barcode, name: localName, found: true, source: 'local' };
  }

  // User-added persisted list
  const extras = await ensureExtraBarcodesLoaded();
  const extraName = extras[barcode];
  if (extraName) {
    return { barcode, name: extraName, found: true, source: 'local-added' };
  }

  return { barcode, name: null, found: false, source: 'local-miss' };
};

// Add new barcode product (writes to Firestore and persists locally)
export const addBarcodeProduct = async (barcode, productName) => {
  try {
    if (db) {
      await setDoc(doc(db, 'barcodes', String(barcode)), { name: productName }, { merge: true });
      console.log('[Firestore] Added/Updated barcode', barcode);
      return { success: true, source: 'firestore' };
    }
  } catch (err) {
    console.log('[Firestore] Write error:', err?.message);
  }

  // Fallback: persist locally
  await ensureExtraBarcodesLoaded();
  extraBarcodes[barcode] = productName;
  await persistExtraBarcodes();
  return { success: true, source: 'local-added' };
};

// Add product to user's pantry (no-op here; implement separately if needed)
export const addToPantry = async (_userId, _product) => {
  return { success: true, source: 'noop' };
};
