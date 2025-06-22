"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { db, auth } from "../../../lib/firebaseConfig";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  updateDoc,
  arrayUnion
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function MuseumDetail() {
  const { id } = useParams();
  const [museum, setMuseum] = useState(null);
  const [fans, setFans] = useState([]);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [isAlreadyAdded, setIsAlreadyAdded] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  // 🔹 美術館の情報を取得
  useEffect(() => {
    const fetchMuseum = async () => {
      const docRef = doc(db, "museums", id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setMuseum(snap.data());
      }
    };

    fetchMuseum();
  }, [id]);

  // 🔹 この美術館に行ったことがあるユーザーを取得
  useEffect(() => {
    const fetchFans = async () => {
      const q = query(collection(db, "users"), where("visitedMuseums", "array-contains", id));
      const snapshot = await getDocs(q);
  const result = snapshot.docs.map((doc) => ({
    id: doc.id,          // ← これを追加！
    ...doc.data()
  }));
      setFans(result);
      setUsers(result);
    };

    if (id) fetchFans();
  }, [id]);

  // 🔹 ログインユーザー情報を取得 & visitedチェック
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);

        const userRef = doc(db, "users", authUser.uid);
        const userSnap = await getDoc(userRef);
        const data = userSnap.data();
        if (data?.visitedMuseums?.some((m) => m.id === id)) {
          setIsAlreadyAdded(true);
        }
      }
    });

    return () => unsubscribe();
  }, [id]);

  // 🔹 visited に追加
  const addToVisited = async () => {
    if (!user) {
      alert("ログインが必要です");
      return;
    }

  const museumRef = doc(db, "museums", id);
  const museumSnap = await getDoc(museumRef);
  if (!museumSnap.exists()) {
    alert("美術館データが存在しません");
    return;
  }

  const museumData = museumSnap.data();

  const userRef = doc(db, "users", user.uid);
  try {
    await updateDoc(userRef, {
      visitedMuseums: arrayUnion({
        id: id,
        name: museumData.ja || "",
        favorite: false,
      }),
    });
    setAddSuccess(true);
    setIsAlreadyAdded(true);
  } catch (e) {
    console.error("更新失敗:", e);
    alert("追加に失敗しました");
  }
};

if (!museum) {
  return <p style={{ padding: 32 }}>読み込み中...</p>;
}

  return (
    <div style={{ backgroundColor: "#fdfaf4", minHeight: "100dvh", fontFamily: "'Noto Sans JP', sans-serif" }}>
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
      {/* 中身 */}
      <div
        style={{
          maxWidth: 720,
          margin: 15,
          backgroundColor: "#fff",
          border: "none",
          borderRadius: 15,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "100%",
            height: 280,
            backgroundImage: `url(${museum.imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />

        <div style={{ padding: 24 }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 700 }}>{museum.ja}</h1>
          <p style={{ fontSize: "1rem", color: "#555", marginBottom: 4 }}>{museum.en}</p>
<p style={{ fontSize: "0.95rem", color: "#777", marginBottom: 12 }}>
  <a
    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(museum.locationJa)}`}
    target="_blank"
    rel="noopener noreferrer"
    style={{ color: "#777", textDecoration: "none" }}
    title="Googleマップで開く"
  >
    {museum.locationJa} 📍
  </a>
</p>

          {museum.bioJa && (
            <p style={{ lineHeight: 1.7, marginBottom: 16 }}>{museum.bioJa}</p>
          )}

          {museum.officialSite && (
            <p style={{ fontSize: "0.9rem", marginBottom: 16 }}>
              公式サイト：
              <a
                href={museum.officialSite}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "underline", color: "#2b2e4a" }}
              >
                {museum.officialSite}
              </a>
            </p>
          )}

<div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
  {museum.tags?.map((tag) => (
    <span
      key={tag}
      style={{
        fontSize: "0.85rem",
        padding: "4px 10px",
        backgroundColor: "#eee",
        borderRadius: 12,
        color: "#333",
      }}
    >
      #{tag}
    </span>
  ))}
</div>

{user && (
  <button
    onClick={addToVisited}
    disabled={isAlreadyAdded}
    style={{
      padding: "8px 16px",
      backgroundColor: isAlreadyAdded ? "#ccc" : "#000",
      color: "#fff",
      fontWeight: 600,
      borderRadius: 4,
      border: "none",
      cursor: isAlreadyAdded ? "not-allowed" : "pointer",
    }}
  >
    {isAlreadyAdded ? "追加済み ✔︎" : "好きな美術館に追加"}
  </button>
)}

        </div>
      </div>

{fans.length > 0 && (
  <div style={{ margin: "0 15px" }}>
    <h3 style={{ fontWeight: 600, marginBottom: 16 }}>
      この美術館が好きなユーザー：
    </h3>

    {fans.map((user) => {
      const artist =
        user.favoriteArtists?.find((a) => a.favorite) ||
        user.favoriteArtists?.[0];
      const museum =
        user.visitedMuseums?.find((m) => m.favorite) ||
        user.visitedMuseums?.[0];

      return (
        <Link
          key={user.id}
          href={`/users/${user.username}?from=museums`}
          style={{
            display: "block",
            backgroundColor: "#fff",
            border: "none",
            borderRadius: 15,
            padding: 20,
            marginBottom: 20,
            textDecoration: "none",
            color: "#1a1a1a",
          }}
        >
          <div
            style={{
              fontSize: "1.5rem",
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            {user.userEmoji || "👤"} {user.userName || "（名前なし）"}
          </div>

          <div style={{ paddingLeft: 9 }}>
            {artist && (
              <div style={{ fontSize: "1rem", marginTop: 4 }}>
                🎨 {artist.name} {artist.favorite && "✨"}
              </div>
            )}
            {museum && (
              <div style={{ fontSize: "1rem", marginTop: 4 }}>
                🏛 {museum.name} {museum.favorite && "✨"}
              </div>
            )}
            {user.updatedAt?.toDate && (
              <div
                style={{
                  fontSize: "0.9rem",
                  color: "#888",
                  marginTop: 4,
                }}
              >
                📅 最終更新日:{" "}
                {user.updatedAt.toDate().toLocaleDateString("ja-JP")}
              </div>
            )}
          </div>
        </Link>
      );
    })}
  </div>
)}


      {museum.creditText && museum.creditUrl && (
        <div style={{ maxWidth: 720, margin: "0 auto 32px" }}>
          <p style={{ fontSize: "0.8rem", color: "#888", margin: 15 }}>
            画像出典：
            <a
              href={museum.creditUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#888", textDecoration: "underline" }}
            >
              {museum.creditText}
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
