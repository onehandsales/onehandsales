# G17 Schedule Backend Vertical Slice

## 상태
- 완료

## 기준 문서
- `AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/CONVENTION/BACKEND.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P3-G17-G20-SCHEDULE-MEETING.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-WORKFLOW-AUTOMATION-API.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-ENDPOINT-CONTRACT.md`

## 요구사항 체크
- Schedule CRUD Backend를 구현한다.
- 딜/회사/거래처 연결 소유권을 검증한다.
- 딜에서 만든 일정은 회사/거래처 기본 상속이 가능해야 한다.
- `GET /api/schedules`는 `from`, `to`가 없으면 사용자 timezone 기준 이번 달 범위를 조회한다.
- 주간 보기 기간 조회는 명시적 `from`, `to`와 별도 `GET /api/schedules/week`를 지원한다.
- ScheduleReminder 기본 구조를 생성/수정 흐름에 포함한다.
- `source = INTERNAL | GOOGLE` 구분 필드를 응답에 포함한다.

## 제외 범위
- Google Calendar 실연동
- PDF/Excel 생성
- Frontend 일정 화면

## 작업 로그
- G17 기준 문서와 Schedule API 계약을 확인했다.
- 기존 `deal`, `company`, `contact` Backend 모듈 패턴을 확인했다.
- Prisma `Schedule`, `ScheduleReminder` 모델은 이미 존재함을 확인했다.
- `ScheduleModule`을 추가하고 `AppModule`에 등록했다.
- `/api/schedules` 목록/생성/상세/수정/삭제/복구 API와 `/api/schedules/week` 조회 API를 추가했다.
- Schedule repository port, response mapper, input normalizer, use case 계층을 추가했다.
- Prisma repository에서 딜/회사/거래처 소유권 검증, 딜 기반 회사/거래처 상속, reminder 생성/재구성, soft delete/restore를 구현했다.
- `InvalidScheduleRange`를 HTTP 400으로 변환하도록 공통 exception filter를 갱신했다.
- Schedule use case 테스트를 추가했다.

## 검토
- G17 제외 범위인 Google Calendar 실연동, PDF/Excel 생성, Frontend 일정 화면은 구현하지 않았다.
- `GET /api/schedules`는 `from/to`가 없을 때 timezone 기준 이번 달 범위를 계산한다.
- 명시적 `from/to`는 월간/주간 보기 전환 조회에 그대로 사용할 수 있다.
- `/api/schedules/week`는 `weekStart` 기준 7일을 timezone 날짜별로 그룹화한다.
- 일정 생성 시 `reminderMinutes`가 있으면 `ScheduleReminder`를 `EMAIL`/`PENDING` 기본 구조로 생성한다.
- 일정 수정 시 `reminderMinutes`가 오면 기존 reminder를 재구성한다.
- 딜 연결 일정은 딜의 회사/거래처를 기본 상속하며, 명시된 회사/거래처가 딜과 충돌하면 validation error를 낸다.

## 검증
- `pnpm run typecheck` 통과
- `pnpm run lint` 통과
- `pnpm run test -- schedule.use-cases.spec.ts` 통과
- `pnpm run test` 통과
- `pnpm run build` 통과
- `DATABASE_URL="postgresql://user:pass@localhost:5432/db" DIRECT_URL="postgresql://user:pass@localhost:5432/db" pnpm run prisma:validate` 통과
- `git diff --check` 통과

## 참고
- `pnpm run prisma:validate`는 로컬 `DIRECT_URL`이 없어 최초 실행 시 환경 변수 오류로 실패했다. 더미 `DATABASE_URL`/`DIRECT_URL`을 주입해 schema 자체 검증은 통과했다.

## 완료 감사

- 작업 일자: 2026-06-07
- 관련 계획과 goal: G17 연속 작업 범위
- 관련 AGENT/TODO 문서: 위 `기준 문서` 또는 `참고 문서` 섹션 기준
- 예정 범위: 위 `요구사항 체크`, `목표`, `구현 내용` 섹션 기준
- 진행 기록: 위 `작업 로그` 또는 `구현 내용` 섹션 기준
- 적용 범위 또는 변경 파일: 해당 goal 커밋 diff와 위 구현 기록 기준
- 검증 결과: 위 `검증` 또는 `검증 결과` 섹션 기준
- 검토 결과: 위 `검토` 또는 `검토 메모` 섹션 기준
- 남은 리스크 또는 보류 사항: 위 `제외 범위`, `참고`, `검토 메모`에 명시된 항목 외 신규 보류 없음
- 다음 권장 작업: G16-G36 연속 작업 순서에 따라 다음 goal로 진행했고, G36 이후에는 다음 계획 폴더로 넘길 보류 항목을 `COMMON/PLANNING-REVIEW.md`에 유지
- 전체 작업 진행 현황: G16-G36 21개 goal 구현, 검토, 검증, TODO_LOG 기록, git commit 완료
