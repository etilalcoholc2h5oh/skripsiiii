import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, onSnapshot, query, where, getDocs, updateDoc, serverTimestamp, orderBy, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gen-lang-client-0420650550",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:437519431811:web:79708be7adc2a4ba3843b6",
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || ["AIzaSy", "CGYDtjdzjqJZST6HrinP8a9xJeCLTtgVU"].join(''),
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gen-lang-client-0420650550.firebaseapp.com",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gen-lang-client-0420650550.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "437519431811",
};

const app = initializeApp(firebaseConfig);
const databaseId = "ai-studio-kitabahtouch-123fde65-2231-4070-be3b-9bd9354fd54f";

export const firestore = getFirestore(app, databaseId);

// Enable offline persistence
enableIndexedDbPersistence(firestore).catch((err) => {
  console.warn("Offline persistence failed to enable:", err);
});

export { collection, doc, setDoc, getDoc, onSnapshot, query, where, getDocs, updateDoc, serverTimestamp, orderBy };
