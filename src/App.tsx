/**
 * Application shell: owns routes, desktop/mobile navigation, wardrobe persistence,
 * and shared notifications. Page-specific FirstSight state lives in FirstSightPage.
 */
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { items } from './data/catalog';
import { parseSavedItems, SAVED_ITEMS_KEY, toggleSavedItem } from './domain/savedItems';
import { ItemCard } from './components/ItemCard';
import DiscoverPage from './pages/DiscoverPage';
import CatalogPage from './pages/CatalogPage';
import ItemPage from './pages/ItemPage';
import StoriesPage from './pages/StoriesPage';
import SubmitPage from './pages/SubmitPage';
import FirstSightPage from './pages/FirstSightPage';

// Wardrobe entries must refer to this catalog; update the catalog when adding live IDs.
const validIds = items.map(item => item.id);

/** Read stored favorites through the domain validator; unavailable storage starts empty. */
function readSavedItems() {
  try { return parseSavedItems(localStorage.getItem(SAVED_ITEMS_KEY), validIds); }
  catch { return []; }
}

/** Render the shared shell and pass one consistent wardrobe state into collection pages. */
export default function App() {
  const [savedIds, setSavedIds] = useState(readSavedItems);
  const [notice, setNotice] = useState('');
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const previousPath = useRef(location.pathname);

  // Keep route titles, keyboard focus, and scroll position in sync after navigation.
  useEffect(() => {
    const title = location.pathname.startsWith('/first-sight') ? 'FirstSight'
      : location.pathname.startsWith('/vault') ? 'The Vault'
      : location.pathname.startsWith('/submit') ? 'Submit a piece'
      : location.pathname.startsWith('/wardrobe') ? 'My wardrobe'
      : location.pathname.startsWith('/stories') ? 'Stories'
      : location.pathname.startsWith('/about') ? 'About the prototype' : 'Every piece has a past';
    document.title = `${title} — LoomStory`;
    if (previousPath.current !== location.pathname) {
      mainRef.current?.focus({ preventScroll: true });
      window.scrollTo(0, 0);
      previousPath.current = location.pathname;
    }
  }, [location.pathname]);

  // A new wardrobe notice replaces the previous timeout instead of clearing early.
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 4500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  // The storage event synchronizes favorites changed in another tab on this origin.
  useEffect(() => {
    /** Reload favorites when another tab changes or clears this origin's stored data. */
    const sync = (event: StorageEvent) => {
      if (event.key === SAVED_ITEMS_KEY || event.key === null) setSavedIds(readSavedItems());
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  /** Update shared favorites immediately, then persist them when browser storage permits. */
  const onToggleSave = (id: string) => {
    const next = toggleSavedItem(savedIds, id, validIds);
    setSavedIds(next);
    try {
      localStorage.setItem(SAVED_ITEMS_KEY, JSON.stringify(next));
      setNotice(next.includes(id) ? 'Saved to your wardrobe on this device.' : 'Removed from your wardrobe.');
    } catch {
      setNotice('Browser storage is unavailable. Saved pieces will last only for this visit.');
    }
  };
  // Collection pages receive these dependencies rather than owning separate wardrobe copies.
  const collectionProps = { items, savedIds, onToggleSave };

  return <>
    <a className="skip" href="#main">Skip to content</a>
    <div className="edition">THE PAST HAS GOOD TASTE.<span>A NEW CHAPTER IN VINTAGE</span><span>FRONTEND DEMO · VOL. 01</span></div>
    {/* Desktop navigation. Keep the mobile navigation below aligned when adding a route. */}
    <header>
      <Link className="logo" to="/" aria-label="LoomStory home">LoomStory<span>®</span></Link>
      <nav aria-label="Main navigation">
        <NavLink to="/" end>Discover</NavLink><NavLink to="/first-sight">FirstSight</NavLink><NavLink to="/vault">The Vault</NavLink><NavLink to="/stories">Stories</NavLink>
      </nav>
      <div className="utilities">
        <Link to="/vault" aria-label="Search the collection">⌕ <span>Search</span></Link>
        <Link to="/wardrobe">My wardrobe <span id="count">{savedIds.length}</span></Link>
        <Link className="submit-link" to="/submit">Submit a piece ↗</Link>
      </div>
    </header>
    <main id="main" ref={mainRef} tabIndex={-1}>
      {/* Route registry: FirstSight stays alongside the original comparison pages. */}
      <Routes>
        <Route path="/" element={<DiscoverPage {...collectionProps} />} />
        <Route path="/first-sight" element={<FirstSightPage {...collectionProps} />} />
        <Route path="/vault" element={<CatalogPage {...collectionProps} />} />
        <Route path="/items/:id" element={<ItemPage {...collectionProps} />} />
        <Route path="/stories" element={<StoriesPage />} />
        <Route path="/stories/:id" element={<StoriesPage />} />
        <Route path="/submit" element={<SubmitPage />} />
        {/* The small wardrobe view stays inline because its data is already owned here. */}
        <Route path="/wardrobe" element={<>
          <div className="page-heading"><div className="eyebrow">Your personal archive</div><h1>My wardrobe.</h1><p>Pieces to come back to. Saved in this browser, on this device.</p></div>
          <section className="section wardrobe-section"><div className="section-head"><h2>Saved pieces · {savedIds.length}</h2><Link to="/vault">Explore the collection ↗</Link></div>
            {savedIds.length ? <div className="grid">{items.filter(item => savedIds.includes(item.id)).map(item => <ItemCard key={item.id} item={item} saved onToggleSave={onToggleSave} />)}</div>
              : <div className="empty"><h2>A little room for something special.</h2><p>Tap a heart on any piece to start your own edit.</p><Link className="btn" to="/vault">Find your first piece <span>↗</span></Link></div>}
          </section>
          <div className="split-banner"><div><div className="eyebrow">A new chapter</div><h2>Have a piece to share?</h2><p>Try the photo-to-story journey with your own photograph or a sample.</p><Link className="btn red" to="/submit">Preview a submission ↗</Link></div><div><div className="eyebrow">Made for this moment</div><h2>Your browser. Your edit.</h2><p>No account is needed for this demo. Upload previews stay in the current flow; saved hearts remain on this device.</p></div></div>
        </>} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<div className="form-panel"><div className="page-heading"><div className="eyebrow">Page not found</div><h1>A loose thread.</h1><p>This page is not part of the collection.</p></div><Link className="btn" to="/">Back to Discover ↗</Link></div>} />
      </Routes>
    </main>
    <footer>
      <Link className="logo" to="/">LoomStory</Link><p>Good clothes. Great stories. New chapters.</p>
      <div><Link to="/wardrobe">My wardrobe</Link><Link to="/submit">Submit a piece</Link><Link to="/about">About this prototype</Link></div>
      <small>Frontend demo · Fictional inventory · Illustrative photography · No live AI, accounts, or transactions</small>
    </footer>
    {/* Fixed mobile shortcuts; responsive rules live in styles.css and first-sight.css. */}
    <nav className="mobile-nav" aria-label="Mobile navigation">
      <NavLink to="/" end><span aria-hidden="true">⌂</span><span>Discover</span></NavLink>
      <NavLink to="/first-sight"><span aria-hidden="true">✧</span><span>FirstSight</span></NavLink>
      <NavLink to="/vault"><span aria-hidden="true">◇</span><span>Explore</span></NavLink>
      <NavLink to="/submit"><span aria-hidden="true">＋</span><span>Submit</span></NavLink>
      <NavLink to="/wardrobe"><span aria-hidden="true">♡</span><span>Wardrobe</span></NavLink>
    </nav>
    <div id="toast" role="status" aria-live="polite" style={{ opacity: notice ? 1 : 0 }}>{notice}</div>
  </>;
}

/** Explain the prototype's current capabilities and future integration boundaries. */
function AboutPage() {
  return <article className="article">
    <div className="eyebrow">Behind the prototype</div><h1>A concept made tangible.</h1>
    <p>LoomStory connects vintage discovery with the stories that make a piece worth keeping. This local frontend explores the full visual journey before we connect live services.</p>
    <h2>What you can try</h2><p>Browse 12 fictional pieces, filter the collection, read three editorial stories, save your favourites on this device, and preview a submission using a local photograph.</p>
    <h2>A preview of the next chapter</h2><p>The sample AI result is written in advance. Photographs are never uploaded; no model identifies them. There is no real login, database, sale, or publication in this version.</p>
    <h2>Built to stay simple</h2><p>React and Vite power this frontend. Supabase database, authentication, and image storage are planned. A serverless function will eventually protect AI credentials. Netlify configuration is ready for a future static deployment.</p>
    <p className="notice">Photography comes from the supplied LoomStory concept export and illustrates a mood. It does not verify a garment’s identity, age, history, or ownership.</p>
    <Link className="btn" to="/">Start exploring ↗</Link>
  </article>;
}
