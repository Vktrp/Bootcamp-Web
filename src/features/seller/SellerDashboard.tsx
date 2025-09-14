import OrdersToFulfill from "./OrdersToFulfill";
export default function SellerDashboard() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Espace vendeur</h1>
      <OrdersToFulfill />
    </div>
  );
}
