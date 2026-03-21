'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Profile {
  id: string;
  loginId: string;
  name: string;
  phone: string;
  department: string;
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

  const fetchMe = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  async function signOut() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/auth/login');
    router.refresh();
  }

  return { ...state, signOut };
}
