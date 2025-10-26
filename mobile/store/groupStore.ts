import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Group {
  id: string;
  name: string;
  memberCount: number;
  location: string;
  image?: string;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
}

interface GroupStore {
  currentGroup: Group | null;
  currentUser: User | null;
  groupMembers: User[];
  
  setCurrentGroup: (group: Group | null) => void;
  setCurrentUser: (user: User | null) => void;
  setGroupMembers: (members: User[]) => void;
  clearGroupData: () => void;
}

export const useGroupStore = create<GroupStore>()(
  persist(
    (set) => ({
      currentGroup: null,
      currentUser: null,
      groupMembers: [],
      
      setCurrentGroup: (group) => set({ currentGroup: group }),
      setCurrentUser: (user) => set({ currentUser: user }),
      setGroupMembers: (members) => set({ groupMembers: members }),
      clearGroupData: () => set({
        currentGroup: null,
        groupMembers: [],
      }),
    }),
    {
      name: 'group-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
