import { create } from 'zustand';

interface MeetingStore {
  meetings: any[];
  isLoading: boolean;
  isDialogOpen: boolean;
  setMeetings: (data: any[]) => void;
  openDialog: () => void;
  closeDialog: () => void;
}

export const useMeetingStore = create<MeetingStore>((set) => ({
  meetings: [],
  isLoading: false,
  isDialogOpen: false,
  setMeetings: (data) => set({ meetings: data }),
  openDialog: () => set({ isDialogOpen: true }),
  closeDialog: () => set({ isDialogOpen: false }),
}));
