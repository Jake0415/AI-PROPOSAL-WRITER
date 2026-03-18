import type { StepTip } from './types';

// 7단계별 팁 데이터
export const STEP_TIPS: StepTip[] = [
  // ─── 1단계: RFP 업로드 ───
  {
    id: 'upload-1',
    stepKey: 'upload',
    title: 'PDF 원본 파일 사용',
    content:
      'PDF 원본으로 업로드하면 텍스트 추출 정확도가 높습니다. 스캔 이미지 PDF는 텍스트 인식률이 낮을 수 있습니다.',
    importance: 'high',
    category: 'practical',
  },
  {
    id: 'upload-2',
    stepKey: 'upload',
    title: '핵심 문서 선택',
    content:
      'RFP에 첨부파일이 여러 개라면, 제안요청서 본문과 과업지시서를 우선 업로드하세요. 별첨 서식은 나중에 참고해도 됩니다.',
    importance: 'medium',
    category: 'practical',
  },
  {
    id: 'upload-3',
    stepKey: 'upload',
    title: '최신 버전 확인',
    content:
      '입찰 공고에 수정공고(변경공고)가 있는지 확인하세요. 최종 수정된 RFP를 기반으로 분석해야 정확합니다.',
    importance: 'high',
    category: 'public-bid',
  },

  // ─── 2단계: AI 분석 ───
  {
    id: 'analysis-1',
    stepKey: 'analysis',
    title: '평가기준 배점 확인',
    content:
      '평가기준 배점표를 가장 먼저 확인하세요. 배점이 높은 항목이 당락을 결정합니다. 기술성 평가에서 배점이 큰 영역에 더 많은 지면을 할애해야 합니다.',
    importance: 'high',
    category: 'public-bid',
  },
  {
    id: 'analysis-2',
    stepKey: 'analysis',
    title: '요구사항 누락 점검',
    content:
      'AI 분석 결과에서 요구사항이 빠진 것이 없는지 원문과 대조하세요. 특히 "부록", "별첨", "과업지시서"에 숨어 있는 요구사항을 놓치기 쉽습니다.',
    importance: 'high',
    category: 'practical',
  },
  {
    id: 'analysis-3',
    stepKey: 'analysis',
    title: '발주기관 특성 파악',
    content:
      '발주기관의 성격(중앙부처, 지자체, 공기업 등)에 따라 강조할 포인트가 달라집니다. 기관의 주요 사업 방향과 연계하면 설득력이 높아집니다.',
    importance: 'medium',
    category: 'public-bid',
  },
  {
    id: 'analysis-4',
    stepKey: 'analysis',
    title: '핵심 키워드 활용',
    content:
      'RFP에서 반복적으로 등장하는 키워드를 제안서 전반에 일관되게 사용하세요. 평가위원이 친숙하게 느끼는 용어를 쓰면 가독성이 높아집니다.',
    importance: 'medium',
    category: 'principle',
  },

  // ─── 3단계: 방향성 설정 ───
  {
    id: 'direction-1',
    stepKey: 'direction',
    title: '배점 중심 방향 선택',
    content:
      '적합도(fitScore) 점수만 보지 말고, 평가 배점이 높은 영역에 강점이 있는 방향을 선택하세요. 배점 30점짜리 항목에서 차별화가 10점짜리보다 훨씬 유리합니다.',
    importance: 'high',
    category: 'public-bid',
  },
  {
    id: 'direction-2',
    stepKey: 'direction',
    title: '약점의 치명도 판단',
    content:
      '약점(weaknesses)이 "기본 자격요건 미달"인지 "부분적 보완 가능"인지 구분하세요. 기본 자격요건에 해당하는 약점은 선택을 피해야 합니다.',
    importance: 'high',
    category: 'practical',
  },
  {
    id: 'direction-3',
    stepKey: 'direction',
    title: '실현 가능성 우선',
    content:
      '화려한 방향보다 실현 가능한 방향이 좋습니다. 평가위원은 경험적으로 과대 약속을 구분합니다. 현실적이면서도 차별화된 방향을 선택하세요.',
    importance: 'medium',
    category: 'principle',
  },

  // ─── 4단계: 전략 수립 ───
  {
    id: 'strategy-1',
    stepKey: 'strategy',
    title: '차별화 포인트에 근거 필수',
    content:
      '차별화 포인트(differentiators)마다 "근거(evidence)"가 구체적일수록 설득력이 높습니다. 유사 프로젝트 실적, 전문 인력 보유 현황, 특허/인증 등 객관적 근거를 제시하세요.',
    importance: 'high',
    category: 'principle',
  },
  {
    id: 'strategy-2',
    stepKey: 'strategy',
    title: '핵심 메시지 반복 전략',
    content:
      '핵심 메시지(key messages)는 제안서 전반에 일관되게 반복하세요. Executive Summary, 각 장 도입부, 결론에 동일한 메시지를 다른 표현으로 반복하면 기억에 남습니다.',
    importance: 'high',
    category: 'principle',
  },
  {
    id: 'strategy-3',
    stepKey: 'strategy',
    title: '경쟁사 대비 포지셔닝',
    content:
      '직접적인 경쟁사 비방은 감점 요인입니다. 대신 "기존 방식 대비 개선점", "일반적인 접근 대비 차별점" 형태로 간접 비교하세요.',
    importance: 'medium',
    category: 'public-bid',
  },
  {
    id: 'strategy-4',
    stepKey: 'strategy',
    title: '가격 대비 가치 강조',
    content:
      '기술성 평가에서는 "비용 절감"보다 "가치 극대화" 관점이 효과적입니다. 투자 대비 효과(ROI)를 수치로 제시하면 더 설득력 있습니다.',
    importance: 'medium',
    category: 'practical',
  },

  // ─── 5단계: 목차 구성 ───
  {
    id: 'outline-1',
    stepKey: 'outline',
    title: '평가항목과 목차 1:1 대응',
    content:
      '평가기준의 각 항목이 목차 어디에 대응되는지 확인하세요. 평가위원은 평가표를 들고 제안서를 읽습니다. 항목을 빠뜨리면 해당 배점을 받기 어렵습니다.',
    importance: 'high',
    category: 'public-bid',
  },
  {
    id: 'outline-2',
    stepKey: 'outline',
    title: '표준 목차 구조 준수',
    content:
      '공공 제안서는 "기술 부문 → 관리 부문 → 지원 부문" 순서가 관례입니다. 이 순서를 따르면 평가위원이 편하게 읽을 수 있습니다.',
    importance: 'high',
    category: 'public-bid',
  },
  {
    id: 'outline-3',
    stepKey: 'outline',
    title: '깊이보다 폭 우선',
    content:
      '목차가 4단계 이상 깊어지면 가독성이 떨어집니다. 대신 2~3단계 수준에서 폭을 넓히고, 상세 내용은 본문에서 다루세요.',
    importance: 'medium',
    category: 'principle',
  },
  {
    id: 'outline-4',
    stepKey: 'outline',
    title: '배점 비례 지면 배분',
    content:
      '배점이 높은 항목에 더 많은 페이지를 할당하세요. 예를 들어 기술성 30점, 관리 20점이면 기술 부문에 1.5배 더 많은 지면을 확보합니다.',
    importance: 'medium',
    category: 'practical',
  },

  // ─── 6단계: 내용 편집 ───
  {
    id: 'sections-1',
    stepKey: 'sections',
    title: '두괄식 서술',
    content:
      '각 섹션의 첫 문단에 핵심 주장을 먼저 쓰세요. 평가위원은 짧은 시간 안에 많은 제안서를 읽으므로, 결론을 먼저 제시해야 핵심이 전달됩니다.',
    importance: 'high',
    category: 'principle',
  },
  {
    id: 'sections-2',
    stepKey: 'sections',
    title: '시각 자료 적극 활용',
    content:
      '표, 다이어그램, 아키텍처 도, 일정표 등 시각 자료를 적극 활용하세요. 텍스트만으로는 전달하기 어려운 내용을 시각화하면 이해도와 가독성이 크게 높아집니다.',
    importance: 'high',
    category: 'principle',
  },
  {
    id: 'sections-3',
    stepKey: 'sections',
    title: '수치와 근거 제시',
    content:
      '"최적의 방안을 제시합니다" 같은 추상적 표현 대신 "응답속도 30% 향상", "가용률 99.9% 보장" 등 구체적 수치를 제시하세요.',
    importance: 'medium',
    category: 'practical',
  },
  {
    id: 'sections-4',
    stepKey: 'sections',
    title: 'RFP 용어 그대로 사용',
    content:
      'RFP에서 사용한 용어를 그대로 사용하세요. 같은 의미라도 다른 용어를 쓰면 평가위원이 대응 관계를 파악하기 어렵습니다.',
    importance: 'medium',
    category: 'public-bid',
  },

  // ─── 7단계: 산출물 출력 ───
  {
    id: 'output-1',
    stepKey: 'output',
    title: '최종 검수 체크리스트',
    content:
      '오탈자, 페이지 번호, 목차-본문 일치, 그림 번호, 표 제목 등을 최종 점검하세요. 사소한 실수가 전체 인상을 떨어뜨릴 수 있습니다.',
    importance: 'high',
    category: 'practical',
  },
  {
    id: 'output-2',
    stepKey: 'output',
    title: '페이지 수 제한 준수',
    content:
      'RFP에 페이지 수 제한이 명시되어 있다면 반드시 지키세요. 초과분은 평가에서 제외되거나 감점될 수 있습니다. 핵심 내용 위주로 편집하세요.',
    importance: 'high',
    category: 'public-bid',
  },
  {
    id: 'output-3',
    stepKey: 'output',
    title: '일관된 디자인 템플릿',
    content:
      '글꼴, 색상, 헤더/푸터, 표 스타일 등이 전체적으로 통일되어야 합니다. 일관된 디자인은 전문성과 신뢰감을 줍니다.',
    importance: 'medium',
    category: 'principle',
  },
];

// 단계별 팁 조회 헬퍼
export function getStepTips(stepKey: string): StepTip[] {
  return STEP_TIPS.filter((tip) => tip.stepKey === stepKey);
}
