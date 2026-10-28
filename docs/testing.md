# Testing

## Server

Node's built-in test runner:

```bash
cd server && npm test
```

Covers health, sorted near feed, and an end-to-end register → list → book → pay → chat → complete → review path.

## Web

Open http://localhost:3000 after `npm start` and walk explore → listing → sign in. Automated UI tests are Planned.
