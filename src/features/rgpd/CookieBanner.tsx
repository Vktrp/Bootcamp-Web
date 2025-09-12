import { useEffect, useState } from 'react';
export default function CookieBanner(){
const [consent, setConsent] = useState<string[]|null>(null);
useEffect(()=>{ const c = localStorage.getItem('consent'); if (c) setConsent(JSON.parse(c)); },[]);
if (consent) return null;
return (
<div role="dialog" aria-label="Consentement cookies" className="fixed bottom-4 inset-x-0 mx-auto max-w-3xl bg-white shadow-xl rounded-2xl p-4">
<p className="mb-3">Ce site utilise des cookies. Choisissez vos préférences.</p>
<div className="flex gap-2">
<button className="btn" onClick={()=>{ localStorage.setItem('consent', JSON.stringify(['necessary'])); setConsent(['necessary']); }}>Nécessaires uniquement</button>
<button className="btn" onClick={()=>{ localStorage.setItem('consent', JSON.stringify(['necessary','analytics'])); setConsent(['necessary','analytics']); }}>Accepter tout</button>
</div>
</div>
);
}