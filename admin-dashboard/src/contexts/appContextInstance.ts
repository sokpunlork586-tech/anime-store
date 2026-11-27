import { createContext, useContext } from 'react';
import type { AppContextType } from './AppContext';

const globalForApp = globalThis as unknown as {
  __ANIME_ADMIN_APP_CONTEXT__?: React.Context<AppContextType | null>;
};

export const AppContext =
  globalForApp.__ANIME_ADMIN_APP_CONTEXT__ ??
  (globalForApp.__ANIME_ADMIN_APP_CONTEXT__ = createContext<AppContextType | null>(null));

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
