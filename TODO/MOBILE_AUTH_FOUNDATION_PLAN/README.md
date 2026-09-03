# Mobile Auth Foundation Plan

상태: Active / Ready
작성 기준일: 2026-09-03

## 1. 목적

이 계획은 `FE/mobile-app`의 네이티브 모바일 앱 1차 구현을 시작하기 전에 필요한 모바일 인증 기반 작업을 `/goal` 단위로 쪼개기 위한 실행 문서다.

1차 목표는 CRM 화면을 만드는 것이 아니라, 모바일 앱이 Backend `AuthSession`을 공식 세션으로 사용해 로그인, 회원가입, 세션 복구, `/api/me`, 최소 홈, 로그아웃까지 동작하는 기반을 만드는 것이다.

## 2. 핵심 결정

- 모바일 앱은 Expo 기반 React Native 앱이다.
- 모바일 앱 코드는 `FE/mobile-app`에 둔다.
- `FE/mobile-app`은 현재 구조가 목표 형태와 다르면 재구성할 수 있다. 단, 기존 로고와 provider asset은 선별 보존할 수 있다.
- 네이티브 앱의 API `deviceSlot`은 `native_mobile`이다.
- Backend Prisma enum은 `AuthDeviceSlot.NATIVE_MOBILE`을 추가한다.
- User Web 브라우저 모바일의 기존 `mobile` slot은 유지하고, 네이티브 앱과 분리한다.
- 모바일 앱의 공식 인증 세션은 Supabase session이 아니라 Backend `AuthSession`이다.
- Supabase는 현재 OAuth access token을 얻기 위한 교체 가능한 auth provider adapter로만 사용한다.
- 모바일 앱은 Backend User API인 `/api/*`만 호출한다.
- 모바일 앱은 Admin API인 `/admin/api/*`를 호출하지 않는다.
- refresh token 원문은 모바일 secure storage에만 저장한다.
- access token은 메모리에만 보관한다.
- OAuth와 정책 링크는 WebView가 아니라 Expo AuthSession 또는 OS 시스템 브라우저로 연다.

## 3. 문서 구조

| 문서 | 역할 |
| --- | --- |
| `COMMON/SCOPE.md` | 포함 범위와 제외 범위 |
| `COMMON/USER-FLOW.md` | 로그인, 세션 복구, 로그아웃 사용자 흐름 |
| `COMMON/PENDING-DECISIONS.md` | 구현 전 필요한 의사결정 |
| `COMMON/API-SPEC/MOBILE_AUTH_API.md` | 모바일 인증 API 계약 |
| `COMMON/GOAL-WORK-ORDER.md` | `/goal` 실행 순서 |
| `COMMON/GOAL-SPECS/*` | goal별 상세 명세 |
| `BE-TODO/API-TODO.md` | Backend 구현 작업 |
| `BE-TODO/DB-SCHEMA.md` | DB schema 사용 기준 |
| `BE-TODO/G01-BE-MOBILE-AUTH-API.goal.md` | Backend `/goal` 실행 문서 |
| `FE-TODO/MOBILE-APP-TODO.md` | Mobile App 구현 작업 |
| `FE-TODO/G02-FE-MOBILE-AUTH-APP.goal.md` | Mobile App `/goal` 실행 문서 |
| `COMMON/G03-MOBILE-AUTH-INTEGRATION.goal.md` | 통합 검증 `/goal` 실행 문서 |

## 4. Goal 순서

| 순서 | Goal | 담당 | 상태 | 선행 조건 |
| ---: | --- | --- | --- | --- |
| 1 | `G01-BE-MOBILE-AUTH-API` | Backend | Ready | API 계약 confirmed |
| 2 | `G02-FE-MOBILE-AUTH-APP` | Mobile | Ready for structure | G01 API 구현 또는 mock 계약 |
| 3 | `G03-MOBILE-AUTH-INTEGRATION` | Common | Waiting for G01/G02 | G01, G02 완료 |

G02는 Expo Router, NativeWind, 공통 컴포넌트 구조 정리는 G01과 병렬로 시작할 수 있다. 단, 완료 판정은 실제 `/api/auth/mobile/*`와 `/api/me` 연동 확인 이후에만 한다.

Device slot 결정은 D01에서 `native_mobile` / `NATIVE_MOBILE`로 확정됐다. Backend API 구현은 G01에서 시작한다.

## 5. 지금 만들지 않는 것

- 모바일 CRM 홈
- 회사, 담당자, 제품, 딜, 일정, 회의록 목록/상세/생성
- 명함 촬영/OCR
- push notification
- native contacts/calendar 연동
- offline-first local draft
- biometric unlock
- App Store, Play Store 정식 배포
- Supabase 독립 전환 구현

## 6. 완료 기준

- Backend에 모바일 전용 인증 API가 구현되고 웹 cookie 인증 API와 분리되어 있다.
- 모바일 앱이 secure storage refresh token과 memory-only access token 정책을 지킨다.
- 앱 시작 시 세션 복구가 성공/실패 양쪽 모두 처리된다.
- 로그인/회원가입 화면이 User Web 브라우저 모바일 auth UX를 reference로 삼되 React Native로 구현되어 있다.
- 최소 `HomeScreen`에서 `/api/me` 결과를 확인할 수 있다.
- 로그아웃 시 Backend 세션 revoke와 secure storage 삭제가 함께 수행된다.
- BE/FE 검증 명령과 수동 smoke 결과가 `TODO_LOG`에 기록된다.

## 7. 관련 정본

- `AGENT/PM_AGENT/DECISIONS/032_mobile_auth_foundation_scope.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/ARCHITECTURE/MOBILE_APP.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/ARCHITECTURE/AUTH_SESSION.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/ARCHITECTURE/NAVIGATION.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/CONVENTION/AUTH_AND_STORAGE.md`
- `AGENT/UXUI_AGENT/DECISIONS/021_uxui_mobile_auth_native_reference.md`
- `BE/src/modules/auth/README.md`
