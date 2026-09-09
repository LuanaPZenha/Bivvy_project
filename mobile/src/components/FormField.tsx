import React from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing } from '../theme/tokens';

type Props = TextInputProps & {
  label: string;
  error?: string;
  hint?: string;
  onToggleSecure?: () => void;
  secureVisible?: boolean;
};

export function FormField({
  label,
  error,
  hint,
  onToggleSecure,
  secureVisible,
  style,
  ...inputProps
}: Props) {
  const showToggle = typeof onToggleSecure === 'function';

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, error ? styles.inputRowError : null]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.muted}
          accessibilityLabel={label}
          {...inputProps}
        />
        {showToggle ? (
          <Pressable
            onPress={onToggleSecure}
            accessibilityRole="button"
            accessibilityLabel={secureVisible ? `Hide ${label}` : `Show ${label}`}
            hitSlop={10}
          >
            <Ionicons
              name={secureVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.muted}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.creamCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    height: 48,
  },
  inputRowError: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    color: colors.ink,
    fontSize: 15,
  },
  error: {
    marginTop: 6,
    fontSize: 12,
    color: colors.danger,
  },
  hint: {
    marginTop: 6,
    fontSize: 12,
    color: colors.muted,
  },
});
