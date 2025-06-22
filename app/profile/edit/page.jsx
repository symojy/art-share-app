"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { auth, db } from "../../../lib/firebaseConfig";
import {
  doc,
  updateDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  serverTimestamp
} from "firebase/firestore";
import { useRouter } from "next/navigation";

const emojiOptions = [
  "🎨", "🖌️", "🖼️", "🧑‍🎨", "🎭", "📷", "📖", "🎼", "📺", "🎬",
  "🥷", "🧸", "😎", "🥺", "🤖", "👽", "👻", "🐱", "🐶", "🦊",
  "🐼", "🐸", "🦄", "🐙", "🌸", "🍀", "🍎", "🍩", "🍣", "🍜",
  "🗻", "🏰", "🚀", "🌈", "⭐", "🔥", "💧", "☁️", "⚡", "🌙",
  "📌", "🔑", "🧭", "💡", "💎", "🔮", "🎁", "🎲", "🧩", "🧵",
  "✏️", "🖋️", "📎", "🗂️", "📂", "📬", "🛒", "🔔", "🪄",
  "🪐", "🌍", "🌆", "🏞️", "🛤️", "🎡", "🎢", "⛩️", "🏯", "🗿",
  "❤️", "💙", "💛", "💚", "🖤", "🤍", "💜", "🧡", "💖", "💫",
  "🙈", "🙉", "🙊", "😺", "😸", "😹", "😻", "😼", "😽", "😿",
  "😾", "🥰", "😊", "🤩", "😇", "😉", "🤗", "😋", "😜", "🤔"
];

export default function EditProfilePage() {
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const [userEmoji, setUserEmoji] = useState("🎨");
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [instagram, setInstagram] = useState("");

  const [artistOptions, setArtistOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [selectedArtists, setSelectedArtists] = useState([]);

  const [museumOptions, setMuseumOptions] = useState([]);
  const [museumSearchTerm, setMuseumSearchTerm] = useState("");
  const [filteredMuseums, setFilteredMuseums] = useState([]);
  const [selectedMuseums, setSelectedMuseums] = useState([]);

  const [activeTab, setActiveTab] = useState("profile");
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const router = useRouter();

  const [userNameError, setUserNameError] = useState("");
  const [instagramError, setInstagramError] = useState("");

　const [showWelcome, setShowWelcome] = useState(false); 

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserId(user.uid);
        const docRef = doc(db, "users", user.uid);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          setUserName(data.userName || "");
          setUserEmoji(data.userEmoji || "🎨");
          setUsername(data.username || "");
          setInstagram(data.instagram || "");
          setSelectedArtists(data.favoriteArtists || []);
          setSelectedMuseums(data.visitedMuseums || []);
            if ((data.favoriteArtists?.length || 0) === 0) {
    setShowWelcome(true);
        }
      }
    }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchOptions = async () => {
      const artistSnap = await getDocs(collection(db, "artists"));
      const museumSnap = await getDocs(collection(db, "museums"));
setArtistOptions(
  artistSnap.docs.map((doc) => ({
    id: doc.id,       // ← これでドキュメントIDを補完！
    ...doc.data()     // ← ja / en などの残りのデータ
  }))
);
setMuseumOptions(
  museumSnap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),  // 必ず ja が含まれていること
  }))
);
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredOptions([]);
      return;
    }
    const filtered = artistOptions.filter((artist) =>
      artist.ja.includes(searchTerm) || artist.en.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [searchTerm, artistOptions]);

  useEffect(() => {
    if (museumSearchTerm.trim() === "") {
      setFilteredMuseums([]);
      return;
    }
    const filtered = museumOptions.filter((museum) =>
      museum.ja.includes(museumSearchTerm) || museum.en.toLowerCase().includes(museumSearchTerm.toLowerCase())
    );
    setFilteredMuseums(filtered);
  }, [museumSearchTerm, museumOptions]);

const addArtist = (artist) => {
  if (selectedArtists.length >= 30) {
    alert("好きな芸術家は最大30人まで登録できます。");
    return;
  }
  const alreadyAdded = selectedArtists.find((a) => a.id === artist.id);
  if (!alreadyAdded) {
    setSelectedArtists([
      ...selectedArtists,
      {
        name: artist.ja,
        id: artist.id,
        favorite: false,
      },
    ]);
  }
  setSearchTerm("");
  setFilteredOptions([]);
};

  const addMuseum = (museum) => {
    if (selectedMuseums.length >= 30) {
      alert("行ったことある美術館は最大30件まで登録できます。");
      return;
    }
    const alreadyAdded = selectedMuseums.find((m) => m.name === museum.ja);
    if (!alreadyAdded) {
      setSelectedMuseums([...selectedMuseums,       {
        id: museum.id,         // 🔸 追加！
        name: museum.ja,       // 🔸 日本語名を表示用に
        favorite: false,
      },]);
    }
    setMuseumSearchTerm("");
    setFilteredMuseums([]);
  };

