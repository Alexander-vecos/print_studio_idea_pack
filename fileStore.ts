import { create } from 'zustand';

interface FileState {
  files: File[];
  isLoading: boolean;
  error: string | null;
  addFile: (file: File) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useFileStore = create<FileState>((set) => ({
  files: [],
  isLoading: false,
  error: null,
  addFile: (file: File) =>
    set((state) => ({
      files: [...state.files, file],
    })),
  setLoading: (isLoading: boolean) =>
    set({
      isLoading,
    }),
  setError: (error: string | null) =>
    set({
      error,
      isLoading: false,
    }),
  clearError: () =>
    set({
      error: null,
    }),
}));