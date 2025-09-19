import { PropsWithChildren, useEffect } from "react";
import { useDispatch } from "react-redux";
import { supabase } from "../../lib/supabase";
import { getCurrentProfile } from "../../features/auth/api"; // ⬅️ change ici
import { setUser } from "../../features/auth/slice";

export default function AuthProvider({ children }: PropsWithChildren) {
  const dispatch = useDispatch();

  useEffect(() => {
    let disposed = false;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        try {
          const u = await getCurrentProfile(); // ⬅️ change ici
          if (!disposed && u) dispatch(setUser(u));
        } catch {}
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        try {
          const u = await getCurrentProfile(); // ⬅️ change ici
          if (!disposed && u) dispatch(setUser(u));
        } catch {}
      }
      if (event === "SIGNED_OUT") {
        if (!disposed) dispatch(setUser(null as any));
      }
    });

    return () => {
      disposed = true;
      sub?.subscription?.unsubscribe();
    };
  }, [dispatch]);

  return <>{children}</>;
}
