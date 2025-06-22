"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db, auth } from "../../../lib/firebaseConfig";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
  arrayUnion
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ArtistDetailPage() {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [fans, setFans] = useState([]);
  const [user, setUser] = useState(null);
  const [isAlreadyAdded, setIsAlreadyAdded] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const searchParams = useSearchParams();
  const fromUser = searchParams.get("fromUser");
  const fromUserName = decodeURIComponent(searchParams.get("fromUserName") || "");

  useEffect(() => {
    const fetchArtist = async () => {
      const docRef = doc(db, "artists", id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        setArtist(snapshot.data());
      }
    };
    if (id) fetchArtist();
  }, [id]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userAuth) => {
      if (userAuth) {
        const docRef = doc(db, "users", userAuth.uid);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          setUser({ ...data, uid: userAuth.uid });

          const already = data.favoriteArtists?.some(
            (a) => a.name === artist?.ja
          );
          setIsAlreadyAdded(already);
        }
      }
    });
    return () => unsubscribe();
  }, [artist?.ja]);

  useEffect(() => {
    const fetchFans = async () => {
      const userSnapshot = await getDocs(collection(db, "users"));
      const matched = userSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((user) =>
          user.favoriteArtists?.some((a) => a.name === artist?.ja)
        );
      setFans(matched);
    };

    if (artist?.ja) fetchFans();
  }, [artist?.ja, addSuccess]);

  const handleAddFavorite = async () => {
    if (!user || !artist) return;
    const docRef = doc(db, "users", user.uid);
    await updateDoc(docRef, {
  favoriteArtists: arrayUnion({ id, name: artist.ja, favorite: false })
    });
    setIsAlreadyAdded(true);
    setAddSuccess(true);
  };

  if (!artist) return <p style={{ padding: 32 }}>読み込み中...</p>;

  const birth = artist.birthYear ?? "不明";
  const death = artist.deathYear ? `– ${artist.deathYear}` : "–";
  const yearText = `${birth}${artist.deathYear !== null ? death : "年生"}`;

  return (
    <div
      style={{
        backgroundColor: "#faf7f2",
        color: "#1a1a1a",
        minHeight: "100vh",
        fontFamily: '"Helvetica Neue", "Noto Sans JP", sans-serif',
        paddingBottom: 48,
      }}
    >
      {/* ナビ */}
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
    <Link href="/profile" style={{ fontSize: "1.5rem" }}>
      🏠
    </Link>
  </div>
</div>
      {/* カード全体（画像＋中身） */}
      <div
        style={{
          backgroundColor: "#fff",
          margin: 15,
          borderRadius: 15,
          border: "none",
          boxShadow: "none",
          overflow: "hidden",
        }}
      >
        {/* 背景画像：カード全幅で表示 */}
        <div
          style={{
            width: "100%",
            height: 350,
            backgroundImage: `url(${artist.imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />

        {/* カードの中身 */}
        <div style={{ padding: 24 }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 700 }}>{artist.ja}</h1>
          <p style={{ fontSize: "1rem", color: "#555", marginBottom: 4 }}>
            {artist.en}
          </p>
          <p style={{ fontSize: "1rem", color: "#777", marginBottom: 16 }}>
            {yearText}
          </p>
          {artist.bioJa && (
            <p style={{ lineHeight: 1.7, marginBottom: 24 }}>{artist.bioJa}</p>
          )}
          {artist.tags?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              {artist.tags.map((tag, index) => (
                <span
                  key={index}
                  style={{
                    display: "inline-block",
                    padding: "4px 8px",
                    marginRight: 8,
                    marginBottom: 8,
                    backgroundColor: "#f0e8dc",
                    borderRadius: 4,
                    fontSize: "0.9rem",
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {user && (
            <button
              onClick={handleAddFavorite}
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
              {isAlreadyAdded ? "追加済み ✔︎" : "この芸術家を好きに追加"}
            </button>
          )}
        </div>
      </div>

{/* ファン一覧 */}
{fans.length > 0 && (
  <div style={{ margin: "0 15px" }}>
    <h3 style={{ fontWeight: 600, marginBottom: 16 }}>
      このアーティストを好きな人：
    </h3>

    {fans.map((user) => {
      const favArtist =
        user.favoriteArtists?.find((a) => a.favorite) ||
        user.favoriteArtists?.[0];

      const favMuseum =
        user.visitedMuseums?.find((m) => m.favorite) ||
        user.visitedMuseums?.[0];

      return (
        <Link
          key={user.id}
          href={`/users/${user.username}?fromArtistId=${id}&fromArtistName=${encodeURIComponent(artist?.ja || "")}`}
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
            {favArtist && (
              <div style={{ fontSize: "1rem", marginTop: 4 }}>
                🎨 {favArtist.name} {favArtist.favorite && "✨"}
              </div>
            )}
            {favMuseum && (
              <div style={{ fontSize: "1rem", marginTop: 4 }}>
                🏛 {favMuseum.name} {favMuseum.favorite && "✨"}
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

      {artist.creditText && artist.creditUrl && (
  <div style={{ margin: "0 32px" }}>
    <p style={{ fontSize: "0.8rem", color: "#888", marginTop: 16 }}>
      画像出典：
      <a
        href={artist.creditUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#888", textDecoration: "underline" }}
      >
        {artist.creditText}
      </a>
    </p>
  </div>
)}
    </div>
  );
}
