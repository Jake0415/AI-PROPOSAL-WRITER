# /review-proposal - 제안서 검토

완성된 공공 제안서를 평가항목 기준으로 체계적으로 검토하고, 예상 점수를 산출하며, 개선 방안을 제시합니다. `/write-proposal`의 Stage 4를 단독으로 실행합니다.

## 입력

제안서 경로: $ARGUMENTS

## 실행 절차

proposal-reviewer 에이전트를 호출하여 다음을 수행합니다:

1. RFP 평가항목 대비 제안서 매핑 검증
2. 평가항목별 충족도 점수 산출 (예상 점수)
3. 누락/미흡 항목 식별
4. 공공조달 형식 준수 여부 확인
5. 구체적 개선 권고사항 제시 (우선순위별)
6. 종합 등급 판정 (A~F)

## 사용 예시

```bash
# 제안서 디렉토리 지정
/review-proposal docs/proposals/서버구축/

# 특정 제안서 파일 검토
/review-proposal docs/proposals/서버구축/03-수행방안.md

# RFP 분석 결과와 함께 검토
/review-proposal docs/proposals/서버구축/ --rfp docs/rfp/분석결과.md
```

## 주의사항

- RFP 분석 결과가 있으면 더 정확한 평가가 가능합니다
- Chain of Thought 방식으로 검증하여 객관적이고 균형잡힌 평가를 수행합니다
- 문제 지적만 하지 않고 반드시 개선 방안을 함께 제시합니다
