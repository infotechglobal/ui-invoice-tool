import { create } from 'zustand'


const usefileAlert = create((set) => ({
  isLoading:false,
  toggleState: () => set((state) => ({
    isLoading: !state.isLoading
  })),
}))
 


const useFileStore = create((set) => ({
  uploadedFiles: [],
  addNewFile: (newFile) => set((state) => ({
    uploadedFiles: [ newFile,...state.uploadedFiles]
  })),
}))

export  {useFileStore,usefileAlert}
