# OneHand Sales 배포 가이드

작성 기준일: 2026-07-02

이 문서는 `한손에 영업` 프로젝트를 실제 URL에서 열 수 있도록 배포하는 절차만 다룹니다. 외부 인증 제공자 설정, 인증 플로우 검증, 결제, 관리자 페이지 배포는 이 문서 범위에서 제외합니다.

## 1. 배포 목표

이번 배포 목표는 아래 3개 서비스를 연결하는 것입니다.

```text
Vercel
  - FE/user-web
  - 사용자 프론트엔드

Railway
  - BE
  - NestJS 백엔드 API

Supabase Free
  - Postgres DB
  - 프로젝트 URL / anon key / JWT 검증 정보 제공
```

권장 URL 구조는 다음과 같습니다.

```text
https://app.<도메인>  -> Vercel user-web
https://api.<도메인>  -> Railway backend
```

도메인이 아직 없으면 임시로 Vercel 기본 도메인과 Railway 기본 도메인을 써도 됩니다. 다만 실제 테스트 기간에는 custom domain을 쓰는 편이 환경변수, CORS, 쿠키, API 호출 URL을 정리하기 쉽습니다.

## 2. 비용 조건

이번 가이드는 다음 비용 구조를 전제로 합니다.

```text
Supabase: Free plan
Vercel: Hobby plan
Railway: Trial 또는 Hobby
도메인: 있으면 그대로 사용, 없으면 별도 구매
OpenAI API: AI 기능을 켜면 별도 사용량 과금
```

### Supabase Free

테스트 규모가 작으면 Supabase Free로 충분합니다.

공식 문서 기준 주요 Free quota:

```text
Database Size: 500 MB per project
Egress: 5 GB
Storage Size: 1 GB
Monthly Active Users: 50,000 MAU
Monthly Active Third-Party Users: 50,000 MAU
```

주의:

- Free plan DB 데이터 크기가 500 MB를 넘으면 read-only 상태가 될 수 있습니다.
- 이번처럼 1개월 테스트, 소수 사용자, 제한된 import 테스트라면 보통 충분합니다.
- Supabase DB 백업/상용 안정성이 필요해지면 Pro 전환을 다시 검토합니다.

### Railway

Railway는 백엔드 API만 올립니다. Railway DB는 만들지 않습니다.

```text
Railway에 올릴 것:
  BE NestJS API

Railway에 만들지 않을 것:
  PostgreSQL
  Redis
  프론트엔드
```

테스트 기간에는 Railway usage hard limit을 설정합니다.

### Vercel

Vercel은 `FE/user-web` 정적 프론트엔드만 올립니다.

현재 목표가 비공개 테스트라면 Hobby로 시작할 수 있습니다. 공개 상용 서비스, 결제, 광고, 판매 목적 운영으로 바뀌면 Vercel Pro 조건을 다시 확인합니다.

## 3. 현재 저장소 구조

이 저장소는 루트에 하나의 앱이 있는 구조가 아닙니다.

```text
onehandsales/
  BE/
    package.json
    prisma/
    src/

  FE/
    user-web/
      package.json
      vercel.json
      src/

    admin-web/
      package.json
      vercel.json
      src/
```

이번 배포 대상:

```text
배포함:
  BE
  FE/user-web

배포하지 않음:
  FE/admin-web
```

중요 설정:

```text
Railway Root Directory: BE
Vercel Root Directory: FE/user-web
```

`FE/user-web/vercel.json`은 이미 SPA rewrite를 포함합니다.

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

따라서 Vercel이 Root Directory를 `FE/user-web`으로 잡으면 `/companies`, `/deals/xxx` 같은 직접 진입 경로도 `index.html`로 연결됩니다.

## 4. 배포 전 준비물

필수 계정:

```text
GitHub
Supabase
Railway
Vercel
도메인 관리 계정
```

권장:

- 각 서비스 계정에 2FA를 켭니다.
- GitHub repository에 최신 코드가 push되어 있어야 합니다.
- Railway와 Vercel에서 GitHub repository 접근 권한을 허용합니다.
- Node 버전은 배포 환경에서 24로 맞춥니다.

로컬 검증:

```powershell
cd D:\workspace_repository\onehandsales\BE
pnpm.cmd run typecheck

cd D:\workspace_repository\onehandsales\FE\user-web
pnpm.cmd run typecheck
```

PowerShell에서 `pnpm` 실행이 막히면 `pnpm.cmd`를 사용합니다.

