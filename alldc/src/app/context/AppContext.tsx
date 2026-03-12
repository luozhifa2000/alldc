import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface MomentContent {
  type: 'text' | 'image';
  content: string;
}

export interface Moment {
  id: string;
  date: string;
  shortDescription: string;
  impact: number; // percentage as decimal (e.g., 0.001 for +0.1%)
  isPositive: boolean;
  contents: MomentContent[];
  images: string[]; // thumbnails
}

export interface User {
  email: string;
  nickname: string;
  startDate: string;
}

interface AppContextType {
  user: User | null;
  moments: Moment[];
  lifeProgress: number;
  setUser: (user: User | null) => void;
  addMoment: (moment: Omit<Moment, 'id'>) => void;
  updateMoment: (id: string, moment: Partial<Moment>) => void;
  deleteMoment: (id: string) => void;
  getMoment: (id: string) => Moment | undefined;
  login: (email: string) => void;
  logout: () => void;
  register: (email: string, nickname: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [moments, setMoments] = useState<Moment[]>([]);

  // Calculate life progress using compounding formula
  const calculateLifeProgress = (moments: Moment[]): number => {
    // Sort moments by date
    const sortedMoments = [...moments].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let progress = 1;
    for (const moment of sortedMoments) {
      const impact = moment.isPositive ? moment.impact : -moment.impact;
      progress = progress * (1 + impact);
    }

    return progress;
  };

  const lifeProgress = calculateLifeProgress(moments);

  const addMoment = (moment: Omit<Moment, 'id'>) => {
    const newMoment: Moment = {
      ...moment,
      id: Date.now().toString(),
    };
    setMoments((prev) => [...prev, newMoment]);
  };

  const updateMoment = (id: string, updates: Partial<Moment>) => {
    setMoments((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  };

  const deleteMoment = (id: string) => {
    setMoments((prev) => prev.filter((m) => m.id !== id));
  };

  const getMoment = (id: string) => {
    return moments.find((m) => m.id === id);
  };

  const login = (email: string) => {
    // Mock login - in real app would verify credentials
    const mockUser: User = {
      email,
      nickname: 'User',
      startDate: new Date().toISOString(),
    };
    setUser(mockUser);
  };

  const logout = () => {
    setUser(null);
  };

  const register = (email: string, nickname: string) => {
    const newUser: User = {
      email,
      nickname,
      startDate: new Date().toISOString(),
    };
    setUser(newUser);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        moments,
        lifeProgress,
        setUser,
        addMoment,
        updateMoment,
        deleteMoment,
        getMoment,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
