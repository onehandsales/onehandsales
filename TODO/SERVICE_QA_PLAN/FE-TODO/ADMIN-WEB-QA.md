# Admin Web QA

## 1. 목적

`FE/admin-web`에서 운영자가 안전하게 사용자/도메인/민감 데이터 상태를 확인할 수 있는지 검증한다.

페이지별 API 확인 항목은 `PAGE-API-QA-MATRIX.md`의 Admin Web 섹션을 기준으로 한다.

## 2. 자동 검증

```powershell
cd D:\workspace_repository\onehandsales\FE\admin-web
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd run build
pnpm.cmd run test:e2e
```

## 3. Playwright 확인 항목

- non-admin 접근 차단
- admin login
- 사용자 목록/상세 route smoke
- 민감 원문 조회 사유 validation
- 원문 조회 후 감사 로그 표시
- provider failure 화면
- usage analytics 화면
- account request queue
- trash recovery queue
- operation gate 화면
- 민감 원문이 console에 남지 않음

## 4. 실제 BE 통합 QA 항목

### 인증/권한

- token 없음: login 또는 401
- 일반 사용자 token: `/admin/api/me` 또는 admin route 접근 차단
- admin token: admin route 접근 가능
- mock admin continue 버튼이 없어야 한다.

### 사용자 운영

- 사용자 목록 조회
- 사용자 상세 조회
- profile masked value 표시
- domain counts 표시
- activity timeline 표시
- raw email/phone이 기본 화면에 노출되지 않음

### 도메인 데이터 조회

- 회사/담당자/제품/딜/일정/회의록 read-only row 표시
- 삭제 상태와 trash 만료 정보 표시
- 상세 row 선택 가능
- 일반 `/api/*`가 아니라 `/admin/api/*` 호출

### 민감 원문 조회

- 사유 10자 미만이면 validation error 표시
- 충분한 사유 입력 후 원문 조회 가능
- 조회 결과가 기본 목록에는 남지 않음
- 감사 로그가 생성됨
- console log에 원문 body 또는 reason이 직접 노출되지 않음

### 운영 상태

- provider failure 목록/상세 조회
- analytics overview 조회
- account deletion request queue 조회
- data export request queue 조회
- trash recovery request queue 조회
- operation check latest 조회
- operation check run 생성 또는 실행 가능 여부 확인

## 5. UX 확인 항목

- desktop 1440px 기준 운영 테이블이 과도하게 넓거나 깨지지 않는다.
- 긴 masked email, request id, safe error code가 셀을 깨지 않는다.
- 위험 액션은 확인 UI 또는 사유 입력을 요구한다.
- 빈 목록, 오류, loading 상태가 운영자가 다음 행동을 판단할 수 있게 표시된다.
