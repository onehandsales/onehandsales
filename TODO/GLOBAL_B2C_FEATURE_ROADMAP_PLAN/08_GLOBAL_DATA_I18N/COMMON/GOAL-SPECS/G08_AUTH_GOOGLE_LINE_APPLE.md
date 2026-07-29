# G08 Auth Google LINE Apple

상태: Done
목표: Google, LINE, Apple OAuth provider를 실제 로그인/회원가입 provider로 구현한다.

## 1. 포함 범위

- `OAuthProvider.LINE`
- APPLE runtime 활성화
- `/api/auth/providers` Google, LINE, Apple 반환
- `/api/auth/exchange` Google, LINE, Apple 처리
- verified email 기반 기존 User 연결
- email 없음 차단
- lowercase email 비교
- 로그인/회원가입 소셜 버튼 영역 변경

## 2. 제외 범위

- 이메일/비밀번호 로그인
- Magic link
- Microsoft login
- Kakao runtime 복구
- provider 연결 해제 UI
- 계정 병합 관리 화면

## 3. Backend 작업

1. Prisma enum에 `LINE`을 추가한다.
2. auth provider mapping에 Google, LINE, Apple을 추가한다.
3. `/api/auth/providers` 응답 순서를 Google -> LINE -> Apple로 맞춘다.
4. `/api/auth/exchange`에서 Apple/LINE을 허용한다.
5. provider profile normalization을 구현한다.
6. `provider + providerUserId` 기존 연결을 먼저 찾는다.
7. 기존 연결이 없으면 verified email lowercase 기준으로 기존 User를 찾는다.
8. 같은 email User가 있으면 `UserOAuthAccount`를 연결한다.
9. email이 없으면 가입/로그인을 차단한다.
10. provider 실패 로그는 안전한 context만 남긴다.

## 4. Frontend 작업

1. provider type에 Google, LINE, Apple을 추가한다.
2. 로그인/회원가입 화면의 기존 Google 버튼 영역을 카드형 3개 버튼으로 바꾼다.
3. 버튼 순서는 Google -> LINE -> Apple이다.
4. 이메일 로그인이나 다른 인증 흐름은 추가하지 않는다.
5. provider 실패 메시지는 일반 문구로 표시한다.
6. public/auth locale copy에 provider label과 실패 문구를 추가한다.

## 5. 운영 확인

- Supabase Google provider 설정
- Supabase LINE provider 설정
- Supabase Apple provider 설정
- Apple Services ID, Team ID, Key ID, private key
- LINE Channel ID/secret
- redirect URL 등록

실제 secret 값은 문서나 log에 기록하지 않는다.

## 6. Request 계약

Provider 목록:

```text
GET /api/auth/providers
```

OAuth exchange 요청 후보:

```text
POST /api/auth/exchange
Authorization: Bearer <supabaseAccessToken>
```

```json
{
  "locale": "en",
  "timeZone": "America/New_York",
  "deviceSlot": "personal_laptop",
  "deviceId": "browser-device-id",
  "deviceLabel": "Personal browser",
  "replaceExistingDevice": true
}
```

provider 값은 body가 아니라 Supabase token 검증 결과에서 확정한다. FE에서 선택 가능한 provider 값과 BE가 검증 후 허용하는 provider 값은 아래와 같다.

- `google`
- `line`
- `apple`

## 7. Response 계약

Provider 목록 응답은 FE 버튼 순서와 일치한다.

```json
{
  "providers": [
    { "provider": "google", "label": "Google", "enabled": true },
    { "provider": "line", "label": "LINE", "enabled": true },
    { "provider": "apple", "label": "Apple", "enabled": true }
  ]
}
```

Exchange 성공 response는 기존 app session 계약을 유지한다.

에러 후보:

```json
{
  "code": "AUTH_PROVIDER_EMAIL_REQUIRED",
  "field": "provider",
  "provider": "apple"
}
```

## 8. Business Logic

