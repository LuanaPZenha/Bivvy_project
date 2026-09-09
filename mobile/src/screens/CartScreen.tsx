import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../auth/AuthContext';
import { useCart } from '../cart/CartContext';
import { checkoutCartRequest } from '../services/api';
import { primaryListingImageUrl } from '../utils/listingImages';
import { colors, radii, spacing } from '../theme/tokens';
import { useRootNavigation } from '../navigation/useRootNavigation';
import type { CartScreenProps } from '../navigation/types';

export function CartScreen({ navigation }: CartScreenProps) {
  const insets = useSafeAreaInsets();
  const { items, count, subtotal, removeItem, clear } = useCart();
  const { isAuthenticated } = useAuth();
  const rootNav = useRootNavigation();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCheckout = async () => {
    if (!isAuthenticated) {
      rootNav.navigate('Auth', { screen: 'Login' });
      return;
    }
    if (items.length === 0) return;

    setSubmitting(true);
    setError(null);
    try {
      await checkoutCartRequest({
        listingIds: items.map((item) => item.listingId),
        message: 'Cart checkout',
      });
      clear();
      Alert.alert(
        'Purchase requested',
        'Sellers will confirm each item. Track progress under My rentals.',
      );
      rootNav.navigate('MyRentals');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.md }]}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button">
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </Pressable>
        <Text style={styles.heading}>Cart</Text>
        <Text style={styles.meta}>{count} item{count === 1 ? '' : 's'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {items.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptyBody}>Add buy-mode gear from a listing to check out.</Text>
          </View>
        ) : (
          items.map((item) => {
            const uri = primaryListingImageUrl(item.listing);
            return (
              <View key={item.listingId} style={styles.row}>
                <View style={styles.thumb}>
                  {uri ? (
                    <Image source={{ uri }} style={styles.thumbImg} resizeMode="cover" />
                  ) : (
                    <Ionicons name="cube-outline" size={28} color={colors.cream} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title} numberOfLines={2}>
                    {item.listing.title}
                  </Text>
                  <Text style={styles.price}>${Number(item.listing.buyPrice).toFixed(2)}</Text>
                </View>
                <Pressable
                  onPress={() => removeItem(item.listingId)}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${item.listing.title}`}
                  hitSlop={10}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.danger} />
                </Pressable>
              </View>
            );
          })
        )}
      </ScrollView>

      {items.length > 0 ? (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Items subtotal</Text>
            <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
          </View>
          <Text style={styles.hint}>Fees and tax are calculated when each seller confirms.</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable
            style={[styles.cta, submitting && styles.ctaDisabled]}
            onPress={onCheckout}
            disabled={submitting}
            accessibilityRole="button"
            accessibilityLabel={isAuthenticated ? 'Request purchases' : 'Sign in to checkout'}
          >
            {submitting ? (
              <ActivityIndicator color={colors.cream} />
            ) : (
              <Text style={styles.ctaText}>
                {isAuthenticated ? 'Request purchases' : 'Sign in to checkout'}
              </Text>
            )}
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  heading: { flex: 1, fontSize: 22, fontWeight: '800', color: colors.ink },
  meta: { color: colors.muted, fontWeight: '600' },
  content: { paddingHorizontal: spacing.lg, paddingBottom: 140, gap: 12 },
  empty: { paddingTop: 48, alignItems: 'center', gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.ink },
  emptyBody: { fontSize: 14, color: colors.muted, textAlign: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.creamCard,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: radii.md,
    backgroundColor: colors.forestMid,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImg: { width: '100%', height: '100%' },
  title: { fontSize: 15, fontWeight: '700', color: colors.ink },
  price: { marginTop: 4, fontSize: 15, fontWeight: '800', color: colors.ink },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.cream,
    gap: 8,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { fontSize: 15, color: colors.muted, fontWeight: '600' },
  totalValue: { fontSize: 18, fontWeight: '800', color: colors.ink },
  hint: { fontSize: 12, color: colors.muted },
  error: { color: colors.danger, fontWeight: '600' },
  cta: {
    backgroundColor: colors.forest,
    borderRadius: radii.md,
    paddingVertical: 16,
    alignItems: 'center',
    cursor: 'pointer' as const,
  },
  ctaDisabled: { opacity: 0.7 },
  ctaText: { color: colors.cream, fontWeight: '800', fontSize: 16 },
});
