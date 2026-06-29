# BusinessCard DB Schema

실제 source of truth는 `BE/prisma/schema.prisma`와 migration이다.

## BusinessCardScanLog

명함등록 OCR 요청의 성공/실패와 사용자 확정 저장 결과를 남기는 로그 테이블이다. 업로드 이미지는 저장하지 않는다.

상태:

- `OCR_SUCCESS`: OCR 후보 값 생성 완료. 사용자가 확인/수정해야 한다.
- `OCR_FAILED`: OCR 자동 입력 실패. 에러 상세는 별도 애플리케이션 로그에 남긴다.
- `CONFIRMED`: 사용자가 확인한 값으로 회사/담당자 저장 완료.

주요 컬럼:

| 컬럼 | 의미 | nullable |
| --- | --- | --- |
| `id` | 로그 ID | no |
| `userId` | 요청 사용자 | no |
| `status` | `OCR_SUCCESS`, `OCR_FAILED`, `CONFIRMED` | no |
| `companyName` | OCR/보정 회사명 | yes |
| `companyFieldName` | OCR/보정 회사분야 | yes |
| `companyRegionName` | OCR/보정 회사지역 | yes |
| `contactName` | OCR/보정 담당자명 | yes |
| `contactMobile` | OCR/보정 휴대폰. 저장 확정 시 `010-0000-0000` 형식 | yes |
| `contactEmail` | OCR/보정 이메일 | yes |
| `contactDepartmentName` | OCR/보정 부서 | yes |
| `contactJobGradeName` | OCR/보정 직급 | yes |
| `companyId` | 확정 저장 후 연결 회사 | yes |
| `contactId` | 확정 저장 후 연결 담당자 | yes |
| `companyResolution` | `EXISTING` 또는 `CREATED` | yes |
| `contactResolution` | `EXISTING` 또는 `CREATED` | yes |
| `aiProvider` | 현재 기본값 `OPENAI` | no |
| `aiModel` | OCR 호출 모델 | no |
| `promptSnapshot` | OCR 요청 당시 prompt 스냅샷 | no |
| `requestToken` | provider input token | yes |
| `responseToken` | provider output token | yes |
| `totalToken` | provider total token | yes |
| `requestCost` | input cost. 현재 가격표를 코드에 고정하지 않아 nullable | yes |
| `responseCost` | output cost. 현재 가격표를 코드에 고정하지 않아 nullable | yes |
| `totalCost` | total cost. 현재 가격표를 코드에 고정하지 않아 nullable | yes |
| `costCurrency` | 비용 통화. 기본값 `USD` | no |
| `pendingTimeMs` | OCR 요청 처리 시간(ms) | yes |
| `confirmedAt` | 확정 저장 시각 | yes |
| `createdAt` | 생성 시각 | no |
| `updatedAt` | 수정 시각 | no |

인덱스:

- `[userId, createdAt]`: 사용자별 최신 명함 스캔 내역
- `[userId, status, createdAt]`: 상태 필터. FE 상태 다중 필터는 `GET /api/business-card-scans`에 반복 query 또는 comma-separated query로 전달한다.
- `[userId, companyId]`: 확정 저장 후 회사 기준 분석
- `[userId, contactId]`: 확정 저장 후 담당자 기준 분석

목록 조회 기준:

- 사용자별 내역은 등록일 최신순으로 보여준다.
- 별도 정렬 조건은 두지 않는다.
- status는 `OCR_SUCCESS`, `OCR_FAILED`, `CONFIRMED` 중 여러 값을 동시에 필터링할 수 있다.

저장 흐름:

1. `POST /api/business-card-scans`가 이미지를 OCR provider에 전달한다.
2. OpenAI adapter는 strict JSON schema 응답으로 회사/담당자 후보 값을 받는다.
3. 성공/실패와 관계없이 `BusinessCardScanLog`를 생성한다.
4. 성공 시 FE는 추출값을 사용자에게 보여주고 확인/수정하게 한다.
5. `POST /api/business-card-scans/:scanLogId/confirm`이 보정값으로 기존 회사/담당자를 재사용하거나 새로 만든다.
6. 같은 transaction에서 scan log를 `CONFIRMED`로 업데이트하고 `companyId`, `contactId`, resolution을 기록한다.
