# Goal 작업 순서

## 1. 목적

이 문서는 `MVP-STARTER_PLAN`을 한 번에 구현하지 않고, `/goal`로 실행 가능한 작은 작업 단위로 나누기 위한 우선순위 문서다.

MVP 전체 범위는 크기 때문에 한 번에 작업하면 누락 가능성이 높다. 따라서 각 작업은 의존성이 명확하고, 완료 기준이 검증 가능하며, 다음 작업으로 자연스럽게 이어지는 단위로 나눈다.

## 2. `/goal` 사용 원칙

### 한 번의 `/goal`에 넣어도 되는 범위

- 하나의 앱 스캐폴딩
- 하나의 Backend 기반 모듈
- 하나의 도메인에 대한 Backend API
- 하나의 도메인에 대한 Frontend 화면
- 하나의 사용자 흐름에 대한 E2E smoke
- 하나의 외부 Provider adapter

### 한 번의 `/goal`에 넣지 않는 범위

- MVP 전체 구현
- User Web, Admin Web, Backend 전체 동시 구현
- 회사/담당자/제품/딜/일정을 한 번에 구현
- AI, OCR, Import, Export, 알림을 한 번에 구현
- DB 스키마 작성과 모든 API와 모든 화면 구현을 한 번에 처리

### 우선순위 실행 원칙

- 작업은 이 문서의 `G00`, `G01`, `G02` 순서대로 실행한다.
- 선행 작업의 완료 기준을 만족한 뒤 후속 작업을 시작한다.
- 작업 순서를 바꿔야 하면 이유와 영향 범위를 이 문서 또는 `README.md`에 기록한다.
- 한 goal이 막히면 다음 goal로 조용히 넘어가지 않고, 막힌 이유와 필요한 결정을 남긴다.

### 권장 `/goal` 문장 형식

```text
/goal MVP-STARTER_PLAN G05 Auth/User Backend 기반을 구현한다.
범위는 Supabase Auth token exchange, App token 발급/검증, User/AuthDevice/AuthSession 동기화, /api/me, /admin/api/me, 기본 테스트까지다.
Company, Contact, Product CRUD 구현은 제외한다.
```

## 3. 우선순위 단계

```text
P0. 구현 기반 준비
P1. 핵심 기준 데이터
P2. 딜 중심 핵심 루프
P3. 일정과 회의록
P4. 입력/출력 자동화
P5. Admin과 감사
P6. 테스트와 릴리즈 준비
```

각 단계의 구현 직전 상세 명세는 `TODO/DONE/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/README.md`에서 확인한다.

규칙:

- `/goal` 실행 전 해당 goal이 포함된 `GOAL-SPECS` 문서를 반드시 확인한다.
- 화면이 포함된 goal은 화면 명세, 상태, validation, 필요한 API를 함께 확인한다.
- API 구현이 포함된 goal은 `COMMON/API-SPEC`의 연결 문서와 해당 `*-ENDPOINT-CONTRACT.md`를 함께 확인한다.
- DB 변경이 포함된 goal은 `BE-TODO/DB-SCHEMA.md`의 연결 모델을 함께 확인한다.

## 4. P0. 구현 기반 준비

### G00. 구현 전 운영 결정 정리

목적:

- 실제 스캐폴딩 전에 선택이 필요한 기술 결정과 API/DB 정책 결정을 확정한다.
- G01 이후 구현자가 package manager, 인증/session, 삭제 정책, 민감정보 처리, transaction 기준을 다시 추론하지 않게 한다.

포함 범위:

