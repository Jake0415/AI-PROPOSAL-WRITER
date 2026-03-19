# 운영 매뉴얼

## 백업/복구

### 방법 1: 관리자 UI (JSON)

1. 관리자 로그인 → **데이터 관리** 메뉴
2. **JSON 내보내기** 클릭 → 백업 파일 다운로드
3. 복구: **JSON 가져오기** → 백업 파일 선택

### 방법 2: pg_dump (전체 DB)

```bash
# 백업
docker exec ai-proposal-writer-db-1 \
  pg_dump -U aiprowriter -d aiprowriter \
  > backup_$(date +%Y%m%d).sql

# 복구
docker exec -i ai-proposal-writer-db-1 \
  psql -U aiprowriter -d aiprowriter \
  < backup_20260320.sql
```

### 자동 백업 (cron)

```bash
# 매일 새벽 2시 자동 백업 (최근 7일 보관)
0 2 * * * docker exec ai-proposal-writer-db-1 pg_dump -U aiprowriter -d aiprowriter | gzip > /backup/aiprowriter_$(date +\%Y\%m\%d).sql.gz && find /backup -name "aiprowriter_*.sql.gz" -mtime +7 -delete
```

## 업그레이드 절차

```bash
# 1. 백업 먼저!
docker exec ai-proposal-writer-db-1 pg_dump -U aiprowriter -d aiprowriter > backup_before_upgrade.sql

# 2. 소스 업데이트
git pull

# 3. 재빌드 + 재시작
npm run deploy

# 4. DB 마이그레이션 (스키마 변경 있을 경우)
npm run deploy:migrate

# 5. 동작 확인
npm run deploy:verify
```

## 모니터링

### 컨테이너 상태 확인

```bash
docker ps
docker compose logs -f          # 전체 로그
docker compose logs -f app      # 앱 로그만
docker compose logs -f db       # DB 로그만
```

### 헬스체크 API

```bash
curl http://localhost:3100/api/health
# 응답: {"status":"ok","timestamp":"..."}
```

### 디스크 사용량

```bash
docker system df                     # Docker 전체
docker volume ls                     # 볼륨 목록
docker exec ai-proposal-writer-db-1 \
  psql -U aiprowriter -d aiprowriter \
  -c "SELECT pg_size_pretty(pg_database_size('aiprowriter'));"
```

## 문제해결 FAQ

### Q: 로그인이 안 됩니다
- `.env.local`의 `JWT_SECRET`이 설정되어 있는지 확인
- DB에 사용자가 생성되어 있는지 확인: `npm run dev:seed`

### Q: AI 기능이 동작하지 않습니다
- 설정 → AI 설정에서 API 키가 올바른지 확인
- Claude: `ANTHROPIC_API_KEY`, GPT: `OPENAI_API_KEY`

### Q: Docker 빌드가 실패합니다
- Docker Desktop이 실행 중인지 확인
- 메모리 부족: Docker 설정에서 메모리를 4GB 이상으로 설정

### Q: 502 Bad Gateway
- 앱 컨테이너가 정상 시작되었는지 확인: `docker compose logs app`
- 헬스체크 대기 중일 수 있음 (최대 30초)

### Q: DB 연결 오류
- DB 컨테이너 상태 확인: `docker compose logs db`
- 볼륨 문제 시: `docker compose down -v && npm run deploy`

## 서비스 관리

```bash
# 시작
docker compose up -d

# 중지
docker compose stop

# 재시작
docker compose restart

# 완전 삭제 (데이터 유지)
docker compose down

# 완전 삭제 (데이터 포함)
docker compose down -v
```
