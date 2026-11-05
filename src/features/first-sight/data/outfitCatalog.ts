/**
 * Real campaign models, with fictional commerce assumptions kept explicitly separate.
 * These IDs also enter the shared catalogue so archive saves resolve in the wardrobe.
 */
import type { Item } from '../../../types';
import type { CommerceProfile } from '../types';

export const outfitCampaignSource = {
  url: 'https://prtimes.jp/main/html/rd/p/000000290.000010697.html',
  label: 'PUMA Japan · August 2025 collection release',
};

const mediaDirectory = '/local-media/outfits';

/** Explicit sizes prevent footwear and bags inheriting the generic garment-size fallback. */
export interface OutfitOfferDetails {
  brand: string;
  condition: string;
  stock: number;
  material: string;
  color: string;
  sizes: string[];
  sourceLabel?: string;
  commerce: CommerceProfile;
}

/** Prices, sizes and availability demonstrate the interface; they are not retailer quotations. */
export const outfitCatalogItems: Item[] = [
  {
    id: 'puma-rose-micro-grip-study',
    title: 'PUMA x ROSÉ Micro Grip Bag',
    price: 65,
    era: 'August 2025 collection',
    category: 'Bags',
    size: 'One size',
    image: `${mediaDirectory}/micro-grip.jpg`,
    description: 'An illustrative listing for the documented PUMA x ROSÉ Micro Grip Bag, model 091927. The campaign photograph supplies collection context; this is not authenticated vintage stock or an offer from PUMA.',
    storyId: 'the-bag-in-the-story',
  },
  {
    id: 'puma-rose-longsleeve-study',
    title: 'PUMA x ROSÉ Slim Longsleeve Tee',
    price: 60,
    era: 'August 2025 collection',
    category: 'Tops',
    size: 'S',
    image: `${mediaDirectory}/longsleeve.jpg`,
    description: 'An illustrative listing for the documented PUMA x ROSÉ Slim Longsleeve Tee, model 633805. The model is real; the price, condition and stock are prototype assumptions, not an authenticated vintage offer.',
    storyId: 'less-but-better',
  },
  {
    id: 'puma-rose-mini-skirt-study',
    title: 'PUMA x ROSÉ Slim Micro Mini Skirt',
    price: 70,
    era: 'August 2025 collection',
    category: 'Skirts',
    size: 'S',
    image: `${mediaDirectory}/mini-skirt.jpg`,
    description: 'An illustrative listing for the documented PUMA x ROSÉ Slim Micro Mini Skirt WV, model 633798. This recent campaign design is presented as a collection study, not authenticated vintage stock.',
    storyId: 'less-but-better',
  },
  {
    id: 'puma-rose-mesh-top-study',
    title: 'PUMA x ROSÉ Relaxed Mesh Top',
    price: 55,
    era: 'August 2025 collection',
    category: 'Tops',
    size: 'S',
    image: `${mediaDirectory}/mesh-top.jpg`,
    description: 'An illustrative listing for the documented PUMA x ROSÉ Relaxed Mesh Top, model 633804. Its campaign styling is sourced; this sample price, condition and inventory do not describe a real seller’s garment.',
    storyId: 'less-but-better',
  },
  {
    id: 'puma-rose-t7-trousers-study',
    title: 'PUMA x ROSÉ T7 Relaxed Track Pants',
    price: 120,
    era: 'August 2025 collection',
    category: 'Trousers',
    size: 'S',
    image: `${mediaDirectory}/t7-trousers.jpg`,
    description: 'An illustrative listing for the documented PUMA x ROSÉ T7 Relaxed Track Pants WV, model 633796. The contemporary collection reference is real; the commerce details are fictional and do not authenticate a physical item.',
    storyId: 'less-but-better',
  },
  {
    id: 'puma-rose-speedcat-study',
    title: 'PUMA x ROSÉ Speedcat PRM',
    price: 125,
    era: 'August 2025 collection',
    category: 'Shoes',
    size: 'EU 38',
    image: `${mediaDirectory}/speedcat.jpg`,
    description: 'An illustrative listing for the documented PUMA x ROSÉ Speedcat PRM, model 404391. The photograph is a collection reference, not evidence of the condition or authenticity of purchasable stock.',
    storyId: 'less-but-better',
  },
];

/** Every offer stays in the authored archive-study track; this release adds no partner dupes. */
function studyCommerce(modelNumber: string): CommerceProfile {
  return {
    track: 'archive',
    listingKind: 'archive-study',
    matchReason: `Collection study for documented PUMA model ${modelNumber}; sample listing, not authenticated vintage stock.`,
  };
}

export const outfitOfferDetails: Record<string, OutfitOfferDetails> = {
  'puma-rose-micro-grip-study': {
    brand: 'PUMA x ROSÉ', condition: 'Very good · sample condition', stock: 2,
    material: 'Composition not specified in the cited campaign release; verify the product label.',
    color: 'Black · reference photograph', sizes: ['One size'],
    sourceLabel: outfitCampaignSource.label, commerce: studyCommerce('091927'),
  },
  'puma-rose-longsleeve-study': {
    brand: 'PUMA x ROSÉ', condition: 'Excellent · sample condition', stock: 2,
    material: 'Fibre composition not specified in the cited campaign release; verify the care label.',
    color: 'Warm white · reference photograph', sizes: ['XS', 'S', 'M'],
    sourceLabel: outfitCampaignSource.label, commerce: studyCommerce('633805'),
  },
  'puma-rose-mini-skirt-study': {
    brand: 'PUMA x ROSÉ', condition: 'Very good · sample condition', stock: 1,
    material: 'Fibre composition not specified in the cited campaign release; verify the care label.',
    color: 'Black · reference photograph', sizes: ['XS', 'S', 'M'],
    sourceLabel: outfitCampaignSource.label, commerce: studyCommerce('633798'),
  },
  'puma-rose-mesh-top-study': {
    brand: 'PUMA x ROSÉ', condition: 'Excellent · sample condition', stock: 2,
    material: 'Mesh construction; fibre composition requires the product care label.',
    color: 'Black · reference photograph', sizes: ['XS', 'S', 'M'],
    sourceLabel: outfitCampaignSource.label, commerce: studyCommerce('633804'),
  },
  'puma-rose-t7-trousers-study': {
    brand: 'PUMA x ROSÉ', condition: 'Very good · sample condition', stock: 2,
    material: 'Fibre composition not specified in the cited campaign release; verify the care label.',
    color: 'Black · reference photograph', sizes: ['XS', 'S', 'M'],
    sourceLabel: outfitCampaignSource.label, commerce: studyCommerce('633796'),
  },
  'puma-rose-speedcat-study': {
    brand: 'PUMA x ROSÉ', condition: 'Good · sample condition', stock: 1,
    material: 'Upper and sole composition not specified in the cited release; verify the product label.',
    color: 'Black / warm white · reference photograph', sizes: ['EU 37', 'EU 38', 'EU 39'],
    sourceLabel: outfitCampaignSource.label, commerce: studyCommerce('404391'),
  },
};
