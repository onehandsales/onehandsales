# MVP 기능 범위

> 기준: `AGENT/PM_AGENT/DECISIONS/000_확정_결정.md`
> 구현 스냅샷 기준: `BE/src/modules`, `BE/prisma/schema.prisma`, `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN`, `TODO/PADDLE_PLAN`

---

## 현재 BE/TODO 구현 상태

기준일: 2026-08-11

- Backend 구현 완료: Auth/User, Company, Contact, BusinessCard OCR, Product, Deal, Schedule, MeetingNote 수동 기본 도메인, Search, Trash, DataImport/ImportJob, Notification/Reminder, Weekly Schedule Report, Google Calendar Integration, AI Weekly Sales Report/Follow-up, DealActivity, MeetingNote AI provider log, Global Data/I18N, Product Analytics, Mobile Field Use foundation, Admin Operation과 `TODO/DONE/ADDITIONAL_WORK_PLAN` G01-G12.
- Auth/User: `/api/auth/providers`, `/api/auth/exchange`, `/api/auth/refresh`, `/api/auth/logout`, `/api/me`, `/admin/api/me`, `/api/users/me/profile`, `/api/users/me/devices`.
- Company: 목록/상세/생성/수정, 분야/지역 옵션, 일반 메모, 개인 비밀 메모, `contactCount`, `dealCount`, 연결 Contact/Deal 목록, xlsx export.
- Contact: 목록/상세/생성/수정, 회사 옵션, 직급/부서 옵션, 일반 메모, 개인 비밀 메모, 연결 Deal 목록, xlsx export.
- BusinessCard OCR: `BusinessCardScanLog`, 이미지 업로드 OCR, OpenAI strict JSON schema 응답, 성공/실패/확정 로그 저장, 등록일 최신순 내역, 상태 다중 필터, 사용자 확인/수정 후 회사/담당자 확정 저장.
- Product: 목록/상세/생성/수정, 카테고리/상태 옵션, 일반 메모, 개인 비밀 메모, `dealCount`, `sort=dealCountDesc|dealCountAsc`, 연결 Deal 목록, xlsx export.
- Deal: 단계별 count, 목록/상세/생성/수정, 회사/담당자/제품 옵션, 제품 N:M 연결, 다음 행동 로그, 일반 메모 로그, xlsx export.
- Schedule: 딜 옵션, 목록/상세/생성/수정/삭제, 딜 N:M 연결, 사용자 timezone 기준 local time 변환.
- MeetingNote: 수동 회의록 목록/상세/생성/수정/삭제, 회사/담당자 필터, 회사/담당자/제품/딜 N:N snapshot 연결, 텍스트 AI 초안 생성, STT+AI 초안 생성, 저장 후 딜 추가 연동과 딜 활동 로그 생성, 휴지통 복구.
- Search: 회사/담당자/제품/딜/일정/회의록 통합검색 API.
- Trash: 회사/담당자/제품/딜/회의록 본문 데이터와 지원 로그의 휴지통 목록, 상세 모달 조회, 7일 이내 복구 API.
- DataImport: `ImportTemplate`, `ImportJob`, `ImportJobRow`, `ImportJobError`, `ImportUploadedFile`, 회사/담당자/제품/딜 양식 다운로드, CSV/XLSX 업로드, AI 컬럼 매핑, 사용자 보정/검증, 셀 단위 validation 메시지, 확정 전 job 재개, confirm/cancel/expire, 확정 저장, `ImportUserLog` 목록/상세 조회. 딜 import 누락 회사/담당자/제품 보정 배열은 현재 FE API와 BE confirm 경로에 연결되어 있다.
- 현재 Backend 미구현 또는 후속 범위: Paddle/Billing, Billing Admin, B2B tenant/team admin, native/PWA packaging, 7일 이후 유료 복구 API, 영구 삭제 운영 mutation, 민감 데이터 포함 export.
- 범용 Export job은 현재 제품 방향에서 사용하지 않는다. Export는 Company/Contact/Product/Deal 각 목록 화면의 xlsx 다운로드 API로 처리한다.
- Admin Operation은 11번 로드맵 기준 user/domain readonly operation, audit/security, provider failure, trash/account request, admin analytics, system operation gate foundation까지 구현 완료다. Billing Admin은 `TODO/PADDLE_PLAN` 이후 범위다.
- User Web은 URL locale 공개/인증 진입면과 `/app` 홈 대시보드, Company, Contact, 명함 스캔, Product, Deal, Schedule, MeetingNote 수동 화면, MeetingNote AI/STT draft UI, 저장 후 딜 연동, Search GlobalSearch, Trash 목록/상세/복구, DataImport의 실제 API 연동이 완료되어 있다. 나머지 미구현 Backend 도메인은 실제 API 연동 전까지 mock/placeholder 경계를 명확히 해야 한다.
- 공개/인증 URL locale 중 언어 선택 UI에 노출하는 값은 `ko`, `en-us`, `en-ca`다. 우선 판매/검토 국가는 한국, 미국, 캐나다다. `ja`, `zh-tw`, `en-gb`, `en-sg`, `en-au`와 일본/대만/영국/싱가포르/호주 시장은 추후 확장 후보로 보류한다. 08_GLOBAL_DATA_I18N 완료 기준 로그인 이후 `/app` 관리 화면은 `ko-KR`, `en`을 1차 지원한다.
- 인증 QA 상태: Supabase 테스트 데이터 초기화 완료, Google OAuth 신규 가입/로그인 QA 통과, URL locale smoke 통과, 로그인/회원가입 provider 버튼의 browser popup OAuth 시작 E2E 통과, 로그아웃 후 선호 locale의 login URL 이동 적용 및 확인 완료. 현재 활성 provider는 Google, LINE, Apple이며 LINE/Apple 실제 smoke는 Supabase/provider 운영 설정 후 별도 기록한다.
- 2026-08-11 기준 Global B2C 01~11 기능 선구현 로드맵은 완료 archive다. 기존 12 Billing/Subscription/Tax는 `TODO/PADDLE_PLAN`으로 이관했고, 베타 전 checkout/webhook/API/DB migration을 만들지 않는다.

