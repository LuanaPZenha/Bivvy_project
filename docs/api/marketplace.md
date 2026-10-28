# Marketplace API

## Discovery

### GET `/api/listings/near`

Query: `category`, `mode`, `q`, `maxDistance`, `zip`, `sort` (`distance` \| `price_asc` \| `price_desc` \| `rating`).

### GET `/api/listings/:id`

### POST `/api/listings/:id/quote`

Rent requires `startDate` / `endDate` (`YYYY-MM-DD`).

### GET `/api/listings/:id/reviews`

## Listings (JWT)

- `GET /api/listings/mine`
- `POST /api/listings`
- `PATCH /api/listings/:id` (includes `blockedDates`)
- `DELETE /api/listings/:id`
- `POST /api/listings/:id/reviews` — body `{ bookingId, rating, comment }` after `completed`

## Bookings (JWT)

- `POST /api/bookings` — create request
- `GET /api/bookings` — renter or owner, includes `listing` summary
- `PATCH /api/bookings/:id` — `{ status }`
- `POST /api/bookings/:id/checkout/intent` — simulated PaymentIntent
- `POST /api/bookings/:id/checkout` — confirm pay → status `paid`
- `GET|POST /api/bookings/:id/messages` — booking chat

## Cart (JWT)

### POST `/api/cart/checkout`

```json
{ "listingIds": ["lst_stove_1"], "message": "Cart checkout" }
```

Creates buy booking requests (not a charge).
