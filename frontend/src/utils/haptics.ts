import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

export const hapticLight = (): void => {
  if (Capacitor.isNativePlatform()) void Haptics.impact({ style: ImpactStyle.Light });
};

export const hapticMedium = (): void => {
  if (Capacitor.isNativePlatform()) void Haptics.impact({ style: ImpactStyle.Medium });
};

export const hapticHeavy = (): void => {
  if (Capacitor.isNativePlatform()) void Haptics.impact({ style: ImpactStyle.Heavy });
};
