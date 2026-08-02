import React, { useEffect, useState } from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '../auth/AuthContext';
import { colors, radii, spacing } from '../theme/tokens';

WebBrowser.maybeCompleteAuthSession();

type Props = {
  onSuccess?: () => void;
  onError?: (message: string) => void;
};

export function GoogleSignInButton({ onSuccess, onError }: Props) {
  const { loginWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);

  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: webClientId || undefined,
    webClientId: webClientId || undefined,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || undefined,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || undefined,
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

      const idToken =
        response.params?.id_token ||
        // @ts-expect-error authentication may include idToken on some platforms
        response.authentication?.idToken;

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
    if (!webClientId) {
      onError?.('Google sign-in is not configured (missing EXPO_PUBLIC_GOOGLE_CLIENT_ID)');
      return;
    }
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
      style={[styles.btn, (!request || busy) && styles.btnDisabled]}
      onPress={onPress}
      disabled={!request || busy}
      accessibilityRole="button"
      accessibilityLabel="Continue with Google"
    >
      {busy ? (
        <ActivityIndicator color={colors.ink} />
      ) : (
        <Text style={styles.label}>Continue with Google</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.creamCard,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.7,
  },
  label: {
    color: colors.ink,
    fontWeight: '700',
    fontSize: 15,
  },
});
