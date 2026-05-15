import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA1Y_iDHQ4eo9dIkAiBjQa8wHSrZBGjqOs",
  authDomain: "cybermorse-trainer-v2.firebaseapp.com",
  projectId: "cybermorse-trainer-v2",
  storageBucket: "cybermorse-trainer-v2.firebasestorage.app",
  messagingSenderId: "274241494011",
  appId: "1:274241494011:web:a4521b1f47df2493e6095e",
  measurementId: "G-P7GSCDTRXK"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Analytics (only safely on the client side)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
