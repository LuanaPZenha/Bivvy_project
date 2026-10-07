import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ListingCard } from '../components/ListingCard';
import { useFavorites } from '../favorites/FavoritesContext';
import { colors, radii, spacing } from '../theme/tokens';
import type { FavoritesScreenProps } from '../navigation/types';

export function FavoritesScreen({ navigation }: FavoritesScreenProps) {
  const insets = useSafeAreaInsets();
  const { listings, removeFavorite } = useFavorites();

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </Pressable>
        <Text style={styles.topTitle}>Saved gear</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}>
        {listings.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No saved gear yet</Text>
            <Text style={styles.emptyBody}>
              Tap the heart on a listing to save it here for later.
            </Text>
          </View>
        ) : (
          listings.map((listing) => (
            <View key={listing.id}>
              <ListingCard
                listing={listing}
                onPress={() =>
                  navigation.navigate('MainTabs', {
                    screen: 'Explore',
                    params: { screen: 'ListingDetail', params: { listingId: listing.id } },
                  })
                }
              />
              <Pressable
                style={styles.remove}
                onPress={() => removeFavorite(listing.id)}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${listing.title} from saved`}
              >
                <Ionicons name="heart-dislike-outline" size={16} color={colors.danger} />
                <Text style={styles.removeText}>Remove</Text>
              </Pressable>
            </View>
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  topTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.ink,
  },
  empty: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.creamCard,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.ink,
  },
  emptyBody: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
  },
  remove: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-end',
    marginRight: spacing.md,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  removeText: {
    color: colors.danger,
    fontWeight: '700',
    fontSize: 13,
  },
});
