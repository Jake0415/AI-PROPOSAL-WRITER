import { NextRequest, NextResponse } from 'next/server';
import { checkGate } from '@/lib/services/gate.service';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; stageNum: string }> },
) {
  const { id: projectId, stageNum } = await params;
  const gate = parseInt(stageNum, 10);

  if (isNaN(gate) || gate < 1 || gate > 3) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_GATE', message: 'gate는 1-3 사이 숫자입니다' } },
      { status: 400 },
    );
  }

  try {
    const result = await checkGate(projectId, gate);
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : '게이트 확인에 실패했습니다';
    return NextResponse.json(
      { success: false, error: { code: 'GATE_ERROR', message } },
      { status: 500 },
    );
  }
}
