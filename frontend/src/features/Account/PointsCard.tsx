import { supabase } from "../../lib/supabase";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../auth/slice";

export default function PointsCard() {
  const user = useSelector(selectUser)!;
  const [points, setPoints] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("total_cents")
        .eq("user_id", user.id);
      if (error) {
        setPoints(0);
        return;
      }
      const sum = (data ?? []).reduce(
        (s, o: any) => s + (o.total_cents || 0),
        0
      );
      setPoints(Math.round(sum / 100));
    })();
  }, [user.id]);

  return (
    <div className="card" style={{ padding: 16 }}>
      <h3 style={{ fontSize: 20, marginBottom: 8 }}>Mes points</h3>
      <p className="text-sm">1 point = 1€ dépensé</p>
      <p style={{ fontSize: 40, fontWeight: 900, marginTop: 8 }}>
        {points ?? "…"}
      </p>
    </div>
  );
}
