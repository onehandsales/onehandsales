# G04 Multi Account Security QA

상태: Ready
우선순위: P0
담당 영역: BE, FE/user-web

## 1. 목표

다중 계정 환경에서 사용자 A/B 데이터가 Search, Trash, Export, 직접 API 접근, Admin API 경계에서 섞이지 않는지 확인한다.

## 2. 먼저 읽을 문서

- `AGENT/SOFTWARE_AGENT/COMMON/QA_CHECKLIST.md`의 `24. 보안/개인정보 QA`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/TESTING.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `TODO/USER_WEB_RELEASE_QA_FOLLOWUP_PLAN/COMMON/API-SPEC/README.md`

## 3. 포함 범위

- 사용자 A/B test fixture 준비
- Company/Contact/Product/Deal/Schedule/MeetingNote 직접 조회 ownership 확인
- Search 결과 ownership 확인
- Trash 목록/detail/restore ownership 확인
- Company/Contact/Product/Deal XLSX export ownership 확인
- 일반 사용자 token의 `/admin/api/*` 접근 차단 확인
- User Web API client가 `/admin/api/*` 호출을 막는지 확인

## 4. 제외 범위

- 실제 운영 계정 데이터 사용
- 비밀값 기록
- 결제/구독 권한
- Admin 운영 화면 구현
- 새로운 Admin API 추가

## 5. Backend 구현 지침

가능하면 자동 테스트로 고정한다.

권장 테스트 방향:

- repository/application/presentation 중 현재 코드 구조에 가장 적은 침투로 ownership을 검증할 수 있는 계층을 선택한다.
- Search, Trash, Export처럼 데이터 유출 위험이 큰 흐름은 HTTP 또는 presentation-level test를 우선한다.
- XLSX export는 response binary를 파싱하거나 buffer string 검사로 사용자 B의 fixture name이 없는지 확인한다.
- controller에서 Prisma를 직접 호출하지 않는다.
- domain/application은 Prisma type을 import하지 않는다.
- domain error와 HTTP status mapping을 분리한다.

## 6. Frontend 확인 지침

- `FE/user-web/src/lib/api-client.ts`가 `/admin/api/*`를 차단하는지 확인한다.
- User Web feature API 파일에서 `/admin/api/` 문자열이 없는지 검색한다.
- 보호 route에서 로그아웃 후 뒤로가기로 사용자 데이터가 보이지 않는지 smoke 확인한다.

검색 명령:

```powershell
rg -n "\"/admin/api|'/admin/api|admin/api" FE/user-web/src
```

## 7. 검증 명령

```powershell
cd BE
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build

cd ../FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
git diff --check
```

## 8. 완료 기준

- `RQA-004`가 `Fixed`, `Blocked`, 또는 구체 이슈 목록으로 정리되어 있다.
- 다른 사용자 데이터 노출 후보가 있으면 S1 이상으로 기록되어 있다.
- Search, Trash, Export, 직접 API 접근 중 확인하지 못한 항목이 있으면 이유와 다음 조치가 `QA-RESULTS.md`에 있다.
- 테스트 또는 smoke 결과가 명령과 함께 남아 있다.

