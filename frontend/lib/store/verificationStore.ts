import { create } from 'zustand';

export interface Verification {
  id: string;
  type: string;
  aiScore: number;
  classification: string;
  confidence: number;
  timestamp: Date;
}

interface VerificationStore {
  verifications: Verification[];
  addVerification: (verification: Verification) => void;
  getVerification: (id: string) => Verification | undefined;
  clearVerifications: () => void;
}

export const useVerificationStore = create<VerificationStore>((set, get) => ({
  verifications: [],
  addVerification: (verification) =>
    set((state) => ({ verifications: [verification, ...state.verifications] })),
  getVerification: (id) => get().verifications.find((v) => v.id === id),
  clearVerifications: () => set({ verifications: [] }),
}));
