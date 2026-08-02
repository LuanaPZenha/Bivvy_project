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
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../auth/AuthContext';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { PineLogo } from '../components/PineLogo';
import { colors, radii, spacing } from '../theme/tokens';
import type { RegisterScreenProps } from '../navigation/types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterScreen({ navigation }: RegisterScreenProps) {
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const closeAuth = () => navigation.getParent()?.goBack();

  const onSubmit = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Email and password are required');
      return;
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError('Enter a valid email address');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setBusy(true);
    try {
      await register(email, password, name || undefined);
      closeAuth();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top + spacing.md }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={closeAuth}
          accessibilityRole="button"
          accessibilityLabel="Close"
          style={styles.close}
        >
          <Ionicons name="close" size={24} color={colors.muted} />
        </Pressable>

        <View style={styles.brandRow}>
          <PineLogo />
          <Text style={styles.brand}>BIVVY</Text>
        </View>

        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>
          Rent and buy gear for camping, hiking, climbing, water, snow, and bikes.
        </Text>

        <GoogleSignInButton
          label="Sign up with Google"
          onSuccess={closeAuth}
          onError={(message) => setError(message || null)}
        />

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or sign up with email</Text>
          <View style={styles.dividerLine} />
        </View>

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Alex"
          placeholderTextColor={colors.muted}
          accessibilityLabel="Name"
        />

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
        <View style={styles.passwordRow}>
          <TextInput
            style={styles.passwordInput}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            placeholder="At least 8 characters"
            placeholderTextColor={colors.muted}
            accessibilityLabel="Password"
          />
          <Pressable
            onPress={() => setShowPassword((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            hitSlop={10}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.muted}
            />
          </Pressable>
        </View>

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
          accessibilityLabel="Create account"
        >
          {busy ? (
            <ActivityIndicator color={colors.cream} />
          ) : (
            <Text style={styles.ctaText}>Create account</Text>
          )}
        </Pressable>

        <Text style={styles.terms}>
          By creating an account you agree to the Bivvy Terms of Service and Privacy Policy.
        </Text>

        <Pressable
          onPress={() => navigation.navigate('Login')}
          accessibilityRole="button"
          accessibilityLabel="Sign in instead"
        >
          <Text style={styles.link}>Already have an account? Sign in</Text>
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
  close: {
    alignSelf: 'flex-end',
    marginBottom: spacing.sm,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.md,
  },
  brand: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
    color: colors.forest,
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
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.creamCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: spacing.md,
    gap: 10,
  },
  passwordInput: {
    flex: 1,
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
  terms: {
    marginTop: spacing.md,
    fontSize: 12,
    lineHeight: 18,
    color: colors.muted,
    textAlign: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
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
