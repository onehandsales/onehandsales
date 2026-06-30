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
