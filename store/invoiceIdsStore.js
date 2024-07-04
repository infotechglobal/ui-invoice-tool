import {create} from 'zustand';

const useFileNameStore = create((set) => ({
  fileName: null,
  setFileName: (newFileName) => set({ fileName: newFileName }),
}));

const useParentFolderIdStore = create((set) => ({
  parentFolderId: null,
  setParentFolderId: (newParentFolderId) => set({ parentFolderId: newParentFolderId }),
}));

const useCsvFolderIdStore = create((set) => ({
  csvFolderId: null,
  setCsvFolderId: (newCsvFolderId) => set({ csvFolderId: newCsvFolderId }),
}));

const usePdfFolderIdStore = create((set) => ({
  pdfFolderId: null,
  setPdfFolderId: (newPdfFolderId) => set({ pdfFolderId: newPdfFolderId }),
}));

export { useFileNameStore, useParentFolderIdStore, useCsvFolderIdStore, usePdfFolderIdStore };
