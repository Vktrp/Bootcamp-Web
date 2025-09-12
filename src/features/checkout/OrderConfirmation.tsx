import { Link, useParams } from 'react-router-dom';
export default function OrderConfirmation(){
const { orderId } = useParams<{orderId: string}>();
return (
<div className="text-center space-y-3">
<h1 className="text-2xl font-bold">Merci pour votre commande !</h1>
<p>Commande #{orderId}</p>
<Link to="/products" className="btn">Retour boutique</Link>
</div>
);
}