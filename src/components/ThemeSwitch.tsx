import { useTheme } from "../app/providers/ThemeProvider";

export default function ThemeSwitch() {
  const { pref, setPref, effective } = useTheme();
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <span style={{ fontSize: 12 }}>Thème: {effective}</span>
      <select
        className="input"
        style={{ width: 140 }}
        value={pref}
        onChange={(e) => setPref(e.target.value as any)}
      >
        <option value="system">Système</option>
        <option value="light">Clair</option>
        <option value="dark">Sombre</option>
      </select>
    </div>
  );
}
