import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, setUser } from "../auth/slice";
import { supabase } from "../../lib/supabase";
import { updateProfile } from "../auth/api";

export default function AccountPage() {
  const user = useSelector(selectUser)!; // profile côté redux
  const dispatch = useDispatch();
  const [fn, setFn] = useState(user.first_name ?? "");
  const [ln, setLn] = useState(user.last_name ?? "");
  const [addr, setAddr] = useState(user.address ?? "");
  const [loading, setLoading] = useState(false);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const p = await updateProfile({
        first_name: fn,
        last_name: ln,
        address: addr,
      });
      dispatch(
        setUser({
          ...user,
          first_name: p.first_name,
          last_name: p.last_name,
          address: p.address,
          avatarUrl: p.avatar_url,
        })
      );
    } finally {
      setLoading(false);
    }
  }

  async function onAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const ext = f.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, f, { upsert: true });
    if (error) {
      alert(error.message);
      return;
    }
    const { data: url } = supabase.storage.from("avatars").getPublicUrl(path);
    const p = await updateProfile({ avatar_url: url.publicUrl });
    dispatch(setUser({ ...user, avatarUrl: p.avatar_url }));
  }

  return (
    <div className="container-page" style={{ maxWidth: 760, marginTop: 24 }}>
      <div className="card" style={{ padding: 20 }}>
        <h2 className="title" style={{ fontSize: 32, marginBottom: 12 }}>
          Mon compte
        </h2>

        <div
          style={{
            display: "flex",
            gap: 18,
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div className="avatar" style={{ width: 64, height: 64 }}>
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" />
            ) : (
              <IconUserCircle />
            )}
          </div>
          <label className="btn-outline">
            Changer la photo
            <input
              type="file"
              accept="image/*"
              onChange={onAvatar}
              style={{ display: "none" }}
            />
          </label>
        </div>

        <form onSubmit={onSave} style={{ display: "grid", gap: 12 }}>
          <label>Prénom</label>
          <input
            className="input"
            value={fn}
            onChange={(e) => setFn(e.target.value)}
          />
          <label>Nom</label>
          <input
            className="input"
            value={ln}
            onChange={(e) => setLn(e.target.value)}
          />
          <label>Adresse</label>
          <input
            className="input"
            value={addr}
            onChange={(e) => setAddr(e.target.value)}
          />
          <label>Email</label>
          <input className="input" value={user.email} disabled />
          <button className="btn" disabled={loading}>
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </form>
      </div>
    </div>
  );
}

function IconUserCircle() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 12a4 4 0 1 0-4-4a4 4 0 0 0 4 4m0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5Zm0-12a10 10 0 1 0 0 20a10 10 0 0 0 0-20Z"
      />
    </svg>
  );
}