## 5. 도메인 준비

권장 도메인 구조:

```text
app.<도메인>
api.<도메인>
```

예시:

```text
app.onehand-sales.com
api.onehand-sales.com
```

DNS에는 나중에 아래처럼 연결합니다.

```text
app  CNAME  Vercel이 안내하는 값
api  CNAME  Railway가 안내하는 값
```

정확한 CNAME 값은 Vercel과 Railway에서 custom domain을 추가할 때 화면에 표시됩니다.

도메인이 없을 때 임시 URL:

```text
Vercel 기본 URL:
  https://<project>.vercel.app

Railway 기본 URL:
  https://<service>.up.railway.app
```

임시 URL로 먼저 배포 성공 여부를 확인한 뒤 custom domain을 연결해도 됩니다.

## 6. Supabase Free 프로젝트 생성

Supabase는 DB와 프로젝트 기본 값을 제공하는 용도로 사용합니다.

### 6.1 프로젝트 생성

1. Supabase에 접속합니다.
2. New project를 누릅니다.
3. Organization을 선택합니다.
4. Project name을 입력합니다.
   - 예: `onehand-sales-test`
5. Database Password를 생성합니다.
   - 긴 랜덤 문자열을 사용합니다.
   - GitHub에 올리지 않습니다.
6. Region을 선택합니다.
7. Free plan으로 생성합니다.

### 6.2 Supabase에서 확보할 값

Supabase Dashboard에서 아래 값을 확보합니다.

```text
Project URL:
  https://<project-ref>.supabase.co

Anon public key:
  <supabase anon key>

Project ref:
  <project-ref>
```

주의:

- `anon key`는 프론트 환경변수에 들어갑니다.
- `service_role key`는 이번 배포에 필요하지 않습니다.
- `service_role key`는 절대 프론트에 넣지 않습니다.

### 6.3 DB 연결 문자열 확보

이 프로젝트의 Prisma 설정은 다음과 같습니다.

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

따라서 운영 환경에는 아래 2개가 필요합니다.

```env
DATABASE_URL=<Supabase DB connection string>
DIRECT_URL=<Supabase migration/direct connection string>
```

Supabase Dashboard에서:

```text
Project
  -> Connect
  -> Connection string
```

권장:

- `DATABASE_URL`: 런타임 API 서버가 DB에 접근할 때 쓰는 연결 문자열
- `DIRECT_URL`: Prisma migration 실행 시 쓰는 연결 문자열

Supabase와 Prisma 조합은 connection string 종류가 여러 개라 헷갈릴 수 있습니다. Supabase의 Prisma 안내 화면 또는 Connect 화면에서 제공하는 값을 우선 사용합니다.

주의:

- DB 비밀번호에 특수문자가 있으면 URL 인코딩이 필요할 수 있습니다.
- `DIRECT_URL`이 없으면 `prisma migrate deploy`가 실패할 수 있습니다.
- Supabase 프로젝트가 paused 상태면 Railway 백엔드가 DB에 연결하지 못합니다.

## 7. Railway 백엔드 배포

백엔드를 먼저 배포합니다. 프론트는 백엔드 API URL을 환경변수로 사용합니다.

### 7.1 Railway 프로젝트 생성

1. Railway에 접속합니다.
2. New Project를 누릅니다.
3. Deploy from GitHub repo를 선택합니다.
4. 이 repository를 선택합니다.
5. 서비스 이름을 정합니다.
   - 예: `onehand-sales-api`

### 7.2 Root Directory 설정

Railway service settings에서 Root Directory를 설정합니다.

```text
BE
```

중요:

- 루트가 아닙니다.
- `BE/package.json`이 있는 폴더입니다.

### 7.3 Node 24 설정

Railway service Variables에 추가합니다.

```env
NIXPACKS_NODE_VERSION=24
```

이 프로젝트의 `BE/package.json`은 Node `>=24 <25`를 요구합니다.

### 7.4 Build Command

Railway service의 Build Command:

```bash
pnpm prisma:generate && pnpm run build
```

### 7.5 Start Command

Railway service의 Start Command:

```bash
pnpm run start
```

`BE/package.json` 기준으로 실제 실행되는 명령:

```bash
node dist/main.js
```

### 7.6 Railway 백엔드 환경변수

Railway service Variables에 아래 값을 추가합니다.

`<...>` 부분은 실제 값으로 교체합니다.

