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

/** Design history and the pictured reissue are kept separate; neither authenticates an upload. */
export const chloeIdentity: GarmentIdentity = {
  brand: 'Chloé',
  name: 'Paddington Bag',
  year: '2005',
  season: 'Original design · reissue photograph',
  description: 'A soft silhouette, expressive hardware, and a distinctive padlock. Explore the story and details of the Chloé Paddington Bag through this authored example.',
  mode: 'prototype',
  tags: ['Paddington', 'Soft silhouette', 'Signature padlock'],
};

/** Primary references for the historical model and this specific supplied product photograph. */
export const chloeSources = [
  { title: 'Chloé · pictured suede Paddington specifications', url: 'https://www.chloe.com/en-us/p/bags/shoulder-bag/CH26AS802S77206.html' },
  { title: 'Chloé Attitudes · official exhibition release', url: 'https://ualresearchonline.arts.ac.uk/id/eprint/5514/6/judith_clark_Chloe_exhibition_erelease_EN.pdf' },
  { title: 'The Jewish Museum · Chloé Archive exhibition texts', url: 'https://s3.amazonaws.com/tjmassets/Chloe_Exhibition_Texts_Final_for_PR.pdf' },
];

/**
 * User-supplied editorial concept, checked against the primary references above.
 * A current suede reissue must not inherit unverified claims about every vintage version.
 * Valuation percentages remain an explicitly authored scenario, never market measurements.
 */
export const chloeAnalysis: ItemAnalysis = {
  image: chloePhoto.url,
  imageAlt: 'Brown suede Chloé Paddington Bag with leather handles, gold-tone padlock, and hanging key',
  imagePresentation: 'trim-top-space',
  cards: [
    {
      id: 'design-concept', title: 'Design concept',
      bullets: [
        'Introduced by Phoebe Philo for Spring/Summer 2005, the Paddington became a defining It Bag of the era.',
        'Blends a relaxed French bohemian spirit with equestrian vintage elements, challenging the conventional image of refined luxury handbags.',
        'Combines industrial-style metal hardware with a soft leather body, expressing effortless French luxury and making it a perennial vintage favorite.',
      ],
    },
    {
      id: 'key-features', title: 'Key features',
      bullets: [
        'Soft, slouchy, pillow-like silhouette.',
        'An oversized, leather-wrapped padlock and hanging key form its signature focal point.',
        'C-shaped buckles, curved handles, and visible rivet details balance its soft body.',
      ],
    },
    {
      id: 'craftsmanship', title: 'Craftsmanship',
      bullets: [
        'Chloé lists Italy for the pictured reissue’s tanning, finishing, and manufacture.',
        'Visible stitching follows the shaped leather trim; rounded handle attachments frame the front.',
        'The photographed reissue has a single zip and a lighter construction than the original design.',
      ],
    },
    {
      id: 'common-materials', title: 'Common materials',
      bullets: [
        'ARCHIVE: The museum’s 2005–2006 examples are described as washed calf leather with brass fittings.',
        'PICTURED REISSUE: Suede calfskin, calfskin lining, and a Zamak padlock. Specifications vary by version.',
        'Chloé advises protecting this suede version from moisture, abrasion, light, and heat.',
      ],
    },
  ],
  resale: {
    description: 'Sample scenario: a complete vintage bag in approximately 95% condition retains 32–40% of its original price; a 20th-anniversary reissue retains 28–35%. These are authored assumptions for this prototype, not measured resale rates. A real valuation would depend on the exact edition, condition, accessories, and comparable sales.',
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
    sourceUrl: `${assetDirectory}/styling-01.jpg`, sourceLabel: 'Provided photograph',
    credit: 'User-provided styling reference', tags: ['Paddington', 'Street style', 'Leather'], kind: 'Celebrity style',
    description: 'A brown padlock bag worn over the shoulder with a colorful floral dress. Supplied as a styling reference for this example.',
  },
  {
    id: 'paddington-styling-02', celebrity: 'Kate Bosworth', region: 'Global',
    title: 'Denim, a white knit, and warm leather',
    image: `${assetDirectory}/styling-02.jpg`, width: 934, height: 1600,
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
  // Add the on-screen reference only after its missing source photograph is supplied.
];
