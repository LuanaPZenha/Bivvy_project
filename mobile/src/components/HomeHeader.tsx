import React from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PineLogo } from './PineLogo';
import { colors, radii, spacing } from '../theme/tokens';

type Props = {
  locationLabel: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onFilterPress?: () => void;
  onLocationPress?: () => void;
};

export function HomeHeader({
  locationLabel,
  searchValue,
  onSearchChange,
  onFilterPress,
  onLocationPress,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.topRow}>
        <View style={styles.brand}>
          <PineLogo />
          <Text style={styles.brandName}>BIVVY</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Notifications" hitSlop={12}>
          <View>
            <Ionicons name="notifications-outline" size={24} color={colors.cream} />
            <View style={styles.badge} />
          </View>
        </Pressable>
      </View>

      <Pressable
        style={styles.locationRow}
        onPress={onLocationPress}
        accessibilityRole="button"
        accessibilityLabel={`Picking up near ${locationLabel}`}
      >
        <Ionicons name="location-sharp" size={16} color={colors.gold} />
        <Text style={styles.locationText}>
          Picking up near <Text style={styles.locationStrong}>{locationLabel}</Text>
        </Text>
        <Ionicons name="chevron-down" size={14} color={colors.cream} />
      </Pressable>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tents, kayaks, skis..."
            placeholderTextColor={colors.muted}
            value={searchValue}
            onChangeText={onSearchChange}
            autoCorrect={false}
            accessibilityLabel="Search gear"
          />
        </View>
        <Pressable
          style={styles.filterBtn}
          onPress={onFilterPress}
          accessibilityRole="button"
          accessibilityLabel="Filters"
        >
          <Ionicons name="options-outline" size={20} color={colors.forest} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.forest,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandName: {
    color: colors.cream,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.md,
  },
  locationText: {
    color: colors.cream,
    fontSize: 14,
    flexShrink: 1,
  },
  locationStrong: {
    fontWeight: '700',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.creamCard,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.ink,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