```env
NODE_ENV=production
PORT=3000
NIXPACKS_NODE_VERSION=24

DATABASE_URL=<Supabase DATABASE_URL>
DIRECT_URL=<Supabase DIRECT_URL>

APP_JWT_ISSUER=onehand-sales-api
APP_JWT_AUDIENCE=onehand-sales
APP_JWT_SECRET=<긴 랜덤 문자열>
APP_ACCESS_TOKEN_TTL_MINUTES=15
APP_SESSION_TTL_DAYS=7
APP_REFRESH_COOKIE_NAME=sales_b2c_refresh
APP_REFRESH_TOKEN_SECRET=<긴 랜덤 문자열>

API_PUBLIC_ORIGIN=https://api.<도메인>
USER_WEB_ORIGIN=https://app.<도메인>
ADMIN_WEB_ORIGIN=https://admin.<도메인>
APP_ALLOWED_ORIGINS=https://app.<도메인>
APP_REFRESH_COOKIE_DOMAIN=

SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_JWKS_URL=https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json
SUPABASE_JWT_ISSUER=https://<project-ref>.supabase.co/auth/v1
SUPABASE_JWT_AUDIENCE=authenticated

ENCRYPTION_MASTER_KEY=<긴 랜덤 문자열>
ENCRYPTION_KEY_VERSION=v1
COMPANY_PRIVATE_MEMO_ENCRYPTION_KEY=
COMPANY_PRIVATE_MEMO_ENCRYPTION_KEY_VERSION=v1
CONTACT_PRIVATE_MEMO_ENCRYPTION_KEY=
CONTACT_PRIVATE_MEMO_ENCRYPTION_KEY_VERSION=v1
PRODUCT_PRIVATE_MEMO_ENCRYPTION_KEY=
PRODUCT_PRIVATE_MEMO_ENCRYPTION_KEY_VERSION=v1

OPENAI_API_KEY=
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MEETING_NOTE_DRAFT_MODEL=
OPENAI_MEETING_NOTE_STT_MODEL=gpt-4o-mini-transcribe
OPENAI_BUSINESS_CARD_OCR_MODEL=
OPENAI_IMPORT_MAPPING_MODEL=
```

도메인을 아직 연결하지 않고 Railway/Vercel 기본 URL로 먼저 배포한다면 임시로 이렇게 넣습니다.

```env
API_PUBLIC_ORIGIN=https://<railway-service>.up.railway.app
USER_WEB_ORIGIN=https://<vercel-project>.vercel.app
APP_ALLOWED_ORIGINS=https://<vercel-project>.vercel.app
```

custom domain을 연결한 뒤에는 반드시 다시 아래처럼 바꿉니다.

```env
API_PUBLIC_ORIGIN=https://api.<도메인>
USER_WEB_ORIGIN=https://app.<도메인>
APP_ALLOWED_ORIGINS=https://app.<도메인>
```

### 7.7 랜덤 secret 생성

아래 명령으로 긴 랜덤 문자열을 만들 수 있습니다.

```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

최소 생성할 값:

```text
APP_JWT_SECRET
APP_REFRESH_TOKEN_SECRET
ENCRYPTION_MASTER_KEY
```

주의:

- `ENCRYPTION_MASTER_KEY`는 private memo 암호화에 사용됩니다.
- 한 번 데이터를 저장한 뒤 이 값을 바꾸면 기존 암호화 데이터를 복호화하지 못할 수 있습니다.
- 테스트 시작 전에 정하고 유지합니다.

### 7.8 OpenAI 환경변수

AI/OCR/STT 기능을 테스트하지 않을 경우 OpenAI 관련 값은 비워둘 수 있습니다.

AI 기능을 테스트하려면 아래를 채웁니다.

```env
OPENAI_API_KEY=<OpenAI API key>
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MEETING_NOTE_DRAFT_MODEL=<모델명>
OPENAI_MEETING_NOTE_STT_MODEL=gpt-4o-mini-transcribe
OPENAI_BUSINESS_CARD_OCR_MODEL=<모델명>
OPENAI_IMPORT_MAPPING_MODEL=<모델명>
```

OpenAI API 비용은 Supabase/Railway/Vercel과 별도입니다.

### 7.9 첫 배포 실행

Railway에서 deploy를 실행합니다.

배포 로그에서 확인할 것:

```text
pnpm install 성공
prisma generate 성공
nest build 성공
node dist/main.js 실행
```

실패하면 Build Logs를 확인합니다.

### 7.10 Prisma migration 실행

첫 배포 후 운영 DB에 migration을 적용합니다.

Railway shell 또는 Railway one-off command에서 실행:

```bash
pnpm prisma:migrate:deploy
```

주의:

- `pnpm prisma:seed`는 운영 배포에서 실행하지 않습니다.
- 현재 seed 파일은 데모 데이터 목적입니다.
- ImportTemplate 데이터는 migration에 포함되어 있으므로 seed 없이도 기본 template이 생성됩니다.

나중에 배포에 익숙해지면 Railway Pre-deploy command에 아래를 넣을 수 있습니다.

```bash
pnpm prisma:migrate:deploy
```

처음 배포에서는 수동으로 한 번 실행하고 결과를 확인하는 편이 안전합니다.

### 7.11 Railway 기본 도메인 확인

Railway service에서 public domain을 생성합니다.

```text
Settings
  -> Networking
  -> Generate Domain
