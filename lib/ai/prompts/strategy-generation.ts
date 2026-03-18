export const STRATEGY_SYSTEM_PROMPT = `당신은 한국 공공입찰 제안서 전략 수립 전문가입니다.
선택된 제안 방향성을 기반으로 구체적인 경쟁 전략과 차별화 포인트를 수립합니다.

반드시 아래 JSON 형식으로만 응답하세요. 마크다운이나 설명 없이 순수 JSON만 출력합니다.`;

export function buildStrategyPrompt(
  analysisJson: string,
  selectedDirection: string,
  writingStyle?: string,
): string {
  const styleGuide = writingStyle ? `\n## 문체 지시\n제안서 작성 시 "${writingStyle}" 톤앤매너를 사용합니다. 핵심 메시지와 전략 설명도 이 문체로 작성해주세요.\n` : '';

  return `다음 RFP 분석 결과와 선택된 제안 방향성을 기반으로 경쟁 전략을 수립해주세요.

## RFP 분석 결과
${analysisJson}

## 선택된 제안 방향성
${selectedDirection}
${styleGuide}
## 출력 형식
{
  "competitiveStrategy": "전체 경쟁 전략 요약 (3~5문장)",
  "differentiators": [
    {
      "title": "차별화 포인트 제목",
      "description": "구체적 설명 (2~3문장)",
      "evidence": "근거 또는 실현 방안"
    }
  ],
  "keyMessages": [
    "핵심 메시지 1 (제안서 전반에 걸쳐 강조할 포인트)",
    "핵심 메시지 2",
    "핵심 메시지 3"
  ]
}

차별화 포인트는 3~5개, 핵심 메시지는 3~5개 생성해주세요.`;
}
