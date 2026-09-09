import React, { useState } from 'react';
import {
  View,
  Text,
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
import { FormField } from '../components/FormField';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { PineLogo } from '../components/PineLogo';
import { isValidEmail } from '../utils/validation';
import { colors, radii, spacing } from '../theme/tokens';
import type { LoginScreenProps } from '../navigation/types';

type FieldErrors = {
  email?: string;
  password?: string;
};

export function LoginScreen({ navigation }: LoginScreenProps) {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const closeAuth = () => navigation.getParent()?.goBack();

  const clearFieldError = (field: keyof FieldErrors) => {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const onSubmit = async () => {
    setFormError(null);

    const nextErrors: FieldErrors = {};
    if (!email.trim()) {
      nextErrors.email = 'Enter your email';
    } else if (!isValidEmail(email)) {
      nextErrors.email = 'Enter a valid email address';
    }
    if (!password) {
      nextErrors.password = 'Enter your password';
    }

    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setBusy(true);
    try {
      await login(email, password);
      closeAuth();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to sign in');
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

        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to rent or buy outdoor gear near you.</Text>

        <FormField
          label="Email"
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            clearFieldError('email');
          }}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          error={errors.email}
        />

        <FormField
          label="Password"
          value={password}
          onChangeText={(v) => {
            setPassword(v);
            clearFieldError('password');
          }}
          placeholder="Your password"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="done"
          onSubmitEditing={onSubmit}
          onToggleSecure={() => setShowPassword((v) => !v)}
          secureVisible={showPassword}
          error={errors.password}
        />

        {formError ? (
          <Text style={styles.formError} accessibilityRole="alert">
            {formError}
          </Text>
        ) : null}

        <Pressable
          style={[styles.cta, busy && styles.ctaDisabled]}
          onPress={onSubmit}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel="Sign in"
        >
          {busy ? (
            <ActivityIndicator color={colors.cream} />
          ) : (
            <Text style={styles.ctaText}>Sign in</Text>
          )}
        </Pressable>

        <View style={styles.dividerRow} accessibilityRole="none">
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <GoogleSignInButton
          label="Continue with Google"
          onSuccess={closeAuth}
          onError={(message) => setFormError(message)}
        />

        <Pressable
          onPress={() => navigation.navigate('Register')}
          accessibilityRole="button"
          accessibilityLabel="Create an account"
        >
          <Text style={styles.link}>New to Bivvy? Create an account</Text>
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
  formError: {
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
    gap: 12,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
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
