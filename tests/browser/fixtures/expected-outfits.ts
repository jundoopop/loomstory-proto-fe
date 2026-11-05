/** Independent consumer expectations: never derive a photograph's members from app records. */
export interface ExpectedOutfitPiece {
  readonly id: string;
  readonly name: string;
  readonly productId: string;
}

export interface ExpectedOutfit {
  readonly id: string;
  readonly button: string;
  readonly primaryItemId: string;
  readonly pieces: readonly ExpectedOutfitPiece[];
}

export const expectedOutfits: readonly ExpectedOutfit[] = [
  {
    id: 'rose-puma-city',
    button: 'Try ROSÉ · the city look',
    primaryItemId: 'puma-rose-micro-grip',
    pieces: [
      { id: 'puma-rose-micro-grip', name: 'PUMA x ROSÉ Micro Grip Bag', productId: 'puma-rose-micro-grip-study' },
      { id: 'puma-rose-longsleeve', name: 'PUMA x ROSÉ Slim Longsleeve Tee', productId: 'puma-rose-longsleeve-study' },
      { id: 'puma-rose-mini-skirt', name: 'PUMA x ROSÉ Slim Micro Mini Skirt', productId: 'puma-rose-mini-skirt-study' },
    ],
  },
  {
    id: 'rose-puma-track',
    button: 'Try ROSÉ · the track look',
    primaryItemId: 'puma-rose-t7-trousers',
    pieces: [
      { id: 'puma-rose-t7-trousers', name: 'PUMA x ROSÉ T7 Relaxed Track Pants', productId: 'puma-rose-t7-trousers-study' },
      { id: 'puma-rose-mesh-top', name: 'PUMA x ROSÉ Relaxed Mesh Top', productId: 'puma-rose-mesh-top-study' },
      { id: 'puma-rose-speedcat', name: 'PUMA x ROSÉ Speedcat PRM', productId: 'puma-rose-speedcat-study' },
    ],
  },
];
