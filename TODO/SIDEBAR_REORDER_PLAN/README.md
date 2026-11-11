# 사이드바 순서 변경

2026-11-11 사용자 요청: Object/List sortOrder, API 3개, User Web 드래그, Backend/DB 규칙 검토.

- 계약: [SIDEBAR_ORDER_API.md](COMMON/API-SPEC/SIDEBAR_ORDER_API.md)
- 상태: 구현·검증·실제 Supabase migration 적용 완료.
- 기존 변경: 시작 시 working tree clean, HEAD be2b99ae.
- 범위: Workspace 공통 관리 항목·업무 목록, 멤버별 즐겨찾기. 상단 보기 메뉴 순서는 유지한다.
- 2026-11-11 후속 커밋 요청: 기능 구현과 Backend 재검토 보완을 함께 커밋 범위에 포함한다.

## 구현 결과

| 영역 | 결과 |
| --- | --- |
| DB | ObjectDefinition/ListDefinition에 sortOrder INTEGER NOT NULL DEFAULT 0. 기존 표시 순서를 보존해 초기화. 실제 Supabase 적용 완료 |
| Backend | 관리 항목·업무 목록·개인 즐겨찾기 PATCH order 3개. 전체 ID 집합 검증, 소속/멤버 분리, no-op, transaction·동시성·감사 필드 처리 |
| 조회/생성 | 기존 GET 3개는 sortOrder ASC만 사용. 새 Object/List는 같은 범위의 마지막에 추가 |
| Frontend | 각 섹션 안에서 행을 마우스로 이동. hover 시 이동 손잡이 표시. 키보드 이동·취소, 저장 중 차단, 실패 복구, Workspace cache 분리 |
| 검토 | [Backend/DB/Frontend 규칙 검토](RULE_COMPLIANCE_REVIEW.md) 완료 |

## 검증 결과

- Backend: 재검토 후 76 suites / 802 tests 통과. 순서 HTTP 69개, 실제 격리 PostgreSQL 통합 14개 포함. 생성 순서 정책·권한/접근 실패 관측 검증을 보강했다.
- Frontend: unit 18 files / 99 tests, Chromium E2E 16개 통과. E2E 8개는 신규 재정렬, 나머지 8개는 기존 사이드바 목록·접힘·Workspace 전환 회귀 검사다.
- Backend/Frontend typecheck·lint·build, Prisma validate·generate, git diff --check 통과. 기존 Prisma SetNull 경고 4개와 FE bundle-size/Browserslist 경고는 유지한다.
- 실제 Supabase: migration 76건 적용 상태, 대기 SQL 없음, Prisma diff empty. 대상 9/8/2행의 표시 순서·감사 필드와 CRM 20개 테이블 데이터, 기존 constraint 163개·index 90개·RLS·권한 보존.
- 테스트 PostgreSQL은 별도 포트 55441에 준비해 검증 후 정상 종료했다. 기존 3000/5173 사용자 서버와 환경 파일은 변경하지 않았다. 브라우저 검증은 API mock이며 실사용자 업무 순서를 변경하는 테스트는 실행하지 않았다.

## 참고

- 사용자 요청으로 [Backend 재검토](BE-TODO/BACKEND_REVIEW.md)를 추가 수행했다. 생성 정책을 application으로 이동하고 권한 거부·접근 조회 실패 로그, 상세 API/BE-TODO 문서를 보완했다. 변경된 운영 TS 32개 파일의 AST import/호출 경계 점검에서 금지 의존성을 찾지 못했다.
- 기존 공통 AuthGuard의 인증 실패 구조화 로그 부재는 별도 미해결 항목이다. 이번 기능의 권한·업무 실패 기록 보완을 백엔드 전체의 완전 준수로 해석하지 않는다.

- API 경로·request/response JSON·오류 계약: [SIDEBAR_ORDER_API.md](COMMON/API-SPEC/SIDEBAR_ORDER_API.md).
- 실제 DB 적용 시 기존 빈 migration 폴더의 P3015를 유효 SQL 임시 묶음으로 우회했다. 과거 SQL 원본 2건 누락 및 Prisma 경고의 배경과 적용 증거는 검토 문서에 기록했다.
- 원격 앱 배포는 수행하지 않았다. 사용자 후속 요청에 따라 SQL·코드·검토 문서를 함께 커밋한다.