## 1. 개발 우선순위

1. 기존 01~11 기능 유지보수와 S0/S1/S2 버그 수정
2. UX/UI 상품성 개선
3. 결제창 없는 100명 베타 테스트 준비
4. 베타 피드백 반영
5. 가격/플랜/entitlement/AI 사용량 제한/환불/세금/인보이스 정책 확정
6. `TODO/PADDLE_PLAN`을 confirmed Paddle Billing 구현 계획으로 승격할지 결정
7. 7일 이후 유료 복구 정책과 API
8. B2B tenant/team admin 또는 native/PWA packaging 같은 별도 전략 후보 검토

### 1A. 지금 UX/UI인가 기능 추가인가

현재는 유지보수와 UX/UI 상품성 개선을 먼저 볼 타이밍이다.

판단 기준:

- 핵심 MVP 업무 기능과 Global B2C 01~11 foundation은 구현 완료 archive다.
- 아직 확인해야 할 위험은 기능 부재보다 실제 사용 품질, 반복 사용성, 모바일 브라우저 사용성, 베타 피드백, 가격/플랜 가치 차이에 있다.
- 따라서 새 기능이나 결제창을 추가하기 전에 UX/UI 상품성 개선과 100명 베타 준비를 먼저 끝낸다.
- QA/베타에서 발견한 S0/S1/S2는 Paddle/Billing보다 먼저 처리한다.

기능 추가는 아래 조건을 만족한 뒤 시작한다.

