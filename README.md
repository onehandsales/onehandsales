# Sales B2C Monorepo

이 저장소는 `한손에 영업 / onehand.sales`의 모노레포 루트다.

루트에는 package manager workspace를 두지 않는다. Frontend와 Backend는 각각 독립적으로 설치, 실행, 검증한다.

2026-07-10 기준 초기 판매/검토 국가는 한국, 일본, 대만, 미국, 영국, 싱가포르, 호주, 캐나다다. 공개/인증 화면은 `ko`, `ja`, `zh-tw`, `en-us`, `en-gb`, `en-sg`, `en-au`, `en-ca` URL locale을 지원하고, 로그인 이후 `/app` 관리 화면은 한국어 우선으로 운영한다.

## Structure

```text
AGENT/
  PM_AGENT/
  UXUI_AGENT/
  SOFTWARE_AGENT/
FE/
  user-web/
  admin-web/
BE/
TODO/
TODO_LOG/
IMAGE_SAMPLE/
UX Design/
```

## Quick Start

전제 조건:

- Node.js 24 LTS
- pnpm 8.x
- Docker Desktop 또는 호환 Docker runtime

### 1. Backend

```bash
cd BE
# .env를 로컬/배포 환경에 맞게 작성
pnpm install
pnpm run db:dev:up
pnpm run prisma:generate
pnpm run prisma:migrate
pnpm run prisma:seed
pnpm run start:dev
```

Backend URL: `http://localhost:3000`

Health check:

```bash
curl http://localhost:3000/api/health
```

현재 Backend는 Auth/User, Company, Contact, BusinessCard OCR, Product, Deal, Schedule, MeetingNote, Search, Trash, DataImport 모듈을 구현한다. Company/Contact/Product/Deal은 각 도메인별 xlsx export API를 제공하고, Company/Contact/Product 상세에서는 연결 딜 조회 API를 사용한다. DataImport는 회사/담당자/제품/딜 CSV/XLSX 업로드, AI 컬럼 매핑, 사용자 보정, 셀 단위 validation 메시지, 확정 저장, 성공 내역 조회를 제공한다. Admin API는 현재 `GET /admin/api/me`만 구현되어 있으며 관리자 페이지와 운영 조회 API는 후속 단계에서 만든다.

### 2. User Web

```bash
cd FE/user-web
# .env를 로컬/배포 환경에 맞게 작성
pnpm install
pnpm run dev
```

User Web URL: `http://localhost:5173`

User Web의 공개/인증 canonical URL은 locale prefix를 사용한다. 예: `/ko`, `/ko/login`, `/ko/pricing`, `/en-us/login`. 기존 `/`, `/login`, `/pricing` 등은 선호 locale URL로 redirect하고, 로그인 후 실제 앱 홈은 `/app`이다. User Web은 Supabase OAuth provider login, 공유 `/auth/callback`, Backend `POST /api/auth/exchange`, refresh cookie 기반 access token 재발급 흐름을 사용한다. 개발용 mock login 경로는 제거되어 있으며, 현재 노출 provider는 Google 하나다.

명함 스캔은 `/app/business-cards`에서 실제 API와 연결되어 있다. 사용자는 이미지를 업로드한 뒤 `명함스캔` 진행 표시를 보고, 추출 결과를 확인/수정한 후 회사/담당자로 저장한다.

데이터 불러오기는 `/app/import`에서 실제 API와 연결되어 있다. 사용자는 회사/담당자/제품/딜 양식을 내려받고, CSV/XLSX 파일을 업로드한 뒤 AI 매핑과 row 검증 결과를 확인/수정하고 확정 저장할 수 있다. 필수값 누락 메시지는 누락된 셀에만 표시한다. `/app/export`의 범용 Export 화면과 `/app/notifications`는 Backend 구현 전까지 숨긴다. 회사/담당자/제품/딜/회의록 생성은 목록 맥락의 `/new` 라우트와 패널에서 확대한 `/new/full` 라우트를 함께 가진다.

### 3. Admin Web

```bash
cd FE/admin-web
# .env를 로컬/배포 환경에 맞게 작성
pnpm install
pnpm run dev
```

Admin Web URL: `http://localhost:5174`

Admin Web은 현재 local mock admin/user token으로 `/admin/api/me` 보호 라우트를 검증한다. `admin-query` feature에는 대시보드, 사용자/도메인 목록, 감사 로그, 민감 원문 조회 준비 코드가 있으나 현재 router와 메뉴에서 노출하지 않는다. 관리자 페이지와 Backend Admin query API를 후속 구현하기 전까지 운영 route는 root redirect와 mock/placeholder 경계를 명확히 둔다.

## Verification

각 앱은 독립적으로 검증한다.

Backend:

```bash
cd BE
pnpm run typecheck
pnpm run lint
pnpm test
pnpm run build
```

User Web:

```bash
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
```

Admin Web:

```bash
cd FE/admin-web
pnpm run typecheck
pnpm run lint
pnpm run build
```

