/**
 * The five selectable FirstSight studies. Edit narrative, feature targets, and related
 * offers here; the dossier and shopping components only render this typed contract.
 * Every confidence score and era match is seeded. No uploaded image is inspected.
 */
import { chloeAnalysis, chloeIdentity, chloeLooks, chloeSources } from './chloe.ts';
import { offersFor, purchaseOptions } from './fixtures.ts';
import { outfitLooks } from './looks.ts';
import type { AnalysisCard, OutfitLook, ProductAnnotation, RecognizedItem } from './types';

/** Resolve an intentional styling edit while preserving original captions and source credits. */
function looksFor(ids: readonly string[]): OutfitLook[] {
  return ids.map(id => {
    const look = outfitLooks.find(candidate => candidate.id === id);
    if (!look) throw new Error(`FirstSight styling reference is not registered: ${id}`);
    return look;
  });
}

/** Garment-specific content; repeated prototype metadata is added once in garmentStudy. */
interface GarmentStudyInput {
  id: string;
  name: string;
  category: string;
  era: string;
  summary: string;
  confidence: number;
  tags: string[];
  imageAlt: string;
  cards: AnalysisCard[];
  annotations: ProductAnnotation[];
  resaleRange: [number, number];
  resaleNote: string;
  culture: RecognizedItem['culture'];
  productIds: string[];
  lookIds: string[];
}

/** Assemble a generic style category without inventing a maker or a verified production date. */
function garmentStudy(study: GarmentStudyInput): RecognizedItem {
  return {
    id: study.id,
    name: study.name,
    category: study.category,
    era: study.era,
    summary: study.summary,
    confidence: study.confidence,
    identity: {
      brand: 'Unbranded style study',
      name: study.name,
      year: study.era,
      season: 'Illustrated sample · era inspiration',
      description: study.summary,
      mode: 'prototype',
      tags: study.tags,
    },
    analysis: {
      image: `/assets/first-sight/studies/${study.id}.svg`,
      imageAlt: study.imageAlt,
      imagePresentation: 'full',
      cards: study.cards,
      resale: {
        description: study.resaleNote,
        minimum: study.resaleRange[0],
        maximum: study.resaleRange[1],
        currency: 'EUR',
        basis: 'prototype',
      },
    },
    annotations: study.annotations,
    culture: study.culture,
    products: offersFor(study.productIds),
    looks: looksFor(study.lookIds),
  };
}

/**
 * Coordinates describe the complete source image. The dossier preserves that image plane
 * even when trimming Chloé's empty upper background, so targets stay anchored to details.
 */
const paddingtonStudy: RecognizedItem = {
  id: 'chloe-paddington',
  name: 'Chloé Paddington Bag',
  category: 'Handbag',
  era: '2005 design · reissue shown',
  summary: 'Soft volume, sculptural hardware, and the padlock that gives the Paddington its character.',
  confidence: 98,
  identity: chloeIdentity,
  analysis: chloeAnalysis,
  annotations: [
    { id: 'paddington-shape', cardId: 'design-concept', label: 'Soft silhouette', detail: 'A supple, rounded body gives the bag its relaxed outline.', x: 26, y: 69 },
    { id: 'paddington-padlock', cardId: 'key-features', label: 'Signature padlock', detail: 'The leather-wrapped, gold-tone padlock is the visual focal point. Chloé lists Zamak for this reissue.', x: 49, y: 64 },
    { id: 'paddington-stitching', cardId: 'craftsmanship', label: 'Shaped leather trim', detail: 'Visible stitching follows the curved handle attachments and leather edging.', x: 65, y: 65 },
    { id: 'paddington-suede', cardId: 'common-materials', label: 'Suede calfskin', detail: 'The pictured reissue combines a suede calfskin body with smoother leather details.', x: 64, y: 73 },
  ],
  culture: {
    title: 'A small piece of the 2000s',
    paragraphs: [
      'The Paddington belongs to the early-2000s It Bag story. Chloé’s official exhibition release dates Phoebe Philo’s original to Spring/Summer 2005; the museum archive describes its washed leather and substantial brass fittings.',
      'The current suede reissue pictured here revisits that silhouette with a lighter construction. Its specifications should be read separately from those of an original vintage bag.',
      'Explore the supplied street-style and runway references below for ideas about proportion, color, and texture. They are styling context, not proof that every pictured bag is the same edition.',
    ],
    sources: chloeSources,
  },
  products: purchaseOptions,
  looks: chloeLooks,
};

