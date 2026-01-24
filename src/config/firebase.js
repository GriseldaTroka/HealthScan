import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD_ZeP8fHxd1HP4IYHDPoon-T0rS9tjZqw",
  authDomain: "healthscanapp-a851a.firebaseapp.com",
  projectId: "healthscanapp-a851a",
  storageBucket: "healthscanapp-a851a.firebasestorage.app",
  messagingSenderId: "290150179152",
  appId: "1:290150179152:web:0046f7c957386009eccc55",
  measurementId: "G-KB1MTEJMBJ"
};

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
