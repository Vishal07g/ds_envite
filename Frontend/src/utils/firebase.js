import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const env = (typeof import.meta !== "undefined" && import.meta.env) ? import.meta.env : process.env;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyDdyT6WFoVteh72mhM6UOj35TPOG-tqI6A",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "digital-invitation-e906f.firebaseapp.com",
  databaseURL: env.VITE_FIREBASE_DATABASE_URL || "https://digital-invitation-e906f-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "digital-invitation-e906f",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "digital-invitation-e906f.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "419246546637",
  appId: env.VITE_FIREBASE_APP_ID || "1:419246546637:web:fbcf127d56ef5cce05d384",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || "G-BRC5R2VVFM"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const storage = getStorage(app);
