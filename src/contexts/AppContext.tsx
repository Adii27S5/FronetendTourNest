import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { API_BASE_URL } from '@/config/api';
import apiClient from '@/config/axios';
import { translations } from '@/lib/translations';
import { toast } from 'sonner';

// Types
interface Favorite {
  id: string | number;
  type: 'homestay' | 'attraction' | 'hotel';
  itemId?: string | number;
  data: any;
  details?: any;
}

interface UserPreferences {
  currency: string;
  language: string;
  notifications: boolean;
}

interface AppContextType {
  favorites: Favorite[];
  addFavorite: (item: Favorite) => void;
  removeFavorite: (id: string | number) => void;
  isFavorite: (id: string | number) => boolean;
  userPreferences: UserPreferences;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  searchHistory: string[];
  addToSearchHistory: (query: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  t: (key: keyof typeof translations.en) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State with localStorage persistence
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    currency: 'INR',
    language: 'en',
    notifications: true,
  });
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const { user } = useAuth();
  const API_URL = `${API_BASE_URL}/api/favorites`;

  // Fetch favorites from backend
  const fetchFavorites = async () => {
    try {
      const url = user?.email ? `${API_URL}?email=${user.email}` : API_URL;
      const response = await apiClient.get(url);
      setFavorites(response.data);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFavorites();
      syncUserData();
    } else {
      setFavorites([]);
      setSearchHistory([]);
    }
  }, [user]);

  const syncUserData = async () => {
    if (!user?.email) return;
    try {
      const [prefsRes, historyRes] = await Promise.all([
        apiClient.get(`/api/users/${user.email}`),
        apiClient.get(`/api/search-history?email=${user.email}`)
      ]);
      
      if (prefsRes.data) {
        setUserPreferences({
          language: prefsRes.data.language || 'en',
          currency: prefsRes.data.currency || 'INR',
          notifications: true
        });
        setTheme(prefsRes.data.theme || 'light');
      }
      
      if (historyRes.data) {
        setSearchHistory(historyRes.data.map((h: any) => h.query));
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        console.warn("User data not found on backend. This might be a first-time login or seeding issue.", user.email);
      } else {
        console.error("Sync error:", err);
      }
    }
  };

  // Persist preferences to localStorage
  useEffect(() => {
    localStorage.setItem('user_preferences', JSON.stringify(userPreferences));
  }, [userPreferences]);

  // Persist search history to localStorage
  useEffect(() => {
    localStorage.setItem('search_history', JSON.stringify(searchHistory));
  }, [searchHistory]);

  // Persist theme to localStorage and apply to document
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Favorite management functions
  const addFavorite = async (item: Favorite) => {
    if (!user) {
      toast.error(t("identificationRequired") + " - Please login to add to favorites.");
      return;
    }
    try {
      await apiClient.post(API_URL, { 
          type: item.type, 
          itemId: item.id,
          userEmail: user?.email 
      });
      fetchFavorites();
    } catch (error) {
      console.error("Error adding favorite:", error);
    }
  };

  const removeFavorite = async (id: string | number) => {
    if (!user) return;
    try {
      const favToRemove = favorites.find(f => f.id === id);
      if (favToRemove) {
          await apiClient.delete(`${API_URL}/${favToRemove.id}`);
          fetchFavorites();
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  const isFavorite = (id: string | number | undefined) => {
    if (id === undefined || id === null) return false;
    const idStr = id.toString();
    return favorites.some(fav => fav.itemId?.toString() === idStr || fav.id?.toString() === idStr);
  };

  const updatePreferences = async (prefs: Partial<UserPreferences>) => {
    setUserPreferences(prev => {
        const next = { ...prev, ...prefs };
        if (user?.email) {
            apiClient.put(`/api/users/${user.email}`, {
                language: next.language,
                currency: next.currency,
                theme: theme
            });
        }
        return next;
    });
  };

  const addToSearchHistory = async (query: string) => {
    if (user?.email) {
        await apiClient.post('/api/search-history', { userEmail: user.email, query });
    }
    setSearchHistory(prev => {
      const filtered = prev.filter(q => q !== query);
      return [query, ...filtered].slice(0, 10);
    });
  };

  const toggleTheme = () => {
    setTheme(prev => {
        const next = prev === 'light' ? 'dark' : 'light';
        if (user?.email) {
            apiClient.put(`/api/users/${user.email}`, { theme: next });
        }
        return next;
    });
  };

  const t = (key: keyof typeof translations.en) => {
    const lang = (userPreferences.language?.toLowerCase() === 'hi' ? 'hi' : 'en') as 'en' | 'hi';
    return translations[lang][key] || translations.en[key] || key;
  };

  return (
    <AppContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        userPreferences,
        updatePreferences,
        searchHistory,
        addToSearchHistory,
        theme,
        toggleTheme,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
