import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing } from '../theme/tokens';

export type SortOption = 'distance' | 'price_asc' | 'price_desc' | 'rating';

export const DISTANCE_OPTIONS = [5, 10, 25, 50] as const;

export const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'distance', label: 'Nearest' },
  { id: 'price_asc', label: 'Price: low to high' },
  { id: 'price_desc', label: 'Price: high to low' },
  { id: 'rating', label: 'Top rated' },
];

type Props = {
  visible: boolean;
  maxDistance: number;
  sortBy: SortOption;
  onChangeMaxDistance: (miles: number) => void;
  onChangeSortBy: (sort: SortOption) => void;
  onClose: () => void;
  onApply: () => void;
};

export function FilterSheet({
  visible,
  maxDistance,
  sortBy,
  onChangeMaxDistance,
  onChangeSortBy,
  onClose,
  onApply,
}: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close filters" />
      <View style={styles.sheet} accessibilityViewIsModal>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>Filters</Text>
          <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
            <Ionicons name="close" size={22} color={colors.ink} />
          </Pressable>
        </View>

        <Text style={styles.label}>Max distance</Text>
        <View style={styles.row}>
          {DISTANCE_OPTIONS.map((miles) => {
            const active = maxDistance === miles;
            return (
              <Pressable
                key={miles}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => onChangeMaxDistance(miles)}
                accessibilityRole="button"
                accessibilityLabel={`${miles} miles`}
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{miles} mi</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Sort by</Text>
        <View style={styles.col}>
          {SORT_OPTIONS.map((opt) => {
            const active = sortBy === opt.id;
            return (
              <Pressable
                key={opt.id}
                style={[styles.sortRow, active && styles.sortRowActive]}
                onPress={() => onChangeSortBy(opt.id)}
                accessibilityRole="button"
                accessibilityLabel={opt.label}
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.sortText, active && styles.sortTextActive]}>{opt.label}</Text>
                {active ? <Ionicons name="checkmark" size={18} color={colors.forest} /> : null}
              </Pressable>
            );
          })}
        </View>

        <Pressable
          style={styles.apply}
          onPress={onApply}
          accessibilityRole="button"
          accessibilityLabel="Apply filters"
        >
          <Text style={styles.applyText}>Show results</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 28, 22, 0.45)',
  },
  sheet: {
    backgroundColor: colors.cream,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.sm,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.ink,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 8,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.md,
  },
  chip: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.creamCard,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipActive: {
    backgroundColor: colors.chipActive,
    borderColor: colors.chipActive,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
  },
  chipTextActive: {
    color: colors.cream,
  },
  col: {
    gap: 8,
    marginBottom: spacing.lg,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    backgroundColor: colors.creamCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortRowActive: {
    borderColor: colors.forest,
    backgroundColor: colors.goldSoft,
  },
  sortText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
  },
  sortTextActive: {
    color: colors.forest,
    fontWeight: '800',
  },
  apply: {
    backgroundColor: colors.forest,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  applyText: {
    color: colors.cream,
    fontWeight: '800',
    fontSize: 15,
  },
});
