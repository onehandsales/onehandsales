# 활성 TODO Backend API / Frontend 작업 재검토

> 2026-06-14 기준 이 문서의 검토 대상이던 활성 계획들은 FE/BE 구현 완료 확인 후 `TODO/DONE`으로 이동했다. 이 문서는 완료 이동 근거로 보관한다.

## 1. 목적

이 문서는 `TODO/DONE`을 제외한 활성 TODO 계획을 기준으로 Backend API 구현 상태와 Frontend 남은 작업 목적을 재검토한 결과를 남긴다.

Frontend 작업자는 이 문서를 먼저 보고 어떤 API가 준비되어 있는지, 각 화면에서 어떤 사용자 행동을 우선 구현해야 하는지 확인한다.

## 2. 검토 기준

- 검토일: 2026-06-15 (최초 2026-06-12, 업데이트)
- 검토 대상: `TODO/DONE/**`을 제외한 `TODO` 활성 계획
- Backend 구현 대조 기준: `BE/src/modules/auth`, `BE/src/modules/user`, `BE/src/modules/company`, `BE/src/modules/contact`, `BE/src/modules/product`, `BE/src/modules/deal`, `BE/src/modules/schedule`, `BE/src/modules/meeting-note`, `BE/prisma/schema.prisma`
- API 명세 기준: 각 활성 계획의 `COMMON/API-SPEC/*`
- 문서 기준: `AGENT/AGENT_USAGE_RULES.md`, `AGENT/PM_AGENT/CONVENTION/PLANNING_REVIEW_CHECKLIST.md`, `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`, `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`

## 3. 결론

- Auth/User, Company, Contact, Product 기본 Backend API는 구현되어 있다.
- 추가 유지보수 범위인 Company `contactCount`, 회사 연결 Contact 전체 목록, Company/Contact/Product xlsx export API도 구현되어 있다.
- Deal Backend API와 Prisma Deal 모델은 구현되어 있으며, API 계약은 `DEAL_DOMAIN_PLAN` 기준 `implemented` 상태다. 단, 신규 스키마 재설계 후 local DB migration drift로 실제 DB 미적용 상태 (2026-06-13 기준).
- Schedule Backend API와 User Web 일정 화면은 `TODO/DONE/SCHEDULE_DOMAIN_PLAN` 기준 구현 완료됐다.
- MeetingNote 수동 Backend API와 User Web 회의록 화면은 `TODO/DONE/MEETING_NOTE_MANUAL_PLAN` 기준 구현 완료됐다.
- BusinessCard OCR / Import / Export / Notification / Trash / Search는 User Web feature/page가 존재하지만, 현재 `BE/src/modules` 기준 독립 Backend module은 없다. 후속 작업 전에 실제 API 계약과 구현 여부를 재검토한다.
- 활성 TODO의 API 명세는 request 형태, response 형태, 내부 비즈니스 로직, DB 연결, transaction, observability, 에러, FE/BE 처리 기준을 포함한다.
- **2026-06-15 기준 FE/BE 완료 판정**: Auth/User, Company, Contact, Product, Deal, Schedule, MeetingNote, Additional Work 범위는 Backend API와 Frontend 반영이 모두 완료되어 `TODO/DONE` 보관 대상이다.
- 상세 현황은 `UX Design/FE_DOMAIN_COMPLETION_STATUS.md` 참조.

## 4. 활성 계획별 Backend API 상태

