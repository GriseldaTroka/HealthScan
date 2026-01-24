import { initializeApp } from 'firebase/app';
import { initializeFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC4xvL1PD2fh7S5l3kL5m1n2o3p4q5r6s7t",
  authDomain: "healthscanapp-a851a.firebaseapp.com",
  projectId: "healthscanapp-a851a",
  storageBucket: "healthscanapp-a851a.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456ghi789jkl"
};

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
});

async function clearBarcodes() {
  try {
    console.log('🔄 Fetching all barcode documents...');
    const barcodesRef = collection(db, 'barcodes');
    const snapshot = await getDocs(barcodesRef);
    
    console.log(`📋 Found ${snapshot.size} documents to delete`);
    
    let deleted = 0;
    for (const document of snapshot.docs) {
      await deleteDoc(doc(db, 'barcodes', document.id));
      deleted++;
      if (deleted % 100 === 0) {
        console.log(`✓ Deleted ${deleted}/${snapshot.size}`);
      }
    }
    
    console.log(`✅ Successfully deleted all ${deleted} barcode documents`);
  } catch (error) {
    console.error('❌ Error clearing barcodes:', error.message);
    process.exit(1);
  }
}

clearBarcodes();
