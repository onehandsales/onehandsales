# PEN UI 05 API Change Tracker

## 목적

이 문서는 `/Users/user/Sales_b2c/UX Design/onehand_sales.pen` 기준 UI 리디자인 과정에서,
현재 백엔드 API 계약을 기준선으로 두고 어떤 항목이 바뀌어야 할 가능성이 있는지 추적하기 위한 문서다.

사용 목적:
- 현재 BE 계약의 baseline을 기록한다.
- 프론트 임시 매핑 항목과 실제 API 변경 항목을 분리한다.
- 변경 후보를 `유지 / 확장 / 신규 / 미확정`으로 추적한다.
- Codex / Claude / 사람 작업자가 중간에 바뀌어도 API 변경 논의를 이어갈 수 있게 한다.

관련 문서:
- [PEN_UI_02_BACKEND_IMPACT.md](</Users/user/Sales_b2c/UX Design/PEN_UI_02_BACKEND_IMPACT.md>)
- [PEN_UI_03_COMMON_DECISIONS.md](</Users/user/Sales_b2c/UX Design/PEN_UI_03_COMMON_DECISIONS.md>)
- [PEN_UI_04_IMPLEMENTATION_LOG.md](</Users/user/Sales_b2c/UX Design/PEN_UI_04_IMPLEMENTATION_LOG.md>)

---

## 상태 정의

- `유지`: 현재 API 계약을 그대로 유지
- `프론트 매핑`: API는 그대로 두고 프론트에서 임시 매핑
- `응답 확장`: 기존 endpoint는 유지하되 필드/집계 추가
- `신규 API`: 새 endpoint 또는 전용 endpoint 필요
- `백엔드 변경`: enum/DTO/DB/도메인 규칙 자체 변경 필요
- `미확정`: 아직 합의 안 됨

---

## 현재 기준선

현재 기준선은 `2026-06-16` 시점의 `BE/src/modules/*`, `BE/prisma/schema.prisma`, `FE/user-web/src/app/router/router.tsx`, `FE/user-web/src/features/*` 구현이다.

주요 확인 범위:
- controller endpoint
- response mapper
- request DTO
- 공통 error rule

주의:
- 2026-06-11 baseline으로 작성된 아래 상세 항목 중 일부는 역사 기록으로 남아 있다.
- 실제 구현 판단은 이 섹션의 2026-06-16 현재 계약 정정을 우선한다.

## 0. 2026-06-16 현재 계약 정정

### 구현 완료 Backend 모듈

- `auth`
- `user`
- `company`
- `contact`
- `product`
- `deal`
- `schedule`
- `meeting-note`

### 현재 미구현 Backend 모듈

- `business-card`
- `import-export` generic job
- `notification`
- `trash`
- `search`
- Admin 운영 조회/감사/민감 원문 API

### Deal 계약 정정

- Deal stage는 FE/BE 모두 6단계 코드 계약을 사용한다.
- 현재 코드:
  - `INITIAL_CONTACT` — 초기 접촉
  - `NEEDS_CHECK` — 니즈 확인
  - `PROPOSAL_QUOTE` — 제안/견적
  - `NEGOTIATION` — 협상
  - `WON` — 성사
  - `LOST` — 실패
- 딜 목록 응답은 `pageSize=10`, `totalCount`, `totalPages` 기반 page-number pagination이다.
- 딜 목록 query는 `page`, `search`, `dealStatus`, `sort`만 받는다.
- 딜 목록 검색은 `dealName`만 대상으로 한다.
- 딜 목록 정렬 select label은 `최신순`, `금액 높은순`, `금액 낮은 순`, `마감일순`이다.
- 딜 목록 정렬 code는 `createdAtDesc`, `dealCostDesc`, `dealCostAsc`, `expectedEndDateAsc`다.
- 과거 문서의 `IN_DISCUSSION`, `NEEDS_ANALYSIS`, `PROPOSAL`, `hasNext` 기반 딜 목록 계약은 현재 User Web/Backend 기준이 아니다.

### Page List Pagination 정정

- 회사/담당자/제품/딜/회의록 목록 페이지네이션은 `totalPages`, `totalCount`를 사용한다.
- 회사/담당자/제품/딜/회의록 목록 page size는 10개 단위다.
- 공용 `Pagination`에 `hasNext`를 넘기지 않는다.
- `hasNext`는 회사/담당자/제품 상세 메모 로그처럼 cursor 기반 incremental loading에서만 사용한다.