Playwright smoke E2E는 기본적으로 Backend와 외부 Provider를 route mock으로 대체한다. User Web E2E는 5175 포트의 Vite dev server를 테스트용으로 사용한다. Admin Web의 `test:e2e` 스크립트와 파일은 남아 있지만 과거 운영 화면 기대값을 포함하므로, 현재 라우터 기준으로 갱신하기 전까지 Admin release gate는 `typecheck`, `lint`, `build`와 관리자 인증 수동 smoke다.

2026-07-10 기준 BE `typecheck`, `lint`, `test`, `build`, FE/user-web `typecheck`, `lint`, `build`, `test:e2e`, FE/admin-web 선택 점검 `typecheck`, `lint`, `build`가 통과했다. 핵심 업무 happy path, URL locale smoke, API/security smoke도 통과했다. 출시 전 남은 품질 범위는 UX/UI 공통 QA, 모바일 브라우저 QA, Chrome/Edge QA, 다중 계정 보안 QA, DB/운영 환경 정합성 확인이다.

## External Providers

기본 local smoke와 unit test는 OpenAI, OCR, Supabase Auth를 실제 호출하지 않는다. 실제 provider 검증이 필요할 때는 각 앱의 `.env`를 채우고 별도 smoke로 확인한다. 현재 Supabase OAuth 실검증 대상은 Google만이다. Apple login은 iOS 앱 출시 또는 Apple platform 정책 대응 시, LINE login은 일본/대만 확장 시 별도 구현/검증한다.

환경 변수 정본은 각 실행 단위의 `.env`와 `AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md`다. `.env.example` 또는 `.env.local`은 현재 정본이 아니다. Backend와 Vite가 로컬 override 파일을 읽을 수 있더라도, 공유 환경 계약은 공통 환경 문서에 기록된 변수명만 기준으로 한다.
외부 provider 에러 처리와 후속 개선 항목은 `AGENT/SOFTWARE_AGENT/COMMON/ERROR.md`에 기록한다.

- Backend Auth/DB: `DATABASE_URL`, `DIRECT_URL`, `APP_JWT_SECRET`, `APP_REFRESH_TOKEN_SECRET`, `SUPABASE_JWKS_URL`, `SUPABASE_JWT_ISSUER`
- Frontend Supabase/Auth: `VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_REDIRECT_URL`
- OpenAI/OCR/AI mapping: `OPENAI_API_KEY`, `OPENAI_MEETING_NOTE_DRAFT_MODEL`, `OPENAI_MEETING_NOTE_STT_MODEL`, `OPENAI_BUSINESS_CARD_OCR_MODEL`, `OPENAI_IMPORT_MAPPING_MODEL`
- Encryption/session: `ENCRYPTION_MASTER_KEY`, `APP_JWT_SECRET`, `APP_REFRESH_TOKEN_SECRET`

로그인 국가 메타데이터는 Google/Supabase 계정 정보가 아니라 배포 프록시가 전달하는 `cf-ipcountry`, `x-vercel-ip-country`, `cloudfront-viewer-country` 헤더에서 저장한다. 로컬 또는 해당 헤더가 없는 배포 환경에서는 `signupCountryCode`, `lastLoginCountryCode`가 `null`이며 화면에는 `기록 없음`으로 표시될 수 있다.

MeetingNote AI 초안 생성과 STT는 Backend에서 별도 provider port로 분리되어 있다. AI 초안 생성은 OpenAI를 기본으로 사용하고, STT는 현재 OpenAI adapter를 쓰되 provider 교체 시 STT adapter만 바꾸는 구조다.

BusinessCard OCR도 별도 provider port 뒤에 있으며, 현재 OpenAI Responses API와 strict JSON schema 응답을 사용한다. prompt와 응답 schema는 `BE/src/modules/business-card/infrastructure/providers/openai-business-card-ocr.provider.ts`에 있다.

DataImport 컬럼 자동 매핑도 별도 provider port 뒤에 있으며, 현재 OpenAI Responses API를 사용한다. `OPENAI_IMPORT_MAPPING_MODEL`이 비어 있으면 `OPENAI_MEETING_NOTE_DRAFT_MODEL`, 그다음 기본 모델 순서로 fallback한다.

## Rules

- 루트에는 `package.json`을 두지 않는다.
- `FE`와 `BE`는 package dependency를 공유하지 않는다.
- `FE/user-web`과 `FE/admin-web`은 별도 Frontend 앱이다.
- `BE`는 `/api/*`와 `/admin/api/*`를 제공하는 단일 NestJS 서버다.
- 모바일 앱은 아직 만들지 않는다. MVP 이후 모바일 개발 때 추가한다.
- `AGENT`는 PM, UX/UI, Software 역할별 정본 문서 공간이다.
- `TODO`, `TODO_LOG`, `IMAGE_SAMPLE`, `UX Design`은 작업/참고 자료이며 `AGENT`를 override하지 않는다.
