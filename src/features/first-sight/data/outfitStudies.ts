/**
 * Prepared studies for real models named in PUMA's ROSÉ launch release.
 * Campaign association does not authenticate an item or perform image recognition.
 */
import { createCommerceEdit } from '../commerce.ts';
import { offersFor } from '../fixtures.ts';
import type { AnalysisCard, ProductAnnotation, RecognitionStudy } from '../types';
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
  annotations: ProductAnnotation[];
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
    // Anchors use percentages of the complete 1000 × 1000 product packshot, not the outfit photo.
    // Labels describe visible design details; they do not infer fibres or manufacturing methods.
    annotations: content.annotations,
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
    concept: 'A compact, domed body brings the proportions of a sports bag into an everyday look.',
    feature: 'Two arched top handles rise above the body, creating the bag’s recognisable outline.',
    inspection: 'Curved panel seams frame the front of the reference bag. The photograph does not establish its manufacturing process.',
    material: 'The reference shows a finely textured surface. Its appearance alone does not establish the composition or lining.',
    tags: ['Micro Grip', 'Compact accessory', 'Monochrome'],
    annotations: [
      { id: 'puma-rose-micro-grip-design-concept', cardId: 'design-concept', label: 'Domed silhouette', detail: 'The rounded upper edge gives this compact sports-bag shape its domed profile.', x: 30, y: 46 },
      { id: 'puma-rose-micro-grip-key-features', cardId: 'key-features', label: 'Twin handles', detail: 'Two arched top handles extend above the body and balance its rounded shape.', x: 45, y: 32 },
      { id: 'puma-rose-micro-grip-craftsmanship', cardId: 'craftsmanship', label: 'Curved panel seams', detail: 'Visible curved seams trace the front panels around the handle attachments.', x: 43, y: 61 },
      { id: 'puma-rose-micro-grip-common-materials', cardId: 'common-materials', label: 'Textured surface', detail: 'A fine surface texture catches the light across the front panel; the photograph does not establish its fibre composition.', x: 69, y: 67 },
    ],
  }),
  outfitStudy({
    id: 'puma-rose-longsleeve', modelNumber: '633805', category: 'Long-sleeve top',
    summary: 'A slim long-sleeve layer keeps the upper half of the look close and simple.',
    imageAlt: 'Warm-white PUMA x ROSÉ Slim Longsleeve Tee product reference from the August 2025 collection',
    concept: 'The cropped body balances long sleeves with a compact upper silhouette.',
    feature: 'A round neckline keeps the front simple alongside the close, long-sleeved shape.',
    inspection: 'The photographed sleeve ends have visibly finished cuffs. No factory or sewing process is inferred.',
    material: 'The warm-white reference has a smooth-looking surface. Fibre percentages and care require the garment label.',
    tags: ['Slim fit', 'Long sleeves', 'Layering'],
    annotations: [
      { id: 'puma-rose-longsleeve-design-concept', cardId: 'design-concept', label: 'Cropped silhouette', detail: 'The short body contrasts with the full sleeve length, creating a compact silhouette.', x: 35, y: 65 },
      { id: 'puma-rose-longsleeve-key-features', cardId: 'key-features', label: 'Round neckline', detail: 'A simple round neckline frames the upper edge without adding a collar.', x: 53, y: 20 },
      { id: 'puma-rose-longsleeve-craftsmanship', cardId: 'craftsmanship', label: 'Finished cuffs', detail: 'The sleeve ends have a neat, visible finished edge; inspect these areas for wear on a physical garment.', x: 22, y: 86 },
      { id: 'puma-rose-longsleeve-common-materials', cardId: 'common-materials', label: 'Smooth surface', detail: 'The reference shows an even, smooth-looking surface. Its appearance does not establish fibre content.', x: 61, y: 49 },
    ],
  }),
  outfitStudy({
    id: 'puma-rose-mini-skirt', modelNumber: '633798', category: 'Mini skirt',
    summary: 'A short, slim skirt introduces a sharper proportion beside the sportswear accessories.',
    imageAlt: 'PUMA x ROSÉ Slim Micro Mini Skirt product reference from the August 2025 collection',
    concept: 'The short, compact silhouette introduces a sharper proportion beside the sportswear pieces.',
    feature: 'A small contrasting ROSIE badge sits close to the waist in the product reference.',
    inspection: 'A gently curved lower edge follows the skirt’s outline. The photograph does not establish how the hem was constructed.',
    material: 'The dark fabric appears smooth in the reference. Confirm composition and care from the physical garment label.',
    tags: ['Mini length', 'Slim silhouette', 'Sportswear styling'],
    annotations: [
      { id: 'puma-rose-mini-skirt-design-concept', cardId: 'design-concept', label: 'Mini silhouette', detail: 'A short, compact shape creates the mini-length proportion named in this design.', x: 25, y: 45 },
      { id: 'puma-rose-mini-skirt-key-features', cardId: 'key-features', label: 'ROSIE badge', detail: 'The small contrasting ROSIE badge provides a visible collection detail near the waist.', x: 70, y: 33 },
      { id: 'puma-rose-mini-skirt-craftsmanship', cardId: 'craftsmanship', label: 'Curved hem', detail: 'The lower edge forms a gentle curve across the front of the reference skirt.', x: 36, y: 72 },
      { id: 'puma-rose-mini-skirt-common-materials', cardId: 'common-materials', label: 'Smooth fabric', detail: 'The reference presents a smooth, dark surface; the image alone does not establish its fibres.', x: 68, y: 57 },
    ],
  }),
  outfitStudy({
    id: 'puma-rose-mesh-top', modelNumber: '633804', category: 'Mesh top',
    summary: 'A relaxed mesh layer introduces texture beside the broader track-trouser silhouette.',
    imageAlt: 'PUMA x ROSÉ Relaxed Mesh Top product reference from the August 2025 collection',
    concept: 'A sleeveless outline gives the relaxed sportswear top an open upper silhouette.',
    feature: 'The large contrasting 97 graphic is clearly visible across the photographed front.',
    inspection: 'A defined lower band finishes the open mesh body. No artisan or factory process is claimed.',
    material: 'Visible openings give the surface its mesh structure. This structure does not establish fibre content or performance.',
    tags: ['Mesh texture', 'Relaxed fit', 'ROSIE graphic'],
    annotations: [
      { id: 'puma-rose-mesh-top-design-concept', cardId: 'design-concept', label: 'Sleeveless cut', detail: 'The open armholes and sleeveless shape frame the relaxed sportswear outline.', x: 22, y: 43 },
      { id: 'puma-rose-mesh-top-key-features', cardId: 'key-features', label: '97 graphic', detail: 'Large contrasting numerals form the most prominent graphic on this side of the top.', x: 62, y: 53 },
      { id: 'puma-rose-mesh-top-craftsmanship', cardId: 'craftsmanship', label: 'Bound hem', detail: 'A defined band finishes the lower edge of the mesh body.', x: 38, y: 83 },
      { id: 'puma-rose-mesh-top-common-materials', cardId: 'common-materials', label: 'Open mesh', detail: 'Visible openings create the mesh texture. They do not, by themselves, establish its fibres or performance.', x: 76, y: 73 },
    ],
  }),
  outfitStudy({
    id: 'puma-rose-t7-trousers', modelNumber: '633796', category: 'Track trousers',
    summary: 'Relaxed T7 track trousers anchor the seated look with an easy sportswear silhouette.',
    imageAlt: 'PUMA x ROSÉ T7 Relaxed Track Pants product reference from the August 2025 collection',
    concept: 'The broad, relaxed legs carry the track-suit idea through an easy silhouette.',
    feature: 'The product reference shows a gathered waist with a central drawcord.',
    inspection: 'Defined hems finish the wide lower legs. The photograph does not establish the sewing process.',
    material: 'The smooth-looking surface falls into long folds. Fibre percentages and washing instructions require the garment label.',
    tags: ['T7', 'Relaxed leg', 'Track styling'],
    annotations: [
      { id: 'puma-rose-t7-trousers-design-concept', cardId: 'design-concept', label: 'Wide leg', detail: 'The relaxed leg stays broad down towards the hem, giving the trousers their easy outline.', x: 39, y: 63 },
      { id: 'puma-rose-t7-trousers-key-features', cardId: 'key-features', label: 'Drawcord waist', detail: 'A central drawcord is visible beneath the gathered waist in the product reference.', x: 50, y: 20 },
      { id: 'puma-rose-t7-trousers-craftsmanship', cardId: 'craftsmanship', label: 'Finished hems', detail: 'The lower edges finish each wide leg with a defined hem.', x: 41, y: 86 },
      { id: 'puma-rose-t7-trousers-common-materials', cardId: 'common-materials', label: 'Smooth surface', detail: 'The reference shows a smooth-looking surface with long folds, without establishing the fibre composition.', x: 61, y: 60 },
    ],
  }),
  outfitStudy({
    id: 'puma-rose-speedcat', modelNumber: '404391', category: 'Trainers',
    summary: 'The Speedcat PRM brings a low footwear silhouette into the relaxed track look.',
    imageAlt: 'Black PUMA x ROSÉ Speedcat PRM trainers with warm-white details and wraparound laces',
    concept: 'A close, low-profile shoe balances the wider track-trouser shape.',
    feature: 'Contrasting pale laces wrap across and around the upper in the product reference.',
    inspection: 'Visible stitched panels follow the upper’s curved shape. The photograph does not establish wear or bond condition.',
    material: 'The upper appears smooth beside the contrasting laces. Its composition requires the product label, not a visual guess.',
    tags: ['Speedcat PRM', 'Low profile', 'Footwear'],
    annotations: [
      { id: 'puma-rose-speedcat-design-concept', cardId: 'design-concept', label: 'Low profile', detail: 'The close upper and low sole keep the shoe’s outline compact beside a wider trouser leg.', x: 24, y: 62 },
      { id: 'puma-rose-speedcat-key-features', cardId: 'key-features', label: 'Wrapping laces', detail: 'Contrasting pale laces wrap across and around the upper, creating this model’s distinctive detail.', x: 64, y: 55 },
      { id: 'puma-rose-speedcat-craftsmanship', cardId: 'craftsmanship', label: 'Stitched panels', detail: 'Visible stitching traces the curved panel edges on the upper.', x: 46, y: 55 },
      { id: 'puma-rose-speedcat-common-materials', cardId: 'common-materials', label: 'Smooth upper', detail: 'The reference shows a smooth upper surface; the image alone does not establish its material composition.', x: 80, y: 45 },
    ],
  }),
];
