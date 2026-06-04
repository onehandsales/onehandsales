# MVP Starter 기획 검토 결과

## 1. 결론

- 판정: 조건부 통과
- 이유: `COMMON` 구조, 사용자 흐름, `/goal` 작업 순서, 공통 API 명세, 엔드포인트별 구현 계약, goal별 화면/API/DB 추적 명세, DB 스키마 초안이 구현 직전 기준으로 정리되었다. 다만 실제 구현을 시작하기 전에는 G00에서 운영 결정값을 먼저 확정해야 한다.

## 2. 검토 대상

검토한 문서:

- `TODO/MVP-STARTER_PLAN/README.md`
- `TODO/MVP-STARTER_PLAN/COMMON/README.md`
- `TODO/MVP-STARTER_PLAN/COMMON/USER-FLOW.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/*`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/*`
- `TODO/MVP-STARTER_PLAN/FE-TODO/*`
- `TODO/MVP-STARTER_PLAN/BE-TODO/*`

기준 문서:

- `AGENT/PM_AGENT/CONVENTION/PLANNING_REVIEW_CHECKLIST.md`
- `AGENT/PM_AGENT/DECISIONS/018_todo_common_contract_structure.md`
- `AGENT/PM_AGENT/DECISIONS/019_agent_based_planning_review.md`
- `AGENT/PM_AGENT/DECISIONS/020_todo_execution_plan_standard.md`
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/ADMIN_WEB.md`
- `AGENT/SOFTWARE_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`

## 3. 핵심 발견 사항

| 등급 | 문서 | 문제 | 영향 | 권장 조치 |
|---|---|---|---|---|
| Major | `COMMON/GOAL-WORK-ORDER.md` | G00 운영 결정이 실제 구현 전 선행되어야 한다. | G01 이후 스캐폴딩에서 package manager, Node 버전, local DB 방식이 흔들릴 수 있다. | 첫 `/goal`은 반드시 G00으로 실행한다. |
| Resolved | `COMMON/G00-DECISIONS.md` | G00이 기술 결정만 다루는지 API/DB 정책까지 다루는지 불명확했다. | G01 이후 구현자가 삭제 정책, 인증/session, 민감정보, Import/Export 정책을 임의로 선택할 수 있었다. | G00 범위를 기술/API/DB/운영 정책 확정으로 확장했다. |
| Resolved | `COMMON/G00-DECISIONS.md` | package manager가 확정되지 않았다. | FE/BE 스캐폴딩 명령과 lockfile 기준이 흔들릴 수 있었다. | package manager를 `pnpm`으로 확정했다. |
| Resolved | `COMMON/G00-DECISIONS.md` | Node.js 버전이 확정되지 않았다. | 개발자 PC, CI, 배포 환경에서 설치/빌드 결과가 달라질 수 있었다. | Node.js 버전을 `Node.js 24 LTS`로 확정했다. |
| Resolved | `COMMON/G00-DECISIONS.md` | local DB 실행 방식이 확정되지 않았다. | Prisma migration, seed, local test 기준이 개발자마다 달라질 수 있었다. | local DB 실행 방식을 `Docker PostgreSQL`로 확정했다. |
| Resolved | `COMMON/G00-DECISIONS.md` | PostgreSQL Docker image version이 확정되지 않았다. | local migration과 seed 검증 기준이 PostgreSQL major version에 따라 달라질 수 있었다. | PostgreSQL Docker image version을 `postgres:17-alpine`으로 확정했다. |
| Resolved | `COMMON/G00-DECISIONS.md` | local DB 이름, 계정, 포트, 테스트 DB 분리 여부가 확정되지 않았다. | `.env.example`, Docker Compose, Prisma test 실행 기준이 흔들릴 수 있었다. | `sales_b2c_dev`, `sales_b2c_test`, user `sales_b2c`, password `sales_b2c_password`, port `5432`로 확정했다. |
| Resolved | `COMMON/G00-DECISIONS.md` | Supabase 사용 범위와 인증 1차 전략이 확정되지 않았다. | Backend가 OAuth callback/token 발급을 직접 구현할지, Supabase Auth를 검증할지 API 계약이 흔들릴 수 있었다. | MVP 1차에서는 Supabase `Auth`만 사용하고 Backend는 Supabase JWT 검증과 local User 동기화를 수행한다. |
| Resolved | `COMMON/G00-DECISIONS.md` | Supabase Auth 개발 환경이 확정되지 않았다. | Supabase local Auth와 remote Supabase project 중 무엇을 기준으로 `.env.example`, redirect URL, JWT 검증을 작성할지 흔들릴 수 있었다. | 개발용 `Remote Supabase project`를 사용한다. |
| Minor | `BE-TODO/API-TODO.md` | 기존 문서는 API 계약보다 Backend 작업 목록 성격이 강하다. | 구현자는 API 계약을 `COMMON/API-SPEC`에서 확인해야 한다. | `BE-TODO/API-TODO.md`는 Backend 구현 TODO로 유지하고, 상세 API 계약은 `COMMON/API-SPEC`을 정본으로 본다. |
| Resolved | `COMMON/API-SPEC/*-ENDPOINT-CONTRACT.md` | G06 이후 API의 business flow, DB, transaction, error 기준이 도메인 단위로 묶여 있었다. | 구현자가 API별 처리 기준을 추론할 여지가 있었다. | 엔드포인트별 구현 계약 문서를 추가했고 실제 구현 시 해당 문서를 상세 계약 정본으로 본다. |
| Resolved | `COMMON/GOAL-SPECS/*` | 일부 goal 상세 명세의 API 연결이 요약 API 문서만 가리켰다. | `/goal` 실행자가 엔드포인트별 구현 계약을 놓칠 수 있었다. | Backend/API가 포함된 goal에 `*-ENDPOINT-CONTRACT.md` 링크를 추가했다. |

## 4. 충돌 사항

현재 구현을 막는 Critical 충돌은 없다.

정리된 기준:

- API 명세 정본: `COMMON/API-SPEC`
- API별 구현 계약 정본: `COMMON/API-SPEC/*-ENDPOINT-CONTRACT.md`
- Backend 작업 목록: `BE-TODO/API-TODO.md`
- DB 스키마 정본: `BE-TODO/DB-SCHEMA.md`
- 화면/API/DB goal 추적 정본: `COMMON/GOAL-SPECS`

## 5. 사용자의 결정이 필요한 질문

G00은 문서 기준으로 진행할 수 있지만, G01 이후 구현을 시작하기 전에는 아래 운영 결정이 모두 확정되어야 한다.

- package manager: `pnpm`으로 확정됨
- Node 버전: `Node.js 24 LTS`로 확정됨
- local DB 실행 방식: `Docker PostgreSQL`로 확정됨
- PostgreSQL Docker image version: `postgres:17-alpine`으로 확정됨
- local DB 세부값: `sales_b2c_dev`, `sales_b2c_test`, user `sales_b2c`, password `sales_b2c_password`, port `5432`로 확정됨
- Supabase 사용 방식: MVP 1차에서는 `Auth`만 사용하고 business DB는 Docker PostgreSQL/Prisma로 확정됨
- Supabase Auth 개발 환경: 개발용 `Remote Supabase project` 사용으로 확정됨
- 인증 구현 1차 전략: `Supabase Auth 중심 + Backend Supabase JWT 검증 + local User 동기화`로 확정됨
- FE token 전달/보관 방식
- 삭제/복구/휴지통 정책
- 민감정보 저장/암호화/Admin masking 정책
- Import/Export와 외부 provider mock 범위
- `.env.example` 변수 목록

## 6. 구현 가능 여부

- 바로 구현 가능 여부: G00부터 가능
- 구현 전 반드시 수정할 항목: 없음
- 첫 번째로 실행할 goal: G00. 구현 전 운영 결정 정리

## 7. 구현 시작 원칙

- G00 없이 G01, G02, G03으로 넘어가지 않는다.
- 각 `/goal`은 `COMMON/GOAL-WORK-ORDER.md`의 순서를 따른다.
- 각 `/goal` 실행 전 `COMMON/GOAL-SPECS`의 해당 상세 명세를 확인한다.
- API 구현이 포함된 goal은 `COMMON/API-SPEC`의 해당 문서와 `*-ENDPOINT-CONTRACT.md`를 함께 확인한다.
- DB 변경이 포함된 goal은 `BE-TODO/DB-SCHEMA.md`와 연결 DB 모델을 확인한다.

## 8. AGENT 정본 기반 구체화 검토 결과

### Backend / Software Architecture

- 판정: 반영됨
- 근거:
  - `BE-TODO/README.md`가 DDD와 Clean Architecture 기준의 `domain`, `application`, `infrastructure`, `presentation` 계층을 명시한다.
  - `COMMON/GOAL-WORK-ORDER.md`의 Backend vertical slice는 domain entity, repository interface, Prisma repository, mapper, application service, User API 구현 흐름을 goal 단위로 나눈다.
  - `COMMON/API-SPEC/*-ENDPOINT-CONTRACT.md`가 API별 request, business flow, response, 연결 DB, transaction, error를 분리했다.
  - User API는 `/api/*`, Admin API는 `/admin/api/*`로 분리되어 있고, Admin API는 `AuthGuard`와 `AdminGuard`, masking, reason, AuditLog transaction을 전제로 한다.
  - OpenAI, OCR, Google Calendar, Import mapping, Export 생성, 알림 발송은 mock adapter 또는 port/adapter 뒤에서 처리하도록 정리되어 있다.
- 남은 조건:
  - 실제 구현 시 각 module에서 controller가 Prisma/repository를 직접 호출하지 않고 application service만 호출하는지 코드 리뷰로 확인해야 한다.

### Frontend / User Web

- 판정: 반영됨
- 근거:
  - `FE-TODO/USER-WEB-TODO.md`가 `FE/user-web` 별도 앱, Feature-Sliced 구조, `src/shared/api`, TanStack Query, React Hook Form, Zod, route 구조를 명시한다.
  - User Web은 `/api/*`만 호출하고 `/admin/api/*` 호출 금지를 명시한다.
  - 홈은 딜 파이프라인을 첫 화면으로 두고, 금액, 가능성, 다음 행동, 마감일을 1급 정보로 다룬다.
  - 모바일은 카드형 딜 리스트를 기본으로 하고 테이블/가로 칸반을 기본 UI로 쓰지 않는다고 명시한다.
  - 빠른 등록 modal과 inline entity creation은 최소 입력 흐름으로 분리되어 있다.

### Frontend / Admin Web

- 판정: 반영됨
- 근거:
  - `FE-TODO/ADMIN-WEB-TODO.md`가 `FE/admin-web` 별도 앱, `adminApiClient`, `/admin/api` base path, TanStack Table, 서버 페이지네이션, 데스크톱 전용 운영 콘솔을 명시한다.
  - 민감 데이터는 기본 마스킹하고, 원문 조회는 사유 입력 dialog와 감사 로그 확인 흐름을 거친다.
  - client log에 PII와 사유 text를 남기지 않는 기준이 있다.

### UX/UI

- 판정: 반영됨
- 근거:
  - `COMMON/USER-FLOW.md`는 로그인 후 딜 파이프라인 확인, 빠른 등록, 딜 중심 일정/회의록 연결, Admin 민감정보 조회 flow를 연결한다.
  - `COMMON/GOAL-SPECS`는 각 goal별 화면 목적, 주요 UI, 상태/validation, API 연결, DB 연결을 설명한다.
  - 정본에서 제외한 모호한 도메인/UX 용어는 실제 TODO 화면/명세 문맥에서 발견되지 않았다.

## 9. 관련 문서

- `TODO/MVP-STARTER_PLAN/COMMON/README.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/README.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/README.md`
- `TODO/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`
- `AGENT/PM_AGENT/CONVENTION/PLANNING_REVIEW_CHECKLIST.md`
- `AGENT/PM_AGENT/DECISIONS/019_agent_based_planning_review.md`
