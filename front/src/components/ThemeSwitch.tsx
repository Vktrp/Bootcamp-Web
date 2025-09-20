import { useTheme } from "@/app/providers/ThemeProvider";

type Props = { className?: string; title?: string };

export default function ThemeSwitch({
  className = "",
  title = "Basculer le thème",
}: Props) {
  const { isDark, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      title={title}
      aria-label={title}
      className={
        "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700/40 bg-slate-800/60 " +
        "hover:bg-slate-700/50 transition " +
        className
      }
    >
      {isDark ? (
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M6.76 4.84l-1.8-1.79L3.17 4.84l1.79 1.79 1.8-1.79zm10.48 14.32l1.79 1.79 1.79-1.79-1.79-1.79-1.79 1.79zM12 4V1h-0v3h0zm0 19v-3h0v3h0zM4 12H1v0h3v0zm19 0h-3v0h3v0zM6.76 19.16l-1.8 1.79-1.79-1.79 1.79-1.79 1.8 1.79zM19.16 6.63l1.79-1.79-1.79-1.79-1.79 1.79 1.79 1.79zM12 7a5 5 0 100 10 5 5 0 000-10z" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      )}
    </button>
  );
}
