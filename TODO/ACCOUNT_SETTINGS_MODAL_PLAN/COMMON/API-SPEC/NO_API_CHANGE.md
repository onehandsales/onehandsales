# No API Change Contract

상태: Confirmed / No new backend API / OAuth callback URL updated

## 1. 목적

이 문서는 `ACCOUNT_SETTINGS_MODAL_PLAN`에서 새 Backend API, 새 DB schema, 새 transaction을 만들지 않는다는 계약을 고정한다.

이번 작업은 설정 화면의 위치와 Frontend 구조를 바꾸는 UX/UI 개선이다. 저장되는 데이터와 서버 비즈니스 로직은 바뀌지 않는다. `/app/settings` route 삭제를 위해 기존 OAuth callback/return URL 생성만 `/app?account=settings` modal-open contract로 정리한다.

## 2. API 계약 상태

| 항목 | 값 |
| --- | --- |
| 계약 상태 | Confirmed |
| 소비자 | `FE/user-web` |
| 새 API 필요 여부 | 없음 |
| 새 request DTO | 없음 |
| 새 response DTO | 없음 |
| 새 error code | 없음 |
| transaction 변경 | 없음 |
| observability 변경 | 없음. Google Calendar 연결 시작 log의 `returnTo` 값은 새 modal URL이 될 수 있음 |
| DB schema 변경 | 없음 |

## 3. 기존 API 소비 범위

아래 API와 hook은 기존 설정 기능이 이미 사용하던 범위다. 구현 중 endpoint 계약을 바꾸지 않는다.

| 기능 | Frontend 위치 | 기준 |
| --- | --- | --- |
| 내 profile 조회/수정 | `features/auth` hooks | 이름, 언어, timezone, 국가, 통화 저장 |
| 내 devices 조회 | `features/auth` hooks | 기기 목록과 현재 기기 표시 |
| account data request | `features/account-request` | 데이터 export 요청, 계정 삭제 요청/취소 |
| Google Calendar 설정 | `features/schedule` | 연결 상태, calendar 선택, read-only sync 설정 |
| follow-up delivery 설정 | `features/follow-up-delivery` | email provider, SMS sender, consent notice |
| notification settings | `features/notification` | 서비스 알림과 브라우저 푸시 설정, G02에서 유지 |

구현 후 확인:

- account data request와 follow-up delivery는 기존 hook/API path를 그대로 사용한다.
- follow-up callback query 처리는 `/app?account=settings&followUpEmailConnection=...&status=...` modal URL과 FE Settings section에서 처리한다.
- Google Calendar callback은 `/app?account=settings&googleCalendar=...` modal URL과 `GoogleCalendarSettingsSection` query handler로 처리한다.
- 새 User API, Admin API, DTO, error code, transaction, observability event는 추가하지 않았다.

## 4. FE 처리 기준

- API client는 기존 `src/lib/api-client.ts` 경로를 통해서만 사용한다.
- 서버 상태는 기존 TanStack Query hook을 사용한다.
- mutation 성공 후 기존 query invalidation 기준을 유지한다.
- body 없는 성공 응답 처리 방식은 기존 feature hook 기준을 따른다.
- 권한 없음, 인증 만료, 네트워크 오류는 기존 API client error mapping을 따른다.

## 5. BE 처리 기준

- 새 controller, service, repository, Prisma model을 만들지 않는다.
- User API와 Admin API 경계를 새로 만들거나 변경하지 않는다.
- transaction, audit log, observability event key를 추가하지 않는다.
- 기존 API 계약을 바꿔야 하는 요구가 발견되면 이 계획의 구현을 멈추고 별도 API 계획 문서로 분리한다.

## 6. 관련 문서

- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/SCOPE.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/FE-TODO/USER-WEB-TODO.md`
- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/BE-TODO/API-TODO.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
