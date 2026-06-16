# P5 G30-G32 Admin과 감사 상세 명세

## 1. 목적

P5는 Admin이 사용자와 전체 데이터를 조회하되, 민감정보 원문 조회는 사유 입력과 감사 로그로 통제하게 만드는 단계다.

## G30. Admin Backend 조회 API

### 화면 영향

G31 Admin Web 운영 화면이 사용할 API를 제공한다.

### API 연결

- `/admin/api/dashboard`
- `/admin/api/users`
- `/admin/api/users/:userId`
- 전체 회사/담당자/제품/딜 목록
- 전체 회사/담당자/제품/딜 상세
- 사용자별 회사/담당자/제품/딜 목록
- API 요약: `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G30-G32-ADMIN-AUDIT-API.md`
- 엔드포인트 구현 계약: `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G30-G32-ENDPOINT-CONTRACT.md`

### DB 연결

- User
- Company
- Contact
- Product
- Deal

### 비즈니스 기준

- Admin API는 AuthGuard와 AdminGuard를 모두 통과해야 한다.
- 민감 데이터는 기본 마스킹한다.
- 암호화된 Memo/회의록 원문은 Admin 목록/상세에서 복호화하지 않는다.
- 회사/담당자/제품/딜 상세 API는 운영 조회용 요약과 마스킹 필드만 반환하고, 민감 원문은 G32 원문 조회 API로 분리한다.
- 서버 페이지네이션을 기본으로 한다.

### 완료 기준

- AdminGuard 통과 사용자만 Admin API를 호출할 수 있다.
- 민감 데이터는 기본 마스킹된다.

## G31. Admin Web 기본 운영 화면

### 화면 목적

Admin이 사용자와 전체 도메인 데이터를 테이블 중심으로 조회할 수 있게 한다.

### 화면 구성

#### Dashboard

- 총 사용자 수
- 활성 사용자 수
- 전체 회사/담당자/제품/딜 수
- 최근 감사 로그 요약

#### 사용자 목록/상세

- 컬럼: 이름, 이메일 마스킹, 상태, 역할, 가입일, 최근 로그인
- 상세: 사용자 기본 정보, 사용자별 데이터 탭

#### 전체 도메인 데이터 테이블

- 전체 회사
- 전체 담당자
- 전체 제품
- 전체 딜
- 서버 페이지네이션
- 검색과 기본 필터

### API 연결

- Admin 조회 API 전체

### 상태/validation

- loading: table skeleton
- empty: 데이터 없음
- error: 재시도
- non-admin: 접근 차단 화면
- 필터 변경 시 서버 query 갱신

### 완료 기준

- Admin Web에서 주요 데이터를 마스킹 상태로 조회할 수 있다.

## G32. 민감정보 원문 조회와 감사 로그

### 화면 목적

Admin이 꼭 필요한 경우에만 사유를 입력하고 민감정보 원문을 볼 수 있게 한다.

### 화면 구성

#### 원문 조회 dialog

- 원문 보기 버튼
- 사유 입력 textarea
- 사유 필수 안내
- 확인 전 위험 경고

#### 원문 표시 상태

- 마스킹 상태가 기본이다.
- 원문 조회 성공 후 해당 필드만 일시적으로 표시한다.
- 새로고침 또는 화면 이탈 시 다시 마스킹된다.

#### 감사 로그 화면

- 컬럼: 시간, actor, action, target type, target id, 사유 요약, IP
- 필터: actor, action, target type, 기간

### API 연결

- `POST /admin/api/sensitive/raw`
- `POST /admin/api/deals/:dealId/sensitive/raw`
- `POST /admin/api/meeting-notes/:meetingNoteId/sensitive/raw`
- `GET /admin/api/audit-logs`
- `GET /admin/api/audit-logs/:auditLogId`

### DB 연결

- AuditLog
- User
- Deal
- Contact
- MeetingNote
- PersonalMemo

### 상태/validation

- 사유가 비어 있으면 submit 불가
- 사유는 최소 길이 기준을 둔다.
- 암호화된 Memo/회의록 원문은 사유 검증과 감사 로그 기록 이후에만 복호화한다.
- 원문 조회 실패 시 마스킹 상태 유지
- client log에 PII와 reason 전문을 남기지 않는다.

### 완료 기준

- 사유 없이 원문 조회가 실패한다.
- 원문 조회 시 감사 로그가 생성된다.
- 감사 로그 화면에서 조회 기록을 확인할 수 있다.

## 관련 문서

- `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G30-G32-ADMIN-AUDIT-API.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G30-G32-ENDPOINT-CONTRACT.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/USER-FLOW.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/DONE/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
