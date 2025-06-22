"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { db } from "../../../lib/firebaseConfig";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { useRequireAuth } from "../../hooks/useRequireAuth"; // ✅ 追加！

export default function UserProfileByUsername() {
  useRequireAuth(); // ✅ 追加！

  const { username } = useParams();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  const [userData, setUserData] = useState(null);
  const [artistImages, setArtistImages] = useState({});
  const [museumImages, setMuseumImages] = useState({});
  const [notFound, setNotFound] = useState(false);
　const fromArtistId = searchParams.get("fromArtistId");
　const fromArtistName = searchParams.get("fromArtistName");

  // 🔸 ユーザーデータ取得
  useEffect(() => {
    const fetchUser = async () => {
      const q = query(collection(db, "users"), where("username", "==", username));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        setNotFound(true);
        return;
      }
      setUserData(snapshot.docs[0].data());
    };
    if (username) fetchUser();
  }, [username]);

  // 🔸 アーティスト画像取得
  useEffect(() => {
    const fetchImages = async () => {
      if (!userData?.favoriteArtists) return;
      const images = {};

      for (const artist of userData.favoriteArtists) {
        try {
          const docRef = doc(db, "artists", artist.id);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            images[artist.id] = snap.data().imageUrl || null;
          }
        } catch (e) {
          console.warn("画像取得エラー:", artist.id, e);
          images[artist.id] = null;
        }
      }

      setArtistImages(images);
    };

    fetchImages();
  }, [userData?.favoriteArtists]);

  // 🔸 美術館画像取得 ← 🔥これが追加された部分
  useEffect(() => {
    const fetchMuseumImages = async () => {
      if (!userData?.visitedMuseums) return;
      const images = {};

      for (const museum of userData.visitedMuseums) {
        try {
          const docRef = doc(db, "museums", museum.id);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            images[museum.id] = snap.data().imageUrl || null;
          }
        } catch (e) {
          console.warn("美術館画像取得エラー:", museum.id, e);
          images[museum.id] = null;
        }
      }

      setMuseumImages(images);
    };

    fetchMuseumImages();
  }, [userData?.visitedMuseums]);

  if (notFound) return <p style={{ padding: 32 }}>ユーザーが見つかりませんでした。</p>;
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
    padding: "16px 20px",
    backgroundColor: "#faf7f2",
    color: "#1a1a1a",
    borderBottom: "1px solid #ddd",
  }}
>
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <div>
      <Link
        href="/users"
        style={{
          fontSize: "1.8rem",
          fontWeight: 600,
          color: "#4a3f3f",
          textDecoration: "none",
        }}
      >
        Arrrtr
      </Link>
      <p style={{ fontSize: "0.75rem", color: "#888", margin: 0 }}>
         アート好きの共感スペース
      </p>
    </div>

    <Link href="/profile" style={{ fontSize: "1.5rem" }}>
      👤
    </Link>
  </div>
</div>

      {/* プロフィールカード */}
<div
  style={{
    backgroundColor: "#fff",
    margin: "15px 15px",
    padding: 24,
    borderRadius: 15,
    border: "none",
    boxShadow: "none"
  }}
>
        {/* 上部（中央揃え） */}
<div style={{ textAlign: "center", marginBottom: 32 }}>
  <div style={{ fontSize: "4rem", marginBottom: 8 }}>
    {userData.userEmoji || "👤"}
  </div>
  <h1 style={{ fontSize: "1.8rem", fontWeight: 600, marginBottom: 4 }}>
    {userData.userName || "（名前なし）"}
  </h1>
  <p style={{ fontSize: "1rem", color: "#555" }}>
    @{userData.username || "ユーザーID不明"}
  </p>
            {/* Instagram */}
{userData.instagram && (
  <p style={{ marginBottom: 24 }}>
    📷️Instagram :{" "}
    <a
      href={`https://instagram.com/${userData.instagram}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: "#1a1a1a", textDecoration: "underline" }}
    >
      @{userData.instagram}
    </a>
  </p>
)}

</div>

        {/* 下部（左揃え） */}
        <div style={{ textAlign: "left" }}>
          <hr style={{ margin: "32px 0", border: "none", borderTop: "1px solid #ddd" }} />

          {/* 好きな芸術家 */}
          <h3 style={{ fontWeight: 600,marginBottom: 18 }}>🎨 好きな芸術家：</h3>
{userData.favoriteArtists?.length > 0 ? (
  <ul
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: 8,
      paddingLeft: 0,
      marginBottom: 24,
      listStyle: "none",
    }}
  >
    {[...userData.favoriteArtists]
      .sort((a, b) => (b.favorite === true) - (a.favorite === true))
      .map((a) => (
        <li key={a.id}>
          <Link
            href={`/artists/${encodeURIComponent(a.id)}?fromUser=${userData.username}&fromUserName=${encodeURIComponent(userData.userName || "（名前なし）")}`}

            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 15px 8px 15px",
              marginBottom: 5,
              border: "1px solid #aaa",
              borderRadius: 25,
              backgroundColor: "#f8f8f8",
              fontSize: "1.05rem",
              fontWeight: 500,
              color: "#1a1a1a",
              textDecoration: "none",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#eee")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f8f8f8")}
          >

            {a.name} {a.favorite && "✨"}
          </Link>
        </li>
      ))}
  </ul>
) : (
  <p>未登録です</p>
)}


          {/* 好きな美術館 */}
<h3 style={{ fontWeight: 600, marginBottom: 18 }}>🏦 好きな美術館：</h3>
{userData.visitedMuseums?.length > 0 ? (

<ul style={{ display: "flex", flexWrap: "wrap", gap: 12, paddingLeft: 0, listStyle: "none", marginBottom: 24 }}>
  {[...userData.visitedMuseums]
    .sort((a, b) => (b.favorite === true) - (a.favorite === true))
    .map((m) => (
      <li key={m.id}>
        <Link
          href={`/museums/${m.id}`}
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px 15px 8px 15px",
            marginBottom: 5,
            border: "1px solid #aaa",
            borderRadius: 25,
            backgroundColor: "#f8f8f8",
            fontSize: "1.05rem",
            fontWeight: 500,
            color: "#1a1a1a",
            textDecoration: "none",
            transition: "background-color 0.2s",
          }}
        >

          {m.name} {m.favorite && "✨"}
        </Link>
      </li>
    ))}
</ul>


) : (
  <p>未登録です</p>
)}

        </div>
      </div>
    </div>
  );
}