### Company/Contact/Product 목록 필터 정정

- 회사 목록은 `GET /api/company-fields`, `GET /api/company-regions` 전체 조회 결과를 select 옵션으로 사용한다.
- 담당자 목록은 `GET /api/contact-departments`, `GET /api/contact-job-grades` 전체 조회 결과를 select 옵션으로 사용한다.
- 제품 목록은 `GET /api/product-categories`, `GET /api/product-statuses` 전체 조회 결과를 select 옵션으로 사용한다.
- 목록 페이지에서는 위 옵션 테이블의 생성/삭제 UI를 노출하지 않는다.
- 생성/삭제 API는 Backend와 feature API client에 남아 있지만, 목록 페이지 필터 UX와 분리한다.
- 회사 목록 정렬 code는 `createdAtDesc`, `contactCountDesc`, `contactCountAsc`, `dealCountDesc`, `dealCountAsc`다.
- 담당자 목록 정렬 code는 `createdAtDesc`, `usernameAsc`다.
- 제품 목록 정렬 code는 `createdAtDesc`, `dealCountDesc`, `dealCountAsc`다.

### MeetingNote 계약 정정

- 수동 MeetingNote Backend API는 구현 완료 상태다.
- 현재 endpoint:
  - `GET /api/meeting-notes`
  - `GET /api/meeting-notes/filter-companies`
  - `GET /api/meeting-notes/filter-contacts`
  - `GET /api/meeting-notes/:meetingNoteId`
  - `POST /api/meeting-notes`
  - `PATCH /api/meeting-notes/:meetingNoteId`
- 현재 scope 밖:
  - AI/STT generate
  - delete/restore
  - Admin raw access
  - request `rawText`
  - request `timeZone`
  - 단일 request `dealId`
  - `stageText`
  - DealActivity 자동 생성

### Navigation/UI 상태 정정

- `/` 홈은 실제 대시보드 화면이다. 기존 API 조합으로 오늘 일정, 진행 딜, 마감 임박, 최근 회의록, 빠른 실행, 최근 활동을 표시한다.
- 딜 파이프라인은 `/deals`에서 운영한다.
- `Import`, `휴지통`은 라우트와 feature가 남아 있어도 sidebar에서는 숨김 처리되어 있다.

---

## 1. Deal API

### 현재 endpoint

- `GET /api/deals`
- `GET /api/deals/stage-counts`
- `GET /api/deals/export/xlsx`
- `GET /api/deals/company-options`
- `GET /api/deals/contact-options`
- `GET /api/deals/product-options`
- `GET /api/deals/:dealId`
- `POST /api/deals`
- `PATCH /api/deals/:dealId`
- `GET /api/deals/:dealId/following-action-logs`
- `POST /api/deals/:dealId/following-action-logs`
- `PATCH /api/deals/:dealId/following-action-logs/:followingActionLogId`
- `GET /api/deals/:dealId/memo-logs`
- `POST /api/deals/:dealId/memo-logs`
- `PATCH /api/deals/:dealId/memo-logs/:memoLogId`

### 현재 주요 query / body 규칙

#### ListDealsDto

- `page`
- `search`
- `dealStatus`
- `sort`

현재 `dealStatus` 허용값:
- `INITIAL_CONTACT`
- `NEEDS_CHECK`
- `PROPOSAL_QUOTE`
- `NEGOTIATION`
- `WON`
- `LOST`

현재 `sort` 허용값:
- `createdAtDesc` — 최신순
- `dealCostDesc` — 금액 높은순
- `dealCostAsc` — 금액 낮은 순
- `expectedEndDateAsc` — 마감일순

#### CreateDealDto / UpdateDealDto

핵심 필드:
- `dealName`
- `dealCost`
- `companyId`
- `contactId`
- `productIds`
- `dealStatus`
- `followingAction` 생성 시 필수
- `expectedEndDate`

### 현재 응답 shape

목록:
- `items`
- `page`
- `pageSize`
- `totalCount`
- `totalPages`

개별 딜:
- `id`
- `dealName`
- `dealCost`
- `dealStatus`
- `dealStatusLabel`
- `expectedEndDate`
- `company`
- `contact`
- `latestFollowingAction`
- `createdAt`
- `updatedAt`

상세:
- `products`

### 변경 추적

| 항목 | 현재 상태 | 추적 상태 | 메모 |
|---|---|---|---|
| Deal stage 6단계 | 운영 중 | 유지 | FE/BE 모두 6단계 코드 계약 |
| ListDeals `dealStatus` enum | 6단계 고정 | 유지 | `INITIAL_CONTACT`, `NEEDS_CHECK`, `PROPOSAL_QUOTE`, `NEGOTIATION`, `WON`, `LOST` |
| Stage count 구조 | 6단계 기준 | 유지 | `GET /api/deals/stage-counts` |
| `nextActionStatus` 구조 | 유지 가능 | 유지 | 현재 pen과 큰 충돌 없음 |
| 딜 상세 복합 응답 | 재사용 가능 | 유지 | desktop panel / mobile detail 공유 가능 |
| 모바일 홈 aggregate | 없음 | 신규 API 후보 | 호출량 많아질 수 있음 |
| quick create 후보 검색 | 기존 조합 사용 가능 | 미확정 | 필요 시 신규 API 후보 |

---

## 2. Company / Contact / Product API

### 현재 endpoint 성격

- 목록 / 생성 / 상세 / 수정
- 삭제 / 복구는 현재 Company/Contact/Product 기본 API 기준이 아니며 후속 범위다.
- 로그 목록 / 생성 / 수정 / 삭제
- 제품은 connection 생성/삭제 포함

### 현재 응답 특징

- 현재 기본 응답은 pagination/detail 요약 중심이며, soft delete 필드를 공통 baseline으로 보지 않는다.
- 목록은 pagination 공통 구조 사용
- detail은 요약 count 또는 연결 정보 포함

### 변경 추적

| 항목 | 현재 상태 | 추적 상태 | 메모 |
|---|---|---|---|
| 목록 pagination | 공통 구조 | 유지 | 프론트 재사용 쉬움 |
| 카드형 리스트용 summary | 일부 부족 가능 | 응답 확장 후보 | 디자인 확정 후 판단 |
| inline create candidate search | 부분적으로 훅 조합 가능 | 미확정 | quick create UX 따라 달라짐 |
| 제품 connection UX | 기존 구조 있음 | 유지 우선 | 1차 범위 밖 |

---

## 3. Schedule API

### 현재 endpoint

- `GET /api/schedules`
- `GET /api/schedules/deal-options`
- `POST /api/schedules`
- `GET /api/schedules/:scheduleId`
- `PATCH /api/schedules/:scheduleId`
- `DELETE /api/schedules/:scheduleId`

### 현재 query / body 규칙

#### ListSchedulesDto

- `view`: `month` 또는 `week`
- `baseDate`: `YYYY-MM-DD`
- `timeZone`: optional IANA timezone

#### CreateScheduleDto / UpdateScheduleDto

- `scheduleTitle`
- `startAt`
- `endAt`
- `timeZone`
- `location`
- `memo`
- `dealIds`

### 현재 응답 shape

일정:
- `id`
- `scheduleTitle`
- `startAt`
- `endAt`
- `timeZone`
- `location`
- `memo`
- `deals`
- `createdAt`
- `updatedAt`

목록:
- `items`

### 변경 추적

| 항목 | 현재 상태 | 추적 상태 | 메모 |
|---|---|---|---|
| month/week 조회 | 존재 | 유지 | 단일 `GET /api/schedules`에서 `view`, `baseDate`, `timeZone`으로 처리 |
| deal 다중 연결 | 존재 | 유지 | `ScheduleDeal` N:M |
| 주간 보고서 화면 | FE 구현 | 유지 | `/schedules/week` 라우트에서 동일 목록 API 사용 |
| 반복 일정 | 없음 | 미확정 | pen 범위 확인 필요 |

---

## 4. Meeting Note API

### 현재 endpoint

- `GET /api/meeting-notes`
- `GET /api/meeting-notes/filter-companies`
- `GET /api/meeting-notes/filter-contacts`
- `POST /api/meeting-notes`
- `GET /api/meeting-notes/:meetingNoteId`
- `PATCH /api/meeting-notes/:meetingNoteId`

### 현재 query / body 규칙

#### ListMeetingNotesDto

