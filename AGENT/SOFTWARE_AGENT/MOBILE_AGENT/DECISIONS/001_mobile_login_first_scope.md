# 001 Mobile Login First Scope

Date: 2026-09-03

## 1. 결정

모바일 1차 구현 범위는 사용자가 앱을 실행하고 로그인 또는 회원가입을 완료한 뒤 Backend 모바일 앱 세션을 얻고 `/api/me`를 확인하는 데까지로 제한한다.

CRM 도메인 화면은 1차 범위에 포함하지 않는다.

## 2. 포함 범위

- 앱 시작
- 앱 시작 시 세션 복구
- 로그인/회원가입 provider 선택
- OAuth 진행 상태
- OAuth callback 복귀
- Backend `POST /api/auth/mobile/exchange`
- Backend `POST /api/auth/mobile/refresh`
- Backend `GET /api/me`
- 최소 `HomeScreen`
- Backend `POST /api/auth/mobile/logout`
- 로그인 실패, 세션 만료, 네트워크 오류 상태

## 3. HomeScreen 기준

1차 모바일 앱의 로그인 이후 첫 화면은 최소 `HomeScreen`으로 둔다.

`HomeScreen`은 `/api/me` 호출 결과를 확인할 수 있는 수준으로만 구현한다.

표시 범위:

- 사용자 이름
- 이메일
- 인증 상태
- 현재 모바일 기기 정보
- 로그아웃 액션

CRM 홈, 대시보드, 거래/회사/연락처 목록, 일정/회의록 요약은 1차 범위에 포함하지 않는다.

## 4. 제외 범위

- 모바일 CRM 전체 화면
- 회사/담당자/상품/딜/일정/회의록 CRUD
- 명함 OCR
- push notification
- native contacts/calendar 연동
- offline-first local draft
- biometric unlock
- App Store, Play Store 정식 배포 정책
- Supabase 독립 전환 구현

## 5. 이유

현재 모바일 작업의 목표는 전체 CRM 기능 구현보다 모바일 앱의 기초 규칙을 먼저 확정하는 것이다.

인증/세션/라우팅/저장소 정책이 확정되어야 이후 CRM 화면을 같은 구조로 확장할 수 있다.

## 6. 관련 문서

- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/ARCHITECTURE/MOBILE_APP.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/ARCHITECTURE/AUTH_SESSION.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
