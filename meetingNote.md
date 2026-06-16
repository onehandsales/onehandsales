# MeetingNote 기획 및 API 명세

## 1. 목표

회의록 기능은 영업 미팅 내용을 기록하고, 관련 회사, 담당자, 제품, 딜을 연결해 영업 맥락을 관리하는 기능이다.

회의록은 최종적으로 다음 세 가지 방식으로 만들 수 있다.

1. 사용자가 직접 구조화된 회의록을 작성한다.
2. 사용자가 회의 원문 텍스트를 입력하고 AI가 회의록 초안을 만든다.
3. 사용자가 음성을 STT로 텍스트 변환한 뒤, 그 텍스트를 AI가 회의록 초안으로 정리한다.

이번 구현에서는 1번 직접 작성만 API로 제공한다.
AI Text와 STT API는 아직 생성하지 않으며, 후속 구현 범위로 둔다.
후속 AI/STT 결과도 바로 저장하지 않고, 항상 사용자가 결과를 확인하고 수정한 뒤 최종 저장한다.

## 2. 이번 구현 범위

### 포함

- 회의록 목록 페이지네이션
- 회의록 단건 상세 조회
- 회의록 직접 생성
- 회의록 수정
- 회의록과 회사/담당자/제품/딜 다중 연결

### 제외

- 삭제/휴지통/복구
- 관리자 페이지
- Admin API
- 캘린더 연동
- 회의록 템플릿 커스터마이즈
- 텍스트 기반 AI 초안 생성 API
- STT 기반 음성 텍스트 변환 API
- STT 결과 텍스트를 AI 초안 생성에 사용하는 API
- 음성 파일 장기 보관
- VTT 자막 파일 저장
- 원문 텍스트 암호화

삭제/휴지통은 나중에 모든 도메인 공통 정책으로 한 번에 처리한다.

## 3. 주요 결정

### 3.1 회의록과 딜은 N:N

한 번의 회의에서 여러 딜을 동시에 논의할 수 있고 1개의 딜은 여러 회의에서 논의 될 수 있다. 따라서 회의록과 딜은 N:N 관계다.

```txt
MeetingNote N:N Deal
```

중간 테이블은 `MeetingNoteDeal`을 사용한다.

### 3.2 회의록과 회사/담당자/제품도 N:N

한 회의에 여러 회사, 여러 담당자, 여러 제품이 관련될 수 있다. 또한 한 회사가 여러 회의록에 반영될 수 있고, 한 담당자가 여러 회의록에 반영될 수 있다. 그리고 한 제품이 여러 회의에 연결될 수 있다.

```txt
MeetingNote N:N Company
MeetingNote N:N Contact
MeetingNote N:N Product
```

각각 다음 연결 테이블을 사용한다.

```txt
MeetingNoteCompany
MeetingNoteContact
MeetingNoteProduct
MeetingNoteDeal
```

### 3.3 snapshot 필드 사용

연결 테이블에는 snapshot 필드를 둔다.

예를 들어 회의 당시 담당자 부서가 “설비팀”이었는데 나중에 “구매팀”으로 바뀌어도, 회의록에는 당시 기록이 남아야 한다.

```txt
FK = 현재 실제 데이터로 이동하기 위한 연결
snapshot = 회의 당시 표시값 보존
```

### 3.4 진행단계는 MeetingNote에서 제거

기존 기획에는 `stageText`가 있었지만, 진행단계는 회의록 자체의 속성이 아니라 연결된 딜의 상태다.

회의록 하나가 여러 딜과 연결될 수 있으므로 단일 `stageText`는 의미가 모호하다. 대신 `MeetingNoteDeal`에 딜 상태 snapshot을 저장한다.

### 3.5 시간 처리

회의 일시는 사용자가 입력하는 업무 시간이다.

따라서 `meetingAt`은 UTC instant로 저장하고, 사용자가 입력한 현지 시간의 의미를 복원하기 위해 저장 시점의 사용자 `User.timeZone`을 `MeetingNote.timeZone`에 함께 저장한다.

```txt
meetingLocalDateTime + currentUser.timeZone -> meetingAt UTC instant
```

예:

```json
{
  "meetingLocalDateTime": "2026-06-15T14:30:00"
}
```

Backend는 현재 사용자의 `User.timeZone`이 `Asia/Seoul`이면 위 값을 `meetingAt = 2026-06-15T05:30:00.000Z`로 저장하고, `MeetingNote.timeZone = "Asia/Seoul"`을 함께 저장한다.

### 3.6 원문 텍스트 저장

이번 구현에서는 원문 텍스트를 암호화하지 않는다.

이번 구현에서는 AI Text/STT API를 제공하지 않으므로 생성/수정 request에서 `rawText`를 받지 않는다.
`rawText` 컬럼은 후속 AI/STT 구현에서 AI 작성 또는 STT 작성에 사용된 원문 텍스트를 저장하기 위한 예약 필드다.
직접 작성(`MANUAL`)은 원문 텍스트가 없으므로 `rawText`는 nullable이다.

원문 암호화는 나중에 공통 보안 정책으로 도입할 수 있도록 저장/조회 지점을 서비스 계층에서 분리해 둔다.

## 4. 유저 플로우

### 4.1 직접 작성

```txt
회의록 목록
-> 새 회의록
-> 직접 작성 선택
-> 회의 일시, 상세내용, 향후계획, 필요액션 입력
-> 회사/담당자/제품/딜 연결
-> 저장
```

### 4.2 텍스트 AI 작성

후속 범위다. 이번 구현에서는 텍스트 AI 작성 API를 생성하지 않는다.

### 4.3 STT AI 작성

후속 범위다. 이번 구현에서는 STT 변환 API와 STT 결과 기반 AI 초안 생성 API를 생성하지 않는다.

## 5. 테이블 구조

### 5.1 enum

```prisma
enum MeetingNoteSourceType {
  MANUAL
  TEXT_AI
  STT_AI
}
```

이번 구현의 생성 API는 `MANUAL`만 생성한다.
`TEXT_AI`, `STT_AI`는 후속 AI/STT 구현을 위한 예약 값이다.

### 5.2 MeetingNote

```prisma
model MeetingNote {
  id                String                @id @default(uuid()) @db.Uuid
  userId            String                @db.Uuid
  sourceType        MeetingNoteSourceType @default(MANUAL)

  meetingAt         DateTime              @db.Timestamptz(3)
  timeZone          String                @default("Asia/Seoul")

  details           String
  nextPlan          String
  requiredAction    String

  rawText           String

  createdAt         DateTime              @default(now()) @db.Timestamptz(3)
  updatedAt         DateTime              @updatedAt @db.Timestamptz(3)

  user              User                  @relation(fields: [userId], references: [id])
  companies         MeetingNoteCompany[]
  contacts          MeetingNoteContact[]
  products          MeetingNoteProduct[]
  deals             MeetingNoteDeal[]

  @@index([userId, meetingAt])
  @@index([userId, createdAt])
}
```

필드 설명:

| 필드 | 설명 |
| --- | --- |
| `sourceType` | 직접 작성, 텍스트 AI, STT AI 구분 |
| `meetingAt` | 회의 일시 UTC instant |
| `timeZone` | UTC 변환에 사용한 사용자 `User.timeZone` snapshot |
| `details` | 회의 상세 내용 |
| `nextPlan` | 향후 계획 |
| `requiredAction` | 필요 액션 |
| `rawText` | AI/STT 작성에 사용한 원문 텍스트 |

### 5.3 MeetingNoteCompany

```prisma
model MeetingNoteCompany {
  id                    String      @id @default(uuid()) @db.Uuid
  userId                String      @db.Uuid
  meetingNoteId         String      @db.Uuid
  companyId             String      @db.Uuid
  companyNameSnapshot   String
  companyFieldSnapshot  String
  companyRegionSnapshot String
  createdAt             DateTime    @default(now()) @db.Timestamptz(3)

  user                  User        @relation(fields: [userId], references: [id])
  meetingNote           MeetingNote @relation(fields: [meetingNoteId], references: [id])
  company               Company?    @relation(fields: [companyId], references: [id])

  @@index([userId, meetingNoteId])
  @@index([userId, companyId])
}
```

`companyId`는 nullable이다. 아직 등록되지 않은 회사도 회의록에 이름만 기록할 수 있어야 한다.

### 5.4 MeetingNoteContact

