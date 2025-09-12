import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from './api';
import { setUser } from './slice';
import { useNavigate } from 'react-router-dom';

export default function LoginPage(){
const [email,setEmail]=useState('');
const [password,setPassword]=useState('');
const [err,setErr]=useState<string|undefined>();
const [loading,setLoading]=useState(false);
const dispatch = useDispatch();
const nav = useNavigate();

async function submit(){
setLoading(true); setErr(undefined);
try { const { user } = await login(email, password); dispatch(setUser(user)); nav('/'); }
catch(e:any){ setErr(e.message||'Erreur'); }
finally{ setLoading(false); }
}

return (
<div className="max-w-sm mx-auto card space-y-3">
<h1 className="text-xl font-semibold">Connexion</h1>
<input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
<input type="password" className="input" placeholder="Mot de passe" value={password} onChange={e=>setPassword(e.target.value)} />
{err && <p className="text-red-600">{err}</p>}
<button className="btn" disabled={loading} onClick={submit}>{loading?'…':'Se connecter'}</button>
</div>
);
}