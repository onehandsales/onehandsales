# MVP 기능 범위

> 기준: `AGENT/PM_AGENT/DECISIONS/000_확정_결정.md`
> 구현 스냅샷 기준: `BE/src/modules`, `BE/prisma/schema.prisma`, 활성 `TODO/*_PLAN`, `TODO/DONE/ADDITIONAL_WORK_PLAN`

---

## 현재 BE/TODO 구현 상태

기준일: 2026-06-15

- Backend 구현 완료: Auth/User, Company, Contact, Product, Deal, Schedule, MeetingNote 수동 기본 도메인과 `TODO/DONE/ADDITIONAL_WORK_PLAN` G01-G12.
- Auth/User: `/api/auth/providers`, `/api/auth/exchange`, `/api/auth/refresh`, `/api/auth/logout`, `/api/me`, `/admin/api/me`, `/api/users/me/profile`, `/api/users/me/devices`.
- Company: 목록/상세/생성/수정, 분야/지역 옵션, 일반 메모, 개인 비밀 메모, `contactCount`, `dealCount`, 연결 Contact/Deal 목록, xlsx export.
- Contact: 목록/상세/생성/수정, 회사 옵션, 직급/부서 옵션, 일반 메모, 개인 비밀 메모, 연결 Deal 목록, xlsx export.
- Product: 목록/상세/생성/수정, 카테고리/상태 옵션, 일반 메모, 개인 비밀 메모, `dealCount`, `sort=dealCountDesc`, 연결 Deal 목록, xlsx export.
- Deal: 단계별 count, 목록/상세/생성/수정, 회사/담당자/제품 옵션, 제품 N:M 연결, 다음 행동 로그, 일반 메모 로그, xlsx export.
- Schedule: 딜 옵션, 목록/상세/생성/수정/삭제, 딜 N:M 연결, 사용자 timezone 기준 local time 변환.
- MeetingNote: 수동 회의록 목록/상세/생성/수정, 회사/담당자 필터, 회사/담당자/제품/딜 N:N snapshot 연결.
- 현재 Backend 미구현: BusinessCard OCR, 범용 Import/Export job, Notification, Trash, Search, Admin 운영 조회/감사/민감 원문 API, MeetingNote AI/STT/삭제복구/Admin/DealActivity 자동 로그.
- Admin Backend는 현재 `/admin/api/me`만 구현되어 있다.
- User Web은 Schedule과 MeetingNote 수동 화면까지 실제 API 연동이 완료되어 있다. 나머지 미구현 Backend 도메인은 실제 API 연동 전까지 mock/placeholder 경계를 명확히 해야 한다.

## 1. 개발 우선순위

1. Company/Contact/Product/Deal Backend 구현 완료 범위의 User Web 계약 동기화
2. Additional Work G01-G12 Frontend 반영: `dealCount`, 연결 Deal 목록, 연결 Contact 목록, xlsx export
3. 인증 연동과 사용자 설정 화면
4. BusinessCard OCR
5. 범용 Import/Export, Notification, Trash, Search
6. MeetingNote AI/STT/삭제복구/Admin/DealActivity 자동 로그
7. Admin 운영 조회/감사/민감 원문 API 보강

## 2. 인증

### 현재 Backend 구현

- OAuth provider 목록 조회
- Supabase OAuth token exchange
- access token refresh
- logout
- User Web `GET /api/me`
- Admin Web `GET /admin/api/me`
- 내 프로필 조회/수정
- 내 등록 기기 목록 조회

### MVP 포함

- 카카오 로그인
- 구글 로그인
- 네이버 로그인
- 애플 로그인
- 사용자별 데이터 분리

### 제외

- 이메일/비밀번호 로그인
- 결제 기반 권한 자동 처리

## 3. 회사

### 현재 Backend 구현

- 회사 목록/검색/필터/페이지네이션
- 회사 상세/생성/수정
- 회사 분야, 지역 옵션 조회/생성/삭제
- 일반 메모 로그
- 사용자 개인 비밀 메모 로그
- 목록과 export의 `contactCount`, `dealCount`
- 회사 상세의 연결 Contact 전체 목록
- 회사 상세의 연결 Deal 전체 목록
- 현재 필터 기준 xlsx export

### 후속 MVP 포함

- 태그
- 회사 로그의 별도 타입 확장
- 휴지통 30일 보관

### 제외

- 회사 정보 자동 보강
- 외부 기업정보 API 연동

## 4. 담당자

### 현재 Backend 구현

- 담당자 목록/검색/필터/페이지네이션
- 담당자 상세/생성/수정
- 필터용 회사 옵션
- 직급, 부서 옵션 조회/생성/삭제
- 일반 메모 로그
- 사용자 개인 비밀 메모 로그
- 담당자 상세의 연결 Deal 전체 목록
- 현재 필터 기준 xlsx export

### 후속 MVP 포함

- 위치 선택 입력
- 태그
- 명함 OCR 저장 flow
- 휴지통 30일 보관

### 제외

- 모바일 카메라 촬영 OCR
- 자동 회사 확정 저장

## 5. 제품

### 현재 Backend 구현

