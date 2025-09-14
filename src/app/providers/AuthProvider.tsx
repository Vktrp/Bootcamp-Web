import { ReactNode, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "../../features/auth/slice";
import { me } from "../../features/auth/api";

/**
 * - Au montage : tente /auth/me (cookie/session ou token côté API)
 * - Si succès : place l'utilisateur dans Redux
 * - Écoute les changements "login/logout" d'autres onglets via localStorage
 */
export default function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        const user = await me(); // GET VITE_API_URL/auth/me
        if (!ignore) dispatch(setUser(user));
      } catch {
        if (!ignore) dispatch(setUser(null));
      }
    })();

    // Synchronisation multi-onglets (si tu écris "auth:login"/"auth:logout" dans localStorage)
    function onStorage(e: StorageEvent) {
      if (e.key === "auth:event") {
        if (e.newValue === "logout") dispatch(setUser(null));
        // pour "login", on peut relancer me()
        if (e.newValue === "login")
          me()
            .then((u) => dispatch(setUser(u)))
            .catch(() => dispatch(setUser(null)));
      }
    }
    window.addEventListener("storage", onStorage);

    return () => {
      ignore = true;
      window.removeEventListener("storage", onStorage);
    };
  }, [dispatch]);

  return <>{children}</>;
}
