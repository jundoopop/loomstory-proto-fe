/**
 * Authored Paddington walkthrough: edit the analysis copy, sample valuation, and
 * reference photographs here. These fixtures are not image-recognition results.
 * A future gateway can return the same typed data without changing the cards.
 */
import type { GarmentIdentity, ItemAnalysis, OutfitLook, PhotoInput } from './types';

const assetDirectory = '/local-media/chloe';

/** The supplied product photograph is also the no-upload entry into this example. */
export const chloePhoto: PhotoInput = {
  kind: 'sample',
  url: `${assetDirectory}/paddington-bag.jpg`,
  name: 'Chloé Paddington Bag example',
};

/** Fixed example identity; selecting another photograph still demonstrates this same item. */
export const chloeIdentity: GarmentIdentity = {
  brand: 'Chloé',
  name: 'Paddington Bag',
  year: '2005',
  season: 'Original Paddington collection',
  description: 'A soft silhouette, expressive hardware, and a distinctive padlock. Explore the story and details of the Chloé Paddington Bag through this authored example.',
  mode: 'prototype',
  tags: ['Paddington', 'Soft silhouette', 'Signature padlock'],
};

/** User-supplied editorial copy and illustrative resale figures; no live appraisal is performed. */
export const chloeAnalysis: ItemAnalysis = {
  image: chloePhoto.url,
  imageAlt: 'Brown suede Chloé Paddington Bag with leather handles, gold-tone padlock, and hanging key',
  cards: [
    {
      id: 'design-concept', title: 'Design concept',
      bullets: [
        'Created in 2005 by legendary designer Phoebe Philo, it became a millennium-defining It Bag.',
        'Blends a relaxed French bohemian spirit with equestrian vintage elements, challenging the conventional image of refined luxury handbags.',
        'Combines industrial-style metal hardware with a soft leather body, expressing effortless French luxury and making it a perennial vintage favorite.',
      ],
    },
    {
      id: 'key-features', title: 'Key features',
      bullets: [
        'Soft, slouchy, pillow-like silhouette.',
        'Signature oversized brass padlock wrapped in leather, complete with its original key - the soul of the bag.',
        'Wraparound C-shaped straps, buckles, rivets, and equestrian-inspired details.',
      ],
    },
    {
      id: 'craftsmanship', title: 'Craftsmanship',
      bullets: [
        'Vegetable-tanned washed leather undergoes multiple softening treatments; hand-stitched by Italian artisans at the original workshop.',
        "Brass hardware uses a vintage-style finish. The lock, rivets, and buckles are individually molded and polished. The 52 rivets around the body commemorate the brand's founding year.",
        'Symmetrical stitching and reinforced, wear-resistant corners.',
      ],
    },
    {
      id: 'common-materials', title: 'Common materials',
      bullets: [
        'MAINSTAYS: Grained buffalo leather and washed vegetable-tanned calfskin, with naturally fine texture and good durability. Relatively easy to care for and generally the most stable options on the secondhand market.',
        'VARIATIONS: Suede, shearling, distressed oiled-waxed leather, and vintage-finish suede. These create a stronger vintage mood but require more care and tend to have lower resale liquidity than smooth calfskin.',
      ],
    },
  ],
  resale: {
    description: 'Original vintage Paddington bags in 95% condition with a complete set: estimated resale value retention of 32%-40%. The popular 20th-anniversary reissue: estimated retention of 28%-35%. Suede and special colors typically depreciate more.',
    minimum: 700, maximum: 1000, currency: 'EUR', basis: 'prototype',
  },
};

/**
 * The selected styling photographs retain each downloaded source’s natural proportions.
 * Named captions come from the linked publisher's metadata, never from face recognition.
 * Credit records their source; it deliberately makes no public reuse-license claim.
 */
export const chloeLooks: OutfitLook[] = [
  {
    id: 'paddington-styling-01', celebrity: 'Street style', region: 'Global',
    title: 'A floral dress and a lived-in carry',
    image: `${assetDirectory}/styling-01.jpg`, width: 922, height: 1560,
    sourceLabel: 'Provided reference',
    credit: 'User-provided styling reference', tags: ['Paddington', 'Street style', 'Leather'], kind: 'Celebrity style',
    description: 'A brown padlock bag worn over the shoulder with a colorful floral dress. Supplied as a styling reference for this example.',
  },
  {
    id: 'paddington-styling-02', celebrity: 'Kate Bosworth', region: 'Global',
    title: 'Denim, a white knit, and warm leather',
    image: `${assetDirectory}/styling-02.jpg`, width: 1110, height: 1998,
    sourceUrl: 'https://www.allure.com/story/past-it-bags-comeback', sourceLabel: 'Allure · style archive',
    credit: 'Splash News, via Allure', tags: ['Paddington', 'Denim', 'Leather'], kind: 'Celebrity style',
    description: 'A brown padlock bag carried beside denim and a dark jacket. Supplied as a street-style reference for this example.',
  },
  {
    id: 'paddington-styling-03', celebrity: 'Alexa Chung', region: 'Global',
    title: 'Burgundy hardware against soft layers',
    image: `${assetDirectory}/styling-03.jpg`, width: 2001, height: 3000,
    sourceUrl: 'https://www.whowhatwear.com/fashion/fashion-flashback-chloe-paddington-launch', sourceLabel: 'Who What Wear · runway archive',
    credit: 'Courtesy of Chloé, via Who What Wear', tags: ['Paddington', 'Runway', 'Layers'], kind: 'Editorial',
    description: 'A burgundy padlock bag paired with a cream dress and a dark textured coat. Supplied as a runway styling reference.',
  },
  {
    id: 'paddington-styling-04', celebrity: 'Archive runway', region: 'Global',
    title: 'A dark shoulder bag with all-white tailoring',
    image: `${assetDirectory}/styling-04.jpg`, width: 5057, height: 7684,
    sourceUrl: 'https://www.whowhatwear.com/fashion/fashion-flashback-chloe-paddington-launch', sourceLabel: 'Who What Wear · runway archive',
    credit: 'Getty Images, via Who What Wear', tags: ['Runway', 'Tailoring', 'Shoulder bag'], kind: 'Editorial',
    description: 'A dark shoulder bag contrasted with a white runway look. Supplied as contextual inspiration; the exact bag model is not verified.',
  },
  {
    id: 'paddington-styling-05', celebrity: 'On-screen reference', region: 'Global',
    title: 'A pale bag and a bright city outfit',
    image: `${assetDirectory}/styling-05.jpg`, width: 1177, height: 1576,
    sourceLabel: 'Provided reference',
    credit: 'User-provided styling reference', tags: ['On screen', 'Shoulder bag', 'Color'], kind: 'On screen',
    description: 'A pale shoulder bag styled with a warm jacket and a colorful outfit. Supplied as an on-screen reference; the exact bag model is not verified.',
  },
];
