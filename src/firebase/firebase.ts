import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAAkU0V2m5k-K4euyUNQhKrwgd1arx2uwY",
  authDomain: "vue-chat-app-8b626.firebaseapp.com",
  projectId: "vue-chat-app-8b626",
  storageBucket: "vue-chat-app-8b626.firebasestorage.app",
  messagingSenderId: "1093689484672",
  appId: "1:1093689484672:web:4f72e28c6896da99e0cd65"
};

// Initialize Firebase
// Firebaseの初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };