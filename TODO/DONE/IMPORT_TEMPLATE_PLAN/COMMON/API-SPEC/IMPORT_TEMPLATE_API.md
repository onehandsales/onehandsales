# Import Template API

## GET /api/import-templates/active

활성화된 데이터 불러오기 양식 목록을 조회한다.

### Response
```json
{
  "items": [
    {
      "id": "00000000-0000-4000-8000-000000010001",
      "templateType": "COMPANY",
      "templateVersion": "v1",
      "templateName": "회사_불러오기_양식_v1.xlsx",
      "columns": [
        {
          "key": "companyName",
          "label": "회사이름",
          "required": true,
          "type": "text"
        }
      ],
      "sampleRows": [
        {
          "companyName": "원핸드세일즈"
        }
      ],
      "createdAt": "2026-06-30T00:00:00.000Z",
      "updatedAt": "2026-06-30T00:00:00.000Z"
    }
  ]
}
```

## GET /api/import-templates/{templateId}/download

선택한 데이터 불러오기 양식을 xlsx 파일로 다운로드한다.

### Query
| 이름 | 필수 | 설명 |
|---|---:|---|
| `companyName` | 담당자 양식만 필수 | 담당자 양식의 회사 컬럼에 미리 넣을 회사명 |

### Response
- `Content-Type`: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- `Content-Disposition`: `attachment`

## 1차 활성 양식
| templateType | templateVersion | 컬럼 |
|---|---|---|
| `COMPANY` | `v1` | 회사이름, 회사분야, 회사지역 |
| `PRODUCT` | `v1` | 제품이름, 제품단가, 제품 카테고리, 제품 상태 |
| `CONTACT` | `v1` | 회사, 담당자 이름, 담당자 이메일, 담당자 핸드폰 번호, 담당자 부서, 담당자 직급 |
| `DEAL` | `v1` | 딜 이름, 딜 금액, 딜 단계, 회사명, 담당자명, 제품명, 예상 마감일 |

## POST /api/imports

CSV/XLSX 파일을 업로드해 확정 전 임시 import job을 만든다.

### Request
- `Content-Type`: `multipart/form-data`
- `targetType`: `COMPANY`, `CONTACT`, `PRODUCT`, `DEAL`.
- `file`: CSV/XLSX 파일. 최대 10MB.

### Response
```json
{
  "id": "00000000-0000-4000-8000-000000040001",
  "targetType": "COMPANY",
  "status": "UPLOADED",
  "rowCount": 2,
  "validRowCount": 0,
  "invalidRowCount": 0,
  "mapping": null,
  "aiMapping": null,
  "previewRows": [
    {
      "id": "00000000-0000-4000-8000-000000050001",
      "rowNumber": 2,
      "rawData": {
        "회사이름": "원핸드세일즈"
      },
      "mappedData": null,
      "status": "UPLOADED",
      "errors": []
    }
  ],
  "errors": [],
  "createdAt": "2026-07-01T00:00:00.000Z",
  "updatedAt": "2026-07-01T00:00:00.000Z"
}
```

## API_SPEC_TEMPLATE_NORMALIZATION G03 보강

판단: 현재 `ImportTemplateController`, `ImportUserLogController`, `DataImportApplicationService`, User Web `import-template-api.ts`/`import-user-log-api.ts` 기준으로 템플릿 누락 항목만 보강한다. 이 문서에 함께 남아 있는 `/api/imports*` job 계약은 기존 구현 이력으로 유지하며 API 의미를 변경하지 않는다.

- 계약 상태: `implemented`
- 소비자: User Web
- 호환성: 기존 `/api/import-templates/*`, `/api/import-user-logs*`, `/api/imports*` path/method/request/response 유지. breaking change 없음
- 인증: User `AuthGuard`
- 권한: 활성 양식 목록은 인증 사용자 공통 read 계약이다. 양식 다운로드와 import user log 조회/상세는 현재 사용자 context와 본인 성공 이력만 사용한다.

| API 이름 | API 식별자 | Method | Path | Request 이름 | Response 이름 |
|---|---|---|---|---|---|
| 활성 데이터 불러오기 양식 목록 조회 API | `ListActiveImportTemplates` | `GET` | `/api/import-templates/active` | `EmptyRequest` | `ImportTemplateListResponse` |
| 데이터 불러오기 양식 xlsx 다운로드 API | `DownloadImportTemplate` | `GET` | `/api/import-templates/:templateId/download` | `DownloadImportTemplateQueryDto` | `ExportedXlsxFileResponse` / FE `DownloadImportTemplateResponse` |
| 데이터 불러오기 성공 이력 목록 조회 API | `ListImportUserLogs` | `GET` | `/api/import-user-logs` | `ListImportUserLogsQueryDto` | `ImportUserLogPageResponse` |
| 데이터 불러오기 성공 이력 상세 조회 API | `GetImportUserLog` | `GET` | `/api/import-user-logs/:importUserLogId` | `ImportUserLogPathParams` | `ImportUserLogDetailResponse` / FE `ImportUserLogDetail` |

