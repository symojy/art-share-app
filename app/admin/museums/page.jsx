// app/admin/museums/page.jsx

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

export default function AdminMuseumsPage() {
  const isAdmin = useAdminAuth();
  const [museums, setMuseums] = useState([]);
  const [selectedMuseum, setSelectedMuseum] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const fetchMuseums = async (reset = false) => {
    setLoading(true);
    const q = query(
      collection(db, "museums"),
      orderBy("ja"),
      ...(reset ? [limit(100)] : [startAfter(lastVisible), limit(100)])
    );
    const snap = await getDocs(q);
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setMuseums(reset ? docs : [...museums, ...docs]);
    setLastVisible(snap.docs[snap.docs.length - 1]);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchMuseums(true);
  }, [isAdmin]);

  const handleSave = async () => {
    if (!selectedMuseum || !selectedMuseum.id) {
      alert("IDを入力してください");
      return;
    }
    const ref = doc(db, "museums", selectedMuseum.id);
    await setDoc(ref, selectedMuseum, { merge: true });
    alert("保存しました");
    setSelectedMuseum(null);
    fetchMuseums(true);
  };

  const handleDelete = async () => {
    if (!selectedMuseum || selectedMuseum._new) return;
    const confirmed = confirm(`「${selectedMuseum.ja}」を本当に削除しますか？`);
    if (!confirmed) return;
    await deleteDoc(doc(db, "museums", selectedMuseum.id));
    alert("削除しました");
    setSelectedMuseum(null);
    fetchMuseums(true);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    const allDocs = await getDocs(collection(db, "museums"));
    const matched = allDocs.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((m) =>
        m.ja.includes(searchTerm) ||
        m.en.toLowerCase().includes(searchTerm.toLowerCase())
      );
    setSearchResults(matched);
  };

  const displayList = searchResults.length > 0 ? searchResults : museums;

  if (!isAdmin) return null;

  return (
    <div style={{ padding: 32, backgroundColor: "#faf7f2", minHeight: "100vh", fontFamily: '"Helvetica Neue", sans-serif' }}>
      <h1 style={{color: "#1a1a1a", fontSize: "1.5rem", fontWeight: 600 }}>🏛️ 美術館管理</h1>

      <div style={{color: "#1a1a1a", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <input
          placeholder="検索 (日本語・英語)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          style={{color: "#1a1a1a", padding: 8, width: "100%", maxWidth: 400, border: "1px solid #ccc" }}
        />
        <button onClick={handleSearch} style={{ marginLeft: 8 }}>🔍 検索</button>
        <button
          onClick={() => setSelectedMuseum({
            id: "",
            ja: "",
            en: "",
            locationJa: "",
            bioJa: "",
            bioEn: "",
            officialSite: "",
            imageUrl: "",
            creditText: "",
            creditUrl: "",
            tags: [],
            _new: true,
          })}
          style={{ marginLeft: 16 }}
        >
          ➕ 新規追加
        </button>
      </div>

      <ul style={{color: "#1a1a1a", listStyle: "none", padding: 0 }}>
        {displayList.map((museum) => (
          <li
            key={museum.id}
            style={{color: "#1a1a1a", padding: 12, borderBottom: "1px solid #ccc", cursor: "pointer" }}
            onClick={() => setSelectedMuseum({ ...museum })}
          >
            <strong>{museum.ja}</strong> / {museum.en} <span style={{ color: "#999" }}>({museum.id})</span>
          </li>
        ))}
      </ul>

      {loading && <p>読み込み中...</p>}
      {searchResults.length === 0 && (
        <button onClick={() => fetchMuseums()} style={{ marginTop: 16 }}>もっと表示</button>
      )}

      {selectedMuseum && (
        <div style={{color: "#1a1a1a", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#fff", padding: 24, borderRadius: 8, maxWidth: 600, width: "90%" }}>
            <h2>{selectedMuseum._new ? "新規追加" : `編集：${selectedMuseum.ja}`}</h2>
            {[
              ["ID", "id"],
              ["日本語名", "ja"],
              ["英語名", "en"],
              ["所在地", "locationJa"],
              ["画像URL", "imageUrl"],
              ["公式サイトURL", "officialSite"],
              ["画像クレジット表記", "creditText"],
              ["画像クレジットURL", "creditUrl"],
            ].map(([label, key]) => (
              <div key={key}>
                <label>{label}</label>
                <input
                  value={selectedMuseum[key] || ""}
                  onChange={(e) => setSelectedMuseum({ ...selectedMuseum, [key]: e.target.value })}
                  style={{ width: "100%", border: "1px solid #ccc" }}
                />
              </div>
            ))}

            <label>紹介文（日本語）</label>
            <textarea value={selectedMuseum.bioJa || ""} onChange={(e) => setSelectedMuseum({ ...selectedMuseum, bioJa: e.target.value })} style={{ width: "100%", minHeight: 60, border: "1px solid #ccc" }} />

            <label>紹介文（英語）</label>
            <textarea value={selectedMuseum.bioEn || ""} onChange={(e) => setSelectedMuseum({ ...selectedMuseum, bioEn: e.target.value })} style={{ width: "100%", minHeight: 60, border: "1px solid #ccc" }} />

            <label>タグ（カンマ区切り）</label>
            <input
              value={selectedMuseum.tags?.join(", ") || ""}
              onChange={(e) => setSelectedMuseum({ ...selectedMuseum, tags: e.target.value.split(",").map(tag => tag.trim()) })}
              style={{ width: "100%", border: "1px solid #ccc" }}
            />

            <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", gap: 8 }}>
              <button onClick={() => setSelectedMuseum(null)}>キャンセル</button>
              {!selectedMuseum._new && (
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
