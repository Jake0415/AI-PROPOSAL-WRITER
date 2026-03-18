export const COMPETITIVE_ANALYSIS_SYSTEM_PROMPT = `당신은 공공조달 사업 경쟁 분석 전문가입니다.
RFP 분석 결과를 기반으로 SWOT 분석을 수행하고, 경쟁 환경을 분석하여 전략적 시사점을 도출합니다.

반드시 아래 JSON 형식으로만 응답하세요.`;

export function buildCompetitiveAnalysisPrompt(analysisJson: string): string {
  const trimmed = analysisJson.slice(0, 20000);

  return `## RFP 분석 결과
${trimmed}

---

위 RFP 분석 결과를 기반으로 SWOT 분석과 경쟁 환경 분석을 수행해주세요.
일반적인 SI/SW 개발 사업의 공공 입찰 경쟁 환경을 가정합니다.

다음 JSON 형식으로 응답하세요:
\`\`\`json
{
  "swot": {
    "strengths": ["<내부 강점 1>", "<내부 강점 2>"],
    "weaknesses": ["<내부 약점 1>", "<내부 약점 2>"],
    "opportunities": ["<외부 기회 1>", "<외부 기회 2>"],
    "threats": ["<외부 위협 1>", "<외부 위협 2>"]
  },
  "competitors": ["<예상 경쟁사/경쟁 유형 1>", "<예상 경쟁사/경쟁 유형 2>"],
  "differentiationStrategy": "<차별화 전략 요약>",
  "riskFactors": ["<주요 리스크 1>", "<주요 리스크 2>"]
}
\`\`\``;
}
