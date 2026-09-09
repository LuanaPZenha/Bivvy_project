import React, { useEffect, useState } from 'react';
import { Pressable, Text, View, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '../auth/AuthContext';
import { colors, radii, spacing } from '../theme/tokens';

WebBrowser.maybeCompleteAuthSession();

type Props = {
  label?: string;
  onSuccess?: () => void;
  onError?: (message: string) => void;
};

function isRealClientId(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  // .env.example placeholders
  if (v.startsWith('your_') || v.includes('change_me')) return false;
  return v.includes('.apps.googleusercontent.com');
}

function readClientIds() {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '';
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '';
  const platformClientId =
    Platform.OS === 'android' ? androidClientId : Platform.OS === 'ios' ? iosClientId : webClientId;
  return {
    webClientId,
    iosClientId,
    androidClientId,
    platformClientId,
    isConfigured: isRealClientId(webClientId) && isRealClientId(platformClientId),
  };
}

/**
 * Outer shell: never mount expo-auth-session Google hook without a real webClientId,
 * or the provider throws and the ErrorBoundary takes over the whole app.
 */
export function GoogleSignInButton(props: Props) {
  const ids = readClientIds();
  if (!ids.isConfigured) {
    return <UnconfiguredGoogleButton {...props} />;
  }
  return <ConfiguredGoogleSignInButton {...props} {...ids} />;
}

function UnconfiguredGoogleButton({
  label = 'Continue with Google',
  onError,
}: Props) {
  const onPress = () => {
    if (Platform.OS === 'web') {
      onError?.(
        'Google sign-in needs EXPO_PUBLIC_GOOGLE_CLIENT_ID in mobile/.env (Web OAuth client). Restart Expo after setting it.',
      );
      return;
    }
    const envVar =
      Platform.OS === 'android'
        ? 'EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID'
        : 'EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID';
    onError?.(
      `Google sign-in needs EXPO_PUBLIC_GOOGLE_CLIENT_ID and ${envVar}. Use email sign-in for now.`,
    );
  };

  return (
    <Pressable
      style={styles.btn}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.mark}>
        <Text style={styles.markText}>G</Text>
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

function ConfiguredGoogleSignInButton({
  label = 'Continue with Google',
  onSuccess,
  onError,
  webClientId,
  iosClientId,
  androidClientId,
}: Props & {
  webClientId: string;
  iosClientId: string;
  androidClientId: string;
}) {
  const { loginWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: webClientId,
    webClientId,
    iosClientId: isRealClientId(iosClientId) ? iosClientId : undefined,
    androidClientId: isRealClientId(androidClientId) ? androidClientId : undefined,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!response) return;
      if (response.type !== 'success') {
        if (response.type === 'error') {
          onError?.(response.error?.message || 'Google sign-in failed');
        }
        return;
      }

      const idToken = response.params?.id_token || response.authentication?.idToken;
      if (!idToken) {
        onError?.('Google did not return an ID token');
        return;
      }

      setBusy(true);
      try {
        await loginWithGoogle(String(idToken));
        if (!cancelled) onSuccess?.();
      } catch (err) {
        if (!cancelled) {
          onError?.(err instanceof Error ? err.message : 'Google sign-in failed');
        }
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [response, loginWithGoogle, onSuccess, onError]);

  const onPress = async () => {
    setBusy(true);
    try {
      const result = await promptAsync();
      if (result.type !== 'success') {
        setBusy(false);
      }
    } catch (err) {
      setBusy(false);
      onError?.(err instanceof Error ? err.message : 'Unable to open Google sign-in');
    }
  };

  return (
    <Pressable
      style={[styles.btn, (busy || !request) && styles.btnDisabled]}
      onPress={onPress}
      disabled={busy || !request}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {busy ? (
        <ActivityIndicator color={colors.ink} />
      ) : (
        <>
          <View style={styles.mark}>
            <Text style={styles.markText}>G</Text>
          </View>
          <Text style={styles.label}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.creamCard,
    borderRadius: radii.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  mark: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  markText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4285F4',
  },
  label: {
    color: colors.ink,
    fontWeight: '700',
    fontSize: 15,
  },
});
