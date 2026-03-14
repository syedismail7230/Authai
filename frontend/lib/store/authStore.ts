import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
  company?: string;
  role?: string;
  isOnboarded?: boolean;
  wallet: number;
  referralCode?: string;
}

interface AuthStore {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  updateUser: (userUpdates: Partial<User>) => void;
  logout: () => void;
  restoreSession: () => void;
  updateWallet: (newBalance: number) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token: string, user: User) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', token);
        }
        set({ token, user, isAuthenticated: true });
      },
      updateUser: (userUpdates: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userUpdates } as User });
        }
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
        }
        set({ token: null, user: null, isAuthenticated: false });
      },
      restoreSession: () => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('authToken');
          if (token) {
            set({ token, isAuthenticated: true });
          }
        }
      },
      updateWallet: (newBalance: number) => {
        const user = get().user;
        if (user) {
          set({ user: { ...user, wallet: newBalance } });
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
