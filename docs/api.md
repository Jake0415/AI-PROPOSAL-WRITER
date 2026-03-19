# API 문서

모든 API는 `/api` 경로 하위에 위치하며, JSON 응답을 반환합니다.

## 응답 형식

```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "total": 100 }
}
```

오류 시:
```json
{
  "success": false,
  "error": { "code": "ERROR_CODE", "message": "설명" }
}
```

## 인증

### POST /api/auth/login
로그인 후 세션 쿠키 발급

```json
{ "loginId": "superadmin", "password": "admin1234" }
```

### POST /api/auth/logout
세션 쿠키 삭제

### GET /api/auth/me
현재 로그인 사용자 정보 반환

### POST /api/auth/register
신규 사용자 등록 (관리자 전용)

## 프로젝트

### GET /api/projects
프로젝트 목록 조회

### POST /api/projects
새 프로젝트 생성

### GET /api/projects/[id]
프로젝트 상세 조회

### DELETE /api/projects/[id]
프로젝트 삭제

## RFP

### POST /api/projects/[id]/rfp/upload
RFP 파일 업로드 (multipart/form-data)

### POST /api/projects/[id]/rfp/analyze
RFP AI 분석 실행 (SSE 스트리밍)

### GET /api/projects/[id]/rfp/analysis
RFP 분석 결과 조회

## 방향성

### POST /api/projects/[id]/direction/generate
제안 방향성 AI 생성 (SSE 스트리밍)

### POST /api/projects/[id]/direction/select
방향성 선택

### GET /api/projects/[id]/direction
현재 방향성 조회

## 전략

### POST /api/projects/[id]/strategy/generate
전략 AI 생성 (SSE 스트리밍)

## 목차

### POST /api/projects/[id]/outline/generate
목차 AI 생성 (SSE 스트리밍)

### GET /api/projects/[id]/outline
목차 조회

### PUT /api/projects/[id]/outline
목차 수정

## 섹션

### POST /api/projects/[id]/sections/generate
전체 섹션 AI 생성 (SSE 스트리밍)

### GET /api/projects/[id]/sections
섹션 목록 조회

### PUT /api/projects/[id]/sections/[sectionId]
섹션 내용 수정

### POST /api/projects/[id]/sections/[sectionId]/regenerate
개별 섹션 재생성

## 검토

### POST /api/projects/[id]/review/generate
AI 검토 리포트 생성 (SSE 스트리밍)

### GET /api/projects/[id]/review
검토 결과 조회

## 가격

### POST /api/projects/[id]/price/generate
가격 제안서 AI 생성 (SSE 스트리밍)

### GET /api/projects/[id]/price
가격 제안서 조회

## 산출물

### POST /api/projects/[id]/output/generate
Word/PPT 문서 생성 및 다운로드

```json
{ "type": "word", "templateId": "optional-uuid" }
```

## 템플릿

### GET /api/templates
템플릿 목록 조회

### POST /api/templates/upload
템플릿 업로드 (multipart/form-data, .docx/.pptx)

### DELETE /api/templates/[id]
템플릿 삭제

## 관리자

### GET /api/admin/users
사용자 목록 조회

### GET /api/admin/stats
대시보드 통계

### GET /api/admin/audit-logs
감사 로그 조회 (필터: userId, action, resourceType, from, to, page, limit)

### POST /api/admin/export
전체 데이터 JSON 내보내기

### POST /api/admin/import
JSON 데이터 가져오기 (복구)

## 설정

### GET/PUT /api/settings/ai
AI 설정 (프로바이더, 모델)

### POST /api/settings/ai/test
AI 연결 테스트

### GET/PUT /api/settings/tenant
테넌트 설정 (앱이름, 로고, 테마색상)

## 시스템

### GET /api/health
헬스체크

### POST /api/setup
초기 Super Admin 설정
