# /analyze-rfp - RFP 분석 및 요구사항 도출

RFP(제안요청서) 문서를 분석하여 평가항목/배점과 함께 **모든 요구사항을 REQ-ID 체계로 도출**합니다. 추적성 매트릭스로 요구사항과 평가항목을 연결합니다. `/write-proposal`의 Stage 1을 단독으로 실행합니다.

## 입력

RFP 문서: $ARGUMENTS

## 실행 절차

rfp-analyzer 에이전트를 호출하여 다음을 수행합니다:

1. RFP 문서 읽기 (PDF, 텍스트, 마크다운)
2. 사업 개요 추출 (사업명, 발주기관, 예산, 기간)
3. 평가항목 테이블 추출 (EVAL-ID 부여, 배점, 세부기준)
4. **요구사항 도출 및 REQ-ID 부여** (7개 카테고리: FR/NFR/TR/HR/DR/SR/LR)
5. **요구사항 분류 및 검증** (mandatory/recommended/optional)
6. **추적성 매트릭스 생성** (요구사항 ↔ 평가항목 매핑)
7. 자격요건/납기/법규 추출
8. 전략 포인트 도출 (고배점 항목, 관련 요구사항 수)
9. 제안서 목차 구성 권장안 제시

## 산출물

- `docs/proposals/{프로젝트명}/00-rfp-analysis.md` — 사업 개요 + 평가항목 분석 (사람용)
- `docs/proposals/{프로젝트명}/00-requirements.md` — 구조화된 요구사항 정의서 + 추적성 매트릭스 (에이전트 소비용)

## 사용 예시

```bash
# 파일 경로 지정
/analyze-rfp docs/rfp/2026-서버구축-RFP.pdf

# 텍스트로 RFP 내용 전달
/analyze-rfp 아래 RFP 내용을 분석해줘: [RFP 내용 붙여넣기]
```

## 주의사항

- 분석 결과는 `/write-proposal`의 입력으로 사용됩니다
- 배점 합계와 요구사항 누락 여부를 자동으로 검증합니다
- `00-requirements.md`는 다른 에이전트들이 참조하는 데이터이므로 수동 편집하지 마세요
- 요구사항은 proposal-writer(제안서 작성), price-proposal(가격 산출), planner(개발 계획)에서도 활용됩니다
