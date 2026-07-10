# BE

백엔드 앱이다.

## 기술 스택

- NestJS
- Prisma
- Supabase/PostgreSQL
- DDD
- Clean Architecture
- Modular Monolith

## API 분리 기준

- 사용자 API: `/api/*`
- Admin API: `/admin/api/*`

Admin API는 반드시 Admin guard로 보호한다.

## 현재 구현 모듈

- `auth`: 외부 인증 토큰 교환, Backend App token refresh/logout, 현재 사용자 조회, 기기/session 관리, 로그인 locale/region 메타데이터 동기화
- `user`: 현재 사용자 profile, 기본 timezone/locale, 등록 기기 조회/수정
- `company`: 사용자 소유 회사, 회사 분야/지역, 일반 메모 로그, 개인 비밀 메모 로그, xlsx export
- `contact`: 사용자 소유 담당자, 회사 옵션, 담당자 부서/직급, 일반 메모 로그, 개인 비밀 메모 로그, xlsx export
- `business-card`: 명함 이미지 OCR, 성공/실패 로그, 확인/수정 후 회사/담당자 저장
- `product`: 사용자 소유 제품, 제품 카테고리/상태, 일반 메모 로그, 개인 비밀 메모 로그, xlsx export
- `deal`: 사용자 소유 딜, 딜-제품 연결, 다음 행동 로그, 메모 로그, xlsx export
- `schedule`: 사용자 소유 일정, 월간/주간 조회, 일정-딜 연결, hard delete
- `meeting-note`: 사용자 소유 회의록, 연결 스냅샷, 수동 저장/수정/삭제, AI/STT draft 생성, 저장 후 딜 연결
- `search`: 회사/담당자/제품/딜/일정/회의록 통합검색
- `trash`: 회사/담당자/제품/딜/회의록과 지원 로그의 휴지통 목록/상세/7일 이내 복구
- `data-import`: 회사/담당자/제품/딜 CSV/XLSX 업로드, AI 컬럼 매핑, 사용자 보정/검증, 셀 단위 validation 메시지, 확정 저장, 성공 내역 조회
- `health`: health check

범용 ExportJob Backend는 현재 사용하지 않는다. Export는 회사/담당자/제품/딜 각 도메인의 `GET /api/*/export/xlsx`로 처리한다.
데이터 불러오기 확정 전 임시 job은 현재 in-memory store를 사용하므로 서버 재시작 후 이어받기는 후속 범위다. 현재 HTTP confirm 경로는 연락처 import의 회사 보정값, 딜 import의 회사/담당자/제품 보정값, row override를 모두 전달한다. Import preview validation 메시지는 누락 또는 오류가 있는 셀에만 표시한다.

## 로컬 실행

백엔드는 별도 터미널에서 실행한다.

전제 조건: Node.js 24 LTS가 활성화되어 있어야 한다.

```bash
pnpm install
# .env를 로컬/배포 환경에 맞게 작성
pnpm run db:dev:up
pnpm run prisma:generate
pnpm run prisma:migrate
pnpm run prisma:seed
pnpm run start:dev
```

로컬 URL: `http://localhost:3000`

헬스 체크: `GET /api/health`

환경 파일은 `BE/.env` 하나만 사용한다. `.env.example` 또는 `.env.local`은 현재 정본이 아니다. 변수명 목록은 `../ENVIRONMENT.md`를 기준으로 확인하고, 실제 secret 값은 문서나 로그에 기록하지 않는다.

## API 호출 예제

- 회사 도메인: `restdoc/company-domain.http`
- 담당자 도메인: `restdoc/contact-domain.http`
- 제품 도메인: `restdoc/product-domain.http`
- 전체 API 한 줄 설명: `../API_SAMPLE.md`

## DB

Docker Compose는 PostgreSQL 17을 `localhost:5432`에 띄우고, init SQL로 `sales_b2c_test`도 만든다.

주요 명령:

