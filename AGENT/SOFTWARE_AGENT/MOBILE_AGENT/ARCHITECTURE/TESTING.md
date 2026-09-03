# Mobile Testing Architecture

## 1. 목적

모바일 테스트는 1차 범위인 로그인/회원가입, 모바일 세션 교환, 앱 시작 시 세션 복구, `/api/me`, 로그아웃 흐름을 우선 검증한다.

CRM 전체 E2E는 1차 범위가 아니다.

## 2. 우선 검증 범위

- 앱 시작 시 signedOut 상태 렌더링
- secure storage에 `mobileRefreshToken`이 없을 때 로그인 화면 진입
- provider 버튼 표시 순서
- OAuth 성공 후 `POST /api/auth/mobile/exchange` 호출
- exchange 성공 후 secure storage 저장
- exchange 성공 후 `/api/me` 확인
- 로그인 완료 후 최소 `HomeScreen` 표시
- 앱 재시작 시 `POST /api/auth/mobile/refresh` 호출
- refresh 성공 시 token rotation 반영
- refresh 실패 시 secure storage 삭제와 signedOut 전환
- logout 시 Backend session revoke 요청과 로컬 세션 삭제

## 3. Mock 기준

자동화 테스트에서 Google, LINE, Apple 실계정 OAuth를 기본으로 요구하지 않는다.

테스트는 다음 경계를 mock 또는 stub할 수 있다.

- 외부 OAuth provider
- Supabase Auth adapter
- Backend 모바일 인증 API
- secure storage

단, mock은 auth adapter/API client 경계에서만 사용하고 화면 내부에 흩뿌리지 않는다.

## 4. 수동 Smoke 기준

실제 provider smoke가 가능한 환경에서는 다음을 확인한다.

- Google 로그인/회원가입 시작
- LINE 로그인/회원가입 시작
- Apple 로그인/회원가입 시작
- OAuth 취소 후 안전한 실패 메시지
- OAuth 성공 후 Backend exchange 성공
- 앱 종료 후 재실행 시 세션 복구
- 새 모바일 기기 로그인 시 기존 모바일 세션 교체

실제 provider smoke가 불가능하면 환경 미구성 사유를 검증 기록에 남긴다.

## 5. Release Gate 방향

초기 release gate는 다음 순서를 기준으로 한다.

1. TypeScript 검증
2. lint
3. 단위 테스트 또는 hook/service 테스트
4. 앱 시작 smoke
5. auth flow smoke

App Store, Play Store 정식 배포 gate는 후속 배포 정책 문서에서 확정한다.
