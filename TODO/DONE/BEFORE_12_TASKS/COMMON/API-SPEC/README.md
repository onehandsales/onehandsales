# API Spec

상태: Confirmed / No New API
계약 상태: No new API

## 1. 목적

이 폴더는 `BEFORE_12_TASKS`의 API 영향 여부를 기록한다.

이번 계획은 새 API를 만들지 않는다. G01은 기존 follow-up delivery API를 운영 smoke에 사용했고, G02~G06은 문서 정합성 closeout과 handoff만 수행했다.

## 2. 계약 문서

| 문서 | 계약 상태 | 소비자 | 설명 |
| --- | --- | --- | --- |
| `NO_NEW_API_CONTRACT.md` | confirmed | Backend, User Web, Admin Web | 12 전 closeout에서는 새 API를 만들지 않는다는 계약 |

## 3. 구현 기준

- 새 User API를 추가하지 않는다.
- 새 Admin API를 추가하지 않는다.
- 기존 request/response field를 바꾸지 않는다.
- follow-up email delivery API path를 바꾸지 않는다.
- `/api/exports`, `/api/drafts/*`, billing API, customer admin API를 만들지 않는다.
- API spec이 필요한 새 기능 후보는 12 이후 새 TODO 또는 `12_BILLING_SUBSCRIPTION_TAX`에서만 다룬다.

## 4. API 변경 필요 발견 시 처리

작업 중 새 API나 request/response 변경이 필요해 보이면 아래처럼 처리한다.

1. 현재 goal에서 구현하지 않는다.
2. `COMMON/PLANNING-REVIEW.md` 또는 해당 goal 결과에 필요 사유를 기록한다.
3. 12 Billing 종속이면 `12_BILLING_SUBSCRIPTION_TAX`에서 다시 판단한다.
4. post-12 후보이면 PRE12 post-12 목록 또는 별도 후속 TODO 후보로 남긴다.

## 5. 관련 문서

- `TODO/BEFORE_12_TASKS/COMMON/API-SPEC/NO_NEW_API_CONTRACT.md`
- `TODO/BEFORE_12_TASKS/BE-TODO/API-TODO.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
