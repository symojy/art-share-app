// app/admin/artists/page.jsx

"use client";

import { useEffect, useState } from "react";
import { db } from "../../../lib/firebaseConfig";
import {
  collection,
  getDocs,
  updateDoc,
  setDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { useAdminAuth } from "../../hooks/useAdminAuth";

export default function AdminArtistsPage() {
  const isAdmin = useAdminAuth();
  const [artists, setArtists] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const fetchArtists = async (reset = false) => {
    setLoading(true);
    const q = query(
      collection(db, "artists"),
      orderBy("ja"),
      ...(reset ? [limit(100)] : [startAfter(lastVisible), limit(100)])
    );
    const snap = await getDocs(q);
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setArtists(reset ? docs : [...artists, ...docs]);
    setLastVisible(snap.docs[snap.docs.length - 1]);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchArtists(true);
  }, [isAdmin]);

  const handleSave = async () => {
    if (!selectedArtist || !selectedArtist.id) {
      alert("IDを入力してください");
      return;
    }
    const ref = doc(db, "artists", selectedArtist.id);
    await setDoc(ref, selectedArtist, { merge: true });
    alert("保存しました");
    setSelectedArtist(null);
    fetchArtists(true);
  };

  const handleDelete = async () => {
    if (!selectedArtist || selectedArtist._new) return;
    const confirmed = confirm(`「${selectedArtist.ja}」を本当に削除しますか？`);
    if (!confirmed) return;
    await deleteDoc(doc(db, "artists", selectedArtist.id));
    alert("削除しました");
    setSelectedArtist(null);
    fetchArtists(true);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    const allDocs = await getDocs(collection(db, "artists"));
    const matched = allDocs.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((a) =>
        a.ja.includes(searchTerm) ||
        a.en.toLowerCase().includes(searchTerm.toLowerCase())
      );
    setSearchResults(matched);
  };

  const displayList = searchResults.length > 0 ? searchResults : artists;

  if (!isAdmin) return null;

  return (
    <div style={{ padding: 32, backgroundColor: "#faf7f2", minHeight: "100vh", fontFamily: '"Helvetica Neue", sans-serif' }}>
      <h1 style={{ color: "#1a1a1a", fontSize: "1.5rem", fontWeight: 600 }}>🎨 アーティスト管理</h1>

      <div style={{ color: "#1a1a1a", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <input
          placeholder="検索 (日本語・英語)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          style={{ padding: 8, width: "100%", maxWidth: 400, border: "1px solid #ccc" }}
        />
        <button onClick={handleSearch} style={{ marginLeft: 8 }}>🔍 検索</button>
        <button
          onClick={() => setSelectedArtist({
            id: "",
            ja: "",
            en: "",
            birthYear: null,
            deathYear: null,
            imageUrl: "",
            bioJa: "",
            bioEn: "",
            tags: [],
            creditText: "",
            creditUrl: "",
            _new: true,
          })}
          style={{ marginLeft: 16 }}
        >
          ➕ 新規追加
        </button>
      </div>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {displayList.map((artist) => (
          <li
            key={artist.id}
            style={{ color: "#1a1a1a", padding: 12, borderBottom: "1px solid #ccc", cursor: "pointer" }}
            onClick={() => setSelectedArtist({ ...artist })}
          >
            <strong>{artist.ja}</strong> / {artist.en} <span style={{ color: "#999" }}>({artist.id})</span>
          </li>
        ))}
      </ul>

      {loading && <p>読み込み中...</p>}
      {searchResults.length === 0 && (
        <button onClick={() => fetchArtists()} style={{ marginTop: 16 }}>もっと表示</button>
      )}

      {selectedArtist && (
        <div style={{ color: "#1a1a1a", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ color: "#1a1a1a", backgroundColor: "#fff", padding: 24, borderRadius: 8, maxWidth: 600, width: "90%" }}>
            <h2>{selectedArtist._new ? "新規追加" : `編集：${selectedArtist.ja}`}</h2>
            {[
              ["ID", "id"],
              ["日本語名", "ja"],
              ["英語名", "en"],
              ["生年", "birthYear"],
              ["没年", "deathYear"],
              ["画像URL", "imageUrl"],
              ["画像クレジット表記", "creditText"],
              ["画像クレジットURL", "creditUrl"],
            ].map(([label, key]) => (
              <div key={key}>
                <label>{label}</label>
                <input
                  value={selectedArtist[key] || ""}
                  onChange={(e) => setSelectedArtist({ ...selectedArtist, [key]: key.includes("Year") ? parseInt(e.target.value) || null : e.target.value })}
                  style={{ width: "100%", border: "1px solid #ccc" }}
                  type={key.includes("Year") ? "number" : "text"}
                />
              </div>
            ))}

            <label>説明（日本語）</label>
            <textarea value={selectedArtist.bioJa || ""} onChange={(e) => setSelectedArtist({ ...selectedArtist, bioJa: e.target.value })} style={{ width: "100%", minHeight: 60, border: "1px solid #ccc" }} />
            <label>説明（英語）</label>
            <textarea value={selectedArtist.bioEn || ""} onChange={(e) => setSelectedArtist({ ...selectedArtist, bioEn: e.target.value })} style={{ width: "100%", minHeight: 60, border: "1px solid #ccc" }} />

            <label>タグ（カンマ区切り）</label>
            <input
              value={selectedArtist.tags?.join(", ") || ""}
              onChange={(e) => setSelectedArtist({ ...selectedArtist, tags: e.target.value.split(",").map(tag => tag.trim()) })}
              style={{ width: "100%", border: "1px solid #ccc" }}
            />

            <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", gap: 8 }}>
              <button onClick={() => setSelectedArtist(null)}>キャンセル</button>
              {!selectedArtist._new && (
                <button onClick={handleDelete} style={{ color: "red" }}>削除</button>
              )}
              <button onClick={handleSave}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
