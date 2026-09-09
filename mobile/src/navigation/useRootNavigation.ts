import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from './types';

/**
 * Walk up nested navigators (stack → tabs → root) so screens inside MainTabs
 * can open root-level routes like Auth / MyRentals on web and native.
 */
export function useRootNavigation(): NavigationProp<RootStackParamList> {
  const navigation = useNavigation();
  let current: { getParent?: () => unknown } = navigation;
  let parent = current.getParent?.();
  while (parent && typeof parent === 'object' && 'getParent' in (parent as object)) {
    current = parent as { getParent?: () => unknown };
    parent = current.getParent?.();
  }
  return current as NavigationProp<RootStackParamList>;
}
