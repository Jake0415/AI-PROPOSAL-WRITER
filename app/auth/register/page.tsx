import { redirect } from 'next/navigation';

// 공개 회원가입 비활성화 - 사용자 등록은 관리자만 가능
export default function RegisterPage() {
  redirect('/auth/login');
}
