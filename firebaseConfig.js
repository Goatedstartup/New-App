import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// TODO: Replace with your Firebase project config from Firebase Console
// See FIREBASE_SETUP.md for instructions
const firebaseConfig = {
  apiKey: "AIzaSyCtobBUXwvLPO-WwrFdHjzL5IxJAy1BnZI",
  authDomain: "acadmey-1f1db.firebaseapp.com",
  projectId: "acadmey-1f1db",
  storageBucket: "acadmey-1f1db.firebasestorage.app",
  messagingSenderId: "356294678694",
  appId: "1:356294678694:web:0d8eecc031859a2ab3fc67"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
