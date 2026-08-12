# Service QA Scope

## 1. QA 대상

이번 QA는 판매 가능성을 판단하기 위한 서비스 QA다. 기능이 존재하는지보다, 사용자가 실제 업무를 끝까지 수행할 수 있는지를 기준으로 본다.

## 2. 자동 검증 범위

Backend:

- `pnpm.cmd run typecheck`
- `pnpm.cmd run lint`
- `pnpm.cmd run test`
- `pnpm.cmd run build`
- `pnpm.cmd prisma:validate`
- `pnpm.cmd prisma:generate`
- `pnpm.cmd exec prisma migrate status`

User Web:

- `pnpm.cmd run typecheck`
- `pnpm.cmd run lint`
- `pnpm.cmd run build`
- `pnpm.cmd run test:e2e`
- `pnpm.cmd run test:e2e:mobile`
- `pnpm.cmd run test:e2e:browsers`
- `pnpm.cmd run test:e2e:analytics`

Admin Web:

- `pnpm.cmd run typecheck`
- `pnpm.cmd run lint`
- `pnpm.cmd run build`
- `pnpm.cmd run test:e2e`

## 3. 수동/통합 QA 범위

User Web:

- 로그인, 로그아웃, 보호 라우트
- 회사 생성/조회/수정/삭제/복구
- 담당자 생성/조회/수정/삭제/복구
- 제품 생성/조회/수정/삭제/복구
- 딜 생성/조회/수정/상태 변경/활동 기록
- 일정 생성/조회/수정/삭제
- 회의록 생성/조회/수정/딜 연결
- 명함 OCR happy path와 provider failure 표시
- Import 미리보기/검증/확정
- Search 결과와 삭제 데이터 미노출
- Trash 목록/상세/복구
- Settings 프로필/기기/로그아웃

Admin Web:

- non-admin 차단
- admin 로그인
- 사용자 목록/상세 조회
- 도메인 데이터 read-only 조회
- 민감 원문 조회 사유 validation
- 감사 로그 기록 확인
- provider failure 조회
- analytics overview 조회
- account deletion/data export request queue 조회
- trash recovery request queue 조회
- operation gate 조회/실행

Backend/DB:

- 인증 없음 401
- 일반 사용자 admin API 403
- 다른 사용자 데이터 ownership 차단
- validation 400
- 존재하지 않는 resource 404
- 삭제/복구 conflict 409
- transaction rollback
- audit log 생성
- 민감 정보 redaction

## 4. 제외 범위

- Paddle checkout, billing admin, subscription entitlement
- production DB destructive migration/seed
- 실제 provider 대량 호출
- native app QA
- B2B tenant/team admin
- 신규 기능 구현

## 5. Severity 기준

- `S0 Blocker`: 로그인 불가, 앱 진입 불가, 데이터 전체 접근 불가, 빌드/실행 불가
- `S1 Critical`: 다른 사용자 데이터 노출, 권한 우회, 데이터 손실, 민감 정보 로그 노출
- `S2 Major`: 핵심 업무 흐름 실패, 생성/수정/삭제/복구 실패, 주요 화면 사용 불가
- `S3 Minor`: 일부 필터/정렬/문구/레이아웃 문제, 우회 가능
- `S4 Polish`: 시각적 정돈, 미세 문구, 사용성 개선

## 6. QA 중단 기준

다음이 발생하면 해당 축의 QA를 중단하고 이슈부터 정리한다.

- S0 발견
- S1 보안/데이터 노출 발견
- 실제 DB 대상이 공유/운영 DB로 확인됐는데 destructive 명령이 필요한 경우
- provider secret 또는 token이 로그/문서에 노출된 경우

