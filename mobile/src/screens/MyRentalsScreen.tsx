import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../auth/AuthContext';
import {
  checkoutBookingRequest,
  fetchMyBookings,
  updateBookingStatusRequest,
} from '../services/api';
import type { Booking, BookingStatus } from '../types/listing';
import { colors, radii, spacing } from '../theme/tokens';
import type { MyRentalsScreenProps } from '../navigation/types';

function money(n: number): string {
  return `$${n.toFixed(2)}`;
}

function statusLabel(status: BookingStatus): string {
  switch (status) {
    case 'requested':
      return 'Requested';
    case 'accepted':
      return 'Accepted';
    case 'declined':
      return 'Declined';
    case 'cancelled':
      return 'Cancelled';
    case 'completed':
      return 'Completed';
    default:
      return status;
  }
}

export function MyRentalsScreen({ navigation }: MyRentalsScreenProps) {
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setBookings([]);
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const result = await fetchMyBookings();
      setBookings(result.bookings || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authLoading) {
      setLoading(true);
      void load();
    }
  }, [authLoading, load]);

  const onRefresh = () => {
    setRefreshing(true);
    void load();
  };

  const runAction = async (bookingId: string, action: () => Promise<unknown>, success: string) => {
    setBusyId(bookingId);
    try {
      await action();
      Alert.alert('Updated', success);
      await load();
    } catch (err) {
      Alert.alert('Action failed', err instanceof Error ? err.message : 'Please try again');
    } finally {
      setBusyId(null);
    }
  };

  const renderActions = (booking: Booking) => {
    const isOwner = Boolean(user && booking.ownerId && booking.ownerId === user.id);
    const isRenter = Boolean(user && booking.renterId === user.id);
    const busy = busyId === booking.id;
    const buttons: React.ReactNode[] = [];

    if (isOwner && booking.status === 'requested') {
      buttons.push(
        <ActionButton
          key="accept"
          label="Accept"
          busy={busy}
          onPress={() =>
            runAction(booking.id, () => updateBookingStatusRequest(booking.id, 'accepted'), 'Booking accepted')
          }
        />,
        <ActionButton
          key="decline"
          label="Decline"
          tone="danger"
          busy={busy}
          onPress={() =>
            runAction(booking.id, () => updateBookingStatusRequest(booking.id, 'declined'), 'Booking declined')
          }
        />,
      );
    }

    if ((isRenter || isOwner) && booking.status === 'requested' && isRenter) {
      buttons.push(
        <ActionButton
          key="cancel"
          label="Cancel"
          tone="muted"
          busy={busy}
          onPress={() =>
            runAction(booking.id, () => updateBookingStatusRequest(booking.id, 'cancelled'), 'Booking cancelled')
          }
        />,
      );
    }

    if (isRenter && booking.status === 'accepted' && !booking.payment) {
      buttons.push(
        <ActionButton
          key="pay"
          label="Pay now"
          busy={busy}
          onPress={() =>
            runAction(booking.id, () => checkoutBookingRequest(booking.id), 'Payment simulated')
          }
        />,
      );
    }

    if (isRenter && booking.status === 'accepted') {
      buttons.push(
        <ActionButton
          key="cancel-accepted"
          label="Cancel"
          tone="muted"
          busy={busy}
          onPress={() =>
            runAction(booking.id, () => updateBookingStatusRequest(booking.id, 'cancelled'), 'Booking cancelled')
          }
        />,
      );
    }

    return buttons.length ? <View style={styles.actions}>{buttons}</View> : null;
  };

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
        <Text style={styles.topTitle}>My rentals</Text>
        <View style={{ width: 24 }} />
      </View>

      {!isAuthenticated && !authLoading ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Sign in to view rentals</Text>
          <Text style={styles.emptyBody}>Track requests, accept bookings, and pay securely.</Text>
          <Pressable
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
            accessibilityRole="button"
            accessibilityLabel="Sign in"
          >
            <Text style={styles.primaryText}>Sign in</Text>
          </Pressable>
        </View>
      ) : loading || authLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.forest} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {bookings.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No bookings yet</Text>
              <Text style={styles.emptyBody}>Request a rental from Explore to get started.</Text>
            </View>
          ) : (
            bookings.map((booking) => (
              <View key={booking.id} style={styles.card} accessibilityLabel={`Booking ${booking.id}`}>
                <View style={styles.cardHeader}>
                  <Text style={styles.status}>{statusLabel(booking.status)}</Text>
                  <Text style={styles.total}>{money(booking.pricing?.total ?? 0)}</Text>
                </View>
                <Text style={styles.dates}>
                  {booking.startDate} → {booking.endDate}
                </Text>
                <Text style={styles.meta}>Listing {booking.listingId}</Text>
                {booking.message ? <Text style={styles.message}>{booking.message}</Text> : null}
                {booking.payment ? (
                  <Text style={styles.paid}>Paid · {booking.payment.transactionId}</Text>
                ) : null}
                {renderActions(booking)}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

function ActionButton({
  label,
  onPress,
  busy,
  tone = 'primary',
}: {
  label: string;
  onPress: () => void;
  busy?: boolean;
  tone?: 'primary' | 'danger' | 'muted';
}) {
  return (
    <Pressable
      style={[
        styles.actionBtn,
        tone === 'danger' && styles.actionDanger,
        tone === 'muted' && styles.actionMuted,
      ]}
      onPress={onPress}
      disabled={busy}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {busy ? (
        <ActivityIndicator size="small" color={tone === 'muted' ? colors.ink : colors.cream} />
      ) : (
        <Text
          style={[
            styles.actionText,
            tone === 'muted' && styles.actionTextMuted,
            tone === 'danger' && styles.actionTextDanger,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
    paddingHorizontal: spacing.lg,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  error: {
    color: colors.danger,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  empty: {
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
  card: {
    backgroundColor: colors.creamCard,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  status: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.gold,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  total: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.ink,
  },
  dates: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink,
  },
  meta: {
    fontSize: 13,
    color: colors.muted,
  },
  message: {
    fontSize: 14,
    color: colors.muted,
    fontStyle: 'italic',
  },
  paid: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.forest,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: spacing.sm,
  },
  actionBtn: {
    backgroundColor: colors.forest,
    borderRadius: radii.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 88,
    alignItems: 'center',
  },
  actionDanger: {
    backgroundColor: colors.danger,
  },
  actionMuted: {
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionText: {
    color: colors.cream,
    fontWeight: '700',
    fontSize: 13,
  },
  actionTextMuted: {
    color: colors.ink,
  },
  actionTextDanger: {
    color: colors.cream,
  },
  primaryBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.forest,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryText: {
    color: colors.cream,
    fontWeight: '800',
    fontSize: 15,
  },
});
