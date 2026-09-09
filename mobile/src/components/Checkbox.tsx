import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing } from '../theme/tokens';

type Props = {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  accessibilityLabel?: string;
  error?: string;
};

export function Checkbox({ checked, onChange, label, accessibilityLabel, error }: Props) {
  return (
    <View style={styles.wrap}>
      <Pressable
        style={styles.row}
        onPress={() => onChange(!checked)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        accessibilityLabel={accessibilityLabel || label}
        hitSlop={6}
      >
        <View style={[styles.box, checked && styles.boxChecked, error ? styles.boxError : null]}>
          {checked ? <Ionicons name="checkmark" size={14} color={colors.cream} /> : null}
        </View>
        <Text style={styles.label}>{label}</Text>
      </Pressable>
      {error ? (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.creamCard,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  boxChecked: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  boxError: {
    borderColor: colors.danger,
  },
  label: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: colors.muted,
  },
  error: {
    marginTop: 6,
    marginLeft: 32,
    fontSize: 12,
    color: colors.danger,
  },
});
