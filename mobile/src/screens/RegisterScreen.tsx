import React, { useMemo, useState } from 'react';
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
import { Checkbox } from '../components/Checkbox';
import { FormField } from '../components/FormField';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { PasswordStrengthMeter } from '../components/PasswordStrengthMeter';
import { PineLogo } from '../components/PineLogo';
import {
  formatPhone,
  normalizePhone,
  validateRegisterForm,
  type RegisterFormErrors,
} from '../utils/validation';
import { colors, radii, spacing } from '../theme/tokens';
import type { RegisterScreenProps } from '../navigation/types';

export function RegisterScreen({ navigation }: RegisterScreenProps) {
  const insets = useSafeAreaInsets();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const values = useMemo(
    () => ({ name, email, phone, password, confirmPassword, acceptedTerms }),
    [name, email, phone, password, confirmPassword, acceptedTerms],
  );

  const closeAuth = () => navigation.getParent()?.goBack();

  const clearFieldError = (field: keyof RegisterFormErrors) => {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const onSubmit = async () => {
    setFormError(null);
    const nextErrors = validateRegisterForm(values);
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setBusy(true);
    try {
      await register({
        email: email.trim(),
        password,
        name: name.trim(),
        phone: phone ? normalizePhone(phone) : undefined,
        acceptTerms: true,
        marketingOptIn,
      });
      closeAuth();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to create account');
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

        <FormField
          label="Full name"
          value={name}
          onChangeText={(v) => {
            setName(v);
            clearFieldError('name');
          }}
          placeholder="Alex Rivera"
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
          error={errors.name}
        />

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
          label="Phone (optional)"
          value={phone}
          onChangeText={(v) => {
            setPhone(formatPhone(v));
            clearFieldError('phone');
          }}
          placeholder="(206) 555-0134"
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          error={errors.phone}
          hint="Owners use it to coordinate pickup"
        />

        <FormField
          label="Password"
          value={password}
          onChangeText={(v) => {
            setPassword(v);
            clearFieldError('password');
          }}
          placeholder="At least 8 characters"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
          onToggleSecure={() => setShowPassword((v) => !v)}
          secureVisible={showPassword}
          error={errors.password}
        />
        <PasswordStrengthMeter password={password} />

        <FormField
          label="Confirm password"
          value={confirmPassword}
          onChangeText={(v) => {
            setConfirmPassword(v);
            clearFieldError('confirmPassword');
          }}
          placeholder="Repeat your password"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={onSubmit}
          error={errors.confirmPassword}
        />

        <Checkbox
          checked={acceptedTerms}
          onChange={(next) => {
            setAcceptedTerms(next);
            clearFieldError('acceptedTerms');
          }}
          label="I agree to the Bivvy Terms of Service and Privacy Policy."
          accessibilityLabel="Accept terms"
          error={errors.acceptedTerms}
        />

        <Checkbox
          checked={marketingOptIn}
          onChange={setMarketingOptIn}
          label="Send me gear drops and local rental deals."
          accessibilityLabel="Marketing emails"
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
          accessibilityLabel="Create account"
        >
          {busy ? (
            <ActivityIndicator color={colors.cream} />
          ) : (
            <Text style={styles.ctaText}>Create account</Text>
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
