import { create } from 'zustand';

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  tenantId: number;
  tenantName: string;
  roles: string[];
  department: { id: number; name: string } | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (user: User) => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
  isSuperUser: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: sessionStorage.getItem('auth-user') ? JSON.parse(sessionStorage.getItem('auth-user')!) : null,
  isAuthenticated: !!sessionStorage.getItem('auth-user'),
  setAuth: (user) => {
    sessionStorage.setItem('auth-user', JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },
  logout: () => {
    sessionStorage.removeItem('auth-user');
    set({ user: null, isAuthenticated: false });
  },
  hasRole: (role: string) => {
    const user = get().user;
    return user?.roles?.includes(role) ?? false;
  },
  isSuperUser: () => {
    const user = get().user;
    return (user?.roles?.includes('Super User') || user?.roles?.includes('system_super_admin')) ?? false;
  }
}));
