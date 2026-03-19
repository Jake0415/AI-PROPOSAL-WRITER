import { rfpRepository } from '@/lib/repositories/rfp.repository';
import { proposalRepository } from '@/lib/repositories/proposal.repository';
import { reviewRepository } from '@/lib/repositories/review.repository';

/**
 * 검증 게이트: 각 단계 전환 시 필수 조건을 확인합니다.
 *
 * Gate 1: 전략 → 목차 전환 (전략과 RFP 정합성)
 * Gate 2: 섹션 완료 → 검증/출력 (필수 요구사항 커버리지)
 * Gate 3: 출력 전 최종 확인 (검증 리포트 등급)
 */

export interface GateCheckResult {
  passed: boolean;
  gate: number;
  checks: GateCheckItem[];
  message: string;
}

interface GateCheckItem {
  name: string;
  passed: boolean;
  detail: string;
}

export async function checkGate(projectId: string, gate: number): Promise<GateCheckResult> {
  switch (gate) {
    case 1:
      return checkGate1(projectId);
    case 2:
      return checkGate2(projectId);
    case 3:
      return checkGate3(projectId);
    default:
      return { passed: false, gate, checks: [], message: `알 수 없는 게이트: ${gate}` };
  }
}

// Gate 1: 전략 완성 확인
async function checkGate1(projectId: string): Promise<GateCheckResult> {
  const checks: GateCheckItem[] = [];

  const analysis = await rfpRepository.getAnalysisByProjectId(projectId);
  checks.push({
    name: 'RFP 분석 완료',
    passed: !!analysis,
    detail: analysis ? '분석 결과가 존재합니다' : 'RFP 분석을 먼저 실행해주세요',
  });

  const direction = await proposalRepository.getDirection(projectId);
  const directionConfirmed = direction && direction.selectedIndex != null && direction.selectedIndex >= 0;
  checks.push({
    name: '방향성 선택 완료',
    passed: !!directionConfirmed,
    detail: directionConfirmed ? `방향성 ${(direction.selectedIndex ?? 0) + 1}번 선택됨` : '방향성을 선택해주세요',
  });

  const strategy = await proposalRepository.getStrategy(projectId);
  checks.push({
    name: '전략 수립 완료',
    passed: !!strategy,
    detail: strategy ? '전략이 수립되었습니다' : '전략을 먼저 생성해주세요',
  });

  const passed = checks.every((c) => c.passed);
  return {
    passed,
    gate: 1,
    checks,
    message: passed ? '목차 생성 단계로 진행 가능합니다' : '이전 단계를 먼저 완료해주세요',
  };
}

// Gate 2: 섹션 완성 확인 (필수 요구사항 커버리지)
async function checkGate2(projectId: string): Promise<GateCheckResult> {
  const checks: GateCheckItem[] = [];

  const sections = await proposalRepository.getSectionsByProject(projectId);
  const hasContent = sections.length > 0 && sections.every((s) => s.content && s.content.length > 0);
  checks.push({
    name: '섹션 내용 생성 완료',
    passed: hasContent,
    detail: hasContent
      ? `${sections.length}개 섹션 모두 생성됨`
      : `${sections.filter((s) => !s.content).length}개 섹션 내용이 비어있습니다`,
  });

  const analysis = await rfpRepository.getAnalysisByProjectId(projectId);
  if (analysis) {
    const requirements = analysis.requirements;
    const mandatoryCount = requirements.filter((r) => r.mandatory).length;
    checks.push({
      name: '필수 요구사항 존재',
      passed: mandatoryCount > 0,
      detail: `필수 요구사항 ${mandatoryCount}개 확인됨`,
    });
  }

  const passed = checks.every((c) => c.passed);
  return {
    passed,
    gate: 2,
    checks,
    message: passed ? '검증 및 출력 단계로 진행 가능합니다' : '섹션 내용을 먼저 완성해주세요',
  };
}

// Gate 3: 출력 전 최종 확인
async function checkGate3(projectId: string): Promise<GateCheckResult> {
  const checks: GateCheckItem[] = [];

  const gate2 = await checkGate2(projectId);
  checks.push({
    name: 'Gate 2 통과',
    passed: gate2.passed,
    detail: gate2.message,
  });

  const report = await reviewRepository.getByProjectId(projectId);
  checks.push({
    name: '검증 리포트 존재',
    passed: !!report,
    detail: report ? `등급 ${report.grade}, 점수 ${report.overallScore}/${report.totalPossible}` : '검증 리포트를 먼저 생성해주세요',
  });

  if (report) {
    const gradeOk = report.grade !== 'F';
    checks.push({
      name: '최소 등급 충족 (D 이상)',
      passed: gradeOk,
      detail: gradeOk ? `등급 ${report.grade} - 출력 가능` : '등급 F - 제안서 개선 후 재검증을 권장합니다',
    });
  }

  const passed = checks.every((c) => c.passed);
  return {
    passed,
    gate: 3,
    checks,
    message: passed ? '산출물 출력이 가능합니다' : '검증 리포트를 확인하고 개선 후 진행해주세요',
  };
}