const leatherBomberStudy = garmentStudy({
  id: 'leather-bomber',
  name: 'Vintage leather bomber',
  category: 'Leather outerwear',
  era: '1980s inspired',
  summary: 'A generous shoulder and compact ribbed hem frame this warm brown leather silhouette.',
  confidence: 91,
  tags: ['Leather', 'Ribbed hem', 'Relaxed volume'],
  imageAlt: 'Original silhouette illustration of a brown leather bomber with ribbed cuffs, waistband, and zip front',
  cards: [
    { id: 'design-concept', title: 'Design concept', bullets: [
      'A roomy upper body narrows into a compact waistband, balancing volume and structure.',
      'Warm brown gives this 1980s-inspired study a softer mood than an all-black leather layer.',
      'This is a generic style illustration; the decade is an editorial cue, not a dated or branded identification.',
    ] },
    { id: 'key-features', title: 'Key features', bullets: [
      'Dropped shoulders and full sleeves create the relaxed outline.',
      'A central metal-look zip divides the front into clean panels.',
      'Ribbed cuffs and hem gather the volume; angled pockets keep the front practical.',
    ] },
    { id: 'craftsmanship', title: 'Craftsmanship', bullets: [
      'Panel seams follow the shoulder and sleeve shape in this illustrated design.',
      'For a real garment, inspect the zip, lining, pocket openings, and ribbing for wear.',
      'Surface patina alone cannot establish age, maker, or the quality of the underlying leather.',
    ] },
    { id: 'common-materials', title: 'Common materials', bullets: [
      'STUDY: Leather shell, textile lining, and knitted rib trim are the assumed construction.',
      'ALTERNATIVES: Suede and coated textiles can produce related shapes with different texture and care needs.',
      'Check the label and physical garment before treating any material suggestion as confirmed.',
    ] },
  ],
  annotations: [
    { id: 'bomber-shoulder', cardId: 'design-concept', label: 'Relaxed shoulder', detail: 'Extra room through the shoulder gives this study its rounded upper volume.', x: 33, y: 26 },
    { id: 'bomber-rib', cardId: 'key-features', label: 'Ribbed waistband', detail: 'The gathered waist brings the loose body back into a compact outline.', x: 61, y: 78 },
    { id: 'bomber-seam', cardId: 'craftsmanship', label: 'Panel construction', detail: 'Follow the shoulder seam into the sleeve; this is an illustrated construction cue.', x: 69, y: 38 },
    { id: 'bomber-surface', cardId: 'common-materials', label: 'Leather study', detail: 'Warm tonal shading suggests leather; the illustration cannot confirm a real material.', x: 38, y: 61 },
  ],
  resaleRange: [120, 220],
  resaleNote: 'An illustrative €120–€220 range for this unbranded leather study. A real appraisal would need the maker, measurements, leather condition, repairs, and comparable completed sales.',
  culture: {
    title: 'An off-duty point of view',
    paragraphs: [
      'Imagine the bomber over a plain knit, with straight denim and a compact shoulder bag. The contrast between a broad jacket and an uncomplicated base gives this editorial study its character.',
      'The 1980s association is a styling direction for the prototype. The sourced references explore leather and layered silhouettes; no exact garment match or screen appearance is claimed.',
    ],
    sources: [],
  },
  productIds: ['bomber-archive', 'bomber-alternative', 'minimalist-leather', 'weekend-layer'],
  lookIds: ['cha-eun-woo-1', 'zendaya-8', 'han-so-hee-3', 'g-dragon-4'],
});

