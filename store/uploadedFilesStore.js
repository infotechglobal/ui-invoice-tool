import { create } from 'zustand'


const useFileStore = create((set) => ({
    uploadedFiles:null,
    addNewFiles: (newFiles) => set((state) => ({
      uploadedFiles: newFiles
    })),
  }))


  export {useFileStore}