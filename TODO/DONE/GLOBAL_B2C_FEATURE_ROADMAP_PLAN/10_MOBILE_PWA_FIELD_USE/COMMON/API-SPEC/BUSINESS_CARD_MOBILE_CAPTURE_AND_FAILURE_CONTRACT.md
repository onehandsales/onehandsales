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
  imageUrl?: string | null;
  extracted: {
    name?: string | null;
    company?: string | null;
    department?: string | null;
    position?: string | null;
    phone?: string | null;
    mobile?: string | null;
    email?: string | null;
    address?: string | null;
    homepage?: string | null;
    memo?: string | null;
  };
  linked?: {
    companyId?: string | null;
    contactId?: string | null;
  };
  ai?: {
    provider?: string | null;
    model?: string | null;
  };
  usage?: {
    promptTokens?: number | null;
    completionTokens?: number | null;
    totalTokens?: number | null;
    estimatedCost?: string | null;
    pendingTimeMs?: number | null;
  };
  failure: {
    errorCode: BusinessCardOcrFailureCode;
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
| `IMAGE_TOO_LARGE` | 413 | true | 10MB 이하로 교체 |
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
