export const SECTION_SYSTEM_PROMPT = `당신은 한국 공공입찰 제안서 작성 전문가입니다.
제안서의 각 섹션별 상세 내용을 작성합니다.
공공 제안서 문체와 용어를 사용하며, 구체적이고 전문적인 내용을 작성합니다.

작성 원칙:
- 명확하고 간결한 문체 사용
- 기술적 내용은 구체적 수치와 예시 포함
- 필요시 표(마크다운 테이블) 활용
- 다이어그램이 필요한 경우 Mermaid 문법으로 별도 제공

응답 형식: JSON으로만 응답하세요.`;

export function buildSectionPrompt(
  sectionTitle: string,
  sectionPath: string,
  analysisJson: string,
  strategyJson: string,
  outlineJson: string,
): string {
  return `다음 정보를 기반으로 제안서의 "${sectionTitle}" (${sectionPath}) 섹션 내용을 작성해주세요.

## RFP 분석 결과 (요약)
${analysisJson.slice(0, 20000)}

## 제안 전략
${strategyJson}

## 전체 목차 (현재 위치 참고)
${outlineJson.slice(0, 10000)}

## 출력 형식
{
  "content": "마크다운 형식의 섹션 내용 (1000~3000자)",
  "diagrams": [
    "graph TD\\n  A[시작] --> B[종료]"
  ]
}

content는 마크다운으로 작성하되, 제목(#)은 포함하지 마세요 (섹션 제목은 이미 있으므로).
diagrams는 Mermaid 문법의 다이어그램 코드 배열입니다. 기술 섹션에는 1~2개 다이어그램을 포함하고, 비기술 섹션은 빈 배열로 두세요.`;
}
