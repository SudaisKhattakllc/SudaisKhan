import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDcdteMR6TdWPF6LKDK-upa5vHgIkkTgPk",
  authDomain: "nextjs-personal-portfoli-6630e.firebaseapp.com",
  projectId: "nextjs-personal-portfoli-6630e",
  storageBucket: "nextjs-personal-portfoli-6630e.firebasestorage.app",
  messagingSenderId: "902269325121",
  appId: "1:902269325121:web:203e80e7f7a59b05a61bc0",
  measurementId: "G-LB23N8XS7N"
};

// Initialize Firebase (safely checks if already initialized for Next.js dev server stability)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Analytics is only available in browser environments, prevent SSR crashing
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { app, analytics };
