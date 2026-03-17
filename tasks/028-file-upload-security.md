# Task 028: 파일 업로드 — Supabase Storage 전환

## 상태: 대기

## Phase: 2.5 - 프로덕션 기반 인프라

## 우선순위: 높음 (HIGH)

## 목표

RFP 파일 업로드를 로컬 파일시스템에서 Supabase Storage로 전환한다. 파일 검증(크기, 타입)을 강화하고, Storage 정책으로 접근 제어를 적용한다.

## Supabase Storage 활용 장점

- CDN 기반 파일 서빙
- RLS 기반 접근 제어 (인증된 사용자만)
- 자동 백업 (Supabase 관리)
- 파일 크기 제한 정책 지원

## 구현 사항

### Supabase Storage 설정

- [ ] Supabase 대시보드에서 버킷 생성
  - `rfp-files` (비공개, 인증 필요)
  - `output-files` (비공개, 인증 필요)
  - `templates` (비공개, 인증 필요)
- [ ] Storage 정책: 인증된 사용자만 업로드/다운로드
- [ ] 파일 크기 제한: 50MB (Supabase 설정)

### 파일 검증 서비스

- [ ] lib/services/file-validator.service.ts (신규)
  - 허용 확장자: .pdf, .docx만
  - MIME 타입 검증 (magic bytes)
  - 파일명 새니타이징
- [ ] 검증 실패 시 명확한 에러 메시지

### 업로드 API 전환

- [ ] rfp/upload/route.ts 수정
  - 로컬 writeFile → supabase.storage.upload
  - filePath → Supabase Storage URL 저장
  - 파일 검증 서비스 적용
- [ ] rfpFiles 테이블: filePath를 Storage path로 저장

### 다운로드 처리

- [ ] Supabase Storage signed URL로 다운로드 제공
- [ ] 산출물(Word/PPT) 다운로드도 Storage 경유

## 관련 파일

- `lib/services/file-validator.service.ts` (신규)
- `app/api/projects/[id]/rfp/upload/route.ts` (수정)
- `lib/supabase/storage.ts` (신규, Storage 헬퍼)

## 의존성

- Task 023 완료 필요 (Supabase 클라이언트)

## 테스트 체크리스트

- [ ] PDF 업로드 → Supabase Storage 저장 확인
- [ ] DOCX 업로드 → 저장 확인
- [ ] .exe 파일 → 거부
- [ ] 50MB 초과 → 거부
- [ ] MIME 타입 위조 → 거부
- [ ] 인증 없이 파일 접근 → 거부