- `provider + providerUserId` 기존 연결을 먼저 조회한다.
- 기존 연결이 없고 verified email이 있으면 lowercase로 정규화한다.
- 같은 email User가 있으면 기존 User에 provider 계정을 연결한다.
- 같은 email User가 없으면 신규 User를 만든다.
- email이 없으면 가입/로그인을 차단한다.
- Kakao는 runtime provider로 노출하지 않는다.
- provider 실패는 safe error로 처리하고 raw error/token/secret을 노출하지 않는다.

## 9. User Flow

1. 사용자가 로그인/회원가입 화면에 진입한다.
2. Google, LINE, Apple 카드형 버튼을 본다.
3. provider 버튼을 클릭한다.
4. OAuth popup 또는 redirect가 시작된다.
5. callback 후 Backend exchange가 app session을 만든다.
6. 같은 verified email이면 기존 CRM 데이터가 있는 User로 들어간다.
7. email이 없으면 사용자 친화적인 실패 메시지를 본다.

## 10. DB/Prisma 영향

필수 참조:

- `BE/prisma/schema.prisma`의 `enum OAuthProvider`
- `BE/prisma/schema.prisma`의 `model User`
- `BE/prisma/schema.prisma`의 `model UserOAuthAccount`
- Auth 관련 migration
- `BE/prisma/seed.ts`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/AUTH_USER_SCHEMA.md`

DB 변경:

- `OAuthProvider.LINE`

주석 필수:

- Prisma enum 또는 관련 주석에 `LINE`의 기능을 설명한다.
- migration SQL에 enum 추가 의도를 `-- 기능 : ...` 주석으로 남긴다.
- seed/test의 provider mapping 변경 여부를 확인한다.

## 11. 검증

```powershell
cd BE
pnpm run prisma:validate
pnpm run prisma:generate
pnpm run typecheck
pnpm run lint
pnpm run test -- auth
pnpm run build
```

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
```

실제 provider smoke는 환경변수와 Supabase 설정 완료 후 수동 QA로 기록한다.

2026-07-28 구현 검증:

- Backend `pnpm.cmd prisma:generate` 통과
- Backend `pnpm.cmd prisma:validate` 통과
- Backend `pnpm.cmd typecheck` 통과
- Backend `pnpm.cmd lint` 통과
- Backend `pnpm.cmd test -- exchange-external-auth-token list-auth-providers resolve-current-user` 통과
- Backend `pnpm.cmd build` 통과
- User Web `pnpm.cmd typecheck` 통과
- User Web `pnpm.cmd lint` 통과
- User Web `pnpm.cmd build` 통과
- Playwright screenshot `/ko/login` 390x844 확인: Google, LINE, Apple 버튼 순서와 모바일 겹침 없음
- LINE/Apple 실제 provider smoke는 Supabase/provider 운영 설정과 secret 연결 후 수동 QA로 확인한다.

## 12. Goal 검토 체크리스트

- [x] `OAuthProvider.LINE`이 추가됐다.
- [x] APPLE runtime mapping이 활성화됐다.
- [x] provider list 순서가 Google, LINE, Apple이다.
- [x] FE `AuthProviderId`와 BE `ExternalAuthProvider` 허용값이 Google, LINE, Apple로 일치한다.
- [x] `/api/auth/exchange`는 기존처럼 Authorization Bearer Supabase token을 사용한다.
- [x] provider list response가 버튼 순서와 일치한다.
- [x] business logic이 verified email linking 정책을 따른다.
- [x] user flow가 기존 로그인/회원가입 소셜 영역만 바꾼다.
- [x] `BE/prisma`를 참고했고 enum/migration에 한글 주석이 있다.
- [x] Kakao는 노출되지 않는다.
- [x] 같은 verified email은 기존 User에 연결된다.
- [x] email 없음은 차단된다.
- [x] email 비교는 lowercase 기준이다.
- [x] 로그인/회원가입 버튼은 Google, LINE, Apple 카드형 3개다.
- [x] 이메일 로그인 UI를 추가하지 않았다.
- [x] provider raw error/token/secret이 노출되지 않는다.
- [x] 신규 코드에 한글 주석 규칙이 적용됐다.
- [x] 실행한 검증 결과를 기록했다.
