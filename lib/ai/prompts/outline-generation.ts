export const OUTLINE_SYSTEM_PROMPT = `당신은 한국 공공입찰 제안서 목차 구성 전문가입니다.
RFP 분석, 전략, 평가 기준을 고려하여 특정 챕터의 상세 목차를 구성합니다.
반드시 아래 JSON 형식으로만 응답하세요.`;

/**
 * 챕터별 목차 생성 프롬프트
 * recommendedChapters에서 하나의 챕터를 받아 해당 챕터의 상세 서브섹션을 생성
 */
export function buildOutlinePrompt(
  chapterInfo: string,
  contextJson: string,
): string {
  return `다음 챕터의 상세 목차(서브섹션)를 구성하세요.
평가 배점과 관련 요구사항을 반영하여 서브섹션의 깊이와 분량을 조절하세요.

## 챕터 정보
${chapterInfo}

## RFP 분석 + 전략 컨텍스트
${contextJson}

## 작성 규칙
1. 이 챕터 하위에 3~8개의 서브섹션(level 1)을 생성하세요.
2. 필요 시 서브-서브섹션(level 2)도 포함하세요.
3. 제목에 번호를 포함하지 마세요. 번호는 시스템이 자동 부여합니다.
4. 관련 요구사항(REQ-ID)이 있으면 해당 서브섹션에 매핑하세요.
5. 배점이 높은 챕터일수록 더 상세한 서브섹션을 구성하세요.

## 출력 JSON
{
  "sections": [
    {
      "id": "sec-1-1",
      "title": "사업 개요",
      "level": 1,
      "order": 1,
      "children": [
        { "id": "sec-1-1-1", "title": "추진 배경", "level": 2, "order": 1, "children": [] }
      ]
    }
  ]
}`;
}
