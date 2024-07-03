import { create } from 'zustand'

const useAlertMessage = create((set) => ({
  message:"",
  satus:"",

  showAlert: (message, status) => set((state) => ({
    message: message,
    status: status,
  })),
}))
 



const usefileAlert = create((set) => ({
  isLoading:false,
  

  toggleState: () => set((state) => ({
    isLoading: !state.isLoading
  })),
}))



export  {usefileAlert,useAlertMessage}