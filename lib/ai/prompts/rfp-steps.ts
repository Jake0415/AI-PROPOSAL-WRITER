// 7단계 RFP 분석 프롬프트

export const RFP_STEP_DEFINITIONS = [
  { stepNumber: 1, slug: 'rfp-step1-overview', name: 'Step 1: 사업 개요', label: '사업 개요 파악',
    searchQuery: '사업명 발주기관 예산 사업비 기간 목적 배경 계약 입찰 하도급 보안 납품' },
  { stepNumber: 2, slug: 'rfp-step2-evaluation', name: 'Step 2: 평가항목', label: '평가항목 추출 + 배점 검증',
    searchQuery: '평가항목 배점 기술평가 가격평가 배점표 평가기준 가중치 점수 채점' },
  { stepNumber: 3, slug: 'rfp-step3-requirements', name: 'Step 3: 요구사항', label: '요구사항 도출 (7개 카테고리)',
    searchQuery: '요구사항 기능 성능 보안 데이터 인터페이스 품질 구축 개발 운영 시스템' },
  { stepNumber: 4, slug: 'rfp-step4-traceability', name: 'Step 4: 추적성', label: '추적성 매트릭스 생성',
    searchQuery: '요구사항 평가항목 매핑 추적성 제안서 목차 챕터 구성' },
  { stepNumber: 5, slug: 'rfp-step5-qualifications', name: 'Step 5: 자격요건', label: '자격요건/범위/제약',
    searchQuery: '입찰 참가자격 사업자 등록 실적 하도급 하자보수 납기 범위 제약 보안등급' },
  { stepNumber: 6, slug: 'rfp-step6-strategy', name: 'Step 6: 배점 전략', label: '배점 전략 분석',
    searchQuery: '배점 전략 고배점 차별화 경쟁력 핵심 강점 제안 방향 수주' },
  { stepNumber: 7, slug: 'rfp-step7-chapters', name: 'Step 7: 배분 가이드', label: '배점 배분 가이드 + 키워드',
    searchQuery: '목차 구성 챕터 페이지 배분 키워드 핵심 용어 기술 제안서 작성' },
];

// ─── 공통 분석 원칙 ───────────────────────────────────────────
const COMMON_PRINCIPLES = `
## 공통 분석 원칙
1. RFP 원문에 명시된 내용만 추출합니다. 추측하거나 창작하지 마세요.
2. 마크다운 테이블(|열1|열2|)로 제공된 정보도 정확히 파싱하세요.
3. 금액은 원 단위로 통일합니다 (예: "12억" → "1,200,000,000원").
4. 날짜/기간은 원문 표현 그대로 기재합니다.
5. 찾을 수 없는 필드는 "미기재"로 표시합니다. 빈 문자열("")을 넣지 마세요.
6. ID 체계(EVAL-XXX, REQ-XX-XXX)를 정확히 지켜주세요.
7. 반드시 순수 JSON으로만 응답하세요. 설명이나 마크다운을 포함하지 마세요.`;

// ─── Step 1: 사업 개요 파악 ───────────────────────────────────

export const STEP1_SYSTEM = `당신은 한국 공공입찰 제안서 분석 전문가입니다.
RFP(제안요청서)에서 사업 개요를 정확하고 빠짐없이 추출합니다.
공공 SI/SW개발/운영/유지보수/컨설팅 등 다양한 유형의 사업에 범용으로 적용됩니다.
${COMMON_PRINCIPLES}`;

