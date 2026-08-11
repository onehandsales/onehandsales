# G07 Import Export Localization

상태: Done
완료일: 2026-07-28
목표: Import template과 domain export를 사용자 앱 설정값 기준으로 현지화한다.

## 1. 포함 범위

- Import template `ko-KR`, `en` 선택 다운로드
- Export header locale 적용
- Export 날짜/시간 timezone 적용
- Export 통화 표시 적용
- Contact export 전화번호 글로벌 컬럼 적용
- Import validation display 문구 locale 처리

## 2. 제외 범위

- Generic ExportJob 신규 구현
- JP/TW template
- 전체 import parser 재작성
- 결제/세금용 invoice export

## 3. Backend 작업

1. 기존 Import template download API와 구조를 확인한다.
2. `locale=ko-KR|en` 파라미터를 지원한다.
3. locale별 template header dictionary를 만든다.
4. 기존 도메인별 export API에서 사용자 locale/timezone/currency를 사용한다.
5. Contact export에 Phone, Phone Country, Phone E.164를 포함한다.
6. Product/Deal export가 currency-aware하게 동작한다.
7. validation error는 code/field/cell 중심으로 유지한다.

## 4. Frontend 작업

1. Import 화면에 template language 선택 UI를 추가한다.
2. 기본 선택값은 `User.preferredLocale`이다.
3. Export 버튼/다운로드 문구를 app i18n으로 바꾼다.
4. Import preview validation message를 FE locale 문구로 표시한다.

## 5. Request 계약

Import template download 요청은 locale을 받을 수 있다.

```text
GET /api/import-templates/{templateId}/download?locale=ko-KR
GET /api/import-templates/{templateId}/download?locale=en
```

기존 domain export 요청은 유지하되 사용자 app 설정을 기준으로 header/value를 만든다.

```text
GET /api/contacts/export/xlsx
GET /api/products/export/xlsx
GET /api/deals/export/xlsx
GET /api/companies/export/xlsx
```

## 6. Response 계약

Import template response는 XLSX file이다.

Export response는 XLSX file이며 header/value 정책은 다음을 따른다.

- header: 사용자 `preferredLocale`
- 날짜/시간: 사용자 `timeZone`
- 통화: row `currencyCode`
- 전화번호: 표시용 Phone, Phone Country, Phone E.164

에러 후보:

```json
{
  "code": "IMPORT_TEMPLATE_LOCALE_UNSUPPORTED",
  "field": "locale"
}
```

## 7. Business Logic

- Import template은 `ko-KR`, `en`만 1차 지원한다.
- 기본 선택값은 `User.preferredLocale`이다.
- 지원하지 않는 locale은 fallback한다.
- Generic ExportJob은 만들지 않는다.
- Export는 기존 도메인별 API 안에서 현지화한다.

## 8. User Flow

1. 사용자가 Import 화면에서 템플릿 언어를 선택한다.
2. Korean 또는 English template을 다운로드한다.
3. 사용자가 도메인 목록에서 Export를 실행한다.
4. Export 파일은 사용자 설정 기준 header/value를 가진다.
5. Contact export는 사람이 읽는 번호와 E.164 기준값을 함께 제공한다.

## 9. DB/Prisma 영향

G07은 기본적으로 새 table을 만들지 않는다.

필수 참조:

- `BE/prisma/schema.prisma`의 `ImportTemplate`, `ImportUserLog`, `ImportUserLogRow`
- `BE/prisma/migrations`의 DataImport 관련 migration
- `BE/prisma/seed.ts`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/DATA_IMPORT_SCHEMA.md`

DB 변경이 필요하다고 판단되면:

- G01 또는 별도 보정 문서에 먼저 사유를 기록한다.
- 새 table/column에는 Prisma `/// 기능 : ...` 주석과 migration `COMMENT ON ...`을 추가한다.

## 10. 검증

```powershell
cd BE
pnpm run typecheck
pnpm run lint
pnpm run test -- import export contact product deal company
pnpm run build
```

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
```

## 11. Goal 검토 체크리스트

- [x] Import template locale 선택이 있다.
- [x] `ko-KR`, `en` template header가 있다.
- [x] template request에 `locale` 계약이 있다.
- [x] export response 파일의 header/value 정책이 문서와 일치한다.
- [x] business logic이 Generic ExportJob 제외를 지킨다.
- [x] user flow에서 템플릿 언어 선택과 도메인 export가 동작한다.
- [x] DB 변경 없음 또는 변경 시 `BE/prisma` 참고와 한글 주석 기준을 지켰다.
- [x] Export header가 사용자 locale을 따른다.
- [x] Export date/time이 사용자 timezone을 따른다.
- [x] Export currency가 row currencyCode를 따른다.
- [x] Contact export에 Phone Country와 Phone E.164가 있다.
- [x] validation display 문구가 FE locale을 따른다.
- [x] 신규 코드에 한글 주석 규칙이 적용됐다.
- [x] 실행한 검증 결과를 기록했다.

## 12. 완료 기록

- 완료일: 2026-07-28
- DB 변경: 없음
- Backend 주요 구현: import template `locale=ko-KR|en` 다운로드, xlsx locale/timezone/currency 공통 helper, 회사/담당자/제품/딜 도메인 export header/value 현지화, 담당자 Phone/Phone Country/Phone E.164 export 검증
- Frontend 주요 구현: import template language selector, template download locale query, export 다운로드 문구 app i18n, import review cell/problem validation 문구 locale 표시
- 금지사항 확인: 신규 Generic ExportJob과 신규 DB table을 추가하지 않았다.

검증 결과:

```powershell
cd BE
pnpm.cmd typecheck
pnpm.cmd lint
pnpm.cmd test -- product-application.service.spec.ts deal-application.service.spec.ts contact-application.service.spec.ts data-import-application.service.spec.ts
pnpm.cmd test
pnpm.cmd build
```

```powershell
cd FE/user-web
pnpm.cmd typecheck
pnpm.cmd lint
pnpm.cmd build
```

- BE `typecheck`, `lint`, 관련 service test, 전체 `test`, `build` 통과.
- FE `typecheck`, `lint`, `build` 통과.
- FE `build`는 기존 번들 크기 경고만 출력했다.
