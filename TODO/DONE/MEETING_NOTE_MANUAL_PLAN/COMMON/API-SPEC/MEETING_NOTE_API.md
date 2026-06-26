# Meeting Note API Spec

## 1. 공통 계약

- 계약 상태: `confirmed`
- 소비자: User Web
- 호환성: 신규 API. 기존 User Web의 단일 `dealId`, `stageText`, `hasNext`, AI generate 계약은 교체 대상이다.
- 인증: Backend App access token 필요
- 권한: 현재 사용자 본인 데이터만 접근 가능
- Admin API: 이번 범위 제외
- 삭제 API: 이번 범위 제외
- AI/STT API: 이번 범위 제외
- audit log: 없음

## 2. 공통 시간 계약

- request의 `meetingLocalDateTime`: `YYYY-MM-DDTHH:mm:ss` 또는 `YYYY-MM-DDTHH:mm` local date-time string
- request에서는 `timeZone`을 받지 않는다.
- Backend는 인증 사용자의 `User.timeZone`을 사용한다.
- DB의 `meetingAt`: `meetingLocalDateTime + currentUser.timeZone`을 해석한 UTC instant
- DB의 `MeetingNote.timeZone`: UTC 변환에 사용한 `currentUser.timeZone` snapshot
- response의 `meetingAt`, `createdAt`, `updatedAt`: ISO 8601 UTC string
- 상세 response의 `meetingLocalDateTime`: `meetingAt`을 `MeetingNote.timeZone` 기준으로 변환한 local date-time string

## 3. 공통 DTO

```ts
type MeetingNoteCompanyInput = {
  companyId?: string;
  companyName?: string;
  companyField?: string;
  companyRegion?: string;
};

type MeetingNoteContactInput = {
  contactId?: string;
  companyId?: string;
  contactUsername?: string;
  contactEmail?: string;
  contactMobile?: string;
  companyName?: string;
  department?: string;
  jobGrade?: string;
};

type MeetingNoteProductInput = {
  productId?: string;
  productName?: string;
  productPrice?: number;
  productCategory?: string;
  productStatus?: string;
};

type MeetingNoteDealInput = {
  dealId: string;
};

type MeetingNoteListSummaryResponse = {
  label: string;
  count: number;
};

type MeetingNoteListItemResponse = {
  id: string;
  title: string;
  meetingAt: string | null;
  sourceType: "MANUAL" | "TEXT_AI" | "STT_AI";
  companies: MeetingNoteListSummaryResponse;
  contacts: MeetingNoteListSummaryResponse;
  products: MeetingNoteListSummaryResponse;
  deals: MeetingNoteListSummaryResponse;
  createdAt: string;
};

type MeetingNotePageResponse = {
  items: MeetingNoteListItemResponse[];
  page: number;
  pageSize: 10;
  totalCount: number;
  totalPages: number;
};

type MeetingNoteCompanyDetailResponse = {
  id: string;
  companyId: string | null;
  company: {
    id: string;
    companyName: string;
    companyField: { id: string; field: string };
    companyRegion: { id: string; region: string };
  } | null;
  companyNameSnapshot: string;
  companyFieldSnapshot: string | null;
  companyRegionSnapshot: string | null;
  createdAt: string;
};

type MeetingNoteContactDetailResponse = {
  id: string;
  contactId: string | null;
  companyId: string | null;
  contact: {
    id: string;
    contactUsername: string;
    contactEmail: string;
    contactMobile: string;
    contactDepartment: { id: string; departmentName: string };
    contactJobGrade: { id: string; jobGradeName: string };
  } | null;
  contactUsernameSnapshot: string;
  contactEmailSnapshot: string | null;
  contactMobileSnapshot: string | null;
  companyNameSnapshot: string | null;
  departmentSnapshot: string | null;
  jobGradeSnapshot: string | null;
  createdAt: string;
};

type MeetingNoteProductDetailResponse = {
  id: string;
  productId: string | null;
  product: {
    id: string;
    productName: string;
    productPrice: number;
    productCategory: { id: string; categoryName: string };
    productStatus: { id: string; statusName: string };
  } | null;
  productNameSnapshot: string;
  productPriceSnapshot: number | null;
  productCategorySnapshot: string | null;
  productStatusSnapshot: string | null;
  createdAt: string;
};

type MeetingNoteDealDetailResponse = {
  id: string;
  dealId: string;
  deal: {
    id: string;
    dealName: string;
    dealStatus: string;
    dealCost: number;
    dealExpectedEndDate: string;
  };
  dealNameSnapshot: string;
  dealStatusSnapshot: string;
  dealCostSnapshot: number;
  dealExpectedEndDateSnapshot: string;
  createdAt: string;
};
```

## 4. API 목록

| Method | Path | API 식별자 | 설명 |
|---|---|---|---|
| `GET` | `/api/meeting-notes` | `ListMeetingNotes` | 회의록 목록 페이지네이션 |
| `GET` | `/api/meeting-notes/filter-companies` | `ListMeetingNoteFilterCompanies` | 회의록 목록 필터용 회사 전체 목록 |
| `GET` | `/api/meeting-notes/filter-contacts` | `ListMeetingNoteFilterContacts` | 회의록 목록 필터용 담당자 전체 목록 |
| `GET` | `/api/meeting-notes/:meetingNoteId` | `GetMeetingNote` | 회의록 단건 상세 조회 |
| `POST` | `/api/meeting-notes` | `CreateMeetingNote` | 수동 회의록 생성 |
| `PATCH` | `/api/meeting-notes/:meetingNoteId` | `UpdateMeetingNote` | 회의록 수정 |

`filter-companies`, `filter-contacts`는 `:meetingNoteId`보다 controller에서 먼저 선언한다.

## 5. GET /api/meeting-notes

- API 이름: 회의록 목록 페이지네이션 API
- API 식별자: `ListMeetingNotes`
- Request 이름: `ListMeetingNotesQuery`
- Response 이름: `MeetingNotePageResponse`
- Transaction: 없음
- Observability: `meeting_note.listed`, audit log 없음, request id 사용, PII redaction

### Query

| 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---:|---|---|
| `page` | number | 아니오 | 정수, 1 이상 | 기본값 1 |
| `companyIds` | string[] | 아니오 | UUID 배열 | 반복 query로 전송. 같은 그룹 OR |
| `contactIds` | string[] | 아니오 | UUID 배열 | 반복 query로 전송. 같은 그룹 OR |
| `sort` | string | 아니오 | `createdAtDesc`, `meetingAtDesc` | 기본값 `createdAtDesc` |
| `search` | string | 아니오 | trim, 최대 100자 | 회의록 제목 검색 |
| `meetingDate` | string | 아니오 | `YYYY-MM-DD` | 사용자 timezone 기준 회의일 필터 |

FE는 `pageSize`를 보내지 않는다. 서버는 `pageSize=10`으로 고정한다.

### 비즈니스 로직

1. AuthGuard로 현재 사용자를 확인한다.
2. query를 validation하고 `page` 기본값을 1로 정한다.
3. `companyIds`, `contactIds`가 있으면 현재 사용자 소유 리소스인지 검증한다.
4. `MeetingNote.userId = currentUser.id`를 기본 조건으로 둔다.
5. `search`가 있으면 `MeetingNote.title contains search` 조건으로 적용한다.
6. `companyIds`는 같은 그룹 안에서 OR 조건으로 적용한다.
7. `contactIds`는 같은 그룹 안에서 OR 조건으로 적용한다.
8. 회사 필터와 담당자 필터를 동시에 쓰면 두 그룹은 AND 조건으로 조합한다.
9. `meetingDate`가 있으면 사용자 timezone 기준 해당 날짜의 회의 시각 범위로 필터링한다.
10. `sort=createdAtDesc`이면 `createdAt DESC`, `id DESC`로 정렬한다.
11. `sort=meetingAtDesc`이면 `meetingAt DESC NULLS LAST`, `createdAt DESC`, `id DESC`로 정렬한다.
12. `MeetingNote.id` 기준으로 page 대상 id를 먼저 구해 join 중복을 막는다.
13. page id에 대한 연결 row를 조회해 summary를 만든다.

### Response

- Status: `200 OK`
- Body: 있음

