# Time And Timezone Policy

## 1. 목적

이 문서는 Backend DB schema, API 계약, Frontend 표시에서 시간과 timezone을 어떻게 다룰지 정의한다.

이 프로젝트는 한국뿐 아니라 미국, 싱가폴 등 여러 timezone의 사용자를 지원할 수 있어야 한다.

따라서 DB에는 실제 시각 instant를 UTC 기준으로 저장하고, 사용자가 입력한 현지 시간의 의미가 필요한 테이블에는 IANA timezone ID를 함께 저장한다.

## 2. 기본 원칙

- DB에 저장하는 실제 시각 instant는 UTC 기준이다.
- `createdAt`, `updatedAt`, `deletedAt`, `expiresAt`, `revokedAt`, `lastLoginAt`처럼 시스템이 생성하거나 상태 변경 시점으로 쓰는 컬럼은 UTC 기준으로 저장한다.
- 일정의 `startAt`, `endAt`처럼 사용자가 입력한 현지 시간이 중요한 컬럼은 사용자의 IANA timezone으로 해석한 뒤 DB에는 UTC instant로 저장한다.
- 사용자가 입력한 현지 시간 의미를 나중에도 복원해야 하는 업무 테이블은 같은 row에 `timeZone` 컬럼을 저장한다.
- 사용자 화면 표시는 User Web 또는 Admin Web에서 사용자/조직/일정의 timezone으로 변환한다.
- 날짜만 필요한 값은 시간 컬럼을 쓰지 않고 Prisma `DateTime @db.Date`로 저장한다.
- Backend API 응답에서 instant는 ISO 8601 UTC string을 기본으로 한다. 예: `2026-06-14T03:10:00.000Z`
- 날짜 전용 값은 `YYYY-MM-DD` string으로 응답한다.

## 3. Prisma 작성 기준

새로운 Prisma schema를 작성할 때 시간 컬럼은 아래 기준을 따른다.

| 용도 | Prisma 기준 | 저장 의미 |
|---|---|---|
| 생성/수정/삭제/만료 시각 | `DateTime @db.Timestamptz(3)` 권장 | UTC instant |
| 일정 시작/종료 시각 | `DateTime @db.Timestamptz(3)` 권장 | 사용자의 timezone으로 해석한 UTC instant |
| 사용자/조직/일정 timezone | `String` | IANA timezone ID |
| 날짜만 필요한 값 | `DateTime @db.Date` | timezone 없는 날짜 |

기본 시스템 컬럼 예:

```prisma
createdAt DateTime @default(now()) @db.Timestamptz(3)
updatedAt DateTime @updatedAt @db.Timestamptz(3)
```

사용자 또는 조직의 기본 timezone 컬럼 예:

```prisma
timeZone String @default("Asia/Seoul")
```

일정처럼 사용자가 입력한 현지 시간이 핵심인 컬럼 예:

```prisma
startAt  DateTime @db.Timestamptz(3)
endAt    DateTime @db.Timestamptz(3)
timeZone String   @default("Asia/Seoul")
```

날짜만 필요한 컬럼 예:

```prisma
expectedEndDate DateTime @db.Date
```

주의:

- 기존 migration의 여러 `DateTime` 컬럼은 PostgreSQL `TIMESTAMP(3)`로 생성되어 있다. 이 값도 애플리케이션 기준으로 UTC instant로 취급한다.
- 기존 적용 migration 파일은 수정하지 않는다.
- 기존 `TIMESTAMP(3)` 컬럼을 `TIMESTAMPTZ`로 바꾸려면 별도 migration 계획과 데이터 해석 기준을 먼저 문서화한다.
- `createdAt`, `updatedAt`만 있는 시스템/로그성 테이블에는 별도 `timeZone` 컬럼을 추가하지 않는다.
- 사용자가 입력한 현지 날짜/시간을 저장하는 업무 테이블은 `timeZone` 컬럼을 함께 저장한다. 예: `Schedule.timeZone`, `MeetingNote.timeZone`.
- `timeZone`은 `KST`, `PST`, `GMT+9` 같은 약어/offset이 아니라 `Asia/Seoul`, `America/Los_Angeles`, `Asia/Singapore` 같은 IANA timezone ID여야 한다.

