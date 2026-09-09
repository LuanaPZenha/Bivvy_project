CREATE TABLE IF NOT EXISTS listings (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('rent', 'buy')),
  price_per_day NUMERIC(10, 2),
  buy_price NUMERIC(10, 2),
  distance_miles NUMERIC(8, 2) NOT NULL DEFAULT 0,
  rating NUMERIC(3, 2) NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  owner_name TEXT NOT NULL,
  owner_id TEXT,
  is_pro BOOLEAN NOT NULL DEFAULT FALSE,
  location TEXT NOT NULL DEFAULT 'Seattle, WA',
  zip_code TEXT NOT NULL DEFAULT '98103',
  latitude DOUBLE PRECISION NOT NULL DEFAULT 47.61,
  longitude DOUBLE PRECISION NOT NULL DEFAULT -122.33,
  thumbnail_tone TEXT NOT NULL DEFAULT 'forest',
  description TEXT NOT NULL DEFAULT '',
  blocked_dates JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listings_category ON listings (category);
CREATE INDEX IF NOT EXISTS idx_listings_mode ON listings (mode);
CREATE INDEX IF NOT EXISTS idx_listings_owner ON listings (owner_id);

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL,
  renter_id TEXT NOT NULL,
  renter_name TEXT NOT NULL,
  owner_id TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('requested', 'accepted', 'declined', 'cancelled', 'completed')),
  pricing JSONB NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  payment JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_renter ON bookings (renter_id);
CREATE INDEX IF NOT EXISTS idx_bookings_owner ON bookings (owner_id);
CREATE INDEX IF NOT EXISTS idx_bookings_listing ON bookings (listing_id);
