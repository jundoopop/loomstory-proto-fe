/** Development-only host for states a deterministic consumer gateway cannot produce on demand. */
import { StrictMode, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import FirstSightPage from '../../../src/pages/FirstSightPage';
import { StyleMatchDrawer } from '../../../src/features/first-sight/components/StyleMatchDrawer';
import { CartPreview } from '../../../src/features/first-sight/components/CartPreview';
import { recognitionStudies } from '../../../src/features/first-sight/recognition';
import { prototypeGateway } from '../../../src/features/first-sight/services/prototype';
import type { FirstSightGateway } from '../../../src/features/first-sight/services/contracts';
import type { DiscoveryResult, RecognizedItem } from '../../../src/features/first-sight/types';
import '../../../src/styles.css';
import '../../../src/pages/first-sight.css';
import '../../../src/pages/first-sight-flow.css';

export type HarnessMode = 'normal' | 'archive-empty' | 'style-empty' | 'both-empty'
  | 'no-context' | 'mixed' | 'failure' | 'pending' | 'same-design';
export type StyleChange = 'no-stock' | 'removed-sku' | 'long-copy';

interface HarnessSnapshot {
  mode: HarnessMode;
  pending: number;
  savedIds: string[];
  archiveSaveCalls: string[];
  previewCalls: number;
  dismissCalls: number;
  modal?: 'none' | 'inspire' | 'bag';
}

/** Public test-host controls exercise supplied props; no React-private fields are accessed. */
export interface FirstSightTestHost {
  setMode: (mode: HarnessMode) => void;
  snapshot: () => HarnessSnapshot;
  releasePending: () => void;
  changeStyles: (change: StyleChange) => void;
  remountPage: () => void;
  setPageMounted: (mounted: boolean) => void;
  openModal: (modal: 'none' | 'inspire' | 'bag') => void;
  setOpenerVisible: (visible: boolean) => void;
  setDrawerMounted: (mounted: boolean) => void;
  queueBagCloseOnNextOpen: () => void;
}

declare global {
  interface Window { __firstSightTestHost: FirstSightTestHost }
}

/** Clone before altering a scenario so canonical authored fixture records remain untouched. */
function applyMode(result: DiscoveryResult, mode: HarnessMode): DiscoveryResult {
  const copy = structuredClone(result);
  for (const item of copy.items) {
    if (mode === 'archive-empty' || mode === 'both-empty') item.commerce.archive = [];
    if (mode === 'style-empty' || mode === 'both-empty') item.commerce.styleMatches = [];
    if (mode === 'no-context') item.looks = [];
    if (mode === 'same-design' && item.looks[0]) item.looks[0].relationship = 'same-design';
    if (mode === 'mixed') {
      const archive = item.commerce.archive[0];
      const partner = item.commerce.styleMatches[0];
      if (partner) item.commerce.archive.push(partner);
      if (archive) item.commerce.styleMatches.push(archive);
    }
  }
  return copy;
}

function PageHost() {
  const mode = useRef<HarnessMode>('normal');
  const activeItems = useRef<RecognizedItem[]>([]);
  const pending = useRef<Array<{ resolve: (result: DiscoveryResult) => void; result: DiscoveryResult }>>([]);
  const saveCalls = useRef<string[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [version, setVersion] = useState(0);
  const [pageKey, setPageKey] = useState(0);
  const [mounted, setMounted] = useState(true);

  const gateway = useRef<FirstSightGateway>({
    async discover(photo, signal) {
      const requestMode = mode.current;
      if (requestMode === 'failure') throw new Error('Controlled provider failure');
      const result = applyMode(await prototypeGateway.discover(photo, signal), requestMode);
      activeItems.current = result.items;
      if (requestMode !== 'pending') return result;
      // Deliberately ignore later abort: the page must reject an obsolete consumer result.
      return new Promise<DiscoveryResult>(resolve => { pending.current.push({ resolve, result }); });
    },
  }).current;

  useEffect(() => {
    window.__firstSightTestHost = {
      setMode: next => { mode.current = next; },
      snapshot: () => ({ mode: mode.current, pending: pending.current.length, savedIds: [...savedIds],
        archiveSaveCalls: [...saveCalls.current], previewCalls: 0, dismissCalls: 0 }),
      releasePending: () => { for (const request of pending.current.splice(0)) request.resolve(request.result); },
      changeStyles: change => {
        const product = activeItems.current[0]?.commerce.styleMatches[0];
        if (!product) throw new Error('Analyse a study with style matches before altering a test offer');
        if (change === 'no-stock') product.variants = product.variants.map(variant => ({ ...variant, stock: 0 }));
        if (change === 'removed-sku') product.variants = [];
        if (change === 'long-copy') {
          product.title = 'A generous silhouette with a carefully considered line and beautifully layered details';
          product.commerce.matchReason = 'A longer explanation of shape, material and styling. '.repeat(12);
        }
        setVersion(value => value + 1);
      },
      remountPage: () => setPageKey(value => value + 1),
      setPageMounted: setMounted,
      openModal: () => { throw new Error('Controlled modal actions belong to the modal host'); },
      setOpenerVisible: () => { throw new Error('Opener control belongs to the modal host'); },
      setDrawerMounted: () => { throw new Error('Drawer mounting belongs to the modal host'); },
      queueBagCloseOnNextOpen: () => { throw new Error('Queued events belong to the modal host'); },
    };
  }, [savedIds, version]);

  return <>
    <p style={{ margin: 8 }}>Controlled FirstSight test host · version {version}</p>
    {mounted && <FirstSightPage key={pageKey} items={[]} savedIds={savedIds} gateway={gateway}
      onToggleSave={id => {
        saveCalls.current.push(id);
        setSavedIds(previous => previous.includes(id) ? previous.filter(value => value !== id) : [...previous, id]);
      }} />}
  </>;
}

/** Isolate controlled prop transitions that a native-modal backdrop correctly blocks in normal use. */
function ModalHost() {
  const [modal, setModal] = useState<'none' | 'inspire' | 'bag'>('none');
  const [openerVisible, setOpenerVisible] = useState(true);
  const [drawerMounted, setDrawerMounted] = useState(true);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const previewCalls = useRef(0);
  const dismissCalls = useRef(0);
  const queuedBagClose = useRef(false);
  const fallback = useRef<HTMLButtonElement>(null);
  const products = recognitionStudies[0].commerce.styleMatches;

  useLayoutEffect(() => {
    if (modal !== 'bag' || !queuedBagClose.current) return;
    queuedBagClose.current = false;
    // A close queued by an earlier opening may arrive after the new props commit but
    // before the child's passive showModal effect. Model that boundary deterministically.
    document.querySelector('.fs-cart-dialog')?.dispatchEvent(new Event('close'));
  }, [modal]);

  useEffect(() => {
    window.__firstSightTestHost = {
      setMode: () => { throw new Error('Data scenarios belong to the page host'); },
      snapshot: () => ({ mode: 'normal', pending: 0, savedIds: [...savedIds], archiveSaveCalls: [],
        previewCalls: previewCalls.current, dismissCalls: dismissCalls.current, modal }),
      releasePending: () => {},
      changeStyles: () => { throw new Error('Offer changes belong to the page host'); },
      remountPage: () => {},
      setPageMounted: () => {},
      openModal: setModal,
      setOpenerVisible,
      setDrawerMounted,
      queueBagCloseOnNextOpen: () => { queuedBagClose.current = true; },
    };
  }, [savedIds, modal]);

  return <main className="first-sight fs-continuous" style={{ minHeight: '100vh', padding: 24 }}>
    <h1>Controlled modal lifecycle</h1>
    {openerVisible && <button type="button" onClick={() => setModal('inspire')}>Open controlled Inspire</button>}
    <button ref={fallback} id="test-focus-fallback" type="button">Persistent focus destination</button>
    <button type="button" onClick={() => setModal('bag')}>Open controlled bag</button>
    {drawerMounted && <StyleMatchDrawer open={modal === 'inspire'} itemName="Chloé Paddington Bag"
      products={products} savedIds={savedIds}
      onClose={() => { dismissCalls.current += 1; setModal('none'); }}
      onToggleSave={id => setSavedIds(previous => previous.includes(id)
        ? previous.filter(value => value !== id) : [...previous, id])}
      onPreviewPartner={() => { previewCalls.current += 1; }}
      onRestoreFocus={() => fallback.current?.focus({ preventScroll: true })} />}
    <CartPreview open={modal === 'bag'} lines={[]} onChange={() => {}}
      onClose={() => setModal(current => current === 'bag' ? 'none' : current)} />
  </main>;
}

const screen = new URLSearchParams(window.location.search).get('screen');
createRoot(document.getElementById('root')!).render(
  <StrictMode><MemoryRouter>{screen === 'modals' ? <ModalHost /> : <PageHost />}</MemoryRouter></StrictMode>,
);
