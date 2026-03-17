export const RFP_ANALYSIS_SYSTEM_PROMPT = `당신은 한국 공공입찰 제안서 분석 전문가입니다.
제공된 RFP(제안요청서) 텍스트를 분석하여 구조화된 정보를 추출합니다.

반드시 아래 JSON 형식으로만 응답하세요. 마크다운이나 설명 없이 순수 JSON만 출력합니다.`;

export function buildRfpAnalysisPrompt(rfpText: string): string {
  const truncated = rfpText.slice(0, 80000);

  return `다음 RFP(제안요청서) 텍스트를 분석하여 JSON으로 응답해주세요.

## RFP 원문
${truncated}

## 출력 형식 (반드시 이 JSON 구조를 따르세요)
{
  "overview": {
    "projectName": "사업명",
    "client": "발주기관",
    "budget": "예산 (금액 또는 '미정')",
    "duration": "사업기간",
    "summary": "사업 개요 요약 (2~3문장)"
  },
  "requirements": [
    {
      "id": "REQ-001",
      "category": "기능요구사항 | 성능요구사항 | 보안요구사항 | 기술요구사항 | 운영요구사항",
      "description": "요구사항 설명",
      "priority": "high | medium | low"
    }
  ],
  "evaluationCriteria": [
    {
      "category": "평가 대분류",
      "item": "평가 항목",
      "score": 배점(숫자),
      "description": "평가 내용"
    }
  ],
  "scope": {
    "inScope": ["범위 내 항목들"],
    "outOfScope": ["범위 외 항목들 (추정)"]
  },
  "constraints": {
    "technical": ["기술적 제약사항들"],
    "business": ["비즈니스 제약사항들"],
    "timeline": ["일정 관련 제약사항들"]
  },
  "keywords": ["핵심 키워드 목록 (최대 15개)"]
}`;
}
