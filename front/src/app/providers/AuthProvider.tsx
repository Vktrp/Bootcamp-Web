// src/app/providers/AuthProvider.tsx

 import { useEffect } from "react";

 import { useDispatch } from "react-redux";

 import { setSession, clearSession } from "../../features/auth/slice";

 import { getMe, getToken, clearToken } from "../../features/auth/api";

 export default function AuthProvider({ children }: { children: React.ReactNode }) {

  const dispatch = useDispatch();

  useEffect(() => {

    let mounted = true;

    async function bootstrap() {

      const token = getToken();

      if (!token) {

        dispatch(clearSession());

        return;

      }

      try {

        const u = await getMe();

        if (!mounted) return;

        dispatch(

          setSession({

            user: {

              id: String(u.id),

              email: u.email,

              role: (u.role ?? null) as any,

              first_name: u.first_name ?? null,

              last_name: u.last_name ?? null,

              address: u.address ?? null,

            },

            token,

          }) as any

        );

      } catch {

        clearToken();

        dispatch(clearSession());

      }

    }

    bootstrap();

    return () => {

      mounted = false;

    };

  }, [dispatch]);

  return <>{children}</>;

 }