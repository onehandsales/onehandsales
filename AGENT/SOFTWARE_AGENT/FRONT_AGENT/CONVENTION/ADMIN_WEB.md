# Admin Web 프론트엔드 컨벤션

이 문서는 `FE/admin-web` 개발 시 지켜야 할 코드 작성 규칙을 정의한다. 모든 문서는 한글로 작성한다.

## 1. 기본 원칙

- Admin Web은 User Web과 별도 앱으로 유지한다.
- 사용자 웹의 도메인 feature를 직접 재사용하지 않는다.
- 관리자 권한 확인은 서버를 신뢰 기준으로 한다.
- 프론트의 라우트 가드는 UX 보조 장치일 뿐 보안 경계가 아니다.
- 관리자 토큰, 권한, 역할 정보는 필요한 범위에서만 사용한다.

## 2. 파일과 폴더 이름

- 폴더와 파일 이름은 `kebab-case`를 사용한다.
- 관리자 확인 API client 파일은 `admin-` prefix를 사용할 수 있다. 예: `admin-api-client.ts`.
- 페이지 폴더는 라우트 이름과 맞춘다. 예: `pages/login`, `pages/home`.

## 3. TypeScript 기준

- `strict`를 켠다.
- API 응답과 auth 상태 타입을 명시한다.
- `any`는 금지한다.

## 4. 데이터 호출

- Admin Web의 API 호출은 `src/lib/admin-api-client.ts`를 통해서만 수행한다.
- 현재 허용된 Backend 호출은 `GET /admin/api/me`뿐이다.
- 사용자 웹의 `api-client.ts` 또는 feature API를 import하지 않는다.

## 5. 시간과 Timezone 표시

시간과 timezone 처리는 `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`를 따른다.

- Backend에서 받은 `createdAt`, `updatedAt`은 UTC ISO string으로 본다.
- 화면에는 UTC string을 그대로 출력하지 않고 필요한 표시 timezone으로 변환한다.
- 날짜만 필요한 `YYYY-MM-DD` 값은 timezone 변환 없이 표시한다.

## 6. 스타일과 UI

- Tailwind CSS를 기본 스타일링 도구로 사용한다.
- 기본 UI 폰트는 Notion-like 다국어 스택을 기준으로 한다: `Inter`, `Pretendard Variable`, `Pretendard`, `ui-sans-serif`, `system-ui`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Apple SD Gothic Neo`, `Noto Sans KR`, `Noto Sans CJK KR`, `PingFang TC`, `PingFang SC`, `Microsoft JhengHei`, `Microsoft YaHei`, `Hiragino Sans`, `Hiragino Kaku Gothic ProN`, `Yu Gothic`, `Meiryo`, `Noto Sans TC`, `Noto Sans SC`, `Noto Sans JP`, `sans-serif`.
- 이 폰트 기준은 현재 노출 언어인 한국어, 영어 US, 영어 Canada에 적용하고, 추후 확장 후보인 일본어, 영어 UK/Singapore/Australia에도 재사용한다.
- 영어/라틴 문자는 `Inter`를 우선하고, 한국어는 `Pretendard` 계열 fallback, 일본어는 OS CJK 시스템 폰트 fallback을 사용한다.

## 7. 금지 사항

- 관리자 웹에서 사용자 앱 라우트나 사용자 feature 내부 구현을 직접 import하지 않는다.
- `/api/*` 일반 사용자 API로 관리자 권한을 확인하지 않는다.
- 로그나 화면에 secret 값을 출력하지 않는다.
- 로컬 가짜 역할 값으로 Backend 권한 확인을 대체하지 않는다.

## 8. 관련 문서

- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/ADMIN_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/DEPLOYMENT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`
