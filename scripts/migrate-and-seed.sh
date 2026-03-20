#!/bin/sh
set -e

echo "==========================================="
echo "  DB 초기화: 마이그레이션 + 시드"
echo "==========================================="

echo ""
echo "=== 1/3 마이그레이션 (스키마 diff 적용) ==="
npx drizzle-kit push --force

echo ""
echo "=== 2/3 시드: 사용자 계정 ==="
npx tsx scripts/seed.ts

echo ""
echo "=== 3/3 시드: 데모 데이터 + 프롬프트 ==="
npx tsx scripts/seed-data.ts

echo ""
echo "==========================================="
echo "  DB 초기화 완료!"
echo "==========================================="