```prisma
model MeetingNoteContact {
  id                      String      @id @default(uuid()) @db.Uuid
  userId                  String      @db.Uuid
  meetingNoteId           String      @db.Uuid
  contactId               String      @db.Uuid
  companyId               String      @db.Uuid

  contactUsernameSnapshot String
  contactEmailSnapshot    String
  contactMobileSnapshot   String
  companyNameSnapshot     String
  departmentSnapshot      String
  jobGradeSnapshot        String

  createdAt               DateTime    @default(now()) @db.Timestamptz(3)

  user                    User        @relation(fields: [userId], references: [id])
  meetingNote             MeetingNote @relation(fields: [meetingNoteId], references: [id])
  contact                 Contact?    @relation(fields: [contactId], references: [id])
  company                 Company?    @relation(fields: [companyId], references: [id])

  @@index([userId, meetingNoteId])
  @@index([userId, contactId])
  @@index([userId, companyId])
}
```

`contactId`는 nullable이다. 아직 등록하지 않은 참석자도 회의록에 이름만 기록할 수 있어야 한다.

### 5.5 MeetingNoteProduct

```prisma
model MeetingNoteProduct {
  id                      String      @id @default(uuid()) @db.Uuid
  userId                  String      @db.Uuid
  meetingNoteId           String      @db.Uuid
  productId               String      @db.Uuid
  productNameSnapshot     String
  productPriceSnapshot    Int
  productCategorySnapshot String
  productStatusSnapshot   String
  createdAt               DateTime    @default(now()) @db.Timestamptz(3)

  user                    User        @relation(fields: [userId], references: [id])
  meetingNote             MeetingNote @relation(fields: [meetingNoteId], references: [id])
  product                 Product    @relation(fields: [productId], references: [id])

  @@index([userId, meetingNoteId])
  @@index([userId, productId])
}
```

`productId`는 nullable이다. 회의에서 논의한 품목이 아직 Product로 등록되지 않았을 수 있다.

### 5.6 MeetingNoteDeal

```prisma
model MeetingNoteDeal {
  id                          String      @id @default(uuid()) @db.Uuid
  userId                      String      @db.Uuid
  meetingNoteId               String      @db.Uuid
  dealId                      String      @db.Uuid

  dealNameSnapshot            String
  dealStatusSnapshot          String
  dealCostSnapshot            Int
  dealExpectedEndDateSnapshot DateTime    @db.Date

  createdAt                   DateTime    @default(now()) @db.Timestamptz(3)

  user                        User        @relation(fields: [userId], references: [id])
  meetingNote                 MeetingNote @relation(fields: [meetingNoteId], references: [id])
  deal                        Deal        @relation(fields: [dealId], references: [id])

  @@unique([meetingNoteId, dealId])
  @@index([userId, meetingNoteId])
  @@index([userId, dealId])
}
```

딜 연결은 기존 Deal에만 연결한다. 딜 없이 회의록 저장은 가능하지만, `MeetingNoteDeal` row가 생성될 때는 `dealId`가 필수다.

### 5.7 기존 모델 관계 추가

```prisma
model User {
  meetingNotes         MeetingNote[]
  meetingNoteCompanies MeetingNoteCompany[]
  meetingNoteContacts  MeetingNoteContact[]
  meetingNoteProducts  MeetingNoteProduct[]
  meetingNoteDeals     MeetingNoteDeal[]
}

model Company {
  meetingNoteCompanies MeetingNoteCompany[]
  meetingNoteContacts  MeetingNoteContact[]
}

model Contact {
  meetingNoteContacts MeetingNoteContact[]
}

model Product {
  meetingNoteProducts MeetingNoteProduct[]
}

model Deal {
  meetingNoteDeals MeetingNoteDeal[]
}
```

## 6. API 계약 공통

- 계약 상태: `confirmed`
- 소비자: User Web
- 호환성: 신규 MeetingNote API. 기존 프론트 회의록 API가 단일 딜 기준이었다면 N:N 연결 응답으로 변경 필요
- 인증: Backend App access token 필요
- 권한: 현재 사용자 본인 데이터만 접근 가능
- Admin API: 이번 범위 제외
- 삭제 API: 이번 범위 제외
- soft delete: 이번 범위 제외
- audit log: 없음

### 6.1 공통 시간 계약

- request의 `meetingLocalDateTime`: `YYYY-MM-DDTHH:mm:ss` 또는 `YYYY-MM-DDTHH:mm` local date-time string
- request에서는 `timeZone`을 받지 않는다. Backend는 인증 사용자의 `User.timeZone`을 사용한다.
- DB의 `meetingAt`: `meetingLocalDateTime + currentUser.timeZone`을 해석한 UTC instant
- DB의 `MeetingNote.timeZone`: UTC 변환에 사용한 `currentUser.timeZone` snapshot
- response의 `meetingAt`, `createdAt`, `updatedAt`: ISO 8601 UTC string
- 상세 response의 `meetingLocalDateTime`: `meetingAt`을 `timeZone` 기준으로 변환한 local date-time string
- 날짜만 필요한 값인 `dealExpectedEndDateSnapshot`은 `YYYY-MM-DD` string으로 응답한다.

### 6.2 공통 목록 페이지네이션

- 일반 페이지네이션 API는 `page`, `pageSize`, `totalCount`, `totalPages`를 반환한다.
- `pageSize`는 10으로 고정한다. FE는 `pageSize` query를 보내지 않는다.
- `hasNext`는 cursor/infinite scroll 전용이므로 회의록 목록 페이지네이션 응답에는 사용하지 않는다.

### 6.3 공통 정렬

- 목록 기본 정렬: `createdAt DESC`, `id DESC`
- 회의최신순 정렬: `meetingAt DESC NULLS LAST`, `createdAt DESC`, `id DESC`
- 연결된 회사/담당자/제품/딜 목록 정렬: `createdAt DESC`, `id DESC`
- 필터 옵션 전체 목록 정렬: `createdAt DESC`, `id DESC`

### 6.4 공통 redaction

- `rawText`, `details`, `nextPlan`, `requiredAction`, 연락처 이메일/전화번호 원문은 structured log에 남기지 않는다.
- 원문 텍스트는 이번 구현에서 암호화하지 않지만, logging 금지 대상이다.

## 7. 공통 DTO

### 7.1 Request DTO

```ts
type MeetingNoteCompanyInput = {
  companyId?: string;
  companyName: string;
  companyField?: string;
  companyRegion?: string;
};

type MeetingNoteContactInput = {
  contactId?: string;
  companyId?: string;
  contactUsername: string;
  contactEmail?: string;
  contactMobile?: string;
  companyName?: string;
  department?: string;
  jobGrade?: string;
};

type MeetingNoteProductInput = {
  productId?: string;
  productName: string;
  productPrice?: number;
  productCategory?: string;
  productStatus?: string;
};

type MeetingNoteDealInput = {
  dealId: string;
};
```

### 7.2 목록 Response DTO

```ts
type MeetingNoteListSummaryResponse = {
  label: string;
  count: number;
};

type MeetingNoteListItemResponse = {
  id: string;
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
```

### 7.3 상세 Response DTO

```ts
type MeetingNoteDetailResponse = {
  id: string;
  sourceType: "MANUAL" | "TEXT_AI" | "STT_AI";
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

### 7.4 연결 Detail DTO

```ts
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

### 7.5 필터 옵션 Response DTO

```ts
type MeetingNoteFilterCompanyOptionResponse = {
  id: string;
  companyName: string;
  createdAt: string;
};

type MeetingNoteFilterContactOptionResponse = {
  id: string;
  contactUsername: string;
  createdAt: string;
};
```

## 8. API 목록

| Method | Path | API 식별자 | 설명 |
| --- | --- | --- | --- |
| `GET` | `/api/meeting-notes` | `ListMeetingNotes` | 회의록 목록 페이지네이션 |
| `GET` | `/api/meeting-notes/filter-companies` | `ListMeetingNoteFilterCompanies` | 회의록 목록 필터용 회사 전체 목록 |
| `GET` | `/api/meeting-notes/filter-contacts` | `ListMeetingNoteFilterContacts` | 회의록 목록 필터용 담당자 전체 목록 |
| `GET` | `/api/meeting-notes/:meetingNoteId` | `GetMeetingNote` | 회의록 단건 상세 조회 |
| `POST` | `/api/meeting-notes` | `CreateMeetingNote` | 회의록 최종 생성 |
| `PATCH` | `/api/meeting-notes/:meetingNoteId` | `UpdateMeetingNote` | 회의록 수정 |

`filter-companies`, `filter-contacts`는 `:meetingNoteId` 라우트보다 controller에서 먼저 선언한다.
텍스트 기반 AI 초안 생성 API와 STT 변환 API는 이번 구현에서 생성하지 않는다.

## 9. API 상세

## 9.1 회의록 목록 페이지네이션 API

