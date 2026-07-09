# DataImport Schema

이 문서는 `BE/prisma/schema.prisma` 기준 DataImport 양식과 성공 내역 table을 설명한다.

## 1. 범위

현재 구현 범위:

- 활성 불러오기 양식 조회
- 양식 xlsx 다운로드
- 회사/담당자/제품/딜 CSV/XLSX 업로드
- AI 컬럼 매핑과 규칙 기반 fallback
- 사용자 mapping/row 보정 후 검증
- 확정 저장과 성공 내역 snapshot 조회

현재 제외 범위:

- 확정 전 임시 ImportJob DB 영속화
- 서버 재시작 후 임시 job 복구
- 범용 ExportJob

## 2. ImportTemplateType

Prisma enum:

```text
COMPANY
CONTACT
PRODUCT
DEAL
```

현재 활성 양식과 확정 저장은 `COMPANY`, `CONTACT`, `PRODUCT`, `DEAL`을 지원한다.

## 3. ImportTemplate

목적:

- 사용자에게 제공할 불러오기 양식 정의를 저장한다.
- 컬럼 정의와 샘플 row를 JSON으로 저장한다.
- 같은 `templateType`, `templateVersion` 조합은 하나만 존재한다.

주요 컬럼:

- `id`: UUID PK
- `templateType`: `ImportTemplateType`
- `templateVersion`: 양식 버전 문자열
- `templateName`: 다운로드 파일명
- `columnsJson`: 컬럼 key/label/required/type 정의 JSON
- `sampleRowsJson`: 샘플 row JSON
- `isActive`: 활성 양식 여부
- `createdAt`, `updatedAt`: UTC timestamp

index:

- unique `templateType, templateVersion`
- index `templateType, isActive`

현재 seed 양식:

- `COMPANY` v1: 회사이름, 회사분야, 회사지역
- `PRODUCT` v1: 제품이름, 제품단가, 제품 카테고리, 제품 상태
- `CONTACT` v1: 회사, 담당자 이름, 담당자 이메일, 담당자 핸드폰 번호, 담당자 부서, 담당자 직급
- `DEAL` v1: 딜 이름, 딜 금액, 딜 단계, 회사명, 담당자명, 제품명, 예상 마감일

## 4. ImportUserLog

목적:

- 사용자가 확정 저장에 성공한 불러오기 작업의 header snapshot을 저장한다.
- 확정 전 임시 job 상태는 저장하지 않는다.

주요 컬럼:

- `id`: UUID PK
- `userId`: 소유 사용자
- `targetType`: `ImportTemplateType`
- `templateVersion`: 사용한 양식 버전
- `templateColumnsJson`: 확정 당시 양식 컬럼 snapshot
- `contextLabel`: 담당자 불러오기처럼 화면에 보여줄 context label
- `contextJson`: 확정 당시 context JSON
- `originalFileName`: 원본 업로드 파일명
- `fileSizeBytes`: 원본 파일 크기
- `totalRowCount`: 업로드 파일 전체 row 수
- `importedRowCount`: 확정 저장된 row 수
- `createdAt`: UTC timestamp

index:

- `userId, createdAt`
- `userId, targetType, createdAt`

## 5. ImportUserLogRow

목적:

- 확정 저장된 각 row의 제출 데이터 snapshot과 생성 대상 label을 저장한다.
- 상세 화면에서 사용자가 어떤 값을 확정했는지 조회할 수 있게 한다.

주요 컬럼:

- `id`: UUID PK
- `importUserLogId`: `ImportUserLog` FK
- `rowNumber`: 원본 파일 row 번호
- `submittedDataJson`: 확정 저장에 사용한 정규화 데이터 JSON
- `targetLabel`: 생성 대상 대표 label
- `createdAt`: UTC timestamp

index:

- `importUserLogId, rowNumber`

## 6. 확정 저장 정책

- 회사 불러오기는 회사명, 회사분야, 회사지역을 저장한다.
- 제품 불러오기는 제품명, 제품단가, 제품 카테고리, 제품 상태를 저장한다.
- 담당자 불러오기는 회사명으로 사용자 소유 회사를 찾거나 만들고, 담당자 정보를 저장한다.
- 딜 불러오기는 회사명, 담당자명, 제품명으로 기존 사용자 소유 데이터를 찾은 뒤 딜과 `DealCompany`, `DealContact`, `DealProduct` 연결 row를 저장한다. 누락 회사/담당자/제품 보정값 생성 흐름은 application type/use case와 DTO에는 표현되어 있으나, 현재 FE API 함수와 BE HTTP controller confirm 전달 경로 검토가 필요하다.
- 확정 저장은 도메인 row 생성과 `ImportUserLog`/`ImportUserLogRow` 생성을 같은 transaction에서 처리한다.
- 검증 실패 row가 있으면 확정 전에 보정해야 한다.

## 7. 관련 API

- `GET /api/import-templates/active`
- `GET /api/import-templates/:templateId/download`
- `POST /api/imports`
- `GET /api/imports/:importJobId`
- `POST /api/imports/:importJobId/map`
- `PATCH /api/imports/:importJobId/mapping`
- `POST /api/imports/:importJobId/confirm`
- `GET /api/import-user-logs`
- `GET /api/import-user-logs/:importUserLogId`