Error FE 처리/log level:

| 상황 | HTTP | FE 처리 | log level |
|---|---:|---|---|
| 인증 없음 | 401 | 로그인/토큰 갱신 흐름 | warn |
| query/path validation 실패 | 400 | field error 또는 toast | warn |
| 활성 양식 또는 본인 import user log 없음 | 404 | 목록 새로고침 또는 접근 불가 안내 | warn |
| xlsx 생성/다운로드 실패 | 500 | 다운로드 실패 toast와 재시도 안내 | error |

Transaction:

- `GET /api/import-templates/active`: 필요 없음. 조회 전용
- `GET /api/import-templates/:templateId/download`: 필요 없음. template 조회와 xlsx 생성만 수행
- `GET /api/import-user-logs`: 필요 없음. 조회 전용
- `GET /api/import-user-logs/:importUserLogId`: 필요 없음. 조회 전용
- `/api/imports/:importJobId/confirm`은 기존 계약대로 도메인 row 생성과 `ImportUserLog`/`ImportUserLogRow` 생성을 같은 transaction에서 처리한다.

Observability:

- log event key: `import-templates`/`import-user-logs` 조회 API에는 현재 별도 application `logEvent`가 없다.
- import job 계열 event: `importJob.created`, `importJob.mapped`, `importJob.mappingUpdated`, `importJob.validated`, `importJob.confirmed`, `importJob.canceled`, `importJob.errorsListed`
- audit log: 없음
- request id: 다운로드와 import job mutation 흐름에서 사용
- redaction: 원본 파일 내용, row 원문, storage key/raw error detail logging 금지
- provider error context: mapping provider 사용 시 raw provider payload 저장 금지

FE/BE 처리 기준:

- FE는 활성 양식 조회 결과로 template type/column/sample row를 렌더링하고, 다운로드는 blob 응답으로 처리한다.
- FE는 성공 이력 목록 query에 `page`, `targetTypes`만 보낸다.
- BE는 import user log 조회에서 `currentUser.id` ownership을 적용하고, row snapshot을 응답 DTO로 정규화한다.
- BE는 xlsx 파일 생성 후 `Content-Disposition`/xlsx content type을 내려준다.

## GET /api/imports/{importJobId}

확정 전 임시 import job 상세와 전체 row를 조회한다. 임시 job은 in-memory store에 있으므로 서버 재시작 후 복구되지 않는다.

### Response
```json
{
  "job": {
    "id": "00000000-0000-4000-8000-000000040001",
    "targetType": "COMPANY",
    "status": "MAPPING_READY",
    "rowCount": 2,
    "validRowCount": 2,
    "invalidRowCount": 0,
    "mapping": {
      "companyName": "회사이름",
      "companyField": "회사분야",
      "companyRegion": "회사지역"
    },
    "aiMapping": {
      "suggestedMapping": {
        "companyName": "회사이름"
      },
      "confidence": 0.98,
      "unmappedColumns": []
    },
    "previewRows": [],
    "errors": [],
    "createdAt": "2026-07-01T00:00:00.000Z",
    "updatedAt": "2026-07-01T00:00:00.000Z"
  },
  "rows": [],
  "errors": []
}
```

## POST /api/imports/{importJobId}/map

원본 파일 헤더를 대상 양식 컬럼에 AI로 자동 매핑한다. provider 실패 시 규칙 기반 매핑으로 fallback한다.

### Response
```json
{
  "suggestedMapping": {
    "companyName": "회사이름",
    "companyField": "회사분야",
    "companyRegion": "회사지역"
  },
  "confidence": 0.98,
  "unmappedColumns": []
}
```

## PATCH /api/imports/{importJobId}/mapping

사용자가 수정한 컬럼 매핑을 적용하고 모든 row를 검증한다.

### Request
```json
{
  "mapping": {
    "companyName": "회사이름",
    "companyField": "회사분야",
    "companyRegion": "회사지역"
  }
}
```

### Response

`POST /api/imports`와 같은 job response를 반환한다. 각 row는 `mappedData`, `status`, `errors`를 포함한다.