- 패키지 매니저 결정
- package manager 의미 정리: Node.js 의존성 설치, lockfile 관리, `dev/build/test` 같은 script 실행을 담당하는 도구다. 후보는 `npm`, `yarn`, `pnpm`이며, `pnpm`은 디스크 효율과 빠른 설치, 엄격한 의존성 관리가 장점인 package manager다.
- package manager 확정값: `pnpm`
- Node 버전 결정
- Node 버전 확정값: `Node.js 24 LTS`
- 로컬 DB 방식 결정
- 로컬 DB 방식 확정값: `Docker PostgreSQL`
- PostgreSQL Docker image version 확정값: `postgres:17-alpine`
- local DB 세부값 확정값: `sales_b2c_dev`, `sales_b2c_test`, user `sales_b2c`, password `sales_b2c_password`, port `5432`
- Supabase 사용 방식 결정
- Supabase 사용 방식 확정값: MVP 1차에서는 Supabase Cloud의 `Auth`, `PostgreSQL`, 파일 저장소 adapter를 사용한다. managed business DB는 Supabase Cloud PostgreSQL이고 NestJS Backend가 Prisma로 직접 접속해 transaction을 application layer에서 관리한다.
- local/integration/E2E test DB 확정값: 재현성과 안전한 reset을 위해 Docker PostgreSQL을 사용할 수 있다.
- Supabase Cloud 개발 환경 확정값: 개발용 `Remote Supabase project`를 사용한다.
- 인증 구현 1차 전략 결정
- 인증 구현 1차 전략 확정값: `Supabase Auth 외부 Provider + Backend token exchange + Backend 발급 App Bearer Token + local User/AuthDevice/AuthSession`
- FE token 전달/보관 방식 결정
- FE token 전달/보관 방식 확정값: FE는 Supabase access token을 token exchange API에만 전달하고, business API에는 Backend가 발급한 App access token을 `Authorization: Bearer` header로 전달한다. App access token은 memory에만 저장하고, refresh token은 httpOnly cookie와 `AuthSession.refreshTokenHash`로 관리한다.
- FE/BE 배포 도메인 전략 확정값: local/preview는 분리 domain을 허용하고, production은 같은 parent domain 아래 `app`, `admin`, `api` subdomain으로 고정한다.
- 삭제된 리소스 조회/수정 응답 정책 확정값: 기존 상세 URL 조회는 `410 DeletedResource`, 수정/상태 변경/재삭제 같은 변경 요청은 `409 DeletedResource`
- soft delete, restore, hard delete, 휴지통 완전 삭제 정책 확정값: 모든 영속 삭제 대상 리소스는 soft delete하고, 30일 휴지통 보관 후 시스템이 자동 완전 삭제하며, MVP 1차에서 사용자 즉시 완전 삭제는 제공하지 않는다.
- 도메인별 Memo 기록과 민감정보 저장 위치 확정값: `Company`, `Contact`, `Product`, `Deal`은 Log와 Memo 기록을 각각 가질 수 있다. Log는 객관적 사실/변경/만남/소식 기록이고, Memo는 사용자의 주관적 생각/판단 기록이다. Memo는 각 엔티티의 단일 `memo` 필드가 아니라 `PersonalMemo` 기록 테이블에 암호화 저장한다.
- 도메인별 Log 구현 단위 확정값: 회사는 `CompanyLog`, 담당자는 `ContactLog`, 제품은 `ProductLog`, 딜은 `DealActivity`를 사용한다. 각 도메인별 사용자 개인 Memo Log는 `PersonalMemo`로 별도 저장하고 상세 화면에서 Log와 Memo 섹션을 분리한다.
- 일정 기본 조회 기간과 view mode 확정값: `/api/schedules`의 `from`, `to`가 없으면 사용자 timezone 기준 이번 달 1일~말일 범위를 조회한다. User Web `/schedules`는 Google Calendar처럼 월간 캘린더를 기본으로 보여주고 월간/주간 view mode 전환을 제공한다. 주간 보고서/Export는 `/api/schedules/week`와 `/api/schedules/week/export`로 분리한다.
- 민감정보 암호화 adapter 적용 범위 확정값: `PersonalMemo.content`, `MeetingNote.rawText`, `BrowserPushSubscription.endpoint/p256dh/auth`부터 application-level encryption 적용
- Admin masking, 원문 조회, AuditLog transaction 정책 확정값: Admin 목록/기본 상세는 민감 원문을 마스킹하거나 존재 여부만 반환하고, 원문 조회는 사유 필수 전용 API에서 대상 조회와 `AuditLog` 생성을 같은 transaction으로 처리한다.
- Import 처리 방식 확정값: preview/validation 후 확정 실행, 확정 실행 중 row 오류 발생 시 전체 rollback
- Google Calendar, OCR, OpenAI 실연동 범위 확정값: MVP 기능은 처음부터 실제 provider를 호출하고, mock/stub은 자동 테스트와 장애 대체 검증 용도로만 사용한다.
- Notification 실제 발송 범위 확정값: MVP 1차에서 email과 browser push를 모두 실제 발송한다. email은 SMTP adapter, browser push는 Web Push VAPID adapter를 기본 실제 구현으로 두고, mock/stub은 자동 테스트와 장애 재현용으로만 사용한다.
- 통합검색 기본 정책 확정값: 회사/담당자/제품/딜/일정/회의록을 검색한다. 삭제 데이터는 제외하고, 검색어 2자 이상, type별 최대 5개, 민감 원문 비노출을 기본으로 한다.
- `.env.example` 기준 변수 목록 정리

제외 범위:

