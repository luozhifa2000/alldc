import { supabase } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://vhrzyhqnlngrtvfedzmr.supabase.co/functions/v1';

// Helper function to make API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('auth_token');
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

// Auth API
export const authAPI = {
  async register(email: string, nickname: string, password: string) {
    return apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, nickname, password }),
    });
  },

  async login(email: string, password: string) {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async sendVerificationCode(email: string) {
    return apiCall('/auth/send-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async verifyCode(email: string, code: string) {
    return apiCall('/auth/verify-code', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  },

  async getCurrentUser() {
    return apiCall('/auth/me', {
      method: 'GET',
    });
  },
};

// Moments API
export const momentsAPI = {
  async getMoments(page: number = 1, limit: number = 15) {
    return apiCall(`/moments?page=${page}&limit=${limit}`, {
      method: 'GET',
    });
  },

  async getMoment(id: string) {
    return apiCall(`/moments/${id}`, {
      method: 'GET',
    });
  },

  async createMoment(data: {
    shortDescription: string;
    richContent: string;
    impactPercent: number;
    impactType: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    images?: string[];
  }) {
    return apiCall('/moments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateMoment(id: string, data: Partial<{
    shortDescription: string;
    richContent: string;
    impactPercent: number;
    impactType: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  }>) {
    return apiCall(`/moments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteMoment(id: string) {
    return apiCall(`/moments/${id}`, {
      method: 'DELETE',
    });
  },

  async getLifeProgress() {
    return apiCall('/moments/progress', {
      method: 'GET',
    });
  },
};

// Image upload to Supabase Storage
export const uploadImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `moment-images/${fileName}`;

  const { data, error } = await supabase.storage
    .from('moments')
    .upload(filePath, file);

  if (error) {
    throw new Error(error.message);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('moments')
    .getPublicUrl(filePath);

  return publicUrl;
};

// Convert base64 to File
export const base64ToFile = (base64: string, filename: string): File => {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

