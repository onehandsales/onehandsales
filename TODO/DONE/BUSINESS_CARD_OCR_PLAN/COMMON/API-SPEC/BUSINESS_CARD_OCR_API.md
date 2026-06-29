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

명함등록 요청. `multipart/form-data`의 `image` 파일을 받는다.

처리:

- OpenAI OCR provider 호출
- 성공 시 `BusinessCardScanLog.status=OCR_SUCCESS`
- 실패 시 `BusinessCardScanLog.status=OCR_FAILED`
- Company/Contact는 생성하지 않음

응답은 `BusinessCardScanLog` 단건이다.

### GET `/api/business-card-scans`

명함 스캔 내역 조회.

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