- 실제 앱 생성
- 실제 DB migration
- Supabase Auth provider 실연동
- 도메인 API 구현
- 화면 구현

완료 기준:

- 결정 내용이 `AGENT/PM_AGENT/DECISIONS`에 기록된다.
- 결정 내용이 `TODO/DONE/MVP-STARTER_PLAN/COMMON/G00-DECISIONS.md`에 기록된다.
- `COMMON/API-SPEC`, `COMMON/GOAL-SPECS`, `BE-TODO/DB-SCHEMA.md`의 미확정 표현이 G00 결정에 맞게 확정 문장으로 정리된다.
- 이후 G01-G36 작업자가 선택지를 다시 묻지 않아도 된다.

참조 문서:

- `TODO/DONE/MVP-STARTER_PLAN/COMMON/G00-DECISIONS.md`
- `TODO/DONE/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/README.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P0-G00-G04-FOUNDATION.md`
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/DEPLOYMENT.md`

### G01. Backend 프로젝트 스캐폴딩

목적:

- `BE`에 NestJS 서버의 최소 실행 기반을 만든다.

포함 범위:

- NestJS 프로젝트 생성
- TypeScript strict 설정
- ConfigModule 설정
- health check endpoint
- global validation pipe
- global exception filter 뼈대
- structured logger wrapper 뼈대
- Prisma 설치 준비
- `.env.example` 작성

제외 범위:

- 도메인 API 구현
- Prisma schema 전체 작성
- Supabase Auth 연동 구현

완료 기준:

- `BE` 서버가 local에서 실행된다.
- health check가 응답한다.
- lint 또는 typecheck가 통과한다.

### G02. User Web 프로젝트 스캐폴딩

목적:

- `FE/user-web`에 사용자 앱의 최소 실행 기반을 만든다.

포함 범위:

- Vite React TypeScript 앱 생성
- Tailwind CSS 설정
- shadcn/ui 초기 설정
- React Router 설정
- TanStack Query provider
- 기본 app shell
- `/login`, `/` placeholder route
- API client 뼈대

제외 범위:

- 실제 도메인 화면
- 실제 로그인 연동
- Admin Web

완료 기준:

- User Web dev server가 실행된다.
- 로그인 placeholder와 app shell이 렌더링된다.
- typecheck 또는 build가 통과한다.

### G03. Admin Web 프로젝트 스캐폴딩

목적:

- `FE/admin-web`에 Admin 운영 콘솔의 최소 실행 기반을 만든다.

포함 범위:

- Vite React TypeScript 앱 생성
- Tailwind CSS 설정
- shadcn/ui 초기 설정
- React Router 설정
- TanStack Query provider
- TanStack Table 설치
- Admin app shell
- `/login`, `/` placeholder route
- `adminApiClient` 뼈대

제외 범위:

- 실제 Admin 데이터 테이블
- 민감정보 원문 조회 flow
- User Web과의 코드 공유

완료 기준:

- Admin Web dev server가 실행된다.
- Admin shell이 데스크톱 레이아웃으로 렌더링된다.
- typecheck 또는 build가 통과한다.

### G04. Prisma schema 1차 반영과 DB 연결

목적:

- MVP 핵심 도메인을 담을 수 있는 DB schema와 Prisma client 기반을 만든다.

포함 범위:

- `BE/prisma/schema.prisma` 작성
- User, Company, CompanyLog, Contact, ContactLog, Product, ProductLog, Deal, DealActivity, PersonalMemo 핵심 모델
- Schedule, MeetingNote, AuditLog 기본 모델
- ImportJob, ExportJob, Notification 기본 모델. BusinessCard OCR은 현재 `BusinessCardScanLog`를 사용하고 별도 `AiJob`을 두지 않는다.
- Prisma client 생성
- 초기 migration 생성
- system DealActivityType seed

제외 범위:

- 모든 API 구현
- 모든 인덱스 최적화
- 결제 테이블

완료 기준:

- Prisma schema validate가 통과한다.
- migration 또는 db push가 local 기준으로 성공한다.
- seed로 기본 활동 타입을 넣을 수 있다.

## 5. P1. 핵심 기준 데이터

### G05. Auth/User Backend 기반

목적:

- 사용자 식별과 사용자별 데이터 분리의 Backend 기반을 만든다.

포함 범위:

- User domain/application 기본 구조
- ExternalAuthVerifier port/adapter
- AppTokenIssuer
- AuthSession repository
- Token exchange use case
- Refresh token use case
- AuthGuard
- CurrentUser decorator
- `/api/auth/providers`
- `/api/auth/exchange`
- `/api/auth/refresh`
- `/api/auth/logout`
- `/api/me`
- `/admin/api/me`
- AdminGuard
- 외부 Auth user와 local User/UserOAuthAccount/UserSetting/AuthSession 동기화

제외 범위:

- Supabase Auth provider 운영 project 설정 고도화
- refresh token rotation 고도화
- 권한 관리 UI

완료 기준:

- Backend가 Supabase token을 App token으로 교환할 수 있다.
- App Bearer Token으로 User/Admin API 인증이 동작한다.
- 외부 Auth user가 local User와 동기화되고 AuthSession이 생성된다.
- User API는 current user context를 받을 수 있다.
- Admin API는 AdminGuard를 통과해야 접근된다.

### G06. Company Backend vertical slice

목적:

- 회사 관리의 Backend CRUD를 완성한다.

포함 범위:

- Company domain entity
- Company repository interface
- PrismaCompanyRepository
- Company mapper
- Company application service
- User API CRUD
- soft delete와 restore
- CompanyLog 기본 CRUD
- userId ownership 필터

제외 범위:

- Frontend 회사 화면
- Contact 연결 화면
- Admin 전체 회사 조회

완료 기준:

- `/api/companies` CRUD가 동작한다.
- 다른 사용자의 회사는 조회/수정/삭제할 수 없다.
- 삭제는 `deletedAt` 처리된다.

### G07. Company User Web 화면

목적:

- 사용자가 회사 목록, 빠른 등록, 상세를 사용할 수 있게 한다.

포함 범위:

- 회사 목록 화면
- 회사 빠른 등록 modal
- 회사 상세 placeholder 또는 기본 상세
- 회사 수정 form
- 회사 로그 표시와 생성
- TanStack Query hook

제외 범위:

- Contact, Deal 연결 전체 UI
- Import/OCR 연동

완료 기준:

- User Web에서 회사 생성, 목록, 상세, 수정, 삭제가 가능하다.
- API error와 loading 상태가 표현된다.

### G08. Contact Backend vertical slice

목적:

- 담당자 관리의 Backend CRUD를 완성한다.

포함 범위:

- Contact domain/application/infrastructure/presentation
- 회사 연결 검증
- User API CRUD
- soft delete와 restore
- ContactLog 기본 CRUD
- 담당자 Memo 요약과 `PersonalMemo(targetType=CONTACT)` 연결
- userId ownership 필터
- 전화번호/이메일 필드 저장

제외 범위:

- 명함 OCR
- Contact Frontend 화면
- Admin masking

완료 기준:

- `/api/contacts` CRUD가 동작한다.
- 연결 회사가 현재 사용자 소유인지 검증한다.

### G09. Contact User Web 화면

목적:

- 사용자가 담당자를 등록하고 회사와 연결할 수 있게 한다.

포함 범위:

- 담당자 목록
- 담당자 빠른 등록 modal
- 회사 검색 combobox
- 담당자 상세 기본 화면
- 담당자 Log/Memo 섹션
- 담당자 수정 form

제외 범위:

- 명함 OCR 화면
- Memo 원문 조회와 Admin 감사 flow 고도화

완료 기준:

- User Web에서 담당자 생성, 목록, 상세, 수정, 삭제가 가능하다.
- 회사 연결 UI가 동작한다.

### G10. Product Backend vertical slice

목적:

- 제품 관리와 제품 연결의 Backend 기반을 만든다.

포함 범위:

- Product CRUD
- ProductLog 기본 CRUD
- 제품 Memo 요약과 `PersonalMemo(targetType=PRODUCT)` 연결
- ProductConnection 생성/삭제
- 제품 연결 대상 타입 검증
- userId ownership 필터
- soft delete와 restore

제외 범위:

- Product Frontend 화면
- 딜 생성 시 제품 inline creation

완료 기준:

- `/api/products` CRUD가 동작한다.
- 제품을 회사/담당자/딜과 연결할 수 있는 Backend 기반이 있다.

### G11. Product User Web 화면

목적:

- 사용자가 제품을 등록하고 기본 정보를 관리할 수 있게 한다.

포함 범위:

- 제품 목록
- 제품 빠른 등록 modal
- 제품 상세 기본 화면
- 제품 Log/Memo 섹션
- 제품 수정 form
- 단가 KRW 표시
- 제품 연결 타입 표시 기본 UI

제외 범위:

- 복잡한 연결 관리 UI
- 딜 quick create와의 완전 통합

완료 기준:

- User Web에서 제품 생성, 목록, 상세, 수정, 삭제가 가능하다.

## 6. P2. 딜 중심 핵심 루프

### G12. Deal Backend vertical slice

목적:

- 딜 생성, 수정, 단계 변경, 활동 로그의 Backend 핵심 흐름을 만든다.

포함 범위:

- Deal domain/application/infrastructure/presentation
- DealActivity
- DealActivityType 조회
- 딜 CRUD
- 단계 변경 API
- 단계 변경 시 자동 활동 로그
- 다음 행동 필드 저장
- 제품 연결
- userId ownership 필터

제외 범위:

- Schedule/MeetingNote 연결
- Admin 전체 딜 조회
- Export

완료 기준:

- 딜 금액 없이 생성할 수 없다.
- 단계 변경 시 자동 활동 로그가 생성된다.
- 현재 사용자 소유 회사/담당자/제품만 연결할 수 있다.

### G13. Deal User Web 목록과 빠른 생성

목적:

- 사용자가 딜을 빠르게 만들고 목록에서 비교할 수 있게 한다.

포함 범위:

- 딜 목록
- 단계 탭
- 딜 빠른 등록 modal
- 회사/담당자/제품 검색 combobox
- 금액, 단계, 가능성 입력
- 다음 행동 입력
- 딜 생성 후 목록 갱신

제외 범위:

- inline entity creation
- 우측 상세 패널 완성
- 일정/회의록 연결

완료 기준:

- User Web에서 딜을 생성하고 목록에서 확인할 수 있다.
- 딜 리스트 컬럼 순서가 정본 UX 방향을 따른다.

### G14. Deal inline entity creation

목적:

- 딜 빠른 생성 중 회사/담당자/제품이 없을 때 최소 정보로 즉시 생성할 수 있게 한다.

포함 범위:

- 회사 inline creation
- 담당자 inline creation
- 제품 inline creation
- 생성 후 딜 form에 자동 선택
- 중복 후보 우선 표시

제외 범위:

- 전체 상세 등록 form
- Import 기반 생성

완료 기준:

- 딜 modal을 벗어나지 않고 없는 회사/담당자/제품을 최소 생성할 수 있다.
- 자유 텍스트만으로 딜에 저장하지 않는다.

### G15. Deal 상세 패널과 상세 페이지

목적:

- 딜의 핵심 요약, 활동 로그, Memo 기록, 관련 정보를 빠르게 확인할 수 있게 한다.

포함 범위:

- 데스크톱 우측 상세 패널
- 모바일 상세 페이지 기본 대응
- 기본 정보 summary
- 활동 로그 timeline
- 활동 로그 추가
- 단계 변경 UI
- 다음 행동 완료/미루기 기본 동작

제외 범위:

- 일정/회의록 완전 연결
- Admin Memo 원문 조회 flow

완료 기준:

- 딜이름, 회사/담당자, 단계, 금액, 가능성, 다음 행동, 마감일이 항상 먼저 보인다.
- 활동 로그를 상세 안에서 추가할 수 있다.

### G16. Home pipeline 통합

목적:

- 로그인 후 첫 화면을 딜 파이프라인 중심으로 완성한다.

포함 범위:

- `/` 홈 화면
- 단계 탭
- 딜 리스트
- 선택 딜 상세 패널 연결
- 오늘 일정 placeholder
- 후속 연락/다음 행동 summary
- 최근 회의록 placeholder

제외 범위:

- 실제 Schedule/MeetingNote 완전 데이터
- 고급 대시보드 chart

완료 기준:

- 로그인 후 첫 화면에서 딜 파이프라인이 가장 큰 우선순위로 보인다.
- 다음 행동과 마감 상태가 목록에서 드러난다.

## 7. P3. 일정과 회의록

### G17. Schedule Backend vertical slice

목적:

- 일정 CRUD와 딜/회사/담당자 연결 Backend를 만든다.

포함 범위:

- Schedule CRUD
- 딜/회사/담당자 연결 검증
- 월간 기본 일정 조회
- 주간 보기 기간 조회
- ScheduleReminder 기본 구조
- source INTERNAL/GOOGLE 구분 필드

제외 범위:

- Google Calendar 실연동
- PDF/Excel 생성
- Frontend 일정 화면

완료 기준:

- 일정은 딜 없이 저장 가능하다.
- 딜에서 만든 일정은 회사/담당자 기본 상속이 가능하다.

### G18. Schedule User Web 화면

목적:

- 사용자가 일정을 만들고 월간 일정 맥락을 확인할 수 있게 한다.
- 같은 일정 화면에서 월간/주간 view mode를 전환할 수 있게 한다.
- 주간 보고서는 별도 화면에서 확인할 수 있게 한다.

포함 범위:

- 일정 목록/월간 캘린더
- 월간/주간 view mode 전환
- 일정 생성/수정 form
- 딜/회사/담당자 연결 UI
- 알림 시간 입력 기본 UI
- 주간 보고서 화면 진입

제외 범위:

- Google Calendar import
- PDF/Excel 다운로드

완료 기준:

- User Web에서 일정 생성, 수정, 삭제, 월간 기본 조회가 가능하다.
- User Web에서 월간/주간 보기 전환이 가능하다.
- 주간 보고서 화면으로 이동할 수 있다.

### G19. MeetingNote Backend vertical slice

목적:

- 회의록 저장과 딜 연결 Backend를 만든다.

포함 범위:

- MeetingNote CRUD
- AI 회의록 생성 port
- 실제 OpenAI meeting-note adapter
- 9개 고정 항목 validation
- 딜 연결 API
- 딜 연결 시 DealActivity 자동 생성

제외 범위:

- Frontend 회의록 화면

완료 기준:

- 회의록은 딜 없이 저장 가능하다.
- 딜 연결 시 활동 로그가 자동 생성된다.

### G20. MeetingNote User Web 화면

목적:

- 사용자가 회의 내용을 입력하고 AI 결과를 수정해 저장할 수 있게 한다.

포함 범위:

- 회의록 목록
- 회의록 생성 화면
- raw input text area
- AI 생성 요청
- 9개 항목 수정 form
- 딜 없이 저장
- 딜 연결 UI

제외 범위:

- STT
- 사용자 템플릿 커스터마이즈

완료 기준:

- AI 실제 생성 결과를 수정해 저장할 수 있다.
- 저장 후 딜 연결이 가능하다.

## 8. P4. 입력/출력 자동화

### G21. BusinessCard OCR Backend

목적:

- 명함 OCR flow의 Backend 기반을 만든다.

포함 범위:

- BusinessCardScanLog model 사용
- 이미지 업로드 검증
- OCR port
- 실제 OpenAI/OCR adapter
- 성공/실패 로그 저장
- OCR 결과 확정 저장 API

제외 범위:

- 모바일 카메라 촬영
- Frontend 화면

완료 기준:

- OCR 결과는 자동 저장되지 않는다.
- 사용자가 확정해야 회사/담당자가 생성된다.

### G22. BusinessCard OCR User Web 화면

목적:

- 사용자가 명함 이미지를 업로드하고 OCR 결과를 확인/수정 후 저장할 수 있게 한다.

포함 범위:

- 이미지 업로드 UI
- `명함스캔 중` 진행 표시
- OCR 결과 수정 form
- 상태 다중 필터와 `상태 초기화`
- 회사/담당자 재사용 또는 생성 확정 저장
- 회사 없는 담당자 저장 금지

제외 범위:

- 카메라 촬영
- OCR 정확도 고도화

완료 기준:

- OCR 실제 추출 결과를 확인하고 담당자로 저장할 수 있다.

### G23. Import Backend

목적:

- Excel/CSV Import와 AI 컬럼 매핑 Backend 기반을 만든다.

포함 범위:

- ImportJob
- ImportJobRow
- 파일 업로드 검증
- CSV/Excel parser adapter
- Excel/CSV preview row 생성
- AI mapping port
- 실제 OpenAI import-mapping adapter
- 사용자 mapping 확정
- row별 validation error 저장
- 확정 실행 all-or-nothing transaction
- Company/Contact/Product/Deal 중 1차 대상 import

제외 범위:

- 모든 edge case 처리
- 일정/회의록 import
- Frontend 화면

완료 기준:

- 업로드, 매핑 제안, 매핑 수정, 확정 실행 흐름이 API로 가능하다.
- 확정 전 preview에서 오류 row를 확인할 수 있다.
- 확정 실행 중 한 row라도 실패하면 도메인 데이터가 전체 rollback된다.

### G24. Import User Web 화면

목적:

- 사용자가 Excel/CSV 파일을 올리고 매핑을 확인한 뒤 Import할 수 있게 한다.

포함 범위:

- 대상 선택
- 파일 업로드
- preview table
- AI 매핑 결과 표시
- 매핑 수정 UI
- Import 확정
- row별 결과 표시

제외 범위:

- 대량 데이터 고성능 처리
- 일정/회의록 import

완료 기준:

- 사용자가 매핑을 확인한 뒤 Import를 실행할 수 있다.
- 오류 row가 있으면 행 번호와 사유를 확인하고 확정 실행을 진행하지 않는다.

### G25. Export Backend

목적:

- PDF/Excel Export job Backend 기반을 만든다.

포함 범위:

- ExportJob
- 민감 데이터 포함 여부
- 민감 데이터 포함 경고 확인 여부
- Excel export adapter
- PDF export adapter placeholder
- 파일 다운로드 URL 또는 stream

제외 범위:

- 디자인된 PDF 템플릿 완성
- 모든 도메인 export 고도화
- Frontend 화면

완료 기준:

- 민감 데이터는 기본 제외된다.
- 사용자가 명시적으로 포함한 경우만 포함된다.

### G26. Export User Web 화면

목적:

- 사용자가 export 대상을 고르고 파일을 받을 수 있게 한다.

포함 범위:

- export 대상 선택
- 형식 선택
- 민감 데이터 포함 여부
- 경고 dialog
- export job 상태 조회
- 다운로드 버튼

제외 범위:

- 복잡한 템플릿 편집

완료 기준:

- 민감 데이터 포함 시 경고 확인 전에는 export가 실행되지 않는다.

### G27. Notification 기본 흐름

목적:

- 일정, 딜 마감, 다음 행동 알림의 기본 구조를 만든다.

포함 범위:

- Notification Backend 기본 CRUD 또는 조회
- 일정 알림 생성
- 다음 행동 알림 생성
- 이메일 실제 발송
- browser push 실제 발송
- browser push subscription 등록/해제
- User Web service worker와 push permission 처리
- User Web 알림 목록/읽음 처리
- 자동 테스트용 email/browser push stub adapter

제외 범위:

- 특정 유료 email SaaS vendor 고정
- native mobile push

완료 기준:

- 알림 데이터가 생성되고 User Web에서 확인할 수 있다.
- email/browser push가 실제 adapter를 통해 발송된다.

### G28. Trash 기본 흐름

목적:

- 삭제된 모든 soft delete 대상 데이터를 휴지통에서 확인하고 복구할 수 있게 한다.

포함 범위:

- `/api/trash` 조회
- Company/Contact/Product/Deal/Schedule/MeetingNote 복구
- 완전 삭제 예정일 표시 기준
- 30일 경과 리소스 자동 완전 삭제 job 기본 구조
- User Web 휴지통 화면

제외 범위:

- 사용자 즉시 완전 삭제 API와 UI
- 7일 전 실제 알림 발송

완료 기준:

- 삭제 데이터가 휴지통에 표시되고 `permanentDeleteAt` 이전에는 복구된다.
- 30일이 지난 삭제 데이터는 시스템 자동 작업으로 완전 삭제될 수 있다.

### G29. 통합검색 기본 흐름

목적:

- 사용자가 하나의 키워드로 주요 엔티티를 찾을 수 있게 한다.

포함 범위:

- Backend 통합검색 API
- Company/Contact/Product/Deal/Schedule/MeetingNote 검색
- entity type별 grouping
- 삭제 데이터 제외
- 검색어 2자 이상
- type별 최대 5개 기본 limit
- 민감 원문 비노출
- User Web 상단 통합검색 UI
- 결과 선택 시 상세 이동

제외 범위:

- 전문 검색 엔진
- 검색 랭킹 고도화

완료 기준:

- 진행 중 딜과 최근 항목이 우선 표시된다.

## 9. P5. Admin과 감사

### G30. Admin Backend 조회 API

목적:

- Admin Web이 사용자와 전체 도메인 데이터를 조회할 수 있게 한다.

포함 범위:

- `/admin/api/dashboard`
- `/admin/api/users`
- `/admin/api/users/:userId`
- 전체 company/contact/product/deal 목록
- 특정 사용자별 company/contact/product/deal 목록
- 서버 페이지네이션
- 기본 masking response

제외 범위:

- raw sensitive view
- Admin Frontend 화면

완료 기준:

- AdminGuard 통과 사용자만 Admin API를 호출할 수 있다.
- 민감 데이터는 기본 마스킹된다.

### G31. Admin Web 기본 운영 화면

목적:

- Admin이 사용자와 전체 데이터를 목록과 상세 패널 중심으로 조회할 수 있게 한다.

포함 범위:

- Admin dashboard
- 사용자 목록/상세
- 전체 회사/담당자/제품/딜 table
- 전체 회사/담당자/제품/딜 detail API
- 사용자별 데이터 table
- 서버 페이지네이션 UI
- 기본 필터

제외 범위:

- raw sensitive view dialog
- 결제 관리

완료 기준:

- Admin Web에서 주요 데이터를 마스킹 상태로 조회할 수 있다.

### G32. 민감정보 원문 조회와 감사 로그

목적:

- Admin 원문 조회를 사유 입력과 감사 로그로 통제한다.

포함 범위:

- Backend raw sensitive view API
- encrypted sensitive field decrypt flow
- reason required validation
- AuditLog transaction
- Admin Web reason dialog
- 원문 표시 상태
- 감사 로그 목록

제외 범위:

- 모든 위험 액션
- 결제 상태 변경

완료 기준:

- 사유 없이 원문 조회가 실패한다.
- 원문 조회 시 감사 로그가 생성된다.
- client log에 reason text와 PII가 남지 않는다.

## 10. P6. 테스트와 릴리즈 준비

### G33. Backend 위험 흐름 테스트

목적:

- 데이터 유출, 감사 누락, 자동 로그 누락을 막는 Backend 테스트를 만든다.

포함 범위:

- user ownership isolation
- AdminGuard
- deal stage change activity log
- meeting note link activity log
- sensitive raw view audit transaction
- trash restore

제외 범위:

- 전체 API full integration
- 자동 테스트의 외부 Provider 실제 호출

완료 기준:

- 위험 흐름 테스트가 자동 실행된다.

### G34. User Web smoke E2E

목적:

- 개인 영업자의 핵심 업무 흐름이 깨지지 않게 한다.

포함 범위:

- 로그인 보호 라우트
- 회사 생성
- 담당자 생성
- 제품 생성
- 딜 생성
- 딜 단계 변경
- 일정 생성
- 회의록 저장

제외 범위:

- 기본 smoke E2E에서의 실제 OpenAI/OCR/Google Calendar/SMTP/Web Push VAPID 호출

완료 기준:

- Playwright smoke E2E가 local에서 통과한다.

### G35. Admin Web smoke E2E

목적:

- Admin 안전 흐름이 깨지지 않게 한다.

포함 범위:

- Admin 로그인
- non-admin 접근 차단
- 사용자 목록 조회
- 전체 딜 목록 조회
- 민감 데이터 masking 확인
- 원문 조회 사유 입력
- 감사 로그 생성 확인

제외 범위:

- 수동 결제 관리

완료 기준:

- Admin Web Playwright smoke E2E가 local에서 통과한다.

### G36. MVP starter 통합 점검

목적:

- MVP starter 범위가 다음 개발 단계로 넘어갈 수 있는지 확인한다.

포함 범위:

- README 실행 방법 정리
- `.env.example` 점검
- FE/BE 실행 명령 점검
- DB migration/seed 점검
- mock external provider 점검
- 남은 결정 사항 목록화

제외 범위:

- production 배포
- 실 Provider smoke

완료 기준:

- 새 개발자가 문서만 보고 local 실행을 재현할 수 있다.
- 다음 계획 폴더로 넘길 미완료 항목이 정리된다.

## 11. 작업 순서 요약

```text
G00 -> G01 -> G02 -> G03 -> G04 -> G05
-> G06 -> G07
-> G08 -> G09
-> G10 -> G11
-> G12 -> G13 -> G14 -> G15 -> G16
-> G17 -> G18
-> G19 -> G20
-> G21 -> G22
-> G23 -> G24
-> G25 -> G26
-> G27 -> G28 -> G29
-> G30 -> G31 -> G32
-> G33 -> G34 -> G35 -> G36
```

## 12. 작업 중단 기준

다음 상황에서는 해당 `/goal`을 무리하게 확장하지 않고 중단한 뒤 다음 문서를 갱신한다.

- 실제 Provider 연동에 필요한 API key, OAuth client, redirect URL, scope 설정이 없다.
- DB migration 방향이 기존 결정과 충돌한다.
- FE/BE API 계약이 문서와 맞지 않는다.
- 한 goal 안에서 수정 파일이 지나치게 넓어진다.
- 테스트가 실패했지만 원인이 현재 goal 범위를 벗어난다.

중단 시 남길 내용:

- 완료한 작업
- 실패하거나 보류한 작업
- 필요한 결정
- 다음 goal에서 이어받을 파일과 명령

## 13. 관련 문서

- `TODO/DONE/MVP-STARTER_PLAN/README.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/README.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/USER-FLOW.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/README.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/README.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/PLANNING-REVIEW.md`
- `TODO/DONE/MVP-STARTER_PLAN/FE-TODO/README.md`
- `TODO/DONE/MVP-STARTER_PLAN/BE-TODO/README.md`
- `AGENT/PM_AGENT/CONVENTION/DOCUMENTATION.md`


