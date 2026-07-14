import { create } from 'zustand';

interface MeetingStore {
  meetings: any[];
  isLoading: boolean;
  isDialogOpen: boolean;
  activeTab: string;
  setMeetings: (data: any[]) => void;
  openDialog: () => void;
  closeDialog: () => void;
  setActiveTab: (tab: string) => void;
}

export const useMeetingStore = create<MeetingStore>((set) => ({
  meetings: [],
  isLoading: false,
  isDialogOpen: false,
  activeTab: 'meetings',
  setMeetings: (data) => set({ meetings: data }),
  openDialog: () => set({ isDialogOpen: true }),
  closeDialog: () => set({ isDialogOpen: false }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
