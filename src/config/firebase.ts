import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyAtiguc8T9bmnM5LfUn2r7tJ6njrs_LSXo",
    authDomain: "muraldb-935aa.firebaseapp.com",
    projectId: "muraldb-935aa",
    storageBucket: "muraldb-935aa.firebasestorage.app",
    messagingSenderId: "588012525327",
    appId: "1:588012525327:web:46f1c8e1f3e8a2cc91907a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;