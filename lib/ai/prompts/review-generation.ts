export const REVIEW_SYSTEM_PROMPT = `당신은 공공조달 제안서 검토 전문 평가위원입니다.
완성된 제안서를 RFP 평가항목 기준으로 체계적으로 검토하고, 예상점수를 산출하며, 구체적인 개선 방안을 제시합니다.
Chain of Thought 방식으로 각 항목을 검증하여 정확하고 균형잡힌 평가를 수행합니다.

## 충족도 태그
- [COVERED] - 제안서에서 해당 내용이 명확히 다뤄짐
- [PARTIAL] - 일부만 다뤄지거나 불충분함
- [MISSING] - 제안서에서 해당 내용이 누락됨
- [STRONG]  - 경쟁 우위 요소, 차별화 포인트

## 등급 기준
- A (90% 이상): 매우 우수
- B (80-89%): 우수
- C (70-79%): 보통 - 개선 필요
- D (60-69%): 미흡 - 대폭 수정 필요
- F (60% 미만): 부적합 - 재작성 권고

반드시 아래 JSON 형식으로만 응답하세요.`;

export function buildReviewPrompt(
  analysisJson: string,
  sectionsJson: string,
  strategyJson: string,
): string {
  const trimmedAnalysis = analysisJson.slice(0, 30000);
  const trimmedSections = sectionsJson.slice(0, 40000);
  const trimmedStrategy = strategyJson.slice(0, 5000);

  return `## RFP 분석 결과
${trimmedAnalysis}

## 전략
${trimmedStrategy}

## 제안서 섹션 내용
${trimmedSections}

---

위의 RFP 분석 결과(평가항목, 요구사항, 추적성 매트릭스)와 제안서 섹션 내용을 비교하여 검토해주세요.

다음 JSON 형식으로 응답하세요:
\`\`\`json
{
  "overallScore": <예상 총점 (숫자)>,
  "totalPossible": <만점 (숫자)>,
  "grade": "<A/B/C/D/F>",
  "evalCoverage": <평가항목 충족률 % (숫자)>,
  "reqCoverage": <요구사항 충족률 % (숫자)>,
  "formatCompliance": <형식 준수율 % (숫자)>,
  "evalResults": [
    {
      "evalId": "<EVAL-001>",
      "item": "<평가항목명>",
      "maxScore": <배점>,
      "expectedScore": <예상점수>,
      "coverage": "<COVERED|PARTIAL|MISSING|STRONG>",
      "chapter": "<해당 챕터>",
      "strengths": "<강점>",
      "weaknesses": "<약점>",
      "improvement": "<개선방안>"
    }
  ],
  "reqResults": [
    {
      "reqId": "<REQ-FR-001>",
      "title": "<요구사항명>",
      "mandatory": <true/false>,
      "category": "<FR|NFR|TR|HR|DR|SR|LR>",
      "coverage": "<COVERED|PARTIAL|MISSING>",
      "chapter": "<해당 챕터>",
      "comment": "<충족 상태 설명>"
    }
  ],
  "improvements": [
    {
      "priority": "<critical|major|minor>",
      "item": "<항목명>",
      "currentState": "<현재 상태>",
      "expectedImpact": <예상 점수 향상>,
      "action": "<구체적 개선 액션>"
    }
  ],
  "summary": "<전체 평가 요약 (2-3문장)>"
}
\`\`\``;
}
