# Task 001: 프로젝트 초기 설정

## 상태: ✅ 완료

## Phase: 1 - 애플리케이션 골격 구축

## 목표

AIPROWRITER 프로젝트의 기반을 구축. 필요한 패키지 설치, 디렉토리 구조 생성, 기존 스타터킷 파일을 AIPROWRITER 브랜딩으로 수정.

## 구현 사항

- [x] 핵심 패키지 설치 (drizzle-orm, better-sqlite3, @anthropic-ai/sdk, pdf-parse, mammoth, docx, docxtemplater, pizzip, pptxgenjs, zod, uuid)
- [x] 타입 패키지 설치 (@types/better-sqlite3, @types/pdf-parse, @types/uuid)
- [x] 디렉토리 구조 생성 (lib/db, lib/ai, lib/services, lib/repositories, lib/validators, data/, components/project, rfp, proposal, output)
- [x] package.json 이름 변경 (temp → aiprowriter)
- [x] app/layout.tsx 메타데이터 변경 (AIPROWRITER 브랜딩)
- [x] navbar.tsx 네비게이션 변경 (대시보드/템플릿/설정)
- [x] next.config.ts serverExternalPackages 추가
- [x] .env.example ANTHROPIC_API_KEY 추가
- [x] .gitignore data/ 디렉토리 제외

## 관련 파일

- `package.json`
- `app/layout.tsx`
- `components/layout/navbar.tsx`
- `next.config.ts`
- `.env.example`
- `.gitignore`

## 변경 사항 요약

스타터킷에서 AIPROWRITER로 전환 완료. 19개 npm 패키지 추가, 8개 디렉토리 생성, 6개 기존 파일 수정.
