import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/tokens';

type Props = {
  size?: number;
  color?: string;
};

/** Stylized pine mark for Bivvy. */
export function PineLogo({ size = 22, color = colors.cream }: Props) {
  return (
    <View style={styles.wrap} accessibilityRole="image" accessibilityLabel="Bivvy logo">
      <Ionicons name="leaf" size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
