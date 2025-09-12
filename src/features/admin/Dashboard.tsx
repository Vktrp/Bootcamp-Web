import { Link } from 'react-router-dom';
export default function AdminDashboard(){
return (
<div className="grid sm:grid-cols-2 gap-4">
<Link to="/admin/stock" className="card">Gérer le stock</Link>
<Link to="/admin/products/new" className="card">Créer un produit</Link>
<Link to="/admin/users" className="card">Utilisateurs</Link>
</div>
);
}