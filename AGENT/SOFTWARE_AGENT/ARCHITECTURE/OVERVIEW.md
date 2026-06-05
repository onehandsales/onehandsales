# 아키텍처 개요

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

## 2. 프론트엔드

User Web과 Admin Web은 별도 앱이다.

```text
FE/
  user-web/
  admin-web/
```

공통 기술 기준:

| 구분 | 기술 |
| --- | --- |
| 런타임 | Node.js 24 LTS |
| 프레임워크 | React 19 |
| 언어 | TypeScript |
| 번들러/개발 서버 | Vite 7 |
| 라우팅 | React Router DOM 7 |
| 스타일 | Tailwind CSS 3, PostCSS, shadcn/ui, Pretendard Font |
| 아이콘 | lucide-react |
| 서버 상태 | TanStack Query |
| 클라이언트 상태 | 기본은 로컬 상태, 필요할 때만 Zustand |
| 폼/검증 | React Hook Form, Zod |
| 빌드 검증 | `tsc --noEmit`, `vite build` |

프론트엔드는 feature-first 구조를 사용한다. `pages`는 라우트 진입점과 화면 조립만 담당하고, 실제 도메인 UI, 훅, API 호출, 타입, 스키마는 `features/<domain>` 아래에 둔다.

상세 규칙:

- `FRONTEND_USER_WEB.md`
- `ADMIN_WEB.md`

## 3. 백엔드

백엔드 기술 기준:

- NestJS
- Prisma
- Supabase/PostgreSQL
- DDD
- Clean Architecture
- Modular Monolith

API 분리:

- User API: `/api/*`
- Admin API: `/admin/api/*`

Admin API는 auth guard와 admin guard를 사용해야 한다.

상세 규칙:

- `BACKEND.md`

## 4. 백엔드 모듈 규칙

각 비즈니스 도메인은 다음 네 계층 구조를 사용한다.

```text
domain/
application/
infrastructure/
presentation/
```

Domain 계층은 NestJS, Prisma, HTTP client, 외부 SDK에 의존하지 않는다.

Application 계층은 use case를 조율하고 domain repository/port를 사용한다.

Infrastructure 계층은 repository와 외부 adapter를 구현한다.

Presentation 계층은 controller와 DTO를 포함한다.

## 5. AI 연동

AI 제공자:

- OpenAI

사용 사례:

- Business card OCR
- Meeting note generation
- Excel/CSV import column mapping

규칙:

- OpenAI 호출은 Backend interface/port 뒤에 감싼다.
- 비즈니스 use case는 자기 도메인 모듈 안에 둔다.

## 6. 인증

인증 제공자:

- Kakao
- Google
- Naver
- Apple

Auth는 사용자 기반이다. Admin authorization은 role 기반이다.

## 7. 모바일

모바일 앱은 아직 repo에 만들지 않는다.

미래 기술 후보:

- React Native
- Expo

모바일은 web MVP 검증 후 추가한다.

## 8. 데이터 보호

Admin에서는 민감 데이터가 기본 마스킹된다.

민감 데이터 원문 접근에는 다음이 필요하다.

- 명시적 액션
- 사유 입력
- 감사 로그

민감 데이터:

- Memo 기록
- 회의록 본문
- 딜 금액
- 사용자가 민감 표시한 데이터

## 9. 테스트

상세 규칙:

- `TESTING.md`

MVP E2E 범위는 User Web과 Admin Web을 모두 포함한다.

## 10. 배포

상세 규칙:

- `DEPLOYMENT.md`

MVP 환경:

- `local`
- `production`

MVP에는 `staging` 환경을 두지 않는다.

프론트엔드 배포:

- User Web과 Admin Web은 Vercel에서 별도 프로젝트로 배포한다.
- User Web 프로젝트 루트는 `FE/user-web`이다.
- Admin Web 프로젝트 루트는 `FE/admin-web`이다.