```

생성된 URL 예시:

```text
https://onehand-sales-api.up.railway.app
```

확인:

```text
https://<railway-domain>/api/health
```

정상 응답이 나오면 백엔드가 떠 있는 것입니다.

### 7.12 Railway custom domain 연결

도메인을 사용할 경우 Railway에서 custom domain을 추가합니다.

```text
Settings
  -> Networking
  -> Custom Domain
```

추가:

```text
api.<도메인>
```

Railway가 안내하는 DNS record를 도메인 DNS에 추가합니다.

예시:

```text
Type: CNAME
Name: api
Value: <Railway가 안내하는 값>
```

DNS 적용 후 확인:

```text
https://api.<도메인>/api/health
```

custom domain 연결 후 Railway 환경변수도 custom domain 기준으로 바꿉니다.

```env
API_PUBLIC_ORIGIN=https://api.<도메인>
USER_WEB_ORIGIN=https://app.<도메인>
APP_ALLOWED_ORIGINS=https://app.<도메인>
```

환경변수를 바꾼 뒤에는 Railway 서비스를 redeploy합니다.

## 8. Vercel 프론트 배포

### 8.1 Vercel 프로젝트 생성

1. Vercel에 접속합니다.
2. Add New Project를 누릅니다.
3. GitHub repository를 import합니다.
4. Root Directory를 설정합니다.

Root Directory:

```text
FE/user-web
```

### 8.2 Framework 설정

Framework Preset:

```text
Vite
```

Build Command:

```bash
pnpm run build
```

Output Directory:

```text
dist
```

Install Command는 자동 감지로 둡니다. 필요하면 다음을 사용합니다.

```bash
pnpm install
```

### 8.3 Vercel 환경변수

Vercel Project Settings에서 Environment Variables를 설정합니다.

Production에 아래 값을 추가합니다.

```env
VITE_API_URL=https://api.<도메인>
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<Supabase anon key>
VITE_SUPABASE_REDIRECT_URL=https://app.<도메인>/auth/callback
```

도메인을 아직 연결하지 않고 기본 URL로 먼저 배포한다면 임시로 이렇게 넣습니다.

```env
VITE_API_URL=https://<railway-service>.up.railway.app
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<Supabase anon key>
VITE_SUPABASE_REDIRECT_URL=https://<vercel-project>.vercel.app/auth/callback
```

주의:

- `VITE_`로 시작하는 값은 브라우저 번들에 포함됩니다.
- Supabase `anon key`는 프론트에 들어가도 되는 공개 키입니다.
- Supabase `service_role key`는 절대 넣지 않습니다.
- 환경변수를 바꾸면 Vercel에서 redeploy해야 반영됩니다.

### 8.4 첫 배포 실행

Vercel에서 Deploy를 실행합니다.

Build Logs에서 확인할 것:

```text
pnpm install 성공
tsc -b 성공
vite build 성공
dist 생성
```

배포가 완료되면 Vercel 기본 URL로 접속합니다.

```text
https://<vercel-project>.vercel.app
```

화면이 뜨면 프론트 배포가 성공한 것입니다.

### 8.5 Vercel custom domain 연결

도메인을 사용할 경우 Vercel에서 custom domain을 추가합니다.

```text
Project
  -> Settings
  -> Domains
