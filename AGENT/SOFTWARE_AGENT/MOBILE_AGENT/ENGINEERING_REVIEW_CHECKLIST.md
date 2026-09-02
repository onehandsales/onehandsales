# Mobile Engineering Review Checklist

모바일 앱 변경을 완료하기 전에 아래 항목을 확인한다.

## 1. 1차 범위

- [ ] React Native 기반 앱이 실행된다.
- [ ] 사용자가 로그인 또는 회원가입을 시작할 수 있다.
- [ ] OAuth 성공 후 Backend `POST /api/auth/exchange`를 호출한다.
- [ ] Backend가 발급한 OneHand app access token을 저장하거나 메모리에 반영한다.
- [ ] OneHand app access token으로 `GET /api/me` 호출이 성공한다.
- [ ] 로그인 완료 화면이 표시된다.
- [ ] 로그인 실패 상태가 사용자에게 안전한 메시지로 표시된다.

## 2. Supabase 사용 제한

- [ ] Supabase는 OAuth login/callback 경계에서만 사용한다.
- [ ] 모바일 앱이 Supabase PostgreSQL에 직접 접근하지 않는다.
- [ ] 모바일 앱이 Supabase Storage에 직접 접근하지 않는다.
- [ ] business API 호출에 Supabase access token을 사용하지 않는다.
- [ ] Supabase 관련 구현은 auth service 또는 auth adapter에 격리되어 있다.

## 3. Backend API

- [ ] 모바일 앱은 `/api/*`만 호출한다.
- [ ] 모바일 앱은 `/admin/api/*`를 호출하지 않는다.
- [ ] API base URL은 public config로만 주입한다.
- [ ] 서버 secret, DB URL, service role key가 모바일 코드와 설정에 없다.

## 4. 보안과 로그

- [ ] access token, refresh token, provider token 원문을 로그에 남기지 않는다.
- [ ] 사용자 email, provider id, session id를 불필요하게 로그에 남기지 않는다.
- [ ] token 영구 저장이 필요하면 Keychain/Keystore 기반 보안 저장소를 사용한다.
- [ ] `AsyncStorage`에 token 원문을 저장하지 않는다.

## 5. 검증

- [ ] TypeScript 검증을 통과한다.
- [ ] lint가 설정되어 있으면 통과한다.
- [ ] 최소 1개 로컬 실행 환경에서 앱 시작과 로그인 화면 진입을 확인한다.
- [ ] 실제 OAuth smoke가 불가능하면 환경 미구성 사유를 기록한다.

