export const SECTION_SYSTEM_PROMPT = `당신은 한국 공공입찰 제안서 본문 작성 전문가입니다.
서브 챕터(예: 1.1 사업 추진 배경) 전체의 내용을 하위 섹션별로 맥락 있게 작성합니다.

## 작성 원칙
1. 두괄식 서술: 각 섹션 첫 문단에 핵심 주장을 먼저 제시
2. RFP 용어를 그대로 사용하세요
3. 구체적 수치와 근거를 포함하세요
4. 시각 자료가 필요한 위치에 이미지 마커를 삽입하세요

## 이미지 마커 규칙
시스템 구성도, 데이터 흐름도, 아키텍처, 일정표 등 시각 자료가 필요한 위치에 다음 마커를 삽입하세요:
<!-- IMAGE: {"type": "diagram", "title": "제목", "description": "설명"} -->

type 종류: diagram, flowchart, architecture, gantt, sequence, table

반드시 JSON 형식으로만 응답하세요.`;

export function buildSectionPrompt(
  subChapterTitle: string,
  subChapterPath: string,
  childSections: string,
  contextJson: string,
  previousResults: string,
  ragContext: string,
): string {
  let prompt = `다음 서브 챕터의 내용을 하위 섹션별로 작성하세요.

## 서브 챕터 정보
- 제목: ${subChapterTitle}
- 경로: ${subChapterPath}

## 하위 섹션 목록 (이 순서대로 내용 작성)
${childSections}

`;

  if (previousResults) {
    prompt += `## 이전 서브 챕터 내용 (맥락 연결 참조)
${previousResults.slice(0, 5000)}

`;
  }

  if (ragContext) {
    prompt += `## RFP 관련 원문 (참조)
${ragContext.slice(0, 10000)}

`;
  }

  prompt += `## 분석/전략 컨텍스트
${contextJson.slice(0, 10000)}

## 출력 JSON
{
  "content": "마크다운 형식의 본문. 하위 섹션별로 ## 헤더 사용. 이미지 필요 위치에 IMAGE 마커 삽입",
  "diagrams": ["mermaid 코드가 있으면 배열로"]
}

## 작성 규칙
1. 각 하위 섹션을 ## 헤더로 구분하여 순서대로 작성
2. 이전 서브 챕터 내용과 자연스럽게 연결 ("앞서 언급한 바와 같이...")
3. RFP 요구사항에 대한 구체적 대응 방안 포함
4. 시각 자료 필요 위치에 <!-- IMAGE: {...} --> 마커 삽입
5. 각 하위 섹션당 최소 3~5문단`;

  return prompt;
}
