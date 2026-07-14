# Front 엔지니어링 리뷰 체크리스트

## 1. 목적

이 문서는 User Web과 Admin Web 구현 결과를 검토할 때 사용하는 Frontend 품질 기준이다.

## 2. Frontend User Web 체크리스트

- 서버 상태는 TanStack Query로 관리되는가?
- feature 내부 API 호출은 `src/lib/api-client.ts`의 앱 API client를 사용하는가?
- form validation은 React Hook Form과 Zod를 사용하는가?
- route state가 필요한 목록 필터는 URL search params에 반영되는가?
- 다른 feature의 internal file을 직접 import하지 않는가?
- User Web에서 `/admin/api/*`를 호출하지 않는가?
- User Web API client가 실제 Backend `/api/*` contract와 맞는가?
- 시간 필드는 `AGENT/SOFTWARE_AGENT/DB_SCHEMA/TIME_AND_TIMEZONE_POLICY.md`의 UTC instant + IANA `timeZone` 기준을 따르는가?
- 일정 생성/수정 form은 사용자 입력 local date-time과 IANA `timeZone`을 함께 보내고, 입력값을 `toISOString()`으로 임의 변환하지 않는가?
- Backend에서 받은 UTC ISO string은 일정/사용자/조직 timezone으로 변환해 표시하는가?
- Company 화면/API 작업 시 `companyName`, `companyFieldId`, `companyRegionId`, memo/private memo contract가 Backend와 맞는가?
- 모바일에서 딜 파이프라인이 카드형 리스트로 동작하는가?
- Frontend component/function/hook에 `// 기능 : ...` 주석이 있는가?

## 3. Admin Web 체크리스트

- Admin Web은 `/admin/api/*`만 호출하는가?
- query key가 `admin` namespace로 시작하는가?
- Admin Web에서 호출하는 `/admin/api/*`가 현재 Backend에 구현되어 있는가?
- Backend에 없는 admin query API를 사용하는 화면은 mock/placeholder 상태가 명확히 드러나는가?
- 글로벌 목록은 서버 페이지네이션을 사용하는가?
- 민감 데이터가 기본 마스킹되는가?
- 원문 조회 사유가 client log에 남지 않는가?
- 위험 액션은 확인 dialog와 필요한 경우 사유 입력을 요구하는가?
- 사용자 웹의 feature 내부 구현을 직접 import하지 않는가?

## 4. 테스트 체크리스트

- User Web 핵심 smoke E2E가 있는가?
- Admin Web auth/role smoke는 현재 라우터 기준 수동 QA로 확인했는가? E2E를 gate로 쓰려면 과거 운영 화면 기대값을 제거하고 현재 router 기준으로 갱신했는가?
- 외부 Provider는 E2E에서 mock/stub 처리되는가?
- Admin 페이지 본 구현 범위라면 민감정보 마스킹과 원문 조회 사유 입력 흐름을 Admin Web에서 검증하는가?

## 5. 배포 체크리스트

- User Web과 Admin Web은 Vercel에서 별도 프로젝트로 배포되는가?
- production secret이 Frontend `.env`에 들어가지 않는가?
- 배포 전 User Web 전체 E2E와 Admin auth/role 수동 smoke를 실행할 수 있는가? Admin auth smoke E2E는 현재 router 기준으로 갱신한 뒤 gate에 올리는가?

## 6. 관련 문서

- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/ADMIN_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/DEPLOYMENT.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
