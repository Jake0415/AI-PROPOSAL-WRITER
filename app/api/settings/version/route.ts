import { NextResponse } from 'next/server';
import packageJson from '@/package.json';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      appVersion: packageJson.version ?? '1.0.0',
      nodeVersion: process.version,
      nextVersion: packageJson.dependencies?.next ?? '-',
      platform: process.platform,
    },
  });
}
