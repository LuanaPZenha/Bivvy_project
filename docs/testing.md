# Testing

## Server

Node's built-in test runner:

```bash
cd server && npm test
```

Covers health, sorted near feed, and an end-to-end register → list → book → pay → chat → complete → review path.

## Web

Manual smoke in the browser (Vite or production static). Automated UI tests are Planned.
