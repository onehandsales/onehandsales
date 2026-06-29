# MVP 기능 범위

> 기준: `AGENT/PM_AGENT/DECISIONS/000_확정_결정.md`
> 구현 스냅샷 기준: `BE/src/modules`, `BE/prisma/schema.prisma`, 활성 `TODO/*_PLAN`, `TODO/DONE/ADDITIONAL_WORK_PLAN`

---

## 현재 BE/TODO 구현 상태

기준일: 2026-06-29

- Backend 구현 완료: Auth/User, Company, Contact, Product, Deal, Schedule, MeetingNote 수동 기본 도메인, Search, Trash, MeetingNote AI/STT draft API와 `TODO/DONE/ADDITIONAL_WORK_PLAN` G01-G12.
- Auth/User: `/api/auth/providers`, `/api/auth/exchange`, `/api/auth/refresh`, `/api/auth/logout`, `/api/me`, `/admin/api/me`, `/api/users/me/profile`, `/api/users/me/devices`.
- Company: 목록/상세/생성/수정, 분야/지역 옵션, 일반 메모, 개인 비밀 메모, `contactCount`, `dealCount`, 연결 Contact/Deal 목록, xlsx export.
- Contact: 목록/상세/생성/수정, 회사 옵션, 직급/부서 옵션, 일반 메모, 개인 비밀 메모, 연결 Deal 목록, xlsx export.
- Product: 목록/상세/생성/수정, 카테고리/상태 옵션, 일반 메모, 개인 비밀 메모, `dealCount`, `sort=dealCountDesc|dealCountAsc`, 연결 Deal 목록, xlsx export.
- Deal: 단계별 count, 목록/상세/생성/수정, 회사/담당자/제품 옵션, 제품 N:M 연결, 다음 행동 로그, 일반 메모 로그, xlsx export.
- Schedule: 딜 옵션, 목록/상세/생성/수정/삭제, 딜 N:M 연결, 사용자 timezone 기준 local time 변환.
- MeetingNote: 수동 회의록 목록/상세/생성/수정/삭제, 회사/담당자 필터, 회사/담당자/제품/딜 N:N snapshot 연결, 텍스트 AI 초안 생성, STT+AI 초안 생성, 저장 후 딜 추가 연동과 딜 활동 로그 생성, 휴지통 복구.
- Search: 회사/담당자/제품/딜/일정/회의록 통합검색 API.
- Trash: 회사/담당자/제품/딜/회의록 본문 데이터와 지원 로그의 휴지통 목록, 상세 모달 조회, 7일 이내 복구 API.
- 현재 Backend 미구현 또는 후속 범위: BusinessCard OCR, 범용 Import job, Notification, Admin 운영 조회/감사/민감 원문 API, MeetingNote Admin, 범용 DealActivity table, 7일 이후 유료 복구 API.
- 범용 Export job은 현재 제품 방향에서 사용하지 않는다. Export는 Company/Contact/Product/Deal 각 목록 화면의 xlsx 다운로드 API로 처리한다.
- Admin Backend는 현재 `/admin/api/me`만 구현되어 있으며, 관리자 페이지와 운영 조회 API는 후속 단계에서 만든다.
- User Web은 `/` 홈 대시보드, Company, Contact, Product, Deal, Schedule, MeetingNote 수동 화면, MeetingNote AI/STT draft UI, 저장 후 딜 연동, Search GlobalSearch, Trash 목록/상세/복구의 실제 API 연동이 완료되어 있다. 나머지 미구현 Backend 도메인은 실제 API 연동 전까지 mock/placeholder 경계를 명확히 해야 한다.

## 1. 개발 우선순위

1. Company/Contact/Product/Deal Backend 구현 완료 범위의 User Web 계약 동기화
2. Additional Work G01-G12 Frontend 반영: `dealCount`, 연결 Deal 목록, 연결 Contact 목록, xlsx export
3. 인증 연동과 사용자 설정 화면
4. BusinessCard OCR
5. 범용 Import job, Notification
6. 7일 이후 유료 복구 정책과 API
7. 범용 DealActivity table
8. Admin 페이지와 운영 조회/감사/민감 원문 API

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
- 삭제와 휴지통 7일 무료 복구

### 후속 MVP 포함

- 태그
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

### 후속 MVP 포함

- 위치 선택 입력
- 태그
- 명함 OCR 저장 flow

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
- 제품 목록 `sort=dealCountDesc|dealCountAsc`
- 제품 상세의 연결 Deal 전체 목록
- 현재 필터 기준 xlsx export
- 삭제와 휴지통 7일 무료 복구

### 후속 MVP 포함

- 태그
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
- 딜명 필수
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
- 태그
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
- `/schedules/week` route는 현재 `/schedules`로 redirect하며, 별도 주간 보고서 화면은 후속 범위
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

- 범용 `DealActivity` table 전환 또는 activity type 확장
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

현재 범용 Import job Backend는 미구현이다. Export는 범용 job으로 만들지 않고 Company, Contact, Product, Deal 각 도메인 목록에서 xlsx 다운로드로 처리한다.

### 현재 구현된 도메인별 Export

- 회사: `GET /api/companies/export/xlsx`, User Web 표시 문구 `엑셀 다운로드`
- 담당자: `GET /api/contacts/export/xlsx`, User Web 표시 문구 `엑셀 다운로드`
- 제품: `GET /api/products/export/xlsx`, User Web 표시 문구 `엑셀 다운로드`
- 딜: `GET /api/deals/export/xlsx`, User Web 표시 문구 `엑셀 다운로드`

도메인 구분은 버튼 문구가 아니라 사용자가 보고 있는 목록 화면과 호출 API로 판단한다.
- export 요청은 현재 목록의 검색어/필터/정렬을 반영하고 `page`는 제외한다.

### 후속 Import 후보

- 회사
- 담당자
- 제품
- 딜
- Excel/CSV
- AI 컬럼 자동 매핑
- 사용자 확인/수정 후 확정

### 제외 또는 후속

- `/api/exports` 기반 범용 Export job
- `ExportJob` table
- 일정/회의록 export
- 주간 일정 보고서 PDF/Excel
- 민감 데이터 포함 선택 export

## 11. Admin

관리자 페이지는 후속 단계에서 만든다. 현재 Backend Admin API는 `GET /admin/api/me`만 구현되어 있으며, Admin Web은 login/protected route/mock token 검증만 노출한다. Admin Web의 대시보드/목록/감사/민감 원문 조회 화면은 Backend 운영 조회 API가 구현되기 전까지 route를 root로 redirect하고 메뉴에서 숨긴다.

### 후속 포함

- 사용자 목록/상세
- 전체 딜 조회
- 전체 회사 조회
- 전체 담당자 조회
- 전체 제품 조회
- 특정 사용자별 딜/회사/담당자/제품 조회
- 민감 데이터 기본 마스킹
- 민감 원문 조회 시 사유 입력 + 감사 로그

### 후속 운영 기능

- 계좌이체 입금 확인
- 유료 상태/권한 관리

## 12. 관련 문서

- `AGENT/PM_AGENT/PLANNING/PRD.md`
- `AGENT/PM_AGENT/PLANNING/DATA_MODEL.md`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/DB_SCHEMA/README.md`
