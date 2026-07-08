import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'FARMER' | 'EXPERT' | 'ADMIN';
  language: string;
}

interface AppState {
  user: User | null;
  token: string | null;
  currentLanguage: string;
  activeFarmId: string | null;
  isOffline: boolean;
  
  setUser: (user: User | null, token: string | null) => void;
  setLanguage: (lang: string) => void;
  setActiveFarmId: (farmId: string | null) => void;
  setOffline: (offline: boolean) => void;
  logout: () => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  token: null,
  currentLanguage: 'en',
  activeFarmId: null,
  isOffline: false,

  setUser: (user, token) => {
    if (token && user) {
      localStorage.setItem('kisan_token', token);
      localStorage.setItem('kisan_user', JSON.stringify(user));
      localStorage.setItem('kisan_lang', user.language || 'en');
      set({ user, token, currentLanguage: user.language || 'en' });
    } else {
      localStorage.removeItem('kisan_token');
      localStorage.removeItem('kisan_user');
      set({ user: null, token: null });
    }
  },

  setLanguage: async (lang) => {
    localStorage.setItem('kisan_lang', lang);
    
    // Update local state (currentLanguage and language field inside the user object)
    set((state) => {
      const updatedUser = state.user ? { ...state.user, language: lang } : null;
      if (updatedUser) {
        localStorage.setItem('kisan_user', JSON.stringify(updatedUser));
      }
      return { currentLanguage: lang, user: updatedUser };
    });

    const token = localStorage.getItem('kisan_token');
    if (token) {
      try {
        const API_BASE_URL = 'http://localhost:5000';
        await fetch(`${API_BASE_URL}/api/auth/language`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ language: lang })
        });
      } catch (err) {
        console.error('Failed to save language preference on backend:', err);
      }
    }
  },

  setActiveFarmId: (farmId) => set({ activeFarmId: farmId }),
  setOffline: (offline) => set({ isOffline: offline }),

  logout: () => {
    localStorage.removeItem('kisan_token');
    localStorage.removeItem('kisan_user');
    set({ user: null, token: null, activeFarmId: null });
  },
}));

// Load initial state if in browser
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('kisan_token');
  const userStr = localStorage.getItem('kisan_user');
  const lang = localStorage.getItem('kisan_lang') || 'en';
  
  if (token && userStr) {
    try {
      useStore.setState({ token, user: JSON.parse(userStr), currentLanguage: lang });
    } catch (_) {}
  }
}