```bash
pnpm run db:dev:up
pnpm run prisma:generate
pnpm run prisma:migrate
pnpm run prisma:seed
pnpm run db:dev:down
```

CI/배포처럼 이미 migration 파일을 적용해야 하는 환경에서는 `pnpm run prisma:migrate:deploy`를 사용한다.

현재 seed는 local mock Auth 사용자와 session만 만든다.
회사/담당자/제품 개인 비밀 메모 API를 사용하려면 `.env`에 `COMPANY_PRIVATE_MEMO_ENCRYPTION_KEY`, `CONTACT_PRIVATE_MEMO_ENCRYPTION_KEY`, `PRODUCT_PRIVATE_MEMO_ENCRYPTION_KEY` 또는 공통 `ENCRYPTION_MASTER_KEY`를 채워야 한다.

## 검증

```bash
pnpm run typecheck
pnpm run lint
pnpm test
pnpm run build
```

2026-07-10 기준 위 검증은 모두 통과했다. `pnpm test`는 17 suites / 82 tests passed 상태다.

## 외부 Provider

기본 Backend 테스트는 외부 Provider를 실제 호출하지 않는다. 실제 Supabase Auth 또는 OpenAI MeetingNote draft smoke를 하려면 `.env`에 credential을 채운 뒤 별도 provider smoke로 확인한다.

local에서 최소 서버만 띄울 때도 `DATABASE_URL`, `DIRECT_URL`, token secret 값은 실제 안전한 값으로 채우는 것을 권장한다. `TEST_DATABASE_URL`은 테스트 DB를 별도로 검증할 때 사용한다.

Auth runtime 기준:

- Frontend는 Supabase OAuth로 provider login을 수행하고, Backend `POST /api/auth/exchange`는 Supabase access token을 검증해 내부 `User`, `UserOAuthAccount`, `AuthDevice`, `AuthSession`을 생성/갱신한다.
- 신규 provider 계정이면 가입, 기존 provider 계정이면 로그인으로 처리한다. 판단 기준은 이메일이 아니라 `provider + providerUserId`다.
- 앱 refresh token 원문은 httpOnly cookie로만 내려가며 DB에는 hash만 저장한다.
- 같은 auth device의 재로그인은 새 session row를 만들지 않고 refresh token을 rotation한다.
- User Web은 현재 `mobile`, `personal_laptop` slot을 사용하고, 같은 slot의 다른 기기가 로그인하면 기존 active device/session을 교체한다.
- `preferredLocale`과 `timeZone`은 신규 사용자 생성 시 저장된다. 기존 사용자의 `timeZone`은 로그인 때 덮어쓰지 않고 `lastLoginTimeZone`만 갱신한다.
- `signupCountryCode`, `lastLoginCountryCode`는 `cf-ipcountry`, `x-vercel-ip-country`, `cloudfront-viewer-country` 같은 배포 프록시 헤더가 있을 때만 저장된다. 로컬이나 해당 헤더가 없는 환경에서는 `null`일 수 있다.

MeetingNote AI 초안 생성은 `MeetingNoteAiDraftProvider` port와 OpenAI adapter를 사용하며 `OPENAI_API_KEY`, `OPENAI_MEETING_NOTE_DRAFT_MODEL`이 필요하다. MeetingNote STT는 별도 `MeetingNoteSttProvider` port와 OpenAI STT adapter를 사용하며 `OPENAI_MEETING_NOTE_STT_MODEL`로 모델을 지정한다. 명함 OCR은 `BusinessCardOcrProvider` port와 OpenAI adapter를 사용하며 `OPENAI_BUSINESS_CARD_OCR_MODEL`로 모델을 지정할 수 있다. DataImport AI 컬럼 매핑은 `ImportMappingProvider` port와 OpenAI adapter를 사용하며 `OPENAI_IMPORT_MAPPING_MODEL`로 모델을 지정할 수 있다. 추후 STT/OCR/Import mapping provider를 바꿀 때는 각 adapter만 교체한다.

## 정본 규칙

- `../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`
- `../AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
