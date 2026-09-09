import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { MarketMode } from '../types/listing';
import { colors, radii, spacing } from '../theme/tokens';

type Props = {
  value: MarketMode;
  onChange: (mode: MarketMode) => void;
};

const OPTIONS: { id: MarketMode; label: string }[] = [
  { id: 'rent', label: 'Rent' },
  { id: 'buy', label: 'Buy' },
];

export function ModeToggle({ value, onChange }: Props) {
  return (
    <View style={styles.wrap} accessibilityRole="tablist">
      {OPTIONS.map((opt) => {
        const active = opt.id === value;
        return (
          <Pressable
            key={opt.id}
            onPress={() => onChange(opt.id)}
            style={[styles.option, active && styles.optionActive]}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={opt.label}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: 4,
    backgroundColor: colors.creamCard,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  option: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.pill,
    alignItems: 'center',
  },
  optionActive: {
    backgroundColor: colors.forest,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.muted,
  },
  labelActive: {
    color: colors.cream,
  },
});
