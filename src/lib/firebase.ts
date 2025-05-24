// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, OAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

function createFirebaseApp() {
  // Avoid re-initializing
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

export const firebaseApp = createFirebaseApp();
// export const analytics = getAnalytics(firebaseApp);
export const auth = getAuth(firebaseApp);
export const firestore = getFirestore(firebaseApp);
export const microsoftProvider = new OAuthProvider("microsoft.com");