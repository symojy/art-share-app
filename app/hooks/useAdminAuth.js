// app/hooks/useAdminAuth.js

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../lib/firebaseConfig";

// 🔒 あなたのUIDに置き換えてください
const adminUID = "aMUbPlKBeubazJTDpgGsgZIWHCi1";

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user || user.uid !== adminUID) {
        router.push("/");
      } else {
        setIsAdmin(true);
      }
    });
    return () => unsubscribe();
  }, [router]);

  return isAdmin;
}
