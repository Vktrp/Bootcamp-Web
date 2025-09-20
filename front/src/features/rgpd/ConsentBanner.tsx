import { useEffect, useState } from "react";

export default function ConsentBanner() {
  const [consent, setConsent] = useState<string[] | null>(null);
  useEffect(() => {
    const c = localStorage.getItem("consent");
    if (c) setConsent(JSON.parse(c));
  }, []);
  if (consent) return null;
  return (
    <div
      role="dialog"
      aria-label="Consentement cookies"
      className="cookie-banner"
    >
      <p>Ce site utilise des cookies. Choisissez vos préférences.</p>
      <div className="actions">
        <button
          className="btn-outline"
          onClick={() => {
            localStorage.setItem("consent", JSON.stringify(["necessary"]));
            setConsent(["necessary"]);
          }}
        >
          Nécessaires uniquement
        </button>
        <button
          className="btn"
          onClick={() => {
            localStorage.setItem(
              "consent",
              JSON.stringify(["necessary", "analytics"])
            );
            setConsent(["necessary", "analytics"]);
          }}
        >
          Accepter tout
        </button>
      </div>
    </div>
  );
}
