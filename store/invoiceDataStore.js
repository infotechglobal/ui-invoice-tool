import { create } from 'zustand'


const useInvoiceData = create((set) => ({
    invoiceData: [],
    setInvoiceData: (newData) => set((state) => ({
        invoiceData: newData
    })),
}))

export { useInvoiceData }
