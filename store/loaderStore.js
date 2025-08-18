import { create } from 'zustand'

const useLoaderStore = create((set) => ({
  message:"s",
  isLoading:false,

  showLoader: (message) => set((state) => ({
    message: message,
    isLoading: true
  })),

  hideLoader: () => set((state) => ({
    message: "",
    isLoading: false
  }))
}))

export default useLoaderStore;
 