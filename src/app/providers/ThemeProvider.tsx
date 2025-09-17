import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Theme = "light" | "dark" | "system";

type Ctx = {
  theme: Theme;
  isDark: boolean;
  setTheme: (t: Theme) => void;
  toggle: () => void;
};

const ThemeContext = createContext<Ctx | undefined>(undefined);

const KEY = "theme";

function systemPrefersDark() {
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(KEY) as Theme) || "system"
  );

  const isDark = useMemo(
    () => theme === "dark" || (theme === "system" && systemPrefersDark()),

    [theme]
  );

  useEffect(() => {
    const root = document.documentElement;

    root.classList.toggle("dark", isDark);

    localStorage.setItem(KEY, theme);
  }, [isDark, theme]);

  // suivis des changements système si mode "system"

  useEffect(() => {
    if (theme !== "system") return;

    const mql = window.matchMedia("(prefers-color-scheme: dark)");

    const onChange = () => {
      document.documentElement.classList.toggle("dark", mql.matches);
    };

    mql.addEventListener?.("change", onChange);

    return () => mql.removeEventListener?.("change", onChange);
  }, [theme]);

  const toggle = () => setTheme(isDark ? "light" : "dark");

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);

  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");

  return ctx;
}
