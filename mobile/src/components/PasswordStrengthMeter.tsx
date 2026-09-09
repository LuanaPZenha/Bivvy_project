import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { passwordStrength } from '../utils/validation';
import { colors, radii, spacing } from '../theme/tokens';

const LABELS = {
  weak: 'Weak',
  fair: 'Fair',
  strong: 'Strong',
} as const;

const FILLED_BARS = {
  weak: 1,
  fair: 2,
  strong: 3,
} as const;

export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;

  const strength = passwordStrength(password);
  const filled = FILLED_BARS[strength];
  const tone = strength === 'weak' ? colors.danger : strength === 'fair' ? colors.gold : colors.forest;

  return (
    <View style={styles.wrap} accessibilityLabel={`Password strength: ${LABELS[strength]}`}>
      <View style={styles.bars}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[styles.bar, { backgroundColor: i < filled ? tone : colors.border }]}
          />
        ))}
      </View>
      <Text style={[styles.label, { color: tone }]}>{LABELS[strength]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  bars: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
  },
  bar: {
    flex: 1,
    height: 4,
    borderRadius: radii.pill,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
});
