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

## POST /api/imports

CSV/XLSX 파일을 업로드해 확정 전 임시 import job을 만든다.

### Request
- `Content-Type`: `multipart/form-data`
- `targetType`: `COMPANY`, `CONTACT`, `PRODUCT`. `DEAL`은 현재 지원하지 않는다.
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
      "confidence": "HIGH",
      "reason": "헤더 이름이 양식 컬럼과 일치합니다."
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
  "confidence": "HIGH",
  "reason": "파일 헤더가 회사 불러오기 양식과 직접 대응됩니다."
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

사용자가 최종 확인한 row로 회사/담당자/제품 데이터를 생성하고 성공 내역을 저장한다.

### Request
`rows`를 생략하면 현재 job의 검증 완료 row를 사용한다. 사용자가 화면에서 값을 수정한 경우 row 번호와 보정 데이터를 전달한다.

```json
{
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
- `DEAL`은 현재 validation error로 차단한다.

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