| 필드 | 타입 | nullable | 설명 |
|---|---|---:|---|
| `items` | `MeetingNoteListItemResponse[]` | 아니오 | 회의록 목록 |
| `items[].id` | string | 아니오 | 회의록 ID |
| `items[].title` | string | 아니오 | 회의록 제목 |
| `items[].meetingAt` | string | 예 | 회의 일시 UTC ISO string |
| `items[].sourceType` | string | 아니오 | 현재 구현은 `MANUAL` |
| `items[].companies.label` | string | 아니오 | 회사 요약 label. 없으면 빈 문자열 |
| `items[].companies.count` | number | 아니오 | 연결 회사 수 |
| `items[].contacts.label` | string | 아니오 | 담당자 요약 label. 없으면 빈 문자열 |
| `items[].contacts.count` | number | 아니오 | 연결 담당자 수 |
| `items[].products.label` | string | 아니오 | 제품 요약 label. 없으면 빈 문자열 |
| `items[].products.count` | number | 아니오 | 연결 제품 수 |
| `items[].deals.label` | string | 아니오 | 딜 요약 label. 없으면 빈 문자열 |
| `items[].deals.count` | number | 아니오 | 연결 딜 수 |
| `items[].createdAt` | string | 아니오 | 등록일 ISO string |
| `page` | number | 아니오 | 현재 페이지 |
| `pageSize` | number | 아니오 | 10 |
| `totalCount` | number | 아니오 | 전체 개수 |
| `totalPages` | number | 아니오 | 전체 페이지 수 |

요약 label 규칙:

| 연결 개수 | label |
|---:|---|
| 0 | `""` |
| 1 | 첫 항목 snapshot label |
| 2 이상 | `첫 항목 외 N개` |

### 에러

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| 인증 없음 또는 invalid | `Unauthorized` | 401 | 로그인 또는 refresh | warn |
| query validation 실패 | `ValidationError` | 400 | 목록 오류 상태 | log |
| 필터 회사 없음 또는 타 사용자 회사 | `CompanyNotFound` | 404 | 필터 갱신 안내 | log |
| 필터 담당자 없음 또는 타 사용자 담당자 | `ContactNotFound` | 404 | 필터 갱신 안내 | log |

## 6. GET /api/meeting-notes/filter-companies

- API 식별자: `ListMeetingNoteFilterCompanies`
- Request 이름: `ListMeetingNoteFilterCompaniesRequest`
- Response 이름: `MeetingNoteFilterCompanyOptionListResponse`
- Transaction: 없음
- Observability: `meeting_note.filter_companies.listed`

### Response

- Status: `200 OK`

```ts
type MeetingNoteFilterCompanyOptionResponse = {
  id: string;
  companyName: string;
  createdAt: string;
};

type MeetingNoteFilterCompanyOptionListResponse = {
  items: MeetingNoteFilterCompanyOptionResponse[];
};
```

정렬은 `createdAt DESC`, `id DESC`다. 페이지네이션은 없다.

## 7. GET /api/meeting-notes/filter-contacts

- API 식별자: `ListMeetingNoteFilterContacts`
- Request 이름: `ListMeetingNoteFilterContactsRequest`
- Response 이름: `MeetingNoteFilterContactOptionListResponse`
- Transaction: 없음
- Observability: `meeting_note.filter_contacts.listed`

### Response

- Status: `200 OK`

```ts
type MeetingNoteFilterContactOptionResponse = {
  id: string;
  companyId: string | null;
  contactUsername: string;
  createdAt: string;
};

type MeetingNoteFilterContactOptionListResponse = {
  items: MeetingNoteFilterContactOptionResponse[];
};
```

정렬은 `createdAt DESC`, `id DESC`다. 페이지네이션은 없다.

## 8. GET /api/meeting-notes/:meetingNoteId

- API 식별자: `GetMeetingNote`
- Request 이름: `GetMeetingNoteRequest`
- Response 이름: `MeetingNoteDetailResponse`
- Transaction: 없음
- Observability: `meeting_note.detail_viewed`

### Path

| 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---:|---|---|
| `meetingNoteId` | string | 예 | UUID | 회의록 ID |

### Response

- Status: `200 OK`

```ts
type MeetingNoteDetailResponse = {
  id: string;
  sourceType: "MANUAL" | "TEXT_AI" | "STT_AI";
  title: string;
  meetingAt: string | null;
  meetingLocalDateTime: string | null;
  timeZone: string;
  details: string;
  nextPlan: string | null;
  requiredAction: string | null;
  rawText: string | null;
  companies: MeetingNoteCompanyDetailResponse[];
  contacts: MeetingNoteContactDetailResponse[];
  products: MeetingNoteProductDetailResponse[];
  deals: MeetingNoteDealDetailResponse[];
  createdAt: string;
  updatedAt: string;
};
```

상세 연결 response는 snapshot 필드와 현재 엔티티 정보를 함께 반환한다. FK가 nullable이거나 원본 엔티티가 없어졌으면 현재 엔티티 정보는 `null`이고 snapshot은 유지한다.

