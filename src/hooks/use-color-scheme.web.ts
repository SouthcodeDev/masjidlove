import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web.
 *
 * Hydration is detected with `useSyncExternalStore` rather than a `setState` in an effect:
 * React uses `getServerSnapshot` (false) for the server render and the hydrating client
 * render, then re-renders with `getSnapshot` (true) once hydrated. Same two-pass behaviour,
 * without the cascading-render pattern that `react-hooks/set-state-in-effect` flags.
 */
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function useColorScheme() {
  const hasHydrated = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
}
