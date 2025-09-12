import { useSearchParams } from 'react-router-dom';

export default function Filters(){
const [params, setParams] = useSearchParams();
const q = params.get('q') || '';
const category = params.get('category') || '';
const size = params.get('size') || '';

function update(key: string, value: string){
const next = new URLSearchParams(params);
if (value) next.set(key, value); else next.delete(key);
setParams(next, { replace: true });
}

return (
<div className="flex flex-wrap gap-3 items-end">
<div>
<label className="text-sm">Recherche</label>
<input className="input" placeholder="Nom, marque..." value={q} onChange={(e)=>update('q', e.target.value)} />
</div>
<div>
<label className="text-sm">Catégorie</label>
<select className="input" value={category} onChange={(e)=>update('category', e.target.value)}>
<option value="">Toutes</option>
<option value="KIDS">Enfants</option>
<option value="WOMEN">Femmes</option>
<option value="MEN">Hommes</option>
</select>
</div>
<div>
<label className="text-sm">Pointure (EU)</label>
<input className="input" placeholder="ex: 42" value={size} onChange={(e)=>update('size', e.target.value)} />
</div>
</div>
);
}