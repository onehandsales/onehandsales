# G12 Deal Backend vertical slice 작업 로그

## 작업 상태

- 상태: 완료
- 작업 일자: 2026-06-06
- 관련 goal: `G12. Deal Backend vertical slice`
- 관련 문서:
  - `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P2-G12-G16-DEAL-LOOP.md`
  - `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G06-G12-CORE-DOMAIN-API.md`
  - `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G06-G12-ENDPOINT-CONTRACT.md`
  - `AGENT/SOFTWARE_AGENT/ARCHITECTURE/BACKEND.md`
  - `AGENT/SOFTWARE_AGENT/CONVENTION/BACKEND.md`

## 요청 내용

- G12 Deal Backend vertical slice를 구현한다.
- 작업 진행과 완료 결과를 `TODO_LOG`에 기록한다.

## 구현 범위

- Deal CRUD API 구현
- Deal stage change API 구현
- Deal next action 수정/완료/미루기 API 구현
- DealActivity 목록/생성/수정/삭제 API 구현
- Company, Contact, Product ownership 검증
- ProductConnection 기반 Deal-Product 연결 처리
- Deal initial memo 암호화 저장
- soft delete, restore, deleted resource 처리
- use case 테스트, typecheck, lint, build, smoke 검증

## 진행 기록

- 2026-06-06: 작업 로그 문서 생성
- 2026-06-06: Deal module full-layer 구조 추가
  - `domain`: Deal 전용 error 정의
  - `application`: repository port, response mapper, 입력 정규화, use case, use case test
  - `infrastructure`: Prisma repository 구현
  - `presentation`: HTTP controller와 DTO 구현
- 2026-06-06: `AppModule`에 `DealModule` 연결
- 2026-06-06: `NextActionNotFound` error를 HTTP 409로 매핑
- 2026-06-06: `contactId` 변경 시 contact의 company 추론값이 deal company에 반영되도록 repository 업데이트 로직 보정

## 완료된 API

- `GET /api/deals`
- `POST /api/deals`
- `GET /api/deals/:dealId`
- `PATCH /api/deals/:dealId`
- `PATCH /api/deals/:dealId/stage`
- `PATCH /api/deals/:dealId/next-action`
- `POST /api/deals/:dealId/next-action/complete`
- `POST /api/deals/:dealId/next-action/snooze`
- `DELETE /api/deals/:dealId`
- `POST /api/deals/:dealId/restore`
- `GET /api/deals/:dealId/activities`
- `POST /api/deals/:dealId/activities`
- `PATCH /api/deals/:dealId/activities/:activityId`
- `DELETE /api/deals/:dealId/activities/:activityId`

## 검증 결과

- 통과: `pnpm exec tsc --noEmit`
- 통과: `pnpm exec jest --runInBand`
- 통과: `pnpm run lint`
- 통과: `pnpm run build`
- 통과: `env DATABASE_URL=postgresql://user:pass@localhost:5432/sales_b2c DIRECT_URL=postgresql://user:pass@localhost:5432/sales_b2c pnpm exec prisma validate`
- 통과: `env DATABASE_URL=postgresql://sales_b2c:sales_b2c_password@localhost:5432/sales_b2c_dev DIRECT_URL=postgresql://sales_b2c:sales_b2c_password@localhost:5432/sales_b2c_dev pnpm exec prisma migrate deploy`
  - 결과: pending migration 없음
- 통과: AGENT boundary check
  - `rg "@prisma/client|PrismaService|jwt|supabase" BE/src/modules/deal/application BE/src/modules/deal/domain`
  - `rg "\bany\b|console\.|process\.env" BE/src/modules/deal BE/src/app.module.ts`
- 통과: `git diff --check`
- 통과: G12 HTTP smoke
  - 인증 세션 생성 후 `http://127.0.0.1:3101` backend에 실제 요청
  - 확인 범위: Deal CRUD, stage change 자동 activity, next action update/complete/snooze, DealActivity CRUD, deleted read 410, restore
  - smoke 테스트 데이터 정리 완료

## 검토 결과

- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P2-G12-G16-DEAL-LOOP.md`의 G12 완료 조건 충족
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G06-G12-CORE-DOMAIN-API.md`와 `G06-G12-ENDPOINT-CONTRACT.md`의 G12 endpoint 범위 반영
- backend 계층 규칙 검토 완료
  - application/domain 계층에서 Prisma/JWT/Supabase 직접 참조 없음
  - Deal infrastructure에서 Prisma 접근을 repository로 격리
  - HTTP error contract에 필요한 `NextActionNotFound` 409 매핑 추가

## 남은 리스크 또는 보류 사항

- G12 backend slice는 완료.
- activity type 목록 API는 이번 G12 범위 밖이다. 현재 activity 생성 API는 기존/system `DealActivityType` id를 요구한다.
- 실제 사용자 화면에서 activity type 선택 UX가 필요하면 G13 이후 화면 작업 중 별도 API 필요 여부를 판단한다.

## 다음 권장 작업

- G12 완료 후 `G13. Deal User Web 목록과 빠른 생성`

## 전체 작업 현황

- 완료: G06 Company Backend vertical slice
- 완료: G07 Company User Web
- 완료: G08 Contact Backend vertical slice
- 완료: G09 Contact User Web
- 완료: G10 Product Backend vertical slice
- 완료: G11 Product User Web
- 완료: G12 Deal Backend vertical slice
- 진행 필요: G13 Deal User Web 목록과 빠른 생성
- 진행 필요: G14 Deal Detail User Web과 activity timeline
- 진행 필요: G15 Meeting Note Backend와 AI parsing stub
- 진행 필요: G16 Meeting Note User Web
