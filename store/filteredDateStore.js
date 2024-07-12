// dateStore.js
import {create} from 'zustand';
import { addDays, startOfYear, endOfYear } from 'date-fns';

export const useDateStore = create((set) => ({
  date: {
    from: startOfYear(new Date()),
    to: endOfYear(new Date()),
  },
  setDate: (newDate) => set({ 
    date: newDate }),
}));
