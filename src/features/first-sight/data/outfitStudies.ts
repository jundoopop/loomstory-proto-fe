/**
 * Prepared studies for real models named in PUMA's ROSÉ launch release.
 * Campaign association does not authenticate an item or perform image recognition.
 */
import { createCommerceEdit } from '../commerce.ts';
import { offersFor } from '../fixtures.ts';
import type { AnalysisCard, RecognitionStudy } from '../types';
import { outfitCampaignSource, outfitCatalogItems } from './outfitCatalog.ts';
import { outfitExamples } from './outfitExamples.ts';

interface OutfitStudyContent {
  id: string;
  modelNumber: string;
  category: string;
  summary: string;
  imageAlt: string;
  concept: string;
  feature: string;
  inspection: string;
  material: string;
  tags: string[];
}

/** Keep four concise notes without inventing manufacturing processes or fibre percentages. */
function analysisCards(content: OutfitStudyContent): AnalysisCard[] {
  return [
    { id: 'design-concept', title: 'Design concept', bullets: [content.concept] },
    { id: 'key-features', title: 'Key features', bullets: [content.feature] },
    { id: 'craftsmanship', title: 'Craftsmanship', bullets: [content.inspection] },
    { id: 'common-materials', title: 'Common materials', bullets: [content.material] },
  ];
}

/** Resolve the shared canonical offer so cross-piece saves and bag actions retain one identity. */
function outfitStudy(content: OutfitStudyContent): RecognitionStudy {
  const offerId = `${content.id}-study`;
  const item = outfitCatalogItems.find(candidate => candidate.id === offerId);
  if (!item) throw new Error(`Outfit study has no catalogue record: ${content.id}`);
  const example = outfitExamples.find(candidate => candidate.memberIds.includes(content.id));
  if (!example) throw new Error(`Outfit study has no campaign photograph: ${content.id}`);

  return {
    id: content.id,
    name: item.title,
    category: content.category,
    era: 'August 2025 collection',
    summary: content.summary,
    // No confidence value: these are sourced collection references, not measured recognition.
    identity: {
      brand: 'PUMA x ROSÉ', name: item.title, year: '2025',
      season: 'August 2025 collection', description: content.summary,
      mode: 'prototype', tags: content.tags,
    },
    identityEvidence: {
      sourceUrl: outfitCampaignSource.url,
      sourceLabel: outfitCampaignSource.label,
      description: `PUMA names model ${content.modelNumber} in this release. The campaign supplies collection context, not authentication of an individual item.`,
      relationship: 'campaign-collection-reference',
    },
    analysis: {
      image: item.image, imageAlt: content.imageAlt, imagePresentation: 'full',
      cards: analysisCards(content),
    },
    // Feature positions have not been measured against these packshots; no invented targets.
    annotations: [],
    culture: {
      title: 'From a campaign to a closer look',
      paragraphs: [
        `${item.title} is one of the named models in PUMA Japan’s August 2025 ROSÉ collection release. Its model number is ${content.modelNumber}.`,
        'This prepared study connects a campaign look with a documented collection design. Listing prices, condition and availability are illustrative; no seller, authentication or live image analysis is implied.',
      ],
      sources: [{ title: outfitCampaignSource.label, url: outfitCampaignSource.url }],
    },
    commerce: createCommerceEdit(offersFor([offerId]), []),
    // The same campaign frame supplies labelled styling context; unrelated references are omitted.
    contextReferenceIds: [`${example.id}-reference`],
  };
}

