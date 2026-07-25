# API Spec

상태: Confirmed
확정일: 2026-07-25

## 1. 목적

06의 API 계약은 두 묶음으로 나눈다.

| 문서 | 범위 | 구현 goal |
|---|---|---|
| `DEAL_ACTIVITY_API.md` | DealActivity timeline 조회, 수동 생성/수정, 자동 생성 기준 | G03/G04 |
| `DEAL_RECORD_SUMMARY_API.md` | 딜 목록 products/latest activity, 담당자 dealCount, page size 15 계약 | G05/G06 |

상위 backlog 대응:

- `NBA-001`: Deal list `products` 포함
- `NBA-002`: Contact list `dealCount` 포함
- `NBA-003`: Deal list `latestActivity` subset만 포함
- `NBA-008`: page size 15 cleanup 포함
- `NBA-014`: DB/Prisma migration gate 포함

## 2. 계약 상태

`DEAL_ACTIVITY_API.md`는 구현 가능한 `confirmed` 계약으로 유지한다.
`DEAL_RECORD_SUMMARY_API.md`는 G05 기준 Backend 구현이 완료되어 `implemented` 상태다. User Web 표시는 G06 범위다.

G01에서는 현재 코드와 문서 계약을 다시 대조하고, 충돌이 있으면 구현 전에 이 API 문서를 갱신한다. G01 완료 뒤 G02부터 코드 구현에 들어간다.

## 3. 공통 규칙

- User API는 `/api/*`만 사용한다.
- Admin API는 만들지 않는다.
- 모든 API는 AuthGuard를 사용한다.
- 다른 사용자 딜/활동 접근은 존재 여부를 노출하지 않고 안전한 404로 처리한다.
- private memo, provider raw response, follow-up body 전체, meeting note raw text는 response summary에 넣지 않는다.
- mutation은 transaction 계약을 문서와 코드에 맞춘다.
- FE는 API 응답에 없는 summary/count를 임의로 만들지 않는다.
- request/response body가 있는 API는 JSON 예시를 포함한다.
- 비즈니스 로직은 `COMMON/BUSINESS-LOGIC.md`와 충돌하지 않아야 한다.

## 4. 관련 문서

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN/COMMON/API-SPEC/README.md`
