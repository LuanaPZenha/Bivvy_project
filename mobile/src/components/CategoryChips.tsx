import React from 'react';
import { ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import { CATEGORIES, GearCategory } from '../types/listing';
import { colors, radii, spacing } from '../theme/tokens';

type Props = {
  selected: GearCategory;
  onSelect: (id: GearCategory) => void;
};

export function CategoryChips({ selected, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityRole="tablist"
    >
      {CATEGORIES.map((cat) => {
        const active = cat.id === selected;
        return (
          <Pressable
            key={cat.id}
            onPress={() => onSelect(cat.id)}
            style={[styles.chip, active ? styles.chipActive : styles.chipIdle]}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={cat.label}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{cat.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: colors.chipActive,
    borderColor: colors.chipActive,
  },
  chipIdle: {
    backgroundColor: colors.chipIdle,
    borderColor: colors.border,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
  },
  labelActive: {
    color: colors.cream,
  },
});
