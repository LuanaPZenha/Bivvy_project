import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../auth/AuthContext';
import { fetchMyBookings } from '../services/api';
import type { Booking, BookingStatus } from '../types/listing';
import { colors, radii, spacing } from '../theme/tokens';
import type { NotificationsScreenProps } from '../navigation/types';

type Notice = {
  id: string;
  title: string;
  body: string;
  createdAt?: string;
  bookingId: string;
};

function noticeFor(booking: Booking, userId?: string | null): Notice {
  const listingTitle = booking.listing?.title || `Listing ${booking.listingId}`;
  const isOwner = Boolean(userId && booking.ownerId === userId);
  const status = booking.status as BookingStatus;
  let title = 'Booking update';
  let body = `${listingTitle} is ${status}.`;

  if (status === 'requested' && isOwner) {
    title = 'New rental request';
    body = `${booking.renterName} requested ${listingTitle}.`;
  } else if (status === 'requested' && !isOwner) {
    title = 'Request sent';
    body = `Waiting for the owner to accept ${listingTitle}.`;
  } else if (status === 'accepted') {
    title = 'Booking accepted';
    body = `${listingTitle} was accepted. ${isOwner ? 'Wait for payment.' : 'You can pay now.'}`;
  } else if (status === 'declined') {
    title = 'Booking declined';
    body = `${listingTitle} was declined.`;
  } else if (status === 'cancelled') {
    title = 'Booking cancelled';
    body = `${listingTitle} was cancelled.`;
  } else if (status === 'completed') {
    title = 'Trip completed';
    body = `${listingTitle} is complete.`;
  }

  return {
    id: `${booking.id}-${status}`,
    title,
    body,
    createdAt: booking.updatedAt || booking.createdAt,
    bookingId: booking.id,
  };
}

export function NotificationsScreen({ navigation }: NotificationsScreenProps) {
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setNotices([]);
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const result = await fetchMyBookings();
      const items = (result.bookings || [])
        .map((b) => noticeFor(b, user?.id))
        .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
      setNotices(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (!authLoading) {
      setLoading(true);
      void load();
    }
  }, [authLoading, load]);

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
        <Text style={styles.topTitle}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      {!isAuthenticated && !authLoading ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Sign in for updates</Text>
          <Text style={styles.emptyBody}>
            Booking requests, accepts, and payment updates show up here.
          </Text>
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                void load();
              }}
            />
          }
        >
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {notices.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>You are all caught up</Text>
              <Text style={styles.emptyBody}>New booking activity will appear here.</Text>
            </View>
          ) : (
            notices.map((notice) => (
              <Pressable
                key={notice.id}
                style={styles.card}
                onPress={() => navigation.navigate('MyRentals')}
                accessibilityRole="button"
                accessibilityLabel={notice.title}
              >
                <Text style={styles.cardTitle}>{notice.title}</Text>
                <Text style={styles.cardBody}>{notice.body}</Text>
                {notice.createdAt ? (
                  <Text style={styles.cardMeta}>{new Date(notice.createdAt).toLocaleString()}</Text>
                ) : null}
              </Pressable>
            ))
          )}
        </ScrollView>
      )}
    </View>
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
    gap: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.ink,
  },
  cardBody: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
  },
  cardMeta: {
    marginTop: 4,
    fontSize: 12,
    color: colors.muted,
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
