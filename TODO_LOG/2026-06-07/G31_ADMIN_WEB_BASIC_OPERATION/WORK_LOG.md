# G31 Admin Web 기본 운영 화면

## 상태
- 완료

## 기준 문서
- `AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/ADMIN_WEB.md`
- `AGENT/SOFTWARE_AGENT/CONVENTION/ADMIN_WEB.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P5-G30-G32-ADMIN-AUDIT.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G30-G32-ADMIN-AUDIT-API.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G30-G32-ENDPOINT-CONTRACT.md`

## 요구사항 체크
- Admin dashboard를 구현한다.
- 사용자 목록/상세를 구현한다.
- 사용자 상세에서 사용자별 데이터 tab/table을 제공한다.
- 전체 회사/거래처/제품/딜 table을 구현한다.
- 서버 페이지네이션 UI를 구현한다.
- 검색과 기본 필터를 제공한다.
- loading/empty/error 상태를 제공한다.
- 마스킹된 필드만 화면에 노출한다.

## 제외 범위
- raw sensitive view dialog
- 결제 관리

## 작업 로그
- G31 기준 문서와 Admin Web 아키텍처를 확인했다.
- 현재 Admin Web은 placeholder 중심임을 확인했다.
- G30에서 구현한 Admin 조회 API를 연결 대상으로 사용한다.
- `features/admin-query`에 Admin 조회 API client, query key, hook, 응답 타입을 추가했다.
- Admin dashboard를 `/admin/api/dashboard` 기반 운영 지표와 최근 감사 로그 화면으로 교체했다.
- 사용자 운영 화면에 사용자 목록, 검색/상태/역할 필터, 페이지네이션, 사용자 상세, 사용자별 회사/거래처/제품/딜 탭을 구현했다.
- 도메인 데이터 화면에 회사/거래처/제품/딜 탭, 검색, 삭제 포함, 딜 단계 필터, 페이지네이션, 상세 요약 패널을 구현했다.
- AdminShell은 작은 화면에서 상단 가로 내비게이션으로 전환하고, 넓은 화면에서 기존 사이드바 구조를 유지하도록 조정했다.
- 긴 감사 로그 action과 고정 컬럼 테이블이 화면을 침범하지 않도록 줄바꿈, 가로 스크롤, 2열 전환 기준을 보강했다.

## 검토
- 민감 필드 원문을 직접 조회하거나 표시하지 않고 G30 API의 마스킹 응답만 화면에 사용했다.
- raw sensitive view dialog와 결제 관리는 G31 제외 범위로 두었다.
- 서버 페이지네이션은 API 응답의 `page`, `totalCount`, `hasNext`를 기준으로 이전/다음 UI에 연결했다.
- 1280px 데스크톱 폭에서 표와 상세 패널이 겹치지 않도록 상세 패널 2열 전환을 `2xl` 이상으로 제한했다.
- 모바일 폭에서는 고정 사이드바 대신 상단 가로 내비게이션을 사용하고, 테이블은 내부 가로 스크롤로 처리했다.

## 검증
- `cd FE/admin-web && pnpm run typecheck`
- `cd FE/admin-web && pnpm run lint`
- `cd FE/admin-web && pnpm run build`
- Playwright mock smoke: dashboard, 사용자 목록/상세, 사용자별 데이터 탭, 도메인 데이터 목록/상세 진입, 딜 탭 전환 확인.
- 데스크톱 캡처: `/tmp/g31-admin-dashboard.png`, `/tmp/g31-admin-users.png`, `/tmp/g31-admin-data.png`
- 모바일 캡처: `/tmp/g31-admin-mobile-dashboard.png`, `/tmp/g31-admin-mobile-users.png`, `/tmp/g31-admin-mobile-data.png`