- 제품 목록/검색/필터/페이지네이션
- 제품 상세/생성/수정
- `productPrice` 필수 정수 입력
- 제품 카테고리, 상태 옵션 조회/생성/삭제
- 일반 메모 로그
- 사용자 개인 비밀 메모 로그
- 목록과 export의 `dealCount`
- 제품 목록 `sort=dealCountDesc`
- 제품 상세의 연결 Deal 전체 목록
- 현재 필터 기준 xlsx export

### 후속 MVP 포함

- 태그
- 회사/담당자와의 직접 연결
- 연결 타입
- 휴지통 30일 보관

### 제외

- 다중 통화
- 환율 계산
- 복잡한 가격 이력 자동화

## 6. 딜

### 현재 Backend 구현

- 딜 목록/검색/필터/페이지네이션
- 단계별 count
- 딜 상세/생성/수정
- 회사/담당자/제품 옵션 조회
- 회사 필수 연결
- 담당자 필수 연결
- 제품 다중 연결
- 딜명 필수
- 딜 금액 필수
- 예상 종료일 필수
- 다음 행동 입력과 변경 로그
- 일반 메모 로그
- 현재 필터 기준 xlsx export

현재 단계 enum:

- `INITIAL_CONTACT`
- `NEEDS_CHECK`
- `PROPOSAL_QUOTE`
- `NEGOTIATION`
- `WON`
- `LOST`

### 후속 MVP 포함

- 단계 변경 자동 활동 로그
- 가능성: 긍정 / 중립 / 부정
- 고급 옵션 숫자 퍼센트
- 태그
- 휴지통 30일 보관
- 일정/회의록 연결

## 7. 딜 활동 로그

### 현재 Backend 구현

- `DealFollowingActionLog`
- `DealMemoLog`

### 후속 MVP 포함

- 범용 `DealActivity`
- 날짜
- 타입
- 제목
- 내용
- 자동 생성 여부
- 기본 타입: 기타 기록, 전화, 미팅, 이메일, 단계변경, 회의록연결
- 사용자 직접 타입 생성

## 8. 일정

현재 Backend와 User Web 기본 일정 도메인은 `TODO/DONE/SCHEDULE_DOMAIN_PLAN` 기준 구현 완료 상태다.

### 현재 Backend/User Web 구현

- 일정 CRUD
- 딜 N:M 연결
- 월간 일정 화면
- 주간 일정 화면
- 사용자 timezone 기준 local date-time 변환

### 후속 MVP 포함

- 주간 일정 보고서 PDF
- 주간 일정 보고서 Excel
- 이메일 알림
- 브라우저 푸시 알림
- 알림 기본값 + 사용자 수정
- 구글 캘린더 일정 가져오기

### 제외

- 구글 캘린더 양방향 동기화
- 우리 서비스 일정의 구글 캘린더 내보내기

## 9. 회의록

현재 Backend와 User Web 수동 회의록 도메인은 `TODO/DONE/MEETING_NOTE_MANUAL_PLAN` 기준 구현 완료 상태다.

### 현재 Backend/User Web 구현

- 수동 회의록 목록/상세/생성/수정
- 회사/담당자 필수 연결
- 제품/딜 선택 연결
- 회사/담당자 필터
- 연결 row snapshot 저장
- 사용자 timezone 기준 `meetingLocalDateTime` 변환

### 후속 MVP 포함

- OpenAI 기반 회의록 생성
- 생성 결과 수정/저장
- 딜 연결 시 활동 로그 자동 생성
- AI 회사/담당자 후보 제안
- 딜 연결 시 회사/담당자 상속

### 고정 결과 항목

- 날짜
- 회사
- 담당자
- 부서
- 품목
- 진행단계
- 상세내용
- 향후계획
- 필요액션

### 제외

- 음성 녹음
- STT
- 사용자 템플릿 커스터마이즈 UI

## 10. Import / Export

현재 범용 Import/Export job Backend는 미구현이다. 다만 Company, Contact, Product, Deal의 도메인별 xlsx export는 구현되어 있다.

### Import 포함

- 회사
- 담당자
- 제품
- 딜
- Excel/CSV
- AI 컬럼 자동 매핑
- 사용자 확인/수정 후 확정

### Export 포함

- 회사
- 담당자
- 제품
- 딜
- 일정
- 회의록
- PDF
- Excel

### 민감 데이터 정책

- 기본 제외
- 사용자가 명시적으로 포함 선택 가능
- 포함 시 경고 표시

## 11. Admin

현재 Backend Admin API는 `GET /admin/api/me`만 구현되어 있다. Admin Web의 대시보드/목록/감사/민감 원문 조회 화면은 Backend 운영 조회 API가 구현되기 전까지 실제 데이터 연동 상태가 아니다.

### MVP 포함

- 사용자 목록/상세
- 전체 딜 조회
- 전체 회사 조회
- 전체 담당자 조회
- 전체 제품 조회
- 특정 사용자별 딜/회사/담당자/제품 조회
- 민감 데이터 기본 마스킹
- 민감 원문 조회 시 사유 입력 + 감사 로그

### 이후

- 계좌이체 입금 확인
- 유료 상태/권한 관리

## 12. 관련 문서

- `AGENT/PM_AGENT/PLANNING/PRD.md`
- `AGENT/PM_AGENT/PLANNING/DATA_MODEL.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
