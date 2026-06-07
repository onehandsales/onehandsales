# Provider, CI, Release 다음 단계 방향성

## 1. 목적

이 문서는 `MVP-STARTER_PLAN` 완료 이후 다음 개발 단계의 방향성과 추천 실행 순서를 정리한다.

현재 프로젝트는 local MVP starter 기준으로 Backend, User Web, Admin Web, smoke E2E, 위험 흐름 테스트, 실행 문서가 갖춰진 상태다. 다음 단계는 mock 중심 검증을 실제 인증, 실제 외부 Provider smoke, CI, 배포 준비로 확장하는 것이다.

이 문서는 간단한 방향성 문서이며, 바로 구현 가능한 전체 `/goal` 실행 계획서는 아니다. 실제 구현 전에 `COMMON/GOAL-WORK-ORDER.md`, `COMMON/GOAL-SPECS`, `COMMON/API-SPEC`, `FE-TODO`, `BE-TODO`를 갖춘 실행 계획으로 확장해야 한다.

## 2. 현재까지 완료된 작업

`MVP-STARTER_PLAN`의 G16-G36 연속 작업에서 다음을 완료했다.

- User Web 홈을 딜 파이프라인 중심으로 통합했다.
- Schedule Backend CRUD, 월간/주간 조회, reminder 기본 구조를 구현했다.
- User Web 일정 화면, 월간/주간 전환, 주간 보고서 화면을 구현했다.
- MeetingNote Backend CRUD, AI 생성 port/adapter, 딜 연결과 DealActivity 자동 생성을 구현했다.
- User Web 회의록 목록, 생성, AI 결과 수정, 딜 연결 화면을 구현했다.
- BusinessCard OCR Backend, OpenAI/OCR adapter, 확정 저장 API를 구현했다.
- User Web 명함 OCR 업로드, 결과 수정, 회사 후보 선택, 거래처 저장 화면을 구현했다.
- Import Backend, CSV/Excel parser, AI mapping, preview, 확정 실행 transaction을 구현했다.
- User Web Import 화면, 매핑 확인, 오류 row 표시, 확정 실행 흐름을 구현했다.
- Export Backend, Excel/PDF placeholder, 민감 데이터 포함 확인, 다운로드 흐름을 구현했다.
- User Web Export 화면, 민감 데이터 경고 dialog, export job 상태와 다운로드 UI를 구현했다.
- Notification 기본 flow, email/browser push adapter 구조, User Web 알림 화면을 구현했다.
- Trash Backend/User Web 기본 flow, 복구, 30일 보관 기준, 자동 삭제 job 기본 구조를 구현했다.
- 통합검색 Backend/User Web 기본 flow, type별 grouping, 민감 원문 비노출 기준을 구현했다.
- Admin Backend 조회 API, dashboard, 사용자/도메인 목록과 상세, 기본 masking을 구현했다.
- Admin Web 기본 운영 화면, 사용자/도메인 조회, 서버 페이지네이션 UI를 구현했다.
- 민감정보 원문 조회 API, 사유 검증, AuditLog transaction, Admin Web 원문 조회와 감사 로그 화면을 구현했다.
- Backend 위험 흐름 테스트를 추가했다.
- User Web smoke E2E를 추가했다.
- Admin Web smoke E2E를 추가했다.
- README, `.env.example`, migration/seed, local 실행, 검증 명령, 남은 보류 항목을 정리했다.
- G16-G36 전체 작업에 대해 `TODO_LOG`와 완료 감사 기록을 남겼고 git commit까지 완료했다.

현재 검증 기준:

- Backend `typecheck`, `lint`, `prisma:validate`, `test`, `build` 통과
- User Web `typecheck`, `lint`, `build`, `test:e2e` 통과
- Admin Web `typecheck`, `lint`, `build`, `test:e2e` 통과

## 3. 다음 단계 추천 방향

추천 방향은 실제 사용자 환경에 가까운 검증 가능성을 높이는 것이다.

우선순위는 다음 순서를 권장한다.

1. 실제 Supabase Auth 연결
2. App token exchange와 refresh cookie E2E 검증
3. 실제 Provider smoke job 분리
4. CI workflow 구성
5. production 배포 runbook 작성
6. mock login 제거 또는 provider login smoke로 대체

이 순서를 추천하는 이유는 인증이 실제 사용자 진입점이고, 인증이 안정돼야 외부 Provider smoke와 CI가 의미 있는 end-to-end 검증으로 이어지기 때문이다. CI와 배포 문서를 먼저 만들면 실제 인증/provider 흐름이 빠진 상태의 형식적 gate가 될 위험이 있다.