- API 이름: 회의록 목록 페이지네이션 API
- API 식별자: `ListMeetingNotes`
- 계약 상태: `confirmed`
- 소비자: User Web
- 호환성: 신규 API
- Method: `GET`
- Path: `/api/meeting-notes`
- 인증: Backend App access token 필요
- 권한: 본인 회의록만 조회
- Request 이름: `ListMeetingNotesQuery`
- Response 이름: `MeetingNotePageResponse`
- Transaction: 없음. 조회 전용.
- Observability: `meeting_note.listed`, audit log 없음, request id 사용, PII redaction.

### 목적

회의록 목록 화면에서 10개 단위 페이지네이션, 회사 다중 필터, 담당자 다중 필터, 정렬을 제공한다.

### Request

Header:

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
| --- | --- | --- | ---: | --- | --- |
| header | `Authorization` | string | 예 | `Bearer <backend_app_access_token>` | 인증 header |

Query:

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
| --- | --- | --- | ---: | --- | --- |
| query | `page` | number | 아니오 | 정수, 1 이상 | 기본값 1 |
| query | `companyIds` | string[] | 아니오 | UUID 배열 | 연결 회사 다중 선택 필터. 같은 key 반복 query로 전송 |
| query | `contactIds` | string[] | 아니오 | UUID 배열 | 연결 담당자 다중 선택 필터. 같은 key 반복 query로 전송 |
| query | `sort` | string | 아니오 | `createdAtDesc`, `meetingAtDesc` | 기본값 `createdAtDesc`. `meetingAtDesc`는 회의최신순 |

서버는 `pageSize`를 10으로 고정한다. FE는 `pageSize` query를 보내지 않는다.
검색, 제품 필터, 딜 필터, 회의일 범위 필터는 제공하지 않는다.

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. query를 validation하고 `page` 기본값을 1로 정한다.
3. `companyIds`, `contactIds`가 있으면 현재 사용자 소유 리소스인지 검증한다.
4. 기본 where 조건에 `MeetingNote.userId = currentUser.id`를 적용한다.
5. `companyIds`는 같은 그룹 안에서 OR 조건으로 적용한다.
6. `contactIds`는 같은 그룹 안에서 OR 조건으로 적용한다.
7. 회사 필터와 담당자 필터를 동시에 사용하면 두 그룹은 AND 조건으로 조합한다.
8. `sort=createdAtDesc`이면 `createdAt DESC`, `id DESC`로 정렬한다.
9. `sort=meetingAtDesc`이면 `meetingAt DESC NULLS LAST`, `createdAt DESC`, `id DESC`로 정렬한다.
10. page size 10으로 `items`, `totalCount`를 조회하고 `totalPages`를 계산한다.
11. 회사/담당자/제품/딜 연결 row는 목록 표시용으로만 조회한다.
12. 연결 요약은 각 연결 row를 `createdAt DESC`, `id DESC`로 정렬한 뒤 첫 항목 기준으로 만든다.
13. 목록 응답에는 `details`, `nextPlan`, `requiredAction`, `rawText`, `updatedAt`을 넣지 않는다.

요약 label 규칙:

| 연결 개수 | label 예시 |
| ---: | --- |
| 0 | 빈 문자열 |
| 1 | `삼성전자` |
| 2 이상 | `삼성전자 외 3개` |

### Response

- Response 이름: `MeetingNotePageResponse`
- Status: `200 OK`
- Body: 있음

| 필드 | 타입 | nullable | 설명 |
| --- | --- | ---: | --- |
| `items` | `MeetingNoteListItemResponse[]` | 아니오 | 회의록 목록 |
| `items[].id` | string | 아니오 | 회의록 ID |
| `items[].meetingAt` | string | 예 | 회의 일시 UTC ISO string |
| `items[].sourceType` | string | 아니오 | 현재 구현에서는 `MANUAL`. `TEXT_AI`, `STT_AI`는 후속 예약 값 |
| `items[].companies.label` | string | 아니오 | 회사 요약 label |
| `items[].companies.count` | number | 아니오 | 연결 회사 수 |
| `items[].contacts.label` | string | 아니오 | 담당자 요약 label |
| `items[].contacts.count` | number | 아니오 | 연결 담당자 수 |
| `items[].products.label` | string | 아니오 | 제품 요약 label |
| `items[].products.count` | number | 아니오 | 연결 제품 수 |
| `items[].deals.label` | string | 아니오 | 딜 요약 label |
| `items[].deals.count` | number | 아니오 | 연결 딜 수 |
| `items[].createdAt` | string | 아니오 | 등록일 ISO string |
| `page` | number | 아니오 | 현재 페이지 |
| `pageSize` | number | 아니오 | 10 |
| `totalCount` | number | 아니오 | 조건에 맞는 전체 회의록 수 |
| `totalPages` | number | 아니오 | 전체 페이지 수 |

예시:

```json
{
  "items": [
    {
      "id": "meeting-note-id",
      "meetingAt": "2026-06-15T05:30:00.000Z",
      "sourceType": "MANUAL",
      "companies": {
        "label": "삼성전자 외 3개",
        "count": 4
      },
      "contacts": {
        "label": "송재근 외 3개",
        "count": 4
      },
      "products": {
        "label": "HBDM4 외 2개",
        "count": 3
      },
      "deals": {
        "label": "거래 외 1개",
        "count": 2
      },
      "createdAt": "2026-06-15T05:40:00.000Z"
    }
  ],
  "page": 1,
  "pageSize": 10,
  "totalCount": 1,
  "totalPages": 1
}
```

### 연결된 DB 스키마

- 생성: 없음
- 조회: `MeetingNote`, `MeetingNoteCompany`, `MeetingNoteContact`, `MeetingNoteProduct`, `MeetingNoteDeal`, `Company`, `Contact`
- 수정: 없음
- 삭제: 없음
- 감사 로그: 없음
- transaction: 없음

### Transaction

- 필요 여부: 없음
- 이유: 조회 전용이다.
- transaction model: 없음
- rollback 범위: 없음
- 외부 Provider 호출 위치: 없음
- audit log 포함 여부: 없음

### Observability

- log event key: `meeting_note.listed`
- audit log: 없음
- request id: 사용
- redaction: 회의록 본문, 원문, 연락처 이메일/전화번호 logging 금지
- provider error context: 없음

### 에러 응답

| 상황 | 에러 | HTTP | FE 처리 | log level |
| --- | --- | ---: | --- | --- |
| 인증 없음 또는 invalid | `Unauthorized` | 401 | 로그인 또는 refresh 흐름 | warn |
| query validation 실패 | `ValidationError` | 400 | 목록 오류 상태 | log |
| 회사 필터가 본인 소유가 아님 | `CompanyNotFound` | 404 | 해당 필터 제거 후 안내 | log |
| 담당자 필터가 본인 소유가 아님 | `ContactNotFound` | 404 | 해당 필터 제거 후 안내 | log |

### FE/BE 처리 기준

- FE: `companyIds`, `contactIds`, `sort`, `page`를 URL search params와 TanStack Query key에 반영한다.
- FE: `pageSize` query를 보내지 않는다.
- FE: 목록 카드에는 요약 label/count만 표시하고 상세 본문은 상세 API에서 조회한다.
- BE: `userId` 조건을 모든 조회에 포함한다.
- BE: 동일 회의록이 여러 연결 row 때문에 중복 반환되지 않도록 `MeetingNote.id` 기준으로 페이지네이션한다.
- 검증: 다중 회사 필터, 다중 담당자 필터, 회사+담당자 AND 조합, 정렬, 타 사용자 데이터 미노출을 확인한다.

## 9.2 회의록 목록 필터용 회사 전체 목록 API

- API 이름: 회의록 목록 필터용 회사 전체 목록 API
- API 식별자: `ListMeetingNoteFilterCompanies`
- 계약 상태: `confirmed`
- 소비자: User Web
- 호환성: 신규 API
- Method: `GET`
- Path: `/api/meeting-notes/filter-companies`
- 인증: Backend App access token 필요
- 권한: 본인 회사만 조회
- Request 이름: `ListMeetingNoteFilterCompaniesRequest`
- Response 이름: `MeetingNoteFilterCompanyOptionListResponse`
- Transaction: 없음. 조회 전용.
- Observability: `meeting_note.filter_companies.listed`, audit log 없음, request id 사용, PII redaction.

### 목적

회의록 목록 화면의 회사 다중 선택 필터 옵션을 제공한다.

### Request

Header:

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
| --- | --- | --- | ---: | --- | --- |
| header | `Authorization` | string | 예 | `Bearer <backend_app_access_token>` | 인증 header |

Query:

없음.

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. `Company.userId = currentUser.id` 조건으로 회사를 조회한다.
3. 삭제 개념이 생기면 삭제된 회사는 제외한다.
4. `createdAt DESC`, `id DESC`로 정렬한다.
5. 페이지네이션 없이 전체 목록을 반환한다.
6. 응답 필드는 `id`, `companyName`, `createdAt`만 포함한다.

### Response

- Response 이름: `MeetingNoteFilterCompanyOptionListResponse`
- Status: `200 OK`
- Body: 있음

| 필드 | 타입 | nullable | 설명 |
| --- | --- | ---: | --- |
| `items` | `MeetingNoteFilterCompanyOptionResponse[]` | 아니오 | 회사 필터 옵션 목록 |
| `items[].id` | string | 아니오 | 회사 ID |
| `items[].companyName` | string | 아니오 | 회사 이름 |
| `items[].createdAt` | string | 아니오 | 등록일 ISO string |

예시:

```json
{
  "items": [
    {
      "id": "company-id",
      "companyName": "삼성전자",
      "createdAt": "2026-06-15T05:40:00.000Z"
    }
  ]
}
```

### 연결된 DB 스키마

- 생성: 없음
- 조회: `Company`
- 수정: 없음
- 삭제: 없음
- 감사 로그: 없음
- transaction: 없음

### Transaction

- 필요 여부: 없음
- 이유: 조회 전용이다.
- transaction model: 없음
- rollback 범위: 없음
- 외부 Provider 호출 위치: 없음
- audit log 포함 여부: 없음

### Observability

- log event key: `meeting_note.filter_companies.listed`
- audit log: 없음
- request id: 사용
- redaction: 회사명 원문 logging 지양
- provider error context: 없음

### 에러 응답

| 상황 | 에러 | HTTP | FE 처리 | log level |
| --- | --- | ---: | --- | --- |
| 인증 없음 또는 invalid | `Unauthorized` | 401 | 로그인 또는 refresh 흐름 | warn |

### FE/BE 처리 기준

- FE: 회의록 목록의 회사 필터 옵션으로만 사용한다.
- FE: 회사 목록 화면 API를 재사용하지 않는다.
- BE: `meeting-note` 모듈 controller/service/repository 계약 안에서 구현한다.
- 검증: 본인 회사만 반환하고 정렬이 유지되는지 확인한다.

## 9.3 회의록 목록 필터용 담당자 전체 목록 API

- API 이름: 회의록 목록 필터용 담당자 전체 목록 API
- API 식별자: `ListMeetingNoteFilterContacts`
- 계약 상태: `confirmed`
- 소비자: User Web
- 호환성: 신규 API
- Method: `GET`
- Path: `/api/meeting-notes/filter-contacts`
- 인증: Backend App access token 필요
- 권한: 본인 담당자만 조회
- Request 이름: `ListMeetingNoteFilterContactsRequest`
- Response 이름: `MeetingNoteFilterContactOptionListResponse`
- Transaction: 없음. 조회 전용.
- Observability: `meeting_note.filter_contacts.listed`, audit log 없음, request id 사용, PII redaction.

### 목적

회의록 목록 화면의 담당자 다중 선택 필터 옵션을 제공한다.

### Request

Header:

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
| --- | --- | --- | ---: | --- | --- |
| header | `Authorization` | string | 예 | `Bearer <backend_app_access_token>` | 인증 header |

Query:

없음.

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. `Contact.userId = currentUser.id` 조건으로 담당자를 조회한다.
3. 삭제 개념이 생기면 삭제된 담당자는 제외한다.
4. `createdAt DESC`, `id DESC`로 정렬한다.
5. 페이지네이션 없이 전체 목록을 반환한다.
6. 응답 필드는 `id`, `contactUsername`, `createdAt`만 포함한다.

### Response

- Response 이름: `MeetingNoteFilterContactOptionListResponse`
- Status: `200 OK`
- Body: 있음

| 필드 | 타입 | nullable | 설명 |
| --- | --- | ---: | --- |
| `items` | `MeetingNoteFilterContactOptionResponse[]` | 아니오 | 담당자 필터 옵션 목록 |
| `items[].id` | string | 아니오 | 담당자 ID |
| `items[].contactUsername` | string | 아니오 | 담당자 이름 |
| `items[].createdAt` | string | 아니오 | 등록일 ISO string |

예시:

```json
{
  "items": [
    {
      "id": "contact-id",
      "contactUsername": "송재근",
      "createdAt": "2026-06-15T05:40:00.000Z"
    }
  ]
}
```

### 연결된 DB 스키마

- 생성: 없음
- 조회: `Contact`
- 수정: 없음
- 삭제: 없음
- 감사 로그: 없음
- transaction: 없음

### Transaction

- 필요 여부: 없음
- 이유: 조회 전용이다.
- transaction model: 없음
- rollback 범위: 없음
- 외부 Provider 호출 위치: 없음
- audit log 포함 여부: 없음

### Observability

- log event key: `meeting_note.filter_contacts.listed`
- audit log: 없음
- request id: 사용
- redaction: 담당자 이름, 이메일, 전화번호 logging 금지
- provider error context: 없음

### 에러 응답

| 상황 | 에러 | HTTP | FE 처리 | log level |
| --- | --- | ---: | --- | --- |
| 인증 없음 또는 invalid | `Unauthorized` | 401 | 로그인 또는 refresh 흐름 | warn |

### FE/BE 처리 기준

- FE: 회의록 목록의 담당자 필터 옵션으로만 사용한다.
- FE: 담당자 목록 화면 API를 재사용하지 않는다.
- BE: `meeting-note` 모듈 controller/service/repository 계약 안에서 구현한다.
- 검증: 본인 담당자만 반환하고 정렬이 유지되는지 확인한다.

## 9.4 회의록 단건 상세 조회 API

- API 이름: 회의록 단건 상세 조회 API
- API 식별자: `GetMeetingNote`
- 계약 상태: `confirmed`
- 소비자: User Web
- 호환성: 신규 API
- Method: `GET`
- Path: `/api/meeting-notes/:meetingNoteId`
- 인증: Backend App access token 필요
- 권한: 본인 회의록만 조회
- Request 이름: `GetMeetingNoteRequest`
- Response 이름: `MeetingNoteDetailResponse`
- Transaction: 없음. 조회 전용.
- Observability: `meeting_note.detail_viewed`, audit log 없음, request id 사용, PII redaction.

### 목적

회의록 상세 화면에서 회의록 본문, 원문, 최근 수정일, 연결된 회사/담당자/제품/딜의 현재 상태 정보와 snapshot 정보를 함께 조회한다.

### Request

Header:

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
| --- | --- | --- | ---: | --- | --- |
| header | `Authorization` | string | 예 | `Bearer <backend_app_access_token>` | 인증 header |

Path:

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
| --- | --- | --- | ---: | --- | --- |
| path | `meetingNoteId` | string | 예 | UUID | 회의록 ID |

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. `meetingNoteId`를 validation한다.
3. `MeetingNote.id = meetingNoteId`, `MeetingNote.userId = currentUser.id` 조건으로 회의록을 조회한다.
4. 회의록이 없으면 `MeetingNoteNotFound`를 반환한다.
5. 연결 회사/담당자/제품/딜 목록을 함께 조회한다.
6. 연결 목록은 각각 `createdAt DESC`, `id DESC`로 정렬한다.
7. FK가 살아있는 연결은 현재 엔티티 정보를 포함한다.
8. FK가 nullable이거나 원본 엔티티가 없으면 현재 엔티티 정보는 `null`로 반환하고 snapshot은 유지한다.
9. `meetingAt`이 있으면 `timeZone` 기준 `meetingLocalDateTime`을 계산한다.
10. `rawText`가 없으면 `null`로 반환한다.

### Response

- Response 이름: `MeetingNoteDetailResponse`
- Status: `200 OK`
- Body: 있음

| 필드 | 타입 | nullable | 설명 |
| --- | --- | ---: | --- |
| `id` | string | 아니오 | 회의록 ID |
| `sourceType` | string | 아니오 | 생성 방식 |
| `meetingAt` | string | 예 | 회의 일시 UTC ISO string |
| `meetingLocalDateTime` | string | 예 | `timeZone` 기준 local date-time |
| `timeZone` | string | 아니오 | IANA timezone ID |
| `details` | string | 아니오 | 상세 내용 |
| `nextPlan` | string | 예 | 다음 계획 |
| `requiredAction` | string | 예 | 필요 액션 |
| `rawText` | string | 예 | AI/STT 작성에 사용한 원문 텍스트 |
| `companies` | `MeetingNoteCompanyDetailResponse[]` | 아니오 | 연결 회사 목록 |
| `contacts` | `MeetingNoteContactDetailResponse[]` | 아니오 | 연결 담당자 목록 |
| `products` | `MeetingNoteProductDetailResponse[]` | 아니오 | 연결 제품 목록 |
| `deals` | `MeetingNoteDealDetailResponse[]` | 아니오 | 연결 딜 목록 |
| `createdAt` | string | 아니오 | 등록일 ISO string |
| `updatedAt` | string | 아니오 | 최근 수정일 ISO string |

예시:

```json
{
  "id": "meeting-note-id",
  "sourceType": "MANUAL",
  "meetingAt": "2026-06-15T05:30:00.000Z",
  "meetingLocalDateTime": "2026-06-15T14:30:00",
  "timeZone": "Asia/Seoul",
  "details": "회의 상세 내용",
  "nextPlan": "향후 계획",
  "requiredAction": "필요 액션",
  "rawText": null,
  "companies": [
    {
      "id": "meeting-note-company-id",
      "companyId": "company-id",
      "company": {
        "id": "company-id",
        "companyName": "삼성전자",
        "companyField": {
          "id": "company-field-id",
          "field": "제조"
        },
        "companyRegion": {
          "id": "company-region-id",
          "region": "수도권"
        }
      },
      "companyNameSnapshot": "삼성전자",
      "companyFieldSnapshot": "제조",
      "companyRegionSnapshot": "수도권",
      "createdAt": "2026-06-15T05:40:00.000Z"
    }
  ],
  "contacts": [
    {
      "id": "meeting-note-contact-id",
      "contactId": "contact-id",
      "companyId": "company-id",
      "contact": {
        "id": "contact-id",
        "contactUsername": "송재근",
        "contactEmail": "song@example.com",
        "contactMobile": "010-1234-5678",
        "contactDepartment": {
          "id": "department-id",
          "departmentName": "설비팀"
        },
        "contactJobGrade": {
          "id": "job-grade-id",
          "jobGradeName": "부장"
        }
      },
      "contactUsernameSnapshot": "송재근",
      "contactEmailSnapshot": "song@example.com",
      "contactMobileSnapshot": "010-1234-5678",
      "companyNameSnapshot": "삼성전자",
      "departmentSnapshot": "설비팀",
      "jobGradeSnapshot": "부장",
      "createdAt": "2026-06-15T05:40:00.000Z"
    }
  ],
  "products": [
    {
      "id": "meeting-note-product-id",
      "productId": "product-id",
      "product": {
        "id": "product-id",
        "productName": "HBDM4",
        "productPrice": 30000000,
        "productCategory": {
          "id": "product-category-id",
          "categoryName": "장비"
        },
        "productStatus": {
          "id": "product-status-id",
          "statusName": "판매중"
        }
      },
      "productNameSnapshot": "HBDM4",
      "productPriceSnapshot": 30000000,
      "productCategorySnapshot": "장비",
      "productStatusSnapshot": "판매중",
      "createdAt": "2026-06-15T05:40:00.000Z"
    }
  ],
  "deals": [
    {
      "id": "meeting-note-deal-id",
      "dealId": "deal-id",
      "deal": {
        "id": "deal-id",
        "dealName": "거래",
        "dealStatus": "NEGOTIATION",
        "dealCost": 50000000,
        "dealExpectedEndDate": "2026-07-31"
      },
      "dealNameSnapshot": "거래",
      "dealStatusSnapshot": "NEGOTIATION",
      "dealCostSnapshot": 50000000,
      "dealExpectedEndDateSnapshot": "2026-07-31",
      "createdAt": "2026-06-15T05:40:00.000Z"
    }
  ],
  "createdAt": "2026-06-15T05:40:00.000Z",
  "updatedAt": "2026-06-15T06:10:00.000Z"
}
```

### 연결된 DB 스키마

- 생성: 없음
- 조회: `MeetingNote`, `MeetingNoteCompany`, `MeetingNoteContact`, `MeetingNoteProduct`, `MeetingNoteDeal`, `Company`, `CompanyField`, `CompanyRegion`, `Contact`, `ContactDepartment`, `ContactJobGrade`, `Product`, `ProductCategory`, `ProductStatus`, `Deal`
- 수정: 없음
- 삭제: 없음
- 감사 로그: 없음
- transaction: 없음

### Transaction

- 필요 여부: 없음
- 이유: 조회 전용이다.
- transaction model: 없음
- rollback 범위: 없음
- 외부 Provider 호출 위치: 없음
- audit log 포함 여부: 없음

### Observability

- log event key: `meeting_note.detail_viewed`
- audit log: 없음
- request id: 사용
- redaction: `rawText`, `details`, `nextPlan`, `requiredAction`, 연락처 이메일/전화번호 logging 금지
- provider error context: 없음

### 에러 응답

| 상황 | 에러 | HTTP | FE 처리 | log level |
| --- | --- | ---: | --- | --- |
| 인증 없음 또는 invalid | `Unauthorized` | 401 | 로그인 또는 refresh 흐름 | warn |
| path validation 실패 | `ValidationError` | 400 | 목록으로 이동 또는 오류 안내 | log |
| 회의록 없음 또는 타 사용자 회의록 | `MeetingNoteNotFound` | 404 | 목록으로 이동 또는 삭제된 항목 안내 | warn |

### FE/BE 처리 기준

- FE: 상세 화면 진입 시 이 API를 호출한다.
- FE: `meetingLocalDateTime`을 회의 날짜 표시와 수정 form 초기값으로 사용한다.
- FE: snapshot과 현재 엔티티 정보가 다르면 현재 엔티티 정보는 링크/현재 상태 표시, snapshot은 회의 당시 기록 표시로 구분한다.
- BE: 원본 엔티티가 없는 nullable 연결도 snapshot은 반환한다.
- 검증: 타 사용자 회의록 미노출, 연결 row 정렬, nullable FK 응답, timezone 변환을 확인한다.

## 9.5 회의록 생성 API

- API 이름: 회의록 생성 API
- API 식별자: `CreateMeetingNote`
- 계약 상태: `confirmed`
- 소비자: User Web
- 호환성: 신규 API
- Method: `POST`
- Path: `/api/meeting-notes`
- 인증: Backend App access token 필요
- 권한: 본인 리소스만 연결 가능
- Request 이름: `CreateMeetingNoteRequest`
- Response 이름: `MeetingNoteDetailResponse`
- Transaction: 필요. 회의록과 연결 row를 같은 사용자 행동으로 생성한다.
- Observability: `meeting_note.created`, audit log 없음, request id 사용, PII redaction.

### 목적

사용자가 직접 작성하거나 AI/STT 초안을 수정한 최종 회의록을 저장한다.

### Request

Header:

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
| --- | --- | --- | ---: | --- | --- |
| header | `Authorization` | string | 예 | `Bearer <backend_app_access_token>` | 인증 header |

Body:

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
| --- | --- | --- | ---: | --- | --- |
| body | `sourceType` | string | 아니오 | `MANUAL`만 허용. 기본값 `MANUAL` | 생성 방식 |
| body | `meetingLocalDateTime` | string | 아니오 | local date-time | 회의 일시 |
| body | `details` | string | 예 | trim 후 1자 이상 | 상세 내용 |
| body | `nextPlan` | string | 아니오 | trim | 다음 계획 |
| body | `requiredAction` | string | 아니오 | trim | 필요 액션 |
| body | `companies` | `MeetingNoteCompanyInput[]` | 아니오 | 배열 | 연결 회사 목록 |
| body | `contacts` | `MeetingNoteContactInput[]` | 아니오 | 배열 | 연결 담당자 목록 |
| body | `products` | `MeetingNoteProductInput[]` | 아니오 | 배열 | 연결 제품 목록 |
| body | `deals` | `MeetingNoteDealInput[]` | 아니오 | 배열 | 연결 딜 목록 |

연결 input validation:

| 필드 | 규칙 |
| --- | --- |
| `companies[].companyName` | `companyId`가 없으면 필수 |
| `companies[].companyField` | 선택. 회사 업종 snapshot |
| `companies[].companyRegion` | 선택. 회사 지역 snapshot |
| `contacts[].contactUsername` | `contactId`가 없으면 필수 |
| `contacts[].contactEmail` | 선택. 있으면 trim 후 저장 |
| `contacts[].contactMobile` | 선택. 있으면 trim 후 저장 |
| `products[].productName` | `productId`가 없으면 필수 |
| `products[].productPrice` | 선택. 있으면 0 이상의 정수 |
| `products[].productCategory` | 선택. 제품 카테고리 snapshot |
| `products[].productStatus` | 선택. 제품 상태 snapshot |
| `deals[].dealId` | 필수 UUID |

예시:

```json
{
  "sourceType": "MANUAL",
  "meetingLocalDateTime": "2026-06-15T14:30:00",
  "details": "설비팀에서 자동화 장비 도입 조건과 예산 확정 시점을 논의했다.",
  "nextPlan": "견적서와 납기 일정을 전달한 뒤 후속 미팅을 잡는다.",
  "requiredAction": "다음 주까지 견적서 및 납기 일정 송부",
  "companies": [
    {
      "companyId": "company-id",
      "companyName": "삼성전자",
      "companyField": "제조",
      "companyRegion": "수도권"
    }
  ],
  "contacts": [
    {
      "contactId": "contact-id",
      "companyId": "company-id",
      "contactUsername": "송재근",
      "contactEmail": "song@example.com",
      "contactMobile": "010-1234-5678",
      "companyName": "삼성전자",
      "department": "설비팀",
      "jobGrade": "부장"
    }
  ],
  "products": [
    {
      "productId": "product-id",
      "productName": "HBDM4",
      "productPrice": 30000000,
      "productCategory": "장비",
      "productStatus": "판매중"
    }
  ],
  "deals": [
    {
      "dealId": "deal-id"
    }
  ]
}
```

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. request body를 validation한다.
3. `sourceType`이 있으면 `MANUAL`인지 확인한다.
4. 현재 사용자의 `User.timeZone`을 조회한다.
5. `meetingLocalDateTime`이 있으면 `User.timeZone` 기준으로 UTC `meetingAt`을 계산하고, 사용한 값을 `MeetingNote.timeZone`에 저장한다.
6. 연결 대상의 `companyId`, `contactId`, `productId`, `dealId`가 있으면 현재 사용자 소유인지 검증한다.
7. `MeetingNote`를 `sourceType = MANUAL`로 생성한다.
8. 회사/담당자/제품/딜 연결 row를 생성한다.
9. 연결 row에는 snapshot을 저장한다.
10. `companyId`, `contactId`, `productId`가 있으면 현재 엔티티 값을 우선 snapshot으로 사용한다.
11. `companyId`, `contactId`, `productId`가 없으면 request에 직접 입력된 값을 snapshot-only 항목으로 저장한다.
12. `MeetingNoteDeal`은 `dealId`로 조회한 Deal의 `dealName`, `dealStatus`, `dealCost`, `expectedEndDate`를 snapshot으로 저장한다.
13. 딜 상태 라벨은 별도 저장하지 않는다.
14. 전체 생성은 transaction으로 처리한다.

### Response

- Response 이름: `MeetingNoteDetailResponse`
- Status: `201 Created`
- Body: 있음

Body는 생성된 회의록의 `MeetingNoteDetailResponse`다.

### 연결된 DB 스키마

- 생성: `MeetingNote`, `MeetingNoteCompany`, `MeetingNoteContact`, `MeetingNoteProduct`, `MeetingNoteDeal`
- 조회: `User`, `Company`, `CompanyField`, `CompanyRegion`, `Contact`, `ContactDepartment`, `ContactJobGrade`, `Product`, `ProductCategory`, `ProductStatus`, `Deal`
- 수정: 없음
- 삭제: 없음
- 감사 로그: 없음
- transaction: `MeetingNote`와 모든 연결 row 생성

### Transaction

- 필요 여부: 필요
- 이유: 회의록과 연결 row가 하나의 저장 동작으로 함께 생성되어야 한다.
- transaction model: `MeetingNote`, `MeetingNoteCompany`, `MeetingNoteContact`, `MeetingNoteProduct`, `MeetingNoteDeal`
- rollback 범위: 회의록 생성과 모든 연결 row 생성 전체
- 외부 Provider 호출 위치: 없음
- audit log 포함 여부: 없음

### Observability

- log event key: `meeting_note.created`
- audit log: 없음
- request id: 사용
- redaction: `rawText`, `details`, `nextPlan`, `requiredAction`, 연락처 이메일/전화번호 logging 금지
- provider error context: 없음

### 에러 응답

| 상황 | 에러 | HTTP | FE 처리 | log level |
| --- | --- | ---: | --- | --- |
| 인증 없음 또는 invalid | `Unauthorized` | 401 | 로그인 또는 refresh 흐름 | warn |
| 요청 validation 실패 | `ValidationError` | 400 | form field error 또는 toast | log |
| 연결 회사 없음 또는 타 사용자 회사 | `CompanyNotFound` | 404 | 회사 선택값 갱신 안내 | log |
| 연결 담당자 없음 또는 타 사용자 담당자 | `ContactNotFound` | 404 | 담당자 선택값 갱신 안내 | log |
| 연결 제품 없음 또는 타 사용자 제품 | `ProductNotFound` | 404 | 제품 선택값 갱신 안내 | log |
| 연결 딜 없음 또는 타 사용자 딜 | `DealNotFound` | 404 | 딜 선택값 갱신 안내 | log |

### FE/BE 처리 기준

- FE: 이번 구현에서 생성 API는 직접 작성 회의록만 저장한다.
- FE: 저장 성공 후 상세 화면으로 이동하고 회의록 목록 query를 invalidate한다.
- FE: response의 detail DTO를 상세 화면 초기 데이터로 사용할 수 있다.
- BE: 연결 row snapshot 생성 책임은 application service가 가진다.
- BE: 중복 `dealId`가 request에 있으면 validation 단계에서 거부한다.
- 검증: 직접 작성 저장, snapshot 저장, transaction rollback, 타 사용자 리소스 연결 실패를 확인한다.

## 9.6 회의록 수정 API

- API 이름: 회의록 수정 API
- API 식별자: `UpdateMeetingNote`
- 계약 상태: `confirmed`
- 소비자: User Web
- 호환성: 신규 API
- Method: `PATCH`
- Path: `/api/meeting-notes/:meetingNoteId`
- 인증: Backend App access token 필요
- 권한: 본인 회의록만 수정
- Request 이름: `UpdateMeetingNoteRequest`
- Response 이름: `MeetingNoteDetailResponse`
- Transaction: 필요. 회의록 본문과 연결 row 교체를 같은 사용자 행동으로 처리한다.
- Observability: `meeting_note.updated`, audit log 없음, request id 사용, PII redaction.

### 목적

회의록 본문, 원문, 회의 일시, 연결 회사/담당자/제품/딜을 수정한다.

### Request

Header:

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
| --- | --- | --- | ---: | --- | --- |
| header | `Authorization` | string | 예 | `Bearer <backend_app_access_token>` | 인증 header |

Path:

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
| --- | --- | --- | ---: | --- | --- |
| path | `meetingNoteId` | string | 예 | UUID | 회의록 ID |

Body:

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
| --- | --- | --- | ---: | --- | --- |
| body | `meetingLocalDateTime` | string | 아니오 | local date-time | 회의 일시 |
| body | `details` | string | 아니오 | trim 후 1자 이상 | 상세 내용 |
| body | `nextPlan` | string | 아니오 | trim | 다음 계획 |
| body | `requiredAction` | string | 아니오 | trim | 필요 액션 |
| body | `companies` | `MeetingNoteCompanyInput[]` | 아니오 | 배열 | 포함되면 회사 연결 전체 교체 |
| body | `contacts` | `MeetingNoteContactInput[]` | 아니오 | 배열 | 포함되면 담당자 연결 전체 교체 |
| body | `products` | `MeetingNoteProductInput[]` | 아니오 | 배열 | 포함되면 제품 연결 전체 교체 |
| body | `deals` | `MeetingNoteDealInput[]` | 아니오 | 배열 | 포함되면 딜 연결 전체 교체 |

배열 필드는 `undefined`와 빈 배열의 의미가 다르다.

- 배열 필드가 빠짐: 기존 연결 유지
- 배열 필드가 빈 배열: 해당 연결 전체 제거

예시:

```json
{
  "meetingLocalDateTime": "2026-06-16T10:00:00",
  "details": "수정된 상세 내용",
  "nextPlan": "수정된 향후 계획",
  "requiredAction": "수정된 필요 액션",
  "companies": [
    {
      "companyId": "company-id",
      "companyName": "삼성전자",
      "companyField": "제조",
      "companyRegion": "수도권"
    }
  ],
  "contacts": [],
  "products": [],
  "deals": [
    {
      "dealId": "deal-id"
    },
    {
      "dealId": "another-deal-id"
    }
  ]
}
```

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. `meetingNoteId`와 request body를 validation한다.
3. 회의록 존재 여부와 사용자 소유권을 확인한다.
4. 본문 필드가 request에 있으면 수정한다.
5. `meetingLocalDateTime`이 request에 있으면 현재 사용자의 `User.timeZone` 기준으로 `meetingAt`을 다시 계산하고, 사용한 값을 `MeetingNote.timeZone`에 저장한다.
6. 연결 배열이 포함된 유형은 기존 연결을 삭제하고 새 연결을 생성한다.
7. 새 연결 row에는 생성 API와 동일한 snapshot 규칙을 적용한다.
8. 전체 수정은 transaction으로 처리한다.

### Response

- Response 이름: `MeetingNoteDetailResponse`
- Status: `200 OK`
- Body: 있음

Body는 수정된 회의록의 `MeetingNoteDetailResponse`다.

### 연결된 DB 스키마

- 생성: 교체 대상 `MeetingNoteCompany`, `MeetingNoteContact`, `MeetingNoteProduct`, `MeetingNoteDeal`
- 조회: `MeetingNote`, `User`, `Company`, `Contact`, `Product`, `Deal`
- 수정: `MeetingNote`
- 삭제: 교체 대상 기존 연결 row hard delete
- 감사 로그: 없음
- transaction: `MeetingNote` 수정과 연결 row 교체

### Transaction

- 필요 여부: 필요
- 이유: 본문 수정과 연결 row 교체가 하나의 수정 동작으로 처리되어야 한다.
- transaction model: `MeetingNote`, `MeetingNoteCompany`, `MeetingNoteContact`, `MeetingNoteProduct`, `MeetingNoteDeal`
- rollback 범위: 회의록 수정과 연결 row 삭제/생성 전체
- 외부 Provider 호출 위치: 없음
- audit log 포함 여부: 없음

### Observability

- log event key: `meeting_note.updated`
- audit log: 없음
- request id: 사용
- redaction: `rawText`, `details`, `nextPlan`, `requiredAction`, 연락처 이메일/전화번호 logging 금지
- provider error context: 없음

### 에러 응답

| 상황 | 에러 | HTTP | FE 처리 | log level |
| --- | --- | ---: | --- | --- |
| 인증 없음 또는 invalid | `Unauthorized` | 401 | 로그인 또는 refresh 흐름 | warn |
| 요청 validation 실패 | `ValidationError` | 400 | form field error 또는 toast | log |
| 회의록 없음 또는 타 사용자 회의록 | `MeetingNoteNotFound` | 404 | 목록으로 이동 또는 삭제된 항목 안내 | warn |
| 연결 회사 없음 또는 타 사용자 회사 | `CompanyNotFound` | 404 | 회사 선택값 갱신 안내 | log |
| 연결 담당자 없음 또는 타 사용자 담당자 | `ContactNotFound` | 404 | 담당자 선택값 갱신 안내 | log |
| 연결 제품 없음 또는 타 사용자 제품 | `ProductNotFound` | 404 | 제품 선택값 갱신 안내 | log |
| 연결 딜 없음 또는 타 사용자 딜 | `DealNotFound` | 404 | 딜 선택값 갱신 안내 | log |

### FE/BE 처리 기준

- FE: 수정 성공 후 상세 query와 목록 query를 invalidate한다.
- FE: 배열을 보내지 않으면 기존 연결 유지, 빈 배열을 보내면 연결 제거임을 form 상태에서 명확히 처리한다.
- BE: 교체 대상 연결만 삭제/재생성한다.
- 검증: 부분 수정, 연결 전체 제거, 연결 교체, `User.timeZone` 기준 시간 재계산, transaction rollback을 확인한다.

## 9.7 후속 범위: 텍스트 기반 AI 초안 생성 API

- API 이름: 텍스트 기반 AI 초안 생성 API
- API 식별자: `GenerateMeetingNoteDraft`
- 계약 상태: `deferred`
- 소비자: 후속 User Web
- 호환성: 이번 구현 제외. 현재 controller route를 생성하지 않는다.
- Method: `POST`
- Path: `/api/meeting-notes/generate`
- 인증: Backend App access token 필요
- 권한: 본인 데이터 후보만 조회
- Request 이름: `GenerateMeetingNoteDraftRequest`
- Response 이름: `GenerateMeetingNoteDraftResponse`
- Transaction: 없음. 저장하지 않는 provider 호출 API.
- Observability: `meeting_note.draft_generated`, audit log 없음, request id 사용, provider error context 사용, PII redaction.

### 목적

회의 원문 텍스트를 AI로 구조화해 저장 전 수정 가능한 회의록 초안을 만든다.

### Request

Header:

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
| --- | --- | --- | ---: | --- | --- |
| header | `Authorization` | string | 예 | `Bearer <backend_app_access_token>` | 인증 header |

Body:

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
| --- | --- | --- | ---: | --- | --- |
| body | `rawText` | string | 예 | trim 후 1자 이상 | AI 정리에 사용할 원문 텍스트 |
| body | `meetingLocalDateTime` | string | 아니오 | local date-time | AI 추론 힌트 |
| body | `companyHint` | string | 아니오 | trim | 회사 추론 힌트 |
| body | `contactHint` | string | 아니오 | trim | 담당자 추론 힌트 |

예시:

```json
{
  "rawText": "오늘 삼성전자 송재근 부장과 미팅했다. 설비팀에서 자동화 장비를 검토 중이고...",
  "meetingLocalDateTime": "2026-06-15T14:30:00",
  "companyHint": "삼성전자",
  "contactHint": "송재근"
}
```

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. request body를 validation한다.
3. `rawText`를 trim한다.
4. 현재 사용자의 `User.timeZone`을 조회한다.
5. `meetingLocalDateTime`, `User.timeZone`, `companyHint`, `contactHint`는 AI 추론 힌트로 사용한다.
6. AI provider는 application port 뒤에서 호출한다.
7. AI 결과를 회의 일시, 회사 후보, 담당자 후보, 제품 후보, 상세내용, 향후계획, 필요액션 구조로 파싱한다.
8. AI가 추출한 회사/담당자/제품명으로 현재 사용자 소유 기존 데이터 후보를 조회한다.
9. 딜 후보는 추출된 회사/담당자/제품명과 기존 딜을 기준으로 제안한다.
10. AI 결과는 저장하지 않고 response로만 반환한다.
11. AI 결과 구조가 유효하지 않으면 `InvalidMeetingNoteGeneratedFields`를 반환한다.

### Response

- Response 이름: `GenerateMeetingNoteDraftResponse`
- Status: `200 OK`
- Body: 있음

```json
{
  "draft": {
    "meetingLocalDateTime": "2026-06-15T14:30:00",
    "timeZone": "Asia/Seoul",
    "details": "설비팀에서 자동화 장비 도입을 검토 중이며 경쟁사 제품과 비교 중이다. 예산은 7월 말 확정 예정이다.",
    "nextPlan": "견적서와 납기 일정을 전달한 뒤 후속 미팅을 진행한다.",
    "requiredAction": "다음 주까지 견적서 및 납기 일정 송부",
    "companies": [
      {
        "companyName": "삼성전자",
        "companyField": "제조",
        "companyRegion": "수도권"
      }
    ],
    "contacts": [
      {
        "contactUsername": "송재근",
        "contactEmail": "song@example.com",
        "contactMobile": "010-1234-5678",
        "companyName": "삼성전자",
        "department": "설비팀",
        "jobGrade": "부장"
      }
    ],
    "products": [
      {
        "productName": "HBDM4",
        "productPrice": 30000000,
        "productCategory": "장비",
        "productStatus": "판매중"
      }
    ]
  },
  "candidates": {
    "companies": [
      {
        "id": "company-id",
        "companyName": "삼성전자",
        "companyField": "제조",
        "companyRegion": "수도권"
      }
    ],
    "contacts": [
      {
        "id": "contact-id",
        "contactUsername": "송재근",
        "contactEmail": "song@example.com",
        "contactMobile": "010-1234-5678",
        "companyId": "company-id",
        "companyName": "삼성전자",
        "department": "설비팀",
        "jobGrade": "부장"
      }
    ],
    "products": [
      {
        "id": "product-id",
        "productName": "HBDM4",
        "productPrice": 30000000,
        "productCategory": "장비",
        "productStatus": "판매중"
      }
    ],
    "deals": [
      {
        "id": "deal-id",
        "dealName": "거래",
        "companyName": "삼성전자",
        "contactUsername": "송재근",
        "dealStatus": "NEGOTIATION",
        "dealCost": 50000000,
        "dealExpectedEndDate": "2026-07-31"
      }
    ]
  }
}
```

### 연결된 DB 스키마

- 생성: 없음
- 조회: `Company`, `Contact`, `Product`, `Deal`
- 수정: 없음
- 삭제: 없음
- 감사 로그: 없음
- transaction: 없음

### Transaction

- 필요 여부: 없음
- 이유: 저장하지 않는 AI provider 호출과 후보 조회 API다.
- transaction model: 없음
- rollback 범위: 없음
- 외부 Provider 호출 위치: DB transaction 밖에서 호출
- audit log 포함 여부: 없음

