import { create } from 'zustand'


const useFileStore = create((set) => ({
    uploadedFiles:null,
    addNewFiles: (newFiles) => set((state) => ({
      uploadedFiles: newFiles
    })),
  }))

  const usePageLocationStore = create((set) => ({
    pageLocation: null,
    setPageLocation: (newLocation) => set((state) => ({
      pageLocation: newLocation
    })),
  }))


  export {useFileStore, usePageLocationStore}