const denimJacketStudy = garmentStudy({
  id: 'denim-jacket',
  name: 'Classic denim jacket',
  category: 'Denim jacket',
  era: '1990s inspired',
  summary: 'Faded indigo, chest pockets, and vertical seams make an easy layer with a familiar rhythm.',
  confidence: 89,
  tags: ['Denim', 'Chest pockets', 'Panel seams'],
  imageAlt: 'Original silhouette illustration of an indigo denim jacket with chest flap pockets, panel seams, and button front',
  cards: [
    { id: 'design-concept', title: 'Design concept', bullets: [
      'A straight, hip-length outline brings balance to relaxed trousers or a longer skirt.',
      'Pale seams and a mid-indigo wash give this study a lived-in visual rhythm.',
      'The 1990s reference is a styling choice; no particular maker or production year is identified.',
    ] },
    { id: 'key-features', title: 'Key features', bullets: [
      'A pointed collar frames the neckline above a button-through front.',
      'Two chest flap pockets give the upper body a clear horizontal line.',
      'Vertical panel seams, a defined hem band, and button cuffs organize the shape.',
    ] },
    { id: 'craftsmanship', title: 'Craftsmanship', bullets: [
      'Contrast topstitching follows the panels, pockets, and collar in the illustration.',
      'When inspecting a real jacket, check the pocket corners, cuffs, buttonholes, and seams.',
      'Fading and wear can add character, but they do not establish provenance on their own.',
    ] },
    { id: 'common-materials', title: 'Common materials', bullets: [
      'STUDY: Cotton denim with metal-look buttons is the assumed material combination.',
      'VARIATIONS: A stretch blend or a heavier rigid cloth can change both movement and drape.',
      'The care label and fabric inspection would confirm the actual fiber composition.',
    ] },
  ],
  annotations: [
    { id: 'denim-outline', cardId: 'design-concept', label: 'Compact outline', detail: 'The defined hem keeps the jacket close to hip length in this illustration.', x: 36, y: 78 },
    { id: 'denim-pocket', cardId: 'key-features', label: 'Chest flap pocket', detail: 'The pointed flap and button give this work-inspired pocket a recognizable shape.', x: 62, y: 40 },
    { id: 'denim-topstitch', cardId: 'craftsmanship', label: 'Contrast seams', detail: 'Twin lines of topstitching make the front panel construction easy to read.', x: 45, y: 59 },
    { id: 'denim-cloth', cardId: 'common-materials', label: 'Indigo denim study', detail: 'The drawn twill texture illustrates denim; it is not a fabric test on an uploaded photo.', x: 76, y: 52 },
  ],
  resaleRange: [55, 110],
  resaleNote: 'An illustrative €55–€110 range for an unbranded denim jacket. Labels, fit, repairs, fabric condition, and completed-sale comparisons would shape a real estimate.',
  culture: {
    title: 'Everyday, with your own rhythm',
    paragraphs: [
      'Pair the jacket with a white tee for a simple base, or let it interrupt a more formal look. A slightly faded layer can make a crisp shirt feel more relaxed without changing the rest of the outfit.',
      'This editorial edit follows denim as a styling thread. The reference photographs show different garments and ways of wearing the fabric; they do not verify this illustrated jacket.',
    ],
    sources: [],
  },
  productIds: ['denim-jacket-archive', 'denim-jacket-alternative', 'archive-denim', 'record-shop-denim'],
  lookIds: ['jisoo-2', 'iu-singer-6', 'han-so-hee-3', 'dua-lipa-1'],
});

const tailoredBlazerStudy = garmentStudy({
  id: 'tailored-blazer',
  name: 'Oversized tailored blazer',
  category: 'Tailoring',
  era: '1980s–1990s inspired',
  summary: 'Broad shoulders, a low double-breasted closure, and soft taupe bring proportion into focus.',
  confidence: 87,
  tags: ['Tailoring', 'Broad shoulder', 'Double breasted'],
  imageAlt: 'Original silhouette illustration of a taupe oversized double-breasted blazer with notched lapels and flap pockets',
  cards: [
    { id: 'design-concept', title: 'Design concept', bullets: [
      'A generous shoulder and a long, relatively straight body create an oversized proportion.',
      'Warm taupe keeps the emphasis on shape, with room for a knit or shirt underneath.',
      'The late-1980s to 1990s association is an editorial interpretation, not a verified date.',
    ] },
    { id: 'key-features', title: 'Key features', bullets: [
      'Notched lapels frame a double-breasted front with two columns of buttons.',
      'Low flap pockets and a small chest welt add restrained structure.',
      'The longer hem and relaxed sleeves keep the outline generous.',
    ] },
    { id: 'craftsmanship', title: 'Craftsmanship', bullets: [
      'The drawn shoulder, lapel roll, and crossing front panels describe the intended tailoring.',
      'For a real blazer, inspect the lining, underarm seams, button attachment, and shoulder balance.',
      'Canvas construction, padding, and hand finishing cannot be verified from this illustration.',
    ] },
    { id: 'common-materials', title: 'Common materials', bullets: [
      'STUDY: A wool-blend outer cloth and smooth lining are assumed for this soft structure.',
      'ALTERNATIVES: Viscose blends or lighter linen blends can reinterpret the same proportion.',
      'Use the garment label and a physical inspection to confirm the actual fabric and construction.',
    ] },
  ],
  annotations: [
    { id: 'blazer-shoulder', cardId: 'design-concept', label: 'Generous shoulder', detail: 'The extended shoulder sets the scale of the oversized silhouette.', x: 31, y: 24 },
    { id: 'blazer-lapel', cardId: 'key-features', label: 'Notched lapel', detail: 'The collar notch and broad lapel lead the eye toward the crossing front panels.', x: 60, y: 30 },
    { id: 'blazer-pocket', cardId: 'craftsmanship', label: 'Flap pocket', detail: 'The low pocket position emphasizes length; its construction is a drawn study.', x: 37, y: 65 },
    { id: 'blazer-cloth', cardId: 'common-materials', label: 'Wool-blend study', detail: 'A softly textured cloth is suggested here; fiber content requires a real label.', x: 66, y: 48 },
  ],
  resaleRange: [85, 180],
  resaleNote: 'An illustrative €85–€180 range for this unbranded tailoring study. Fit, fabric composition, alterations, lining wear, and comparable sales would influence a real valuation.',
  culture: {
    title: 'A little structure, worn your way',
    paragraphs: [
      'Let the blazer provide the outline: a plain top, straight trousers, and one deliberate accessory leave space for its broad shoulder and long line. Rolling the cuffs or adding a bright knit changes the mood without changing the shape.',
      'The accompanying references explore tailoring in formal, stage, and everyday settings. They provide styling ideas rather than a designer attribution for this sample.',
    ],
    sources: [],
  },
  productIds: ['blazer-archive', 'blazer-alternative', 'city-coat', 'gallery-coat'],
  lookIds: ['g-dragon-7', 'kentaro-sakaguchi-1', 'v-bts-7', 'xiao-zhan-1'],
});