## POST /api/imports/{importJobId}/confirm

사용자가 최종 확인한 row로 회사/담당자/제품/딜 데이터를 생성하고 성공 내역을 저장한다.

### Request
`rows`를 생략하면 현재 job의 검증 완료 row를 사용한다. 사용자가 화면에서 값을 수정한 경우 row 번호와 보정 데이터를 전달한다.

```json
{
  "contactCompanyResolutions": [
    {
      "companyName": "원핸드세일즈",
      "companyFieldName": "IT",
      "companyRegionName": "서울"
    }
  ],
  "dealCompanyResolutions": [
    {
      "companyName": "한빛테크",
      "companyFieldName": "제조",
      "companyRegionName": "부산"
    }
  ],
  "dealContactResolutions": [
    {
      "companyName": "한빛테크",
      "contactName": "김도윤",
      "contactEmail": "doyoon@example.com",
      "contactPhone": "010-0000-0000",
      "contactDepartmentName": "영업팀",
      "contactJobGradeName": "팀장"
    }
  ],
  "dealProductResolutions": [
    {
      "productName": "세일즈 파이프라인 Enterprise",
      "productPrice": 12000000,
      "productCategoryName": "솔루션",
      "productStatusName": "판매중"
    }
  ],
  "rows": [
    {
      "rowNumber": 2,
      "data": {
        "companyName": "원핸드세일즈",
        "companyField": "IT",
        "companyRegion": "서울"
      }
    }
  ]
}
```

### Response
```json
{
  "id": "00000000-0000-4000-8000-000000040001",
  "status": "COMPLETED",
  "successCount": 1,
  "failedCount": 0,
  "errors": []
}
```

### 처리 기준
- 확정 저장은 도메인 row 생성과 `ImportUserLog`/`ImportUserLogRow` 생성을 같은 transaction에서 처리한다.
- `COMPANY`는 회사명/분야/지역을 저장한다.
- `PRODUCT`는 제품명/가격/카테고리/상태를 저장한다.
- `CONTACT`는 회사명으로 사용자 소유 회사를 찾거나 만들고 담당자를 저장한다.
- `DEAL`은 딜이름, 금액, 단계, 예상 마감일을 저장하고 회사/담당자/제품 이름을 기준으로 `DealCompany`, `DealContact`, `DealProduct` 연결 row를 만든다.
- `DEAL` 확정 시 기존 회사/담당자/제품이 없으면 `dealCompanyResolutions`, `dealContactResolutions`, `dealProductResolutions`에 담긴 사용자 보정값으로 필요한 데이터를 생성한다.

## GET /api/import-user-logs

성공 확정된 데이터 불러오기 내역 목록을 조회한다.

### Query
| 이름 | 필수 | 설명 |
|---|---:|---|
| `page` | 아니오 | 1부터 시작하는 페이지 번호 |
| `targetType` | 아니오 | `COMPANY`, `CONTACT`, `PRODUCT`, `DEAL` |

### Response
```json
{
  "items": [
    {
      "id": "00000000-0000-4000-8000-000000020001",
      "targetType": "COMPANY",
      "templateVersion": "v1",
      "contextLabel": null,
      "originalFileName": "companies.xlsx",
      "fileSizeBytes": 12000,
      "totalRowCount": 30,
      "importedRowCount": 30,
      "createdAt": "2026-06-30T00:00:00.000Z"
    }
  ],
  "page": 1,
  "pageSize": 10,
  "totalCount": 1,
  "totalPages": 1
}
```

## GET /api/import-user-logs/{importUserLogId}

성공 확정된 데이터 불러오기 내역의 상세와 row snapshot을 조회한다.

### Response
```json
{
  "id": "00000000-0000-4000-8000-000000020001",
  "targetType": "COMPANY",
  "templateVersion": "v1",
  "contextLabel": null,
  "originalFileName": "companies.xlsx",
  "fileSizeBytes": 12000,
  "totalRowCount": 30,
  "importedRowCount": 30,
  "createdAt": "2026-06-30T00:00:00.000Z",
  "templateColumns": [
    {
      "key": "companyName",
      "label": "회사이름",
      "required": true,
      "type": "text"
    }
  ],
  "context": null,
  "rows": [
    {
      "id": "00000000-0000-4000-8000-000000030001",
      "rowNumber": 2,
      "submittedData": {
        "companyName": "원핸드세일즈"
      },
      "targetLabel": "원핸드세일즈",
      "createdAt": "2026-06-30T00:00:00.000Z"
    }
  ]
}
```
