// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, setDoc} from 'firebase/firestore';


//  Web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAXvc9akRiO5yBfJq6fv4G0HXy2keTuKUM",
  authDomain: "financely-rec-a42ab.firebaseapp.com",
  projectId: "financely-rec-a42ab",
  storageBucket: "financely-rec-a42ab.firebasestorage.app",
  messagingSenderId: "934247842830",
  appId: "1:934247842830:web:8e4d4a0b58279aeadb285f",
  measurementId: "G-531RL6ETVG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { db, auth, provider, doc, setDoc };