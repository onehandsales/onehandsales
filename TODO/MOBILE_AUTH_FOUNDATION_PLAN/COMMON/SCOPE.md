# Scope

상태: Confirmed

## 1. 범위 원칙

이 계획은 네이티브 모바일 앱의 인증 foundation만 구현한다.

모바일 앱을 제품 전체 CRM으로 확장하기 전에, 앱 실행, OAuth, Backend app session, secure storage, 세션 복구, 최소 홈, 로그아웃이 먼저 안정적으로 동작해야 한다.

## 2. 포함 범위

| 영역 | 포함 항목 |
| --- | --- |
| Backend API | `POST /api/auth/mobile/exchange`, `POST /api/auth/mobile/refresh`, `POST /api/auth/mobile/logout` |
| Backend session | `UserOAuthAccount`, `AuthDevice`, `AuthSession` 기반 모바일 app session |
| Device 정책 | `deviceSlot: "native_mobile"`, Prisma enum `NATIVE_MOBILE`, 사용자당 활성 네이티브 모바일 기기 1대, 새 기기 로그인 시 기존 네이티브 모바일 기기 교체 |
| Token 정책 | Backend는 refresh token hash만 저장, Mobile App은 `mobileRefreshToken` 원문을 secure storage에만 저장 |
| Mobile App 구조 | Expo Router, `src/app` route entry/layout, `src/features/<domain>` 구현 경계 |
| Mobile auth UX | User Web 브라우저 모바일 auth 화면을 reference로 삼은 React Native 로그인/회원가입 화면 |
| OAuth | Expo AuthSession 또는 OS 시스템 브라우저 기반 provider 로그인 |
| Session restore | 앱 시작 시 secure storage token으로 `/api/auth/mobile/refresh` 호출 |
| 최소 홈 | `/api/me` 결과 확인, 사용자 이름/이메일/인증 상태/모바일 기기 정보/로그아웃 |
| 검증 | Backend unit/integration, Mobile typecheck/lint, local smoke, 통합 smoke 기록 |

## 3. 제외 범위

| 제외 항목 | 이유 |
| --- | --- |
| 모바일 CRM 홈 | 인증 foundation 이후 별도 모바일 제품 범위에서 결정한다. |
| 회사/담당자/제품/딜/일정/회의록 화면 | 1차 인증 기반과 별도 도메인 화면이다. |
| 명함 촬영/OCR | 카메라 권한, 이미지 업로드, 실패 복구 정책이 별도 필요하다. |
| push notification | permission UX와 device token 정책이 별도 필요하다. |
| native contacts/calendar 연동 | OS 권한과 데이터 동기화 정책이 별도 필요하다. |
| offline-first local draft | 저장소, conflict, sync 정책이 별도 필요하다. |
| biometric unlock | 보안 UX와 fallback 정책이 별도 필요하다. |
| 앱스토어 정식 배포 | build/distribution 문서 이후 별도 release goal로 연다. |
| Supabase 독립 전환 구현 | 이 계획은 독립 가능한 경계를 만들고, 실제 provider 교체는 후속 작업으로 둔다. |

## 4. 구현 전 고정 계약

- 모바일 인증 API는 웹 cookie API를 수정하지 않고 새 route로 추가한다.
- `mobileRefreshToken`은 cookie로 내려주지 않는다.
- 모바일 refresh API는 cookie를 읽지 않는다.
- 모바일 refresh API는 web refresh의 Origin cookie CSRF 방어를 그대로 요구하지 않는다. 대신 refresh token hash, session status, session expiry, `NATIVE_MOBILE` device slot을 검증한다.
- 모바일 logout은 access token의 `sessionId` 기준으로 현재 session을 revoke한다.
- `/api/me`는 기존 User API를 사용한다.

네이티브 Mobile App의 `deviceSlot` 값은 `native_mobile`로 확정한다.
