import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, momentsAPI } from '../../lib/api';

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
  id: string;
  email: string;
  nickname: string;
  startDate: string;
}

interface AppContextType {
  user: User | null;
  moments: Moment[];
  lifeProgress: number;
  loading: boolean;
  setUser: (user: User | null) => void;
  addMoment: (moment: Omit<Moment, 'id'>) => Promise<void>;
  updateMoment: (id: string, moment: Partial<Moment>) => Promise<void>;
  deleteMoment: (id: string) => Promise<void>;
  getMoment: (id: string) => Moment | undefined;
  login: (email: string, password: string) => Promise<void>;
  loginWithCode: (email: string, code: string) => Promise<void>;
  sendVerificationCode: (email: string) => Promise<string>;
  logout: () => void;
  register: (email: string, nickname: string, password: string) => Promise<void>;
  refreshMoments: () => Promise<void>;
  refreshProgress: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [moments, setMoments] = useState<Moment[]>([]);
  const [lifeProgress, setLifeProgress] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(false);

  // Check for existing auth token on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      authAPI.getCurrentUser()
        .then(response => {
          setUser({
            id: response.user.id,
            email: response.user.email,
            nickname: response.user.nickname,
            startDate: response.user.createdAt,
          });
          refreshMoments();
          refreshProgress();
        })
        .catch(() => {
          localStorage.removeItem('auth_token');
        });
    }
  }, []);

  const refreshMoments = async () => {
    try {
      const response = await momentsAPI.getMoments(1, 100);
      const mappedMoments = response.moments.map((m: any) => ({
        id: m.id,
        date: m.createdAt,
        shortDescription: m.shortDescription || '',
        impact: m.impactPercent / 100,
        isPositive: m.impactType === 'POSITIVE',
        contents: JSON.parse(m.richContent || '[]'),
        images: m.images?.map((img: any) => img.imageUrl) || [],
      }));
      setMoments(mappedMoments);
    } catch (error) {
      console.error('Failed to refresh moments:', error);
    }
  };

  const refreshProgress = async () => {
    try {
      const response = await momentsAPI.getLifeProgress();
      setLifeProgress(response.progress);
    } catch (error) {
      console.error('Failed to refresh progress:', error);
    }
  };

  const register = async (email: string, nickname: string, password: string) => {
    setLoading(true);
    try {
      const response = await authAPI.register(email, nickname, password);
      localStorage.setItem('auth_token', response.token);
      setUser({
        id: response.user.id,
        email: response.user.email,
        nickname: response.user.nickname,
        startDate: response.user.createdAt,
      });
      await refreshMoments();
      await refreshProgress();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authAPI.login(email, password);
      localStorage.setItem('auth_token', response.token);
      setUser({
        id: response.user.id,
        email: response.user.email,
        nickname: response.user.nickname,
        startDate: response.user.createdAt,
      });
      await refreshMoments();
      await refreshProgress();
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationCode = async (email: string): Promise<string> => {
    const response = await authAPI.sendVerificationCode(email);
    return response.code;
  };

  const loginWithCode = async (email: string, code: string) => {
    setLoading(true);
    try {
      const response = await authAPI.verifyCode(email, code);
      localStorage.setItem('auth_token', response.token);
      setUser({
        id: response.user.id,
        email: response.user.email,
        nickname: response.user.nickname,
        startDate: response.user.createdAt,
      });
      await refreshMoments();
      await refreshProgress();
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setMoments([]);
    setLifeProgress(1.0);
  };

  const addMoment = async (moment: Omit<Moment, 'id'>) => {
    setLoading(true);
    try {
      const richContent = JSON.stringify(moment.contents);
      await momentsAPI.createMoment({
        shortDescription: moment.shortDescription,
        richContent,
        impactPercent: moment.impact * 100,
        impactType: moment.isPositive ? 'POSITIVE' : 'NEGATIVE',
        images: moment.images,
      });
      await refreshMoments();
      await refreshProgress();
    } finally {
      setLoading(false);
    }
  };

  const updateMoment = async (id: string, updates: Partial<Moment>) => {
    setLoading(true);
    try {
      const apiUpdates: any = {};
      if (updates.shortDescription !== undefined) {
        apiUpdates.shortDescription = updates.shortDescription;
      }
      if (updates.contents !== undefined) {
        apiUpdates.richContent = JSON.stringify(updates.contents);
      }
      if (updates.impact !== undefined) {
        apiUpdates.impactPercent = updates.impact * 100;
      }
      if (updates.isPositive !== undefined) {
        apiUpdates.impactType = updates.isPositive ? 'POSITIVE' : 'NEGATIVE';
      }

      await momentsAPI.updateMoment(id, apiUpdates);
      await refreshMoments();
      await refreshProgress();
    } finally {
      setLoading(false);
    }
  };

  const deleteMoment = async (id: string) => {
    setLoading(true);
    try {
      await momentsAPI.deleteMoment(id);
      await refreshMoments();
      await refreshProgress();
    } finally {
      setLoading(false);
    }
  };

  const getMoment = (id: string) => {
    return moments.find((m) => m.id === id);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        moments,
        lifeProgress,
        loading,
        setUser,
        addMoment,
        updateMoment,
        deleteMoment,
        getMoment,
        login,
        loginWithCode,
        sendVerificationCode,
        logout,
        register,
        refreshMoments,
        refreshProgress,
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
