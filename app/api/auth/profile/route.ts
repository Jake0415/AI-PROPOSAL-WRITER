import { NextRequest, NextResponse } from 'next/server';
import { profileRepository } from '@/lib/repositories/profile.repository';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// 프로필 조회 (자동 upsert)
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_PARAM', message: 'userId가 필요합니다' } },
        { status: 400 },
      );
    }

    // Supabase에서 사용자 정보 가져와 프로필 upsert
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user && user.id === userId) {
      const profile = await profileRepository.upsert({
        id: user.id,
        email: user.email ?? '',
        name: user.user_metadata?.name ?? user.email?.split('@')[0] ?? '',
        avatarUrl: user.user_metadata?.avatar_url ?? null,
      });
      return NextResponse.json({ success: true, data: profile });
    }

    // 다른 사용자 프로필 조회
    const profile = await profileRepository.findByUserId(userId);
    if (!profile) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '프로필을 찾을 수 없습니다' } },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: profile });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'PROFILE_ERROR', message: '프로필 조회에 실패했습니다' } },
      { status: 500 },
    );
  }
}
