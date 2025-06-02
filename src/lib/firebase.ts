import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyCU6pDf2Il4rINo_ZTO1qBmPi5D_P0flJA",
  authDomain: "ycompany-app.firebaseapp.com",
  projectId: "ycompany-app",
  storageBucket: "ycompany-app.firebasestorage.app",
  messagingSenderId: "931317445669",
  appId: "1:931317445669:web:00ed7eb9d5cb005507bbcc",
  measurementId: "G-5X9VWV0839"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };
