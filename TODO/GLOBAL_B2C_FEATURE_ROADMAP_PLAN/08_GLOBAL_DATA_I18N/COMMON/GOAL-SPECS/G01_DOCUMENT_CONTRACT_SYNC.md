# G01 Document Contract Sync

상태: Not Started
목표: 08 구현 전 현재 코드와 문서 계약을 대조하고 AGENT 문서 갱신 대상을 확정한다.

## 1. 목적

G01은 코드 구현이 아니라 구현 전 확인 goal이다. 08에서 바뀌는 auth/i18n/global data 정책이 현재 코드와 문서에 어떻게 충돌하는지 확인한다.

## 2. 포함 범위

- `BE/prisma/schema.prisma` User/Auth/Company/Contact/Product/Deal/DataImport 확인
- `BE/src/modules/auth`, `user`, `company`, `contact`, `product`, `deal`, `data-import` 확인
- `FE/user-web/src/app/router/router.tsx` 확인
- `FE/user-web/src/features/public-site/i18n`와 app i18n 분리 지점 확인
- 기존 AGENT 문서의 Google only, Apple/LINE future, provider-only 계정 판정 정책 갱신 대상 확인
- `COMMON/API-SPEC/*`, `BE-TODO`, `FE-TODO`, `DB-SCHEMA` 보정

## 3. 제외 범위

- Prisma schema 변경
- Backend endpoint 구현
- Frontend 화면 구현
- 대량 코드 변경

## 4. 작업

1. 08 확정 결정과 현재 코드 구조를 대조한다.
2. User global settings 필드 추가 방식이 기존 User schema와 충돌하지 않는지 확인한다.
3. Product/Deal currency 추가가 기존 import/export/report와 충돌하지 않는지 확인한다.
4. Contact phone 글로벌 필드가 기존 OCR/import/contact form과 충돌하지 않는지 확인한다.
5. CompanyRegion code 추가가 기존 사용자 커스텀 region API와 충돌하지 않는지 확인한다.
6. Auth provider 확장이 Supabase OAuth와 Backend exchange 구조에 맞는지 확인한다.
7. verified email account linking에 필요한 repository method와 unique 제약을 확인한다.
8. `/app` i18n foundation을 public-site i18n과 분리할 파일 위치를 정한다.
9. AGENT 문서 갱신 파일 목록을 확정한다.
10. blocking 질문이 있으면 문서에 남기고 다음 goal 착수를 막는다.

## 5. Request 계약

G01은 구현 goal이 아니므로 신규 request를 만들지 않는다.

검토해야 할 request 문서:

- `COMMON/API-SPEC/USER_GLOBAL_SETTINGS_API.md`
- `COMMON/API-SPEC/AUTH_PROVIDER_API.md`
- `COMMON/API-SPEC/DOMAIN_GLOBAL_DATA_API.md`
- `COMMON/API-SPEC/IMPORT_EXPORT_LOCALIZATION_API.md`

## 6. Response 계약

G01은 신규 response를 만들지 않는다.

검토 기준:

- 각 API spec의 response 예시가 현재 DTO/FE type과 충돌하지 않아야 한다.
- error response는 사용자 문구보다 `code`, `field` 중심이어야 한다.
- 날짜/시간 response는 ISO 유지 원칙과 충돌하지 않아야 한다.

## 7. Business Logic

- 08 확정 결정이 현재 코드와 충돌하는지 검토한다.
- 기존 한국 사용자 데이터 보존 조건을 확인한다.
- Google only와 provider-only 판정 정책을 verified email linking 정책으로 갱신할 수 있는지 확인한다.

## 8. User Flow

- `COMMON/USER-FLOW.md`의 신규 가입, 다른 provider 로그인, 설정 변경, Import/Export 흐름이 현재 FE route와 맞는지 확인한다.
- `/app` URL에 locale prefix를 넣지 않는 흐름을 다시 확인한다.

## 9. DB/Prisma 영향

G01은 DB를 변경하지 않는다.

필수 확인:

- `BE/prisma/schema.prisma`
- `BE/prisma/migrations`
- `BE/prisma/seed.ts`
- 기존 schema의 `/// 기능 : ...` 주석 스타일
- 기존 migration의 `-- 기능 : ...`, `COMMENT ON ...` 스타일

## 10. 검증

```powershell
rg -n "preferredLocale|timeZone|countryCode|defaultCurrencyCode|OAuthProvider|UserOAuthAccount|currencyCode|mobile|CompanyRegion|ImportTemplate" BE FE AGENT TODO
```

```powershell
cd BE
pnpm run prisma:validate
```

## 11. Goal 검토 체크리스트

- [ ] 현재 코드의 User/Auth/Company/Contact/Product/Deal/DataImport 구조를 확인했다.
- [ ] `/app` route에 locale prefix를 넣지 않는 현재 구조를 확인했다.
- [ ] public-site i18n과 app i18n 분리 위치를 정했다.
- [ ] 기존 AGENT 문서 갱신 대상 목록을 작성했다.
- [ ] API spec의 request/response 예시가 현재 DTO와 충돌하지 않는다.
- [ ] DB/Prisma 변경 예정 goal이 모두 `BE/prisma` 참고와 한글 주석 기준을 포함한다.
- [ ] G02~G10 착수 blocking 질문이 없다.
- [ ] `COMMON/GOAL-COMPLETION-CHECKLIST.md`의 G01 항목을 갱신했다.

## 12. 주석 기준

G01은 코드 구현 goal이 아니므로 신규 코드 주석은 없다. G02 이후 구현 시 한글 주석 규칙을 적용한다.
