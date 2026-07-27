# G09 App Screen Translation

상태: Not Started
목표: `/app` 핵심 업무 화면 전체에 `ko-KR`, `en` 문구를 적용한다.

## 1. 포함 범위

- Home
- Company
- Contact
- Product
- Deal
- Schedule
- MeetingNote
- Notification
- Settings
- Import/Export
- 공통 navigation
- 공통 button, empty, error, validation, toast copy

## 2. 제외 범위

- public-site 전체 rewrite
- `ja`, `zh-TW` 앱 번역
- Admin Web 번역
- 화면 구조 대개편

## 3. 작업

1. app i18n namespace별 key를 정리한다.
2. 기존 하드코딩 한국어 문구를 app i18n key로 교체한다.
3. validation/error/empty/toast 문구를 locale-aware하게 만든다.
4. 날짜/시간/통화/전화번호 표시 utility를 주요 화면에 적용한다.
5. 영어 문구는 짧고 사용자 친화적으로 작성한다.
6. 한국어 문구는 해요체와 기존 UX writing 기준을 따른다.
7. 긴 영어 문구 layout을 점검한다.

## 4. UX 기준

좋은 예:

```text
ko-KR: 저장했어요.
en: Saved.
```

피해야 할 예:

```text
ko-KR: 저장되었습니다.
en: The requested resource has been successfully persisted.
```

## 5. Request 계약

G09는 신규 Backend API를 만들지 않는다.

기존 API request는 유지한다. 단, FE가 validation/error code를 locale별 사용자 문구로 변환할 수 있어야 한다.

## 6. Response 계약

기존 API response shape를 바꾸지 않는다.

FE가 의존하는 값:

- `preferredLocale`
- `timeZone`
- `countryCode`
- `defaultCurrencyCode`
- domain별 `currencyCode`
- domain별 phone/region code
- error `code`, `field`

## 7. Business Logic

- 하드코딩 한국어 문구를 app i18n key로 바꾼다.
- BE raw validation message를 직접 노출하지 않는다.
- 날짜/시간/통화/전화번호는 format utility를 사용한다.
- `ko-KR`, `en` 외 locale은 1차에서 지원하지 않는다.

## 8. User Flow

1. 사용자가 `/app` 핵심 화면을 탐색한다.
2. 현재 `User.preferredLocale`에 맞는 문구를 본다.
3. 입력 실패, empty, toast, dialog 문구도 같은 locale로 본다.
4. 긴 영어 문구가 있어도 현재 업무 흐름이 깨지지 않는다.

## 9. DB/Prisma 영향

G09는 DB/Prisma를 변경하지 않는다.

다만 화면에 표시되는 아래 DB field 의미를 보존해야 한다.

- `User.preferredLocale`
- `User.timeZone`
- `Product.currencyCode`
- `Deal.currencyCode`
- `Contact.phoneE164`
- `CompanyRegion.regionCode`

## 10. 검증

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
```

선택 QA:

- 1280px desktop
- 768px tablet
- 390px mobile
- 360px mobile

## 11. Goal 검토 체크리스트

- [ ] 핵심 화면 전체에 `ko-KR`, `en` 문구가 적용됐다.
- [ ] 공통 navigation/button/empty/error/validation/toast copy가 locale-aware하다.
- [ ] 신규 request/response 변경이 없음을 확인했다.
- [ ] FE가 필요한 response field와 error code를 기준으로 번역한다.
- [ ] business logic이 app i18n key와 format utility를 사용한다.
- [ ] user flow에서 locale별 문구가 일관된다.
- [ ] DB/Prisma 변경 없음이 확인됐다.
- [ ] 한국어는 해요체다.
- [ ] 영어는 간결하고 사용자 친화적이다.
- [ ] 긴 영어 문구가 UI를 깨지 않는다.
- [ ] public-site i18n에 app 문구를 섞지 않았다.
- [ ] 신규 코드에 한글 주석 규칙이 적용됐다.
- [ ] 실행한 검증 결과를 기록했다.
