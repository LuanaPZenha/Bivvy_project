import React from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { HomeHeader } from '../components/HomeHeader';
import { CategoryChips } from '../components/CategoryChips';
import { ModeToggle } from '../components/ModeToggle';
import { ProBanner } from '../components/ProBanner';
import { ListingCard } from '../components/ListingCard';
import { useListings } from '../hooks/useListings';
import { useCart } from '../cart/CartContext';
import { useRootNavigation } from '../navigation/useRootNavigation';
import { labelForZip, nextSeattleZip } from '../data/seattleZips';
import { colors, spacing } from '../theme/tokens';
import type { HomeScreenProps } from '../navigation/types';

export function HomeScreen({ navigation }: HomeScreenProps) {
  const {
    category,
    setCategory,
    mode,
    setMode,
    query,
    setQuery,
    zipCode,
    setZipCode,
    listings,
    count,
    isLoading,
    usingFallback,
    reload,
  } = useListings();
  const { count: cartCount } = useCart();
  const rootNav = useRootNavigation();

  const locationLabel = labelForZip(zipCode);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <HomeHeader
        locationLabel={locationLabel}
        searchValue={query}
        onSearchChange={setQuery}
        onLocationPress={() => setZipCode(nextSeattleZip(zipCode))}
        onCartPress={() => rootNav.navigate('Cart')}
        cartCount={cartCount}
      />
      <ModeToggle value={mode} onChange={setMode} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {usingFallback ? (
          <Pressable
            style={styles.offlineBanner}
            onPress={reload}
            accessibilityRole="button"
            accessibilityLabel="Offline mode. Showing saved listings. Tap to retry."
          >
            <Text style={styles.offlineTitle}>Offline mode</Text>
            <Text style={styles.offlineBody}>Showing saved listings. Tap to retry.</Text>
          </Pressable>
        ) : null}

        <CategoryChips selected={category} onSelect={setCategory} />
        <ProBanner />
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>NEAR YOU</Text>
          <Text style={styles.sectionMeta}>
            {isLoading ? 'Loading…' : `${count} listing${count === 1 ? '' : 's'}`}
          </Text>
        </View>
        {isLoading && listings.length === 0 ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.forest} />
          </View>
        ) : listings.length === 0 ? (
          <View style={styles.empty} accessibilityLabel="No listings found">
            <Text style={styles.emptyTitle}>No gear nearby</Text>
            <Text style={styles.emptyBody}>
              Try another category, ZIP, or switch between Rent and Buy.
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
  offlineBanner: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: '#FFF6E5',
    borderWidth: 1,
    borderColor: colors.gold,
  },
  offlineTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: 2,
  },
  offlineBody: {
    fontSize: 13,
    color: colors.muted,
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
  loading: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
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
