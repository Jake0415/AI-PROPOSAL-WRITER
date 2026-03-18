export const RFP_ANALYSIS_SYSTEM_PROMPT = `당신은 한국 공공입찰 제안서 분석 전문가입니다.
제공된 RFP(제안요청서)를 **사업 수주 최적화** 관점에서 체계적으로 분석합니다.

분석 절차:
1. 사업 개요 파악
2. 평가항목 추출 + EVAL-ID 부여 + 배점 검증
3. 요구사항 도출 (7개 카테고리, REQ-ID 부여)
4. 추적성 매트릭스 생성 (요구사항 ↔ 평가항목 매핑)
5. 자격요건/납기/법규 추출
6. 배점 전략 분석 (고/중/저)
7. 권장 목차 구성

반드시 아래 JSON 형식으로만 응답하세요. 마크다운이나 설명 없이 순수 JSON만 출력합니다.`;

export function buildRfpAnalysisPrompt(rfpText: string): string {
  const truncated = rfpText.slice(0, 80000);

  return `다음 RFP(제안요청서)를 사업 수주 최적화 관점에서 분석하여 JSON으로 응답해주세요.

## RFP 원문
${truncated}

## 출력 형식 (반드시 이 JSON 구조를 따르세요)
{
  "overview": {
    "projectName": "사업명",
    "client": "발주기관",
    "budget": "예산 (금액 또는 '미정')",
    "duration": "사업기간",
    "summary": "사업 개요 요약 (2~3문장)",
    "purpose": "사업 목적 (1~2문장)"
  },
  "evaluationItems": [
    {
      "id": "EVAL-001",
      "category": "기술부문 | 가격부문 | 경영부문",
      "item": "평가항목명",
      "score": 배점숫자,
      "weight": 가중치숫자,
      "criteria": "세부평가기준",
      "priority": "high | medium | low"
    }
  ],
  "requirements": [
    {
      "id": "REQ-FR-001",
      "category": "FR | NFR | TR | HR | DR | SR | LR",
      "title": "요구사항 제목",
      "description": "요구사항 상세 설명",
      "mandatory": true,
      "source": "RFP 출처",
      "acceptanceCriteria": "수용 기준"
    }
  ],
  "traceabilityMatrix": [
    {
      "requirementId": "REQ-FR-001",
      "evaluationItemId": "EVAL-003",
      "proposalChapter": "03-수행방안"
    }
  ],
  "qualifications": [
    {
      "type": "eligibility | deadline | subcontract | warranty | legal",
      "description": "자격요건 설명",
      "mandatory": true
    }
  ],
  "strategyPoints": [
    {
      "priority": "high",
      "evalIds": ["EVAL-002", "EVAL-003"],
      "totalScore": 55,
      "recommendedRatio": 40,
      "strategy": "고배점 항목 전략 설명"
    }
  ],
  "recommendedChapters": [
    {
      "chapter": "01-사업이해도",
      "evalId": "EVAL-001",
      "score": 15,
      "relatedRequirements": ["REQ-FR-001"],
      "recommendedPages": 12
    }
  ],
  "scope": {
    "inScope": ["범위 내 항목들"],
    "outOfScope": ["범위 외 항목들"]
  },
  "constraints": {
    "technical": ["기술적 제약사항들"],
    "business": ["비즈니스 제약사항들"],
    "timeline": ["일정 관련 제약사항들"]
  },
  "keywords": ["핵심 키워드 목록 (최대 15개)"]
}

## 요구사항 카테고리
- FR: 기능 요구사항 / NFR: 비기능 요구사항 / TR: 기술 규격
- HR: 인력 요건 / DR: 납품 산출물 / SR: 일정 조건 / LR: 법규 준수

## 배점 전략 분류
- high: 배점 상위 30% → 분량 40%+ 권장
- medium: 배점 중위 40% → 분량 35% 권장
- low: 배점 하위 30% → 분량 25%- 권장`;
}
