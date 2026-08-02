# Bivvy

Outdoor adventure gear rental marketplace for the US.  
React Native (Expo) mobile app + Node.js microservices.

## Structure

```
/
├── mobile/                  # Expo app — brand: Bivvy
├── backend/
│   ├── api-gateway/         # Public entry (security + routing)
│   ├── auth-service/        # Auth (DDD / Clean Architecture)
│   ├── core-service/        # Listings & gear (DDD)
│   └── shared/              # Shared security helpers
├── docker-compose.yml
├── ARCHITECTURE.md
└── .github/workflows/ci.yml
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for DDD layout, OWASP controls, and communication patterns.

## Quick start

```bash
cp .env.example .env
# edit secrets in .env — never commit this file

npm install
docker compose up --build
```

- API Gateway: `http://localhost:3000`
- Mobile: `cd mobile && npx expo start` (set `EXPO_PUBLIC_API_URL`)

## Tests

```bash
npm run test:backend   # Jest unit (use cases) + Supertest integration
npm run test:mobile    # Jest + React Native Testing Library
```

## Security notes

- `.env`, keys, and credentials are gitignored
- Tokens on device: Expo SecureStore
- Public client only talks to the API Gateway over HTTPS (in production)
