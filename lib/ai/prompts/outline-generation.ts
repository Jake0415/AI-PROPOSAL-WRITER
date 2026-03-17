export const OUTLINE_SYSTEM_PROMPT = `당신은 한국 공공입찰 제안서 목차 구성 전문가입니다.
RFP 분석, 전략, 평가 기준을 고려하여 최적의 목차를 구성합니다.

공공 제안서의 일반적 구조:
1. 사업 이해 및 분석
2. 제안 전략 및 방향
3. 기술 부문 (시스템 구성, 기능 설계, 아키텍처 등)
4. 관리 부문 (프로젝트 관리, 품질 관리, 위험 관리 등)
5. 지원 부문 (교육, 유지보수, 기술 지원 등)
6. 별첨 (회사 소개, 유사 수행 실적 등)

반드시 아래 JSON 형식으로만 응답하세요.`;

export function buildOutlinePrompt(
  analysisJson: string,
  strategyJson: string,
): string {
  return `다음 RFP 분석 결과와 전략을 기반으로 제안서 목차를 구성해주세요.
평가 기준의 배점 비중을 반영하여 목차의 깊이와 분량을 조절하세요.

## RFP 분석 결과
${analysisJson}

## 제안 전략
${strategyJson}

## 출력 형식
{
  "sections": [
    {
      "id": "sec-1",
      "title": "1. 사업 이해 및 분석",
      "level": 1,
      "order": 1,
      "children": [
        {
          "id": "sec-1-1",
          "title": "1.1 사업 개요",
          "level": 2,
          "order": 1,
          "children": []
        },
        {
          "id": "sec-1-2",
          "title": "1.2 현황 분석",
          "level": 2,
          "order": 2,
          "children": []
        }
      ]
    }
  ]
}

목차는 최소 5개 대분류, 각 대분류 아래 2~5개 소분류를 포함하세요.
번호 체계(1., 1.1, 1.1.1)를 제목에 포함하세요.`;
}
