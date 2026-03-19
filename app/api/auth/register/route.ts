import { NextResponse } from 'next/server';

// 공개 회원가입 비활성화 - 사용자 등록은 관리자 API를 통해서만 가능
export async function POST() {
  return NextResponse.json(
    { success: false, error: { code: 'DISABLED', message: '회원가입이 비활성화되었습니다. 관리자에게 문의하세요.' } },
    { status: 403 },
  );
}
