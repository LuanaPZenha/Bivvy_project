import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing } from '../theme/tokens';

type Props = {
  onUpgrade?: () => void;
};

export function ProBanner({ onUpgrade }: Props) {
  return (
    <View style={styles.card} accessibilityRole="summary">
      <View style={styles.left}>
        <View style={styles.iconBox}>
          <Ionicons name="leaf" size={16} color={colors.forest} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>BIVVY PRO</Text>
          <Text style={styles.body}>
            Rent out your premium gear. Insured listings for equipment over $500, priority
            placement.
          </Text>
        </View>
      </View>
      <Pressable
        style={styles.btn}
        onPress={onUpgrade}
        accessibilityRole="button"
        accessibilityLabel="Upgrade to Bivvy Pro"
      >
        <Text style={styles.btnLabel}>Upgrade</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.forestMid,
    borderRadius: radii.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
  },
  title: {
    color: colors.gold,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
    fontSize: 13,
  },
  body: {
    color: colors.cream,
    fontSize: 12,
    lineHeight: 17,
    opacity: 0.9,
  },
  btn: {
    backgroundColor: colors.creamCard,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.sm,
  },
  btnLabel: {
    color: colors.forest,
    fontWeight: '700',
    fontSize: 13,
  },
});