```

추가:

```text
app.<도메인>
```

Vercel이 안내하는 DNS record를 도메인 DNS에 추가합니다.

예시:

```text
Type: CNAME
Name: app
Value: <Vercel이 안내하는 값>
```

DNS 적용 후 확인:

```text
https://app.<도메인>
```

custom domain 연결 후 Vercel 환경변수도 custom domain 기준으로 바꿉니다.

```env
VITE_API_URL=https://api.<도메인>
VITE_SUPABASE_REDIRECT_URL=https://app.<도메인>/auth/callback
```

환경변수를 바꾼 뒤에는 Vercel에서 redeploy합니다.

## 9. 최종 환경변수 정렬

custom domain을 사용하는 최종 상태는 아래처럼 맞춥니다.

### Railway BE

```env
API_PUBLIC_ORIGIN=https://api.<도메인>
USER_WEB_ORIGIN=https://app.<도메인>
APP_ALLOWED_ORIGINS=https://app.<도메인>
```

### Vercel FE

```env
VITE_API_URL=https://api.<도메인>
VITE_SUPABASE_REDIRECT_URL=https://app.<도메인>/auth/callback
```

### Supabase

Supabase에는 이번 문서에서 DB 프로젝트와 기본 URL/key만 사용합니다. 외부 인증 제공자 설정은 이 문서 범위가 아닙니다.

## 10. 배포 확인

아래 순서로 확인합니다.

### 10.1 백엔드 확인

```text
https://api.<도메인>/api/health
```

또는 기본 Railway URL:

```text
https://<railway-service>.up.railway.app/api/health
```

정상 응답이 나오면 백엔드 프로세스가 실행 중입니다.

### 10.2 프론트 확인

```text
https://app.<도메인>
```

또는 기본 Vercel URL:

```text
https://<vercel-project>.vercel.app
```

확인할 것:

- 화면이 뜨는가
- 새로고침해도 404가 아닌가
- 브라우저 Network tab에서 API 요청 URL이 `VITE_API_URL` 값과 일치하는가
- CORS 오류가 없는가

### 10.3 DB 확인

Supabase Dashboard에서 table이 생성되었는지 확인합니다.

```text
Database
  -> Tables
```

Prisma migration이 정상 적용됐다면 `Company`, `Contact`, `Product`, `Deal`, `Schedule`, `MeetingNote`, `ImportTemplate` 등의 테이블이 보입니다.

## 11. 배포 순서 요약

처음 배포자는 아래 순서대로 진행합니다.

```text
1. 도메인 준비 또는 임시 기본 URL 사용 결정
2. Supabase Free 프로젝트 생성
3. Supabase DATABASE_URL / DIRECT_URL 확보
4. Supabase Project URL / anon key 확보
5. Railway 프로젝트 생성
6. Railway Root Directory를 BE로 설정
7. Railway Node 24, Build Command, Start Command 설정
8. Railway 환경변수 입력
9. Railway 첫 배포
10. Railway에서 pnpm prisma:migrate:deploy 실행
11. Railway /api/health 확인
12. Railway custom domain api.<도메인> 연결
13. Vercel 프로젝트 생성
14. Vercel Root Directory를 FE/user-web으로 설정
15. Vercel 환경변수 입력
16. Vercel 첫 배포
17. Vercel custom domain app.<도메인> 연결
18. custom domain 기준으로 Railway/Vercel 환경변수 재정렬
19. Railway redeploy
20. Vercel redeploy
21. https://api.<도메인>/api/health 확인
22. https://app.<도메인> 확인
```

## 12. 문제 해결

### Railway build 실패

확인:

```text
Root Directory = BE
NIXPACKS_NODE_VERSION=24
Build Command = pnpm prisma:generate && pnpm run build
Start Command = pnpm run start
```

Node version 경고가 있으면 `NIXPACKS_NODE_VERSION=24`가 들어갔는지 확인합니다.

### Railway runtime 실패

확인:

```text
DATABASE_URL
DIRECT_URL
APP_JWT_SECRET
APP_REFRESH_TOKEN_SECRET
ENCRYPTION_MASTER_KEY
SUPABASE_URL
SUPABASE_JWKS_URL
SUPABASE_JWT_ISSUER
```

Railway Logs에서 `Missing required environment variable`이 나오면 해당 env를 추가하고 redeploy합니다.

### Prisma migration 실패

확인:

```text
DIRECT_URL이 비어 있지 않은가
DATABASE_URL이 정확한가
DB 비밀번호 특수문자가 URL 인코딩되었는가
Supabase 프로젝트가 paused 상태가 아닌가
Supabase Free DB size가 500 MB를 넘지 않았는가
```

다시 실행:

```bash
pnpm prisma:migrate:deploy
```

### 프론트 build 실패

확인:

```text
Root Directory = FE/user-web
Framework Preset = Vite
Build Command = pnpm run build
Output Directory = dist
```

Vercel 환경변수 중 `VITE_` prefix가 빠지면 프론트 코드에서 읽을 수 없습니다.

### 프론트 접속 시 하위 경로가 404

확인:

```text
FE/user-web/vercel.json이 배포에 포함되었는가
Vercel Root Directory가 FE/user-web인가
```

Root Directory가 틀리면 `vercel.json`이 적용되지 않을 수 있습니다.

### API 요청이 CORS로 실패

확인:

Railway:

```env
USER_WEB_ORIGIN=https://app.<도메인>
APP_ALLOWED_ORIGINS=https://app.<도메인>
```

Vercel:

```env
VITE_API_URL=https://api.<도메인>
```

환경변수 수정 후에는 Railway와 Vercel 모두 redeploy합니다.

### 환경변수를 바꿨는데 반영되지 않음

Vercel과 Railway 모두 기존 deployment에는 새 환경변수가 자동 반영되지 않을 수 있습니다.

처리:

```text
Railway: Redeploy
Vercel: Redeploy
```

## 13. 배포 후 운영 체크

테스트 기간 동안 확인할 것:

```text
Railway
  [ ] Deployments 상태
  [ ] Logs
  [ ] Metrics
  [ ] Usage
  [ ] Hard limit

