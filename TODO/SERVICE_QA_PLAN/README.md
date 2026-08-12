# Service QA Plan

상태: Active / Ready
작성일: 2026-08-12
목적: `onehand.sales`의 실제 서비스 QA를 실행하기 위한 범위, 순서, 기록 방식을 정리한다.

## 1. 배경

`TODO/DONE/SOFTWARE_AGENT_RULE_COMPLIANCE_PLAN`에서 큰 아키텍처/API 경계와 정적 검증은 대부분 정리됐지만, 한글 주석 규칙의 source-wide 적용은 별도 후속 부채로 남아 있다.

이번 계획은 주석 보강 작업이 아니라 실제 제품 QA를 위한 계획이다. QA 중 발견된 서비스 결함은 severity 기준으로 기록하고, S0/S1/S2는 우선 수정 대상으로 분리한다.

## 2. QA 원칙

- 문서와 실행 결과를 분리하지 않는다. 실행한 명령, 수동 확인 결과, 실패 원인은 `COMMON/QA-RESULTS.md`와 `COMMON/ISSUE-LOG.md`에 기록한다.
- Playwright mock 기반 QA와 실제 BE/DB 연동 QA를 구분한다.
- Playwright mock QA는 화면 흐름, 라우팅, 요청 헤더, 권한 경계, console 누출을 빠르게 검증한다.
- 실제 BE 연동 QA는 인증, DB 저장/조회/수정/삭제/복구, transaction, ownership, Admin API를 검증한다.
- 실제 `.env` 값, access token, refresh token, provider secret, DB URL은 문서에 적지 않는다.
- 공유 DB나 운영 DB에 destructive command를 실행하지 않는다.
- QA 중 발견된 S0/S1은 문서화만 하지 않고 수정 계획으로 즉시 승격한다.

## 3. 포함 범위

- `BE`
  - NestJS API typecheck/lint/test/build
  - Prisma validate/generate/migration status
  - User API `/api/*`
  - Admin API `/admin/api/*`
  - 인증/권한/ownership
  - 주요 도메인 CRUD와 Trash 복구
  - 민감 정보 원문 조회, 감사 로그, redaction

- `FE/user-web`
  - 로그인/보호 라우트
  - 회사, 담당자, 제품, 딜, 일정, 회의록
  - 명함 OCR, Import, Search, Trash, Settings
  - Playwright smoke/mobile/browser/analytics
  - 모바일 브라우저 390px/360px UX

- `FE/admin-web`
  - Admin 로그인/권한 차단
  - 사용자 조회, 도메인 데이터 조회
  - 민감 원문 조회 사유 검증
  - 감사 로그, provider failure, analytics, account request, trash recovery, operation gate

## 4. 제외 범위

- Paddle/Billing 결제 구현 QA
- iOS/Android native app QA
- 운영 DB destructive migration/seed
- 실제 외부 provider 대량 호출
- Series A 이후 기능의 신규 구현 검증

제외 범위는 QA 실패가 아니라 `N/A` 또는 `Deferred`로 기록한다.

## 5. 실행 순서

1. `G01-QA-DOC-AND-ENV-BASELINE`
2. `G02-AUTOMATED-QUALITY-GATE`
3. `G03-PLAYWRIGHT-MOCK-FE-QA`
4. `G04-REAL-BE-INTEGRATION-QA`
5. `G05-MANUAL-UX-MOBILE-BROWSER-QA`
6. `G06-SECURITY-ADMIN-PRIVACY-QA`
7. `G07-ISSUE-TRIAGE-AND-CLOSEOUT`

상세 순서는 `COMMON/GOAL-WORK-ORDER.md`를 따른다.

## 6. 완료 기준

- BE, User Web, Admin Web의 기본 자동 검증 결과가 기록되어 있다.
- 기존 Playwright QA 결과가 기록되어 있다.
- 실제 BE 연동 QA 결과가 기록되어 있다.
- 모바일 390px/360px, desktop Chrome, 가능한 경우 Edge 결과가 기록되어 있다.
- `COMMON/ISSUE-LOG.md`에 Open S0/S1이 없다.
- Open S2는 수정 완료 또는 명확한 보류 사유가 있다.
- QA 중 발견된 문서/계약 불일치가 관련 TODO 또는 AGENT 문서 후속으로 분리되어 있다.

## 7. 관련 문서

- `AGENT/SOFTWARE_AGENT/COMMON/QA_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/TESTING.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/TESTING.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `TODO/DONE/USER_WEB_RELEASE_QA_FOLLOWUP_PLAN`
- `TODO/DONE/SOFTWARE_AGENT_RULE_COMPLIANCE_PLAN`

