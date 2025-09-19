import { useEffect, useMemo, useState } from "react";

type Country = {
  code: "FR" | "ES" | "BE" | "DE" | "IT" | "GB" | "US";

  name: string;

  dial: string; // with +
};

const COUNTRIES: Country[] = [
  { code: "FR", name: "France", dial: "+33" },

  { code: "ES", name: "Espagne", dial: "+34" },

  { code: "BE", name: "Belgique", dial: "+32" },

  { code: "DE", name: "Allemagne", dial: "+49" },

  { code: "IT", name: "Italie", dial: "+39" },

  { code: "GB", name: "Royaume-Uni", dial: "+44" },

  { code: "US", name: "États-Unis", dial: "+1" },
];

function onlyDigits(s: string) {
  return s.replace(/\D+/g, "");
}

function stripLeadingZeros(s: string) {
  // remove all leading 0 (ex: "0759..." -> "759...")

  return s.replace(/^0+/, "");
}

function findCountryByDial(value: string | null): Country | null {
  if (!value) return null;

  // choose the country whose dial prefix matches the start of the E.164 value

  return (
    COUNTRIES.slice()

      .sort((a, b) => b.dial.length - a.dial.length)

      .find((c) => value.startsWith(c.dial)) || null
  );
}

export type PhoneInputProps = {
  /** E.164 value – ex: "+33612345678" */

  value: string;

  /** receives E.164 value – ex: "+33612345678" (or "" if empty) */

  onChange: (e164: string) => void;

  /** default country when value is empty */

  defaultCountry?: Country["code"];

  /** optional label text */

  label?: string;

  /** optional error message to display */

  error?: string | null;
};

export default function PhoneInput({
  value,

  onChange,

  defaultCountry = "FR",

  label = "Téléphone",

  error,
}: PhoneInputProps) {
  // derive initial country from incoming E.164 value if any

  const initialCountry =
    findCountryByDial(value) ??
    COUNTRIES.find((c) => c.code === defaultCountry)!;

  const [country, setCountry] = useState<Country>(initialCountry);

  const dial = country.dial;

  // local (national) number without country code, digits only

  const [local, setLocal] = useState<string>("");

  // keep local/state in sync when parent value changes (e.g. form reset)

  useEffect(() => {
    if (!value) {
      setLocal("");

      setCountry(COUNTRIES.find((c) => c.code === defaultCountry)!);

      return;
    }

    const c = findCountryByDial(value) ?? initialCountry;

    const rest = value.slice(c.dial.length);

    setCountry(c);

    setLocal(onlyDigits(rest));
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  // E.164 recompute

  const e164 = useMemo(() => {
    const clean = stripLeadingZeros(onlyDigits(local));

    return clean ? `${dial}${clean}` : "";
  }, [dial, local]);

  // propagate to parent whenever e164 changes

  useEffect(() => {
    onChange(e164);
  }, [e164]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-1">
      <label className="text-sm">{label}</label>
      <div style={{ display: "flex", gap: 8 }}>
        <select
          className="input"
          style={{ maxWidth: 160 }}
          value={country.code}
          onChange={(e) => {
            const next = COUNTRIES.find(
              (c) => c.code === (e.target.value as Country["code"])
            )!;

            setCountry(next);
          }}
          aria-label="Indicatif pays"
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name} ({c.dial})
            </option>
          ))}
        </select>
        <div style={{ display: "flex", gap: 6, flex: 1 }}>
          <span
            className="input"
            style={{
              width: 90,

              display: "inline-flex",

              alignItems: "center",

              justifyContent: "center",

              paddingInline: 12,

              whiteSpace: "nowrap",
            }}
            aria-hidden
          >
            {dial}
          </span>
          <input
            className="input"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="ex : 612345678"
            value={local}
            onChange={(e) => {
              // keep only digits while typing

              setLocal(onlyDigits(e.target.value));
            }}
            onBlur={() => {
              // remove any leading zero(s) when the user leaves the field

              setLocal((prev) => stripLeadingZeros(prev));
            }}
          />
        </div>
      </div>
      <p className="text-xs" style={{ color: "var(--muted)" }}>
        Format enregistré : <strong>{e164 || "—"}</strong> (E.164)
        <br />
        Astuce : tapez “0759…” → le 0 sera retiré automatiquement avec {dial}.
      </p>

      {error && (
        <p
          className="text-danger text-sm"
          role="alert"
          style={{ marginTop: 4 }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
