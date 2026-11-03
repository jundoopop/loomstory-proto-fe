import type { Item, Story } from '../types';

// Authored demo fixtures. Images illustrate a mood, not the listed physical garment.
export const stories: Story[] = [
  {
    id: 'less-but-better',
    title: 'The art of looking back.',
    kicker: 'The style files / 001 · Minimalism',
    image: '/assets/hero.jpg',
    summary: 'Clean lines. Quiet confidence. A wardrobe that lets the wearer do the talking.',
    body: [
      'Start with a silhouette rather than a label. A straight shoulder, a small collar, a jacket that falls just at the hip: a few simple decisions can give an everyday outfit its character.',
      'Our imagined 1990s edit takes its mood from understated city dressing and the pared-back wardrobes of screen characters. These are styling associations, not evidence that an individual garment appeared in a film or belonged to a particular person.',
      'Try one structured layer over a plain top, then let the texture do the work. Vintage dressing can be a conversation between decades rather than a complete costume from one of them.',
    ],
  },
  {
    id: 'indigo-notes',
    title: 'A life written in indigo.',
    kicker: 'The style files / 002 · Denim',
    image: '/assets/denim.jpg',
    summary: 'An everyday fabric, a hundred personal interpretations.',
    body: [
      'There is something inviting about a pair of jeans that looks lived in. A softened seam or a pale patch at the knee gives an ordinary material a particular rhythm.',
      'For this fictional edit, think of rehearsal rooms, weekend record shops, and off-duty street style. The associations are editorial prompts; they do not establish an item’s maker, age, or provenance.',
      'Balance a relaxed leg with a cleaner upper layer, or keep the whole silhouette loose. The point is to find the version that feels like you.',
    ],
  },
  {
    id: 'city-after-hours',
    title: 'The city, after hours.',
    kicker: 'The style files / 003 · Outerwear',
    image: '/assets/coat.jpg',
    summary: 'Long coats, broad shoulders, and the pleasure of making an entrance.',
    body: [
      'A coat changes the outline of an outfit before anyone sees the details beneath it. Length creates movement; a generous shoulder creates a little drama.',
      'This imagined archive draws on the visual language of city cinema and street photography: a figure crossing a station, a collar turned up, a sleeve disappearing into a pocket. No specific film appearance is claimed.',
      'Wear the volume with something simple. A useful piece should make room for your own story, not require you to live inside someone else’s.',
    ],
  },
];

export const items: Item[] = [
  { id: 'minimalist-leather', title: 'The minimalist leather jacket', price: 185, era: '1990s', category: 'Outerwear', size: 'M', image: '/assets/jacket.jpg', description: 'A clean silhouette and a quiet sense of attitude. A fictional piece from our minimalist edit.', storyId: 'less-but-better' },
  { id: 'archive-denim', title: 'The straight-leg archive jean', price: 78, era: '1990s', category: 'Denim', size: '28', image: '/assets/denim.jpg', description: 'Faded indigo and an easy straight leg. A starting point for an everyday wardrobe.', storyId: 'indigo-notes' },
  { id: 'city-coat', title: 'The city wool coat', price: 145, era: '1980s', category: 'Outerwear', size: 'M', image: '/assets/coat.jpg', description: 'An oversized city silhouette with enough room for a little drama.', storyId: 'city-after-hours' },
  { id: 'weekend-layer', title: 'The weekend leather layer', price: 120, era: '1990s', category: 'Outerwear', size: 'S', image: '/assets/jacket.jpg', description: 'A pared-back layer, imagined for long afternoons and late trains.', storyId: 'less-but-better' },
  { id: 'record-shop-denim', title: 'The record-shop jean', price: 65, era: '1980s', category: 'Denim', size: '30', image: '/assets/denim.jpg', description: 'A relaxed denim shape with an understated, off-duty mood.', storyId: 'indigo-notes' },
  { id: 'midnight-coat', title: 'The midnight overcoat', price: 165, era: '1990s', category: 'Outerwear', size: 'L', image: '/assets/coat.jpg', description: 'A long line, a generous shoulder, and an imagined evening in the city.', storyId: 'city-after-hours' },
  { id: 'studio-jacket', title: 'The studio jacket', price: 98, era: '2000s', category: 'Outerwear', size: 'M', image: '/assets/jacket.jpg', description: 'Simple enough to wear every day; distinctive enough to remember.', storyId: 'less-but-better' },
  { id: 'soft-indigo', title: 'The softened indigo jean', price: 72, era: '2000s', category: 'Denim', size: '32', image: '/assets/denim.jpg', description: 'A fictional faded-denim find from our everyday archive.', storyId: 'indigo-notes' },
  { id: 'station-coat', title: 'The station coat', price: 155, era: '1980s', category: 'Outerwear', size: 'S', image: '/assets/coat.jpg', description: 'An imagined travel companion with a generous, flowing shape.', storyId: 'city-after-hours' },
  { id: 'clean-lines', title: 'The clean-lines jacket', price: 135, era: '2000s', category: 'Outerwear', size: 'L', image: '/assets/jacket.jpg', description: 'Minimal detail brings the silhouette into focus.', storyId: 'less-but-better' },
  { id: 'sunday-denim', title: 'The Sunday straight jean', price: 58, era: '1990s', category: 'Denim', size: '26', image: '/assets/denim.jpg', description: 'An easy fit for a slower day. Part of our fictional denim collection.', storyId: 'indigo-notes' },
  { id: 'gallery-coat', title: 'The gallery coat', price: 175, era: '1990s', category: 'Outerwear', size: 'M', image: '/assets/coat.jpg', description: 'A strong outline with space for your own interpretation.', storyId: 'city-after-hours' },
];
