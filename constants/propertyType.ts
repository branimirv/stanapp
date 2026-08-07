import { Building2, Car, Home, MapPin } from 'lucide-react-native';
import { LIGHT } from '@/constants/theme';
import type { PropertyType } from '@/types/app.types';

export const PROPERTY_TYPE_ICONS = {
  apartment: Building2,
  house: Home,
  garage: Car,
  other: MapPin,
} as const;

export const PROPERTY_TYPE_COLORS: Record<PropertyType, string> = {
  apartment: LIGHT.primary,
  house: LIGHT.pos,
  garage: LIGHT.muted,
  other: LIGHT.chart[5],
};
