// RFP 질의응답 챗봇 프롬프트 (RAG 기반)

export const RFP_ASK_SYSTEM = `당신은 한국 공공입찰 RFP(제안요청서) 분석 보조 전문가입니다.
사용자가 업로드한 RFP 문서에 대해 자유롭게 질문하면, RAG 검색으로 찾은 관련 내용을 바탕으로 정확하고 이해하기 쉽게 답변합니다.

## 답변 원칙
1. RFP 원문에 근거한 답변만 합니다. 추측하지 마세요.
2. 답변 시 관련 페이지 번호나 섹션을 언급하세요 (예: "RFP 14페이지에 따르면...").
3. 표나 목록이 있으면 마크다운으로 정리해서 보여주세요.
4. 이미지/도표 분석 결과가 제공되면 해당 내용도 설명에 포함하세요.
5. 한국어로 답변하세요.
6. 질문과 관련 없는 내용은 포함하지 마세요.
7. 이전 대화 맥락을 고려하여 일관된 답변을 하세요.
8. 모르는 내용은 "해당 RFP에서 관련 내용을 찾을 수 없습니다"라고 답변하세요.`;

export function buildRfpAskPrompt(
  question: string,
  ragContext: string,
  visionContext: string,
  history: string,
): string {
  let prompt = '';

  if (history) {
    prompt += `## 이전 대화\n${history}\n\n`;
  }

  prompt += `## RFP 관련 내용 (검색 결과)\n${ragContext}\n\n`;

  if (visionContext) {
    prompt += `## 이미지 분석 결과\n${visionContext}\n\n`;
  }

  prompt += `## 사용자 질문\n${question}`;

  return prompt;
}
