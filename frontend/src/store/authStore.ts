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
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
  isSuperUser: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: localStorage.getItem('auth-user') ? JSON.parse(localStorage.getItem('auth-user')!) : null,
  token: localStorage.getItem('auth-token'),
  isAuthenticated: !!localStorage.getItem('auth-token'),
  setAuth: (user, token) => {
    localStorage.setItem('auth-user', JSON.stringify(user));
    localStorage.setItem('auth-token', token);
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('auth-user');
    localStorage.removeItem('auth-token');
    set({ user: null, token: null, isAuthenticated: false });
  },
  hasRole: (role: string) => {
    const user = get().user;
    return user?.roles?.includes(role) ?? false;
  },
  isSuperUser: () => {
    const user = get().user;
    return user?.roles?.includes('Super User') || user?.roles?.includes('system_super_admin') ?? false;
  }
}));