export function buildStep1Prompt(rfpText: string): string {
  return `다음 RFP 관련 내용에서 사업 개요를 체계적으로 추출하세요.

## RFP 관련 내용
${rfpText}

## 추출 가이드

### 기본 정보
- projectName: 정식 사업명 (약칭이 아닌 전체 명칭. 표지 또는 첫 페이지 참조)
- client: 발주기관명 (주관기관, 수요기관, 수요부서 포함)
- supervisingOrg: 감독/감리 기관 (PMO, 감리사 등. 없으면 "미기재")
- budget: 예산 금액 (부가세 포함/별도 명시. "총 사업비" 또는 "추정가격" 기준)
- duration: 사업 기간 (착수일~종료일, "계약일로부터 N일/개월" 등 원문 그대로)
- contractType: 계약 유형 (총액계약, 단가계약, 총액+단가 혼합 등)
- bidMethod: 입찰 방식 (제한경쟁, 일반경쟁, 협상에 의한 계약, 수의계약 등)

### 사업 맥락
- purpose: 사업 목적 (왜 이 사업을 추진하는가. "추진 목적" 섹션 참조)
- background: 사업 배경/필요성 (현황, 문제점, 법적 근거, 상위 계획. 2~3문장)
- summary: 사업 핵심 내용 요약 (주요 과업을 5~7문장으로 설명. "주요 사업내용" 섹션 참조)

### 추진 체계
- deliveryLocation: 납품/구축 장소 (발주처 사무실, 데이터센터 등)
- stakeholders: 관련 기관/부서 목록 (협의체, 자문위원회, 유관기관 등)
- relatedSystems: 연계 대상 시스템 (기존 운영 시스템, 외부 연계 시스템 등)
- priorProjects: 선행 사업 정보 (1차 사업, 기존 운영 용역 등 연속 사업인 경우)

### 핵심 조건
- subcontractPolicy: 하도급 조건 (허용 여부, 비율 제한, 사전승인 필요 여부)
- securityLevel: 보안 등급/요건 (보안적합성 검증, 개인정보보호 등)
- specialConditions: 특수 조건 (24시간 운영, 클라우드 필수, 공개SW 활용, 장애대응 SLA 등)

## 출력 JSON
{
  "overview": {
    "projectName": "정식 사업명",
    "client": "발주기관",
    "supervisingOrg": "감독기관 또는 미기재",
    "budget": "예산 (원 단위, 부가세 포함/별도 명시)",
    "duration": "사업기간",
    "contractType": "계약 유형 또는 미기재",
    "bidMethod": "입찰 방식 또는 미기재",
    "purpose": "사업 목적",
    "background": "사업 배경/필요성 (2~3문장)",
    "summary": "사업 핵심 내용 요약 (5~7문장)",
    "deliveryLocation": "납품/구축 장소 또는 미기재",
    "stakeholders": ["관련 기관1", "관련 기관2"],
    "relatedSystems": ["연계 시스템1", "연계 시스템2"],
    "priorProjects": "선행 사업 정보 또는 미기재",
    "subcontractPolicy": "하도급 조건 또는 미기재",
    "securityLevel": "보안 등급/요건 또는 미기재",
    "specialConditions": ["특수 조건1", "특수 조건2"]
  }
}`;
}

// ─── Step 2: 평가항목 추출 + 배점 검증 ────────────────────────

export const STEP2_SYSTEM = `당신은 한국 공공입찰 평가항목 분석 전문가입니다.
RFP의 평가항목과 배점표를 정확히 추출하고 배점 합계를 검증합니다.
"평가항목 및 배점기준", "제안서 평가표", "기술평가 배점표" 등의 섹션에서 정보를 추출합니다.
배점표가 마크다운 테이블이나 이미지 설명으로 제공된 경우에도 정확히 파싱하세요.
${COMMON_PRINCIPLES}`;

export function buildStep2Prompt(rfpText: string, overview: string): string {
  return `다음 RFP에서 평가항목과 배점을 추출하세요.

## 이전 분석: 사업 개요
${overview}

## RFP 관련 내용
${rfpText}

## 추출 규칙
1. EVAL-ID는 EVAL-001부터 순차 부여합니다.
2. category는 대분류 기준: "기술성 평가", "가격 평가", "경영상태", "수행실적" 등
3. score는 해당 항목의 배점 (숫자). 소계가 아닌 개별 세부항목 배점.
4. weight는 전체 배점 대비 가중치 (%). 총합이 100%가 되도록.
5. priority는 배점 기준: 20점 이상 → high, 10~19점 → medium, 9점 이하 → low
6. 배점표에 "소계", "합계" 행이 있으면 세부항목만 추출하고 소계는 건너뜁니다.
7. 기술성 평가와 가격 평가의 배점 비율을 확인하세요 (예: 기술 90 : 가격 10).

## 출력 JSON
{
  "evaluationItems": [
    {
      "id": "EVAL-001",
      "category": "기술성 평가 > 사업이해도",
      "item": "사업 환경 분석의 적정성",
      "score": 15,
      "weight": 15.0,
      "criteria": "사업 환경 및 현황 분석이 체계적이고 구체적인지",
      "priority": "medium"
    }
  ]
}`;
}

// ─── Step 3: 요구사항 도출 (7개 카테고리) ──────────────────────

export const STEP3_SYSTEM = `당신은 한국 공공입찰 요구사항 분석 전문가입니다.
RFP에서 모든 요구사항을 빠짐없이 도출하여 7개 카테고리로 분류합니다.

## 7개 카테고리
- FR (기능 요구사항): 시스템이 수행해야 할 기능
- NFR (비기능 요구사항): 성능, 가용성, 확장성 등
- TR (기술 요구사항): 기술 스택, 표준, 프레임워크
- HR (인력 요구사항): 투입 인력, 자격 요건
- DR (데이터 요구사항): 데이터 모델, 마이그레이션, 연계
- SR (보안 요구사항): 보안, 개인정보보호, 접근 통제
- LR (법규/제도 요구사항): 관련 법률, 인증, 규정 준수

## 도출 범위
- "세부요구사항" 섹션의 명시적 요구사항
- "사업 내용" 섹션의 암묵적 요구사항 (~ 해야 한다, ~ 구축한다)
- "표준화 요건", "보안 요건" 섹션의 요구사항
- 표/다이어그램으로 표현된 요구사항도 텍스트로 해석하여 포함
${COMMON_PRINCIPLES}`;