const removeItem = (name, isMuseum = false) => {
  if (isMuseum) {
    setSelectedMuseums((prev) =>
      Array.isArray(prev) ? prev.filter((m) => m.name !== name) : []
    );
  } else {
    setSelectedArtists((prev) =>
      Array.isArray(prev) ? prev.filter((a) => a.name !== name) : []
    );
  }
};

const toggleFavorite = (name, isMuseum = false) => {
  if (isMuseum) {
    setSelectedMuseums((prev) =>
      prev.map((m) =>
        m.name === name ? { ...m, favorite: !m.favorite } : m
      )
    );
  } else {
    setSelectedArtists((prev) =>
      prev.map((a) =>
        a.name === name ? { ...a, favorite: !a.favorite } : a
      )
    );
  }
};

  const handleSave = async () => {
    if (!userId || selectedArtists.length === 0) {
      alert("最低1人は好きな芸術家を選んでください");
      return;
    }

    const q = query(collection(db, "users"), where("username", "==", username));
    const snapshot = await getDocs(q);
    const isDuplicate = snapshot.docs.some((doc) => doc.id !== userId);
    if (isDuplicate) {
      setUsernameError("このユーザーIDは既に使われています");
      return;
    } else {
      setUsernameError("");
    }

    await updateDoc(doc(db, "users", userId), {
      userName,
      userEmoji,
      username,
      instagram,
      favoriteArtists: selectedArtists,
      visitedMuseums: selectedMuseums,
      updatedAt: serverTimestamp(),
    });

    setShowSavedMessage(true);
    setTimeout(() => {
      setShowSavedMessage(false);
      router.push("/profile");
    }, 1000);
  };

  return (
<div
  style={{
    backgroundColor: "#faf7f2",
    color: "#1a1a1a",
    minHeight: "100vh",
    paddingBottom: 32,
    fontFamily: '"Helvetica Neue", "Noto Sans JP", sans-serif',
  }}
>
<div
  style={{
    padding: "7px 15px", // ✅ 修正
    backgroundColor: "#f5de57", // ✅ 修正（黄色に）
    borderBottom: "0px solid #ddd", // ✅ 不要なので0pxに
  }}
>
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <div>
      <Link
        href="/users"
        style={{
          fontSize: "1.7rem",       // ✅ サイズ統一
          fontWeight: 700,          // ✅ 太字強めに
          color: "#000",            // ✅ 黒に
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
<div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
  {/* プロフィール情報タブ */}
  <button
    onClick={() => setActiveTab("profile")}
    style={{
      padding: "6px 16px",
      border: "1px solid #ddd",
      backgroundColor: activeTab === "profile" ? "#f0e8dc" : "#fff",
      fontWeight: activeTab === "profile" ? 600 : 400,
      color: activeTab === "profile" ? "#1a1a1a" : "#555",
      borderRadius: 20,
      cursor: "pointer",
      transition: "background-color 0.2s",
    }}
  >
    プロフィール情報
  </button>

  {/* アート情報タブ */}
  <button
    onClick={() => setActiveTab("art")}
    style={{
      padding: "6px 16px",
      border: "1px solid #ddd",
      backgroundColor: activeTab === "art" ? "#f0e8dc" : "#fff",
      fontWeight: activeTab === "art" ? 600 : 400,
      color: activeTab === "art" ? "#1a1a1a" : "#555",
      borderRadius: 20,
      cursor: "pointer",
      transition: "background-color 0.2s",
    }}
  >
    アート情報
  </button>
</div>


        {activeTab === "profile" && (
          <>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: 16 }}>プロフィール情報</h2>
        <label>ニックネーム(表示名)※必須</label>
<input
  value={userName}
  onChange={(e) => {
    const val = e.target.value;
    setUserName(val);
    if (val.length > 10) {
      setUserNameError("名前は10文字以内で入力してください");
    } else if (/[<>]/.test(val)) {
      setUserNameError("名前に < や > は使えません");
    } else {
      setUserNameError("");
    }
  }}
  maxLength={30}
  style={{
    width: "100%",
    padding: 8,
    border: "1px solid #ccc",
    borderRadius: 4,
    marginBottom: 8,
    backgroundColor: "#fff"
  }}
/>
{userNameError && (
  <p style={{ color: "red", fontSize: "0.9rem", marginBottom: 8 }}>
    {userNameError}
  </p>
)}
        <label style={{ marginTop: 16, display: "block" }}>アイコン絵文字（お好みで1つ）</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {emojiOptions.map((emoji) => (
            <button key={emoji} onClick={() => setUserEmoji(emoji)} style={{
              fontSize: 24,
              padding: 8,
              borderRadius: 8,
              border: emoji === userEmoji ? "2px solid #1a1a1a" : "1px solid #ccc",
              backgroundColor: emoji === userEmoji ? "#f0e8dc" : "#fff",
              cursor: "pointer"
            }}>{emoji}</button>
          ))}
        </div>

        <label>ユーザーID(URLで使われる)※変更OK</label>
<input
  value={username}
  onChange={(e) => {
    const val = e.target.value;
    setUsername(val);
    if (val.length < 4) {
      setUsernameError("ユーザーIDは4文字以上で入力してください");
    } else if (val.length > 20) {
      setUsernameError("ユーザーIDは20文字以内で入力してください");
    } else if (!/^[a-zA-Z0-9_]+$/.test(val)) {
      setUsernameError("ユーザーIDは英数字と _ のみ使用できます");
    } else if (/[<>]/.test(val)) {
      setUsernameError("ユーザーIDに < や > は使えません");
    } else {
      setUsernameError("");
    }
  }}
  maxLength={20}
  style={{
    width: "100%",
    padding: 8,
    border: "1px solid #ccc",
    borderRadius: 4,
    marginBottom: 8,
    backgroundColor: "#fff"
  }}
/>
{usernameError && (
  <p style={{ color: "red", fontSize: "0.9rem", marginBottom: 8 }}>
    {usernameError}
  </p>
)}


<label style={{ marginTop: 16, display: "block" }}>Instagram ID※任意</label>
<div style={{
  display: "flex",
  alignItems: "center",
  border: "1px solid #ccc",
  borderRadius: 4,
  overflow: "hidden",
  marginBottom: 8,
  width: "100%",
  maxWidth: 400
}}>
  <span style={{
    backgroundColor: "#f5f5f5",
    padding: "8px 12px",
    fontSize: "1rem",
    color: "#666",
    borderRight: "1px solid #ccc"
  }}>@</span>
  <input
    type="text"
    value={instagram}
  onChange={(e) => {
    const val = e.target.value.replace(/@/g, "");
    setInstagram(val);
    if (val.length > 30) {
      setInstagramError("Instagram IDは30文字以内で入力してください");
    } else if (/[<>]/.test(val)) {
      setInstagramError("Instagram IDに < や > は使えません");
    } else {
      setInstagramError("");
    }
    }}
    maxLength={30}
    placeholder="your_instagram_id"
    style={{
      flex: 1,
      padding: 8,
      border: "none",
      outline: "none",
      fontSize: "1rem",
      minWidth: 0,
      backgroundColor: "#fff"
    }}
  />
</div>
{instagramError && (
  <p style={{ color: "red", fontSize: "0.9rem", marginBottom: 8 }}>
    {instagramError}
  </p>
)}

          </>
        )}

        {activeTab === "art" && (
          <>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: 16 }}>アート情報</h2>
        {/* 好きな芸術家 */}
<label style={{ display: "block", marginTop: 32, fontWeight: 600 }}>
  🎨 好きな芸術家（検索して追加）
</label>

<input
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  placeholder="例：ゴッホ、van Gogh..."
  style={{
    width: "100%",
    padding: 8,
    border: "1px solid #ccc",
    borderRadius: 4,
    marginBottom: 8,
  }}
/>

{/* 2文字未満のときのヒント表示 */}
{searchTerm.length > 0 && searchTerm.length < 2 && (
  <p style={{ color: "#888", fontSize: "0.9rem", marginBottom: 8 }}>
    2文字以上で検索できます
  </p>
)}

{/* 候補リスト（2文字以上の場合のみ） */}
{searchTerm.length >= 2 && filteredOptions.length > 0 && (
<ul style={{ paddingLeft: 0, listStyle: "none", marginBottom: 8 }}>
  {filteredOptions.map((artist, index) => (
<li
　key={`${artist.ja}-${index}`}
  onClick={() => addArtist(artist)}
  style={{
    cursor: "pointer",
    padding: "10px 12px",
    marginBottom: 6,
    backgroundColor: "#f5f5f5",
    border: "1px solid #ddd",
    boxShadow: "none",
    borderRadius: 4,
    fontSize: "0.95rem",
    color: "#222",
  }}
>
  ➕ {artist.ja}
</li>
  ))}
</ul>

)}

        <ul style={{ listStyle: "none", padding: 0, marginTop: 16 }}>
          {[...selectedArtists]
            .sort((a, b) => (b.favorite === true) - (a.favorite === true))
            .map((a, i) => (
              <li key={`${a.name}-${i}`} style={{ marginBottom: 8, padding: 8, border: "1px solid #ddd", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{a.name} {a.favorite && "✨"}</span>
                <div>
                  <button onClick={() => toggleFavorite(a.name)} style={{ marginRight: 8 }}>
                    {a.favorite ? "推し解除｜" : "✨推し｜"}
                  </button>
                  <button onClick={() => removeItem(a.name)}>❎️</button>
                </div>
              </li>
            ))}
        </ul>

{/* 好きな美術館 */}
<label style={{ display: "block", marginTop: 32, fontWeight: 600 }}>
  🏦 好きな美術館（検索して追加）
</label>

<input
  value={museumSearchTerm}
  onChange={(e) => setMuseumSearchTerm(e.target.value)}
  placeholder="例：東京都現代美術館、MOT..."
  style={{
    width: "100%",
    padding: 8,
    border: "1px solid #ccc",
    borderRadius: 4,
    marginBottom: 8,
  }}
/>

{/* 2文字未満のときのヒント表示 */}
{museumSearchTerm.length > 0 && museumSearchTerm.length < 2 && (
  <p style={{ color: "#888", fontSize: "0.9rem", marginBottom: 8 }}>
    2文字以上で検索できます
  </p>
)}

{/* 候補リスト（2文字以上の場合のみ） */}
{museumSearchTerm.length >= 2 && filteredMuseums.length > 0 && (
  <ul style={{ paddingLeft: 0, listStyle: "none", marginBottom: 8 }}>
    {filteredMuseums.map((museum, index) => (
      <li
        key={`${museum.ja}-${index}`}
        onClick={() => addMuseum(museum)}
        style={{
          cursor: "pointer",
          padding: "10px 12px",
          marginBottom: 6,
          backgroundColor: "#e8e8e8",
          border: "2px solid #c0c0c0",
          boxShadow: "2px 2px #999",
          borderRadius: 2,
          fontFamily: "monospace",
          fontSize: "0.95rem",
          color: "#222",
          transition: "background-color 0.2s",
        }}
      >
        ➕ {museum.ja}
      </li>
    ))}
  </ul>
)}


        <ul style={{ listStyle: "none", padding: 0, marginTop: 16 }}>
          {[...selectedMuseums]
            .sort((a, b) => (b.favorite === true) - (a.favorite === true))
            .map((m, i) => (
              <li key={`${m.name}-${i}`} style={{ marginBottom: 8, padding: 8, border: "1px solid #ddd", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{m.name} {m.favorite && "✨"}</span>
                <div>
                  <button onClick={() => toggleFavorite(m.name, true)} style={{ marginRight: 8 }}>
                    {m.favorite ? "推し解除" : "✨推し｜"}
                  </button>
                  <button onClick={() => removeItem(m.name, true)}>❎️</button>
                </div>
              </li>
            ))}
        </ul>
          </>
        )}

<button
  onClick={handleSave}
  disabled={
    !!userNameError || !!usernameError || !!instagramError ||
    userName.trim().length === 0 || username.trim().length < 3
  }
  style={{
    marginTop: 32,
    padding: "8px 16px",
    fontWeight: 600,
    backgroundColor:
      !!userNameError || !!usernameError || !!instagramError ||
      userName.trim().length === 0 || username.trim().length < 3
        ? "#ccc"
        : "#000",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    cursor:
      !!userNameError || !!usernameError || !!instagramError ||
      userName.trim().length === 0 || username.trim().length < 3
        ? "not-allowed"
        : "pointer"
  }}
>
  保存
</button>


        {showSavedMessage && (
          <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 9999, padding: "12px 24px", backgroundColor: "#d4edda", color: "#155724", border: "1px solid #c3e6cb", borderRadius: 4, boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }}>
            ✅ 保存しました！
          </div>
        )}
      </div>
      {showWelcome && (
  <div style={{
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999
  }}>
    <div style={{
      backgroundColor: "#fff",
      padding: "24px 32px",
      borderRadius: 12,
      maxWidth: 300,
      textAlign: "center",
      boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
    }}>
      <h2 style={{ fontSize: "1.5rem", marginBottom: 16 }}>🎉 ようこそ、Arrrtrへ！</h2>
      <p style={{ fontSize: "1rem", marginBottom: 24 }}>
        読み方は「アーター」です😁早速ニックネームや好きな芸術家を登録してあなたのアートの好みを表現してみましょう。
      </p>
      <button
        onClick={() => setShowWelcome(false)}
        style={{
          padding: "10px 20px",
          backgroundColor: "#4a3f3f",
          color: "#fff",
          fontWeight: 600,
          border: "none",
          borderRadius: 6,
          cursor: "pointer"
        }}
      >
        OK、やってみる！
      </button>
    </div>
  </div>
)}

    </div>
  );
}
