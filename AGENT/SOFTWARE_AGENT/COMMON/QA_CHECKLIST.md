# OneHand CRM QA 체크리스트

Status: Current Software QA
Date: 2026-09-13

## 1. 목적

이 문서는 현재 구현된 foundation 기능과 후속 CRM Core 작업의 공통 QA 기준을 정의한다.

현재 코드에 없는 기능을 QA 완료 대상으로 보지 않는다.

## 2. 자동 점검

### Backend

- `pnpm prisma:validate`
- `pnpm prisma:generate`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm build`

### User Web

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm build`
- `pnpm test:e2e`
- 필요한 경우 `pnpm test:e2e:mobile`
- 필요한 경우 `pnpm test:e2e:browsers`

### Admin Web

- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`
- `pnpm test:e2e`

## 3. 현재 foundation 수동 QA

- 로그인, refresh, logout
- 권한 없는 API 차단
- `/app` foundation 접근과 비로그인 redirect
- `/app/more` 접근
- account settings modal
- 오류 신고와 지원 문의 접수
- 공개 문의 접수와 필수 입력 검증
- 관리자 화면의 access token 입력 후 `/admin/api/me` 확인

## 4. 후속 CRM Core QA 후보

CRM Core가 구현되면 아래 QA를 추가한다.

- Kit 선택
- Kit 미리보기
- Workspace 준비
- 첫 Record 생성
- 기본 List/View에서 생성한 Record 확인
- Record 상세 조회
- Record 수정
- Record 연결
- 모바일 첫 Record 생성
- ownership isolation
- API 계약과 FE client response type 정합성

## 5. 완료 기준

- 자동 점검이 통과한다.
- 현재 활성 기능의 happy path와 주요 error path가 확인됐다.
- 사용자 소유 데이터는 현재 사용자 또는 Workspace 경계 안에서만 접근된다.
- 삭제된 기능의 route, API, DB schema, 사용자 화면 참조가 활성 범위처럼 남아 있지 않다.
- 문서에는 현재 코드에서 제공하는 기능과 후속 draft가 구분되어 있다.

## 6. 관련 문서

- `AGENT/SOFTWARE_AGENT/COMMON/IMPLEMENTATION_BOUNDARY.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`