## 4. Backend 처리 기준

- Backend는 클라이언트에서 받은 현지 날짜/시간과 IANA `timeZone`을 명확히 해석한 뒤 UTC `Date`로 변환해 저장한다.
- 일정 생성/수정 API는 사용자가 입력한 현지 시각과 `timeZone`을 함께 받아야 한다.
- Backend는 `timeZone`이 유효한 IANA timezone ID인지 검증한다.
- Backend 응답에서 시스템 시각과 일정 시각은 `toISOString()` 기준의 UTC ISO string을 기본으로 하고, 일정 응답에는 저장된 `timeZone`도 함께 반환한다.
- 날짜 전용 값은 `YYYY-MM-DD`로 변환해 응답한다.
- API 계약 문서에는 시간 필드마다 `UTC instant`, `local date-time + timeZone`, `날짜 전용` 중 무엇인지 적는다.
- 검색/필터에서 `from`, `to`, `weekStart` 같은 기간 값이 들어오면 어떤 timezone 기준으로 포함/제외 범위를 계산하는지 명시한다.

## 5. Frontend 표시 기준

- Frontend는 Backend에서 받은 UTC ISO string을 그대로 화면에 노출하지 않고 표시 timezone으로 변환한다.
- 표시 timezone 우선순위는 일정 `timeZone`, 사용자 설정 timezone, 조직 timezone, 브라우저 timezone, `Asia/Seoul` fallback 순으로 정한다.
- 일정 화면은 월간/주간 범위를 계산할 때 선택된 표시 timezone을 기준으로 한다.
- 일정 생성/수정 form은 사용자가 선택한 날짜와 24시간제 시간을 local date-time으로 보내고, 함께 적용할 IANA `timeZone`을 보낸다.
- Frontend는 일정 생성/수정 요청에서 사용자 입력 local date-time을 `toISOString()`으로 UTC 변환해서 보내지 않는다.
- 날짜 전용 값은 timezone 변환 없이 `YYYY-MM-DD` 기준으로 표시한다.

## 5A. 로그인 Locale/Timezone/Country Metadata

- User Web은 로그인 exchange 때 사용자 선택/브라우저 기준 `locale`과 브라우저 IANA `timeZone`을 Backend로 보낸다.
- 신규 사용자는 exchange metadata로 `preferredLocale`, `timeZone`, `signupLocale`, `signupTimeZone`, `lastLoginLocale`, `lastLoginTimeZone`을 초기화한다.
- 기존 사용자는 로그인 때 `timeZone`을 덮어쓰지 않는다. 사용자의 기본 timezone은 설정값으로 보존하고, 최근 로그인 환경은 `lastLoginTimeZone`에 기록한다.
- `signupCountryCode`와 `lastLoginCountryCode`는 Frontend가 보내지 않는다. Backend가 배포 프록시 geo header(`cf-ipcountry`, `x-vercel-ip-country`, `cloudfront-viewer-country`)에서 읽는다.
- 로컬 개발 또는 geo header가 없는 배포 환경에서는 country code가 `null`일 수 있으며, 화면에는 `기록 없음`으로 표시된다.

## 6. 금지

- `createdAt`, `updatedAt` 같은 시스템 시각을 KST 문자열로 DB에 저장하지 않는다.
- 일정 `startAt`, `endAt`을 `timeZone` 없이 저장하지 않는다.
- `KST`, `PST`, `EST`, `GMT+9` 같은 약어를 `timeZone` 정본으로 저장하지 않는다.
- 사용자 입력 local date-time을 Frontend에서 임의로 UTC 변환해 request 의미를 바꾸지 않는다.
- DB 컬럼만 보고 사용자의 표시 timezone을 추정하지 않는다.
- 날짜만 필요한 필드에 임의의 `00:00:00` 시간을 붙여 instant처럼 저장하지 않는다.
- 일정 `startAt`, `endAt`을 timezone 해석 없이 브라우저/서버 로컬 시간에 의존해 저장하지 않는다.
- API 계약 없이 시간 필드의 request/response 형식을 FE와 BE가 각자 해석하지 않는다.

## 7. 관련 문서

- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/ADMIN_WEB.md`