| 계획 | Backend API 상태 | 구현 근거 | API 명세 상태 | 남은 주요 작업 |
|---|---|---|---|---|
| `AUTH_FE_INTEGRATION_PLAN` | 완료 | `BE/src/modules/auth`, `BE/src/modules/user` | `AUTH_USER_API_DETAIL.md`에 request/response/비즈니스 로직 작성됨 | User/Admin Web 실제 인증 연동, 설정 화면 |
| `COMPANY_DOMAIN_PLAN` | 완료 | `BE/src/modules/company` | `COMPANY_API.md`, `COMPANY_API_DETAIL.md` 기준 `implemented` | 회사 목록/생성/상세/메모 화면, `contactCount`, 연결 Contact 목록, xlsx export 표시 |
| `CONTACT_DOMAIN_PLAN` | 완료 | `BE/src/modules/contact` | `CONTACT_API.md`, `CONTACT_API_DETAIL.md` 기준 `implemented` | 거래처 목록/생성/상세/메모 화면, xlsx export 표시 |
| `PRODUCT_DOMAIN_PLAN` | 완료 | `BE/src/modules/product` | `PRODUCT_API.md`, `PRODUCT_API_DETAIL.md` 기준 `implemented` | 제품 목록/생성/상세/메모 화면, xlsx export 표시 |
| `DEAL_DOMAIN_PLAN` | 완료 | `BE/src/modules/deal`, Prisma `Deal`, `DealProduct`, `DealFollowingActionLog`, `DealMemoLog` | `DEAL_API.md`, `DEAL_API_DETAIL.md` 기준 `implemented` | User Web 딜 목록 split view, 상세 제품 목록, 로그, xlsx export 연동 |
| `SCHEDULE_DOMAIN_PLAN` | 완료 | `BE/src/modules/schedule`, Prisma `Schedule`, `ScheduleDeal` | `SCHEDULE_API.md` 기준 `implemented` | User Web 월간/주간 일정 화면, 생성/수정/삭제, 딜 연결 |
| `MEETING_NOTE_MANUAL_PLAN` | 완료 | `BE/src/modules/meeting-note`, Prisma `MeetingNote*` | `MEETING_NOTE_API.md` 기준 `implemented` | User Web 회의록 목록/상세/생성/수정, 회사/담당자 필터 |
| `ADDITIONAL_WORK_PLAN` | 완료 | 추가 API G01-G12 구현 완료 | 12개 모두 `implemented` | User Web dealCount/연결 딜 목록 반영 |

## 5. Backend API 구성 확인

### Auth/User

구현 API:

