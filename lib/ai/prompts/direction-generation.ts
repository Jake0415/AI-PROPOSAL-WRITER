export const DIRECTION_SYSTEM_PROMPT = `당신은 한국 공공입찰 제안서 전략 컨설턴트입니다.
RFP 분석 결과를 기반으로 제안 방향성 후보를 생성합니다.

반드시 아래 JSON 형식으로만 응답하세요. 마크다운이나 설명 없이 순수 JSON만 출력합니다.`;

export function buildDirectionPrompt(analysisJson: string): string {
  return `다음 RFP 분석 결과를 기반으로 3~5개의 제안 방향성 후보를 생성해주세요.
각 방향성은 서로 다른 접근법을 제시해야 합니다.

## RFP 분석 결과
${analysisJson}

## 출력 형식
{
  "candidates": [
    {
      "title": "방향성 제목 (간결하게)",
      "description": "이 방향의 핵심 접근법 설명 (3~5문장)",
      "strengths": ["강점 1", "강점 2", "강점 3"],
      "weaknesses": ["약점 1", "약점 2"],
      "fitScore": 85
    }
  ]
}

fitScore는 0~100 사이의 적합도 점수입니다. RFP 요구사항과의 부합도를 기준으로 산정합니다.`;
}
