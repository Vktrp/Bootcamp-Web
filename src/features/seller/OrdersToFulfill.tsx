import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_URL, formatPrice } from '../../lib/utils';

async function listPending(){
const r = await fetch(`${API_URL}/api/orders?status=pending`);
if(!r.ok) throw new Error('Fail');
return await r.json();
}
async function fulfill(id:string){
const r = await fetch(`${API_URL}/api/orders/${id}/status`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ status: 'FULFILLED' }) });
if(!r.ok) throw new Error('Fail');
}

export default function OrdersToFulfill(){
const qc = useQueryClient();
const { data, isLoading } = useQuery({ queryKey:['seller-pending'], queryFn:listPending });
const m = useMutation({ mutationFn: fulfill, onSuccess: ()=>qc.invalidateQueries({queryKey:['seller-pending']}) });
if (isLoading) return <p>Chargement…</p>;
return (
<div className="space-y-2">
<h2 className="text-lg font-semibold">Commandes à préparer</h2>
{data?.map((o:any)=>(
<div key={o.id} className="card flex justify-between items-center">
<div>
<div>#{o.id}</div>
<div className="text-sm text-gray-600">Articles: {o.items?.length||0}</div>
</div>
<div className="flex items-center gap-3">
<span>{formatPrice(o.amountCents)}</span>
<button className="btn" onClick={()=>m.mutate(o.id)}>Marquer "fulfilled"</button>
</div>
</div>
))}
</div>
);
}