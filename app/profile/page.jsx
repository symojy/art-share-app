"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { auth, db } from "../../lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRequireAuth } from "../hooks/useRequireAuth"; // ← ✅ 修正ポイント！

export default function ProfilePage() {
  useRequireAuth(); // ✅ フック呼び出し

  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      const userRef = doc(db, "users", userId);
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        setUserData(snapshot.data());
      }
    };
    fetchUser();
  }, [userId]);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/login"; // リダイレクト
  };

  if (!userData) return <p style={{ padding: 32 }}>読み込み中...</p>;

  return (
<div
  style={{
    backgroundColor: "#faf7f2",
    color: "#1a1a1a",
    minHeight: "100vh",
    fontFamily: '"Helvetica Neue", "Noto Sans JP", sans-serif',
    fontWeight: 400,
    display: "flex",
    flexDirection: "column",
  }}
>
      {/* グローバルナビ */}
<div
  style={{
    padding: "7px 15px",
    backgroundColor: "#f5de57", // 🟡 変更！
    color: "#1a1a1a",
    borderBottom: "0px solid #ddd",
  }}
>
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <div>
      <Link
        href="/users"
        style={{
          fontSize: "1.7rem",
          fontWeight: 700,
          color: "#000", // 🖤 ここを黒に
          textDecoration: "none",
        }}
      >
        ARRRTR
      </Link>
      <p style={{ fontSize: "0.7rem", color: "#555", margin: 0 }}>
         アート好きの共感スペース
      </p>
    </div>
  </div>
</div>

      {/* プロフィールカード */}
<div
  style={{
    backgroundColor: "#fff",
    margin: 15,
    padding: 24,
    borderRadius: 15,
    border: "none",
    boxShadow: "none",
  }}
>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: "4rem", marginBottom: 0 }}>
            {userData.userEmoji || "👤"}
          </div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 600, marginBottom: 4 }}>
            {userData.userName || "（名前なし）"}
          </h1>
          <p style={{ fontSize: "1rem", color: "#555" }}>
            @{userData.username}
          </p>
  <Link
    href="/profile/edit"
    style={{ color: "#000", textDecoration: "underline" }}
  >
    プロフ編集＆好き登録📝
  </Link>
        </div>

        <div style={{ borderTop: "1px solid #ccc", paddingTop: 24 }}>
          {userData.instagram && (
            <p style={{ marginBottom: 24 }}>
              📸{" "}
              <a
                href={`https://instagram.com/${userData.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none", color: "#1a1a1a" }}
              >
                @{userData.instagram}（Instagram）
              </a>
            </p>
          )}

          <h3 style={{ fontWeight: 600 }}>🎨 好きな芸術家：</h3>
          {userData.favoriteArtists?.length > 0 ? (
            <ul style={{ paddingLeft: 20, marginBottom: 24 }}>
              {userData.favoriteArtists.map((a) => (
                <li key={a.name}>
                  {a.name} {a.favorite && "✨"}
                </li>
              ))}
            </ul>
          ) : (
            <p>未登録です</p>
          )}

          <h3 style={{ fontWeight: 600 }}>🏦 好きな美術館：</h3>
          {userData.visitedMuseums?.length > 0 ? (
            <ul style={{ paddingLeft: 20, marginBottom: 24 }}>
              {userData.visitedMuseums.map((m) => (
                <li key={m.name}>
                  {m.name} {m.favorite && "✨"}
                </li>
              ))}
            </ul>
          ) : (
            <p>未登録です</p>
          )}


<button
  onClick={handleLogout}
  style={{
    marginTop: 24,
    padding: "8px 16px",
    backgroundColor: "#e0e0e0",
    color: "#1a1a1a",
    border: "1px solid #ddd",
    borderRadius: 4,
    cursor: "pointer",
    fontWeight: 600,
  }}
>
  🔓 ログアウト
</button>        </div>
      </div>
    </div>
  );
}