1. 기존 01~11 기능 유지보수 결과가 기록된다.
2. UX/UI 상품성 개선 범위가 닫힌다.
3. 100명 베타를 결제창 없이 제공할 수 있다.
4. 베타 피드백에서 유료 플랜 가치 차이와 반복 사용 후보가 확인된다.
5. 가격/플랜/entitlement/AI 사용량 제한/환불/세금/인보이스 정책이 confirmed 상태가 된다.
6. S0/S1 버그가 없고, S2는 수정 또는 보류 판단이 문서화된다.

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
- 앱 세션은 Backend `AuthSession`으로 관리하고 refresh token은 httpOnly cookie로 저장한다.
- User Web은 현재 `mobile`/`personal_laptop` device slot만 사용한다. 같은 slot의 다른 기기 로그인은 기존 active device/session을 교체한다.
- 기존 사용자의 기본 `timeZone`은 로그인 때 덮어쓰지 않고 `lastLoginTimeZone`만 갱신한다.
- 국가 코드는 배포 프록시 geo header가 있을 때만 저장된다. 로컬이나 해당 header가 없는 환경에서는 `기록 없음`이 정상일 수 있다.

### MVP 포함

- 구글 로그인
- 사용자별 데이터 분리

### 제외

- 이메일/비밀번호 로그인
- 애플 로그인
- 라인 로그인
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
- 삭제와 휴지통 7일 무료 복구

### 후속 MVP 포함

- 회사 로그의 별도 타입 확장

### 제외

- 회사 정보 자동 보강
- 외부 기업정보 API 연동

## 4. 담당자

### 현재 Backend 구현

- 담당자 목록/검색/필터/페이지네이션
- 담당자 목록 정렬: `createdAtDesc`, `usernameAsc`
- 담당자 상세/생성/수정
- 필터용 회사 옵션
- 직급, 부서 옵션 조회/생성/삭제
- 일반 메모 로그
- 사용자 개인 비밀 메모 로그
- 담당자 상세의 연결 Deal 전체 목록
- 현재 필터 기준 xlsx export
- 삭제와 휴지통 7일 무료 복구
- 명함 OCR 확인/수정 후 회사/담당자 저장 flow. 확인 필드는 회사명, 회사분야, 회사지역, 담당자명, 휴대폰, 이메일, 부서, 직급이다.

### 후속 MVP 포함

- 위치 선택 입력

### 제외

- 모바일 카메라 촬영 OCR
- 사용자 확인 없는 자동 회사/담당자 확정 저장

## 5. 제품

### 현재 Backend 구현

- 제품 목록/검색/필터/페이지네이션
- 제품 상세/생성/수정
- `productPrice` 필수 정수 입력
- 제품 카테고리, 상태 옵션 조회/생성/삭제
- 일반 메모 로그
- 사용자 개인 비밀 메모 로그
- 목록과 export의 `dealCount`
- 제품 목록 `sort=dealCountDesc|dealCountAsc`
- 제품 상세의 연결 Deal 전체 목록
- 현재 필터 기준 xlsx export
- 삭제와 휴지통 7일 무료 복구

### 후속 MVP 포함

- 회사/담당자와의 직접 연결
- 연결 타입

### 제외

- 다중 통화
- 환율 계산
- 복잡한 가격 이력 자동화

## 6. 딜

### 현재 Backend 구현

- 딜 목록/검색/필터/페이지네이션
- 딜 목록 정렬: `createdAtDesc`, `dealCostDesc`, `dealCostAsc`, `expectedEndDateAsc`
- 딜 목록 필터: `search`, `companyId`, `contactId`, `dealStatus`
- 딜 stage count 필터: `search`, `companyId`, `contactId`
- 단계별 count
- 딜 상세/생성/수정
- 회사/담당자/제품 옵션 조회
- 회사 필수 연결
- 담당자 필수 연결
- 제품 다중 연결
- 딜이름 필수
- 딜 금액 필수
- 예상 종료일 필수
- 다음 행동 입력과 변경 로그
- 일반 메모 로그
- 현재 필터 기준 xlsx export
- 삭제와 휴지통 7일 무료 복구

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
- `/app/schedules/week` route는 현재 `/app/schedules`로 redirect하며, 별도 주간 보고서 화면은 후속 범위
- 사용자 timezone 기준 local date-time 변환

### 후속 MVP 포함

- 주간 일정 보고서 고도화
- email/browser push 운영 고도화
- Google Calendar write/watch/export 고도화

### 제외

- 구글 캘린더 양방향 동기화
- 우리 서비스 일정의 구글 캘린더 내보내기

## 9. 회의록

현재 Backend와 User Web 수동 회의록 도메인은 `TODO/DONE/MEETING_NOTE_MANUAL_PLAN` 기준 구현 완료 상태다. Backend의 AI/STT draft API와 User Web draft UI 연결은 `TODO/DONE/MEETING_NOTE_AI_STT_PLAN` 기준 구현 완료 상태다.

제품 플로우 기준으로 회의록 작성은 AI 없이 직접 작성 후 저장할 수 있어야 한다. AI/STT는 별도 필수 플로우가 아니라 같은 작성 화면에서 `AI로 정리`, `음성으로 작성`으로 초안을 채워주는 보조 기능이다.

### 현재 Backend/User Web 구현

- 수동 회의록 목록/상세/생성/수정
- 회사/담당자 필수 연결
- 제품/딜 선택 연결
- 회사/담당자 필터
- 연결 row snapshot 저장
- 사용자 timezone 기준 `meetingLocalDateTime` 변환
- Backend 텍스트 AI 초안 생성: `POST /api/meeting-notes/ai-draft`
- Backend STT+AI 초안 생성: `POST /api/meeting-notes/stt-draft`
- 저장 후 딜 추가 연동: `POST /api/meeting-notes/:meetingNoteId/deals`
- User Web 텍스트 `AI로 정리` draft UI
- User Web 음성 파일 업로드 `음성으로 작성` draft UI
- 직접 작성 저장은 AI/STT API를 호출하지 않음
- AI/STT 저장 시 최종 `POST /api/meeting-notes`에 `TEXT_AI` 또는 `STT_AI` sourceType 전달
- 저장 후 `영업 딜과 연동` 액션에서 기존 딜 검색/선택 후 `MeetingNoteDeal`을 추가하고, 딜 상세 활동 로그 저장소인 `DealFollowingActionLog`에 회의록 링크와 요약을 생성함

### 후속 MVP 포함

- `DealActivity` activity type 확장과 B2B/team CRM식 record별 timeline 고도화
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

### 제외 또는 후속

- 브라우저 내 음성 녹음 UX 고도화
- AI 회사/담당자/딜 후보 제안
- STT transcript 영구 저장
- AI/STT provider 호출 이력 테이블
- 사용자 템플릿 커스터마이즈 UI

## 10. Import / Export

현재 DataImport는 회사/담당자/제품/딜 불러오기까지 구현되어 있다. Export는 범용 job으로 만들지 않고 Company, Contact, Product, Deal 각 도메인 목록에서 xlsx 다운로드로 처리한다.

### 현재 구현된 DataImport

- 활성 양식 목록: `GET /api/import-templates/active`
- 양식 다운로드: `GET /api/import-templates/:templateId/download`
- 파일 업로드와 임시 job 생성: `POST /api/imports`
- 임시 job 조회: `GET /api/imports/:importJobId`
- AI 컬럼 매핑: `POST /api/imports/:importJobId/map`
- mapping 수정과 row 검증: `PATCH /api/imports/:importJobId/mapping`
- 확정 저장: `POST /api/imports/:importJobId/confirm`
- 성공 내역 목록/상세: `GET /api/import-user-logs`, `GET /api/import-user-logs/:importUserLogId`
- 지원 대상: 회사, 담당자, 제품, 딜
- 확정 전 job은 DB에 저장하며 resume/cancel/expire/confirm 상태를 추적한다.
- 딜 import 누락 회사/담당자/제품 보정 배열은 FE API 함수, BE DTO, controller confirm, application service, repository 경로에 연결되어 있다.

### 현재 구현된 도메인별 Export

- 회사: `GET /api/companies/export/xlsx`, User Web 표시 문구 `엑셀 다운로드`
- 담당자: `GET /api/contacts/export/xlsx`, User Web 표시 문구 `엑셀 다운로드`
- 제품: `GET /api/products/export/xlsx`, User Web 표시 문구 `엑셀 다운로드`
- 딜: `GET /api/deals/export/xlsx`, User Web 표시 문구 `엑셀 다운로드`

