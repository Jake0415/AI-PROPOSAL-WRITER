import type { OutlineSection } from '@/lib/ai/types';

export interface OutlineTemplate {
  id: string;
  name: string;
  category: 'si' | 'consulting' | 'maintenance';
  categoryLabel: string;
  sections: OutlineSection[];
}

export const OUTLINE_TEMPLATES: OutlineTemplate[] = [
  {
    id: 'tpl-si',
    name: 'SI 프로젝트 (기술부문 강조)',
    category: 'si',
    categoryLabel: 'SI',
    sections: [
      { id: 'si-1', title: '제안 개요', level: 0, order: 1, children: [
        { id: 'si-1.1', title: '사업 이해', level: 1, order: 1, children: [] },
        { id: 'si-1.2', title: '추진 방향', level: 1, order: 2, children: [] },
        { id: 'si-1.3', title: '기대 효과', level: 1, order: 3, children: [] },
      ]},
      { id: 'si-2', title: '제안업체 일반', level: 0, order: 2, children: [
        { id: 'si-2.1', title: '회사 현황', level: 1, order: 1, children: [] },
        { id: 'si-2.2', title: '유사 수행 실적', level: 1, order: 2, children: [] },
        { id: 'si-2.3', title: '참여 인력', level: 1, order: 3, children: [] },
      ]},
      { id: 'si-3', title: '기술 부문', level: 0, order: 3, children: [
        { id: 'si-3.1', title: '현황 분석', level: 1, order: 1, children: [] },
        { id: 'si-3.2', title: '목표 시스템 설계', level: 1, order: 2, children: [] },
        { id: 'si-3.3', title: '아키텍처 구성', level: 1, order: 3, children: [] },
        { id: 'si-3.4', title: '기능 설계', level: 1, order: 4, children: [] },
        { id: 'si-3.5', title: '데이터 설계', level: 1, order: 5, children: [] },
        { id: 'si-3.6', title: '인터페이스 설계', level: 1, order: 6, children: [] },
        { id: 'si-3.7', title: '시험 및 검증', level: 1, order: 7, children: [] },
        { id: 'si-3.8', title: '이행 및 전환', level: 1, order: 8, children: [] },
      ]},
      { id: 'si-4', title: '관리 부문', level: 0, order: 4, children: [
        { id: 'si-4.1', title: '수행 조직', level: 1, order: 1, children: [] },
        { id: 'si-4.2', title: '일정 관리', level: 1, order: 2, children: [] },
        { id: 'si-4.3', title: '품질 보증', level: 1, order: 3, children: [] },
        { id: 'si-4.4', title: '위험 관리', level: 1, order: 4, children: [] },
        { id: 'si-4.5', title: '보안 관리', level: 1, order: 5, children: [] },
      ]},
      { id: 'si-5', title: '지원 부문', level: 0, order: 5, children: [
        { id: 'si-5.1', title: '교육 훈련', level: 1, order: 1, children: [] },
        { id: 'si-5.2', title: '유지보수', level: 1, order: 2, children: [] },
        { id: 'si-5.3', title: '기술 이전', level: 1, order: 3, children: [] },
      ]},
    ],
  },
  {
    id: 'tpl-consulting',
    name: '컨설팅 (방법론 강조)',
    category: 'consulting',
    categoryLabel: '컨설팅',
    sections: [
      { id: 'con-1', title: '제안 개요', level: 0, order: 1, children: [
        { id: 'con-1.1', title: '사업 이해', level: 1, order: 1, children: [] },
        { id: 'con-1.2', title: '추진 방향', level: 1, order: 2, children: [] },
      ]},
      { id: 'con-2', title: '제안업체 일반', level: 0, order: 2, children: [
        { id: 'con-2.1', title: '회사 현황', level: 1, order: 1, children: [] },
        { id: 'con-2.2', title: '수행 실적', level: 1, order: 2, children: [] },
      ]},
      { id: 'con-3', title: '컨설팅 방법론', level: 0, order: 3, children: [
        { id: 'con-3.1', title: '접근 전략', level: 1, order: 1, children: [] },
        { id: 'con-3.2', title: '분석 프레임워크', level: 1, order: 2, children: [] },
        { id: 'con-3.3', title: '현황 진단', level: 1, order: 3, children: [] },
        { id: 'con-3.4', title: '벤치마킹', level: 1, order: 4, children: [] },
        { id: 'con-3.5', title: 'To-Be 모델', level: 1, order: 5, children: [] },
        { id: 'con-3.6', title: '실행 로드맵', level: 1, order: 6, children: [] },
      ]},
      { id: 'con-4', title: '관리 부문', level: 0, order: 4, children: [
        { id: 'con-4.1', title: '수행 조직', level: 1, order: 1, children: [] },
        { id: 'con-4.2', title: '일정 관리', level: 1, order: 2, children: [] },
        { id: 'con-4.3', title: '품질 보증', level: 1, order: 3, children: [] },
      ]},
      { id: 'con-5', title: '지원 부문', level: 0, order: 5, children: [
        { id: 'con-5.1', title: '교육 훈련', level: 1, order: 1, children: [] },
        { id: 'con-5.2', title: '기술 이전', level: 1, order: 2, children: [] },
      ]},
    ],
  },
  {
    id: 'tpl-maintenance',
    name: '유지보수 (SLA/운영 강조)',
    category: 'maintenance',
    categoryLabel: '유지보수',
    sections: [
      { id: 'mt-1', title: '제안 개요', level: 0, order: 1, children: [
        { id: 'mt-1.1', title: '사업 이해', level: 1, order: 1, children: [] },
        { id: 'mt-1.2', title: '추진 방향', level: 1, order: 2, children: [] },
      ]},
      { id: 'mt-2', title: '제안업체 일반', level: 0, order: 2, children: [
        { id: 'mt-2.1', title: '회사 현황', level: 1, order: 1, children: [] },
        { id: 'mt-2.2', title: '수행 실적', level: 1, order: 2, children: [] },
      ]},
      { id: 'mt-3', title: '운영 체계', level: 0, order: 3, children: [
        { id: 'mt-3.1', title: '운영 조직', level: 1, order: 1, children: [] },
        { id: 'mt-3.2', title: '장애 대응 체계', level: 1, order: 2, children: [] },
        { id: 'mt-3.3', title: 'SLA 관리', level: 1, order: 3, children: [] },
        { id: 'mt-3.4', title: '예방적 유지보수', level: 1, order: 4, children: [] },
        { id: 'mt-3.5', title: '성능 모니터링', level: 1, order: 5, children: [] },
      ]},
      { id: 'mt-4', title: '관리 부문', level: 0, order: 4, children: [
        { id: 'mt-4.1', title: '수행 조직', level: 1, order: 1, children: [] },
        { id: 'mt-4.2', title: '일정 관리', level: 1, order: 2, children: [] },
        { id: 'mt-4.3', title: '품질 보증', level: 1, order: 3, children: [] },
      ]},
      { id: 'mt-5', title: '지원 부문', level: 0, order: 5, children: [
        { id: 'mt-5.1', title: '교육 훈련', level: 1, order: 1, children: [] },
        { id: 'mt-5.2', title: '기술 이전', level: 1, order: 2, children: [] },
      ]},
    ],
  },
];
