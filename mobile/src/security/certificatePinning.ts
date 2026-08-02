/**
 * Certificate pinning guidelines (production follow-up).
 *
 * When shipping to App Store / Play Store:
 * 1. Prefer a custom native networking layer or a maintained pinning library.
 * 2. Pin the leaf or intermediate CA for api.bivvy.com (TBD).
 * 3. Include backup pins and a remote kill-switch for pin rotation.
 * 4. Do NOT pin in Expo Go; only in custom/dev-client or EAS production builds.
 *
 * This module is a documented hook — implementation lands with production HTTPS.
 */
export const CERTIFICATE_PINNING = {
  enabled: false,
  hosts: [] as string[],
  notes: 'Enable only in release builds with rotated backup pins.',
};