export const outfitStudies: RecognitionStudy[] = [
  outfitStudy({
    id: 'puma-rose-micro-grip', modelNumber: '091927', category: 'Handbag',
    summary: 'A compact sports-bag shape gives ROSÉ’s monochrome styling a small, graphic focal point.',
    imageAlt: 'PUMA x ROSÉ Micro Grip Bag product reference from the August 2025 collection',
    concept: 'A miniature accessory brings the proportions of a sports bag into an everyday look.',
    feature: 'The collection identifies this compact design as the Micro Grip Bag, model 091927.',
    inspection: 'For a physical bag, inspect the handles, fastening and seams; the release does not document its manufacturing process.',
    material: 'Composition and lining are not specified in the cited release. Verify the product label before choosing cleaning or care.',
    tags: ['Micro Grip', 'Compact accessory', 'Monochrome'],
  }),
  outfitStudy({
    id: 'puma-rose-longsleeve', modelNumber: '633805', category: 'Long-sleeve top',
    summary: 'A slim long-sleeve layer keeps the upper half of the look close and simple.',
    imageAlt: 'Warm-white PUMA x ROSÉ Slim Longsleeve Tee product reference from the August 2025 collection',
    concept: 'The slim tee balances the short skirt and small bag without adding another large silhouette.',
    feature: 'Long sleeves and the named slim fit distinguish this model from the collection’s relaxed tees.',
    inspection: 'Inspect cuffs, seams and surface wear on a real garment. The campaign provides no sewing or factory specification.',
    material: 'The cited release does not give fibre percentages. Read the garment’s composition and care labels.',
    tags: ['Slim fit', 'Long sleeves', 'Layering'],
  }),
  outfitStudy({
    id: 'puma-rose-mini-skirt', modelNumber: '633798', category: 'Mini skirt',
    summary: 'A short, slim skirt introduces a sharper proportion beside the sportswear accessories.',
    imageAlt: 'PUMA x ROSÉ Slim Micro Mini Skirt product reference from the August 2025 collection',
    concept: 'A compact skirt silhouette introduces a tailored counterpoint to the collection’s sportswear vocabulary.',
    feature: 'The release names this the Slim Micro Mini Skirt WV, model 633798.',
    inspection: 'Check the hem, fastening and seams on a physical piece; construction methods are not documented in the campaign.',
    material: 'The model name does not establish fibre composition. Confirm the actual garment label before assuming its fabric or care.',
    tags: ['Mini length', 'Slim silhouette', 'Sportswear styling'],
  }),
  outfitStudy({
    id: 'puma-rose-mesh-top', modelNumber: '633804', category: 'Mesh top',
    summary: 'A relaxed mesh layer introduces texture beside the broader track-trouser silhouette.',
    imageAlt: 'PUMA x ROSÉ Relaxed Mesh Top product reference from the August 2025 collection',
    concept: 'The relaxed top uses open texture to soften the contrast between the two dark sportswear pieces.',
    feature: 'PUMA describes a mesh top with a large rear ROSIE graphic in this collection.',
    inspection: 'Inspect the mesh for pulls and damaged openings, then check seams. No artisan or factory method is claimed.',
    material: 'Mesh describes the fabric structure, not its fibres. Composition and care need the actual product label.',
    tags: ['Mesh texture', 'Relaxed fit', 'ROSIE graphic'],
  }),
  outfitStudy({
    id: 'puma-rose-t7-trousers', modelNumber: '633796', category: 'Track trousers',
    summary: 'Relaxed T7 track trousers anchor the seated look with an easy sportswear silhouette.',
    imageAlt: 'PUMA x ROSÉ T7 Relaxed Track Pants product reference from the August 2025 collection',
    concept: 'ROSÉ’s collection revisits track-suit styling; these trousers carry that idea through a relaxed leg.',
    feature: 'The documented model is T7 Relaxed Track Pants WV, number 633796.',
    inspection: 'Inspect the waistband, leg seams and hems on an actual pair. The campaign does not specify its production process.',
    material: 'The release does not list fibre percentages. Confirm composition and washing instructions from the garment label.',
    tags: ['T7', 'Relaxed leg', 'Track styling'],
  }),
  outfitStudy({
    id: 'puma-rose-speedcat', modelNumber: '404391', category: 'Trainers',
    summary: 'The Speedcat PRM brings a low footwear silhouette into the relaxed track look.',
    imageAlt: 'Black PUMA x ROSÉ Speedcat PRM trainers with warm-white details and wraparound laces',
    concept: 'A close, low-profile shoe keeps the outfit’s emphasis on the wider trouser shape.',
    feature: 'The release distinguishes Speedcat PRM, model 404391, from its separate LEA and Ballet models.',
    inspection: 'Inspect the upper, laces and sole on a physical pair. A campaign image cannot establish wear or bond condition.',
    material: 'The cited release does not give upper or sole composition for this model. Check its product label and care guidance.',
    tags: ['Speedcat PRM', 'Low profile', 'Footwear'],
  }),
];
