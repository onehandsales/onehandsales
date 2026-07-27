# G02 User Global Settings

상태: Not Started
목표: 사용자 앱 언어, timezone, 국가, 기본 통화 설정을 DB/API/Settings에 연결한다.

## 1. 포함 범위

- `User.countryCode`
- `User.defaultCurrencyCode`
- `preferredLocale`, `timeZone` 설정 API 보강
- `/api/users/me/profile` request/response type 보강
- 신규 가입 기본값 추론
- 기존 사용자 fallback
- `/app/settings` 설정 저장과 즉시 반영에 필요한 FE 연동

## 2. 제외 범위

- 전체 `/app` 번역 적용
- Product/Deal currency 필드 추가
- Contact phone 글로벌화
- Apple/LINE auth 구현

## 3. Backend 작업

1. Prisma schema에 `User.countryCode`, `User.defaultCurrencyCode`를 추가한다.
2. 신규 migration을 작성한다.
3. 기존 사용자는 `KR`, `KRW` fallback을 갖게 한다.
4. profile 조회/수정 DTO에 global settings 필드를 추가한다.
5. `preferredLocale`, `countryCode`, `defaultCurrencyCode`, `timeZone` validation을 추가한다.
6. 신규 가입 시 browser locale/proxy geo/timezone 추론과 fallback을 적용한다.
7. 기존 사용자 `timeZone`은 로그인만으로 덮어쓰지 않는다.

## 4. Frontend 작업

1. profile type/API client를 갱신한다.
2. `/app/settings`에 Language, Time zone, Country, Default currency 설정을 추가한다.
3. 저장 성공 시 app i18n state가 즉시 갱신될 수 있게 한다.

## 5. Request 계약

`PATCH /api/users/me/profile` 요청 후보:

```json
{
  "preferredLocale": "en",
  "timeZone": "America/New_York",
  "countryCode": "US",
  "defaultCurrencyCode": "USD"
}
```

허용값:

- `preferredLocale`: `ko-KR`, `en`
- `countryCode`: `KR`, `US`
- `defaultCurrencyCode`: `KRW`, `USD`
- `timeZone`: IANA timezone ID

## 6. Response 계약

`GET/PATCH /api/users/me/profile` 응답은 아래 설정값을 포함해야 한다.

```json
{
  "preferredLocale": "en",
  "timeZone": "America/New_York",
  "countryCode": "US",
  "defaultCurrencyCode": "USD"
}
```

에러는 code/field 중심으로 반환한다.

```json
{
  "code": "USER_TIMEZONE_INVALID",
  "field": "timeZone"
}
```

## 7. Business Logic

- 신규 가입자는 browser locale, proxy geo country, browser timezone으로 기본값을 추론한다.
- 추론 실패 시 `ko-KR`, `KR`, `Asia/Seoul`, `KRW`를 사용한다.
- 기존 사용자의 `timeZone`은 로그인만으로 덮어쓰지 않는다.
- 설정 저장은 현재 사용자 ownership 안에서만 동작한다.

## 8. User Flow

1. 사용자가 `/app/settings`에 진입한다.
2. Language, Time zone, Country, Default currency를 바꾼다.
3. 저장한다.
4. 서버 profile이 갱신된다.
5. FE app i18n/format state가 즉시 갱신된다.

## 9. DB/Prisma 영향

필수 참조:

- `BE/prisma/schema.prisma`의 `model User`
- `BE/prisma/migrations/20260708010000_add_user_locale_region_metadata`
- `BE/prisma/seed.ts`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/AUTH_USER_SCHEMA.md`

DB 변경:

- `User.countryCode`
- `User.defaultCurrencyCode`

주석 필수:

- Prisma schema 새 column에 `/// 기능 : ...` 주석을 추가한다.
- migration SQL에 `-- 기능 : ...` 또는 `COMMENT ON COLUMN`을 추가한다.

## 10. 검증

```powershell
cd BE
pnpm run prisma:validate
pnpm run prisma:generate
pnpm run typecheck
pnpm run lint
pnpm run test -- auth user
```

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
```

## 11. Goal 검토 체크리스트

- [ ] User 글로벌 설정 필드가 DB에 추가됐다.
- [ ] 기존 사용자 fallback이 있다.
- [ ] profile 조회/수정 API가 새 필드를 포함한다.
- [ ] request body 허용값이 API spec과 일치한다.
- [ ] response field가 FE profile type과 일치한다.
- [ ] business logic fallback 순서가 문서와 일치한다.
- [ ] settings user flow가 저장 즉시 반영된다.
- [ ] `BE/prisma`를 참고했고 신규 column에 한글 주석이 있다.
- [ ] validation error가 code/field 중심이다.
- [ ] `/app/settings`에서 저장할 수 있다.
- [ ] 언어 저장 후 현재 화면 반영을 위한 FE 상태 갱신 경로가 있다.
- [ ] Backend/Frontend 신규 코드에 한글 주석 규칙이 적용됐다.
- [ ] 실행한 검증 결과를 기록했다.
