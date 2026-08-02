export type GearCategory = 'all' | 'camping' | 'backpacks' | 'water';

export type Listing = {
  id: string;
  title: string;
  category: Exclude<GearCategory, 'all'>;
  pricePerDay: number;
  distanceMiles: number;
  rating: number;
  reviewCount: number;
  ownerName: string;
  isPro: boolean;
  thumbnailTone: 'forest' | 'brown';
};

export const CATEGORIES: { id: GearCategory; label: string }[] = [
  { id: 'all', label: 'All gear' },
  { id: 'camping', label: 'Camping' },
  { id: 'backpacks', label: 'Backpacks' },
  { id: 'water', label: 'Water' },
];

export const MOCK_LISTINGS: Listing[] = [
  {
    id: '1',
    title: '4-Person Blackout Tent',
    category: 'camping',
    pricePerDay: 28,
    distanceMiles: 1.2,
    rating: 4.9,
    reviewCount: 86,
    ownerName: 'Mara T.',
    isPro: true,
    thumbnailTone: 'forest',
  },
  {
    id: '2',
    title: '60L Alpine Backpack',
    category: 'backpacks',
    pricePerDay: 18,
    distanceMiles: 0.6,
    rating: 4.8,
    reviewCount: 42,
    ownerName: 'Devon K.',
    isPro: false,
    thumbnailTone: 'brown',
  },
];
