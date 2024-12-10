import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAzH42-ROR5hja6hoDMYqqdrtkUi4DQLQY",
    authDomain: "payment-history-dcb7d.firebaseapp.com",
    projectId: "payment-history-dcb7d",
    storageBucket: "payment-history-dcb7d.firebasestorage.app",
    messagingSenderId: "930658374733",
    appId: "1:930658374733:web:73ec494afe4cbf7578f804",
    measurementId: "G-DV11PQ2TFP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider, signInWithPopup };
