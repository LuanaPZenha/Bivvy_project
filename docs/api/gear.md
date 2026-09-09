# Gear & Listings API

Listing discovery, creation, quotes, and bookings via the API Gateway.

## GET `/api/gear/near`

Return nearby gear listings. **Public** (no JWT).

### Query parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `category` | string | `all` | `all` \| `camping` \| `hiking` \| `climbing` \| `water` \| `snow` \| `bikes` |
| `mode` | string | `all` | `all` \| `rent` \| `buy` |
| `q` / `query` | string | _(empty)_ | Case-insensitive search |
| `maxDistance` | number | `25` | Max distance in miles |
| `zip` / `zipCode` | string | _(none)_ | Recalculate distance from a Seattle-area ZIP |

### Response **200**

```json
{
  "count": 1,
  "zipCode": "98103",
  "listings": [
    {
      "id": "lst_tent_1",
      "title": "4-Person Blackout Tent",
      "category": "camping",
      "mode": "rent",
      "pricePerDay": 28,
      "buyPrice": null,
      "distanceMiles": 1.2,
      "rating": 4.9,
      "reviewCount": 86,
      "ownerName": "Mara T.",
      "ownerId": "owner_mara",
      "isPro": true,
      "location": "Fremont, Seattle",
      "zipCode": "98103",
      "thumbnailTone": "forest",
      "description": "Roomy blackout tent…"
    }
  ]
}
```

---

## GET `/api/gear/:id`

Return a single listing. **Public**. Returns **404** when unknown.

---

## POST `/api/gear/:id/quote`

Price a rental or buy without creating a booking. **Public**.

```json
{ "startDate": "2026-09-20", "endDate": "2026-09-23" }
```

Response includes `pricing` with `days`, `subtotal`, `serviceFee` (10%), `tax` (~8.05%), and `total`.

---

## POST `/api/listings`

Create a listing. **Requires** `Authorization: Bearer <accessToken>`.
Gateway forwards `X-User-Id` / `X-User-Email` / `X-User-Role` / `X-User-Name` to Core.

Rent listings require `pricePerDay`. Buy listings require `buyPrice`. Domain validation failures return **400**.

---

## GET `/api/listings/mine`

Listings owned by the authenticated user. **Requires JWT**.

---

## Bookings

### POST `/api/bookings` (JWT)

```json
{
  "listingId": "lst_tent_1",
  "startDate": "2026-09-20",
  "endDate": "2026-09-23",
  "message": "Need it for a weekend trek."
}
```

Creates a `requested` booking. Rejects overlaps (**409**) and self-booking (**400**).

### GET `/api/bookings` (JWT)

Bookings where the caller is the renter or the owner.

### PATCH `/api/bookings/:id` (JWT)

```json
{ "status": "accepted" }
```

Owners: `accepted` / `declined` / `completed`. Renters or owners: `cancelled` when allowed.

### POST `/api/bookings/:id/checkout` (JWT)

Simulated checkout for an **accepted** booking (renter only). Marks `completed` and attaches a `bivvy_sim` payment receipt.

---

## Seed data (Bootstrap)

Core ships with ten Seattle-area listings (rent + buy) aligned with the mobile catalog.
