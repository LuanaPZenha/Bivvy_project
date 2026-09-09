import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchListingById } from '../services/api';
import { Listing, MOCK_LISTINGS, listingPriceLabel } from '../types/listing';
import { primaryListingImageUrl } from '../utils/listingImages';
import { useCart } from '../cart/CartContext';
import { useRootNavigation } from '../navigation/useRootNavigation';
import { colors, radii, spacing } from '../theme/tokens';
import type { ListingDetailScreenProps } from '../navigation/types';

export function ListingDetailScreen({ navigation, route }: ListingDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const listingId = route.params.listingId;
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem, hasItem } = useCart();
  const rootNav = useRootNavigation();

  useEffect(() => {
    const parent = navigation.getParent();
    parent?.setOptions({ tabBarStyle: { display: 'none' } });
    return () => {
      parent?.setOptions({
        tabBarStyle: {
          backgroundColor: colors.creamCard,
          borderTopColor: colors.border,
          zIndex: 30,
          elevation: 30,
        },
      });
    };
  }, [navigation]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const remote = await fetchListingById(listingId);
        if (!cancelled) setListing(remote);
      } catch {
        const fallback = MOCK_LISTINGS.find((item) => item.id === listingId) || null;
        if (!cancelled) setListing(fallback);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [listingId]);

  if (loading) {
    return (
      <View style={[styles.root, styles.centered]}>
        <ActivityIndicator color={colors.forest} />
      </View>
    );
  }

  if (!listing) {
    return (
      <View style={[styles.root, styles.centered]}>
        <Text style={styles.missing}>Listing not found</Text>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button">
          <Text style={styles.backLink}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const thumbBg = listing.thumbnailTone === 'forest' ? colors.forestMid : '#6B4F3A';
  const imageUri = primaryListingImageUrl(listing);
  const inCart = hasItem(listing.id);

  const onRent = () => {
    navigation.navigate('BookingRequest', { listingId: listing.id });
  };

  const onBuyNow = () => {
    navigation.navigate('BookingRequest', { listingId: listing.id });
  };

  const onAddToCart = () => {
    const result = addItem(listing);
    if (!result.ok) {
      Alert.alert('Cannot add to cart', result.error);
      return;
    }
    // Alert.alert is unreliable on RN Web; go straight to cart there.
    if (Platform.OS === 'web') {
      rootNav.navigate('Cart');
      return;
    }
    Alert.alert('Added to cart', listing.title, [
      { text: 'Keep browsing', style: 'cancel' },
      { text: 'View cart', onPress: () => rootNav.navigate('Cart') },
    ]);
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 140 }}>
        <View style={[styles.hero, { backgroundColor: thumbBg, paddingTop: insets.top + spacing.sm }]}>
          <Pressable
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={22} color={colors.cream} />
          </Pressable>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <Ionicons name="cube-outline" size={72} color={colors.cream} />
          )}
          {listing.isPro ? (
            <View style={styles.proBadge}>
              <Text style={styles.proText}>PRO</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.content}>
          <Text style={styles.mode}>{listing.mode === 'rent' ? 'For rent' : 'For sale'}</Text>
          <Text style={styles.title}>{listing.title}</Text>
          <Text style={styles.price}>{listingPriceLabel(listing)}</Text>

          <View style={styles.ownerRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarLetter}>{listing.ownerName.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.ownerName}>{listing.ownerName}</Text>
              <Text style={styles.meta}>
                {listing.rating.toFixed(1)} · {listing.reviewCount} reviews ·{' '}
                {listing.distanceMiles.toFixed(1)} mi away
              </Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>About this gear</Text>
          <Text style={styles.description}>{listing.description}</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        {listing.mode === 'rent' ? (
          <Pressable
            style={styles.cta}
            onPress={onRent}
            accessibilityRole="button"
            accessibilityLabel="Request rental"
          >
            <Text style={styles.ctaText}>Request rental</Text>
          </Pressable>
        ) : (
          <View style={styles.ctaRow}>
            <Pressable
              style={[styles.ctaSecondary, { flex: 1 }]}
              onPress={onBuyNow}
              accessibilityRole="button"
              accessibilityLabel="Buy now"
            >
              <Text style={styles.ctaSecondaryText}>Buy now</Text>
            </Pressable>
            <Pressable
              style={[styles.cta, { flex: 1.2 }]}
              onPress={onAddToCart}
              accessibilityRole="button"
              accessibilityLabel={inCart ? 'Already in cart' : 'Add to cart'}
            >
              <Text style={styles.ctaText}>{inCart ? 'In cart' : 'Add to cart'}</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  missing: {
    fontSize: 16,
    color: colors.ink,
    fontWeight: '700',
  },
  backLink: {
    color: colors.forest,
    fontWeight: '600',
  },
  hero: {
    minHeight: 240,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  backBtn: {
    position: 'absolute',
    top: 52,
    left: spacing.md,
    zIndex: 2,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  proBadge: {
    position: 'absolute',
    top: 56,
    right: spacing.md,
    zIndex: 2,
    backgroundColor: colors.gold,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  proText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.forest,
  },
  content: {
    padding: spacing.lg,
    gap: 10,
  },
  mode: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.gold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.ink,
  },
  price: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.forestMid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: colors.cream,
    fontWeight: '800',
    fontSize: 18,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
  },
  meta: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
  sectionLabel: {
    marginTop: spacing.sm,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: colors.ink,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    elevation: 20,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.cream,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cta: {
    backgroundColor: colors.forest,
    borderRadius: radii.md,
    paddingVertical: 16,
    alignItems: 'center',
    // Ensure web pointer clicks hit the CTA above the ScrollView.
    cursor: 'pointer' as const,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: 10,
  },
  ctaSecondary: {
    borderRadius: radii.md,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.creamCard,
    cursor: 'pointer' as const,
  },
  ctaSecondaryText: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '800',
  },
  ctaText: {
    color: colors.cream,
    fontSize: 16,
    fontWeight: '800',
  },
});