export function buildStep3Prompt(rfpText: string, overview: string, evalItems: string): string {
  return `다음 RFP에서 요구사항을 빠짐없이 도출하세요.

## 이전 분석
- 사업 개요: ${overview}
- 평가항목: ${evalItems}

## RFP 관련 내용
${rfpText}

## 도출 규칙
1. REQ-{카테고리}-001 형식으로 ID 부여 (예: REQ-FR-001, REQ-NFR-001)
2. title은 간결한 요구사항 제목 (20자 이내)
3. description은 상세 설명 (원문 기반, 2~3문장)
4. mandatory: 필수 요구사항이면 true, 선택/권장이면 false
5. source: RFP 원문의 출처 (예: "Ⅱ.사업내용 > 4.주요내용 > 가.시스템구축")
6. acceptanceCriteria: 이 요구사항의 완료/수용 기준
7. 최소 30개 이상 요구사항을 도출하세요. 빠진 것이 없는지 재확인하세요.

## 출력 JSON
{
  "requirements": [
    {
      "id": "REQ-FR-001",
      "category": "FR",
      "title": "사용자 인증 기능",
      "description": "SSO 기반 통합 인증 체계를 구축하여 단일 계정으로 전체 시스템에 접근할 수 있어야 한다.",
      "mandatory": true,
      "source": "Ⅱ.사업내용 > 9.세부요구사항 > 가.기능요구사항",
      "acceptanceCriteria": "SSO 로그인으로 모든 하위 시스템 접근 가능"
    }
  ]
}`;
}

// ─── Step 4: 추적성 매트릭스 생성 ─────────────────────────────

export const STEP4_SYSTEM = `당신은 요구사항-평가항목 매핑 전문가입니다.
요구사항(REQ-ID)과 평가항목(EVAL-ID)을 정확하게 매핑하여 추적성 매트릭스를 생성합니다.
이 매트릭스는 제안서에서 어떤 챕터에 어떤 요구사항을 반영해야 하는지 가이드합니다.
${COMMON_PRINCIPLES}`;

export function buildStep4Prompt(requirements: string, evalItems: string): string {
  return `요구사항과 평가항목을 매핑하여 추적성 매트릭스를 생성하세요.

## 요구사항 목록
${requirements}

## 평가항목 목록
${evalItems}

## 매핑 규칙
1. 하나의 요구사항은 가장 관련 높은 평가항목 1개에 매핑합니다.
2. 매핑할 수 없는 요구사항은 "EVAL-NONE"으로 표시합니다.
3. proposalChapter는 제안서에서 이 요구사항을 다룰 권장 챕터명입니다.
4. 모든 mandatory 요구사항은 반드시 매핑되어야 합니다.
5. 매핑 누락이 없는지 요구사항 목록과 대조하세요.

## 출력 JSON
{
  "traceabilityMatrix": [
    {
      "requirementId": "REQ-FR-001",
      "evaluationItemId": "EVAL-001",
      "proposalChapter": "1. 사업이해도 > 1.1 사업환경 분석"
    }
  ]
}`;
}

// ─── Step 5: 자격요건/범위/제약 ───────────────────────────────

export const STEP5_SYSTEM = `당신은 공공입찰 자격요건 분석 전문가입니다.
RFP에서 입찰 참가자격, 사업 범위(In/Out Scope), 제약사항을 정확히 추출합니다.
"입찰 참가자격", "사업 범위", "기타 유의사항", "하도급", "보안 요건" 섹션을 중점 분석합니다.
${COMMON_PRINCIPLES}`;

