# Import Export Localization API

상태: Ready for Goal Execution

## 1. 목적

Import template과 domain export를 사용자 앱 설정값 기준으로 현지화한다.

## 2. 계약 개요

- 계약 상태: confirmed
- 소비자: User Web
- 호환성: 기존 Import template download와 도메인별 export API를 유지하면서 locale/query와 header/value 정책을 확장한다.
- 인증: User AuthGuard
- 권한: 현재 사용자 소유 template/export 대상만 접근

## 3. Import Template

- API 이름: Import 템플릿 다운로드 API
- API 식별자: DownloadLocalizedImportTemplate
- Method: GET
- Path: `/api/import-templates/:templateId/download`
- Request 이름: `DownloadImportTemplateQueryDto`
- Response 이름: XLSX file response
- Status: `200`

요청 후보:

```text
GET /api/import-templates/{templateId}/download?locale=ko-KR
GET /api/import-templates/{templateId}/download?locale=en
```

정책:

- 1차 지원 locale은 `ko-KR`, `en`이다.
- 기본 locale은 `User.preferredLocale`이다.
- 지원하지 않는 locale은 `en` 또는 사용자 locale fallback으로 처리한다.
- 템플릿 언어 선택 UI는 Import 화면에서 제공한다.

Business Logic / 비즈니스 로직 흐름:

1. AuthGuard로 현재 사용자를 확인한다.
2. `templateId` path param과 locale query를 validation한다.
3. locale이 없으면 `User.preferredLocale`을 기본값으로 사용한다.
4. 지원하지 않는 locale이면 fallback 정책을 적용한다.
5. locale별 header dictionary로 XLSX template을 생성한다.

연결된 DB 스키마:

- 조회: User, ImportTemplate
- 생성/수정: 없음
- transaction: 없음

Transaction:

- 필요 여부: 없음
- 이유: template file generation과 조회만 수행한다.
- 외부 Provider 호출 위치: 없음
- audit log 포함 여부: 없음

Observability:

- log event key: 실패 시 `import.template.downloadFailed`
- audit log: 없음
- request id: 사용
- redaction: 업로드 파일 row 원문 없음
- provider error context: 없음

## 4. Export

기존 도메인별 export API를 유지한다.

- API 이름: 도메인 XLSX Export API
- API 식별자: ExportLocalizedDomainXlsx
- Method: GET
- Path: 기존 Company/Contact/Product/Deal export path 유지
- Request 이름: 없음 또는 기존 export query DTO
- Response 이름: XLSX file response
- Status: `200`

정책:

- Generic ExportJob을 새로 만들지 않는다.
- Export header는 사용자 `preferredLocale`을 따른다.
- 날짜/시간 값은 사용자 `timeZone`을 따른다.
- 통화 값은 row의 `currencyCode`를 따른다.
- Contact 전화번호는 표시용 Phone, Phone Country, Phone E.164를 함께 제공한다.

Contact export 예시:

```text
Phone, Phone Country, Phone E.164
+1 (415) 555-1234, US, +14155551234
010-1234-5678, KR, +821012345678
```

한국어 예시:

```text
전화번호, 전화번호 국가, 국제 전화번호
010-1234-5678, KR, +821012345678
```

Business Logic / 비즈니스 로직 흐름:

1. AuthGuard로 현재 사용자를 확인한다.
2. export 대상 domain row를 `userId` ownership으로 조회한다.
3. 사용자 `preferredLocale`, `timeZone`, `defaultCurrencyCode`를 조회한다.
4. header는 locale dictionary로 생성한다.
5. 날짜/시간은 사용자 timezone으로 표시한다.
6. Contact phone은 글로벌 필드 우선, legacy `mobile` fallback으로 표시한다.
7. Product/Deal amount는 row `currencyCode` 기준으로 표시한다.

연결된 DB 스키마:

- 조회: User, Company, Contact, Product, Deal 및 각 domain lookup/연결 row
- 생성/수정: 없음
- transaction: 없음

Transaction:

- 필요 여부: 없음
- 이유: export는 조회와 파일 생성만 수행한다.
- 외부 Provider 호출 위치: 없음
- audit log 포함 여부: 없음

Observability:

- log event key: `company.export.downloaded`, `contact.export.downloaded`, `product.export.downloaded`, `deal.export.downloaded`
- audit log: 없음
- request id: 사용
- redaction: phone/email/deal amount 원문을 application log에 남기지 않는다.
- provider error context: 없음

## 5. Validation

- Import preview validation은 BE code/field/cell 중심으로 유지한다.
- FE가 locale별 문구를 표시한다.
- 템플릿 header와 validation 문구가 서로 일관되어야 한다.

## 6. FE/BE 처리 기준

- FE: template language selector 기본값은 `User.preferredLocale`이다.
- FE: export success는 file download로 처리하고 별도 response body를 기대하지 않는다.
- BE: locale header dictionary는 app i18n과 의미가 어긋나지 않게 관리한다.
- BE: 파일 생성 실패는 safe error code로 반환한다.

## 7. 구현 체크리스트

- [ ] Import template locale 선택 API가 있다.
- [ ] `ko-KR`, `en` header dictionary가 있다.
- [ ] Export header가 사용자 locale 기준으로 바뀐다.
- [ ] Export 날짜/시간이 사용자 timezone 기준으로 바뀐다.
- [ ] Product/Deal export가 currency-aware하다.
- [ ] Contact export가 legacy `mobile` fallback을 처리한다.
- [ ] Transaction 계약과 Observability 계약이 구현 결과와 일치한다.
- [ ] Backend/Frontend 신규 코드에 한글 주석 규칙이 적용된다.
