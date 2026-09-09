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
  ownerId?: string | null;
  isPro: boolean;
  location?: string;
  zipCode?: string;
  thumbnailTone: 'forest' | 'brown';
  description: string;
  blockedDates?: string[];
};

export type BookingStatus =
  | 'requested'
  | 'accepted'
  | 'declined'
  | 'cancelled'
  | 'completed';

export type BookingPricing = {
  currency: string;
  days: number;
  dailyRate: number | null;
  subtotal: number;
  serviceFee: number;
  serviceFeeRate: number;
  tax: number;
  taxRate: number;
  total: number;
};

export type BookingPayment = {
  provider: string;
  status: string;
  currency: string;
  amount: number;
  transactionId: string;
  paidAt: string;
};

export type Booking = {
  id: string;
  listingId: string;
  renterId: string;
  renterName: string;
  ownerId?: string | null;
  startDate: string;
  endDate: string;
  status: BookingStatus;
  pricing: BookingPricing;
  message: string;
  payment?: BookingPayment | null;
  createdAt?: string;
  updatedAt?: string;
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

const ALLOWED_CATEGORIES = new Set([
  'camping',
  'hiking',
  'climbing',
  'water',
  'snow',
  'bikes',
]);

export function normalizeListing(raw: unknown): Listing {
  const item = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const mode = item.mode === 'buy' ? 'buy' : 'rent';
  const categoryRaw = String(item.category || 'camping').toLowerCase();
  const category = (
    ALLOWED_CATEGORIES.has(categoryRaw) ? categoryRaw : 'camping'
  ) as Listing['category'];
  const tone = item.thumbnailTone === 'brown' ? 'brown' : 'forest';

  return {
    id: String(item.id || ''),
    title: String(item.title || 'Untitled gear'),
    category,
    mode,
    pricePerDay:
      item.pricePerDay == null || Number.isNaN(Number(item.pricePerDay))
        ? undefined
        : Number(item.pricePerDay),
    buyPrice:
      item.buyPrice == null || Number.isNaN(Number(item.buyPrice))
        ? undefined
        : Number(item.buyPrice),
    distanceMiles: Number(item.distanceMiles) || 0,
    rating: Number(item.rating) || 0,
    reviewCount: Number(item.reviewCount) || 0,
    ownerName: String(item.ownerName || 'Owner'),
    ownerId: item.ownerId == null ? null : String(item.ownerId),
    isPro: Boolean(item.isPro),
    location: item.location == null ? undefined : String(item.location),
    zipCode: item.zipCode == null ? undefined : String(item.zipCode),
    thumbnailTone: tone,
    description: String(item.description || ''),
    blockedDates: Array.isArray(item.blockedDates)
      ? item.blockedDates.map((d) => String(d))
      : [],
  };
}

export const MOCK_LISTINGS: Listing[] = [
  {
    id: 'lst_tent_1',
    title: '4-Person Blackout Tent',
    category: 'camping',
    mode: 'rent',
    pricePerDay: 28,
    distanceMiles: 1.2,
    rating: 4.9,
    reviewCount: 86,
    ownerName: 'Mara T.',
    ownerId: 'owner_mara',
    isPro: true,
    location: 'Fremont, Seattle',
    zipCode: '98103',
    thumbnailTone: 'forest',
    description:
      'Roomy blackout tent that stays cool on sunny trailheads. Sleeps four with vestibule storage for packs and muddy boots.',
    blockedDates: [],
  },
  {
    id: 'lst_pack_1',
    title: '60L Alpine Backpack',
    category: 'hiking',
    mode: 'rent',
    pricePerDay: 18,
    distanceMiles: 0.6,
    rating: 4.8,
    reviewCount: 42,
    ownerName: 'Devon K.',
    ownerId: 'owner_devon',
    isPro: false,
    location: 'Ballard, Seattle',
    zipCode: '98107',
    thumbnailTone: 'brown',
    description:
      'Lightweight alpine pack with a ventilated harness and ice-axe loops. Ideal for overnight ridgeline trips.',
    blockedDates: [],
  },
  {
    id: 'lst_sup_1',
    title: 'Inflatable Stand-Up Paddleboard',
    category: 'water',
    mode: 'rent',
    pricePerDay: 45,
    distanceMiles: 2.4,
    rating: 4.7,
    reviewCount: 31,
    ownerName: 'Jules R.',
    ownerId: 'owner_jules',
    isPro: true,
    location: 'Queen Anne, Seattle',
    zipCode: '98119',
    thumbnailTone: 'forest',
    description:
      'Stable all-around SUP with pump, leash, and backpack carry bag. Perfect for lakes and calm coastal water.',
    blockedDates: [],
  },
  {
    id: 'lst_draws_1',
    title: 'Sport Climbing Quickdraw Set',
    category: 'climbing',
    mode: 'buy',
    buyPrice: 160,
    distanceMiles: 3.1,
    rating: 4.9,
    reviewCount: 19,
    ownerName: 'Casey M.',
    ownerId: 'owner_casey',
    isPro: false,
    location: 'Capitol Hill, Seattle',
    zipCode: '98102',
    thumbnailTone: 'brown',
    description:
      'Set of 12 lightly used quickdraws from a local gym climber. Hardware inspected and ready for sport routes.',
    blockedDates: [],
  },
  {
    id: 'lst_split_1',
    title: 'Splitboard + Skins Package',
    category: 'snow',
    mode: 'rent',
    pricePerDay: 55,
    distanceMiles: 4.8,
    rating: 4.6,
    reviewCount: 27,
    ownerName: 'Noah P.',
    ownerId: 'owner_noah',
    isPro: true,
    location: 'Wedgwood, Seattle',
    zipCode: '98115',
    thumbnailTone: 'forest',
    description:
      'Backcountry splitboard with skins and poles. Tuned edges and a medium flex for mixed Cascade conditions.',
    blockedDates: [],
  },
  {
    id: 'lst_bike_1',
    title: 'Full-Suspension Trail Bike',
    category: 'bikes',
    mode: 'buy',
    buyPrice: 980,
    distanceMiles: 1.8,
    rating: 4.5,
    reviewCount: 14,
    ownerName: 'Riley S.',
    ownerId: 'owner_riley',
    isPro: false,
    location: 'Magnolia, Seattle',
    zipCode: '98199',
    thumbnailTone: 'brown',
    description:
      'Well-maintained trail bike with fresh pads and a recent tune. Great for green and blue Pacific Northwest trails.',
    blockedDates: [],
  },
  {
    id: 'lst_stove_1',
    title: 'Ultralight Camp Stove Kit',
    category: 'camping',
    mode: 'buy',
    buyPrice: 65,
    distanceMiles: 0.9,
    rating: 4.8,
    reviewCount: 53,
    ownerName: 'Ava L.',
    ownerId: 'owner_ava',
    isPro: false,
    location: 'Fremont, Seattle',
    zipCode: '98103',
    thumbnailTone: 'forest',
    description:
      'Compact canister stove with windscreen and titanium pot. Barely used — selling after switching kits.',
    blockedDates: [],
  },
  {
    id: 'lst_poles_1',
    title: 'Two-Person Trekking Poles',
    category: 'hiking',
    mode: 'rent',
    pricePerDay: 12,
    distanceMiles: 1.5,
    rating: 4.4,
    reviewCount: 22,
    ownerName: 'Sam W.',
    ownerId: 'owner_sam',
    isPro: false,
    location: 'University District, Seattle',
    zipCode: '98105',
    thumbnailTone: 'brown',
    description:
      'Pair of adjustable carbon poles with mud baskets. Comfortable foam grips for long approaches.',
    blockedDates: [],
  },
  {
    id: 'lst_kayak_1',
    title: 'Sea Kayak Day Tour Setup',
    category: 'water',
    mode: 'rent',
    pricePerDay: 70,
    distanceMiles: 5.2,
    rating: 4.9,
    reviewCount: 38,
    ownerName: 'Harper B.',
    ownerId: 'owner_harper',
    isPro: true,
    location: 'Lake City, Seattle',
    zipCode: '98125',
    thumbnailTone: 'forest',
    description:
      'Stable touring kayak with paddle, PFD, and spray skirt. Ideal for sheltered Puget Sound day trips.',
    blockedDates: [],
  },
  {
    id: 'lst_pad_1',
    title: 'Crash Pad for Bouldering',
    category: 'climbing',
    mode: 'rent',
    pricePerDay: 22,
    distanceMiles: 2.0,
    rating: 4.7,
    reviewCount: 16,
    ownerName: 'Quinn D.',
    ownerId: 'owner_quinn',
    isPro: false,
    location: 'Central District, Seattle',
    zipCode: '98122',
    thumbnailTone: 'brown',
    description:
      'Thick folding crash pad with shoulder straps. Clean cover and solid foam — ready for outdoor sessions.',
    blockedDates: [],
  },
];

export function listingPriceLabel(listing: Listing): string {
  if (listing.mode === 'buy') {
    return `$${listing.buyPrice ?? 0}`;
  }
  return `$${listing.pricePerDay ?? 0} / day`;
}

export function filterMockListings(opts: {
  category?: GearCategory;
  mode?: MarketMode;
  query?: string;
}): Listing[] {
  const category = opts.category || 'all';
  const mode = opts.mode || 'rent';
  const q = (opts.query || '').trim().toLowerCase();
  return MOCK_LISTINGS.filter((item) => {
    const modeOk = item.mode === mode;
    const catOk = category === 'all' || item.category === category;
    const queryOk = !q || item.title.toLowerCase().includes(q);
    return modeOk && catOk && queryOk;
  });
}