Supabase
  [ ] Database size
  [ ] API usage
  [ ] Project paused 여부

Vercel
  [ ] Production deployment 상태
  [ ] Domain 상태
  [ ] Build logs
  [ ] Environment Variables
```

Railway usage hard limit은 꼭 설정합니다. 테스트 배포는 비용 예측이 중요합니다.

## 14. 최종 체크리스트

배포 완료 조건:

```text
[ ] Supabase Free 프로젝트 생성 완료
[ ] DATABASE_URL 확보
[ ] DIRECT_URL 확보
[ ] Supabase Project URL 확보
[ ] Supabase anon key 확보
[ ] Railway BE service 생성
[ ] Railway Root Directory = BE
[ ] Railway Node 24 설정
[ ] Railway Build Command 설정
[ ] Railway Start Command 설정
[ ] Railway 환경변수 입력
[ ] Railway 배포 성공
[ ] pnpm prisma:migrate:deploy 성공
[ ] https://api.<도메인>/api/health 정상
[ ] Vercel user-web project 생성
[ ] Vercel Root Directory = FE/user-web
[ ] Vercel Build Command 설정
[ ] Vercel Output Directory = dist
[ ] Vercel 환경변수 입력
[ ] Vercel 배포 성공
[ ] https://app.<도메인> 접속 정상
[ ] 하위 경로 새로고침 404 없음
[ ] 브라우저 Network tab에서 API URL 정상
[ ] CORS 오류 없음
[ ] Railway usage hard limit 설정
[ ] Supabase Free usage 확인
```

## 15. 공식 참고 문서

가격/제한:

- Supabase Pricing: https://supabase.com/pricing
- Supabase Billing: https://supabase.com/docs/guides/platform/billing-on-supabase
- Supabase Database Size: https://supabase.com/docs/guides/platform/database-size
- Railway Pricing: https://railway.com/pricing
- Railway Pricing Docs: https://docs.railway.com/pricing
- Railway Free Trial: https://docs.railway.com/pricing/free-trial
- Railway Cost Control: https://docs.railway.com/pricing/cost-control
- Vercel Pricing: https://vercel.com/pricing
- Vercel Limits: https://vercel.com/docs/limits
- Vercel Fair Use Guidelines: https://vercel.com/docs/limits/fair-use-guidelines

Supabase/DB:

- Supabase Postgres Connection: https://supabase.com/docs/guides/database/connecting-to-postgres
- Supabase Prisma Guide: https://supabase.com/docs/guides/database/prisma

Railway:

- Railway Monorepo Guide: https://docs.railway.com/guides/deploying-a-monorepo
- Railway Variables: https://docs.railway.com/variables
- Railway Public Networking: https://docs.railway.com/networking/public-networking
- Railway Domains: https://docs.railway.com/networking/domains

Vercel:

- Vercel Vite: https://vercel.com/docs/frameworks/frontend/vite
- Vercel Monorepos: https://vercel.com/docs/monorepos
- Vercel Environment Variables: https://vercel.com/docs/environment-variables
- Vercel Custom Domain: https://vercel.com/docs/domains/working-with-domains/add-a-domain
