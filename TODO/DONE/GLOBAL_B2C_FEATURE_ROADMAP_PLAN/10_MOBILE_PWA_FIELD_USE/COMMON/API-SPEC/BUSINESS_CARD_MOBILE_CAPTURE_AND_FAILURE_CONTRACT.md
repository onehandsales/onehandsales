# BusinessCard Mobile Capture And Failure Contract

상태: Confirmed

## 1. 목적

모바일 브라우저에서 영업 사용자가 명함을 촬영하거나 이미지를 선택해 OCR을 실행하고, 실패 시 provider raw detail 없이 안전한 실패 응답과 재시도 UX를 제공한다.

## 2. Consumer

- Frontend: User Web mobile browser
- Backend: BusinessCard module
- DB: `BusinessCardScanLog`
- Analytics: `business_card_ocr_failed` server event, capture/retry client event

## 3. Request

### 3.1 Create Scan

`POST /api/business-card-scans`

Content-Type: `multipart/form-data`

Headers:

| 이름 | 필수 | 설명 |
|---|---:|---|
| `Authorization` | Y | 사용자 JWT/session 기반 인증 |

Form fields:

| 이름 | 타입 | 필수 | 제약 |
|---|---|---:|---|
| `image` | file | Y | max 10MB, `image/jpeg`, `image/png`, `image/webp` 권장 |

Mobile FE input:

```tsx
<input type="file" accept="image/*" capture="environment" />
```

규칙:

- custom `getUserMedia` camera UI를 만들지 않는다.
- 브라우저가 `capture`를 무시할 수 있으므로 파일 선택 fallback을 정상 흐름으로 취급한다.
- client request body에 `userId`, `deviceId`, `organizationId`를 넣지 않는다.

### 3.2 Confirm Scan

`POST /api/business-card-scans/:scanLogId/confirm`

기존 confirm request DTO를 유지한다. 모바일 confirm form은 local draft를 사용할 수 있지만 server request에는 draft id를 넣지 않는다.

## 4. Response

### 4.1 Create/List/Detail Response

성공 status:

- `201 Created`: scan 생성 완료
- `200 OK`: list/detail 조회

DTO: `BusinessCardScanLogResponse`

```ts
type BusinessCardScanLogResponse = {
  id: string;
  status: "OCR_SUCCESS" | "OCR_FAILED" | "CONFIRMED";
  extracted: {
    companyName: string | null;
    companyFieldName: string | null;
    companyRegionName: string | null;
    contactName: string | null;
    contactMobile: string | null;
    contactEmail: string | null;
    contactDepartmentName: string | null;
    contactJobGradeName: string | null;
  };
  linked: {
    companyId: string | null;
    contactId: string | null;
    companyResolution: "EXISTING" | "CREATED" | null;
    contactResolution: "EXISTING" | "CREATED" | null;
    confirmedAt: string | null;
  };
  ai: {
    provider: string;
    model: string;
  };
  usage: {
    requestToken: number | null;
    responseToken: number | null;
    totalToken: number | null;
    requestCost: number | null;
    responseCost: number | null;
    totalCost: number | null;
    costCurrency: string;
    pendingTimeMs: number | null;
  };
  failure: {
    errorCode: BusinessCardSafeFailureCode;
    userMessage: string;
    retryable: boolean;
  } | null;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string | null;
};
```

`status === "OCR_FAILED"`이면 `failure`는 필수다. 과거 row에 safe failure 값이 없으면 backend mapper가 아래 fallback을 반환한다.

```json
{
  "errorCode": "OCR_UNKNOWN_FAILED",
  "userMessage": "명함을 읽지 못했어요. 다시 찍거나 파일을 바꿔 주세요.",
  "retryable": true
}
```

### 4.2 Safe Failure Codes

| code | HTTP status | retryable | 사용자 처리 |
|---|---:|---:|---|
| `IMAGE_REQUIRED` | 400 | true | 이미지를 다시 선택 |
| `IMAGE_TYPE_UNSUPPORTED` | 400 | true | jpg/png/webp로 교체 |
| `IMAGE_TOO_LARGE` | 400 | true | 10MB 이하로 교체 |
| `IMAGE_QUALITY_LOW` | 201 | true | 더 밝고 선명하게 재촬영 |
| `OCR_PARSE_FAILED` | 201 | true | 재촬영 또는 수동 입력 |
| `OCR_PROVIDER_UNAVAILABLE` | 201 | true | 잠시 후 재시도 또는 수동 입력 |
| `OCR_RATE_LIMITED` | 201 | true | 잠시 후 재시도 |
| `OCR_UNKNOWN_FAILED` | 201 | true | 재촬영 또는 수동 입력 |

Provider raw error는 response에 포함하지 않는다.

## 5. Backend Business Logic

1. 인증된 사용자 기준으로 scan을 생성한다.
2. 파일 존재, size, MIME을 검증한다.
3. OCR provider 호출 전후로 provider raw detail이 user response/log에 직접 노출되지 않게 한다.
4. OCR 성공 시 `BusinessCardScanStatus.OCR_SUCCESS`와 extracted fields를 저장한다.
5. OCR 실패 시 `BusinessCardScanStatus.OCR_FAILED`, `safeErrorCode`, `safeErrorMessage`, `retryable`을 저장한다.
6. 실패 row도 scan log로 남긴다. 사용자는 같은 화면에서 다시 촬영하거나 수동 입력으로 전환할 수 있다.
7. confirm은 기존 company/contact 연결 transaction을 유지한다.
8. OCR 실패 server analytics event `business_card_ocr_failed`는 best effort로 기록하며 scan 생성 성공/실패 트랜잭션을 rollback하지 않는다.

## 6. DB/Prisma

`BE/prisma/schema.prisma`의 `BusinessCardScanLog`에 safe failure 필드를 추가한다.

```prisma
safeErrorCode    String?
safeErrorMessage String?
retryable        Boolean @default(false)
```

권장 index:

```prisma
@@index([userId, status, safeErrorCode, createdAt])
```

DB에 저장하지 않는 것:

- provider raw response
- provider raw error detail
- client device id
- server draft
- 원본 이미지 binary

## 7. Transaction

- OCR provider 호출은 DB transaction 내부에 넣지 않는다.
- scan log create/update는 짧은 DB 작업으로 분리한다.
- confirm은 기존 company/contact upsert 및 scan status update를 하나의 transaction으로 유지한다.
- analytics record failure는 warning log만 남기고 본 mutation을 rollback하지 않는다.

## 8. Observability

Backend log context:

- `requestId`
- `userId`
- `scanLogId`
- `status`
- `safeErrorCode`
- `retryable`
- `provider`
- `model`

금지:

- 이미지 원문
- OCR 추출 전문
- prompt
- provider raw response/error
- 이메일/전화번호 등 PII payload

## 9. User Flow

1. 사용자가 `/app/business-cards` 모바일 화면에서 촬영/업로드 버튼을 누른다.
2. native file/camera picker가 열린다.
3. 선택 즉시 미리보기와 업로드 진행 상태를 보여준다.
4. OCR 성공 시 확인 form으로 이동하고, 사용자가 수정하는 값은 24h local draft로 저장한다.
5. OCR 실패 시 safe `userMessage`를 표시하고 `다시 촬영`, `파일 바꾸기`, `수동 입력`을 제공한다.
6. confirm 성공 시 local draft를 삭제하고 list/detail cache를 갱신한다.

## 10. Compatibility

- 기존 response 소비자는 `failure` nullable field를 무시해도 동작해야 한다.
- 기존 `status` enum은 변경하지 않는다.
- `BusinessCardScanLog` 과거 row는 mapper fallback으로 안전하게 처리한다.

## 11. Tests

Backend:

- multipart image missing/type/size validation
- OCR success response `failure: null`
- OCR failed response `failure` 필수
- provider raw error가 response/log DTO에 없음
- old failed row fallback mapping
- confirm transaction regression

Frontend:

- mobile file input attributes
- upload progress/loading state
- OCR failure retry/manual input UX
- confirm form local draft 연동
- 360px/390px viewport에서 버튼/텍스트 overflow 없음

E2E:

- mobile viewport에서 촬영 파일 upload 성공
- OCR 실패 mock에서 retry CTA 노출

## 12. API_SPEC_TEMPLATE_NORMALIZATION G04 보강

판단: 이 문서는 현재 구현된 BusinessCard HTTP API와 모바일 브라우저 UX/local draft 계약이 함께 들어 있는 보관 문서다. 서버 HTTP API는 아래 4개이며, 브라우저 파일 선택/capture attribute와 local draft는 서버 API 없음 범위로 분리한다. API path, method, request/response 의미는 변경하지 않는다.

