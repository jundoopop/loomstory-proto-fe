"use client";
import { useState, useEffect, useRef, FormEvent, ReactNode } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Search,
  User,
  Plus,
  X,
  Menu,
  Check,
  ChevronLeft,
  ChevronDown,
  Upload,
  Camera,
  BookOpen,
  ShieldCheck,
  Info,
  Loader2,
  ExternalLink,
  LogOut,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Heart,
} from "lucide-react";
import { stories, collections, euro } from "../lib/catalogue";
const api = async (path: string, options: any = {}) => {
  const r = await fetch("/api" + path, {
    ...options,
    headers: {
      ...(options.body && typeof options.body === "string"
        ? { "Content-Type": "application/json" }
        : {}),
      ...options.headers,
    },
  });
  const d: any = await r.json();
  if (!r.ok) throw new Error(d.error || "Please try again.");
  return d;
};
const post = (path: string, body: any = {}) =>
  api(path, { method: "POST", body: JSON.stringify(body) });
const track = (action: string, target: string) =>
  post("/events", { action, target }).catch(() => {});
const navigate = (path: string) => {
  window.location.hash = path;
  window.scrollTo({ top: 0, behavior: "instant" });
};
const label = (s: string) => s?.replaceAll("_", " ");
const categories = [
  "Jackets",
  "Coats",
  "Denim",
  "Tailoring",
  "Knitwear",
  "Dresses",
];
function Garment({
  index = 0,
  title = "",
  className = "",
  src,
}: {
  index?: number | null;
  title?: string;
  className?: string;
  src?: string;
}) {
  return src ? (
    <img
      className={"garment " + className}
      src={src}
      alt={title}
      loading="lazy"
    />
  ) : (
    <div
      role="img"
      aria-label={title || "AI-generated fictional sample garment"}
      className={"garment " + className}
      style={{
        backgroundPosition: `${((index || 0) % 3) * 50}% ${Math.floor((index || 0) / 3) * 100}%`,
      }}
    />
  );
}
function Loading() {
  return (
    <div className="loading">
      <Loader2 className="spin" size={23} />
      <span>Opening the archive…</span>
    </div>
  );
}
function Notice({
  children,
  tone = "info",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return (
    <div
      className={"notice " + tone}
      role={tone === "error" ? "alert" : "status"}
    >
      {tone === "error" ? <AlertCircle size={18} /> : <Info size={18} />}
      <div>{children}</div>
    </div>
  );
}
function Empty({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="empty">
      <Search size={28} />
      <h3>{title}</h3>
      {children}
    </div>
  );
}
function Modal({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement;
    const dialog = ref.current;
    const focusables = () =>
      dialog?.querySelectorAll<HTMLElement>(
        "button,input,select,textarea,a[href]",
      );
    focusables()?.[0]?.focus();
    const f = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const els = focusables();
        if (!els?.length) return;
        const first = els[0],
          last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", f);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", f);
      document.body.style.overflow = overflow;
      prev?.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        className="modal"
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button
          className="icon close"
          aria-label="Close dialog"
          onClick={close}
        >
          <X />
        </button>
        <p className="eyebrow">VINTEDGE / YOUR ACCOUNT</p>
        <h2 id="modal-title">{title}</h2>
        {children}
      </div>
    </div>
  );
}
function AuthModal({
  close,
  onUser,
}: {
  close: () => void;
  onUser: (u: any) => void;
}) {
  const [register, setRegister] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const b = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const d = await post("/auth/" + (register ? "register" : "login"), b);
      onUser(d.user);
      close();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title={register ? "Your next chapter." : "Welcome to the archive."}
      close={close}
    >
      <p className="muted">
        {register
          ? "Create a demo member account to submit a piece and register interest. Use a fictional name."
          : "Sign in to follow a submission, register interest, or continue your editorial work."}
      </p>
      <form onSubmit={submit} className="form-stack">
        {register && (
          <label>
            Display name
            <input
              name="name"
              required
              placeholder="Your demo name"
              autoComplete="nickname"
            />
          </label>
        )}
        <label>
          Email
          <input
            name="email"
            type="email"
            autoComplete="username"
            required
            placeholder="you@example.com"
          />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            required
            minLength={12}
            maxLength={128}
            autoComplete={register ? "new-password" : "current-password"}
            placeholder="At least 12 characters"
          />
        </label>
        {error && <Notice tone="error">{error}</Notice>}
        <button className="button primary full" disabled={busy}>
          {busy ? <Loader2 className="spin" size={18} /> : null}
          {register ? "Create member account" : "Sign in"}
          <ArrowRight size={18} />
        </button>
      </form>
      <button
        className="text-button auth-switch"
        onClick={() => {
          setRegister(!register);
          setError("");
        }}
      >
        {register
          ? "Already a member? Sign in"
          : "New here? Create a demo account"}
      </button>
      <p className="micro">
        Closed prototype · no email verification or real commerce. Staff
        permissions are assigned through trusted setup.
      </p>
    </Modal>
  );
}
function ItemCard({ item }: { item: any }) {
  return (
    <a className="item-card" href={"#/item/" + item.id}>
      <div className="item-image">
        <Garment
          index={item.image}
          src={
            item.publicMedia?.length
              ? "/api/public-media/" + item.publicMedia[0]
              : undefined
          }
          title={item.title + (item.fictional ? " · fictional sample" : "")}
        />
        <span className="image-tag">
          {item.era === "Unknown" ? "ERA UNKNOWN" : item.era + " EDIT"}
        </span>
        <span className="image-arrow">
          <ArrowUpRight size={20} />
        </span>
      </div>
      <div className="item-meta">
        <span>
          {item.category} <i>·</i> Size {item.size}
        </span>
        <span>{item.condition}</span>
      </div>
      <div className="item-title">
        <h3>{item.title}</h3>
        <span>{euro(item.price)}</span>
      </div>
      <div className="item-caption">
        <span>
          {item.fictional ? "Fictional archive sample" : "Reviewed submission"}
        </span>
        <span>Demo listing</span>
      </div>
    </a>
  );
}
function Home() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    api("/catalog?limit=4")
      .then((d) => setItems(d.items))
      .catch(() => {});
    track("catalogue_view", "discover");
  }, []);
  return (
    <>
      <section className="hero wrap">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="little-star">✳</span> AN ARCHIVE WORTH EXPLORING
          </p>
          <h1>
            Good clothes.
            <br />
            <em>Better stories.</em>
          </h1>
          <p className="hero-description">
            Pieces with a past. A perspective for the present.
            <br className="desktop" /> Discover vintage through the stories,
            details,
            <br className="desktop" /> and cultural moments that give it
            meaning.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#/vault">
              Explore the Vault
              <ArrowUpRight size={18} />
            </a>
            <a className="subtle-link" href="#/inspire">
              Find your inspiration <ArrowRight size={17} />
            </a>
          </div>
          <div className="hero-footnote">
            <span className="tiny-line" /> Thoughtfully selected. Openly
            documented.
          </div>
        </div>
        <div className="hero-visual">
          <span className="vertical-note">VINTEDGE / OBJECT STUDY NO. 001</span>
          <div className="hero-paper">
            <div className="paper-header">
              <span>THE ARCHIVE EDIT</span>
              <span>01 / 06</span>
            </div>
            <Garment
              index={0}
              title="AI-generated fictional brown leather blouson"
            />
            <div className="paper-footer">
              <span>Leather, with a little history.</span>
              <span>↗</span>
            </div>
          </div>
          <div className="hero-stamp">
            A past life.
            <br />
            <em>A new point of view.</em>
          </div>
          <span className="hero-image-note">
            Fictional garment · generated sample imagery
          </span>
        </div>
      </section>
      <div className="principles wrap">
        <div>
          <BookOpen size={18} />
          <span>Context you can explore</span>
        </div>
        <div>
          <ShieldCheck size={18} />
          <span>Evidence you can inspect</span>
        </div>
        <div>
          <Heart size={18} />
          <span>Finds worth a second look</span>
        </div>
        <span className="prototype-label">
          A working prototype. All listings are demos.
        </span>
      </div>
      <section className="section wrap">
        <div className="section-heading">
          <div>
            <p className="eyebrow">PICK A POINT OF VIEW</p>
            <h2>Follow a collection.</h2>
          </div>
          <a className="subtle-link" href="#/vault">
            Explore all pieces
            <ArrowUpRight size={18} />
          </a>
        </div>
        <div className="collections">
          {collections.map((c, i) => (
            <a
              key={c.name}
              href={"#/vault?collection=" + encodeURIComponent(c.name)}
              className={"collection collection-" + i}
            >
              <div className="collection-text">
                <span className="eyebrow">EDIT 0{i + 1}</span>
                <h3>{c.name}</h3>
                <p>{c.subtitle}</p>
                <span className="collection-link">
                  Explore the edit <ArrowRight size={17} />
                </span>
              </div>
              <Garment
                index={c.image}
                title={c.name + " · fictional styling collection"}
              />
            </a>
          ))}
        </div>
      </section>
      <section className="section wrap">
        <div className="section-heading">
          <div>
            <p className="eyebrow">RECENTLY ADDED TO THE VAULT</p>
            <h2>A few good finds.</h2>
          </div>
          <a href="#/vault" className="subtle-link">
            View the archive
            <ArrowUpRight size={18} />
          </a>
        </div>
        <div className="product-grid">
          {items.map((x) => (
            <ItemCard key={x.id} item={x} />
          ))}
        </div>
      </section>
      <section className="story-banner wrap">
        <div className="story-banner-image">
          <Garment index={2} title="Fictional straight-leg denim sample" />
          <span className="image-tag">FIELD NOTES / 003</span>
        </div>
        <div className="story-banner-copy">
          <p className="eyebrow">BEYOND THE LABEL</p>
          <h2>
            The fabric of
            <br />
            <em>everyday life.</em>
          </h2>
          <p>
            From workwear to a cultural constant. Explore the history behind
            denim, and what a source can—and cannot—tell us about an individual
            piece.
          </p>
          <a className="button outline" href="#/story/denim">
            Read the story
            <ArrowUpRight size={18} />
          </a>
        </div>
      </section>
      <section className="submit-banner wrap">
        <div>
          <p className="eyebrow">THERE’S A STORY IN YOUR WARDROBE</p>
          <h2>Let’s take a closer look.</h2>
          <p>
            Share a piece. Explore possible matches. Help us build a better
            archive.
          </p>
        </div>
        <a className="button primary" href="#/submit">
          Submit a piece
          <Plus size={18} />
        </a>
      </section>
    </>
  );
}
function Vault({ query }: { query: string }) {
  const params = new URLSearchParams(query);
  const [q, setQ] = useState(params.get("q") || ""),
    [category, setCategory] = useState(params.get("category") || ""),
    [era, setEra] = useState(""),
    [price, setPrice] = useState(""),
    [collection, setCollection] = useState(params.get("collection") || ""),
    [items, setItems] = useState<any[]>([]),
    [busy, setBusy] = useState(true),
    [error, setError] = useState(""),
    [sort, setSort] = useState("curated");
  useEffect(() => {
    setCollection(new URLSearchParams(query).get("collection") || "");
    setQ(new URLSearchParams(query).get("q") || "");
  }, [query]);
  useEffect(() => {
    const abort = new AbortController();
    const timer = setTimeout(() => {
      setBusy(true);
      const p = new URLSearchParams({
        q,
        category,
        era,
        collection,
        limit: "60",
        ...(price ? { max: price } : {}),
      });
      api("/catalog?" + p, { signal: abort.signal })
        .then((d) => {
          setItems(d.items);
          setError("");
        })
        .catch((e) => {
          if (e.name !== "AbortError") setError(e.message);
        })
        .finally(() => {
          if (!abort.signal.aborted) setBusy(false);
        });
    }, 180);
    return () => {
      clearTimeout(timer);
      abort.abort();
    };
  }, [q, category, era, price, collection]);
  useEffect(() => {
    track("catalogue_view", "vault");
  }, []);
  const reset = () => {
    setQ("");
    setCategory("");
    setEra("");
    setPrice("");
    setCollection("");
  };
  const sorted = [...items].sort((a, b) =>
    sort === "low"
      ? a.price - b.price
      : sort === "high"
        ? b.price - a.price
        : 0,
  );
  return (
    <main className="wrap page">
      <div className="page-intro">
        <p className="eyebrow">THE VINTEDGE ARCHIVE</p>
        <h1>
          {collection || "The Vault"}
          <span className="title-dot">.</span>
        </h1>
        <p>
          Good pieces, considered details, and the context behind them.
          <br />
          Explore fictional samples and reviewed community submissions.
        </p>
      </div>
      <div className="collection-tabs">
        {["", "After hours", "City uniform", "Off duty"].map((c) => (
          <button
            key={c}
            className={collection === c ? "active" : ""}
            onClick={() => setCollection(c)}
          >
            {c || "All collections"}
          </button>
        ))}
      </div>
      <div className="filters">
        <label className="search-field">
          <Search size={18} />
          <input
            aria-label="Search the Vault"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search a piece, era, or story…"
          />
        </label>
        <label className="filter-select">
          <select
            aria-label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <ChevronDown size={15} />
        </label>
        <label className="filter-select">
          <select
            aria-label="Decade"
            value={era}
            onChange={(e) => setEra(e.target.value)}
          >
            <option value="">All decades</option>
            {["1960s", "1970s", "1980s", "1990s", "Unknown"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <ChevronDown size={15} />
        </label>
        <label className="filter-select">
          <select
            aria-label="Maximum price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          >
            <option value="">Any price</option>
            <option value="10000">Up to €100</option>
            <option value="15000">Up to €150</option>
            <option value="20000">Up to €200</option>
          </select>
          <ChevronDown size={15} />
        </label>
      </div>
      <div className="results-line">
        <span>
          {busy ? "Finding pieces…" : `${items.length} pieces to explore`}
          {(q || category || era || price || collection) && (
            <button className="text-button reset" onClick={reset}>
              Clear filters <X size={13} />
            </button>
          )}
        </span>
        <label>
          Sort by{" "}
          <select
            aria-label="Sort results"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="curated">Archive order</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
          </select>
        </label>
      </div>
      {error ? (
        <Notice tone="error">{error}</Notice>
      ) : busy ? (
        <Loading />
      ) : sorted.length ? (
        <div className="product-grid">
          {sorted.map((item) => (
            <ItemCard item={item} key={item.id} />
          ))}
        </div>
      ) : (
        <Empty title="Nothing in this corner of the archive.">
          <p>Try a different era, a broader search, or start again.</p>
          <button className="button outline" onClick={reset}>
            Reset filters
            <RotateCcw size={17} />
          </button>
        </Empty>
      )}
      <p className="catalogue-disclaimer">
        Sample prices and condition records are illustrative. No real inventory,
        reservation, or checkout.
      </p>
    </main>
  );
}
function Inspire({ query }: { query: string }) {
  const [alts, setAlts] = useState<any[]>([]),
    [filter, setFilter] = useState(
      new URLSearchParams(query).get("story") || "",
    ),
    [error, setError] = useState("");
  useEffect(() => {
    api("/alternatives")
      .then((d) => setAlts(d.alternatives))
      .catch((e) => setError(e.message));
  }, []);
  return (
    <main className="inspire-page">
      <div className="wrap page">
        <div className="inspire-heading">
          <div>
            <p className="eyebrow">A DIFFERENT WAY TO DISCOVER</p>
            <h1>
              Find the feeling.
              <br />
              <em>Make it yours.</em>
            </h1>
            <p>
              Start with a silhouette, a texture, a point of view.
              <br />
              Explore similar styles beyond the Vault.
            </p>
          </div>
          <div className="inspire-symbol">✳</div>
        </div>
        <div className="collection-tabs">
          {[{ id: "", eyebrow: "All looks" }, ...stories].map((s) => (
            <button
              key={s.id}
              className={filter === s.id ? "active" : ""}
              onClick={() => setFilter(s.id)}
            >
              {s.eyebrow.replace("THE ", "").toLowerCase()}
            </button>
          ))}
        </div>
        <Notice>
          These similar-style product links use illustrative sample imagery, not
          merchant photographs. Check the destination for the exact garment,
          current price, size, and availability. No affiliate links.
        </Notice>
        {error && <Notice tone="error">{error}</Notice>}
        <div className="product-grid alternative-grid">
          {alts
            .filter((a) => !filter || a.storyId === filter)
            .map((a) => (
              <div className="alternative" key={a.id}>
                <Garment
                  index={a.image}
                  title={a.title + " · illustrative generated sample"}
                />
                <span className="eyebrow">SIMILAR STYLE / EXTERNAL</span>
                <h3>{a.title}</h3>
                <p>{a.merchant}</p>
                <p className="alternative-description">{a.description}</p>
                <a
                  className="subtle-link"
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("alternative_click", a.id)}
                >
                  Explore at {a.merchant}
                  <ArrowUpRight size={17} />
                </a>
                <span className="micro">
                  {new URL(a.url).hostname} · product page
                  <br />
                  Not a same-model match · no authenticity assessment
                </span>
              </div>
            ))}
        </div>
      </div>
    </main>
  );
}
function Trust({ item }: { item: any }) {
  return (
    <div className="trust-grid">
      <div>
        <ShieldCheck size={17} />
        <span>
          <b>
            {item.identity === "reviewed"
              ? "Model identification reviewed"
              : item.identity === "unresolved"
                ? "Identity unresolved"
                : "Prepared model review"}
          </b>
          <small>
            {item.fictional
              ? "Fictional sample · review demonstration"
              : "Design relationship only"}
          </small>
        </span>
      </div>
      <div>
        <BookOpen size={17} />
        <span>
          <b>
            {item.claim?.status === "approved"
              ? "Cultural association reviewed"
              : item.claim?.status === "needs_evidence"
                ? "Cultural association unresolved"
                : "Historical context sourced"}
          </b>
          <small>
            {item.claim?.type === "context_only"
              ? "No item-specific connection claimed"
              : label(item.claim?.type || "context_only")}
          </small>
        </span>
      </div>
      <div>
        <Info size={17} />
        <span>
          <b>Physical authenticity not assessed</b>
          <small>Not inspected or received</small>
        </span>
      </div>
      <div>
        <Info size={17} />
        <span>
          <b>Screen-used provenance not established</b>
          <small>Never inferred from a visual match</small>
        </span>
      </div>
    </div>
  );
}
function Item({
  id,
  user,
  signIn,
  toast,
}: {
  id: string;
  user: any;
  signIn: () => void;
  toast: (s: string) => void;
}) {
  const [item, setItem] = useState<any>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [report, setReport] = useState(false),
    [reportError, setReportError] = useState("");
  useEffect(() => {
    api("/listings/" + id)
      .then(setItem)
      .catch((e) => setError(e.message));
    track("detail_view", id);
  }, [id, user]);
  async function interest() {
    if (!user) return signIn();
    setBusy(true);
    try {
      const r = await post("/listings/" + id + "/interest");
      setItem({ ...item, interested: true });
      toast(r.message);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function sendReport(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    try {
      const d = await post("/reports", {
        listingId: id,
        reason: new FormData(e.currentTarget).get("reason"),
      });
      setReport(false);
      toast(d.message);
    } catch (e: any) {
      setReportError(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (error && !item)
    return (
      <main className="wrap page">
        <Notice tone="error">{error}</Notice>
        <a className="button outline" href="#/vault">
          Back to the Vault
        </a>
      </main>
    );
  if (!item) return <Loading />;
  const story = stories.find((s) => s.id === item.storyId);
  return (
    <main className="wrap page item-page">
      <a className="back-link" href="#/vault">
        <ChevronLeft size={15} /> Back to the Vault
      </a>
      <div className="item-detail">
        <div>
          <div className="detail-image">
            <Garment
              index={item.image}
              src={
                item.publicMedia?.length
                  ? "/api/public-media/" + item.publicMedia[0]
                  : undefined
              }
              title={item.title}
            />
            <span className="image-tag">
              {item.fictional
                ? "FICTIONAL ARCHIVE SAMPLE"
                : "REVIEWED SUBMISSION"}
            </span>
          </div>
          <p className="micro media-caption">{item.mediaRights}</p>
          {item.publicMedia?.length > 1 && (
            <div className="thumbnail-row">
              {item.publicMedia.slice(1).map((m: string) => (
                <a key={m} href={"/api/public-media/" + m} target="_blank">
                  <img
                    src={"/api/public-media/" + m}
                    alt="Additional approved garment detail"
                  />
                </a>
              ))}
            </div>
          )}
        </div>
        <div className="detail-copy">
          <p className="eyebrow">
            {item.category} / {item.era}
          </p>
          <h1>{item.title}</h1>
          <div className="detail-price">
            <span>{euro(item.price)}</span>
            <span className="badge">DEMO LISTING</span>
          </div>
          <p>{item.description}</p>
          <div className="spec-row">
            <span>
              Size <b>{item.size}</b>
            </span>
            <span>
              Condition <b>{item.condition}</b>
            </span>
            <span>
              Brand <b>{item.brand}</b>
            </span>
          </div>
          <button
            className={
              "button primary full " + (item.interested ? "registered" : "")
            }
            disabled={busy || item.interested}
            onClick={interest}
          >
            {item.interested ? (
              <>
                <CheckCircle2 size={18} /> Interest registered
              </>
            ) : (
              <>
                Register interest
                <ArrowRight size={18} />
              </>
            )}
          </button>
          <p className="micro purchase-note">
            No payment. No reservation. No purchase.
            <br />
            This is a demonstration of buyer interest.
          </p>
          {error && <Notice tone="error">{error}</Notice>}
          <Trust item={item} />
          <button
            className="text-button report-link"
            onClick={() => (user ? setReport(true) : signIn())}
          >
            Something doesn’t look right? Report a concern
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
      <div className="detail-lower">
        <section>
          <p className="eyebrow">THE OBJECT</p>
          <h2>A closer look.</h2>
          <dl className="measurements">
            <div>
              <dt>Physical item</dt>
              <dd>{item.itemId}</dd>
            </div>
            <div>
              <dt>Garment model</dt>
              <dd>{item.modelId || "Unresolved"}</dd>
            </div>
            <div>
              <dt>Year</dt>
              <dd>{item.year}</dd>
            </div>
            <div>
              <dt>Materials</dt>
              <dd>{item.materials || "Not independently assessed"}</dd>
            </div>
            {Object.entries(item.measurements || {}).map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v ? `${v} cm` : "Unknown"}</dd>
              </div>
            ))}
          </dl>
          <p className="muted">{item.conditionNotes}</p>
        </section>
        <section className="evidence-section">
          <p className="eyebrow">
            THE CONTEXT /{" "}
            {label(item.claim?.type || "unresolved").toUpperCase()}
          </p>
          <h2>{story?.title || "What the evidence says."}</h2>
          <p>
            {item.claim?.assertion ||
              "No cultural assertion has been established for this item."}
          </p>
          <p className="context-scope">
            {item.claim?.reason || "Additional evidence is needed."}
          </p>
          {item.claim?.sources?.map((s: any, i: number) => (
            <a
              className="source"
              key={i}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="source-number">0{i + 1}</span>
              <span>
                <b>{s.title}</b>
                <small>
                  {s.publisher}
                  <br />
                  {s.locator}
                  <br />
                  Accessed {s.accessed}
                </small>
              </span>
              <ArrowUpRight size={19} />
            </a>
          ))}
          <a className="subtle-link" href={"#/inspire?story=" + item.storyId}>
            Explore similar styles in Inspire
            <ArrowRight size={17} />
          </a>
        </section>
      </div>
      {report && (
        <Modal title="Help us get it right." close={() => setReport(false)}>
          <p className="muted">
            Flag an identification, cultural claim, image, or description for
            the editorial team.
          </p>
          <form className="form-stack" onSubmit={sendReport}>
            <label>
              Your concern
              <textarea
                name="reason"
                minLength={12}
                maxLength={2000}
                required
                rows={5}
                placeholder="Describe what needs another look…"
              />
            </label>
            {reportError && <Notice tone="error">{reportError}</Notice>}
            <button className="button primary" disabled={busy}>
              Send report
              <ArrowRight size={17} />
            </button>
          </form>
        </Modal>
      )}
    </main>
  );
}
function Stories({ id }: { id?: string }) {
  const s = stories.find((x) => x.id === id);
  if (!s)
    return (
      <main className="wrap page">
        <div className="page-intro">
          <p className="eyebrow">FROM THE FIELD NOTES</p>
          <h1>Clothes in context.</h1>
          <p>
            Six starting points for a deeper look. Original summaries, museum
            sources,
            <br />
            and clear limits on what each connection means.
          </p>
        </div>
        <div className="story-grid">
          {stories.map((s) => (
            <a className="story-card" href={"#/story/" + s.id} key={s.id}>
              <Garment
                index={s.image}
                title={"Fictional illustrative garment for " + s.title}
              />
              <p className="eyebrow">{s.eyebrow}</p>
              <h2>{s.title}</h2>
              <p>{s.summary}</p>
              <span className="subtle-link">
                Read the field note
                <ArrowUpRight size={16} />
              </span>
            </a>
          ))}
        </div>
      </main>
    );
  return (
    <main className="wrap page">
      <a href="#/stories" className="back-link">
        <ChevronLeft size={15} /> All field notes
      </a>
      <article className="story-detail">
        <div>
          <p className="eyebrow">{s.eyebrow} / FIELD NOTES</p>
          <h1>{s.title}</h1>
          <p className="story-deck">{s.summary}</p>
          <Garment
            index={s.image}
            title={"Generated illustration of a fictional " + s.id + " garment"}
          />
          <p className="micro">
            Fictional garment illustration, generated for this prototype. Not
            the museum object.
          </p>
        </div>
        <div className="story-body">
          <p className="eyebrow">WHAT THE SOURCE TELLS US</p>
          <p className="story-context">{s.context}</p>
          <h3>Context, with its limits.</h3>
          <p>
            This reference helps explain a style or a moment in fashion history.
            It does not establish the brand, date, authenticity, or previous
            owner of any garment in our demonstration catalogue.
          </p>
          <p>
            Our samples are fictional. A resemblance is a starting point for
            research; a same-model claim or provenance claim needs its own
            evidence and human review.
          </p>
          <a
            className="source"
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="source-number">01</span>
            <span>
              <b>{s.sourceTitle}</b>
              <small>
                {s.publisher}
                <br />
                {s.locator}
                <br />
                Accessed 3 November 2026
              </small>
            </span>
            <ArrowUpRight size={18} />
          </a>
          <a
            className="button primary"
            href={"#/vault?collection=" + encodeURIComponent(s.collection)}
          >
            Explore the collection
            <ArrowRight size={17} />
          </a>
          <a className="subtle-link" href={"#/inspire?story=" + s.id}>
            Find similar styles
            <ArrowUpRight size={17} />
          </a>
        </div>
      </article>
    </main>
  );
}
function AuthGate({
  signIn,
  kind = "member",
}: {
  signIn: () => void;
  kind?: string;
}) {
  return (
    <main className="wrap page">
      <div className="auth-gate">
        <span className="eyebrow">YOUR VINTEDGE</span>
        <h1>
          {kind === "staff"
            ? "The editorial desk."
            : "Every piece starts somewhere."}
        </h1>
        <p>
          {kind === "staff"
            ? "Sign in with an authorized reviewer or operator account."
            : "Sign in to save a private draft, submit photographs, and follow your piece through review."}
        </p>
        <button className="button primary" onClick={signIn}>
          Sign in to continue
          <ArrowRight size={18} />
        </button>
        <p className="micro">
          Drafts and original images are private to you and authorized staff.
        </p>
      </div>
    </main>
  );
}
const defaults = {
  title: "",
  brand: "",
  era: "Unknown",
  category: "Jackets",
  size: "",
  condition: "Good",
  notes: "",
  consent: false,
  missingLabel: false,
  price: 15000,
  measurements: { chest: "", length: "", shoulder: "" },
};
function Candidates({ run }: { run: any }) {
  if (!run) return null;
  return (
    <section className="candidate-section">
      <div className="small-heading">
        <h3>Identification suggestions</h3>
        <span className="badge">SAMPLE PROVIDER</span>
      </div>
      <p className="muted">{run.message}</p>
      {run.outcome === "needs_more_information" && (
        <Notice>{run.request}</Notice>
      )}
      {run.candidates?.map((c: any) => (
        <div className="candidate" key={c.modelId}>
          <Garment index={c.image} title={c.title + " sample candidate"} />
          <div>
            <span className="eyebrow">
              RANK {c.rank} / {c.label}
            </span>
            <b>{c.title}</b>
            <small>{c.modelId} · design suggestion only</small>
          </div>
        </div>
      ))}
      <div className="micro">
        <b>Observed:</b> {run.observed?.join("; ")}
        <br />
        <b>Uncertain:</b> {run.uncertain?.join("; ")}
      </div>
    </section>
  );
}
function Submission({
  id,
  user,
  signIn,
  toast,
}: {
  id?: string;
  user: any;
  signIn: () => void;
  toast: (s: string) => void;
}) {
  const [record, setRecord] = useState<any>(null),
    [form, setForm] = useState<any>(defaults),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(!!id),
    [slot, setSlot] = useState("front"),
    [publishConsent, setPublishConsent] = useState(false),
    [sample, setSample] = useState("leather"),
    draftId = useRef<string>(""),
    fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    draftId.current = crypto.randomUUID();
    if (id && user)
      api("/submissions/" + id)
        .then((r) => {
          setRecord(r);
          setForm(r.data);
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
  }, [id, user]);
  if (!user) return <AuthGate signIn={signIn} />;
  if (loading) return <Loading />;
  const editable =
    !record || ["draft", "needs_more_information"].includes(record.state);
  const update = (key: string, value: any) =>
    setForm({ ...form, [key]: value });
  async function save() {
    if (!record) {
      const r = await post("/submissions", { id: draftId.current, ...form });
      setRecord(r);
      window.history.replaceState(null, "", "#/submission/" + r.id);
      return r;
    }
    if (!editable) return record;
    const r = await api("/submissions/" + record.id, {
      method: "PATCH",
      body: JSON.stringify({ ...form, revision: record.revision }),
    });
    setRecord(r);
    return r;
  }
  async function task(fn: () => Promise<any>) {
    setBusy(true);
    setError("");
    try {
      await fn();
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function sampleLoad() {
    const selected = sample === "trench" ? 1 : sample === "denim" ? 2 : 0;
    const data = {
      ...form,
      title: [
        "The leather blouson study",
        "The city trench study",
        "The denim study",
      ][selected],
      category: ["Jackets", "Coats", "Denim"][selected],
      era: ["1980s", "1990s", "1990s"][selected],
      size: "M",
      consent: true,
      missingLabel: true,
    };
    let r;
    if (!record)
      r = await post("/submissions", { id: draftId.current, ...data });
    else
      r = await api("/submissions/" + record.id, {
        method: "PATCH",
        body: JSON.stringify({ ...data, revision: record.revision }),
      });
    setForm(data);
    setRecord(r);
    r = await post("/submissions/" + r.id + "/sample", {
      sample,
      revision: r.revision,
    });
    setRecord(r);
    window.history.replaceState(null, "", "#/submission/" + r.id);
    toast("Prepared sample added. Your private draft is saved.");
  }
  async function upload(file: File) {
    checkLocal(file);
    const r = await save();
    const next = await api("/submissions/" + r.id + "/uploads", {
      method: "POST",
      body: file,
      headers: {
        "Content-Type": file.type,
        "x-revision": String(r.revision),
        "x-slot": slot,
        "x-rights": form.consent ? "confirmed" : "",
        "x-publish-permission": publishConsent ? "yes" : "no",
      },
    });
    setRecord(next);
    toast("Image validated and saved privately.");
  }
  function checkLocal(file: File) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
      throw new Error("Please use JPEG, PNG or WebP. HEIC is not supported.");
    if (file.size > 8 * 1024 * 1024)
      throw new Error("Each image must be 8 MB or smaller.");
    if (!form.consent)
      throw new Error("Confirm your permission declaration before uploading.");
  }
  return (
    <main className="wrap page">
      <a className="back-link" href="#/submissions">
        <ChevronLeft size={15} /> My submissions
      </a>
      <div className="workspace-heading">
        <div>
          <p className="eyebrow">CONTRIBUTE TO THE ARCHIVE</p>
          <h1>{record ? "Your piece, in progress." : "What’s its story?"}</h1>
          <p>Start with what you know. Leave the rest open.</p>
        </div>
        {record && (
          <span className={"status " + record.state}>
            {label(record.state)}
          </span>
        )}
      </div>
      <div className="submission-layout">
        <div>
          <div className="steps">
            <span className="active">
              01 <b>The piece</b>
            </span>
            <span className={record?.media?.length ? "active" : ""}>
              02 <b>Photographs</b>
            </span>
            <span className={record && !editable ? "active" : ""}>
              03 <b>Human review</b>
            </span>
          </div>
          {error && <Notice tone="error">{error}</Notice>}
          {record?.state === "needs_more_information" && (
            <Notice>
              <b>Your reviewer needs another look.</b>
              <br />
              {record.decisions[0]?.reason}
            </Notice>
          )}
          <fieldset disabled={!editable || busy} className="form-section">
            <h2>The details you know.</h2>
            <div className="form-grid">
              <label className="span-2">
                Descriptive title
                <input
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="e.g. Brown leather jacket with ribbed cuffs"
                  maxLength={200}
                />
              </label>
              <label>
                Brand, if known
                <input
                  value={form.brand || ""}
                  onChange={(e) => update("brand", e.target.value)}
                  placeholder="Unknown is fine"
                />
              </label>
              <label>
                Era, if known
                <select
                  value={form.era}
                  onChange={(e) => update("era", e.target.value)}
                >
                  {["Unknown", "1960s", "1970s", "1980s", "1990s", "2000s"].map(
                    (x) => (
                      <option key={x}>{x}</option>
                    ),
                  )}
                </select>
              </label>
              <label>
                Category
                <select
                  value={form.category}
                  onChange={(e) => update("category", e.target.value)}
                >
                  {[...categories, "Other"].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              <label>
                Label size
                <input
                  value={form.size}
                  onChange={(e) => update("size", e.target.value)}
                  placeholder="e.g. M, 40, or unknown"
                />
              </label>
              <label>
                Condition
                <select
                  value={form.condition}
                  onChange={(e) => update("condition", e.target.value)}
                >
                  {["Unknown", "Very good", "Good", "Fair", "Needs repair"].map(
                    (x) => (
                      <option key={x}>{x}</option>
                    ),
                  )}
                </select>
              </label>
              <label>
                Illustrative price (€)
                <input
                  type="number"
                  min="0"
                  max="10000"
                  step="1"
                  value={form.price / 100}
                  onChange={(e) =>
                    update("price", Math.round(Number(e.target.value) * 100))
                  }
                />
              </label>
              <div className="span-2 measurement-inputs">
                {["chest", "length", "shoulder"].map((k) => (
                  <label key={k}>
                    {k} (cm)
                    <input
                      type="number"
                      min="1"
                      max="300"
                      value={form.measurements?.[k] || ""}
                      onChange={(e) =>
                        update("measurements", {
                          ...form.measurements,
                          [k]: e.target.value,
                        })
                      }
                      placeholder="Unknown"
                    />
                  </label>
                ))}
              </div>
              <label className="span-2">
                Anything else we should know?
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  maxLength={2000}
                  placeholder="Construction details, wear, a missing label… Please leave out personal information."
                />
              </label>
              <label className="checkbox-label span-2">
                <input
                  type="checkbox"
                  checked={form.missingLabel}
                  onChange={(e) => update("missingLabel", e.target.checked)}
                />{" "}
                The label is missing or unreadable.
              </label>
            </div>
          </fieldset>
          <fieldset className="form-section" disabled={!editable || busy}>
            <h2>A few useful angles.</h2>
            <p className="muted">
              A front photo is required. A back view and a label or detail help
              the reviewer. Up to 5 images, JPEG / PNG / WebP, 8 MB and 6
              megapixels each.
            </p>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(e) => update("consent", e.target.checked)}
              />{" "}
              I own these photographs or have permission to submit them for
              review.
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={publishConsent}
                onChange={(e) => setPublishConsent(e.target.checked)}
              />{" "}
              I also permit reviewed, metadata-stripped copies of new uploads to
              be shown publicly.
            </label>
            <div className="upload-tools">
              <label>
                Photo angle
                <select value={slot} onChange={(e) => setSlot(e.target.value)}>
                  <option value="front">Front</option>
                  <option value="back">Back</option>
                  <option value="detail">Label / detail</option>
                </select>
              </label>
              <button
                className="upload-button"
                type="button"
                disabled={
                  !editable || busy || (record?.media?.length || 0) >= 5
                }
                onClick={() => fileRef.current?.click()}
              >
                <Upload size={23} />
                <b>Add a photograph</b>
                <small>Originals stay private</small>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) task(() => upload(f));
                  e.target.value = "";
                }}
              />
            </div>
            {record?.media?.length > 0 && (
              <div className="uploaded-images">
                {record.media.map((m: any) => (
                  <div key={m.id}>
                    {m.fixture ? (
                      <Garment
                        index={
                          m.fixture === "trench"
                            ? 1
                            : m.fixture === "denim"
                              ? 2
                              : 0
                        }
                        title={"Prepared " + m.fixture + " sample"}
                      />
                    ) : (
                      <img
                        src={"/api/media/" + m.id}
                        alt={m.slot + " photograph"}
                      />
                    )}
                    <span>
                      {m.fixture ? "Prepared sample" : m.slot}{" "}
                      <Check size={13} />
                    </span>
                  </div>
                ))}
              </div>
            )}
          </fieldset>
          {editable && (
            <div className="form-actions">
              <button
                className="button outline"
                disabled={busy}
                onClick={() =>
                  task(async () => {
                    await save();
                    toast("Private draft saved.");
                  })
                }
              >
                Save draft
              </button>
              <button
                className="button primary"
                disabled={busy}
                onClick={() =>
                  task(async () => {
                    const r = await save();
                    const next = await post(
                      "/submissions/" + r.id + "/submit",
                      { revision: r.revision },
                    );
                    setRecord(next);
                    toast("Submitted for human review.");
                    navigate("/submission/" + r.id);
                  })
                }
              >
                {busy ? <Loader2 className="spin" size={17} /> : null}Submit for
                review
                <ArrowRight size={17} />
              </button>
            </div>
          )}
          {record?.recognition && <Candidates run={record.recognition} />}
          <div className="form-actions">
            {record && !editable && record.state !== "accepted" && (
              <button
                className="button outline"
                disabled={busy}
                onClick={() =>
                  task(async () => {
                    await post("/submissions/" + record.id + "/identify");
                    setRecord(await api("/submissions/" + record.id));
                  })
                }
              >
                <RotateCcw size={17} /> Retry sample identification
              </button>
            )}
            {record?.listing?.state === "published" && (
              <a
                href={"#/item/" + record.listing.id}
                className="button primary"
              >
                View published page
                <ArrowUpRight size={17} />
              </a>
            )}
          </div>
          {record?.decisions?.length > 0 && (
            <section className="audit-list">
              <h3>Review history</h3>
              {record.decisions.map((d: any) => (
                <div key={d.id}>
                  <span className="badge">{label(d.decision)}</span>
                  <p>{d.reason}</p>
                  <small>
                    {d.reviewer} · {new Date(d.created).toLocaleString()} ·
                    revision {d.revision}
                  </small>
                </div>
              ))}
            </section>
          )}
        </div>
        <aside className="submission-aside">
          <p className="eyebrow">START WITH A SAMPLE</p>
          <h3>Take the journey for a spin.</h3>
          <p>
            Try a named, fictional garment with a prepared identification
            result.
          </p>
          <label>
            Prepared scenario
            <select
              value={sample}
              onChange={(e) => setSample(e.target.value)}
              disabled={!!record?.media?.length || busy}
            >
              <option value="leather">Leather blouson · candidates</option>
              <option value="trench">City trench · candidates</option>
              <option value="denim">Straight-leg denim · candidates</option>
              <option value="label">Missing label · more information</option>
              <option value="unknown">Unfamiliar piece · no match</option>
              <option value="failure">Provider failure · retry recovers</option>
            </select>
          </label>
          <button
            className="button outline full"
            disabled={busy || !editable || !!record?.media?.length}
            onClick={() => task(sampleLoad)}
          >
            Use prepared sample
            <ArrowRight size={16} />
          </button>
          <div className="aside-rule" />
          <ShieldCheck size={25} />
          <h3>A review, with boundaries.</h3>
          <p>
            Suggestions help a person investigate. They do not authenticate a
            physical garment or establish screen-used provenance.
          </p>
          <p>
            Arbitrary uploads go to manual review. There is no live recognition
            model connected.
          </p>
          <p className="micro">
            Your draft and reviewer requests persist across refreshes. Public
            pages appear only after explicit staff publication.
          </p>
        </aside>
      </div>
    </main>
  );
}
function MySubmissions({ user, signIn }: { user: any; signIn: () => void }) {
  const [records, setRecords] = useState<any[]>([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    if (user)
      api("/submissions")
        .then((d) => setRecords(d.submissions))
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
  }, [user]);
  if (!user) return <AuthGate signIn={signIn} />;
  return (
    <main className="wrap page">
      <div className="workspace-heading">
        <div>
          <p className="eyebrow">YOUR PRIVATE ARCHIVE</p>
          <h1>My submissions.</h1>
          <p>Every draft, request, and next chapter in one place.</p>
        </div>
        <a href="#/submit" className="button primary">
          Submit a piece
          <Plus size={17} />
        </a>
      </div>
      {error && <Notice tone="error">{error}</Notice>}
      {loading ? (
        <Loading />
      ) : records.length ? (
        <div className="submission-list">
          {records.map((r) => (
            <a
              href={"#/submission/" + r.id}
              className="submission-row"
              key={r.id}
            >
              {r.media[0]?.fixture ? (
                <Garment
                  index={
                    r.media[0].fixture === "trench"
                      ? 1
                      : r.media[0].fixture === "denim"
                        ? 2
                        : 0
                  }
                  title={r.data.title}
                />
              ) : r.media[0] ? (
                <img src={"/api/media/" + r.media[0].id} alt={r.data.title} />
              ) : (
                <div className="image-placeholder">
                  <Camera size={25} />
                </div>
              )}
              <div>
                <h3>{r.data.title}</h3>
                <p>
                  {r.data.category} · {r.data.era} · Revision {r.revision}
                </p>
                <small>Saved {new Date(r.updated).toLocaleDateString()}</small>
              </div>
              <span className={"status " + r.state}>{label(r.state)}</span>
              <ArrowUpRight size={20} />
            </a>
          ))}
        </div>
      ) : (
        <Empty title="The archive starts with your first piece.">
          <p>Create a private draft or try one of our prepared samples.</p>
          <a href="#/submit" className="button primary">
            Start a submission
            <Plus size={17} />
          </a>
        </Empty>
      )}
    </main>
  );
}
function Review({
  id,
  user,
  signIn,
  toast,
}: {
  id?: string;
  user: any;
  signIn: () => void;
  toast: (s: string) => void;
}) {
  const [data, setData] = useState<any>(null),
    [form, setForm] = useState<any>({
      decision: "accepted",
      modelId: "",
      title: "",
      era: "Unknown",
      price: 15000,
      claimType: "unresolved",
      assertion: "",
      sourceUrl: "",
      sourceTitle: "",
      publisher: "",
      locator: "",
      reason: "",
      publicRationale: "",
    }),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [reportReason, setReportReason] = useState<Record<string, string>>({});
  const authorized = user && ["operator", "reviewer"].includes(user.role);
  const load = () =>
    api("/review" + (id ? "/" + id : "")).then((r) => {
      setData(r);
      if (id)
        setForm((f: any) => ({
          ...f,
          title: r.data.title,
          era: r.data.era,
          price: r.data.price,
          modelId: r.data.modelId || "",
          claimType: r.data.claim?.type || "unresolved",
          assertion: r.data.claim?.assertion || "",
          publicRationale: r.data.claim?.reason || "",
        }));
    });
  useEffect(() => {
    if (authorized) load().catch((e) => setError(e.message));
  }, [id, user]);
  if (!user) return <AuthGate signIn={signIn} kind="staff" />;
  if (!authorized)
    return (
      <main className="wrap page">
        <Notice tone="error">
          This workspace requires an authorized staff account. Your member
          account cannot review or publish records.
        </Notice>
      </main>
    );
  async function task(fn: () => Promise<any>) {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const change = (k: string, v: any) => setForm({ ...form, [k]: v });
  if (!data)
    return error ? (
      <main className="wrap page">
        <Notice tone="error">{error}</Notice>
      </main>
    ) : (
      <Loading />
    );
  if (!id)
    return (
      <main className="wrap page">
        <div className="workspace-heading">
          <div>
            <p className="eyebrow">VINTEDGE / EDITORIAL WORKSPACE</p>
            <h1>The review desk.</h1>
            <p>Make a scoped decision. Keep an evidence trail.</p>
          </div>
          <span className="badge">{user.role.toUpperCase()} ACCOUNT</span>
        </div>
        <div className="metrics">
          {[
            [
              "In the queue",
              data.submissions.filter((s: any) => s.state === "under_review")
                .length,
            ],
            [
              "Awaiting evidence",
              data.submissions.filter(
                (s: any) => s.state === "needs_more_information",
              ).length,
            ],
            [
              "Ready to publish",
              data.submissions.filter(
                (s: any) =>
                  s.state === "accepted" && s.listing?.state !== "published",
              ).length,
            ],
            [
              "Open reports",
              data.reports.filter((r: any) => r.state === "open").length,
            ],
          ].map(([k, v]) => (
            <div key={k}>
              <span>{k}</span>
              <strong>{v}</strong>
            </div>
          ))}
        </div>
        {error && <Notice tone="error">{error}</Notice>}
        <div className="section-heading">
          <h2>Submissions</h2>
          <button className="text-button" onClick={() => task(load)}>
            Refresh queue
            <RotateCcw size={16} />
          </button>
        </div>
        {data.submissions.length ? (
          <div className="submission-list">
            {data.submissions.map((r: any) => (
              <a
                className="submission-row"
                href={"#/review/" + r.id}
                key={r.id}
              >
                {r.media[0]?.fixture ? (
                  <Garment
                    index={
                      r.media[0].fixture === "trench"
                        ? 1
                        : r.media[0].fixture === "denim"
                          ? 2
                          : 0
                    }
                    title={r.data.title}
                  />
                ) : r.media[0] ? (
                  <img
                    src={"/api/media/" + r.media[0].id}
                    alt="Private submission photograph"
                  />
                ) : (
                  <div className="image-placeholder">
                    <Camera />
                  </div>
                )}
                <div>
                  <h3>{r.data.title}</h3>
                  <p>
                    {r.data.category} · Revision {r.revision}
                  </p>
                  <small>
                    {r.recognition?.outcome
                      ? `Recognition: ${label(r.recognition.outcome)} · sample mode`
                      : "Manual review"}
                  </small>
                </div>
                <span className={"status " + r.state}>{label(r.state)}</span>
                <ArrowRight size={18} />
              </a>
            ))}
          </div>
        ) : (
          <Empty title="The queue is clear.">
            <p>Member submissions will appear here after they are submitted.</p>
          </Empty>
        )}
        <section className="report-section">
          <p className="eyebrow">CORRECTIONS & CONCERNS</p>
          <h2>Reports</h2>
          {data.reports.length ? (
            data.reports.map((r: any) => (
              <div className="report-card" key={r.id}>
                <div className="small-heading">
                  <a className="subtle-link" href={"#/item/" + r.listing_id}>
                    {r.listing_id}
                    <ArrowUpRight size={15} />
                  </a>
                  <span className="badge">{label(r.state)}</span>
                </div>
                <p>{r.reason}</p>
                <small>{new Date(r.created).toLocaleString()}</small>
                {r.state === "open" && user.role === "operator" && (
                  <div className="withdraw-form">
                    <label>
                      Withdrawal reason
                      <input
                        value={reportReason[r.id] || ""}
                        onChange={(e) =>
                          setReportReason({
                            ...reportReason,
                            [r.id]: e.target.value,
                          })
                        }
                        placeholder="Explain the correction needed…"
                      />
                    </label>
                    <button
                      className="button danger"
                      disabled={busy}
                      onClick={() =>
                        task(async () => {
                          await post(
                            "/listings/" + r.listing_id + "/withdraw",
                            { reason: reportReason[r.id] },
                          );
                          toast(
                            "Page withdrawn. A replacement needs a fresh review.",
                          );
                          await load();
                        })
                      }
                    >
                      Withdraw page
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="muted">No reports have been submitted.</p>
          )}
        </section>
        <details className="analytics">
          <summary>Prototype activity · demo traffic only</summary>
          <div className="activity-grid">
            {data.events.map((e: any) => (
              <div key={e.action}>
                <span>{label(e.action)}</span>
                <b>{e.count}</b>
              </div>
            ))}
          </div>
        </details>
      </main>
    );
  const s = data,
    canReview = [
      "under_review",
      "submitted",
      "needs_more_information",
      "rejected",
    ].includes(s.state);
  function useContext() {
    const k = form.modelId ? Number(form.modelId.replace("model-", "")) : 0;
    const story = stories[k] || stories[0];
    setForm({
      ...form,
      claimType: "context_only",
      assertion: story.context,
      sourceUrl: story.url,
      sourceTitle: story.sourceTitle,
      publisher: story.publisher,
      locator: story.locator,
      publicRationale:
        "This source supports general historical context only. No same-model, physical authenticity or screen-used connection is claimed.",
    });
  }
  return (
    <main className="wrap page">
      <a className="back-link" href="#/review">
        <ChevronLeft size={15} /> Review queue
      </a>
      <div className="workspace-heading">
        <div>
          <p className="eyebrow">PRIVATE SUBMISSION / REVISION {s.revision}</p>
          <h1>{s.data.title}</h1>
        </div>
        <span className={"status " + s.state}>{label(s.state)}</span>
      </div>
      {error && <Notice tone="error">{error}</Notice>}
      <div className="review-layout">
        <div>
          <div className="review-images">
            {s.media.map((m: any) => (
              <div key={m.id}>
                {m.fixture ? (
                  <Garment
                    index={
                      m.fixture === "trench" ? 1 : m.fixture === "denim" ? 2 : 0
                    }
                    title={"Prepared " + m.fixture + " sample"}
                  />
                ) : (
                  <a href={"/api/media/" + m.id} target="_blank">
                    <img
                      src={"/api/media/" + m.id}
                      alt={"Private " + m.slot + " photograph"}
                    />
                  </a>
                )}
                <span>
                  {m.slot} ·{" "}
                  {m.fixture ? "fictional sample" : "private original"}
                </span>
              </div>
            ))}
          </div>
          <div className="review-object">
            <h3>Contributor observations</h3>
            <p>
              Brand: {s.data.brand || "Unknown"} · Era: {s.data.era} · Size:{" "}
              {s.data.size}
            </p>
            <p>{s.data.notes || "No additional notes."}</p>
            <small>
              {s.data.missingLabel
                ? "Label missing or unreadable."
                : "No missing-label declaration."}{" "}
              · Physical authenticity not assessed.
            </small>
          </div>
          <Candidates run={s.recognition} />
          <button
            className="text-button"
            disabled={busy || !canReview}
            onClick={() =>
              task(async () => {
                await post("/review/" + s.id + "/identify", {
                  revision: s.revision,
                });
                await load();
              })
            }
          >
            <RotateCcw size={16} /> Retry sample recognition
          </button>
          <section className="audit-list">
            <h3>Decision history</h3>
            {s.decisions.length ? (
              s.decisions.map((d: any) => (
                <div key={d.id}>
                  <span className="badge">{label(d.decision)}</span>
                  <p>{d.reason}</p>
                  <small>
                    {d.reviewer} · {new Date(d.created).toLocaleString()} ·
                    revision {d.revision}
                  </small>
                </div>
              ))
            ) : (
              <p className="muted">No decisions yet.</p>
            )}
          </section>
        </div>
        <div className="review-editor">
          <p className="eyebrow">HUMAN REVIEW</p>
          <h2>What does the evidence support?</h2>
          <p className="muted">
            A decision applies to this revision. Identification, cultural
            context, authenticity, and provenance remain separate.
          </p>
          <fieldset disabled={busy || !canReview} className="form-stack">
            <label>
              Decision
              <select
                value={form.decision}
                onChange={(e) => change("decision", e.target.value)}
              >
                <option value="accepted">
                  Accept editorial identification / correction
                </option>
                <option value="needs_more_information">
                  Request more information
                </option>
                <option value="rejected">Reject proposed link</option>
              </select>
            </label>
            {form.decision === "accepted" && (
              <>
                <label>
                  Garment model
                  <select
                    value={form.modelId}
                    onChange={(e) => change("modelId", e.target.value)}
                  >
                    <option value="">Leave identity unresolved</option>
                    {stories.map((st, i) => (
                      <option key={st.id} value={"model-" + i}>
                        {st.eyebrow.replace("THE ", "")} · fictional model {i}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Public title
                  <input
                    value={form.title}
                    onChange={(e) => change("title", e.target.value)}
                  />
                </label>
                <div className="form-grid">
                  <label>
                    Era / approximate range
                    <input
                      value={form.era}
                      onChange={(e) => change("era", e.target.value)}
                    />
                  </label>
                  <label>
                    Demo price (€)
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={form.price / 100}
                      onChange={(e) =>
                        change(
                          "price",
                          Math.round(Number(e.target.value) * 100),
                        )
                      }
                    />
                  </label>
                </div>
                <div className="small-heading">
                  <h3>Cultural assertion</h3>
                  <button
                    type="button"
                    className="text-button"
                    onClick={useContext}
                  >
                    Use context reference
                    <Plus size={14} />
                  </button>
                </div>
                <label>
                  Association scope
                  <select
                    value={form.claimType}
                    onChange={(e) => change("claimType", e.target.value)}
                  >
                    <option value="unresolved">
                      Unresolved · no factual association
                    </option>
                    <option value="context_only">
                      General historical context only
                    </option>
                    <option value="resemblance">
                      Resemblance · not the same model
                    </option>
                    <option value="same_model">
                      Same garment design · needs specific evidence
                    </option>
                  </select>
                </label>
                {form.claimType !== "unresolved" && (
                  <>
                    <label>
                      Exact public assertion
                      <textarea
                        value={form.assertion}
                        onChange={(e) => change("assertion", e.target.value)}
                        rows={3}
                      />
                    </label>
                    <label>
                      Source title
                      <input
                        value={form.sourceTitle}
                        onChange={(e) => change("sourceTitle", e.target.value)}
                      />
                    </label>
                    <label>
                      Source URL (HTTPS)
                      <input
                        type="url"
                        value={form.sourceUrl}
                        onChange={(e) => change("sourceUrl", e.target.value)}
                        placeholder="https://…"
                      />
                    </label>
                    <label>
                      Publisher
                      <input
                        value={form.publisher}
                        onChange={(e) => change("publisher", e.target.value)}
                      />
                    </label>
                    <label>
                      Supporting passage / locator
                      <textarea
                        rows={2}
                        value={form.locator}
                        onChange={(e) => change("locator", e.target.value)}
                        placeholder="Explain which passage supports the assertion."
                      />
                    </label>
                    <label>
                      Public explanation and limits
                      <textarea
                        rows={3}
                        value={form.publicRationale}
                        onChange={(e) =>
                          change("publicRationale", e.target.value)
                        }
                      />
                    </label>
                  </>
                )}
              </>
            )}
            <label>
              {form.decision === "needs_more_information"
                ? "Request to the contributor"
                : "Decision reason (private to contributor and staff)"}
              <textarea
                rows={4}
                minLength={12}
                value={form.reason}
                onChange={(e) => change("reason", e.target.value)}
                placeholder="What did you inspect, and why does it support this decision?"
              />
            </label>
            <button
              className="button primary full"
              onClick={() =>
                task(async () => {
                  const r = await post("/review/" + id + "/decision", {
                    ...form,
                    revision: s.revision,
                    sources:
                      form.claimType === "unresolved"
                        ? []
                        : [
                            {
                              url: form.sourceUrl,
                              title: form.sourceTitle,
                              publisher: form.publisher,
                              locator: form.locator,
                            },
                          ],
                  });
                  setData(r);
                  toast(
                    "Decision recorded with reviewer, revision, and evidence.",
                  );
                })
              }
            >
              Record decision
              <Check size={17} />
            </button>
          </fieldset>
          {s.state === "accepted" && (
            <div className="publication-panel">
              <CheckCircle2 size={24} />
              <h3>Reviewed. Ready for the next step.</h3>
              <p>
                Publication creates a demo page using the approved revision and
                images permitted for public display.
              </p>
              {user.role === "operator" && (
                <button
                  className="button primary full"
                  disabled={busy || s.listing?.state === "published"}
                  onClick={() =>
                    task(async () => {
                      const r = await post("/review/" + id + "/publish", {
                        revision: s.revision,
                      });
                      toast("Demo page published.");
                      await load();
                    })
                  }
                >
                  {s.listing?.state === "published"
                    ? "Published"
                    : "Publish demo page"}
                  <ArrowUpRight size={17} />
                </button>
              )}
              {s.listing?.state === "published" && (
                <>
                  <a className="subtle-link" href={"#/item/" + s.listing.id}>
                    Open public page
                    <ArrowUpRight size={16} />
                  </a>
                  {user.role === "operator" && (
                    <div className="form-stack">
                      <label>
                        Withdrawal / correction reason
                        <textarea
                          rows={2}
                          value={reportReason[id] || ""}
                          onChange={(e) =>
                            setReportReason({
                              ...reportReason,
                              [id]: e.target.value,
                            })
                          }
                        />
                      </label>
                      <button
                        className="button danger"
                        disabled={busy}
                        onClick={() =>
                          task(async () => {
                            await post(
                              "/listings/" + s.listing.id + "/withdraw",
                              { reason: reportReason[id] },
                            );
                            await load();
                            toast(
                              "Page withdrawn; current revision returned to review.",
                            );
                          })
                        }
                      >
                        Withdraw for correction
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
export default function App() {
  const [route, setRoute] = useState("/"),
    [user, setUser] = useState<any>(null),
    [authOpen, setAuthOpen] = useState(false),
    [mobile, setMobile] = useState(false),
    [account, setAccount] = useState(false),
    [toast, setToast] = useState(""),
    [search, setSearch] = useState(false);
  useEffect(() => {
    const sync = () => {
      setRoute(window.location.hash.slice(1) || "/");
      setMobile(false);
      setAccount(false);
    };
    sync();
    window.addEventListener("hashchange", sync);
    api("/auth/me")
      .then((d) => setUser(d.user))
      .catch(() => {});
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(""), 7000);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  const [path, query = ""] = route.split("?"),
    [, view, id] = path.split("/");
  const signIn = () => setAuthOpen(true);
  const nav = [
    ["Discover", "/"],
    ["Vault", "/vault"],
    ["Inspire", "/inspire"],
    ["Stories", "/stories"],
  ];
  let content: ReactNode;
  switch (view) {
    case "vault":
      content = <Vault query={query} />;
      break;
    case "inspire":
      content = <Inspire query={query} />;
      break;
    case "item":
      content = (
        <Item key={id} id={id} user={user} signIn={signIn} toast={setToast} />
      );
      break;
    case "stories":
      content = <Stories />;
      break;
    case "story":
      content = <Stories id={id} />;
      break;
    case "submit":
    case "submission":
      content = (
        <Submission
          key={id || "new"}
          id={id}
          user={user}
          signIn={signIn}
          toast={setToast}
        />
      );
      break;
    case "submissions":
      content = <MySubmissions user={user} signIn={signIn} />;
      break;
    case "review":
      content = (
        <Review
          key={id || "queue"}
          id={id}
          user={user}
          signIn={signIn}
          toast={setToast}
        />
      );
      break;
    default:
      content = <Home />;
  }
  return (
    <>
      <a
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main-content")?.focus();
          document.getElementById("main-content")?.scrollIntoView();
        }}
        className="skip-link"
      >
        Skip to content
      </a>
      <div className="topline">
        <span>A past worth discovering. A future worth wearing.</span>
        <span>
          FRANCE / EUR € <span className="top-dot">·</span> DEMO EDITION
        </span>
      </div>
      <header className="header">
        <div className="header-inner wrap">
          <a href="#/" className="wordmark" aria-label="VintEdge home">
            Vint<span>Edge</span>
          </a>
          <nav className="desktop-nav" aria-label="Main navigation">
            {nav.map(([name, to]) => (
              <a
                key={to}
                className={
                  path === to || (name === "Stories" && view === "story")
                    ? "active"
                    : ""
                }
                href={"#" + to}
              >
                {name}
                {name === "Inspire" && <span className="nav-spark">✳</span>}
              </a>
            ))}
          </nav>
          <div className="header-actions">
            <button
              className="icon"
              aria-label="Search the archive"
              onClick={() => setSearch(true)}
            >
              <Search size={21} />
            </button>
            <div className="account-wrap">
              <button
                className="icon account-trigger"
                aria-label={user ? "Account menu" : "Sign in"}
                onClick={() => (user ? setAccount(!account) : signIn())}
              >
                {user ? (
                  <span className="avatar">{user.name[0].toUpperCase()}</span>
                ) : (
                  <User size={21} />
                )}
              </button>
              {account && user && (
                <div className="account-menu">
                  <b>{user.name}</b>
                  <span>{user.role} account</span>
                  <a href="#/submissions">My submissions</a>
                  {["operator", "reviewer"].includes(user.role) && (
                    <a href="#/review">Review workspace</a>
                  )}
                  <button
                    onClick={async () => {
                      await post("/auth/logout");
                      setUser(null);
                      setAccount(false);
                      navigate("/");
                    }}
                  >
                    Sign out
                    <LogOut size={15} />
                  </button>
                </div>
              )}
            </div>
            <a className="button header-submit" href="#/submit">
              Submit a piece
              <Plus size={15} />
            </a>
            <button
              className="icon menu-toggle"
              aria-label={mobile ? "Close navigation" : "Open navigation"}
              aria-expanded={mobile}
              onClick={() => setMobile(!mobile)}
            >
              {mobile ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {mobile && (
          <nav className="mobile-nav" aria-label="Mobile navigation">
            {nav.map(([name, to]) => (
              <a key={to} href={"#" + to}>
                {name}
                <ArrowUpRight size={18} />
              </a>
            ))}
            <a href="#/submit">
              Submit a piece
              <Plus size={17} />
            </a>
            <a href="#/submissions">
              My submissions
              <ArrowRight size={17} />
            </a>
            {user && ["operator", "reviewer"].includes(user.role) && (
              <a href="#/review">
                Review workspace
                <ArrowRight size={17} />
              </a>
            )}
          </nav>
        )}
      </header>
      <div id="main-content" tabIndex={-1}>
        {content}
      </div>
      <footer className="footer">
        <div className="wrap footer-top">
          <div>
            <a href="#/" className="wordmark">
              Vint<span>Edge</span>
            </a>
            <p>
              Good clothes. Better stories.
              <br />
              An archive with a point of view.
            </p>
          </div>
          <div>
            <span className="eyebrow">EXPLORE</span>
            <a href="#/vault">The Vault</a>
            <a href="#/inspire">Inspire</a>
            <a href="#/stories">Field notes</a>
          </div>
          <div>
            <span className="eyebrow">TAKE PART</span>
            <a href="#/submit">Submit a piece</a>
            <a href="#/submissions">My submissions</a>
            <a href="#/review">Editorial workspace</a>
          </div>
          <div className="footer-note">
            <span className="eyebrow">A NOTE ON THIS EDITION</span>
            <p>
              A working prototype with fictional sample garments, prepared
              recognition, and sourced cultural context. All offers are
              demonstrations. No money or goods change hands.
            </p>
          </div>
        </div>
        <div className="wrap footer-bottom">
          <span>© 2026 VintEdge · Prototype edition</span>
          <span>
            Made for the next chapter. <span>↗</span>
          </span>
        </div>
      </footer>
      {authOpen && (
        <AuthModal close={() => setAuthOpen(false)} onUser={setUser} />
      )}
      {search && (
        <Modal title="Find your next piece." close={() => setSearch(false)}>
          <form
            className="form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              const q = new FormData(e.currentTarget).get("q");
              setSearch(false);
              navigate("/vault?q=" + encodeURIComponent(String(q || "")));
            }}
          >
            <label>
              Search the archive
              <input name="q" placeholder="Try leather, 1990s, or denim…" />
            </label>
            <button className="button primary">
              Explore results
              <Search size={17} />
            </button>
          </form>
        </Modal>
      )}
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={20} />
          <span>{toast}</span>
          <button
            className="icon"
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={17} />
          </button>
        </div>
      )}
    </>
  );
}
