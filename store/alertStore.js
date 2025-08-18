import { create } from 'zustand'

const useAlertMessage = create((set) => ({
  message:"lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet",
  status:"Error",
  isLoading:true,
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