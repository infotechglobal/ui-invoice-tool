// filteredInvoiceDataStore.js
import {create} from 'zustand';

const useFilteredInvoiceDataStore = create((set) => ({
    filteredInvoiceData: [],
    setFilteredInvoiceData: (data) => set({ filteredInvoiceData: data }),
}));

export default useFilteredInvoiceDataStore;
