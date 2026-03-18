'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Profile {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl: string | null;
}

interface AuthState {
  profile: Profile | null;
  isLoading: boolean;
}

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    profile: null,
    isLoading: true,
  });

  useEffect(() => {
    fetchMe();
  }, []);

  async function fetchMe() {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setState({ profile: data.data, isLoading: false });
          return;
        }
      }
    } catch {
      // 인증 확인 실패
    }
    setState({ profile: null, isLoading: false });
  }

  async function signOut() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/auth/login');
    router.refresh();
  }

  return { ...state, signOut };
}
