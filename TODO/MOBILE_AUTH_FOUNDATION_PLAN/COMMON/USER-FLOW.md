# User Flow

## 1. 앱 최초 실행

1. 사용자가 모바일 앱을 실행한다.
2. 앱은 secure storage에서 `onehand.mobile.auth.mobileRefreshToken`을 읽는다.
3. 저장된 token이 없으면 signedOut 상태로 전환하고 로그인/회원가입 화면을 보여준다.
4. 저장된 token이 있으면 `POST /api/auth/mobile/refresh`를 호출한다.
5. refresh 성공 시 새 access token을 메모리에 반영하고 새 `mobileRefreshToken`을 secure storage에 덮어쓴다.
6. refresh response의 `device`를 현재 모바일 기기 상태로 반영한다.
7. 앱은 `GET /api/me`를 호출해 사용자 상태를 확인한다.
8. 사용자 상태가 유효하면 `(app)` 보호 route의 최소 `HomeScreen`을 보여준다.
9. refresh 또는 `/api/me`가 실패하면 secure storage token과 메모리 auth 상태를 비우고 로그인/회원가입 화면으로 이동한다.

인증 복구가 끝나기 전에는 보호 화면을 렌더링하지 않는다.

## 2. 로그인/회원가입

1. 사용자가 로그인 또는 회원가입 화면에 진입한다.
2. provider 버튼은 Google, LINE, Apple 순서로 보여준다.
3. 사용자가 provider를 선택하면 Expo AuthSession 또는 OS 시스템 브라우저를 연다.
4. OAuth 성공 후 auth provider adapter가 외부 OAuth access token을 확보한다.
5. 앱은 `POST /api/auth/mobile/exchange`를 호출한다.
6. Backend는 외부 OAuth access token을 검증하고 내부 `User`, `UserOAuthAccount`, `AuthDevice`, `AuthSession`을 생성하거나 갱신한다.
7. Backend는 OneHand app `accessToken`, `accessTokenExpiresAt`, `mobileRefreshToken`, `user`, `device`를 반환한다.
8. 앱은 `mobileRefreshToken`을 secure storage에 저장한다.
9. 앱은 access token과 user를 메모리 auth 상태에 저장한다.
10. 앱은 `GET /api/me`를 호출해 현재 사용자 상태를 확인한다.
11. 앱은 최소 `HomeScreen`으로 이동한다.

## 3. 로그아웃

1. 사용자가 최소 `HomeScreen`에서 로그아웃을 누른다.
2. 앱은 현재 access token으로 `POST /api/auth/mobile/logout`을 호출한다.
3. Backend는 access token의 `sessionId`에 해당하는 `AuthSession`을 revoke한다.
4. 앱은 secure storage의 `onehand.mobile.auth.mobileRefreshToken`을 삭제한다.
5. 앱은 메모리 access token, user, auth 상태를 비운다.
6. 앱은 로그인/회원가입 화면으로 이동한다.

Backend logout 요청이 네트워크 오류로 실패하더라도 사용자가 로그아웃을 선택한 경우 앱 로컬 토큰은 삭제한다. 서버 session revoke 실패는 재시도 또는 후속 API 호출 실패로 정리한다.

## 4. 실패 흐름

| 상황 | 사용자 처리 |
| --- | --- |
| OAuth 취소 | 로그인 화면으로 돌아가고 provider pending 상태를 해제한다. |
| OAuth provider 실패 | user-web과 같은 의미의 일반 실패 문구를 보여준다. |
| Backend exchange 실패 | token 원문 없이 "로그인을 완료하지 못했어요. 잠시 후 다시 시도해 주세요." 계열 문구를 보여준다. |
| refresh 실패 | secure storage token을 삭제하고 signedOut 상태로 전환한다. |
| `/api/me` 401 | refresh를 1회 시도하고 실패하면 signedOut 상태로 전환한다. |
| 네트워크 오류 | 재시도 액션을 제공하고 token 원문을 화면/로그에 노출하지 않는다. |

## 5. 정책 링크

이용약관, 개인정보처리방침, 보안 문서 링크는 앱 내부 WebView가 아니라 OS 기본 브라우저로 연다.