- `page`
- `companyIds`
- `contactIds`
- `sort`: `createdAtDesc` 또는 `meetingAtDesc`
- `meetingDate`

#### Create / Update

- `sourceType`: 현재 생성은 `MANUAL`만 허용
- `meetingLocalDateTime`
- `details`
- `nextPlan`
- `requiredAction`
- `companies`
- `contacts`
- `products`
- `deals`

### 변경 추적

| 항목 | 현재 상태 | 추적 상태 | 메모 |
|---|---|---|---|
| 수동 회의록 CRUD | 존재 | 유지 | 현재 User Web 기준 |
| 회사/담당자 필터 | 존재 | 유지 | `filter-companies`, `filter-contacts` |
| 회사/담당자/제품/딜 snapshot 연결 | 존재 | 유지 | 생성/수정 transaction 안에서 교체 |
| AI generate flow | 없음 | 후속 | OpenAI/STT 범위 |
| 삭제/복구 | 없음 | 후속 | 현재 API 없음 |

---

## 5. Import / Export API

### 현재 상태

범용 Import/Export job Backend module은 현재 없다. User Web에는 `/import`, `/export` 라우트와 `features/import-export` API client/type/schema가 남아 있지만 실제 Backend endpoint와 연결된 완료 기능으로 보지 않는다.

Company, Contact, Product, Deal의 도메인별 xlsx export는 각각 구현되어 있으며 범용 ExportJob과 별개다.

### 과거 후보 endpoint

#### Import
- `POST /api/imports`
- `POST /api/imports/:importJobId/map`
- `PATCH /api/imports/:importJobId/mapping`
- `POST /api/imports/:importJobId/confirm`
- `GET /api/imports/:importJobId`

#### Export
- `POST /api/exports`
- `GET /api/exports/:exportJobId`
- `GET /api/exports/:exportJobId/download`

### 현재 query / body 규칙

#### CreateImportJobDto

- `targetType`

#### UpdateImportMappingDto

- `mapping`

#### ConfirmImportJobDto

- `confirm`

#### CreateExportJobDto

- `targetType`
- `format`
- `includeSensitiveData`
- `sensitiveConfirm`
- `filters`

### 변경 추적

| 항목 | 현재 상태 | 추적 상태 | 메모 |
|---|---|---|---|
| job 기반 흐름 | Backend 없음 | 신규 API 후보 | FE feature만 존재 |
| 도메인별 xlsx export | 존재 | 유지 | Company/Contact/Product/Deal |
| import mapping | Backend 없음 | 신규 API 후보 | 2차 범위 |

---

## 6. Notification / Search / Trash / Business Card

### Notification

현재 상태:
- User Web feature/page/API client는 존재한다.
- Backend `notification` module과 controller endpoint는 현재 없다.

추적:

| 항목 | 현재 상태 | 추적 상태 | 메모 |
|---|---|---|---|
| unreadCount | Backend 없음 | 신규 API 후보 | bell badge에 필요 |
| settings / browser push | Backend 없음 | 신규 API 후보 | 2차 범위 |

### Search

현재 상태:
- User Web `search` feature와 GlobalSearch UI는 존재한다.
- Backend `search` module과 controller endpoint는 현재 없다.

추적:

| 항목 | 현재 상태 | 추적 상태 | 메모 |
|---|---|---|---|
| grouped result | Backend 없음 | 신규 API 후보 | global search에 필요 |
| suggestion endpoint | 없음 | 신규 API 후보 | 필요 시 |

### Trash

현재 상태:
- User Web `/trash` route와 feature는 존재한다.
- Backend `trash` module, soft delete 기반 휴지통, restore/permanent delete API는 현재 없다.

추적:

| 항목 | 현재 상태 | 추적 상태 | 메모 |
|---|---|---|---|
| 기본 흐름 | Backend 없음 | 신규 API 후보 | 2차 범위 |

### Business Card

현재 상태:
- User Web `/business-cards`, `/contacts/scan`, `features/business-card`는 존재한다.
- Backend `business-card` module과 OCR endpoint는 현재 없다.

추적:

| 항목 | 현재 상태 | 추적 상태 | 메모 |
|---|---|---|---|
| OCR 상태 흐름 | Backend 없음 | 신규 API 후보 | 2차 범위 |
| 후보 회사 응답 | Backend 없음 | 신규 API 후보 | UX 맞춤 정도 확인 필요 |