도메인 구분은 버튼 문구가 아니라 사용자가 보고 있는 목록 화면과 호출 API로 판단한다.
- export 요청은 현재 목록의 검색어/필터/정렬을 반영하고 `page`는 제외한다.

### 제외 또는 후속

- `/api/exports` 기반 범용 Export job
- `ExportJob` table
- 일정/회의록 export
- 주간 일정 보고서 PDF/Excel
- 민감 데이터 포함 선택 export

## 11. Admin

Admin Operation foundation은 `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION` 기준 구현 완료 상태다. 단, Billing Admin과 B2B tenant/team admin은 포함하지 않는다.

### 현재 포함

- 사용자 목록/상세
- 전체 딜 조회
- 전체 회사 조회
- 전체 담당자 조회
- 전체 제품 조회
- 특정 사용자별 딜/회사/담당자/제품 조회
- 민감 데이터 기본 마스킹
- 민감 원문 조회 시 사유 입력 + 감사 로그
- Trash retention/recovery operation
- Provider failure operation
- Admin analytics overview
- Account data request
- System operation gate

### 후속 운영 기능

- Billing Admin: subscription, payment, invoice, refund, failed payment, entitlement 운영
- B2B tenant/team admin
- 운영 mutation 확대
- 유료 복구/영구 삭제 정책과 연결된 고위험 action

## 12. 글로벌 B2C 유료 판매와 Series A급 후속 범위

현재 MVP와 Global B2C 01~11 foundation은 개인 영업자의 핵심 업무 루프를 구현하는 데 초점이 있다. 2026-08-11 기준 01~11은 완료 archive이며, 결제/구독/세금/Paddle은 `TODO/PADDLE_PLAN`으로 분리된 Deferred / Draft 범위다.

글로벌 B2C 유료 판매 전 필요한 후속 범위:

- 기능 유지보수와 UX/UI 상품성 개선
- 결제창 없는 100명 베타 테스트
- 무료체험, 월간/연간 구독, AI 사용량 포함/초과 정책 확정
- Paddle Billing 또는 다른 결제 provider / Merchant of Record 연동
- VAT/GST/판매세, 환불, chargeback, invoice, receipt
- 추가 판매 시장의 `/app` 내부 다국어와 국가별 UX writing
- 추가 국가 전화번호, 날짜/시간, 통화, 주소/지역 표시
- Billing Admin 고객 지원, 구독 상태, 결제 이슈, 민감정보 마스킹, 감사 로그
- 개인정보 처리, 계정 삭제, 데이터 export, 환불/약관/보안 문서
- paid conversion, churn, ARPU, LTV/CAC, billing funnel, AI cost/user 분석

Series A급 후속 범위:

- Notification/Reminder 기반 리텐션 루프 고도화
- AI next action/follow-up/딜 리스크/주간 영업 리포트 고도화
- 모바일 현장 입력, 명함 촬영, 음성 기록, push reminder 고도화
- DealActivity timeline 고도화
- Google Calendar write/watch/export 고도화
- 결제/paywall 실험과 국가별 가격
- 제품 분석과 unit economics 고도화
- Admin 운영과 보안/감사 신뢰 체계 고도화

자세한 정본은 `AGENT/PM_AGENT/PLANNING/GLOBAL_B2C_SERIES_A_ROADMAP.md`를 따른다.

## 13. 관련 문서

- `AGENT/PM_AGENT/PLANNING/PRD.md`
- `AGENT/PM_AGENT/PLANNING/DATA_MODEL.md`
- `AGENT/PM_AGENT/PLANNING/GLOBAL_B2C_SERIES_A_ROADMAP.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
- `AGENT/PM_AGENT/DECISIONS/030_global_b2c_closeout_and_paddle_defer.md`
- `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/README.md`
- `TODO/PADDLE_PLAN/README.md`
