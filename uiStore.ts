import { create } from 'zustand';
import { FileData } from '../firebase/firestoreAdapter';

type ModalType = 'keyAuth' | 'fileUpload' | 'fileViewer' | null;

interface UIState {
  activeModal: ModalType;
  viewingFile: FileData | null;
  openModal: (modal: ModalType) => void;
  openFileViewer: (file: FileData) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeModal: null,
  viewingFile: null,
  openModal: (modal) => set({ activeModal: modal }),
  openFileViewer: (file) => set({ activeModal: 'fileViewer', viewingFile: file }),
  closeModal: () => set({ activeModal: null, viewingFile: null }),
}));