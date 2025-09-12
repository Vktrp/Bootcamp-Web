import { useSearchParams } from 'react-router-dom';
export default function SearchBar(){
const [params, setParams] = useSearchParams();
return (
<input
className="input"
placeholder="Nom ou marque"
value={params.get('q')||''}
onChange={(e)=>{ const n=new URLSearchParams(params); const v=e.target.value; v?n.set('q',v):n.delete('q'); setParams(n,{replace:true}); }}
/>
);
}