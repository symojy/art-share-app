"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "../../lib/firebaseConfig";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export default function UsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const q = query(collection(db, "users"), orderBy("updatedAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(data);
    };
    fetchUsers();
  }, []);

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
        Arrrtr
      </Link>
      <p style={{ fontSize: "0.7rem", color: "#555", margin: 0 }}>
         アート好きの共感スペース
      </p>
    </div>

    <div style={{ fontSize: "0.95rem", color: "#555" }}>
      [👥登録者:{users.length}人]
    </div>

    <Link href="/profile" style={{ fontSize: "1.5rem" }}>
      🏠
    </Link>
  </div>
</div>


      {/* タブ切替 */}
<div
  style={{
    padding: "12px",
    display: "flex",
    gap: 16,
    borderBottom: "1px solid #ddd", // ← 旧: "#999"
    backgroundColor: "#faf7f2",
  }}
>
<div
  style={{
    padding: "8px 16px",
    borderRadius: 20,
    backgroundColor: "#f0e8dc",     // ← 選択中タブを淡ベージュで強調
    fontWeight: 600,
    color: "#1a1a1a",
    border: "1px solid #ddd",
  }}
>
          ここにいる人々
        </div>
<Link
  href="/recommendations"
  style={{
    padding: "8px 16px",
    borderRadius: 20,
    fontWeight: 500,
    backgroundColor: "transparent",
    color: "#555",
    textDecoration: "none",
    border: "1px solid #ddd",
  }}
>
          似た好みの人
        </Link>
      </div>

      <div style={{ padding: 15 }}>
        {users.map((user) => {
          const artist =
            user.favoriteArtists?.find((a) => a.favorite) ||
            user.favoriteArtists?.[0];

          const museum =
            user.visitedMuseums?.find((m) => m.favorite) ||
            user.visitedMuseums?.[0];

          return (
<Link
  key={user.id}
  href={`/users/${user.username}?from=users`}
  style={{
    display: "block",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    textDecoration: "none",
    color: "#1a1a1a",
  }}
>
  <div style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: 8 }}>
                {user.userEmoji || "👤"} {user.userName || "（名前なし）"}
              </div>

<div style={{ paddingLeft: 9, marginTop: 10 }}>
  {/* 🎨 好きな芸術家 */}
  {user.favoriteArtists?.length > 0 && (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontSize: "0.9rem", color: "#888" }}>
        🎨 好きな芸術家：
      </div>
      <div style={{ fontSize: "1.2rem", marginTop: 2 }}>
    {[...user.favoriteArtists]
        .sort((a, b) => (b.favorite === true) - (a.favorite === true))
        .slice(0, 3)
        .map((a) => `${a.favorite ? "✨" : ""}${a.name}`)
        .join("、 ")}
        {user.favoriteArtists.length > 3 && "..."}
      </div>
    </div>
  )}

  {/* 🏛 行ったことある美術館 */}
  {user.visitedMuseums?.length > 0 && (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontSize: "0.9rem", color: "#888" }}>
        🏛 好きな美術館：
      </div>
      <div style={{ fontSize: "1.2rem", marginTop: 2 }}>
    {[...user.visitedMuseums]
        .sort((a, b) => (b.favorite === true) - (a.favorite === true))
        .slice(0, 3)
        .map((m) => `${m.favorite ? "✨" : ""}${m.name}`)
        .join("、 ")}
        {user.visitedMuseums.length > 3 && "..."}
      </div>
    </div>
  )}

  {/* 📅 更新日 */}
  {user.updatedAt?.toDate && (
    <div style={{ marginTop: 8, fontSize: "0.9rem", color: "#888" }}>
      📅 最終更新日: {user.updatedAt.toDate().toLocaleDateString("ja-JP")}
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