### 에러

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| 인증 없음 또는 invalid | `Unauthorized` | 401 | 로그인 또는 refresh | warn |
| path validation 실패 | `ValidationError` | 400 | 목록 이동 또는 오류 안내 | log |
| 회의록 없음 또는 타 사용자 회의록 | `MeetingNoteNotFound` | 404 | 목록 이동 또는 삭제된 항목 안내 | warn |

## 9. POST /api/meeting-notes

- API 식별자: `CreateMeetingNote`
- Request 이름: `CreateMeetingNoteRequest`
- Response 이름: `MeetingNoteDetailResponse`
- Transaction: 필요
- Observability: `meeting_note.created`

### Body

| 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---:|---|---|
| `sourceType` | string | 아니오 | 없으면 `MANUAL`, 있으면 `MANUAL`만 허용 | 생성 방식 |
| `title` | string | 예 | trim 후 1~100자 | 회의록 제목 |
| `meetingLocalDateTime` | string | 아니오 | local date-time | 회의 일시 |
| `details` | string | 예 | trim 후 1자 이상 | 상세 내용 |
| `nextPlan` | string | 아니오 | trim | 향후 계획 |
| `requiredAction` | string | 아니오 | trim | 필요 액션 |
| `companies` | `MeetingNoteCompanyInput[]` | 예 | 배열 길이 1 이상 | 연결 회사 |
| `contacts` | `MeetingNoteContactInput[]` | 예 | 배열 길이 1 이상 | 연결 담당자 |
| `products` | `MeetingNoteProductInput[]` | 아니오 | 배열. 없으면 `[]` | 연결 제품 |
| `deals` | `MeetingNoteDealInput[]` | 아니오 | 배열. 없으면 `[]` | 연결 딜 |

연결 input validation:

| 필드 | 규칙 |
|---|---|
| `companies[].companyId` | 있으면 현재 사용자 소유 Company여야 한다. |
| `companies[].companyName` | `companyId`가 없으면 필수다. |
| `contacts[].contactId` | 있으면 현재 사용자 소유 Contact여야 한다. |
| `contacts[].contactUsername` | `contactId`가 없으면 필수다. |
| `products[].productId` | 있으면 현재 사용자 소유 Product여야 한다. |
| `products[].productName` | `productId`가 없으면 필수다. |
| `products[].productPrice` | 있으면 0 이상의 정수다. |
| `deals[].dealId` | 필수 UUID이며 현재 사용자 소유 Deal이어야 한다. |

### 비즈니스 로직

1. AuthGuard로 현재 사용자를 확인한다.
2. request body를 validation한다.
3. `sourceType`이 있으면 `MANUAL`인지 확인한다.
4. `title`을 trim하고 빈 값과 100자 초과를 차단한다.
5. `companies`, `contacts`가 각각 1개 이상인지 확인한다.
6. 현재 사용자의 `User.timeZone`을 조회한다.
7. `meetingLocalDateTime`이 있으면 `User.timeZone` 기준으로 `meetingAt`을 계산한다.
8. 연결 대상 FK가 있으면 ownership을 검증한다.
9. transaction 안에서 `MeetingNote`를 생성한다.
10. transaction 안에서 회사/담당자/제품/딜 연결 row를 생성한다.
11. FK가 있는 연결은 현재 엔티티 값을 우선 snapshot으로 저장한다.
12. FK가 없는 회사/담당자/제품은 request 입력을 snapshot-only 항목으로 저장한다.
13. `MeetingNoteDeal`은 Deal 현재 값을 snapshot으로 저장한다.
14. transaction 밖에서 상세 response를 구성한다.

### Response

- Status: `201 Created`
- Body: `MeetingNoteDetailResponse`

### 에러

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| 인증 없음 또는 invalid | `Unauthorized` | 401 | 로그인 또는 refresh | warn |
| 요청 validation 실패 | `ValidationError` | 400 | field error 또는 toast | log |
| 연결 회사 없음 또는 타 사용자 회사 | `CompanyNotFound` | 404 | 회사 선택값 갱신 안내 | log |
| 연결 담당자 없음 또는 타 사용자 담당자 | `ContactNotFound` | 404 | 담당자 선택값 갱신 안내 | log |
| 연결 제품 없음 또는 타 사용자 제품 | `ProductNotFound` | 404 | 제품 선택값 갱신 안내 | log |
| 연결 딜 없음 또는 타 사용자 딜 | `DealNotFound` | 404 | 딜 선택값 갱신 안내 | log |

