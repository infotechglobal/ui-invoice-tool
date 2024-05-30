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
 


const useFileStore = create((set) => ({
  uploadedFiles:null,
  addNewFiles: (newFiles) => set((state) => ({
    uploadedFiles: newFiles
  })),
}))

export  {useFileStore,usefileAlert,useAlertMessage}
