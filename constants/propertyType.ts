import { Building2, Car, Home, MapPin } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import type { PropertyType } from '@/types/app.types';

export const PROPERTY_TYPE_ICONS = {
  apartment: Building2,
  house: Home,
  garage: Car,
  other: MapPin,
} as const;

export const PROPERTY_TYPE_COLORS: Record<PropertyType, string> = {
  apartment: Colors.typeApartment,
  house: Colors.typeHouse,
  garage: Colors.typeGarage,
  other: Colors.typeOther,
};
