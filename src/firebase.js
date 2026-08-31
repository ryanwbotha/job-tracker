import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

// The config will be automatically provided by Firebase Hosting in production,
// but for local dev we need to get it from firebase apps:sdkconfig.
// However, since we are setting this up manually, we can just use the project ID for now.
// Note: You must get the actual config from Firebase console or CLI and replace this.
const firebaseConfig = {
  apiKey: "AIzaSyCuHDFzzdcqSkzxRkASHgZMj1XU2YuqaQ8",
  authDomain: "whatsnext-job-tracker-26.firebaseapp.com",
  projectId: "whatsnext-job-tracker-26",
  storageBucket: "whatsnext-job-tracker-26.firebasestorage.app",
  messagingSenderId: "78027514164",
  appId: "1:78027514164:web:1faad6314e3d2ad6e58561"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATOR === 'true') {
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
}

export const googleProvider = new GoogleAuthProvider();
