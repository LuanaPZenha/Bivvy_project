import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../auth/AuthContext';
import { FormField } from '../components/FormField';
import {
  createBookingRequest,
  fetchListingById,
  quoteBookingRequest,
} from '../services/api';
import {
  BookingPricing,
  Listing,
  MOCK_LISTINGS,
  listingPriceLabel,
} from '../types/listing';
import { colors, radii, spacing } from '../theme/tokens';
import { useRootNavigation } from '../navigation/useRootNavigation';
import type { BookingRequestScreenProps } from '../navigation/types';

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function defaultStartDate(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 1);
  return toIsoDate(d);
}

function defaultEndDate(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 3);
  return toIsoDate(d);
}

function money(n: number | undefined): string {
  return `$${(n ?? 0).toFixed(2)}`;
}

export function BookingRequestScreen({ navigation, route }: BookingRequestScreenProps) {
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const rootNav = useRootNavigation();
  const listingId = route.params.listingId;

  const [listing, setListing] = useState<Listing | null>(null);
  const [loadingListing, setLoadingListing] = useState(true);
  const [startDate, setStartDate] = useState(defaultStartDate());
  const [endDate, setEndDate] = useState(defaultEndDate());
  const [message, setMessage] = useState('');
  const [pricing, setPricing] = useState<BookingPricing | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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
      setLoadingListing(true);
      try {
        const remote = await fetchListingById(listingId);
        if (!cancelled) setListing(remote);
      } catch {
        const fallback = MOCK_LISTINGS.find((item) => item.id === listingId) || null;
        if (!cancelled) setListing(fallback);
      } finally {
        if (!cancelled) setLoadingListing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [listingId]);

  const refreshQuote = useCallback(async () => {
    if (!listing) return;
    setQuoting(true);
    setFormError(null);
    try {
      const body =
        listing.mode === 'rent' ? { startDate, endDate } : { startDate: undefined, endDate: undefined };
      const quote = await quoteBookingRequest(listing.id, body);
      setPricing(quote.pricing);
    } catch (err) {
      setPricing(null);
      setFormError(err instanceof Error ? err.message : 'Unable to quote this booking');
    } finally {
      setQuoting(false);
    }
  }, [listing, startDate, endDate]);

  useEffect(() => {
    if (!listing) return;
    const timer = setTimeout(() => {
      void refreshQuote();
    }, 250);
    return () => clearTimeout(timer);
  }, [listing, startDate, endDate, refreshQuote]);

  const heading = useMemo(() => {
    if (!listing) return 'Request booking';
    return listing.mode === 'rent' ? 'Request rental' : 'Buy gear';
  }, [listing]);

  const requireAuth = () => {
    rootNav.navigate('Auth', { screen: 'Login' });
  };

  const onSubmit = async () => {
    if (!listing) return;
    if (!isAuthenticated) {
      requireAuth();
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      const payload =
        listing.mode === 'rent'
          ? { listingId: listing.id, startDate, endDate, message: message.trim() }
          : { listingId: listing.id, message: message.trim() };
      await createBookingRequest(payload);
      Alert.alert(
        'Request sent',
        listing.mode === 'rent'
          ? 'Your rental request was sent to the owner.'
          : 'Your purchase request was sent to the seller.',
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }],
      );
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingListing) {
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

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top + spacing.sm }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.topBar}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </Pressable>
        <Text style={styles.topTitle}>{heading}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summary}>
          <Text style={styles.listingTitle}>{listing.title}</Text>
          <Text style={styles.listingMeta}>
            {listingPriceLabel(listing)} · {listing.ownerName}
          </Text>
        </View>

        {listing.mode === 'rent' ? (
          <View style={styles.formBlock}>
            <FormField
              label="Start date (YYYY-MM-DD)"
              value={startDate}
              onChangeText={setStartDate}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="2026-09-10"
            />
            <FormField
              label="End date (YYYY-MM-DD)"
              value={endDate}
              onChangeText={setEndDate}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="2026-09-12"
            />
          </View>
        ) : (
          <Text style={styles.buyHint}>
            Purchase requests are quoted instantly. The seller will confirm before payment.
          </Text>
        )}

        <FormField
          label="Message to owner (optional)"
          value={message}
          onChangeText={setMessage}
          placeholder="Pickup timing, trail plans, questions…"
          multiline
          style={{ minHeight: 88, textAlignVertical: 'top' }}
        />

        <View style={styles.quoteCard}>
          <View style={styles.quoteHeader}>
            <Text style={styles.quoteTitle}>Price quote</Text>
            {quoting ? <ActivityIndicator size="small" color={colors.forest} /> : null}
          </View>
          {pricing ? (
            <>
              {listing.mode === 'rent' ? (
                <Text style={styles.quoteLine}>
                  {pricing.days} day{pricing.days === 1 ? '' : 's'} × {money(pricing.dailyRate ?? 0)}
                </Text>
              ) : null}
              <Text style={styles.quoteLine}>Subtotal {money(pricing.subtotal)}</Text>
              <Text style={styles.quoteLine}>Service fee {money(pricing.serviceFee)}</Text>
              <Text style={styles.quoteLine}>Tax {money(pricing.tax)}</Text>
              <Text style={styles.quoteTotal}>Total {money(pricing.total)}</Text>
            </>
          ) : (
            <Text style={styles.quoteEmpty}>Enter dates to see a quote.</Text>
          )}
        </View>

        {formError ? <Text style={styles.error}>{formError}</Text> : null}

        <Pressable
          style={[styles.cta, submitting && styles.ctaDisabled]}
          onPress={onSubmit}
          disabled={submitting}
          accessibilityRole="button"
          accessibilityLabel={listing.mode === 'rent' ? 'Send rental request' : 'Send purchase request'}
        >
          {submitting ? (
            <ActivityIndicator color={colors.cream} />
          ) : (
            <Text style={styles.ctaText}>
              {isAuthenticated
                ? listing.mode === 'rent'
                  ? 'Send rental request'
                  : 'Send purchase request'
                : 'Sign in to continue'}
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
    paddingHorizontal: spacing.lg,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  missing: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
  },
  backLink: {
    color: colors.forest,
    fontWeight: '600',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  topTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.ink,
  },
  summary: {
    backgroundColor: colors.creamCard,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.ink,
  },
  listingMeta: {
    marginTop: 4,
    fontSize: 14,
    color: colors.muted,
  },
  formBlock: {
    gap: 4,
  },
  buyHint: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
    marginBottom: spacing.md,
  },
  quoteCard: {
    marginTop: spacing.md,
    backgroundColor: colors.creamCard,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 6,
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  quoteTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.ink,
  },
  quoteLine: {
    fontSize: 14,
    color: colors.muted,
  },
  quoteTotal: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: '800',
    color: colors.ink,
  },
  quoteEmpty: {
    fontSize: 14,
    color: colors.muted,
  },
  error: {
    marginTop: spacing.md,
    color: colors.danger,
    fontWeight: '600',
  },
  cta: {
    marginTop: spacing.lg,
    backgroundColor: colors.forest,
    borderRadius: radii.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaDisabled: {
    opacity: 0.7,
  },
  ctaText: {
    color: colors.cream,
    fontSize: 16,
    fontWeight: '800',
  },
});
