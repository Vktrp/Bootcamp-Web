import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type ThemePref = "light" | "dark" | "system";
type ThemeCtx = {
  pref: ThemePref;
  setPref: (t: ThemePref) => void;
  effective: "light" | "dark";
};

const ThemeContext = createContext<ThemeCtx | null>(null);

function getSystemDark() {
  return (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}
function applyThemeClass(effective: "light" | "dark") {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(effective);
}

/**
 * - Stocke la préférence ("light" | "dark" | "system") dans localStorage
 * - Calcule le thème effectif (si "system" => suit l’OS et réagit aux changements)
 * - Applique la classe "light" ou "dark" sur <html> pour stylage global
 */
export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [pref, setPref] = useState<ThemePref>(
    () => (localStorage.getItem("theme:pref") as ThemePref) || "system"
  );
  const [systemDark, setSystemDark] = useState<boolean>(() => getSystemDark());

  // Observe les changements système quand pref === "system"
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    function onChange(e: MediaQueryListEvent) {
      setSystemDark(e.matches);
    }
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  // Persistance
  useEffect(() => {
    localStorage.setItem("theme:pref", pref);
  }, [pref]);

  const effective: "light" | "dark" = useMemo(() => {
    if (pref === "light") return "light";
    if (pref === "dark") return "dark";
    return systemDark ? "dark" : "light";
  }, [pref, systemDark]);

  // Application classe <html>
  useEffect(() => {
    applyThemeClass(effective);
  }, [effective]);

  const value = useMemo<ThemeCtx>(
    () => ({ pref, setPref, effective }),
    [pref, effective]
  );
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