- `GET /api/auth/providers`
- `POST /api/auth/exchange`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/me`
- `GET /admin/api/me`
- `GET /api/users/me/profile`
- `PATCH /api/users/me/profile`
- `GET /api/users/me/devices`

Frontend 목적:

- mock-only 인증을 Supabase Auth와 Backend token exchange 흐름으로 교체한다.
- User Web은 `/api/me`, Admin Web은 `/admin/api/me`로 route guard를 판단한다.
- 설정 화면에서 개인 정보 조회/이름 수정/등록 기기 조회를 제공한다.

### Company

구현 API:

- `GET /api/companies`
- `GET /api/companies/export/xlsx`
- `GET /api/companies/:companyId/contacts`
- `GET /api/companies/:companyId/deals`
- `GET /api/companies/:companyId`
- `POST /api/companies`
- `PATCH /api/companies/:companyId`
- `GET /api/company-fields`
- `POST /api/company-fields`
- `DELETE /api/company-fields/:fieldId`
- `GET /api/company-regions`
- `POST /api/company-regions`
- `DELETE /api/company-regions/:regionId`
- `POST /api/companies/:companyId/memo-logs`
- `GET /api/companies/:companyId/memo-logs`
- `PATCH /api/companies/:companyId/memo-logs/:memoLogId`
- `POST /api/companies/:companyId/private-memo-logs`
- `GET /api/companies/:companyId/private-memo-logs`
- `PATCH /api/companies/:companyId/private-memo-logs/:privateMemoLogId`

Frontend 목적:

- 회사 목록에서 회사명 검색, 회사 분야/지역 필터, 20개 단위 페이지네이션을 제공한다.
- 목록 item의 `contactCount`를 `거래처 수`로, `dealCount`를 `딜 수`로 표시한다.
- 회사 단건 화면에서 기본 정보와 메모를 보여주고, 보조 영역에 `GET /api/companies/:companyId/contacts`와 `GET /api/companies/:companyId/deals` 결과를 표시한다.
- 회사 목록 내보내기 버튼은 현재 검색어와 필터를 `GET /api/companies/export/xlsx`에 전달하되 `page`는 제거한다.

### Contact

구현 API:

- `GET /api/contacts`
- `GET /api/contacts/export/xlsx`
- `GET /api/contacts/company-options`
- `GET /api/contacts/:contactId`
- `GET /api/contacts/:contactId/deals`
- `POST /api/contacts`
- `PATCH /api/contacts/:contactId`
- `GET /api/contact-job-grades`
- `POST /api/contact-job-grades`
- `DELETE /api/contact-job-grades/:jobGradeId`
- `GET /api/contact-departments`
- `POST /api/contact-departments`
- `DELETE /api/contact-departments/:departmentId`
- `POST /api/contacts/:contactId/memo-logs`
- `GET /api/contacts/:contactId/memo-logs`
- `PATCH /api/contacts/:contactId/memo-logs/:memoLogId`
- `POST /api/contacts/:contactId/private-memo-logs`
- `GET /api/contacts/:contactId/private-memo-logs`
- `PATCH /api/contacts/:contactId/private-memo-logs/:privateMemoLogId`

Frontend 목적:

- 거래처 목록에서 이름 검색, 회사/부서/직급 필터, 20개 단위 페이지네이션을 제공한다.
- 거래처 생성은 회사 선택을 필수로 하고, `contactMemo`는 초기 일반 메모 로그 입력이라는 의미로 표시한다.
- 거래처 상세/수정, 일반 메모 로그, 개인 비밀 메모 로그를 API 계약에 맞게 구현한다.
- 거래처 상세에서 `GET /api/contacts/:contactId/deals` 결과를 연결 딜 목록으로 표시한다.
- 거래처 목록 내보내기 버튼은 현재 검색어와 필터를 `GET /api/contacts/export/xlsx`에 전달하되 `page`는 제거한다.

### Product

구현 API:

- `GET /api/products`
- `GET /api/products/export/xlsx`
- `GET /api/products/:productId`
- `GET /api/products/:productId/deals`
- `POST /api/products`
- `PATCH /api/products/:productId`
- `GET /api/product-categories`
- `POST /api/product-categories`
- `DELETE /api/product-categories/:categoryId`
- `GET /api/product-statuses`
- `POST /api/product-statuses`
- `DELETE /api/product-statuses/:statusId`
- `POST /api/products/:productId/memo-logs`
- `GET /api/products/:productId/memo-logs`
- `PATCH /api/products/:productId/memo-logs/:memoLogId`
- `POST /api/products/:productId/private-memo-logs`
- `GET /api/products/:productId/private-memo-logs`
- `PATCH /api/products/:productId/private-memo-logs/:privateMemoLogId`

Frontend 목적:

- 제품 목록에서 제품명 검색, 카테고리/상태 필터, 20개 단위 페이지네이션을 제공한다.
- 목록에는 제품명, 카테고리, 상태, 등록일, `dealCount`를 표시하고 가격과 최근수정일은 표시하지 않는다.
- 제품 목록 정렬에는 `sort=dealCountDesc` 딜 많은 순을 반영한다.
- 제품 생성/상세/수정, 일반 메모 로그, 개인 비밀 메모 로그를 API 계약에 맞게 구현한다.
- 제품 상세에서 `GET /api/products/:productId/deals` 결과를 연결 딜 목록으로 표시한다.
- 제품 목록 내보내기 버튼은 현재 검색어, 필터, 정렬을 `GET /api/products/export/xlsx`에 전달하되 `page`는 제거한다.

### Deal

구현 API:

- `GET /api/deals/stage-counts`
- `GET /api/deals`
- `GET /api/deals/:dealId`
- `POST /api/deals`
- `PATCH /api/deals/:dealId`
- `GET /api/deals/company-options`
- `GET /api/deals/contact-options`
- `GET /api/deals/product-options`
- `GET /api/deals/export/xlsx`
- `GET /api/deals/:dealId/following-action-logs`
- `POST /api/deals/:dealId/following-action-logs`
- `PATCH /api/deals/:dealId/following-action-logs/:followingActionLogId`
- `GET /api/deals/:dealId/memo-logs`
- `POST /api/deals/:dealId/memo-logs`
- `PATCH /api/deals/:dealId/memo-logs/:memoLogId`

Frontend 목적:

- 딜 목록 페이지에서 단계별 개수, 20개 페이지네이션 목록, 선택 딜 상세를 split view로 제공한다.
- 목록은 딜 이름 검색, 딜 상태 필터, 최신순/금액 높은 순/금액 낮은 순/마감일 빠른 순 정렬을 지원한다.
- FK 데이터는 nested object로 받은 뒤 회사명, 거래처명/부서, 제품명을 화면에서 조합한다.
- 목록에는 제품을 표시하지 않고 상세에는 `products` 배열의 제품 목록을 표시한다.
- 생성/수정에서는 `productIds` 배열을 보내 딜-제품 연결을 관리한다.
- 다음 행동 로그와 메모 로그는 상세 영역에서 등록일 DESC로 표시한다.
- 딜 export는 현재 검색/필터/정렬을 반영하되 page를 제거하고, id/제품/최근수정일 컬럼을 포함하지 않는다.

### Schedule

구현 API:

- `GET /api/schedules/deal-options`
- `GET /api/schedules`
- `GET /api/schedules/:scheduleId`
- `POST /api/schedules`
- `PATCH /api/schedules/:scheduleId`
- `DELETE /api/schedules/:scheduleId`

Frontend 목적:

- 월간/주간 일정 화면에서 사용자 timezone 기준으로 일정을 조회한다.
- 일정 생성/수정에서 딜 N:M 연결을 관리한다.
- 삭제는 현재 soft delete가 아니라 일정과 연결 row를 transaction으로 삭제한다.

### MeetingNote

구현 API:

- `GET /api/meeting-notes`
- `GET /api/meeting-notes/filter-companies`
- `GET /api/meeting-notes/filter-contacts`
- `GET /api/meeting-notes/:meetingNoteId`
- `POST /api/meeting-notes`
- `PATCH /api/meeting-notes/:meetingNoteId`

Frontend 목적:

- 회의록 목록/상세/생성/수정 화면을 수동 MeetingNote API 계약으로 연결한다.
- 목록은 `page`, `companyIds`, `contactIds`, `sort`, `totalPages` 기준으로 동작한다.
- 생성/수정 request는 `timeZone`, `rawText`, `stageText`, 단일 `dealId`를 보내지 않는다.
- 회사/담당자는 필수 연결, 제품/딜은 선택 연결로 처리한다.

## 6. API 명세 완성도 점검

| API 명세 범위 | Request 형태 | Response 형태 | 내부 비즈니스 로직 | 판정 |
|---|---|---|---|---|
| Auth/User | path/query/header/body 구분 있음 | DTO 이름, status, body, 필드 설명 있음 | 인증, device, session, role 흐름 있음 | 통과 |
| Company | 검색/필터/페이지/본문 요청 구분 있음 | 목록/상세/옵션/메모/export 응답 설명 있음 | ownership, option 검증, memo transaction, export 흐름 있음 | 통과 |
| Contact | 검색/필터/페이지/본문 요청 구분 있음 | 목록/상세/옵션/메모/export 응답 설명 있음 | 회사 필수, ownership, option 검증, memo transaction, export 흐름 있음 | 통과 |
| Product | 검색/필터/페이지/본문 요청 구분 있음 | 목록/상세/옵션/메모/export 응답 설명 있음 | ownership, option 검증, memo transaction, export 흐름 있음 | 통과 |
| Deal | path/query/body 구분 있음 | 목록/상세/옵션/로그/export 응답 설명 있음 | ownership, FK 검증, 생성 transaction, export 흐름 있음 | 통과 |
| Schedule | path/query/body 구분 있음 | 목록/상세/딜 옵션 응답 설명 있음 | ownership, timezone 변환, 생성/수정/삭제 transaction 흐름 있음 | 통과 |
| MeetingNote | path/query/body 구분 있음 | 목록 summary/상세 snapshot/필터 옵션 응답 설명 있음 | ownership, FK 검증, N:N snapshot, 생성/수정 transaction 흐름 있음 | 통과 |
| Additional Work | 12개 request/response 작성됨 | `contactCount`, `dealCount`, 연결 Contact/Deal 목록, xlsx binary 응답 설명 있음 | 검색/필터 반영, page 제외, ownership, 정렬, 파일 컬럼 기준 있음 | 통과 |

## 7. Frontend 우선 작업

1. Auth 연동을 먼저 처리한다.
2. User Web API client가 Backend App access token, refresh-on-401, blob 다운로드를 처리할 수 있게 한다.
3. Company 화면을 구현하면서 목록 검색/필터/페이지네이션, `contactCount`, 연결 Contact 목록, 회사 xlsx export를 함께 반영한다.
4. Contact 화면을 구현하면서 목록 검색/필터/페이지네이션, 옵션 관리, 메모, 거래처 xlsx export를 반영한다.
5. Product 화면을 구현하면서 목록 검색/필터/페이지네이션, 옵션 관리, 메모, 제품 xlsx export를 반영한다.
6. Additional Work G06-G12로 구현된 회사/거래처/제품 상세의 연결 딜 목록과 회사/제품 `dealCount`를 반영한다.
7. Deal User Web 딜 목록 split view, 상세, 생성/수정, 로그, xlsx export를 반영한다.
8. Schedule User Web 월간/주간 일정 화면과 MeetingNote User Web 회의록 화면은 `TODO/DONE` 기준으로 Backend API 연동 완료 상태를 유지한다.

## 8. 주의사항

- Export API는 JSON이 아니라 xlsx binary 응답이다.
- Export API에는 현재 목록의 검색어와 필터만 전달하고 `page`는 전달하지 않는다.
- Company 목록의 `totalCount`는 회사 개수다. `contactCount`는 각 회사 item의 연결 거래처 수다.
- Company 목록의 `dealCount`는 각 회사에 연결된 딜 수다.
- Product 목록의 `dealCount`는 `DealProduct` 기준으로 해당 제품이 포함된 딜 수다.
- 회사 단건 응답 자체는 변경하지 않는다. 연결 Contact 목록은 별도 API로 조회한다.
- 회사/거래처/제품 단건 응답 자체는 변경하지 않는다. 연결 Deal 목록은 별도 API로 조회한다.
- Deal export에는 id, 제품, 최근수정일을 포함하지 않는다.
- Deal 상태는 DB enum이 아니라 코드 단 enum이며 DB에는 영어 code로 저장한다.
- `TODO/DONE`은 완료 이력 보관 공간이므로 현재 남은 작업 판정에 포함하지 않는다.

## 9. 관련 문서

- `TODO/README.md`
- `TODO/DONE/AUTH_FE_INTEGRATION_PLAN/COMMON/API-SPEC/AUTH_USER_API_DETAIL.md`
- `TODO/DONE/COMPANY_DOMAIN_PLAN/COMMON/API-SPEC/COMPANY_API_DETAIL.md`
- `TODO/DONE/CONTACT_DOMAIN_PLAN/COMMON/API-SPEC/CONTACT_API_DETAIL.md`
- `TODO/DONE/PRODUCT_DOMAIN_PLAN/COMMON/API-SPEC/PRODUCT_API_DETAIL.md`
- `TODO/DONE/DEAL_DOMAIN_PLAN/COMMON/API-SPEC/DEAL_API.md`
- `TODO/DONE/DEAL_DOMAIN_PLAN/COMMON/API-SPEC/DEAL_API_DETAIL.md`
- `TODO/DONE/SCHEDULE_DOMAIN_PLAN/COMMON/API-SPEC/SCHEDULE_API.md`
- `TODO/DONE/MEETING_NOTE_MANUAL_PLAN/COMMON/API-SPEC/MEETING_NOTE_API.md`
- `TODO/DONE/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/COMPANY_LIST_CONTACT_COUNT_API.md`
- `TODO/DONE/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/COMPANY_CONTACT_LIST_API.md`
- `TODO/DONE/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/COMPANY_EXPORT_XLSX_API.md`
- `TODO/DONE/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/CONTACT_EXPORT_XLSX_API.md`
- `TODO/DONE/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/PRODUCT_EXPORT_XLSX_API.md`
- `TODO/DONE/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/COMPANY_LIST_DEAL_COUNT_API.md`
- `TODO/DONE/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/COMPANY_EXPORT_DEAL_COUNT_API.md`
- `TODO/DONE/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/COMPANY_DEAL_LIST_API.md`
- `TODO/DONE/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/CONTACT_DEAL_LIST_API.md`
- `TODO/DONE/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/PRODUCT_LIST_DEAL_COUNT_SORT_API.md`
- `TODO/DONE/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/PRODUCT_EXPORT_DEAL_COUNT_API.md`
- `TODO/DONE/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/PRODUCT_DEAL_LIST_API.md`
