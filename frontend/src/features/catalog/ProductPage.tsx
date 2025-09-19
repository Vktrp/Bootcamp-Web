import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { getProduct, type Product, type Variant } from "./api";
import { supabase } from "../../lib/supabase";
import { SIZE_RANGES } from "../../lib/sizes";
import {
  groupByCanon,
  pickGroupImage,
  type CanonGroup,
  type SimpleVariant,
} from "../../lib/colors";

function eurosFromCents(cents?: number | null) {
  if (cents == null) return "—";
  return (cents / 100).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

function BackBar() {
  const navigate = useNavigate();
  return (
    <div
      style={{
        position: "sticky",
        top: 55,
        zIndex: 40,
        margin: "8px 0 12px",
        width: "15vw",
        marginLeft: "calc(60% - 50vw)",
        paddingLeft: 12,
      }}
    >
      <button className="btn-outline" onClick={() => navigate(-1)}>
        ← Retour
      </button>
    </div>
  );
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const productId = decodeURIComponent(id ?? "");

  const {
    data: p,
    isLoading,
    isError,
  } = useQuery<Product>({
    queryKey: ["product", productId],
    queryFn: () => getProduct(productId),
    enabled: Boolean(productId),
  });

  // ===== hooks toujours AU TOP =====
  const [colorKey, setColorKey] = useState<string>("");
  const [size, setSize] = useState<string>("");
  const [fav, setFav] = useState(false);
  const [adding, setAdding] = useState(false);

  const [colorOpen, setColorOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);
  const colorRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (colorRef.current && !colorRef.current.contains(e.target as Node))
        setColorOpen(false);
      if (sizeRef.current && !sizeRef.current.contains(e.target as Node))
        setSizeOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Variantes dédoublonnées + tri
  const variants: Variant[] = useMemo(() => {
    const seen = new Set<string>();
    const arr: Variant[] = [];
    for (const v of p?.variants ?? []) {
      const k = `${(v as any).sku}|${v.size ?? ""}|${
        (v as any).colorway ?? ""
      }`;
      if (seen.has(k)) continue;
      seen.add(k);
      arr.push(v);
    }
    arr.sort((a, b) => {
      const pa = parseFloat(String(a.size ?? "").replace(",", "."));
      const pb = parseFloat(String(b.size ?? "").replace(",", "."));
      const aNum = !Number.isNaN(pa);
      const bNum = !Number.isNaN(pb);
      if (aNum && bNum) return pa - pb;
      if (aNum) return -1;
      if (bNum) return 1;
      return String(a.size ?? "").localeCompare(String(b.size ?? ""));
    });
    return arr;
  }, [p]);

  // Groupes couleur
  const colorGroupsMap = useMemo(
    () => groupByCanon(variants as unknown as SimpleVariant[]),
    [variants]
  );
  const colorOptions = useMemo(
    () =>
      [...colorGroupsMap.values()]
        .map((g) => ({
          id: g.id,
          key: g.id.toLowerCase(),
          label: g.display,
          image: pickGroupImage(g),
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [colorGroupsMap]
  );

  const selectedGroup: CanonGroup | undefined = useMemo(() => {
    if (!colorKey) return undefined;
    return colorGroupsMap.get(colorKey);
  }, [colorKey, colorGroupsMap]);

  const sizesForColor = useMemo(() => {
    const set = new Set<string>();
    for (const v of selectedGroup?.variants ?? [])
      set.add(String(v.size ?? ""));
    return set;
  }, [selectedGroup]);

  const hasAnySize = sizesForColor.size > 0;

  const exactVariant = useMemo(() => {
    if (!selectedGroup) return undefined;
    return (selectedGroup.variants as Variant[]).find(
      (v) => String(v.size ?? "") === String(size)
    );
  }, [selectedGroup, size]);

  const displayPriceCents = exactVariant?.priceCents ?? p?.priceCents ?? null;
  const imageForColor =
    pickGroupImage(selectedGroup) || (p?.image as string | undefined);

  // Inits
  useEffect(() => {
    if (!colorKey && colorOptions.length) setColorKey(colorOptions[0].key);
    if (!size) {
      const first = (SIZE_RANGES.find((s) => sizesForColor.has(String(s))) ??
        SIZE_RANGES[0] ??
        "") as string;
      if (first) setSize(String(first));
    }
    if (p) {
      const favs = new Set<string>(
        JSON.parse(localStorage.getItem("favs") || "[]")
      );
      setFav(favs.has(p.id));
    }
  }, [colorOptions, sizesForColor, p, colorKey, size]);

  useEffect(() => {
    if (!size || !selectedGroup) return;
    if (hasAnySize && !sizesForColor.has(String(size))) {
      const first =
        SIZE_RANGES.find((s) => sizesForColor.has(String(s))) ??
        Array.from(sizesForColor)[0] ??
        "";
      setSize(String(first || ""));
    }
  }, [selectedGroup, hasAnySize, sizesForColor, size]);

  async function addToCart() {
    if (!p || !exactVariant) return;
    setAdding(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from("shopping_carts")
          .upsert(
            {
              user_id: user.id,
              product_variant_id: (exactVariant as any).sku,
              quantity: 1,
            },
            { onConflict: "user_id,product_variant_id" }
          );
        if (error) throw error;
      } else {
        type LocalItem = {
          variant_id: string;
          name: string;
          size?: string;
          priceCents?: number;
          image?: string;
          qty: number;
          colorway?: string | null;
        };
        const key = "cart_local";
        const cart = JSON.parse(
          localStorage.getItem(key) || "[]"
        ) as LocalItem[];
        const idv = (exactVariant as any).sku;
        const idx = cart.findIndex(
          (i) =>
            i.variant_id === idv &&
            i.size === String((exactVariant as any).size ?? "")
        );
        if (idx >= 0) cart[idx].qty += 1;
        else
          cart.push({
            variant_id: idv,
            name: p.name,
            size: String((exactVariant as any).size ?? ""),
            priceCents: displayPriceCents ?? undefined,
            image:
              (exactVariant as any).image ?? (p.image as string | undefined),
            colorway: (exactVariant as any).colorway ?? null,
            qty: 1,
          });
        localStorage.setItem(key, JSON.stringify(cart));
      }
    } finally {
      setAdding(false);
    }
  }

  if (isLoading) {
    return (
      <div className="container-page">
        <BackBar />
        <div className="product-layout">
          <div className="skeleton" style={{ height: 420, borderRadius: 16 }} />
          <div>
            <div
              className="skeleton"
              style={{ height: 32, width: 280, borderRadius: 8 }}
            />
            <div
              className="mt-2 skeleton"
              style={{ height: 20, width: 180, borderRadius: 8 }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !p) {
    return (
      <div className="container-page">
        <BackBar />
        <p className="text-danger">Produit introuvable.</p>
        <div className="mt-3">
          <Link to="/products" className="btn-outline">
            ← Retour aux produits
          </Link>
        </div>
      </div>
    );
  }

  const selectedLabel =
    colorOptions.find((c) => c.key === colorKey)?.label || "Choisir";

  return (
    <div className="container-page">
      <BackBar />
      <div className="product-layout">
        <div className="card product-media">
          <div className="product-media-frame">
            {imageForColor ? (
              <img
                src={imageForColor}
                alt={p.name}
                className="product-media-img"
                loading="eager"
              />
            ) : (
              <div className="empty-box">Pas d’image</div>
            )}
          </div>
        </div>

        <div className="product-info">
          <div className="product-title">
            <h1 className="title-xl">{p.name}</h1>
            <div className="text-sm">{p.brand || "—"}</div>
          </div>

          <div className="price-xl mt-3">
            {eurosFromCents(displayPriceCents)}
          </div>

          {colorOptions.length > 0 && (
            <div className="mt-4">
              <label>Couleur</label>
              <div className="size-select" ref={colorRef}>
                <button
                  type="button"
                  className="size-trigger"
                  onClick={() => setColorOpen((o) => !o)}
                  aria-haspopup="listbox"
                  aria-expanded={colorOpen}
                >
                  <span>{selectedLabel}</span>
                  <span className="caret">▾</span>
                </button>
                {colorOpen && (
                  <div className="size-panel" role="listbox">
                    {colorOptions.map((opt) => {
                      const isSelected = opt.key === colorKey;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          className={
                            "size-option" + (isSelected ? " selected" : "")
                          }
                          onClick={() => {
                            setColorKey(opt.key);
                            setColorOpen(false);
                          }}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-4">
            <label>Taille (EU)</label>
            <div className="size-select" ref={sizeRef}>
              <button
                type="button"
                className="size-trigger"
                onClick={() => setSizeOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={sizeOpen}
              >
                <span>{size || "Choisir"}</span>
                <span className="caret">▾</span>
              </button>
              {sizeOpen && (
                <div className="size-panel" role="listbox">
                  {SIZE_RANGES.map((s) => {
                    const isAvailable = hasAnySize
                      ? sizesForColor.has(String(s))
                      : true;
                    const isSelected = String(size) === String(s);
                    return (
                      <button
                        key={s as any}
                        type="button"
                        className={
                          "size-option" +
                          (isSelected ? " selected" : "") +
                          (!isAvailable ? " disabled" : "")
                        }
                        disabled={!isAvailable && hasAnySize}
                        onClick={() => {
                          if (!isAvailable && hasAnySize) return;
                          setSize(String(s));
                          setSizeOpen(false);
                        }}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="actions mt-4">
            <button
              className="btn"
              onClick={addToCart}
              disabled={!exactVariant || adding}
            >
              {adding ? "Ajout..." : "Ajouter au panier"}
            </button>
            <button
              className={`btn-outline fav-btn${fav ? " active" : ""}`}
              onClick={() => {
                const key = "favs";
                const favs = new Set<string>(
                  JSON.parse(localStorage.getItem(key) || "[]")
                );
                if (!p) return;
                favs.has(p.id) ? favs.delete(p.id) : favs.add(p.id);
                localStorage.setItem(key, JSON.stringify([...favs]));
                setFav(favs.has(p.id));
              }}
            >
              {fav ? "♥ Favori" : "♡ Favori"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
