# BusinessCard OCR API

기준일: 2026-06-29

## 목표

명함 이미지를 업로드하면 OCR 후보 값을 자동 입력하고, 사용자가 확인/수정한 뒤 회사와 담당자로 저장한다. 이미지는 저장하지 않는다.

## 상태

- `OCR_SUCCESS`: OCR 후보 값 생성 완료
- `OCR_FAILED`: OCR 실패 로그 생성 완료
- `CONFIRMED`: 사용자 확인 후 회사/담당자 저장 완료

## Endpoints

### POST `/api/business-card-scans`

명함스캔 요청. `multipart/form-data`의 `image` 파일을 받는다.

처리:

- OpenAI OCR provider 호출
- OpenAI adapter는 strict JSON schema 응답을 요구함
- 성공 시 `BusinessCardScanLog.status=OCR_SUCCESS`
- 실패 시 `BusinessCardScanLog.status=OCR_FAILED`
- Company/Contact는 생성하지 않음

응답은 `BusinessCardScanLog` 단건이다.

### GET `/api/business-card-scans`

명함 스캔 내역 조회.

정렬:

- 등록일 최신순 고정
- 별도 sort query 없음

Query:

- `page?: number`
- `status?: OCR_SUCCESS | OCR_FAILED | CONFIRMED`
- `status`는 반복 query 또는 comma-separated query로 여러 개 전달할 수 있다.
  - 예: `?status=OCR_SUCCESS&status=CONFIRMED`
  - 예: `?status=OCR_SUCCESS,CONFIRMED`

응답:

- `items`
- `page`
- `pageSize`
- `totalCount`
- `totalPages`

### GET `/api/business-card-scans/:scanLogId`

명함 스캔 로그 상세 조회.

### POST `/api/business-card-scans/:scanLogId/confirm`

사용자가 확인/수정한 값을 저장한다.

Body:

- `companyName`
- `companyFieldName?`
- `companyRegionName?`
- `contactName`
- `contactMobile`: `010-0000-0000`
- `contactEmail`
- `contactDepartmentName?`
- `contactJobGradeName?`

처리:

- `OCR_SUCCESS` 로그만 확정 가능
- 기존 회사가 있으면 재사용하고 없으면 생성
- 기존 담당자가 같은 회사 안에서 휴대폰 또는 이메일로 확인되면 재사용하고 없으면 생성
- 회사분야/회사지역/부서/직급이 비어 있으면 기본 옵션으로 연결
- 같은 transaction에서 `BusinessCardScanLog.status=CONFIRMED`, `companyId`, `contactId`, resolution을 업데이트

## Observability

- 실패 상세는 `BusinessCardScanLog`에 저장하지 않는다.
- provider 실패 원인은 structured application log에 남긴다.
- prompt snapshot, model, token/cost metric, `costCurrency`, `pendingTimeMs`는 로그 테이블에 저장한다.

## API_SPEC_TEMPLATE_NORMALIZATION G03 보강

판단: 현재 `BusinessCardController`, `BusinessCardApplicationService`, User Web `business-card-api.ts` 기준으로 템플릿 누락 항목만 보강한다. API path, method, request/response 의미는 변경하지 않는다.

- 계약 상태: `implemented`
- 소비자: User Web
- 호환성: 기존 `/api/business-card-scans*` 계약 유지. breaking change 없음
- 인증: User `AuthGuard`
- 권한: 현재 로그인한 사용자 소유 `BusinessCardScanLog`만 조회/확정한다. 확정 저장 시 생성/재사용되는 `Company`, `Contact`, 옵션 row도 같은 `userId` 범위로 제한한다.

| API 이름 | API 식별자 | Method | Path | Request 이름 | Response 이름 |
|---|---|---|---|---|---|
| 명함 스캔 로그 목록 조회 API | `ListBusinessCardScanLogs` | `GET` | `/api/business-card-scans` | `ListBusinessCardScansQueryDto` | `BusinessCardScanLogPageResponse` / FE `BusinessCardScanLogPage` |
| 명함 이미지 OCR 스캔 API | `ScanBusinessCard` | `POST` | `/api/business-card-scans` | `ScanBusinessCardMultipartRequest` (`image` multipart field, DTO class 없음) | `BusinessCardScanLogResponse` / FE `BusinessCardScanLog` |
| 명함 스캔 로그 단건 조회 API | `GetBusinessCardScanLog` | `GET` | `/api/business-card-scans/:scanLogId` | `BusinessCardScanLogPathParams` | `BusinessCardScanLogResponse` / FE `BusinessCardScanLog` |
| 명함 OCR 결과 확정 저장 API | `ConfirmBusinessCardScan` | `POST` | `/api/business-card-scans/:scanLogId/confirm` | `ConfirmBusinessCardScanDto` | `ConfirmBusinessCardScanResponse` / FE `BusinessCardConfirmResponse` |

Error FE 처리/log level:

| 상황 | HTTP | FE 처리 | log level |
|---|---:|---|---|
| 인증 없음 | 401 | 로그인/토큰 갱신 흐름으로 이동 | warn |
| `scanLogId`가 없거나 타 사용자 소유 | 404 | 목록 새로고침 또는 접근 불가 안내 | warn |
| 이미지 없음, MIME/크기/품질 오류 | 400 | 파일 선택/교체 안내, 재시도 가능 상태 유지 | warn |
| OCR provider 실패 | 502/503 또는 safe failure payload | 안전 메시지와 재시도 가능 여부 표시 | error |

Transaction:

- `GET` 계열: 필요 없음. 조회 전용
- `POST /api/business-card-scans`: `BusinessCardScanLog` 단건 기록. 회사/담당자 생성 없음
- `POST /api/business-card-scans/:scanLogId/confirm`: `BusinessCardScanLog` 확정과 `Company`, `Contact`, 옵션 row 생성/재사용을 repository transaction으로 처리한다.
- 외부 Provider: OCR provider 호출은 확정 저장 transaction 밖에서 수행한다.

Observability:

- log event key: `businessCard.ocrSucceeded`, `businessCard.confirmed`
- analytics event: `business_card_ocr_failed`, `business_card_scan_confirmed`
- audit log: 없음
- request id: OCR/confirm 흐름에서 사용
- redaction: 이미지 원본, prompt 원문, provider raw response, 전화번호/이메일 원문 logging 금지
- provider error context: safe error code, retryable, provider/model, file size bucket 수준만 허용

FE/BE 처리 기준:

- FE는 `FormData.image`만 OCR 요청에 전송하고, 확정 전 사용자가 보정한 필드만 confirm body로 보낸다.
- FE는 OCR 실패 로그도 목록/상세에서 표시하되 provider 원문 오류를 노출하지 않는다.
- BE는 OCR 성공 시 `OCR_SUCCESS`, 실패 시 `OCR_FAILED`, 확정 시 `CONFIRMED` 상태를 유지한다.
- BE는 confirm에서 기존 회사/담당자를 재사용하거나 같은 사용자 범위에 새로 만든다.
