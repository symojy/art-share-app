import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDnEe9LdLfCNv01TdJj0JBeZ5AtHjYn7gg",
  authDomain: "art-share-app.firebaseapp.com",
  projectId: "art-share-app",
  storageBucket: "art-share-app.firebasestorage.app",
  messagingSenderId: "182742757758",
  appId: "1:182742757758:web:108bb2447f33fac3c4c32f"
};

// Firebaseアプリの初期化（重複を防ぐ）
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Firebaseの各機能を取得
const auth = getAuth(app);
const db = getFirestore(app);

// 外部から使えるようにexport
export { auth, db };

