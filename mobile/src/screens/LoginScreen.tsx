import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../auth/AuthContext';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { colors, radii, spacing } from '../theme/tokens';
import type { LoginScreenProps } from '../navigation/types';

export function LoginScreen({ navigation }: LoginScreenProps) {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Email and password are required');
      return;
    }
    setBusy(true);
    try {
      await login(email, password);
      navigation.getParent()?.goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Pressable
        onPress={() => navigation.getParent()?.goBack()}
        accessibilityRole="button"
        accessibilityLabel="Close"
        style={styles.close}
      >
        <Text style={styles.closeText}>Close</Text>
      </Pressable>

      <Text style={styles.brand}>BIVVY</Text>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Sign in to rent or buy outdoor gear near you.</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        autoCorrect={false}
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        placeholderTextColor={colors.muted}
        accessibilityLabel="Email"
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholder="Your password"
        placeholderTextColor={colors.muted}
        accessibilityLabel="Password"
      />

      {error ? (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}

      <Pressable
        style={[styles.cta, busy && styles.ctaDisabled]}
        onPress={onSubmit}
        disabled={busy}
        accessibilityRole="button"
        accessibilityLabel="Sign in"
      >
        {busy ? <ActivityIndicator color={colors.cream} /> : <Text style={styles.ctaText}>Sign in</Text>}
      </Pressable>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <GoogleSignInButton
        label="Sign in with Google"
        onSuccess={() => navigation.getParent()?.goBack()}
        onError={(message) => setError(message || null)}
      />

      <Pressable
        onPress={() => navigation.navigate('Register')}
        accessibilityRole="button"
        accessibilityLabel="Create an account"
      >
        <Text style={styles.link}>New to Bivvy? Create an account</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
    paddingHorizontal: spacing.lg,
  },
  close: {
    alignSelf: 'flex-end',
    marginBottom: spacing.md,
  },
  closeText: {
    color: colors.muted,
    fontWeight: '600',
  },
  brand: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
    color: colors.forest,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.ink,
  },
  subtitle: {
    fontSize: 15,
    color: colors.muted,
    marginTop: 6,
    marginBottom: spacing.lg,
    lineHeight: 21,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.creamCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: spacing.md,
    color: colors.ink,
    fontSize: 15,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.md,
    fontSize: 14,
  },
  cta: {
    backgroundColor: colors.forest,
    borderRadius: radii.md,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  ctaDisabled: {
    opacity: 0.7,
  },
  ctaText: {
    color: colors.cream,
    fontWeight: '800',
    fontSize: 16,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  link: {
    marginTop: spacing.lg,
    textAlign: 'center',
    color: colors.forest,
    fontWeight: '600',
  },
});

