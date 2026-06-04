# Architecture Overview

## 1. 저장소 구조

```text
AGENT/
  PM_AGENT/
  UXUI_AGENT/
  SOFTWARE_AGENT/
FE/
  user-web/
  admin-web/
BE/
archive/
```

규칙:

- 루트에는 `package.json`을 두지 않는다.
- package workspace를 사용하지 않는다.
- FE와 BE는 의존성을 공유하지 않는다.
- 각 앱은 자기 package 설정을 가진다.

## 2. Frontend

User Web stack:

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui

Admin Web stack:

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- Admin table이 필요하면 data table library를 Admin app 내부에 추가할 수 있다.

FE 구조:

```text
FE/
  user-web/
  admin-web/
```

User Web과 Admin Web은 별도 앱이다.

상세 규칙:

- `FRONTEND_USER_WEB.md`
- `ADMIN_WEB.md`

## 3. Backend

Backend stack:

- NestJS
- Prisma
- Supabase/PostgreSQL
- DDD
- Clean Architecture
- Modular Monolith

API split:

- User API: `/api/*`
- Admin API: `/admin/api/*`

Admin API는 auth guard와 admin guard를 사용해야 한다.

상세 규칙:

- `BACKEND.md`

## 4. Backend Module Rule

각 비즈니스 도메인은 다음 네 계층 구조를 사용한다.

```text
domain/
application/
infrastructure/
presentation/
```

Domain layer는 NestJS, Prisma, HTTP client, 외부 SDK에 의존하지 않는다.

Application layer는 use case를 조율하고 domain repository/port를 사용한다.

Infrastructure layer는 repository와 외부 adapter를 구현한다.

Presentation layer는 controller와 DTO를 포함한다.

## 5. AI Integration

AI Provider:

- OpenAI

Use cases:

- Business card OCR
- Meeting note generation
- Excel/CSV import column mapping

규칙:

- OpenAI 호출은 Backend interface/port 뒤에 감싼다.
- 비즈니스 use case는 자기 도메인 모듈 안에 둔다.

## 6. Auth

Providers:

- Kakao
- Google
- Naver
- Apple

Auth는 사용자 기반이다. Admin authorization은 role 기반이다.

## 7. Mobile

Mobile app은 아직 repo에 만들지 않는다.

미래 stack:

- React Native
- Expo

Mobile은 web MVP 검증 후 추가한다.

## 8. Data Protection

Admin에서는 민감 데이터가 기본 마스킹된다.

민감 데이터 원문 접근에는 다음이 필요하다.

- 명시적 액션
- 사유 입력
- 감사 로그

민감 데이터:

- 개인 메모
- 회의록 본문
- 딜 금액
- 사용자가 민감 표시한 데이터

## 9. Testing

상세 규칙:

- `TESTING.md`

MVP E2E 범위는 User Web과 Admin Web을 모두 포함한다.

## 10. Deployment

상세 규칙:

- `DEPLOYMENT.md`

MVP 환경:

- `local`
- `production`

MVP에는 `staging` 환경을 두지 않는다.
