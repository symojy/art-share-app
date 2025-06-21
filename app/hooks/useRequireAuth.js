import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../lib/firebaseConfig"; // ← ✅ 修正済み！

export function useRequireAuth() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, []);
}
