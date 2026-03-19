import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { v4 as uuidv4 } from 'uuid';
import * as schema from '../lib/db/schema';

const now = new Date().toISOString();

// 프로젝트 ID 고정 (테스트에서 참조)
const PROJECT_ID = 'proj-demo-001';
const OUTLINE_ID = 'outline-demo-001';

async function seedData() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL 환경변수가 설정되지 않았습니다');
    process.exit(1);
  }

  const client = postgres(connectionString, { prepare: false });
  const db = drizzle(client, { schema });

  console.log('테스트 데이터 생성 시작...\n');

  // 1. 프로젝트 생성 (sections_ready 상태 - 대부분의 페이지 접근 가능)
  const existingProject = await db.select().from(schema.projects).where(
    require('drizzle-orm').eq(schema.projects.id, PROJECT_ID)
  );

  if (existingProject.length > 0) {
    console.log('⏭️  데모 프로젝트 이미 존재, 건너뜀');
    await client.end();
    return;
  }

  await db.insert(schema.projects).values({
    id: PROJECT_ID,
    title: '2026년 스마트시티 통합플랫폼 구축 사업',
    status: 'sections_ready',
    createdAt: now,
    updatedAt: now,
  });
  console.log('✅ 프로젝트 생성');

  // 2. RFP 분석 결과
  await db.insert(schema.rfpAnalyses).values({
    id: uuidv4(),
    projectId: PROJECT_ID,
    overview: JSON.stringify({
      projectName: '2026년 스마트시티 통합플랫폼 구축 사업',
      client: '서울특별시',
      budget: '50억원',
      duration: '2026.06 ~ 2027.12 (18개월)',
      purpose: '시민 생활편의 향상을 위한 도시 데이터 통합관리 플랫폼 구축',
    }),
    requirements: JSON.stringify([
      { id: 'REQ-FR-001', category: '기능', description: '실시간 도시 데이터 수집 및 통합', priority: 'mandatory' },
      { id: 'REQ-FR-002', category: '기능', description: 'AI 기반 도시 문제 예측 분석', priority: 'mandatory' },
      { id: 'REQ-FR-003', category: '기능', description: '시민 참여형 민원 관리 시스템', priority: 'mandatory' },
      { id: 'REQ-FR-004', category: '기능', description: '대시보드 기반 실시간 모니터링', priority: 'optional' },
      { id: 'REQ-NF-001', category: '비기능', description: '99.9% 가용성 보장', priority: 'mandatory' },
      { id: 'REQ-NF-002', category: '비기능', description: '개인정보보호법 준수', priority: 'mandatory' },
      { id: 'REQ-TS-001', category: '기술', description: 'Kubernetes 기반 클라우드 네이티브 아키텍처', priority: 'mandatory' },
      { id: 'REQ-TS-002', category: '기술', description: 'MSA(마이크로서비스) 아키텍처 적용', priority: 'optional' },
    ]),
    evaluationCriteria: JSON.stringify([
      { name: '기술 이해도', weight: 20 },
      { name: '수행 방안', weight: 30 },
      { name: '프로젝트 관리', weight: 15 },
      { name: '기술 인력', weight: 20 },
      { name: '가격', weight: 15 },
    ]),
    evaluationItems: JSON.stringify([
      { id: 'EVAL-001', category: '기술', name: '사업 이해도 및 추진전략', score: 20, weight: 20, priority: 'high' },
      { id: 'EVAL-002', category: '기술', name: '시스템 아키텍처 설계', score: 15, weight: 15, priority: 'high' },
      { id: 'EVAL-003', category: '기술', name: '데이터 통합 방안', score: 15, weight: 15, priority: 'high' },
      { id: 'EVAL-004', category: '관리', name: '프로젝트 관리 방안', score: 15, weight: 15, priority: 'medium' },
      { id: 'EVAL-005', category: '관리', name: '품질 보증 계획', score: 10, weight: 10, priority: 'medium' },
      { id: 'EVAL-006', category: '인력', name: '투입 인력 구성', score: 15, weight: 15, priority: 'high' },
      { id: 'EVAL-007', category: '가격', name: '가격 적정성', score: 10, weight: 10, priority: 'medium' },
    ]),
    traceabilityMatrix: JSON.stringify([
      { reqId: 'REQ-FR-001', evalId: 'EVAL-003', mandatory: true },
      { reqId: 'REQ-FR-002', evalId: 'EVAL-002', mandatory: true },
      { reqId: 'REQ-FR-003', evalId: 'EVAL-003', mandatory: true },
      { reqId: 'REQ-NF-001', evalId: 'EVAL-005', mandatory: true },
      { reqId: 'REQ-TS-001', evalId: 'EVAL-002', mandatory: true },
    ]),
    qualifications: JSON.stringify([
      { type: '참가자격', description: '소프트웨어사업자 신고확인서 보유' },
      { type: '참가자격', description: '최근 3년간 유사사업 수행실적 2건 이상' },
      { type: '납기', description: '계약 후 18개월 이내 완료' },
    ]),
    strategyPoints: JSON.stringify([
      { point: '클라우드 네이티브 역량 강조', reason: 'K8s 기반 아키텍처 필수 요구' },
      { point: 'AI/ML 데이터 분석 차별화', reason: '도시 문제 예측 분석이 핵심 평가항목' },
      { point: '시민 참여 UX 전략', reason: '민원 관리 시스템의 사용성이 중요' },
    ]),
    recommendedChapters: JSON.stringify([
      { title: '사업 이해 및 추진전략', evalIds: ['EVAL-001'], score: 20, pages: 15, reqIds: ['REQ-FR-001', 'REQ-FR-002'] },
      { title: '시스템 아키텍처', evalIds: ['EVAL-002'], score: 15, pages: 12, reqIds: ['REQ-TS-001', 'REQ-TS-002'] },
      { title: '데이터 통합 및 분석', evalIds: ['EVAL-003'], score: 15, pages: 10, reqIds: ['REQ-FR-001', 'REQ-FR-003'] },
      { title: '프로젝트 관리', evalIds: ['EVAL-004', 'EVAL-005'], score: 25, pages: 10, reqIds: ['REQ-NF-001'] },
      { title: '투입 인력', evalIds: ['EVAL-006'], score: 15, pages: 8, reqIds: [] },
    ]),
    scope: JSON.stringify({ inScope: ['플랫폼 설계/개발', '데이터 연계', '시범 운영'], outScope: ['하드웨어 조달'] }),
    constraints: JSON.stringify({ budget: '50억원', timeline: '18개월', technology: 'K8s 기반 클라우드' }),
    keywords: JSON.stringify(['스마트시티', '통합플랫폼', 'AI', '빅데이터', '클라우드', 'IoT', '시민참여']),
    analyzedAt: now,
  });
  console.log('✅ RFP 분석 결과 생성');

  // 3. 방향성 설정
  await db.insert(schema.proposalDirections).values({
    id: uuidv4(),
    projectId: PROJECT_ID,
    candidates: JSON.stringify([
      {
        title: '기술 혁신 중심 전략',
        fitScore: 92,
        description: 'AI/빅데이터 기반 스마트시티 핵심 기술 역량을 전면에 내세우는 전략',
        strengths: ['AI 예측분석 기술 차별화', '클라우드 네이티브 아키텍처 전문성', '데이터 통합 플랫폼 구축 경험'],
        weaknesses: ['가격 경쟁력 상대적 약화 가능', '기술 복잡도로 인한 일정 리스크'],
      },
      {
        title: '시민 중심 UX 전략',
        fitScore: 85,
        description: '시민 참여와 사용자 경험을 핵심 가치로 제안하는 전략',
        strengths: ['시민 참여 플랫폼 운영 경험', '직관적 UI/UX 설계 역량'],
        weaknesses: ['기술 혁신성 부각 어려움'],
      },
      {
        title: '안정적 운영 중심 전략',
        fitScore: 78,
        description: '99.9% 가용성과 안정적 운영을 핵심으로 제안',
        strengths: ['안정성 검증된 아키텍처', '24/7 운영 체계 구축 역량'],
        weaknesses: ['차별화 포인트 부족'],
      },
    ]),
    selectedIndex: 0,
    customNotes: '',
    confirmedAt: now,
  });
  console.log('✅ 방향성 설정 생성');

  // 4. 전략 수립
  await db.insert(schema.proposalStrategies).values({
    id: uuidv4(),
    projectId: PROJECT_ID,
    competitiveStrategy: 'AI/빅데이터 기반 도시 문제 예측 분석 플랫폼을 핵심으로, 클라우드 네이티브 아키텍처와 마이크로서비스 기반의 확장 가능한 통합 플랫폼을 제안합니다. 당사의 스마트시티 구축 경험과 AI 기술력을 통해 발주기관의 요구사항을 충족하면서도 기술 혁신성을 극대화합니다.',
    differentiators: JSON.stringify([
      { title: 'AI 예측분석 엔진', description: '실시간 도시 데이터를 활용한 문제 예측 및 선제적 대응 시스템', evidence: '유사 프로젝트 3건 성공 수행' },
      { title: '클라우드 네이티브 플랫폼', description: 'Kubernetes 기반 자동 확장, 무중단 배포, 장애 자동 복구', evidence: 'CNCF 인증 엔지니어 5명 보유' },
      { title: '데이터 통합 프레임워크', description: '이기종 IoT 데이터 실시간 수집·정제·통합 파이프라인', evidence: '특허 2건 보유' },
    ]),
    keyMessages: JSON.stringify([
      'AI가 도시의 미래를 예측하고, 시민의 삶을 변화시킵니다',
      '클라우드 네이티브 기술로 99.9% 안정성을 보장합니다',
      '시민과 함께 만드는 스마트시티, 참여형 플랫폼을 제공합니다',
    ]),
    writingStyle: 'persuasive',
    customNotes: '',
    confirmedAt: now,
  });
  console.log('✅ 전략 수립 생성');

  // 5. 목차 구성
  const sections = [
    { path: '1', title: '사업 이해 및 추진전략', depth: 0 },
    { path: '1.1', title: '사업 개요 및 목표', depth: 1 },
    { path: '1.2', title: '현황 분석 및 문제점', depth: 1 },
    { path: '1.3', title: '추진 전략 및 방향', depth: 1 },
    { path: '2', title: '시스템 아키텍처', depth: 0 },
    { path: '2.1', title: '전체 시스템 구성도', depth: 1 },
    { path: '2.2', title: '클라우드 네이티브 아키텍처', depth: 1 },
    { path: '2.3', title: '마이크로서비스 설계', depth: 1 },
    { path: '3', title: '데이터 통합 및 분석', depth: 0 },
    { path: '3.1', title: 'IoT 데이터 수집 체계', depth: 1 },
    { path: '3.2', title: 'AI 예측분석 엔진', depth: 1 },
    { path: '4', title: '프로젝트 관리', depth: 0 },
    { path: '4.1', title: '프로젝트 추진 체계', depth: 1 },
    { path: '4.2', title: '품질 보증 계획', depth: 1 },
    { path: '5', title: '투입 인력', depth: 0 },
    { path: '5.1', title: '핵심 인력 구성', depth: 1 },
    { path: '5.2', title: '교육 및 기술이전 계획', depth: 1 },
  ];

  await db.insert(schema.proposalOutlines).values({
    id: OUTLINE_ID,
    projectId: PROJECT_ID,
    sections: JSON.stringify(sections),
  });
  console.log('✅ 목차 구성 생성');

  // 6. 섹션 내용
  const sectionContents = [
    { path: '1', title: '사업 이해 및 추진전략', content: '본 사업은 서울특별시의 스마트시티 통합플랫폼 구축을 통해 도시 데이터의 체계적 관리와 AI 기반 의사결정 지원 체계를 마련하고자 합니다.' },
    { path: '1.1', title: '사업 개요 및 목표', content: '서울특별시는 4차 산업혁명 시대에 발맞추어 도시 인프라의 디지털 전환을 추진하고 있습니다. 본 사업의 목표는 다음과 같습니다.\n\n1. 도시 데이터 통합관리 체계 구축\n2. AI 기반 도시 문제 예측 및 선제적 대응\n3. 시민 참여형 스마트 서비스 제공\n4. 데이터 기반 도시 정책 의사결정 지원' },
    { path: '1.2', title: '현황 분석 및 문제점', content: '현재 서울시의 도시 데이터는 부서별로 산재되어 있어 통합적인 활용이 어려운 상황입니다.\n\n**현황**\n- IoT 센서 데이터: 교통, 환경, 안전 등 분야별 개별 수집\n- 시민 민원: 다양한 채널을 통한 접수이나 통합 관리 미흡\n- 도시 인프라: 실시간 모니터링 체계 부재\n\n**문제점**\n- 데이터 사일로로 인한 융합 분석 불가\n- 사후 대응 중심의 도시 관리\n- 시민 체감도 낮은 행정 서비스' },
    { path: '1.3', title: '추진 전략 및 방향', content: '당사는 AI 예측분석 기술과 클라우드 네이티브 아키텍처를 기반으로 다음과 같은 전략을 제안합니다.\n\n**3대 핵심 전략**\n1. **데이터 중심**: 도시 전체 데이터의 통합·분석·활용 체계 확립\n2. **AI 선제 대응**: 머신러닝 기반 도시 문제 예측 및 자동 대응\n3. **시민 참여**: 시민이 직접 참여하고 혜택을 체감하는 플랫폼' },
    { path: '2', title: '시스템 아키텍처', content: '본 시스템은 Kubernetes 기반 클라우드 네이티브 아키텍처로 설계하여 높은 확장성과 안정성을 보장합니다.' },
    { path: '2.1', title: '전체 시스템 구성도', content: '시스템은 크게 데이터 수집 계층, 데이터 처리 계층, 서비스 계층, 프레젠테이션 계층으로 구성됩니다.\n\n- **데이터 수집**: IoT Gateway, API Gateway\n- **데이터 처리**: Apache Kafka, Spark Streaming\n- **서비스**: Spring Boot 기반 마이크로서비스\n- **프레젠테이션**: React 기반 웹 대시보드, 모바일 앱' },
    { path: '2.2', title: '클라우드 네이티브 아키텍처', content: 'Kubernetes 클러스터를 기반으로 컨테이너 오케스트레이션을 구현하며, Helm Chart를 통한 표준화된 배포 파이프라인을 제공합니다.\n\n**핵심 구성요소**\n- Kubernetes 1.28+: 컨테이너 오케스트레이션\n- Istio: 서비스 메시 및 트래픽 관리\n- ArgoCD: GitOps 기반 지속적 배포\n- Prometheus/Grafana: 모니터링 및 알림' },
    { path: '2.3', title: '마이크로서비스 설계', content: '도메인 주도 설계(DDD)를 적용하여 각 비즈니스 도메인을 독립적인 마이크로서비스로 분리합니다.\n\n**주요 서비스**\n1. 데이터 수집 서비스 (Data Collector)\n2. AI 분석 서비스 (AI Analytics)\n3. 시민 참여 서비스 (Citizen Portal)\n4. 대시보드 서비스 (Dashboard)\n5. 알림 서비스 (Notification)' },
    { path: '3', title: '데이터 통합 및 분석', content: '이기종 데이터를 실시간으로 수집·정제·분석하는 통합 데이터 파이프라인을 구축합니다.' },
    { path: '3.1', title: 'IoT 데이터 수집 체계', content: '교통, 환경, 안전, 에너지 등 다양한 도메인의 IoT 센서 데이터를 실시간으로 수집합니다.\n\n**수집 대상**\n- 교통: CCTV, 차량 감지 센서, 신호등\n- 환경: 대기질, 소음, 미세먼지 센서\n- 안전: 화재감지, CCTV 영상분석\n- 에너지: 스마트미터, 전력 사용량' },
    { path: '3.2', title: 'AI 예측분석 엔진', content: '수집된 도시 데이터를 기반으로 머신러닝 모델이 도시 문제를 사전에 예측하고 최적의 대응 방안을 제시합니다.\n\n**주요 예측 모델**\n1. 교통 혼잡도 예측 (LSTM)\n2. 대기질 변화 예측 (GRU)\n3. 에너지 수요 예측 (Prophet)\n4. 시민 민원 패턴 분석 (NLP)' },
    { path: '4', title: '프로젝트 관리', content: '체계적인 프로젝트 관리를 통해 품질·일정·비용 목표를 달성합니다.' },
    { path: '4.1', title: '프로젝트 추진 체계', content: '애자일 방법론을 기반으로 2주 단위 스프린트를 운영하며, 발주기관과의 긴밀한 소통 체계를 구축합니다.\n\n**추진 일정**\n- Phase 1 (1~6개월): 설계 및 핵심 모듈 개발\n- Phase 2 (7~12개월): 통합 개발 및 연계\n- Phase 3 (13~18개월): 시범운영 및 안정화' },
    { path: '4.2', title: '품질 보증 계획', content: 'ISO 9001 기반 품질관리 체계를 적용하며, 자동화된 테스트와 코드 리뷰를 통해 품질을 보장합니다.\n\n**품질 지표**\n- 코드 커버리지: 80% 이상\n- 결함 밀도: 0.5건/KLOC 이하\n- 가용성: 99.9% 이상' },
    { path: '5', title: '투입 인력', content: '프로젝트 성공을 위해 최적의 전문 인력을 투입합니다.' },
    { path: '5.1', title: '핵심 인력 구성', content: '**PM (프로젝트 관리자)**\n- 경력 15년, PMP 자격\n- 유사 스마트시티 프로젝트 3건 수행\n\n**AA (아키텍트)**\n- 경력 12년, CNCF 인증\n- Kubernetes 기반 대규모 시스템 설계 경험\n\n**AI 전문가**\n- 경력 10년, 박사학위\n- 도시 데이터 분석 논문 5편 발표' },
    { path: '5.2', title: '교육 및 기술이전 계획', content: '시스템 운영 인력에 대한 체계적인 교육과 기술이전을 수행합니다.\n\n**교육 프로그램**\n1. 시스템 운영 교육 (40시간)\n2. 데이터 분석 도구 교육 (24시간)\n3. 장애 대응 교육 (16시간)\n4. 운영 매뉴얼 제공' },
  ];

  for (const sec of sectionContents) {
    await db.insert(schema.proposalSections).values({
      id: uuidv4(),
      projectId: PROJECT_ID,
      outlineId: OUTLINE_ID,
      sectionPath: sec.path,
      title: sec.title,
      content: sec.content,
      diagrams: '[]',
      status: 'generated',
      linkedReqIds: '[]',
      generatedAt: now,
    });
  }
  console.log('✅ 섹션 내용 17개 생성');

  console.log('\n테스트 데이터 생성 완료!');
  console.log('프로젝트: "2026년 스마트시티 통합플랫폼 구축 사업"');
  console.log('상태: sections_ready (대부분의 페이지 접근 가능)');

  await client.end();
}

seedData().catch((err) => {
  console.error('시드 실패:', err);
  process.exit(1);
});
