// 7단계 RFP 분석 프롬프트

export const RFP_STEP_DEFINITIONS = [
  { stepNumber: 1, slug: 'rfp-step1-overview', name: 'Step 1: 사업 개요', label: '사업 개요 파악' },
  { stepNumber: 2, slug: 'rfp-step2-evaluation', name: 'Step 2: 평가항목', label: '평가항목 추출' },
  { stepNumber: 3, slug: 'rfp-step3-requirements', name: 'Step 3: 요구사항', label: '요구사항 도출' },
  { stepNumber: 4, slug: 'rfp-step4-traceability', name: 'Step 4: 추적성', label: '추적성 매트릭스' },
  { stepNumber: 5, slug: 'rfp-step5-qualifications', name: 'Step 5: 자격요건', label: '자격요건/범위/제약' },
  { stepNumber: 6, slug: 'rfp-step6-strategy', name: 'Step 6: 배점 전략', label: '배점 전략 분석' },
  { stepNumber: 7, slug: 'rfp-step7-chapters', name: 'Step 7: 권장 목차', label: '권장 목차 + 키워드' },
] as const;

// Step 1: 사업 개요
export const STEP1_SYSTEM = `당신은 한국 공공입찰 제안서 분석 전문가입니다.
RFP(제안요청서)에서 사업 개요를 정확히 파악합니다.
표, 이미지, 도식이 포함된 경우 해당 내용도 분석에 반영하세요.
반드시 순수 JSON으로만 응답하세요.`;

export function buildStep1Prompt(rfpText: string): string {
  return `다음 RFP에서 사업 개요를 추출하세요.

## RFP 원문
${rfpText.slice(0, 60000)}

## 출력 JSON
{
  "overview": {
    "projectName": "사업명",
    "client": "발주기관",
    "budget": "예산 (원 단위)",
    "duration": "사업기간",
    "summary": "사업 요약 (3~5문장)",
    "purpose": "사업 목적"
  }
}`;
}

// Step 2: 평가항목
export const STEP2_SYSTEM = `당신은 한국 공공입찰 평가항목 분석 전문가입니다.
RFP의 평가항목과 배점표를 정확히 추출합니다.
배점표가 이미지나 표로 제공된 경우에도 정확히 추출하세요.
EVAL-ID를 부여하고 배점을 검증합니다.
반드시 순수 JSON으로만 응답하세요.`;

export function buildStep2Prompt(rfpText: string, overview: string): string {
  return `다음 RFP에서 평가항목을 추출하세요.

## 이전 분석: 사업 개요
${overview}

## RFP 원문
${rfpText.slice(0, 60000)}

## 출력 JSON
{
  "evaluationItems": [
    {
      "id": "EVAL-001",
      "category": "기술부문/가격부문/경영부문",
      "item": "평가항목명",
      "score": 배점(숫자),
      "weight": 가중치(%),
      "criteria": "세부평가기준",
      "priority": "high/medium/low"
    }
  ]
}`;
}

// Step 3: 요구사항
export const STEP3_SYSTEM = `당신은 한국 공공입찰 요구사항 분석 전문가입니다.
RFP에서 요구사항을 7개 카테고리(기능/성능/보안/데이터/인터페이스/품질/제약)로 분류합니다.
다이어그램이나 구성도로 표현된 요구사항도 텍스트로 해석하여 포함하세요.
REQ-ID를 부여합니다.
반드시 순수 JSON으로만 응답하세요.`;

export function buildStep3Prompt(rfpText: string, overview: string, evalItems: string): string {
  return `다음 RFP에서 요구사항을 도출하세요.

## 이전 분석
- 사업 개요: ${overview}
- 평가항목: ${evalItems}

## RFP 원문
${rfpText.slice(0, 60000)}

## 출력 JSON
{
  "requirements": [
    {
      "id": "REQ-FR-001",
      "category": "FR/NFR/TR/HR/DR/SR/LR",
      "title": "요구사항 제목",
      "description": "상세 설명",
      "mandatory": true/false,
      "source": "RFP 출처 (페이지/섹션)",
      "acceptanceCriteria": "수용 기준"
    }
  ]
}`;
}

// Step 4: 추적성 매트릭스
export const STEP4_SYSTEM = `당신은 요구사항-평가항목 매핑 전문가입니다.
요구사항(REQ-ID)과 평가항목(EVAL-ID)의 추적성 매트릭스를 생성합니다.
반드시 순수 JSON으로만 응답하세요.`;

export function buildStep4Prompt(requirements: string, evalItems: string): string {
  return `요구사항과 평가항목을 매핑하세요.

## 요구사항
${requirements}

## 평가항목
${evalItems}

## 출력 JSON
{
  "traceabilityMatrix": [
    {
      "requirementId": "REQ-FR-001",
      "evaluationItemId": "EVAL-001",
      "proposalChapter": "권장 챕터명"
    }
  ]
}`;
}

// Step 5: 자격요건/범위/제약사항
export const STEP5_SYSTEM = `당신은 공공입찰 자격요건 분석 전문가입니다.
RFP에서 자격요건, 사업 범위, 제약사항을 추출합니다.
반드시 순수 JSON으로만 응답하세요.`;

export function buildStep5Prompt(rfpText: string, overview: string): string {
  return `다음 RFP에서 자격요건, 범위, 제약사항을 추출하세요.

## 사업 개요
${overview}

## RFP 원문
${rfpText.slice(0, 60000)}

## 출력 JSON
{
  "qualifications": [
    { "type": "eligibility/deadline/subcontract/warranty/legal", "description": "내용", "mandatory": true/false }
  ],
  "scope": { "inScope": ["포함 항목"], "outOfScope": ["제외 항목"] },
  "constraints": { "technical": ["기술 제약"], "business": ["비즈니스 제약"], "timeline": ["일정 제약"] }
}`;
}

// Step 6: 배점 전략
export const STEP6_SYSTEM = `당신은 공공입찰 수주 전략 전문가입니다.
평가항목과 요구사항을 분석하여 배점 전략(고/중/저)을 수립합니다.
반드시 순수 JSON으로만 응답하세요.`;

export function buildStep6Prompt(evalItems: string, requirements: string): string {
  return `배점 전략을 분석하세요.

## 평가항목
${evalItems}

## 요구사항
${requirements}

## 출력 JSON
{
  "strategyPoints": [
    {
      "evalId": "EVAL-001",
      "priority": "high/medium/low",
      "strategy": "전략 설명",
      "keyActions": ["핵심 실행 항목"]
    }
  ]
}`;
}

// Step 7: 권장 목차 + 키워드
export const STEP7_SYSTEM = `당신은 공공입찰 제안서 구성 전문가입니다.
이전 분석 결과를 종합하여 최적의 목차를 구성하고 핵심 키워드를 추출합니다.
반드시 순수 JSON으로만 응답하세요.`;

export function buildStep7Prompt(allPreviousResults: string): string {
  return `이전 분석 결과를 종합하여 권장 목차와 키워드를 생성하세요.

## 이전 분석 결과
${allPreviousResults}

## 출력 JSON
{
  "recommendedChapters": [
    { "chapter": "01", "title": "챕터 제목", "description": "설명", "evalIds": ["EVAL-001"], "pageRatio": 10 }
  ],
  "keywords": ["핵심 키워드 목록"]
}`;
}