### Observability

- log event key: `meeting_note.draft_generated`
- audit log: 없음
- request id: 사용
- redaction: `rawText`, AI output 본문, 연락처 이메일/전화번호 logging 금지
- provider error context: provider 이름, latency, status category만 기록

### 에러 응답

| 상황 | 에러 | HTTP | FE 처리 | log level |
| --- | --- | ---: | --- | --- |
| 인증 없음 또는 invalid | `Unauthorized` | 401 | 로그인 또는 refresh 흐름 | warn |
| 요청 validation 실패 | `ValidationError` | 400 | 입력값 오류 안내 | log |
| AI provider 호출 실패 | `AiProviderUnavailable` | 503 | 재시도 안내 | error |
| AI 결과 구조가 유효하지 않음 | `InvalidMeetingNoteGeneratedFields` | 400 | 직접 수정 가능한 빈 초안 안내 | warn |

### FE/BE 처리 기준

- FE: 이 API 응답은 저장된 회의록이 아니므로 상세 페이지로 이동하지 않는다.
- FE: 응답 draft를 사용자가 수정한 뒤 `POST /api/meeting-notes`로 최종 저장한다.
- BE: provider 호출은 adapter 뒤에 숨기고 application service는 정규화된 draft만 받는다.
- 검증: provider 실패, 잘못된 AI JSON, 후보 매칭, 저장 side effect 없음 여부를 확인한다.

## 9.8 후속 범위: STT 변환 API

- API 이름: STT 변환 API
- API 식별자: `TranscribeMeetingNoteAudio`
- 계약 상태: `deferred`
- 소비자: 후속 User Web
- 호환성: 이번 구현 제외. 현재 controller route를 생성하지 않는다.
- Method: `POST`
- Path: `/api/meeting-notes/transcribe`
- 인증: Backend App access token 필요
- 권한: 인증 사용자만 호출 가능
- Request 이름: `TranscribeMeetingNoteAudioRequest`
- Response 이름: `TranscribeMeetingNoteAudioResponse`
- Transaction: 없음. 저장하지 않는 provider 호출 API.
- Observability: `meeting_note.audio_transcribed`, audit log 없음, request id 사용, provider error context 사용, PII redaction.

### 목적

회의 음성 파일을 텍스트로 변환한다. STT 결과는 회의록으로 저장하지 않고 사용자가 확인/수정한 뒤 AI 초안 생성에 사용한다.

### Request

Header:

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
| --- | --- | --- | ---: | --- | --- |
| header | `Authorization` | string | 예 | `Bearer <backend_app_access_token>` | 인증 header |
| header | `Content-Type` | string | 예 | `multipart/form-data` | multipart upload |

Form-data:

| 위치 | 필드 | 타입 | 필수 | validation | 설명 |
| --- | --- | --- | ---: | --- | --- |
| form-data | `audioFile` | file | 예 | 허용 MIME type, 허용 파일 크기 | 음성 파일 |
| form-data | `language` | string | 아니오 | 기본값 `ko` | STT 언어 힌트 |

### 비즈니스 로직 흐름

1. AuthGuard로 현재 사용자를 확인한다.
2. 음성 파일 존재 여부를 검증한다.
3. MIME type과 파일 크기를 검증한다.
4. STT provider는 application port 뒤에서 호출한다.
5. transcript를 반환한다.
6. STT 결과는 `MeetingNote`로 저장하지 않는다.
7. 1차 구현에서는 음성 파일을 장기 저장하지 않는다.
8. 사용자가 transcript를 확인/수정한 뒤 `/api/meeting-notes/generate`를 호출한다.

### Response

- Response 이름: `TranscribeMeetingNoteAudioResponse`
- Status: `200 OK`
- Body: 있음

| 필드 | 타입 | nullable | 설명 |
| --- | --- | ---: | --- |
| `transcriptText` | string | 아니오 | 전체 변환 텍스트 |
| `language` | string | 아니오 | STT 언어 |
| `durationSeconds` | number | 예 | 음성 길이. provider가 제공하지 않으면 null |
| `segments` | array | 아니오 | 구간별 텍스트 |
| `segments[].startSeconds` | number | 예 | 시작 초 |
| `segments[].endSeconds` | number | 예 | 종료 초 |
| `segments[].text` | string | 아니오 | 구간 텍스트 |

예시:

```json
{
  "transcriptText": "오늘 삼성전자 송재근 부장과 미팅했습니다. 설비팀에서 자동화 장비를 검토 중이고...",
  "language": "ko",
  "durationSeconds": 1830,
  "segments": [
    {
      "startSeconds": 0,
      "endSeconds": 5.2,
      "text": "오늘 삼성전자 송재근 부장과 미팅했습니다."
    }
  ]
}
```

### 연결된 DB 스키마

- 생성: 없음
- 조회: 없음
- 수정: 없음
- 삭제: 없음
- 감사 로그: 없음
- transaction: 없음

### Transaction

- 필요 여부: 없음
- 이유: 저장하지 않는 STT provider 호출 API다.
- transaction model: 없음
- rollback 범위: 없음
- 외부 Provider 호출 위치: DB transaction 밖에서 호출
- audit log 포함 여부: 없음

### Observability

- log event key: `meeting_note.audio_transcribed`
- audit log: 없음
- request id: 사용
- redaction: 음성 파일명, transcript 원문 logging 금지
- provider error context: provider 이름, latency, status category만 기록

### 에러 응답

| 상황 | 에러 | HTTP | FE 처리 | log level |
| --- | --- | ---: | --- | --- |
| 인증 없음 또는 invalid | `Unauthorized` | 401 | 로그인 또는 refresh 흐름 | warn |
| 파일 없음 또는 형식 오류 | `ValidationError` | 400 | 파일 재선택 안내 | log |
| STT provider 호출 실패 | `SttProviderUnavailable` | 503 | 재시도 안내 | error |

### FE/BE 처리 기준

- FE: STT 결과를 바로 저장하지 않고 transcript 편집 화면에 표시한다.
- FE: 사용자가 transcript를 확인/수정한 뒤 `POST /api/meeting-notes/generate`를 호출한다.
- BE: 음성 파일은 provider 호출에만 사용하고 장기 저장하지 않는다.
- 검증: 지원 파일 형식, 파일 크기 초과, provider 실패, 저장 side effect 없음 여부를 확인한다.

## 10. 공통 에러 응답 형식

| 상황 | 에러 | HTTP | FE 처리 | log level |
| --- | --- | ---: | --- | --- |
| 인증 없음 또는 invalid | `Unauthorized` | 401 | 로그인 또는 refresh 흐름 | warn |
| 요청 validation 실패 | `ValidationError` | 400 | form field error 또는 toast | log |
| 회의록 없음 또는 타 사용자 회의록 | `MeetingNoteNotFound` | 404 | 목록으로 이동 또는 삭제된 항목 안내 | warn |
| 연결 회사 없음 또는 타 사용자 회사 | `CompanyNotFound` | 404 | 회사 선택값 갱신 안내 | log |
| 연결 담당자 없음 또는 타 사용자 담당자 | `ContactNotFound` | 404 | 담당자 선택값 갱신 안내 | log |
| 연결 제품 없음 또는 타 사용자 제품 | `ProductNotFound` | 404 | 제품 선택값 갱신 안내 | log |
| 연결 딜 없음 또는 타 사용자 딜 | `DealNotFound` | 404 | 딜 선택값 갱신 안내 | log |

## 11. 구현 순서

1. Prisma schema 추가
   - `MeetingNoteSourceType`
   - `MeetingNote`
   - `MeetingNoteCompany`
   - `MeetingNoteContact`
   - `MeetingNoteProduct`
   - `MeetingNoteDeal`
2. MeetingNote backend module 추가
3. 생성/수정/상세/목록 API 구현
4. 프론트 `meeting-note` 타입과 화면을 N:N 구조로 수정
5. 딜 연결 활동 로그는 `DealActivity` 도입 시 자동 기록으로 연결

## 12. 후속 결정 필요

- 텍스트 AI 초안 생성 API를 언제 구현할지
- STT 변환 API를 언제 구현할지
- `DealActivity`를 회의록 작업에서 같이 추가할지, 별도 작업으로 둘지
- `AiJob`을 지금 저장할지, provider 결과만 반환할지
- STT 음성 파일을 저장할지, 변환 후 폐기할지
- snapshot-only 회사/담당자/제품을 나중에 실제 엔티티로 승격하는 UX를 제공할지
- 원문 텍스트 암호화를 언제 공통 보안 정책으로 도입할지