---

## 7. 공통 에러 / 계약 규칙

### 현재 기준

- 공통 에러 응답:
  - `statusCode`
  - `error`
  - `message`

- 삭제된 리소스:
  - read: `410`
  - write/action: `409`

- soft delete 필드:
  - `deletedAt`, `permanentDeleteAt`는 현재 core domain 공통 응답 기준이 아니다.
  - Trash/restore/permanent delete backend scope에서 다시 확정한다.

- 대부분의 날짜:
  - ISO string

### 변경 추적

| 항목 | 현재 상태 | 추적 상태 | 메모 |
|---|---|---|---|
| error envelope | 유지 | 유지 | 프론트 에러 처리 이미 맞춰짐 |
| deleted resource semantics | 유지 | 유지 | 프론트 공용 유틸 사용 중 |
| pagination envelope | 유지 | 유지 | 이미 FE 공용화 완료 |

---

## 8. 신규 API / 응답 확장 후보 목록

### 신규 API 후보

- mobile home aggregate endpoint
- stage metadata endpoint
- quick create candidate search endpoint
- navigation badge count endpoint
- unified global search suggestion endpoint

### 응답 확장 후보

- deal list summary fields
- deal detail extra summary
- company/contact/product card summary
- notification visual category/priority
- schedule rendering helper fields

---

## 9. 우선순위 높은 변경 후보

### 우선순위 높음

- deal stage 전략 결정
- mobile home aggregate 필요 여부
- quick create 후보 탐색 전략

### 우선순위 중간

- navigation badge count
- schedule rendering helper fields

### 우선순위 낮음

- import/export 고도화
- meeting note AI flow 조정
- business card UX 미세 조정

---

## 10. 변경 로그

### 2026-06-11 baseline 작성

- 작성자: Codex
- 기준: 현재 `BE/src/modules/*` 코드
- 상태:
  - baseline 정리 완료
  - 실제 API 변경 미착수

### 2026-06-15 현재 계약 정정

- 작성자: Codex
- 기준:
  - `BE/src/modules`
  - `FE/user-web/src/features`
  - `FE/user-web/src/components/ui/pagination.tsx`
- 상태:
  - Deal 6단계 FE/BE 계약 반영 상태를 현재 기준으로 정정
  - MeetingNote 수동 API 구현 완료 상태 반영
  - 회사/담당자/제품/딜/회의록 목록 pagination을 `totalPages` 기준으로 정정
  - 회사/담당자 목록 필터 옵션을 제품 category/status select와 같은 전체 옵션 조회 방식으로 정정
  - `/` 홈 준비중 상태와 Import/휴지통 navigation 숨김 상태 반영

### 2026-06-16 현재 계약 정정

- 작성자: Codex
- 기준:
  - `BE/src/modules`
  - `BE/prisma/schema.prisma`
  - `FE/user-web/src/app/router/router.tsx`
  - `FE/user-web/src/features`
- 상태:
  - `/` 홈이 Schedule/Deal/MeetingNote API 조합 대시보드로 구현된 상태를 반영
  - Deal 목록 API와 정렬 select 계약을 실제 `page/search/dealStatus/sort` 구조로 정정
  - Schedule 목록 API를 실제 `view/baseDate/timeZone` 구조로 정정
  - MeetingNote 수동 API 계약을 실제 endpoint와 snapshot 연결 구조로 정정
  - BusinessCard/Import-Export/Notification/Search/Trash는 FE feature만 있고 Backend module이 없는 상태로 정정

---

## 11. 최종 정리

현재 백엔드 계약은 핵심 도메인 User Web 구현에 충분한 기반이 있다.
다만 아래 항목은 후속 UX 고도화에서 다시 부딪힐 가능성이 높다.

1. Admin 운영 조회 API 필요 여부
2. quick create에서 inline 생성 / 후보 탐색 전략
3. BusinessCard/Import-Export/Notification/Search/Trash Backend module 계획
4. 목록 컨트롤 버튼과 필터 컴포넌트 공통화 범위

따라서 이 문서는 “지금 무엇을 바로 바꿀지”보다,
“무엇을 baseline으로 유지하고, 어떤 항목을 change candidate로 추적할지”를 명확히 하기 위한 기준 문서로 사용한다.
