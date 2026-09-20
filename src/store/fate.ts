import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CollectionRecord, Profile } from '@/types';

interface PendingCustom {
  key: string;
  name: string;
}

interface FateState {
  profile: Profile | null;
  collection: CollectionRecord[];
  /** 本次输入的自定义博物馆（非持久化，仅在会话内传递） */
  pendingCustom: PendingCustom | null;
  setProfile: (profile: Profile) => void;
  setPendingCustom: (custom: PendingCustom | null) => void;
  /** 盖章：同一馆只保留「初遇」的记录 */
  addRecord: (record: CollectionRecord) => void;
  resetAll: () => void;
}

export const useFateStore = create<FateState>()(
  persist(
    (set) => ({
      profile: null,
      collection: [],
      pendingCustom: null,
      setProfile: (profile) => set({ profile }),
      setPendingCustom: (pendingCustom) => set({ pendingCustom }),
      addRecord: (record) =>
        set((state) => {
          if (state.collection.some((r) => r.museumKey === record.museumKey)) {
            return state;
          }
          return { collection: [record, ...state.collection] };
        }),
      resetAll: () => set({ profile: null, collection: [], pendingCustom: null }),
    }),
    {
      name: 'relic-fate',
      partialize: (state) => ({ profile: state.profile, collection: state.collection }),
    },
  ),
);
