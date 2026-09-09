export type MarketMode = 'rent' | 'buy';

export type GearCategory =
  | 'all'
  | 'camping'
  | 'hiking'
  | 'climbing'
  | 'water'
  | 'snow'
  | 'bikes';

export type Listing = {
  id: string;
  title: string;
  category: Exclude<GearCategory, 'all'>;
  mode: MarketMode;
  pricePerDay?: number;
  buyPrice?: number;
  distanceMiles: number;
  rating: number;
  reviewCount: number;
  ownerName: string;
  isPro: boolean;
  thumbnailTone: 'forest' | 'brown';
  description: string;
};

export const CATEGORIES: { id: GearCategory; label: string }[] = [
  { id: 'all', label: 'All gear' },
  { id: 'camping', label: 'Camping' },
  { id: 'hiking', label: 'Hiking' },
  { id: 'climbing', label: 'Climbing' },
  { id: 'water', label: 'Water' },
  { id: 'snow', label: 'Snow' },
  { id: 'bikes', label: 'Bikes' },
];

export const MOCK_LISTINGS: Listing[] = [
  {
    id: '1',
    title: '4-Person Blackout Tent',
    category: 'camping',
    mode: 'rent',
    pricePerDay: 28,
    distanceMiles: 1.2,
    rating: 4.9,
    reviewCount: 86,
    ownerName: 'Mara T.',
    isPro: true,
    thumbnailTone: 'forest',
    description:
      'Roomy blackout tent that stays cool on sunny trailheads. Sleeps four with vestibule storage for packs and muddy boots.',
  },
  {
    id: '2',
    title: '60L Alpine Backpack',
    category: 'hiking',
    mode: 'rent',
    pricePerDay: 18,
    distanceMiles: 0.6,
    rating: 4.8,
    reviewCount: 42,
    ownerName: 'Devon K.',
    isPro: false,
    thumbnailTone: 'brown',
    description:
      'Lightweight alpine pack with a ventilated harness and ice-axe loops. Ideal for overnight ridgeline trips.',
  },
  {
    id: '3',
    title: 'Inflatable Stand-Up Paddleboard',
    category: 'water',
    mode: 'rent',
    pricePerDay: 45,
    distanceMiles: 2.4,
    rating: 4.7,
    reviewCount: 31,
    ownerName: 'Jules R.',
    isPro: true,
    thumbnailTone: 'forest',
    description:
      'Stable all-around SUP with pump, leash, and backpack carry bag. Perfect for lakes and calm coastal water.',
  },
  {
    id: '4',
    title: 'Sport Climbing Quickdraw Set',
    category: 'climbing',
    mode: 'buy',
    buyPrice: 160,
    distanceMiles: 3.1,
    rating: 4.9,
    reviewCount: 19,
    ownerName: 'Casey M.',
    isPro: false,
    thumbnailTone: 'brown',
    description:
      'Set of 12 lightly used quickdraws from a local gym climber. Hardware inspected and ready for sport routes.',
  },
  {
    id: '5',
    title: 'Splitboard + Skins Package',
    category: 'snow',
    mode: 'rent',
    pricePerDay: 55,
    distanceMiles: 4.8,
    rating: 4.6,
    reviewCount: 27,
    ownerName: 'Noah P.',
    isPro: true,
    thumbnailTone: 'forest',
    description:
      'Backcountry splitboard with skins and poles. Tuned edges and a medium flex for mixed Cascade conditions.',
  },
  {
    id: '6',
    title: 'Full-Suspension Trail Bike',
    category: 'bikes',
    mode: 'buy',
    buyPrice: 980,
    distanceMiles: 1.8,
    rating: 4.5,
    reviewCount: 14,
    ownerName: 'Riley S.',
    isPro: false,
    thumbnailTone: 'brown',
    description:
      'Well-maintained trail bike with fresh pads and a recent tune. Great for green and blue Pacific Northwest trails.',
  },
  {
    id: '7',
    title: 'Ultralight Camp Stove Kit',
    category: 'camping',
    mode: 'buy',
    buyPrice: 65,
    distanceMiles: 0.9,
    rating: 4.8,
    reviewCount: 53,
    ownerName: 'Ava L.',
    isPro: false,
    thumbnailTone: 'forest',
    description:
      'Compact canister stove with windscreen and titanium pot. Barely used — selling after switching kits.',
  },
  {
    id: '8',
    title: 'Two-Person Trekking Poles',
    category: 'hiking',
    mode: 'rent',
    pricePerDay: 12,
    distanceMiles: 1.5,
    rating: 4.4,
    reviewCount: 22,
    ownerName: 'Sam W.',
    isPro: false,
    thumbnailTone: 'brown',
    description:
      'Pair of adjustable carbon poles with mud baskets. Comfortable foam grips for long approaches.',
  },
  {
    id: '9',
    title: 'Sea Kayak Day Tour Setup',
    category: 'water',
    mode: 'rent',
    pricePerDay: 70,
    distanceMiles: 5.2,
    rating: 4.9,
    reviewCount: 38,
    ownerName: 'Harper B.',
    isPro: true,
    thumbnailTone: 'forest',
    description:
      'Stable touring kayak with paddle, PFD, and spray skirt. Ideal for sheltered Puget Sound day trips.',
  },
  {
    id: '10',
    title: 'Crash Pad for Bouldering',
    category: 'climbing',
    mode: 'rent',
    pricePerDay: 22,
    distanceMiles: 2.0,
    rating: 4.7,
    reviewCount: 16,
    ownerName: 'Quinn D.',
    isPro: false,
    thumbnailTone: 'brown',
    description:
      'Thick folding crash pad with shoulder straps. Clean cover and solid foam — ready for outdoor sessions.',
  },
];

export function listingPriceLabel(listing: Listing): string {
  if (listing.mode === 'buy') {
    return `$${listing.buyPrice ?? 0}`;
  }
  return `$${listing.pricePerDay ?? 0} / day`;
}
