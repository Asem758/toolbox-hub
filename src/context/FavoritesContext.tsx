import React, { createContext, useContext, useState, useEffect } from 'react';

interface FavoritesContextType {
  favorites: string[];
  recentTools: string[];
  isFavorite: (toolId: string) => boolean;
  toggleFavorite: (toolId: string) => void;
  recordToolUsage: (toolId: string) => void;
  clearRecents: () => void;
}

const FAVORITES_STORAGE_KEY = 'toolbox_favorites_list';
const RECENTS_STORAGE_KEY = 'toolbox_recent_tools_list';

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : ['word-counter', 'qr-code-generator', 'image-compressor', 'json-formatter'];
    } catch {
      return ['word-counter', 'qr-code-generator', 'image-compressor', 'json-formatter'];
    }
  });

  const [recentTools, setRecentTools] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(RECENTS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : ['word-counter', 'text-case-converter', 'qr-code-generator'];
    } catch {
      return ['word-counter', 'text-case-converter', 'qr-code-generator'];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.warn('Could not save favorites', e);
    }
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem(RECENTS_STORAGE_KEY, JSON.stringify(recentTools));
    } catch (e) {
      console.warn('Could not save recent tools', e);
    }
  }, [recentTools]);

  const isFavorite = (toolId: string) => favorites.includes(toolId);

  const toggleFavorite = (toolId: string) => {
    setFavorites((prev) =>
      prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId]
    );
  };

  const recordToolUsage = (toolId: string) => {
    setRecentTools((prev) => {
      const filtered = prev.filter((id) => id !== toolId);
      return [toolId, ...filtered].slice(0, 10);
    });
  };

  const clearRecents = () => {
    setRecentTools([]);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        recentTools,
        isFavorite,
        toggleFavorite,
        recordToolUsage,
        clearRecents,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
