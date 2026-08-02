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

export function GoogleSignInButton({
  label = 'Continue with Google',
  onSuccess,
  onError,
}: Props) {
  const { loginWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);

  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '';
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '';

  // Native platforms need their own OAuth client; web reuses the web client.
  const platformClientId =
    Platform.OS === 'android' ? androidClientId : Platform.OS === 'ios' ? iosClientId : webClientId;
  const isConfigured = Boolean(webClientId) && Boolean(platformClientId);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest(
    isConfigured
      ? {
          clientId: webClientId,
          webClientId,
          iosClientId: iosClientId || undefined,
          androidClientId: androidClientId || undefined,
        }
      : // Avoid the provider throwing when a platform client id is missing.
        { clientId: undefined },
  );

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
    if (!platformClientId) {
      const envVar =
        Platform.OS === 'android'
          ? 'EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID'
          : 'EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID';
      onError?.(`Google sign-in needs ${envVar} on ${Platform.OS}. Use email sign-up for now.`);
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
      style={[styles.btn, (busy || (isConfigured && !request)) && styles.btnDisabled]}
      onPress={onPress}
      disabled={busy || (isConfigured && !request)}
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
