# 설치 가이드

## 시스템 요구사항

| 항목 | 최소 사양 | 권장 사양 |
|------|-----------|-----------|
| OS | Linux / Windows / macOS | Ubuntu 22.04+ |
| Docker | 24.0+ | 최신 |
| Docker Compose | v2.0+ | 최신 |
| RAM | 4GB | 8GB 이상 |
| 디스크 | 20GB | 50GB 이상 |
| CPU | 2코어 | 4코어 이상 |

## 설치 절차

### 1. 소스 코드 다운로드

```bash
git clone <저장소 URL> ai-proposal-writer
cd ai-proposal-writer
```

### 2. 환경 변수 설정

```bash
cp .env.example .env.local
```

`.env.local` 파일을 편집하여 필수 값을 설정합니다:

```env
# JWT 시크릿 (32자 이상 랜덤 문자열)
JWT_SECRET=your-secret-key-change-this

# AI API 키 (Claude 또는 GPT)
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# DB 설정 (Docker 내부 자동 연결, 변경 불필요)
DATABASE_URL=postgres://aiprowriter:aiprowriter@db:5432/aiprowriter?search_path=aiprowriter
```

### 3. Docker 빌드 및 시작

```bash
npm run deploy
# 또는
docker compose up -d --build
```

이 명령어는 다음 3개 컨테이너를 시작합니다:
- **db**: PostgreSQL 16 (포트 5432, 내부)
- **app**: Next.js 애플리케이션 (포트 3000, 내부)
- **nginx**: 리버스 프록시 (포트 3100, 외부)

### 4. DB 마이그레이션

```bash
npm run deploy:migrate
```

### 5. 초기 관리자 생성

브라우저에서 `http://서버주소:3100/setup`에 접속하여 Super Admin 계정을 생성합니다.

또는 시드 데이터를 사용합니다:
```bash
npm run dev:seed
```

### 6. 접속 확인

브라우저에서 `http://서버주소:3100`에 접속합니다.

## SSL/TLS 설정 (프로덕션)

프로덕션 환경에서는 Nginx 앞에 SSL 리버스 프록시를 추가합니다:

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/ssl/certs/your-cert.pem;
    ssl_certificate_key /etc/ssl/private/your-key.pem;

    location / {
        proxy_pass http://localhost:3100;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 포트 변경

`docker-compose.yml`에서 nginx 서비스의 포트를 수정합니다:

```yaml
nginx:
  ports:
    - "원하는포트:80"
```
