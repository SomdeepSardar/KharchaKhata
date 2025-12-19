/**
 * Shared utility functions
 */

export const triggerHaptic = (pattern: number | number[] = 10) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};

export const getGlassClass = (enabled: boolean, intensity: string = 'backdrop-blur-3xl saturate-150') => {
  return enabled ? intensity : '';
};
