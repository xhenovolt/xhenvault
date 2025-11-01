import { create } from 'zustand';

export const useThemeStore = create((set) => ({
  theme: typeof window !== 'undefined' ? localStorage.getItem('xhenvault-theme') || 'auto' : 'auto',
  setTheme: (theme) => {
    set({ theme });
    if (typeof window !== 'undefined') {
      if (theme === 'auto') {
        document.documentElement.classList.remove('dark', 'light');
      } else {
        document.documentElement.classList.remove('dark', 'light');
        document.documentElement.classList.add(theme);
      }
      localStorage.setItem('xhenvault-theme', theme);
    }
  },
  initTheme: () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('xhenvault-theme');
      if (saved) {
        if (saved === 'auto') {
          document.documentElement.classList.remove('dark', 'light');
        } else {
          document.documentElement.classList.remove('dark', 'light');
          document.documentElement.classList.add(saved);
        }
      }
    }
  },
}));