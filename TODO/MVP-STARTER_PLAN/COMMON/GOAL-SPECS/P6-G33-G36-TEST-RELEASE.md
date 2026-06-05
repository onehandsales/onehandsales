# P6 G33-G36 테스트와 릴리즈 준비 상세 명세

## 1. 목적

P6는 MVP starter 범위가 다음 개발 단계로 넘어갈 수 있는지 검증하는 단계다.

핵심은 위험 흐름 테스트, User Web smoke E2E, Admin Web smoke E2E, 새 개발자의 로컬 재현 가능성이다.

## G33. Backend 위험 흐름 테스트

### 테스트 목적

데이터 유출, 감사 누락, 자동 로그 누락을 막는다.

### 테스트 대상

- user ownership isolation
- AdminGuard
- deal stage change activity log
- meeting note link activity log
- sensitive raw view audit transaction
- trash restore

### API 연결

- `COMMON/API-SPEC`의 모든 User/Admin 위험 API
- 특히 Deal, MeetingNote, Admin sensitive raw, Trash API

### DB 연결

- User
- Deal
- DealActivity
- MeetingNote
- AuditLog
- 모든 deletedAt 삭제 대상 모델

### 완료 기준

- 위험 흐름 테스트가 자동 실행된다.
- 다른 사용자 데이터 접근 테스트가 실패해야 한다.
- 원문 조회와 AuditLog 생성은 transaction으로 검증된다.

## G34. User Web smoke E2E

### 테스트 목적

개인 영업자의 핵심 업무 흐름이 깨지지 않게 한다.

### 시나리오

1. 로그인 또는 mock login
2. 회사 생성
3. 거래처(담당자) 생성
4. 제품 생성
5. 딜 생성
6. 딜 단계 변경
7. 일정 생성
8. 회의록 저장

### 화면/API 연결

- User Web 전체 핵심 화면
- Company, Contact, Product, Deal, Schedule, MeetingNote API

### 상태 기준

- 기본 smoke E2E는 안정성을 위해 외부 Provider를 stub/mock으로 처리할 수 있다.
- 별도 external-provider smoke는 실제 개발용 credential로 OpenAI/OCR/Google Calendar/SMTP/Web Push VAPID 연결을 확인한다.
- 테스트 데이터는 사용자별로 격리한다.

### 완료 기준

- Playwright smoke E2E가 local에서 통과한다.
- 실패 시 어떤 goal의 기능이 깨졌는지 추적할 수 있다.

## G35. Admin Web smoke E2E

### 테스트 목적

Admin 안전 흐름이 깨지지 않게 한다.

### 시나리오

1. Admin 로그인
2. non-admin 접근 차단
3. 사용자 목록 조회
4. 전체 딜 목록 조회
5. 민감 데이터 masking 확인
6. 원문 조회 사유 입력
7. 감사 로그 생성 확인

### 화면/API 연결

- Admin dashboard
- 사용자 목록/상세
- 전체 딜 목록
- 민감정보 원문 조회 dialog
- 감사 로그 목록

### 상태 기준

- Admin 계정과 non-admin 계정을 seed 또는 fixture로 분리한다.
- 원문 조회 시 reason 없이는 실패해야 한다.
- client log에 PII가 남지 않는지 확인한다.

### 완료 기준

- Admin Web Playwright smoke E2E가 local에서 통과한다.

## G36. MVP starter 통합 점검

### 점검 목적

새 개발자가 문서만 보고 local 실행을 재현할 수 있게 한다.

### 점검 항목

- README 실행 방법
- `.env.example`
- FE/user-web 실행 명령
- FE/admin-web 실행 명령
- BE 실행 명령
- DB migration/seed
- external provider env와 smoke 실행 방법
- E2E 실행 명령
- 남은 결정 사항 목록

### 문서 연결

- 루트 README가 있다면 실행 방법을 최신화한다.
- 각 앱 README가 있다면 독립 실행 방식을 적는다.
- `COMMON/PLANNING-REVIEW.md`에 남은 보류 항목을 반영한다.

### 완료 기준

- 새 개발자가 문서만 보고 local 실행을 재현할 수 있다.
- 다음 계획 폴더로 넘길 미완료 항목이 정리된다.

## 관련 문서

- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/README.md`
- `TODO/MVP-STARTER_PLAN/FE-TODO/USER-WEB-TODO.md`
- `TODO/MVP-STARTER_PLAN/FE-TODO/ADMIN-WEB-TODO.md`
- `TODO/MVP-STARTER_PLAN/BE-TODO/API-TODO.md`
- `TODO/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/TESTING.md`
