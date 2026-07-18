import { create } from 'zustand';
import type { Meeting } from '@services/meetings';

interface MeetingStore {
  meetings: Meeting[];
  isLoading: boolean;
  errorMessage: string;
  isDialogOpen: boolean;
  activeTab: string;
  setMeetings: (data: Meeting[]) => void;
  addMeeting: (meeting: Meeting) => void;
  setLoading: (isLoading: boolean) => void;
  setErrorMessage: (message: string) => void;
  openDialog: () => void;
  closeDialog: () => void;
  setActiveTab: (tab: string) => void;
}

export const useMeetingStore = create<MeetingStore>((set) => ({
  meetings: [],
  isLoading: false,
  errorMessage: '',
  isDialogOpen: false,
  activeTab: 'meetings',
  setMeetings: (data) => set({ meetings: data }),
  addMeeting: (meeting) => set((state) => ({ meetings: [meeting, ...state.meetings] })),
  setLoading: (isLoading) => set({ isLoading }),
  setErrorMessage: (message) => set({ errorMessage: message }),
  openDialog: () => set({ isDialogOpen: true }),
  closeDialog: () => set({ isDialogOpen: false }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
