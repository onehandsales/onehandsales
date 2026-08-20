# Backend API TODO

상태: Confirmed / No backend work

## 1. 원칙

이번 계획은 Frontend 화면 구조와 계정 모달 UX를 바꾸는 작업이다. Backend API를 추가하거나 수정하지 않는다.

기존 설정 기능이 이미 사용하던 User API를 그대로 소비한다.

## 2. API 변경 범위

| 항목 | 결정 |
| --- | --- |
| 새 User API | 없음 |
| 새 Admin API | 없음 |
| 기존 API path 변경 | 없음 |
| request DTO 변경 | 없음 |
| response DTO 변경 | 없음 |
| error code 변경 | 없음 |
| transaction 변경 | 없음 |
| observability event 변경 | 없음 |
| audit log 변경 | 없음 |

## 3. 기존 API 소비 유지

| 기능 | Backend 변경 기준 |
| --- | --- |
| profile 조회/수정 | 기존 내 계정 API 계약을 유지한다. |
| devices 조회 | 기존 내 기기 API 계약을 유지한다. |
| account data request | 기존 데이터 export/delete request API 계약을 유지한다. |
| Google Calendar 설정 | 기존 schedule/calendar 설정 API 계약을 유지한다. |
| follow-up delivery 설정 | 기존 follow-up delivery 설정 API 계약을 유지한다. |
| notification settings/browser push | 기존 notification settings와 browser push subscription API 계약을 유지한다. |

## 4. 구현 중 중단 기준

Frontend 구현 중 아래 요구가 발견되면 이 계획에서 처리하지 않고 별도 Backend/API 계획으로 분리한다.

- 설정 modal에서 기존 API response에 없는 필드를 새로 표시해야 한다.
- Google Calendar OAuth callback을 modal로 자동 복귀시키기 위해 새 server state가 필요하다.
- account data request 정책이나 상태값이 바뀐다.
- follow-up delivery provider 계약이 바뀐다.
- browser push subscription 저장 정책이 바뀐다.

## 5. 관련 문서

- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/API-SPEC/NO_API_CHANGE.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
