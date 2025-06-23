"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../lib/firebaseConfig";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp, collection, query, where, getDocs } from "firebase/firestore";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [showToast, setShowToast] = useState(false);

const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
      // 🔸 重複しない username を生成
      const generateUniqueUsername = async () => {
        let username;
        let isUnique = false;

        while (!isUnique) {
          username = `user_${Math.random().toString(36).slice(2, 10)}`;
          const existing = await getDocs(
            query(collection(db, "users"), where("username", "==", username))
          );
          if (existing.empty) {
            isUnique = true;
          }
        }
        return username;
      };

      const uniqueUsername = await generateUniqueUsername();

      await setDoc(userRef, {
        name: user.displayName,
        email: user.email,
        username: uniqueUsername, // ✅ 自動生成で重複なし
        createdAt: serverTimestamp()
      });
    }

    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      router.push("/users");
    }, 2000);
  } catch (error) {
    console.error("ログイン失敗:", error);
    alert("ログイン失敗しました");
  }
};



  return (
<div
  style={{
    backgroundColor: "#f5de57",
    color: "#1a1a1a",
    minHeight: "100vh",
    fontFamily: '"Helvetica Neue", "Noto Sans JP", sans-serif',
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 16
  }}
>
<div
  style={{
    backgroundColor: "#fff",
    border: "none",
    borderRadius: 15,
    boxShadow: "none",
    maxWidth: 480,
    width: "100%",
    padding: 24,
    textAlign: "center"
  }}
>

        <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 16 }}>
          ARRRTR
        </h1>
        <p style={{ fontSize: "1rem", marginBottom: 24, lineHeight: 1.5 }}>
          あなたの「推し」芸術家が誰かの新たな出会いに。記録と共感でひろがる、小さくて静かな共感スペース。
        </p>

        <div style={{ marginBottom: 24, fontSize: "0.95rem", lineHeight: 1.4 }}>
          <div>🎨 好きな芸術家を記録しよう</div>
          <div>🤝 好みが近い人とつながれる</div>
          <div>🌟 推しから新たな発見がある</div>
        </div>

        <button
          onClick={loginWithGoogle}
          style={{
            padding: "10px 20px",
            fontSize: "1rem",
            fontWeight: 600,
            backgroundColor: "#f5de57",
            color: "#000",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            marginBottom: 16,
            boxShadow: "none"
          }}
        >
          Googleで登録/ログイン
        </button>

        <div>
          <Link
            href="/users"
            style={{
              fontSize: "0.9rem",
              color: "#333",
              textDecoration: "underline"
            }}
          >
            とりあえずどんな感じか見てみる👀
          </Link>
        </div>
      </div>

      {showToast && (
<div
  style={{
    position: "fixed",
    top: 20,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 9999,
    padding: "12px 24px",
    backgroundColor: "#d4edda",
    color: "#155724",
    border: "1px solid #c3e6cb",
    borderRadius: 4,
    boxShadow: "none"
  }}
>
          ✅ ログインしました！
        </div>
      )}
    </div>
  );
}
