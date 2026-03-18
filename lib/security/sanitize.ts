// 입력 새니타이징 유틸리티

// 파일명 새니타이징 (경로 조작 방지)
export function sanitizeFileName(name: string): string {
  return name
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')  // 특수 문자 제거
    .replace(/\.{2,}/g, '.')                   // 연속 점 제거 (경로 조작 방지)
    .replace(/^\.+|\.+$/g, '')                 // 선행/후행 점 제거
    .trim()
    .slice(0, 255);                            // 길이 제한
}

// MIME 타입 검증
const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  pdf: ['application/pdf'],
  docx: [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
  ],
};

export function isAllowedMimeType(
  mimeType: string,
  allowedTypes: ('pdf' | 'docx')[],
): boolean {
  const allowed = allowedTypes.flatMap((t) => ALLOWED_MIME_TYPES[t] ?? []);
  return allowed.includes(mimeType);
}

// 파일 크기 검증 (바이트 단위)
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function isAllowedFileSize(
  size: number,
  maxSize = MAX_FILE_SIZE,
): boolean {
  return size > 0 && size <= maxSize;
}

// HTML 새니타이징 (XSS 방지)
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
