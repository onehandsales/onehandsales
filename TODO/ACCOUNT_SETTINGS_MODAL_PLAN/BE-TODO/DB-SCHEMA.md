# DB Schema

상태: Confirmed / No DB change / Verified after FE implementation

## 1. 원칙

이번 계획은 기존 설정 데이터를 다른 화면 위치에서 보여주는 작업이다. 저장 대상, 관계, 상태값, retention 정책을 바꾸지 않는다.

Prisma schema와 migration은 수정하지 않는다.

## 2. DB 변경 범위

| 항목 | 결정 |
| --- | --- |
| 새 model | 없음 |
| 새 enum | 없음 |
| 새 field | 없음 |
| 새 index | 없음 |
| relation 변경 | 없음 |
| soft delete 정책 변경 | 없음 |
| retention 정책 변경 | 없음 |
| migration | 없음 |

## 3. 기존 데이터 사용 범위

| 기능 | 데이터 기준 |
| --- | --- |
| profile/defaults | 기존 user profile의 이름, locale, timezone, country, currency 값을 사용한다. |
| OAuth provider | 기존 provider account 연결 정보를 읽기 전용으로 표시한다. |
| devices | 기존 user device/session 정보를 읽기 전용으로 표시한다. |
| account data request | 기존 export/delete request 상태와 정책을 사용한다. |
| Google Calendar | 기존 calendar 연결과 선택 calendar 상태를 사용한다. |
| follow-up delivery | 기존 email/SMS 발송 설정을 사용한다. |
| notification settings/browser push | 기존 알림 설정과 push subscription 상태를 사용한다. |

## 3.1. 구현 후 확인

- account data request와 follow-up delivery 이관은 기존 저장 모델과 상태값을 그대로 사용했다.
- `/app/settings` route bridge와 modal-open query는 persistence 정책을 바꾸지 않는다.
- Prisma schema와 migration 변경은 없다.

## 4. 관련 문서

- `TODO/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/API-SPEC/NO_API_CHANGE.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
