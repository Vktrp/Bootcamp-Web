import { useQuery } from '@tanstack/react-query';
import { listMyOrders } from './api';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../lib/utils';

export default function OrderListPage(){
const { data, isLoading, error } = useQuery({ queryKey:['orders'], queryFn:listMyOrders });
if (isLoading) return <p>Chargement…</p>;
if (error) return <p>Erreur</p>;
return (
<div className="space-y-2">
<h1 className="text-xl font-semibold mb-2">Mes commandes</h1>
{data?.map((o:any)=>(
<div key={o.id} className="card flex justify-between">
<div>#{o.id} — {o.status}</div>
<div className="flex gap-3 items-center">
<span>{formatPrice(o.amountCents)}</span>
<Link className="btn-outline" to={`/orders/${o.id}`}>Détail</Link>
</div>
</div>
))}
</div>
);
}