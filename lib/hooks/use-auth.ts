'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl: string | null;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
}

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    isLoading: true,
  });

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    // 초기 사용자 로드
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setState((prev) => ({ ...prev, user: data.user }));
        fetchProfile(data.user.id);
      } else {
        setState({ user: null, profile: null, isLoading: false });
      }
    });

    // 인증 상태 변화 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setState((prev) => ({ ...prev, user }));
      if (user) {
        fetchProfile(user.id);
      } else {
        setState({ user: null, profile: null, isLoading: false });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    try {
      const res = await fetch(`/api/auth/profile?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setState((prev) => ({ ...prev, profile: data.data, isLoading: false }));
          return;
        }
      }
    } catch {
      // 프로필 로드 실패
    }
    setState((prev) => ({ ...prev, isLoading: false }));
  }

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  }

  return { ...state, signOut };
}
