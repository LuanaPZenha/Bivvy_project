import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Listing, listingPriceLabel } from '../types/listing';
import { colors, radii, spacing } from '../theme/tokens';

type Props = {
  listing: Listing;
  onPress?: () => void;
};

function categoryIcon(category: Listing['category']): keyof typeof Ionicons.glyphMap {
  switch (category) {
    case 'camping':
      return 'bonfire-outline';
    case 'hiking':
      return 'walk-outline';
    case 'climbing':
      return 'trail-sign-outline';
    case 'water':
      return 'boat-outline';
    case 'snow':
      return 'snow-outline';
    case 'bikes':
      return 'bicycle-outline';
    default:
      return 'cube-outline';
  }
}

export function ListingCard({ listing, onPress }: Props) {
  const thumbBg = listing.thumbnailTone === 'forest' ? colors.forestMid : '#6B4F3A';

  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={listing.title}
    >
      <View style={[styles.thumb, { backgroundColor: thumbBg }]}>
        <Ionicons name={categoryIcon(listing.category)} size={36} color={colors.cream} />
        {listing.isPro ? (
          <View style={styles.proBadge}>
            <Text style={styles.proText}>PRO</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {listing.title}
        </Text>

        <View style={styles.ownerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>{listing.ownerName.charAt(0)}</Text>
          </View>
          <Text style={styles.ownerName}>{listing.ownerName}</Text>
          <Text style={styles.modeTag}>{listing.mode === 'rent' ? 'Rent' : 'Buy'}</Text>
        </View>

        <View style={styles.ratingRow}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Ionicons
              key={i}
              name={i < Math.round(listing.rating) ? 'star' : 'star-outline'}
              size={12}
              color={colors.star}
            />
          ))}
          <Text style={styles.ratingText}>
            {listing.rating.toFixed(1)} ({listing.reviewCount})
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.price}>{listingPriceLabel(listing)}</Text>
          <View style={styles.distance}>
            <Ionicons name="location-sharp" size={12} color={colors.muted} />
            <Text style={styles.distanceText}>{listing.distanceMiles.toFixed(1)} mi</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.creamCard,
    borderRadius: radii.lg,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumb: {
    width: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.gold,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  proText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.forest,
  },
  body: {
    flex: 1,
    padding: spacing.md,
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.forestMid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: colors.cream,
    fontSize: 11,
    fontWeight: '700',
  },
  ownerName: {
    color: colors.muted,
    fontSize: 13,
    flex: 1,
  },
  modeTag: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.forest,
    backgroundColor: colors.goldSoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    marginLeft: 6,
    fontSize: 12,
    color: colors.muted,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.ink,
  },
  distance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    fontSize: 12,
    color: colors.muted,
  },
});
