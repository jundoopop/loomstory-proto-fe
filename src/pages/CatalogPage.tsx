import { useSearchParams } from 'react-router-dom';
import { ItemCard } from '../components/ItemCard';
import type { CollectionProps } from '../types';

export default function CatalogPage({ items, savedIds, onToggleSave }: CollectionProps) {
  const [params, setParams] = useSearchParams();
  const eras = [...new Set(items.map((item) => item.era))];
  const categories = [...new Set(items.map((item) => item.category))];
  const query = params.get('q') ?? '';
  const era = eras.includes(params.get('era') ?? '') ? params.get('era')! : '';
  const category = categories.includes(params.get('category') ?? '') ? params.get('category')! : '';
  const sort = ['price-asc', 'price-desc'].includes(params.get('sort') ?? '') ? params.get('sort')! : '';
  const search = query.trim().toLocaleLowerCase();
  const matches = items.filter((item) =>
    (!era || item.era === era) && (!category || item.category === category)
    && `${item.title} ${item.description} ${item.era} ${item.category}`.toLocaleLowerCase().includes(search),
  ).sort((a, b) => sort === 'price-asc' ? a.price - b.price : sort === 'price-desc' ? b.price - a.price : 0);
  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next, { replace: true });
  };

  return (
    <>
      <div className="page-heading"><div className="eyebrow">The collection</div><h1>The Vault.</h1><p>Objects of character. Explore vintage-inspired pieces and the stories that make them worth keeping.</p></div>
      <div className="filters" role="search" aria-label="Filter the collection">
        <input aria-label="Search collection" placeholder="Search the collection" value={query} onChange={(event) => updateFilter('q', event.target.value)} />
        <select aria-label="Era" value={era} onChange={(event) => updateFilter('era', event.target.value)}><option value="">All eras</option>{eras.map((value) => <option key={value}>{value}</option>)}</select>
        <select aria-label="Category" value={category} onChange={(event) => updateFilter('category', event.target.value)}><option value="">All categories</option>{categories.map((value) => <option key={value}>{value}</option>)}</select>
        <select aria-label="Sort collection" value={sort} onChange={(event) => updateFilter('sort', event.target.value)}><option value="">Featured</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select>
        <button type="button" className="submit-link" onClick={() => setParams({})}>Reset filters</button>
      </div>
      <p className="eyebrow" aria-live="polite" style={{ margin: '20px 0' }}>{matches.length} {matches.length === 1 ? 'piece' : 'pieces'} · fictional demo inventory</p>
      {matches.length ? <div className="grid">{matches.map((item) => <ItemCard key={item.id} item={item} saved={savedIds.includes(item.id)} onToggleSave={onToggleSave} />)}</div>
        : <div className="empty"><h2>No pieces match this edit.</h2><p>Try a different detail, or start again with the full collection.</p><button type="button" className="btn light" onClick={() => setParams({})}>Explore all pieces ↗</button></div>}
      <p className="section notice">A curated sample collection. Photographs illustrate a style; they do not authenticate an individual garment. Prices are part of the demo.</p>
    </>
  );
}
