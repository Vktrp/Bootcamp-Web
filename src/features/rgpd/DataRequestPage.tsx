import { useState } from 'react';
import { API_URL } from '../../lib/utils';

export default function DataRequestPage() {
    const [type, setType] = useState<'access' | 'delete'>('access');
    const [ok, setOk] = useState<string>('');
    async function submit() {
        const res = await fetch(`${API_URL}/api/rgpd/data-request`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type }) });
        setOk(res.ok ? 'Demande envoyée' : 'Erreur');
    }
    return (
        <div className="card max-w-md mx-auto space-y-3">
            <h1 className="text-xl font-semibold">Demande RGPD</h1>
            <select className="input" value={type} onChange={(e) => setType(e.target.value as any)}>
                <option value="access">Accès à mes données</option>
                <option value="delete">Suppression de mes données</option>
            </select>
            <button className="btn" onClick={submit}>Envoyer</button>
            {ok && <p>{ok}</p>}
        </div>
    );
}