import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { HomeHeader } from '../components/HomeHeader';
import { CategoryChips } from '../components/CategoryChips';
import { ModeToggle } from '../components/ModeToggle';
import { ProBanner } from '../components/ProBanner';
import { ListingCard } from '../components/ListingCard';
import { useListings } from '../hooks/useListings';
import { colors, spacing } from '../theme/tokens';
import type { HomeScreenProps } from '../navigation/types';

export function HomeScreen({ navigation }: HomeScreenProps) {
  const { category, setCategory, mode, setMode, query, setQuery, listings, count } = useListings();

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <HomeHeader locationLabel="Fremont, Seattle" searchValue={query} onSearchChange={setQuery} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ModeToggle value={mode} onChange={setMode} />
        <CategoryChips selected={category} onSelect={setCategory} />
        <ProBanner />
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>NEAR YOU</Text>
          <Text style={styles.sectionMeta}>
            {count} listing{count === 1 ? '' : 's'}
          </Text>
        </View>
        {listings.length === 0 ? (
          <View style={styles.empty} accessibilityLabel="No listings found">
            <Text style={styles.emptyTitle}>No gear nearby</Text>
            <Text style={styles.emptyBody}>
              Try another category or switch between Rent and Buy.
            </Text>
          </View>
        ) : (
          listings.map((item) => (
            <ListingCard
              key={item.id}
              listing={item}
              onPress={() => navigation.navigate('ListingDetail', { listingId: item.id })}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  sectionHeader: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: colors.ink,
  },
  sectionMeta: {
    fontSize: 13,
    color: colors.muted,
  },
  empty: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: 16,
    backgroundColor: colors.creamCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 6,
  },
  emptyBody: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
  },
});
