/**
 * Named campaign photographs route to their own documented collection studies.
 * Ordinary uploads, Chloé samples and Discover references retain the legacy study journey.
 */
import type { OutfitExample, OutfitLook } from '../types';
import { outfitCampaignSource } from './outfitCatalog.ts';

/** Keep membership explicit: a visible but undocumented garment never becomes a detected item. */
export const outfitExamples: OutfitExample[] = [
  {
    id: 'rose-puma-city',
    title: 'ROSÉ · the city look',
    description: 'Micro Grip bag · long-sleeve tee · mini skirt',
    photo: {
      kind: 'sample', exampleId: 'rose-puma-city',
      url: '/local-media/outfits/rose-standing.jpg',
      name: 'ROSÉ · PUMA standing campaign look',
    },
    imageAlt: 'ROSÉ in the PUMA campaign with a compact bag, slim long-sleeve top and mini skirt',
    width: 1430, height: 614,
    credit: 'PUMA Japan · campaign imagery supplied with its August 2025 press release',
    sourceUrl: outfitCampaignSource.url,
    sourceLabel: outfitCampaignSource.label,
    primaryItemId: 'puma-rose-micro-grip',
    memberIds: ['puma-rose-micro-grip', 'puma-rose-longsleeve', 'puma-rose-mini-skirt'],
    evidenceNote: 'Only models documented in the same PUMA collection release are included. This is an authored campaign-to-collection reference, not automated recognition or authentication of the photographed items.',
  },
  {
    id: 'rose-puma-track',
    title: 'ROSÉ · the track look',
    description: 'T7 trousers · mesh top · Speedcat trainers',
    photo: {
      kind: 'sample', exampleId: 'rose-puma-track',
      url: '/local-media/outfits/rose-seated.webp',
      name: 'ROSÉ · PUMA seated campaign look',
    },
    imageAlt: 'ROSÉ seated in a PUMA campaign wearing a mesh top, relaxed track trousers and trainers',
    width: 1440, height: 660,
    credit: 'PUMA · August 2025 campaign imagery',
    sourceUrl: 'https://mediahub.puma.com/articles/a-rose-for-a-rose-roses-first-puma-collection-is-a-personal-tribute',
    sourceLabel: 'PUMA · August 2025 campaign',
    primaryItemId: 'puma-rose-t7-trousers',
    memberIds: ['puma-rose-t7-trousers', 'puma-rose-mesh-top', 'puma-rose-speedcat'],
    evidenceNote: 'Real, documented collection models curated to this campaign photograph. This prepared example does not identify or authenticate an uploaded item. No bag is attributed to this look.',
  },
];

/**
 * The contextual journal can reuse each sourced campaign frame without treating it
 * as evidence of an individual SKU, authenticated object or celebrity endorsement.
 */
export const outfitExampleLooks: OutfitLook[] = outfitExamples.map(example => ({
  id: `${example.id}-reference`,
  celebrity: 'ROSÉ',
  region: 'Korea',
  title: example.id === 'rose-puma-city'
    ? 'Compact sportswear · curated campaign reference'
    : 'Relaxed trackwear · curated campaign reference',
  image: example.photo.url,
  width: example.width,
  height: example.height,
  sourceUrl: example.sourceUrl,
  sourceLabel: example.sourceLabel,
  credit: example.credit,
  tags: ['PUMA', 'ROSÉ', 'collection'],
  kind: 'Editorial',
  relationship: 'styling-inspiration',
  description: 'A curated PUMA campaign frame supplies styling context for the documented collection. This reference does not establish an exact SKU, item condition or authentication.',
}));

/** Resolve only authored IDs; callers must not infer an example from an arbitrary image URL. */
export function findOutfitExample(id: string): OutfitExample | undefined {
  return outfitExamples.find(example => example.id === id);
}
