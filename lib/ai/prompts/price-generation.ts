export const PRICE_SYSTEM_PROMPT = `당신은 공공조달 가격 제안서 작성 전문가입니다.
기술 제안서 내용과 RFP 분석 결과를 기반으로 사업비 산출내역서를 작성합니다.

## 사업비 구성 표준
- 직접인건비: 투입인력 × 노임단가 × 기간 (SW기술자 노임단가 기준)
- 직접경비: 장비, SW 라이선스, 재료비
- 제경비: 여비, 인쇄, 통신 등
- 일반관리비: 직접인건비의 6% 이내
- 이윤: 직접인건비의 25% 이내
- 부가세: 10%

## 단가 근거
- 인건비: 한국소프트웨어산업협회 SW기술자 노임단가 기준
- 장비: 조달청 공표가 또는 시장가 기준
- 모든 단가에 근거 출처를 반드시 명시

반드시 아래 JSON 형식으로만 응답하세요.`;

export function buildPricePrompt(
  analysisJson: string,
  sectionsJson: string,
): string {
  const trimmedAnalysis = analysisJson.slice(0, 20000);
  const trimmedSections = sectionsJson.slice(0, 10000);

  return `## RFP 분석 결과 (요구사항, 예산 정보)
${trimmedAnalysis}

## 기술 제안서 섹션 요약
${trimmedSections}

---

위 정보를 바탕으로 사업비 산출내역서를 작성해주세요.

다음 JSON 형식으로 응답하세요:
\`\`\`json
{
  "laborCosts": [
    {
      "role": "<역할명>",
      "grade": "<특급/고급/중급/초급>",
      "headcount": <인원>,
      "duration": <투입기간 M/M>,
      "unitPrice": <월 단가(원)>,
      "amount": <금액(원)>,
      "basis": "<단가 근거>"
    }
  ],
  "equipmentCosts": [
    {
      "category": "<HW/SW/기타>",
      "item": "<항목명>",
      "spec": "<규격>",
      "quantity": <수량>,
      "unitPrice": <단가(원)>,
      "amount": <금액(원)>,
      "basis": "<단가 근거>",
      "relatedReqId": "<REQ-TR-001 등>"
    }
  ],
  "expenseCosts": [
    {
      "category": "<항목명>",
      "basis": "<산출 근거>",
      "amount": <금액(원)>
    }
  ],
  "indirectCosts": {
    "generalAdmin": <일반관리비(원)>,
    "generalAdminRate": <비율 %>,
    "profit": <이윤(원)>,
    "profitRate": <비율 %>
  },
  "summary": {
    "directLabor": <직접인건비>,
    "directExpense": <직접경비>,
    "miscExpense": <제경비>,
    "directSubtotal": <직접비 소계>,
    "generalAdmin": <일반관리비>,
    "profit": <이윤>,
    "indirectSubtotal": <간접비 소계>,
    "supplyPrice": <공급가액>,
    "vat": <부가세>,
    "totalPrice": <총사업비>
  },
  "competitiveness": {
    "budgetRatio": <예산 대비 비율 %>,
    "recommendedRange": "<권장 가격 범위>",
    "strategy": "<가격 전략>"
  }
}
\`\`\``;
}
