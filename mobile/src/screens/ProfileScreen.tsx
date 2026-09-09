import React from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../auth/AuthContext';
import { colors, radii, spacing } from '../theme/tokens';
import type { RootStackParamList } from '../navigation/types';

function initials(name: string, email: string): string {
  const source = name?.trim() || email;
  return source.charAt(0).toUpperCase() || '?';
}

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const rootNav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const openProtected = (screen: 'MyRentals' | 'MyListings') => {
    if (!isAuthenticated) {
      rootNav.navigate('Auth', { screen: 'Login' });
      return;
    }
    rootNav.navigate(screen);
  };

  if (isLoading) {
    return (
      <View style={[styles.root, styles.centered]}>
        <ActivityIndicator color={colors.forest} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.lg }]}>
      <Text style={styles.heading}>Profile</Text>

      {isAuthenticated && user ? (
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>{initials(user.name, user.email)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user.name || 'Bivvy member'}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.card}>
          <View style={[styles.avatar, styles.avatarMuted]}>
            <Ionicons name="person-outline" size={22} color={colors.cream} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>Guest</Text>
            <Text style={styles.email}>Sign in to manage rentals and purchases.</Text>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <NavRow
          icon="calendar-outline"
          label="My rentals"
          onPress={() => openProtected('MyRentals')}
        />
        <NavRow
          icon="pricetag-outline"
          label="My listings"
          onPress={() => openProtected('MyListings')}
          last
        />
      </View>

      {isAuthenticated ? (
        <Pressable
          style={styles.secondaryBtn}
          onPress={() => logout()}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          <Text style={styles.secondaryText}>Sign out</Text>
        </Pressable>
      ) : (
        <View style={styles.authActions}>
          <Pressable
            style={styles.primaryBtn}
            onPress={() => rootNav.navigate('Auth', { screen: 'Register' })}
            accessibilityRole="button"
            accessibilityLabel="Create account"
          >
            <Text style={styles.primaryText}>Create account</Text>
          </Pressable>
          <Pressable
            style={styles.secondaryBtn}
            onPress={() => rootNav.navigate('Auth', { screen: 'Login' })}
            accessibilityRole="button"
            accessibilityLabel="Sign in"
          >
            <Text style={styles.secondaryText}>Sign in</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function NavRow({
  icon,
  label,
  onPress,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      style={[styles.navRow, last && styles.navRowLast]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons name={icon} size={20} color={colors.forest} />
      <Text style={styles.navLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: spacing.lg,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.creamCard,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.forest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMuted: {
    backgroundColor: colors.forestMid,
  },
  avatarLetter: {
    color: colors.cream,
    fontSize: 22,
    fontWeight: '800',
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.ink,
  },
  email: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
  section: {
    backgroundColor: colors.creamCard,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  navRowLast: {
    borderBottomWidth: 0,
  },
  navLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink,
  },
  authActions: {
    gap: spacing.sm,
  },
  primaryBtn: {
    backgroundColor: colors.forest,
    borderRadius: radii.md,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryText: {
    color: colors.cream,
    fontWeight: '800',
    fontSize: 16,
  },
  secondaryBtn: {
    borderRadius: radii.md,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.creamCard,
  },
  secondaryText: {
    color: colors.ink,
    fontWeight: '700',
    fontSize: 16,
  },
});
