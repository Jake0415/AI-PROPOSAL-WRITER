import { NextRequest, NextResponse } from 'next/server';
import { runAnalysisStep } from '@/lib/services/analysis.service';
import { analysisStepRepository } from '@/lib/repositories/analysis-step.repository';

// POST - 특정 단계 실행/재실행
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; stepNum: string }> },
) {
  const { id: projectId, stepNum } = await params;
  const stepNumber = parseInt(stepNum, 10);

  if (isNaN(stepNumber) || stepNumber < 1 || stepNumber > 7) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_STEP', message: '유효한 단계 번호(1~7)를 입력하세요' } },
      { status: 400 },
    );
  }

  try {
    const result = await runAnalysisStep(projectId, stepNumber);
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : '단계 실행에 실패했습니다';
    return NextResponse.json(
      { success: false, error: { code: 'STEP_ERROR', message } },
      { status: 500 },
    );
  }
}

// PUT - 결과 직접 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; stepNum: string }> },
) {
  const { id: projectId, stepNum } = await params;
  const stepNumber = parseInt(stepNum, 10);

  if (isNaN(stepNumber) || stepNumber < 1 || stepNumber > 7) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_STEP', message: '유효한 단계 번호(1~7)를 입력하세요' } },
      { status: 400 },
    );
  }

  try {
    const body = await request.json();
    const updated = await analysisStepRepository.updateResult(projectId, stepNumber, body.result);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '해당 단계를 찾을 수 없습니다' } },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: '결과 수정에 실패했습니다' } },
      { status: 500 },
    );
  }
}
