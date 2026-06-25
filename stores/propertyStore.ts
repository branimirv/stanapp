import { create } from 'zustand';
import type { Property } from '@/types/app.types';

interface PropertyCacheState {
  properties: Property[];
  lastFetchedAt: number | null;
  isStale: boolean;
  setProperties: (properties: Property[]) => void;
  addProperty: (property: Property) => void;
  updateProperty: (id: string, property: Property) => void;
  removeProperty: (id: string) => void;
  getPropertyById: (id: string) => Property | undefined;
  getActiveProperties: () => Property[];
  getChildProperties: (parentId: string) => Property[];
  invalidate: () => void;
  clearCache: () => void;
}

export const usePropertyStore = create<PropertyCacheState>((set, get) => ({
  properties: [],
  lastFetchedAt: null,
  isStale: true,

  setProperties: (properties) =>
    set({
      properties,
      lastFetchedAt: Date.now(),
      isStale: false,
    }),

  addProperty: (property) =>
    set((state) => ({
      properties: [property, ...state.properties],
      lastFetchedAt: Date.now(),
    })),

  updateProperty: (id, property) =>
    set((state) => ({
      properties: state.properties.map((p) => (p.id === id ? property : p)),
      lastFetchedAt: Date.now(),
    })),

  removeProperty: (id) =>
    set((state) => ({
      properties: state.properties.filter((p) => p.id !== id),
      lastFetchedAt: Date.now(),
    })),

  getPropertyById: (id) => get().properties.find((p) => p.id === id),

  getActiveProperties: () => get().properties.filter((p) => !p.is_archived),

  getChildProperties: (parentId) =>
    get().properties.filter((p) => p.parent_property_id === parentId && !p.is_archived),

  invalidate: () => set({ isStale: true }),

  clearCache: () =>
    set({
      properties: [],
      lastFetchedAt: null,
      isStale: true,
    }),
}));