export function buildStep5Prompt(rfpText: string, overview: string): string {
  return `다음 RFP에서 자격요건, 사업 범위, 제약사항을 추출하세요.

## 사업 개요
${overview}

## RFP 관련 내용
${rfpText}

## 추출 규칙

### 자격요건 (qualifications)
- type 분류:
  - eligibility: 입찰 참가자격 (사업자 등록, 실적 요건 등)
  - deadline: 납기/일정 관련
  - subcontract: 하도급 조건
  - warranty: 하자보수/유지보수 조건
  - legal: 법규/인증 관련
- mandatory: 필수이면 true, 권장이면 false

### 사업 범위 (scope)
- inScope: 본 사업에 포함되는 항목
- outOfScope: 본 사업에서 제외되는 항목 (별도 사업, 발주처 담당 등)

### 제약사항 (constraints)
- technical: 기술적 제약 (특정 프레임워크, 언어, 클라우드 지정 등)
- business: 비즈니스 제약 (예산 한도, 인력 규모, 운영 시간 등)
- timeline: 일정 제약 (중간 산출물 기한, 마일스톤 등)

## 출력 JSON
{
  "qualifications": [
    { "type": "eligibility", "description": "소프트웨어사업자 신고 업체", "mandatory": true },
    { "type": "subcontract", "description": "하도급 비율 50% 이내, 사전승인 필요", "mandatory": true }
  ],
  "scope": {
    "inScope": ["통합정보관리시스템 구축", "데이터 연계 체계 구축", "시험 운영"],
    "outOfScope": ["하드웨어 구매", "네트워크 인프라 구축", "기존 시스템 운영"]
  },
  "constraints": {
    "technical": ["전자정부 표준프레임워크 적용", "클라우드 네이티브 아키텍처"],
    "business": ["투입 인력 최소 10명", "PM 경력 10년 이상"],
    "timeline": ["착수 30일 이내 착수보고", "중간보고 2회", "최종보고 1회"]
  }
}`;
}

// ─── Step 6: 배점 전략 분석 ───────────────────────────────────

export const STEP6_SYSTEM = `당신은 공공입찰 수주 전략 전문가입니다.
평가항목별 배점과 요구사항을 분석하여 제안서 작성 전략을 수립합니다.
배점이 높은 항목에 더 많은 분량과 구체적 방안을 제시하는 전략입니다.
${COMMON_PRINCIPLES}`;

export function buildStep6Prompt(evalItems: string, requirements: string): string {
  return `평가항목과 요구사항을 분석하여 배점 전략을 수립하세요.

## 평가항목
${evalItems}

## 요구사항
${requirements}

## 전략 수립 규칙
1. 모든 평가항목(EVAL-ID)에 대해 전략을 수립합니다.
2. priority 기준: 20점 이상 → high, 10~19점 → medium, 9점 이하 → low
3. totalScore: 해당 평가항목의 배점 합계
4. recommendedRatio: 전체 제안서 분량 대비 이 항목에 할당할 비율 (%)
5. strategy: 이 항목에서 고득점을 위한 구체적 전략 (2~3문장)
6. evalIds: 이 전략이 커버하는 평가항목 ID 배열
7. high 항목에 집중 투자, low 항목은 기본 충족 전략

## 출력 JSON
{
  "strategyPoints": [
    {
      "priority": "high",
      "totalScore": 30,
      "recommendedRatio": 35,
      "strategy": "사업이해도 영역은 최고 배점이므로 현황 분석, 문제점 도출, 해결 방안을 구체적으로 제시. 발주기관의 기존 시스템을 정확히 파악하고 차별화된 개선안을 제안.",
      "evalIds": ["EVAL-001", "EVAL-002"]
    }
  ]
}`;
}

// ─── Step 7: 배점 배분 가이드 + 키워드 ────────────────────────

export const STEP7_SYSTEM = `당신은 공공입찰 제안서 구성 전문가입니다.
이전 분석 결과를 종합하여 평가항목 배점에 비례한 제안서 구성 가이드와 핵심 키워드를 추출합니다.
이 가이드는 후속 "목차 구성" 단계의 입력 자료로 활용됩니다.
${COMMON_PRINCIPLES}`;

export function buildStep7Prompt(allPreviousResults: string): string {
  return `이전 분석 결과를 종합하여 배점 비례 배분 가이드와 핵심 키워드를 생성하세요.

## 이전 분석 결과
${allPreviousResults}

## 작성 규칙

### 배분 가이드 (recommendedChapters)
- chapter: "01-사업이해도" 형태 (번호-제목). 배점표의 대분류 기준.
- evalId: 해당 평가항목 ID (EVAL-XXX)
- score: 해당 평가항목 배점 (숫자)
- recommendedPages: 배점 비례 권장 페이지 수 (A4 기준. 총 80~120p 범위에서 배분)
- relatedRequirements: 이 챕터에서 다뤄야 할 요구사항 ID 배열

### 키워드 (keywords)
- RFP 전체에서 반복 등장하는 핵심 용어/기술/개념
- 제안서 전반에 일관되게 사용해야 할 키워드
- 최소 10개, 최대 20개

## 출력 JSON
{
  "recommendedChapters": [
    {
      "chapter": "01-사업이해도",
      "evalId": "EVAL-001",
      "score": 30,
      "relatedRequirements": ["REQ-FR-001", "REQ-FR-002", "REQ-NFR-001"],
      "recommendedPages": 25
    }
  ],
  "keywords": ["클라우드 네이티브", "마이크로서비스", "API 연계", "데이터 표준화", "실시간 모니터링"]
}`;
}
