# Service QA Scope

## 1. QA 대상

이번 QA는 판매 가능성을 판단하기 위한 서비스 QA이면서, 1인 실사용 기준의 기능 선별 QA다. 기능이 존재하는지보다 사용자가 실제 업무를 끝까지 수행할 수 있는지, 그리고 해당 기능을 유지/개선/제거/숨김/보류 중 무엇으로 볼지를 기준으로 본다.

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

## 6. 기능 판단 기준

- `KEEP`: 현재 기능을 유지하고 regression QA 대상으로 둔다.
- `FIX`: 의도한 기능이 깨졌으므로 수정한다.
- `IMPROVE`: 유지하되 UX, API, 성능, 문구, 흐름을 개선한다.
- `REMOVE`: 필요성이 낮거나 제품 복잡도를 높이므로 제거한다.
- `HIDE`: 구현은 남기되 현재 사용자에게 노출하지 않는다.
- `DEFER`: 베타 이후 또는 별도 계획으로 미룬다.
- `RETHINK`: 기능 가치나 구현 방향을 다시 판단한다.

## 7. 즉시 수정 기준

QA 중 아래 항목은 흐름을 크게 끊지 않는 경우 즉시 수정할 수 있다.

- 화면 진입 불가
- 저장, 수정, 삭제, 복구 실패
- 명확한 오타나 문구 오류
- 10~20분 안에 끝나는 버튼, 라벨, 빈 상태 UX 문제
- 사용자가 다음 행동을 찾지 못하는 명확한 흐름 문제

아래 항목은 즉시 수정하지 않고 먼저 `ISSUE-LOG.md`에 기록한다.

- 화면 구조를 크게 바꿔야 하는 UX
- API 계약 변경이 필요한 기능
- 제거/숨김/유지 판단이 필요한 기능
- 여러 화면에 영향을 주는 공통 컴포넌트 수정
- 새 기능 아이디어

## 8. QA 중단 기준

다음이 발생하면 해당 축의 QA를 중단하고 이슈부터 정리한다.

- S0 발견
- S1 보안/데이터 노출 발견
- 실제 DB 대상이 공유/운영 DB로 확인됐는데 destructive 명령이 필요한 경우
- provider secret 또는 token이 로그/문서에 노출된 경우