const workwearJacketStudy = garmentStudy({
  id: 'workwear-jacket',
  name: 'Vintage workwear jacket',
  category: 'Utility outerwear',
  era: 'Mid-century inspired',
  summary: 'A straight olive body, practical patch pockets, and a simple button front make utility the detail.',
  confidence: 84,
  tags: ['Workwear', 'Patch pockets', 'Cotton canvas'],
  imageAlt: 'Original silhouette illustration of an olive workwear jacket with three patch pockets and a button front',
  cards: [
    { id: 'design-concept', title: 'Design concept', bullets: [
      'A straight, uncomplicated shape makes space for movement and layering.',
      'Faded olive and large surface pockets give this study its practical character.',
      '“Mid-century inspired” describes the mood; it does not establish the age or origin of a garment.',
    ] },
    { id: 'key-features', title: 'Key features', bullets: [
      'Three patch pockets sit directly on the front for a clear, functional layout.',
      'A simple collar and button closure keep the neckline and center front quiet.',
      'The straight hem and relatively loose sleeves create an easy outer layer.',
    ] },
    { id: 'craftsmanship', title: 'Craftsmanship', bullets: [
      'Visible stitching outlines the pocket bags and reinforces the visual structure of this drawing.',
      'On a real work jacket, inspect pocket corners, elbows, cuffs, and any previous repairs.',
      'Fading or mending may tell a wear story, but neither alone verifies a work history.',
    ] },
    { id: 'common-materials', title: 'Common materials', bullets: [
      'STUDY: Cotton canvas is assumed for the body, with simple buttons and unlined construction.',
      'VARIATIONS: Cotton twill or denim can give a similar outline a different weight and surface.',
      'A close fabric inspection and care label would be needed to confirm the composition.',
    ] },
  ],
  annotations: [
    { id: 'workwear-cut', cardId: 'design-concept', label: 'Straight cut', detail: 'An uncomplicated body leaves space for layers and movement.', x: 35, y: 50 },
    { id: 'workwear-pocket', cardId: 'key-features', label: 'Patch pocket', detail: 'The pocket sits on the garment surface, keeping the functional construction visible.', x: 62, y: 67 },
    { id: 'workwear-seam', cardId: 'craftsmanship', label: 'Pocket stitching', detail: 'A clear stitched border describes the illustrated pocket attachment.', x: 39, y: 74 },
    { id: 'workwear-canvas', cardId: 'common-materials', label: 'Canvas study', detail: 'The woven texture suggests cotton canvas, an authored material assumption for this study.', x: 65, y: 51 },
  ],
  resaleRange: [65, 140],
  resaleNote: 'An illustrative €65–€140 range for this generic utility-jacket study. Labels, repairs, fabric strength, measurements, and comparable sales would be needed for a real estimate.',
  culture: {
    title: 'Useful details, everyday stories',
    paragraphs: [
      'Try the olive jacket with a fine knit and straight denim, or use its practical shape to soften tailored trousers. The pockets can remain the only decoration an outfit needs.',
      'This is an editorial study of utility rather than a claim about a particular trade, military issue, or decade. The sourced photographs connect the idea to relaxed layers and earth-toned styling.',
    ],
    sources: [],
  },
  productIds: ['workwear-archive', 'workwear-alternative', 'denim-jacket-archive', 'denim-jacket-alternative'],
  lookIds: ['timothee-chalamet-6', 'park-seo-joon-6', 'wang-yibo-2', 'cha-eun-woo-3'],
});

/** Stable ordering makes the supplied Chloé example the default while preserving five choices. */
export const recognitionItems: RecognizedItem[] = [
  paddingtonStudy, leatherBomberStudy, denimJacketStudy, tailoredBlazerStudy, workwearJacketStudy,
];
