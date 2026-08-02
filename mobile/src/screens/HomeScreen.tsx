import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { HomeHeader } from '../components/HomeHeader';
import { CategoryChips } from '../components/CategoryChips';
import { ProBanner } from '../components/ProBanner';
import { ListingCard } from '../components/ListingCard';
import { useListings } from '../hooks/useListings';
import { colors, spacing } from '../theme/tokens';

export function HomeScreen() {
  const { category, setCategory, query, setQuery, listings, count } = useListings();

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <HomeHeader locationLabel="Fremont, Seattle" searchValue={query} onSearchChange={setQuery} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <CategoryChips selected={category} onSelect={setCategory} />
        <ProBanner />
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>NEAR YOU</Text>
          <Text style={styles.sectionMeta}>
            {count} listing{count === 1 ? '' : 's'}
          </Text>
        </View>
        {listings.map((item) => (
          <ListingCard key={item.id} listing={item} />
        ))}
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
    marginTop: spacing.lg,
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
});
