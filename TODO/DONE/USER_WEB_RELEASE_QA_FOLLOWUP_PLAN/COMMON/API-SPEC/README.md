# API Spec

이번 `USER_WEB_RELEASE_QA_FOLLOWUP_PLAN`의 기본 API 변경 상태: 없음.

## 1. 원칙

- G01~G03은 FE QA, 테스트 설정, 문서 정리 중심이다. 새 Backend API를 추가하지 않는다.
- G04는 기존 API의 ownership isolation을 검증한다. API shape를 바꾸는 작업이 아니다.
- G05는 DB/Prisma 운영 정합성 QA다. schema 변경을 전제로 하지 않는다.
- G06에서 S0/S1/S2 수정 때문에 API 변경이 필요하다고 판정되면 구현 전에 이 폴더에 API 계약을 작성하고 계약 상태를 최소 `confirmed`로 만든다.
- G07은 후속 BE/API 후보 분리 작업이다. G07에서 후보를 정리하더라도 이번 계획의 구현 범위로 확정하지 않는다.

## 2. 이번 계획에서 새 API 없이 확인할 계약

- User Web은 `/api/*`만 호출한다.
- User Web은 `/admin/api/*`를 호출하지 않는다.
- 인증 없는 보호 API 호출은 401이어야 한다.
- 일반 사용자 token의 Admin API 호출은 403 또는 접근 차단이어야 한다.
- 목록/Search/Trash/Export API는 현재 사용자 `userId` ownership을 지켜야 한다.
- 삭제된 리소스, 복구 conflict, provider failure, validation error는 사용자에게 내부 구현 정보를 노출하지 않아야 한다.

## 3. G04에서 확인할 API 그룹

- Company: list, detail, export xlsx
- Contact: list, detail, export xlsx
- Product: list, detail, export xlsx
- Deal: list, detail, export xlsx
- Schedule: list, detail
- MeetingNote: list, detail
- Search: `GET /api/search`
- Trash: list, detail, restore
- Auth/User: `/api/me`, logout/refresh smoke
- Admin guard: `/admin/api/*` 접근 차단 smoke

## 4. 후속 API 후보

아래는 UX/UI 공통 QA에서 분리된 후보이며, 이번 품질 QA의 기본 구현 범위가 아니다.

| 후보 | 이유 | 이번 계획 처리 |
|---|---|---|
| Deal list `products` summary | 딜 목록에서 제품 linked record를 1급 정보로 보여줄 수 없음 | `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`에서 draft 후보로 관리 |
| Contact list `dealCount` | 담당자 목록에서 연결 딜 수를 직접 표시할 수 없음 | `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`에서 draft 후보로 관리 |
| Company/Contact/Product latest summary | 실제 최신 Memo/활동/다음 행동 summary가 없음 | `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`에서 draft 후보로 관리 |
| MeetingNote next/latest summary | 회의록 목록에서 추출 action summary가 없음 | `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`에서 draft 후보로 관리 |
| BusinessCard provider failure contract | 사용자 copy와 운영 log 분리가 더 명확할 수 있음 | `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`에서 draft 후보로 관리 |
| ImportJob persistence/resume API | 확정 전 job이 in-memory라 서버 재시작에 취약함 | `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`에서 draft 후보로 관리 |
| Trash private memo backend restriction | FE는 복구 전 원문을 가리지만 API 응답 제한이 더 강한 보안 경계임 | `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`에서 draft 후보로 관리 |
| Page size 15 contract 정리 | FE 단독 숫자 변경 금지, BE 상수/API/test 문서 동시 변경 필요 | `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`에서 draft 후보로 관리 |

## 5. API 변경이 필요한 경우 작성 기준

새 API 또는 response 변경이 필요한 이슈가 나오면 아래 문서를 먼저 따른다.

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`

계약 문서에는 request, response, business flow, DB 연결, transaction, observability, error, FE/BE 처리 기준을 모두 적는다.
