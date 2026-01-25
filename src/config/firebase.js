import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration via environment (no secrets committed)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'vendos celsin ketu',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'vendos celsin ketu',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'vendos celsin ketu',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'vendos celsin ketu',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'vendos celsin ketu',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || 'vendos celsin ketu',
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || 'vendos celsin ketu',
};

// Basic validation to help developers set envs locally
const missingKeys = Object.entries(firebaseConfig)
  .filter(([_, v]) => !v || v === 'vendos celsin ketu')
  .map(([k]) => k);

if (missingKeys.length) {
  console.warn('[Firebase] Missing config keys:', missingKeys.join(', '));
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore (Expo-friendly networking)
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
});

// Initialize Storage
export const storage = getStorage(app);

// Initialize Auth with persistence for React Native
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export default app;
