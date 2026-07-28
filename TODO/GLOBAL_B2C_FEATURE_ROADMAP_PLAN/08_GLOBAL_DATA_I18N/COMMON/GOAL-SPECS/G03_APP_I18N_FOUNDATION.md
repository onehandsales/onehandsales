# G03 App I18N Foundation

상태: Done
목표: public-site와 분리된 `/app` 전용 i18n 기반을 만든다.

## 1. 포함 범위

- app i18n provider
- 도메인별 namespace resource 구조
- `ko-KR`, `en` locale 지원
- `User.preferredLocale` 기반 locale 선택
- `/app/settings` 언어 변경 즉시 반영
- 날짜/시간/통화/전화번호 format utility의 기본 위치 결정

## 2. 제외 범위

- 모든 화면 문구 전면 적용은 G09에서 처리한다.
- Product/Deal currency DB 변경은 G04에서 처리한다.
- Contact phone DB 변경은 G05에서 처리한다.

## 3. 작업

1. public-site i18n과 분리된 app i18n 폴더를 만든다.
2. `ko-KR`, `en` locale resource를 만든다.
3. common/settings/navigation/error 중심의 최소 key를 정의한다.
4. route 구조는 `/app/*` 그대로 유지한다.
5. profile 로딩 전 fallback locale을 정의한다.
6. Settings 저장 성공 후 locale state를 즉시 바꾼다.
7. format utility가 사용자 locale/timezone/currency를 받을 수 있게 한다.

## 4. UX 기준

- 문구는 짧고 사용자 친화적으로 쓴다.
- 한국어는 해요체를 따른다.
- 영어는 과한 enterprise tone을 피한다.
- 긴 영어 문구는 줄바꿈/ellipsis를 고려한다.

## 5. Request 계약

G03은 신규 Backend API를 만들지 않는다.

FE가 사용하는 기존 request:

- `GET /api/users/me/profile`
- `PATCH /api/users/me/profile`

app i18n provider는 profile의 `preferredLocale`을 읽어 locale state를 결정한다.

## 6. Response 계약

G03의 필수 response 의존값:

```json
{
  "preferredLocale": "ko-KR",
  "timeZone": "Asia/Seoul",
  "countryCode": "KR",
  "defaultCurrencyCode": "KRW"
}
```

API response 자체를 locale별 문자열로 바꾸지 않는다.

## 7. Business Logic

- app locale은 `User.preferredLocale`을 정본으로 한다.
- profile 로딩 전에는 browser locale, `ko-KR` 순서로 fallback한다.
- public-site locale storage와 app locale state를 섞지 않는다.
- `/app` URL은 그대로 유지한다.

## 8. User Flow

1. 사용자가 `/app`에 진입한다.
2. FE가 profile을 조회한다.
3. `preferredLocale`에 맞는 app resource를 적용한다.
4. 사용자가 Settings에서 언어를 바꾸면 현재 화면 문구가 즉시 바뀐다.

## 9. DB/Prisma 영향

G03은 DB/Prisma를 변경하지 않는다.

확인만 필요한 파일:

- `BE/prisma/schema.prisma`의 `User.preferredLocale`
- `BE/prisma/schema.prisma`의 `User.timeZone`

## 10. 검증

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
```

선택 확인:

```powershell
rg -n "public-site" FE/user-web/src/features/app-i18n FE/user-web/src/app
```

## 11. Goal 검토 체크리스트

- [x] app i18n provider가 public-site i18n과 분리됐다.
- [x] 도메인별 namespace 구조가 있다.
- [x] locale은 `ko-KR`, `en`만 지원한다.
- [x] `/app` route prefix가 바뀌지 않았다.
- [x] request/response 의존값이 profile 계약과 일치한다.
- [x] business logic fallback이 `User.preferredLocale` 우선이다.
- [x] user flow상 Settings 저장 직후 문구가 바뀐다.
- [x] DB/Prisma 변경 없음이 확인됐다.
- [x] profile locale fallback이 있다.
- [x] Settings 저장 후 locale 즉시 반영 경로가 있다.
- [x] 신규 FE 코드에 `// 기능 : ...` 주석이 있다.
- [x] 실행한 검증 결과를 기록했다.

## 12. 완료 기록

- 완료일: 2026-07-28
- 구현 위치: `FE/user-web/src/features/app-i18n`
- Provider 연결: `FE/user-web/src/app/providers/app-providers.tsx`
- Settings 연동: `FE/user-web/src/pages/settings/index.tsx`
- 기존 formatter 호환 확장: `FE/user-web/src/utils/format.ts`
- DB/Prisma 변경: 없음

검증 결과:

```powershell
cd FE/user-web
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd run build
rg -n "public-site" FE/user-web/src/features/app-i18n
rg -n "/app" FE/user-web/src/app/router/router.tsx
rg -n "/ko/app|/en/app" FE/user-web/src/app/router/router.tsx
```

- `typecheck`, `lint`, `build` 통과.
- `features/app-i18n` 내부 `public-site` 참조 없음.
- 라우터는 `/app` route를 유지하고 `/ko/app`, `/en/app` route가 없다.
- `build`는 기존 번들 크기 경고만 출력했다.
