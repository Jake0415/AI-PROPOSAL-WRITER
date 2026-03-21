import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import * as schema from '../lib/db/schema';
import { DEFAULT_PROMPTS } from '../lib/ai/prompts/defaults';

// 고정 UUID (테스트에서 참조)
const PROJECT_ID = '00000000-0000-4000-a000-000000000001';
const OUTLINE_ID = '00000000-0000-4000-a000-000000000002';

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
    eq(schema.projects.id, PROJECT_ID)
  );

  // ─── 프롬프트 템플릿 시드 (UPSERT: 변경분 자동 반영) ──────────
  for (const def of Object.values(DEFAULT_PROMPTS)) {
    await db.insert(schema.promptTemplates).values({
      slug: def.slug,
      name: def.name,
      description: def.description,
      category: def.category,
      systemPrompt: def.systemPrompt,
      userPromptTemplate: '',
      maxTokens: def.maxTokens,
    }).onConflictDoUpdate({
      target: schema.promptTemplates.slug,
      set: {
        name: def.name,
        description: def.description,
        category: def.category,
        systemPrompt: def.systemPrompt,
        maxTokens: def.maxTokens,
        updatedAt: new Date(),
      },
    });
  }
  console.log('✅ 프롬프트 템플릿 UPSERT 완료');

  // ─── AI 설정 시드 (기존 키 보존) ──────────────────
  try {
    const encryptionKey = process.env.ENCRYPTION_KEY;
    if (!encryptionKey) {
      console.log('⚠️  ENCRYPTION_KEY 미설정 → AI 설정 시드 스킵');
    } else {
      const { encrypt } = await import('../lib/security/encrypt');
      const anthropicKey = process.env.ANTHROPIC_API_KEY;
      const openaiKey = process.env.OPENAI_API_KEY;

      const existingSettings = await db.select().from(schema.aiSettings)
        .where(eq(schema.aiSettings.id, 'default'));

      if (existingSettings.length === 0) {
        const claudeKey = (anthropicKey && !anthropicKey.startsWith('your-')) ? encrypt(anthropicKey) : undefined;
        const gptKey = (openaiKey && !openaiKey.startsWith('your-')) ? encrypt(openaiKey) : undefined;
        await db.insert(schema.aiSettings).values({
          id: 'default',
          provider: 'claude',
          claudeModel: 'claude-sonnet-4-6',
          gptModel: 'gpt-5.4-mini',
          ...(claudeKey && { claudeApiKey: claudeKey }),
          ...(gptKey && { gptApiKey: gptKey }),
        });
        console.log('✅ AI 설정 초기 생성' +
          (claudeKey ? ' (Claude 키 포함)' : '') +
          (gptKey ? ' (OpenAI 키 포함)' : ''));
      } else {
        const update: Record<string, unknown> = {};
        if (!existingSettings[0].claudeApiKey && anthropicKey && !anthropicKey.startsWith('your-')) {
          update.claudeApiKey = encrypt(anthropicKey);
        }
        if (!existingSettings[0].gptApiKey && openaiKey && !openaiKey.startsWith('your-')) {
          update.gptApiKey = encrypt(openaiKey);
        }
        if (Object.keys(update).length > 0) {
          update.updatedAt = new Date();
          await db.update(schema.aiSettings).set(update)
            .where(eq(schema.aiSettings.id, 'default'));
          console.log('✅ AI 설정 키 보충 완료');
        } else {
          console.log('✅ AI 설정 이미 존재 (변경 없음)');
        }
      }
    }
  } catch (err) {
    console.warn('⚠️  AI 설정 시드 실패 (계속 진행):', err);
  }

  if (existingProject.length > 0) {
    // 기존 데모 데이터 삭제 후 재생성 (CASCADE로 연관 데이터도 삭제)
    await db.delete(schema.projects).where(eq(schema.projects.id, PROJECT_ID));
    console.log('♻️  기존 데모 프로젝트 삭제 (재생성)');
  }

  await db.insert(schema.projects).values({
    id: PROJECT_ID,
    title: '2026년 스마트시티 통합플랫폼 구축 사업',
    status: 'sections_ready',
  });
  console.log('✅ 프로젝트 생성');

  // 2. RFP 분석 결과
  await db.insert(schema.rfpAnalyses).values({
    id: randomUUID(),
    projectId: PROJECT_ID,
    overview: {
      projectName: '2026년 스마트시티 통합플랫폼 구축 사업',
      client: '서울특별시',
      budget: '50억원',
      duration: '2026.06 ~ 2027.12 (18개월)',
      summary: '',
      purpose: '시민 생활편의 향상을 위한 도시 데이터 통합관리 플랫폼 구축',
    },
    requirements: [
      { id: 'REQ-FR-001', category: 'FR', title: '실시간 도시 데이터 수집 및 통합', description: '실시간 도시 데이터 수집 및 통합', mandatory: true },
      { id: 'REQ-FR-002', category: 'FR', title: 'AI 기반 도시 문제 예측 분석', description: 'AI 기반 도시 문제 예측 분석', mandatory: true },
      { id: 'REQ-FR-003', category: 'FR', title: '시민 참여형 민원 관리 시스템', description: '시민 참여형 민원 관리 시스템', mandatory: true },
      { id: 'REQ-FR-004', category: 'FR', title: '대시보드 기반 실시간 모니터링', description: '대시보드 기반 실시간 모니터링', mandatory: false },
      { id: 'REQ-NF-001', category: 'NFR', title: '99.9% 가용성 보장', description: '99.9% 가용성 보장', mandatory: true },
      { id: 'REQ-NF-002', category: 'NFR', title: '개인정보보호법 준수', description: '개인정보보호법 준수', mandatory: true },
      { id: 'REQ-TS-001', category: 'TR', title: 'Kubernetes 기반 클라우드 네이티브 아키텍처', description: 'Kubernetes 기반 클라우드 네이티브 아키텍처', mandatory: true },
      { id: 'REQ-TS-002', category: 'TR', title: 'MSA(마이크로서비스) 아키텍처 적용', description: 'MSA(마이크로서비스) 아키텍처 적용', mandatory: false },
    ],
    evaluationCriteria: [
      { category: '기술', item: '기술 이해도', score: 20, description: '기술 이해도' },
      { category: '기술', item: '수행 방안', score: 30, description: '수행 방안' },
      { category: '관리', item: '프로젝트 관리', score: 15, description: '프로젝트 관리' },
      { category: '인력', item: '기술 인력', score: 20, description: '기술 인력' },
      { category: '가격', item: '가격', score: 15, description: '가격' },
    ],
    evaluationItems: [
      { id: 'EVAL-001', category: '기술', item: '사업 이해도 및 추진전략', score: 20, weight: 20, priority: 'high' },
      { id: 'EVAL-002', category: '기술', item: '시스템 아키텍처 설계', score: 15, weight: 15, priority: 'high' },
      { id: 'EVAL-003', category: '기술', item: '데이터 통합 방안', score: 15, weight: 15, priority: 'high' },
      { id: 'EVAL-004', category: '관리', item: '프로젝트 관리 방안', score: 15, weight: 15, priority: 'medium' },
      { id: 'EVAL-005', category: '관리', item: '품질 보증 계획', score: 10, weight: 10, priority: 'medium' },
      { id: 'EVAL-006', category: '인력', item: '투입 인력 구성', score: 15, weight: 15, priority: 'high' },
      { id: 'EVAL-007', category: '가격', item: '가격 적정성', score: 10, weight: 10, priority: 'medium' },
    ],
    traceabilityMatrix: [
      { requirementId: 'REQ-FR-001', evaluationItemId: 'EVAL-003' },
      { requirementId: 'REQ-FR-002', evaluationItemId: 'EVAL-002' },
      { requirementId: 'REQ-FR-003', evaluationItemId: 'EVAL-003' },
      { requirementId: 'REQ-NF-001', evaluationItemId: 'EVAL-005' },
      { requirementId: 'REQ-TS-001', evaluationItemId: 'EVAL-002' },
    ],
    qualifications: [
      { type: 'eligibility', description: '소프트웨어사업자 신고확인서 보유', mandatory: true },
      { type: 'eligibility', description: '최근 3년간 유사사업 수행실적 2건 이상', mandatory: true },
      { type: 'deadline', description: '계약 후 18개월 이내 완료', mandatory: true },
    ],
    strategyPoints: [
      { priority: 'high', evalIds: ['EVAL-001'], totalScore: 20, recommendedRatio: 25, strategy: '클라우드 네이티브 역량 강조' },
      { priority: 'high', evalIds: ['EVAL-002', 'EVAL-003'], totalScore: 30, recommendedRatio: 30, strategy: 'AI/ML 데이터 분석 차별화' },
      { priority: 'medium', evalIds: ['EVAL-004'], totalScore: 15, recommendedRatio: 15, strategy: '시민 참여 UX 전략' },
    ],
    recommendedChapters: [
      { chapter: '사업 이해 및 추진전략', evalId: 'EVAL-001', score: 20, relatedRequirements: ['REQ-FR-001', 'REQ-FR-002'], recommendedPages: 15 },
      { chapter: '시스템 아키텍처', evalId: 'EVAL-002', score: 15, relatedRequirements: ['REQ-TS-001', 'REQ-TS-002'], recommendedPages: 12 },
      { chapter: '데이터 통합 및 분석', evalId: 'EVAL-003', score: 15, relatedRequirements: ['REQ-FR-001', 'REQ-FR-003'], recommendedPages: 10 },
    ],
    scope: { inScope: ['플랫폼 설계/개발', '데이터 연계', '시범 운영'], outOfScope: ['하드웨어 조달'] },
    constraints: { technical: ['K8s 기반 클라우드'], business: ['50억원'], timeline: ['18개월'] },
    keywords: ['스마트시티', '통합플랫폼', 'AI', '빅데이터', '클라우드', 'IoT', '시민참여'],
  });
  console.log('✅ RFP 분석 결과 생성');

  // 3. 방향성 설정
  await db.insert(schema.proposalDirections).values({
    id: randomUUID(),
    projectId: PROJECT_ID,
    candidates: [
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
    ],
    selectedIndex: 0,
    customNotes: '',
    confirmedAt: new Date(),
  });
  console.log('✅ 방향성 설정 생성');

  // 4. 전략 수립
  await db.insert(schema.proposalStrategies).values({
    id: randomUUID(),
    projectId: PROJECT_ID,
    competitiveStrategy: 'AI/빅데이터 기반 도시 문제 예측 분석 플랫폼을 핵심으로, 클라우드 네이티브 아키텍처와 마이크로서비스 기반의 확장 가능한 통합 플랫폼을 제안합니다. 당사의 스마트시티 구축 경험과 AI 기술력을 통해 발주기관의 요구사항을 충족하면서도 기술 혁신성을 극대화합니다.',
    differentiators: [
      { title: 'AI 예측분석 엔진', description: '실시간 도시 데이터를 활용한 문제 예측 및 선제적 대응 시스템', evidence: '유사 프로젝트 3건 성공 수행' },
      { title: '클라우드 네이티브 플랫폼', description: 'Kubernetes 기반 자동 확장, 무중단 배포, 장애 자동 복구', evidence: 'CNCF 인증 엔지니어 5명 보유' },
      { title: '데이터 통합 프레임워크', description: '이기종 IoT 데이터 실시간 수집·정제·통합 파이프라인', evidence: '특허 2건 보유' },
    ],
    keyMessages: [
      'AI가 도시의 미래를 예측하고, 시민의 삶을 변화시킵니다',
      '클라우드 네이티브 기술로 99.9% 안정성을 보장합니다',
      '시민과 함께 만드는 스마트시티, 참여형 플랫폼을 제공합니다',
    ],
    writingStyle: 'persuasive',
    customNotes: '',
    confirmedAt: new Date(),
  });
  console.log('✅ 전략 수립 생성');

  // 5. 목차 구성
  const sections = [
    { id: 's1', title: '사업 이해 및 추진전략', level: 0, order: 1, children: [] },
    { id: 's1.1', title: '사업 개요 및 목표', level: 1, order: 1, children: [] },
    { id: 's1.2', title: '현황 분석 및 문제점', level: 1, order: 2, children: [] },
    { id: 's1.3', title: '추진 전략 및 방향', level: 1, order: 3, children: [] },
    { id: 's2', title: '시스템 아키텍처', level: 0, order: 2, children: [] },
    { id: 's2.1', title: '전체 시스템 구성도', level: 1, order: 1, children: [] },
    { id: 's2.2', title: '클라우드 네이티브 아키텍처', level: 1, order: 2, children: [] },
    { id: 's2.3', title: '마이크로서비스 설계', level: 1, order: 3, children: [] },
    { id: 's3', title: '데이터 통합 및 분석', level: 0, order: 3, children: [] },
    { id: 's3.1', title: 'IoT 데이터 수집 체계', level: 1, order: 1, children: [] },
    { id: 's3.2', title: 'AI 예측분석 엔진', level: 1, order: 2, children: [] },
    { id: 's4', title: '프로젝트 관리', level: 0, order: 4, children: [] },
    { id: 's4.1', title: '프로젝트 추진 체계', level: 1, order: 1, children: [] },
    { id: 's4.2', title: '품질 보증 계획', level: 1, order: 2, children: [] },
    { id: 's5', title: '투입 인력', level: 0, order: 5, children: [] },
    { id: 's5.1', title: '핵심 인력 구성', level: 1, order: 1, children: [] },
    { id: 's5.2', title: '교육 및 기술이전 계획', level: 1, order: 2, children: [] },
  ];

  await db.insert(schema.proposalOutlines).values({
    id: OUTLINE_ID,
    projectId: PROJECT_ID,
    sections,
  });
  console.log('✅ 목차 구성 생성');

  // 6. 섹션 내용
  const sectionContents = [
    { path: '1', title: '사업 이해 및 추진전략', content: '본 사업은 서울특별시의 스마트시티 통합플랫폼 구축을 통해 도시 데이터의 체계적 관리와 AI 기반 의사결정 지원 체계를 마련하고자 합니다.' },
    { path: '1.1', title: '사업 개요 및 목표', content: '서울특별시는 4차 산업혁명 시대에 발맞추어 도시 인프라의 디지털 전환을 추진하고 있습니다. 본 사업의 목표는 다음과 같습니다.\n\n1. 도시 데이터 통합관리 체계 구축\n2. AI 기반 도시 문제 예측 및 선제적 대응\n3. 시민 참여형 스마트 서비스 제공\n4. 데이터 기반 도시 정책 의사결정 지원' },
    { path: '1.2', title: '현황 분석 및 문제점', content: '현재 서울시의 도시 데이터는 부서별로 산재되어 있어 통합적인 활용이 어려운 상황입니다.' },
    { path: '1.3', title: '추진 전략 및 방향', content: '당사는 AI 예측분석 기술과 클라우드 네이티브 아키텍처를 기반으로 3대 핵심 전략을 제안합니다.' },
    { path: '2', title: '시스템 아키텍처', content: '본 시스템은 Kubernetes 기반 클라우드 네이티브 아키텍처로 설계하여 높은 확장성과 안정성을 보장합니다.' },
    { path: '2.1', title: '전체 시스템 구성도', content: '시스템은 크게 데이터 수집 계층, 데이터 처리 계층, 서비스 계층, 프레젠테이션 계층으로 구성됩니다.' },
    { path: '2.2', title: '클라우드 네이티브 아키텍처', content: 'Kubernetes 클러스터를 기반으로 컨테이너 오케스트레이션을 구현하며, Helm Chart를 통한 표준화된 배포 파이프라인을 제공합니다.' },
    { path: '2.3', title: '마이크로서비스 설계', content: '도메인 주도 설계(DDD)를 적용하여 각 비즈니스 도메인을 독립적인 마이크로서비스로 분리합니다.' },
    { path: '3', title: '데이터 통합 및 분석', content: '이기종 데이터를 실시간으로 수집·정제·분석하는 통합 데이터 파이프라인을 구축합니다.' },
    { path: '3.1', title: 'IoT 데이터 수집 체계', content: '교통, 환경, 안전, 에너지 등 다양한 도메인의 IoT 센서 데이터를 실시간으로 수집합니다.' },
    { path: '3.2', title: 'AI 예측분석 엔진', content: '수집된 도시 데이터를 기반으로 머신러닝 모델이 도시 문제를 사전에 예측하고 최적의 대응 방안을 제시합니다.' },
    { path: '4', title: '프로젝트 관리', content: '체계적인 프로젝트 관리를 통해 품질·일정·비용 목표를 달성합니다.' },
    { path: '4.1', title: '프로젝트 추진 체계', content: '애자일 방법론을 기반으로 2주 단위 스프린트를 운영하며, 발주기관과의 긴밀한 소통 체계를 구축합니다.' },
    { path: '4.2', title: '품질 보증 계획', content: 'ISO 9001 기반 품질관리 체계를 적용하며, 자동화된 테스트와 코드 리뷰를 통해 품질을 보장합니다.' },
    { path: '5', title: '투입 인력', content: '프로젝트 성공을 위해 최적의 전문 인력을 투입합니다.' },
    { path: '5.1', title: '핵심 인력 구성', content: 'PM, AA, AI 전문가 등 핵심 인력을 구성하여 프로젝트를 수행합니다.' },
    { path: '5.2', title: '교육 및 기술이전 계획', content: '시스템 운영 인력에 대한 체계적인 교육과 기술이전을 수행합니다.' },
  ];

  for (const sec of sectionContents) {
    await db.insert(schema.proposalSections).values({
      id: randomUUID(),
      projectId: PROJECT_ID,
      outlineId: OUTLINE_ID,
      sectionPath: sec.path,
      title: sec.title,
      content: sec.content,
      diagrams: [],
      status: 'generated',
      linkedReqIds: [],
      generatedAt: new Date(),
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
