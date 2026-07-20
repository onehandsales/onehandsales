# API TODO

## 1. 이번 계획의 API 변경 상태

기본 상태: 새 API 변경 없음.

G04는 기존 API의 ownership isolation을 검증한다. G06에서 S0/S1/S2 수정 때문에 API 변경이 필요하다고 판정되면 `COMMON/API-SPEC`에 계약을 먼저 추가한다.

## 2. G04에서 확인할 API

| 영역 | 확인 항목 |
|---|---|
| Company | 사용자 A token으로 사용자 B 회사 목록/detail/export 접근 불가 |
| Contact | 사용자 A token으로 사용자 B 담당자 목록/detail/export 접근 불가 |
| Product | 사용자 A token으로 사용자 B 제품 목록/detail/export 접근 불가 |
| Deal | 사용자 A token으로 사용자 B 딜 목록/detail/export 접근 불가 |
| Schedule | 사용자 A token으로 사용자 B 일정 목록/detail 접근 불가 |
| MeetingNote | 사용자 A token으로 사용자 B 회의록 목록/detail 접근 불가 |
| Search | 사용자 A 검색 결과에 사용자 B 데이터 미포함 |
| Trash | 사용자 A 휴지통 목록/detail/restore에서 사용자 B 삭제 데이터 접근 불가 |
| Admin API | 일반 사용자 token으로 `/admin/api/*` 접근 차단 |

## 3. 테스트 기준

- BE 자동 테스트는 필수다.
- 로컬 DB 조건이 안전하게 충족될 때만 실제 HTTP smoke를 추가한다.
- 사용자 A/B fixture는 테스트 안에서 매번 생성하고 정리한다. 기존 seed/실계정 데이터는 사용하지 않는다.
- 목록/search/export는 사용자 B fixture 문자열이 사용자 A 응답에 없는지 확인한다.
- detail/restore/update/delete 직접 접근은 `404`를 우선 기대값으로 둔다.
- Admin API 일반 사용자 접근은 `403`을 기대값으로 둔다.
- 직접 HTTP smoke를 실행하면 실제 token 값은 기록하지 않는다.
- XLSX export 검증은 사용자 B fixture 문자열이 결과 파일에 없는지 확인한다. parser/helper가 있으면 workbook cell까지 파싱한다.
- 권한 없음과 소유권 없음은 client 응답에서 다른 사용자 리소스 존재 여부를 노출하지 않는다.

## 3A. G04 endpoint 기대값

| 영역 | list/search/export | direct read | mutation smoke |
|---|---|---|---|
| Company | B fixture 미포함 | B id `GET /api/companies/:companyId` -> `404` | B id `PATCH/DELETE` -> `404` |
| Contact | B fixture 미포함 | B id `GET /api/contacts/:contactId` -> `404` | B id `PATCH/DELETE` -> `404` |
| Product | B fixture 미포함 | B id `GET /api/products/:productId` -> `404` | B id `PATCH/DELETE` -> `404` |
| Deal | B fixture 미포함 | B id `GET /api/deals/:dealId` -> `404` | B id `PATCH/DELETE` -> `404` |
| Schedule | B fixture 미포함 | B id `GET /api/schedules/:scheduleId` -> `404` | B id `PATCH/DELETE` -> `404` |
| MeetingNote | B fixture 미포함 | B id `GET /api/meeting-notes/:meetingNoteId` -> `404` | B id `PATCH/DELETE` -> `404` |
| Search | `GET /api/search?q=RQA004-B` 결과 없음 | N/A | N/A |
| Trash | B 삭제 데이터 미포함 | B target detail -> `404` | B target restore -> `404` |
| Admin API | N/A | `GET /admin/api/me` with USER -> `403` | N/A |

## 4. 후속 API 후보

아래 후보는 G07에서 분리한다. 이번 계획에서 구현하지 않는다.

- Deal list `products` summary
- Contact list `dealCount`
- Company/Contact/Product latest memo/activity/next action summary
- MeetingNote next/latest summary
- BusinessCard provider failure code/message contract
- ImportJob persistence/resume API
- Trash private memo backend response restriction
- Page size 15 contract 정리

## 5. API 변경이 필요한 bug가 발견된 경우

1. `COMMON/ISSUE-LOG.md`에 S0/S1/S2로 기록한다.
2. `COMMON/API-SPEC`에 API 계약 문서를 작성한다.
3. 계약 상태를 최소 `confirmed`로 만든다.
4. request/response/business flow/DB/transaction/observability/error/FE-BE 처리 기준을 채운다.
5. BE 구현과 FE client 변경을 같은 goal 안에서 검증한다.