## 10. PATCH /api/meeting-notes/:meetingNoteId

- API 식별자: `UpdateMeetingNote`
- Request 이름: `UpdateMeetingNoteRequest`
- Response 이름: `MeetingNoteDetailResponse`
- Transaction: 필요
- Observability: `meeting_note.updated`

### Path

| 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---:|---|---|
| `meetingNoteId` | string | 예 | UUID | 회의록 ID |

### Body

| 필드 | 타입 | 필수 | validation | 설명 |
|---|---|---:|---|---|
| `title` | string | 아니오 | trim 후 1~100자 | 회의록 제목 |
| `meetingLocalDateTime` | string | 아니오 | local date-time 또는 null | 회의 일시. null이면 비움 |
| `details` | string | 아니오 | trim 후 1자 이상 | 상세 내용 |
| `nextPlan` | string | 아니오 | trim 또는 null | 향후 계획 |
| `requiredAction` | string | 아니오 | trim 또는 null | 필요 액션 |
| `companies` | `MeetingNoteCompanyInput[]` | 아니오 | 포함되면 배열 길이 1 이상 | 회사 연결 전체 교체 |
| `contacts` | `MeetingNoteContactInput[]` | 아니오 | 포함되면 배열 길이 1 이상 | 담당자 연결 전체 교체 |
| `products` | `MeetingNoteProductInput[]` | 아니오 | 포함되면 전체 교체. 빈 배열 허용 | 제품 연결 전체 교체 |
| `deals` | `MeetingNoteDealInput[]` | 아니오 | 포함되면 전체 교체. 빈 배열 허용 | 딜 연결 전체 교체 |

배열 필드 의미:

- 빠짐: 기존 연결 유지
- 빈 배열: 해당 연결 전체 제거. 단 `companies`, `contacts`는 빈 배열 불가

### 비즈니스 로직

1. AuthGuard로 현재 사용자를 확인한다.
2. path와 body를 validation한다.
3. 회의록 존재 여부와 사용자 소유권을 확인한다.
4. 본문 필드가 request에 있으면 수정한다.
5. `meetingLocalDateTime`이 request에 있으면 현재 사용자의 `User.timeZone` 기준으로 `meetingAt`을 다시 계산하고 `MeetingNote.timeZone`을 갱신한다.
6. 연결 배열이 포함된 유형은 기존 연결을 삭제하고 새 연결을 생성한다.
7. 새 연결 row에는 생성 API와 동일한 snapshot 규칙을 적용한다.
8. 전체 수정은 transaction으로 처리한다.

### Response

- Status: `200 OK`
- Body: `MeetingNoteDetailResponse`

### 에러

| 상황 | 에러 | HTTP | FE 처리 | log level |
|---|---|---:|---|---|
| 인증 없음 또는 invalid | `Unauthorized` | 401 | 로그인 또는 refresh | warn |
| 요청 validation 실패 | `ValidationError` | 400 | field error 또는 toast | log |
| 회의록 없음 또는 타 사용자 회의록 | `MeetingNoteNotFound` | 404 | 목록 이동 또는 삭제된 항목 안내 | warn |
| 연결 회사 없음 또는 타 사용자 회사 | `CompanyNotFound` | 404 | 회사 선택값 갱신 안내 | log |
| 연결 담당자 없음 또는 타 사용자 담당자 | `ContactNotFound` | 404 | 담당자 선택값 갱신 안내 | log |
| 연결 제품 없음 또는 타 사용자 제품 | `ProductNotFound` | 404 | 제품 선택값 갱신 안내 | log |
| 연결 딜 없음 또는 타 사용자 딜 | `DealNotFound` | 404 | 딜 선택값 갱신 안내 | log |

## 11. Redaction

아래 원문은 structured log에 남기지 않는다.

- `details`
- `nextPlan`
- `requiredAction`
- `rawText`
- 연락처 email/mobile

## 12. 후속 API

아래 API는 이번 구현에서 만들지 않는다.

- `POST /api/meeting-notes/generate`
- `POST /api/meeting-notes/transcribe`
- `POST /api/meeting-notes/:meetingNoteId/link-deal`
- `DELETE /api/meeting-notes/:meetingNoteId`
- `POST /api/meeting-notes/:meetingNoteId/restore`
