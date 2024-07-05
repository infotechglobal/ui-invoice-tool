import { create } from 'zustand'

const useAlertMessage = create((set) => ({
  message:"",
  status:"",
  isLoading:false,
  showAlert: (message, status) => set((state) => ({
    message: message,
    status: status,
    isLoading: true
  })),
  hideAlert: () => set((state) => ({
    message: "",
    status: "",
    isLoading: false
  }))
}))
 






export  {useAlertMessage}