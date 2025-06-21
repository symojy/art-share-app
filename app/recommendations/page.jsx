"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../lib/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";

export default function RecommendationsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [recommendedUsers, setRecommendedUsers] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const myDoc = await getDocs(collection(db, "users"));
      const myData = myDoc.docs.find((doc) => doc.id === user.uid)?.data();
      if (!myData) return;
      setCurrentUser(myData);

      const others = myDoc.docs
        .filter((doc) => doc.id !== user.uid)
        .map((doc) => ({ id: doc.id, ...doc.data() }));

      setAllUsers(others);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!currentUser || allUsers.length === 0) return;

    const myArtists = currentUser.favoriteArtists?.map((a) => a.name) || [];
    const myMuseums = currentUser.visitedMuseums?.map((m) => m.name) || [];

    const scoreUser = (user) => {
      const artistNames = user.favoriteArtists?.map((a) => a.name) || [];
      const museumNames = user.visitedMuseums?.map((m) => m.name) || [];

      const sharedArtists = artistNames.filter((a) => myArtists.includes(a));
      const sharedMuseums = museumNames.filter((m) => myMuseums.includes(m));

      return sharedArtists.length * 2 + sharedMuseums.length;
    };

    const ranked = allUsers
      .map((user) => ({ ...user, score: scoreUser(user) }))
      .filter((u) => u.score > 0)
      .sort((a, b) => b.score - a.score);

    setRecommendedUsers(ranked);
  }, [currentUser, allUsers]);

  return (
<div
  style={{
    backgroundColor: "#faf7f2",
    color: "#1a1a1a",
    minHeight: "100vh",
    fontFamily: '"Helvetica Neue", "Noto Sans JP", sans-serif',
  }}
>
      {/* グローバルナビ */}
<div
  style={{
    padding: "16px 32px",
    backgroundColor: "#faf7f2",
    color: "#1a1a1a",
    borderBottom: "1px solid #ddd",
  }}
>
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <Link
      href="/users"
      style={{
        fontSize: "1.9rem",
        fontWeight: 600,
        color: "#4a3f3f",
        textDecoration: "none",
      }}
    >
      Arrrtr
    </Link>
    <Link href="/profile" style={{ fontSize: "1.5rem" }}>👤</Link>
  </div>
</div>

      {/* タブ切替 */}
<div
  style={{
    padding: "12px",
    display: "flex",
    gap: 16,
    borderBottom: "1px solid #ddd",
    backgroundColor: "#faf7f2",
  }}
>
  {/* 非アクティブ */}
  <Link
    href="/users"
    style={{
      padding: "8px 16px",
      borderRadius: 20,
      backgroundColor: "transparent",
      fontWeight: 400,
      color: "#555",
      border: "1px solid #ddd",
      textDecoration: "none",
    }}
  >
    ここにいる人々
  </Link>

  {/* アクティブ */}
  <div
    style={{
      padding: "8px 16px",
      borderRadius: 20,
      backgroundColor: "#f0e8dc",
      fontWeight: 600,
      color: "#1a1a1a",
      border: "1px solid #ddd",
    }}
  >
    似た好みの人
  </div>
</div>


      {/* メイン */}
      <div style={{ padding: 15 }}>

        {recommendedUsers.length === 0 && (
          <p style={{ fontSize: "1rem", color: "#555" }}>
            近いユーザーがまだ見つかりません。
          </p>
        )}

{recommendedUsers.map((user) => {
  const artist =
    user.favoriteArtists?.find((a) => a.favorite) ||
    user.favoriteArtists?.[0];
  const museum =
    user.visitedMuseums?.find((m) => m.favorite) ||
    user.visitedMuseums?.[0];
  const stars = "⭐️".repeat(Math.min(5, user.score));

  return (
    <Link
      key={user.id}
      href={`/users/${user.username}?from=recommendations`}
      style={{
        display: "block",
        backgroundColor: "#fff",
        border: "0px solid #ddd",
        borderRadius: 15,
        padding: 20,
        marginBottom:15,
        textDecoration: "none",
        color: "#1a1a1a",
      }}
    >
      <div style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: 8 }}>
        {user.userEmoji || "👤"} {user.userName || "（名前なし）"}
      </div>

      <div style={{ paddingLeft: 9 }}>
        <div style={{ fontSize: "0.9rem", color: "#777" }}>
          {stars} 似てる度: {user.score}
        </div>

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
      </div>
    </Link>
  );
})}

      </div>
    </div>
  );
}
