import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDQUzZJ8ybT7XO5OhA2Gg1fnirBUdidbL4",
  authDomain: "inventory-88449.firebaseapp.com",
  projectId: "inventory-88449",
  storageBucket: "inventory-88449.appspot.com",
  messagingSenderId: "203158676548",
  appId: "1:203158676548:web:e35d082bfb5dee08e74811",
  measurementId: "G-C6NDTG75V8"
};

// Initialize Firebase only if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { auth, firestore, storage };
