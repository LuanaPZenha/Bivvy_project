# Gear & Listings API

Listing discovery and creation via the API Gateway.

## GET `/api/gear/near`

Return nearby gear listings. **Public** (no JWT) in the bootstrap.

### Query parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `category` | string | `all` | `all` \| `camping` \| `backpacks` \| `water` |
| `maxDistance` | number | `25` | Max distance in miles |

### Example

```bash
curl "http://localhost:3000/api/gear/near?category=camping&maxDistance=10"
```

### Response **200**

```json
{
  "count": 1,
  "listings": [
    {
      "id": "lst_tent_1",
      "title": "4-Person Blackout Tent",
      "category": "camping",
      "pricePerDay": 28,
      "distanceMiles": 1.2,
      "rating": 4.9,
      "reviewCount": 86,
      "ownerName": "Mara T.",
      "isPro": true,
      "location": "Seattle, WA"
    }
  ]
}
```

---

## POST `/api/listings`

Create a listing. **Requires** `Authorization: Bearer <accessToken>` at the gateway.

### Request

```json
{
  "title": "Inflatable Kayak",
  "category": "water",
  "pricePerDay": 35,
  "distanceMiles": 2.1,
  "ownerName": "Sam R.",
  "isPro": false,
  "location": "Seattle, WA"
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `title` | Yes | Listing title |
| `pricePerDay` | Yes | Number |
| `category` | No | Defaults to `camping` |
| `distanceMiles` | No | Defaults to `0` |
| `ownerName` | No | Defaults to `You` |
| `isPro` | No | Boolean |
| `location` | No | Defaults to `Seattle, WA` |

### Responses

**201 Created** — listing object (includes generated `id`).

| Status | Error | When |
|--------|-------|------|
| 401 | `Unauthorized` / `Invalid or expired token` | Missing/bad JWT at gateway |
| 500 | `Internal server error` / `Listing requires title and pricePerDay` | Domain validation failure* |

\*Domain errors currently may surface as 500 depending on error mapping — improving to 400 is **Planned**.

---

## Seed data (Bootstrap)

Core ships with two in-memory listings used by the mobile home screen mock parity:

1. `4-Person Blackout Tent` (Pro, camping)
2. `60L Alpine Backpack` (backpacks)

See [Core Service](../services/core-service.md).
