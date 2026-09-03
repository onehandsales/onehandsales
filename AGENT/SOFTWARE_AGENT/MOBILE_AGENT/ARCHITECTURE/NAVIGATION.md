# Mobile Navigation Architecture

## 1. 기준

모바일 앱 navigation은 Expo Router를 기준으로 한다.

`src/app`은 route entry와 layout만 담당한다. 실제 화면 구현, API 호출, hook, schema, type, business UI는 `src/features/<domain>`에 둔다.

## 2. 1차 라우트 구조

```text
src/app/
  _layout.tsx
  (public)/
    login.tsx
  (app)/
    _layout.tsx
    index.tsx
```

공개 화면:

- `src/app/(public)/login.tsx`

보호 화면:

- `src/app/(app)/index.tsx`

## 3. Route Entry 규칙

- `src/app/**` 파일은 feature screen을 import해서 연결하는 route entry 역할만 한다.
- route entry 안에서 API 호출, 복잡한 상태 처리, form schema, business UI를 직접 구현하지 않는다.
- 공개 화면은 `src/app/(public)` 아래에 둔다.
- 로그인 이후 접근 가능한 보호 화면은 `src/app/(app)` 아래에 둔다.
- 인증 복구가 끝나기 전에는 `(app)` 그룹 화면을 렌더링하지 않는다.

## 4. Deep Link 확장 기준

모든 주요 record 화면은 후속 CRM 확장 시 deep link 가능성을 고려해 route 구조를 설계한다.

후속 CRM 모바일 route 예시는 다음과 같은 방향을 우선 검토한다.

```text
src/app/(app)/companies/[companyId].tsx
src/app/(app)/contacts/[contactId].tsx
src/app/(app)/deals/[dealId].tsx
src/app/(app)/schedules/[scheduleId].tsx
src/app/(app)/meeting-notes/[meetingNoteId].tsx
```

단, CRM 화면은 1차 범위가 아니므로 route 파일을 미리 만들지 않는다. 실제 UX/UI 결정과 API 계약이 확정될 때 추가한다.

## 5. OAuth Redirect

OAuth 로그인은 Expo AuthSession 또는 시스템 브라우저 기반 흐름을 사용한다.

OAuth provider 로그인 화면을 앱 내부 WebView로 열지 않는다.

OAuth redirect 복귀 처리는 Expo/React Native 표준 deep link 흐름을 따른다.
