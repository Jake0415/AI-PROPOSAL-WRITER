import { NextRequest } from 'next/server';
import { runAnalysis } from '@/lib/services/analysis.service';
import { createSSEResponse } from '@/lib/utils/sse-stream';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await params;

  return createSSEResponse(
    (onProgress) => runAnalysis(projectId, onProgress),
    'ANALYSIS_ERROR',
    'RFP 분석에 실패했습니다',
  );
}