## 4. 포함 범위

다음 계획에서 포함해야 할 범위는 다음과 같다.

- Supabase Auth provider callback
- Backend `/api/auth/exchange`와 refresh cookie 흐름의 실제 FE 연결
- User Web과 Admin Web의 provider login smoke
- Backend provider smoke script 또는 테스트 job
- OpenAI/OCR smoke
- Google Calendar smoke
- SMTP email smoke
- Web Push VAPID smoke
- Supabase Storage smoke
- GitHub Actions 또는 선택한 CI의 Backend/User Web/Admin Web 검증 workflow
- Prisma migration deploy 검증 step
- 배포 전 release gate 문서
- production 환경 변수 checklist

## 5. 제외 범위

다음 계획의 1차 범위에서는 다음을 제외하는 것을 권장한다.

- 복잡한 staging 환경 신설
- 실제 결제/구독 운영 기능
- 대량 데이터 성능 고도화
- 전체 E2E를 모든 PR에서 실행하는 무거운 CI
- 실 Provider credential을 일반 local smoke에 기본 사용
- production 실제 사용자 데이터로 Provider smoke를 실행하는 방식

## 6. 추천 작업 단위 초안

본격 계획 문서를 만들 때는 다음 작업 단위로 쪼개는 것을 권장한다.

### G00. 다음 단계 운영 결정 정리

- CI provider, secret 관리 방식, provider smoke 실행 환경, production domain 값을 확정한다.
- 확정값은 `AGENT/PM_AGENT/DECISIONS`와 해당 계획 문서에 함께 남긴다.

### G01. Supabase Auth FE callback 연결

- User Web/Admin Web에서 실제 provider login callback을 처리한다.
- mock login은 local 개발 옵션으로만 남길지, smoke fixture 전용으로 분리할지 결정한다.

### G02. App token exchange와 refresh cookie E2E

- FE가 Supabase access token을 Backend exchange API로 전달한다.
- Backend App access token, httpOnly refresh cookie, refresh/logout 흐름을 E2E로 검증한다.

### G03. Provider smoke job 기반 만들기

- 실 Provider 호출 smoke와 기본 mock E2E를 분리한다.
- smoke는 production-safe fixture와 개발 credential만 사용한다.

### G04. OpenAI/OCR/Import mapping smoke

- BusinessCard OCR, MeetingNote 생성, Import mapping을 좁은 입력 fixture로 확인한다.
- 응답 품질 평가는 통과/실패 기준을 과도하게 엄격하게 두지 않고 schema와 안전성 중심으로 본다.

### G05. Google Calendar/SMTP/Web Push smoke

- 외부 전송과 calendar 연동은 실제 사용자 데이터가 아닌 테스트 계정과 테스트 calendar만 사용한다.
- 실패 시 서비스 전체 배포를 막을지, provider degraded 상태로 분리할지 정책을 정한다.

### G06. CI workflow

- Backend, User Web, Admin Web 검증을 독립 job으로 구성한다.
- PR에서는 빠른 smoke, main merge 이후와 배포 전에는 더 넓은 gate를 실행한다.

### G07. Prisma migration deploy gate

- CI 또는 배포 전 단계에서 `prisma migrate deploy`를 검증한다.
- migration 실패 시 배포를 중단한다.

### G08. Production release runbook

- 환경 변수, secret, domain, CORS, cookie, migration, E2E, rollback 기준을 문서화한다.

## 7. 주의사항

- 실제 Provider smoke는 비용, rate limit, 외부 장애 영향을 받는다. 기본 local smoke와 분리해야 한다.
- Supabase service role key, refresh token, provider secret은 문서와 로그에 기록하지 않는다.
- Admin Web의 민감정보 원문 조회와 AuditLog 정책은 CI/E2E에서도 유지해야 한다.
- production 배포는 full E2E와 migration gate가 통과한 뒤에만 진행한다.
- mock login은 개발 편의 기능이지 production 인증 대체물이 아니다.

## 8. 관련 문서

- `TODO/MVP-STARTER_PLAN/COMMON/PLANNING-REVIEW.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `AGENT/PM_AGENT/CONVENTION/DOCUMENTATION.md`
- `AGENT/PM_AGENT/DECISIONS/015_todo_goal_work_order.md`
- `AGENT/PM_AGENT/DECISIONS/020_todo_execution_plan_standard.md`
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/DEPLOYMENT.md`
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/TESTING.md`
- `README.md`