- 계약 상태: `implemented`
- 소비자: User Web mobile browser
- 호환성: 기존 `/api/business-card-scans*` 계약 유지. breaking change 없음
- 인증: User `AuthGuard`
- 권한: 현재 로그인한 사용자 소유 `BusinessCardScanLog`만 조회/확정한다. confirm에서 생성/재사용되는 `Company`, `Contact`, 기본 옵션 row도 같은 `userId` 범위로 제한한다.

서버 API 없음:

- `<input type="file" accept="image/*" capture="environment" />`는 browser/native picker 계약이며 HTTP endpoint가 아니다.
- `getUserMedia` custom camera UI, client `deviceId`, server draft API는 만들지 않는다.
- confirm form local draft는 `LOCAL_DRAFT_CONTRACT.md`의 IndexedDB/localStorage 계약을 따르며 server request에 draft id를 넣지 않는다.

| API 이름 | API 식별자 | Method | Path | Request 이름 | Response 이름 |
|---|---|---|---|---|---|
| 모바일 명함 스캔 로그 목록 조회 API | `ListBusinessCardScanLogs` | `GET` | `/api/business-card-scans` | `ListBusinessCardScansQueryDto` | `BusinessCardScanLogPageResponse` / FE `BusinessCardScanLogPage` |
| 모바일 명함 이미지 OCR 스캔 API | `ScanBusinessCard` | `POST` | `/api/business-card-scans` | `ScanBusinessCardMultipartRequest` (`image` multipart field, DTO class 없음) | `BusinessCardScanLogResponse` / FE `BusinessCardScanLog` |
| 모바일 명함 스캔 로그 단건 조회 API | `GetBusinessCardScanLog` | `GET` | `/api/business-card-scans/:scanLogId` | `BusinessCardScanLogPathParams` | `BusinessCardScanLogResponse` / FE `BusinessCardScanLog` |
| 모바일 명함 OCR 결과 확정 저장 API | `ConfirmBusinessCardScan` | `POST` | `/api/business-card-scans/:scanLogId/confirm` | `ConfirmBusinessCardScanDto` | `ConfirmBusinessCardScanResponse` / FE `BusinessCardConfirmResponse` |

Error FE 처리/log level:

| 상황 | HTTP | FE 처리 | log level |
|---|---:|---|---|
| 인증 없음 | 401 | 로그인/토큰 갱신 흐름으로 이동 | warn |
| 이미지 누락, MIME/크기 validation 실패 | 400 | 같은 화면에서 파일 교체 또는 재촬영 안내 | warn |
| OCR 실패 safe failure row 생성 | 201 | safe `userMessage` 표시, 재촬영/파일 교체/수동 입력 제공 | warn |
| `scanLogId` 없음 또는 타 사용자 소유 | 404 | 목록 새로고침 또는 접근 불가 안내 | warn |
| 확정 불가 상태 | 409 | 상세 재조회 후 저장 버튼 상태 갱신 | warn |

Transaction:

- `GET` 계열: 필요 여부 없음. 조회 전용이다.
- `POST /api/business-card-scans`: OCR provider 호출은 DB transaction 밖에서 수행하고, 결과는 `BusinessCardScanLog` 단건 기록으로 남긴다.
- `POST /api/business-card-scans/:scanLogId/confirm`: `BusinessCardScanLog` 확정과 `Company`, `Contact`, 옵션 row 생성/재사용을 repository transaction으로 처리한다.
- analytics event `business_card_ocr_failed` 기록 실패는 본 사용자 작업을 rollback하지 않는다.

Observability:

- log event key: `businessCard.ocrSucceeded`, `businessCard.ocrFailed`, `businessCard.confirmed`
- analytics event: `business_card_ocr_failed`, `business_card_scan_confirmed`, `business_card_capture_started`, `business_card_capture_retried`
- audit log: 없음
- request id: OCR/confirm 흐름에서 사용
- redaction: 이미지 원본, OCR 추출 전문, prompt, provider raw response/error, 전화번호/이메일 원문 logging 금지
- provider error context: safe error code, retryable, provider/model, file size bucket 수준만 허용

FE/BE 처리 기준:

- FE는 `FormData.image`만 OCR 요청에 전송하고 `userId`, `organizationId`, `deviceId`, local draft id를 body에 넣지 않는다.
- FE는 OCR 실패 row의 safe failure만 사용자에게 표시하고 provider raw detail은 표시/저장/logging하지 않는다.
- FE는 confirm 성공 후 local draft를 삭제하고 business-card scan list/detail query를 갱신한다.
- BE는 `currentUser.id` 기준 ownership을 적용하고, 실패 row도 safe failure 필드만 응답한다.
