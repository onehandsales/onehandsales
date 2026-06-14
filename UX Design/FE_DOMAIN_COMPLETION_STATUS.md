# FE 도메인 완료 현황

## 목적

이 문서는 2026-06-13 기준 BE × FE 도메인별 완료 상태를 추적한다.

작업자가 "다음에 무슨 도메인 FE를 작업할 수 있는가"를 빠르게 판단하기 위한 기준 문서다.

관련 문서:
- [PEN_UI_04_IMPLEMENTATION_LOG.md](</Users/user/Sales_b2c/UX Design/PEN_UI_04_IMPLEMENTATION_LOG.md>)
- [PEN_UI_06_SHARED_FIRST_WORK_ORDER.md](</Users/user/Sales_b2c/UX Design/PEN_UI_06_SHARED_FIRST_WORK_ORDER.md>)
- [TODO/ACTIVE_BACKEND_API_FE_REVIEW.md](</Users/user/Sales_b2c/TODO/ACTIVE_BACKEND_API_FE_REVIEW.md>)

---

## 최종 업데이트

- 날짜: 2026-06-13
- 작성: Claude Sonnet 4.6

---

## 도메인별 BE × FE 완료 현황

| 도메인 | BE 상태 | FE 화면 | 라우트 연결 | pen 디자인 반영 | 전체 판정 |
|---|---|---|---|---|---|
| 회사 (Company) | ✅ 완료 | ✅ 목록/상세/생성/수정/메모 | ✅ | ⚠️ 부분 (pen 기준 정교화 필요) | **마무리 가능** |
| 거래처 (Contact) | ✅ 완료 | ✅ 목록/상세/생성/수정/메모 | ✅ | ⚠️ 부분 (pen 기준 정교화 필요) | **마무리 가능** |
| 제품 (Product) | ✅ 완료 | ✅ 목록/상세/생성/수정/메모/연결 | ✅ | ❌ 미반영 | **우선 작업 대상** |
| 딜 (Deal) | ⚠️ 부분완료 | ✅ 목록/상세/홈/모바일 | ✅ | ✅ pen 기준 테이블 재설계 완료 | ⚠️ BE DB migration 보류 |
| 일정 (Schedule) | ✅ 완료 | ✅ 캘린더/주간보고 | ✅ | ❌ 미반영 | **우선 작업 대상** |
| 회의록 (MeetingNote) | ✅ 완료 | ✅ 목록/상세/생성 | ✅ | ❌ 미반영 | 작업 가능 |
| 알림 (Notification) | ✅ 완료 | ✅ | ✅ | ❌ 미반영 | 작업 가능 |
| 휴지통 (Trash) | ✅ 완료 | ✅ | ✅ | ❌ 미반영 | 작업 가능 |
| 통합검색 (Search) | ✅ 완료 | ✅ GlobalSearch 존재 | ✅ | ❌ 미반영 | 작업 가능 |
| Import/Export | ✅ 완료 | ✅ 화면 존재 | ✅ | ❌ 미반영 | 작업 가능 |
| 명함 OCR | ✅ 완료 | ✅ scan 화면 | ✅ | ❌ 미반영 | 작업 가능 |

---

## BE 도메인별 상세 완료 현황

### 회사 (Company) — ✅ 완료
- Company CRUD
- CompanyField / CompanyRegion CRUD
- CompanyMemoLog CRUD
- CompanyUserPrivateMemoLog (암호화) CRUD
- 목록 `contactCount` 집계
- 회사별 Contact 목록 API
- xlsx export
- **보류**: soft delete 없음, 회사 분야/지역 수정 API 없음

### 거래처 (Contact) — ✅ 완료
- Contact CRUD
- ContactJobGrade / ContactDepartment CRUD
- ContactMemoLog CRUD
- ContactUserPrivateMemoLog (암호화) CRUD
- xlsx export
- **보류**: soft delete/삭제/복구 API 없음

### 제품 (Product) — ✅ 완료
- Product CRUD
- ProductCategory / ProductStatus CRUD
- ProductMemoLog CRUD
- ProductUserPrivateMemoLog (암호화) CRUD
- ProductConnection 생성/삭제
- soft delete / restore
- xlsx export
- **보류**: `currency` 컬럼 임시 metadata 저장

### 딜 (Deal) — ⚠️ 부분완료
- Deal CRUD, stage change, next action 수정/완료/미루기 ✅
- DealActivity CRUD, soft delete/restore ✅ (1차 MVP)
- 신규 스키마 코드 구현 완료: `DealProduct`, `DealFollowingActionLog`, `DealMemoLog` ✅
- 15개 API `/api/deals/*` typecheck/lint/build/test 통과 ✅
- **보류**: local DB migration history drift로 실제 DB 미적용 (BE 작업자 별도 처리 필요)
- **FE 선행 완료**: DealStage 6단계 확장 (FE 기준), BE enum 변경 대기 중

### 일정 (Schedule) — ✅ 완료
- Schedule CRUD
- 월간/주간 조회 (`from/to`, `/week`)
- ScheduleReminder 생성/재구성
- 딜/회사/거래처 소유권 검증
- soft delete / restore
- timezone 처리
- **보류**: Google Calendar 실연동 제외

### 회의록 (MeetingNote) — ✅ 완료
- MeetingNote CRUD
- AI 회의록 생성 (OpenAI adapter)
- rawText 암호화 저장
- 딜 연결 시 DealActivity 자동 생성
- soft delete / restore

### 명함 OCR (BusinessCard) — ✅ 완료
- scan API, OCR 결과 조회
- 확정 저장 (Company/Contact 생성)
- 이미지 StoragePort 저장
- OpenAI OCR adapter
- 기존 회사 후보 조회

### Import — ✅ 완료
- 파일 업로드, AI 매핑 제안, 사용자 매핑 수정
- 확정 실행 (all-or-nothing transaction)
- CSV(UTF-8) / Excel 파서
- 대상: Company / Contact / Product / Deal

### Export — ✅ 완료
- Export job 생성, 상태 조회, 파일 다운로드 (signed URL)
- 주간 일정 보고서 export
- Excel 실제 구현, PDF placeholder
- 민감 데이터 confirm 차단
- **보류**: 디자인된 PDF 템플릿 미완성 (placeholder)

### 알림 (Notification) — ✅ 완료
- 알림 목록/읽음/설정/push subscription API
- SMTP / Web Push VAPID adapter
- 일정/딜/회의록 흐름에서 알림 자동 생성

### 휴지통 (Trash) — ✅ 완료
- `/api/trash` 조회
- 6개 도메인 복구 (Company/Contact/Product/Deal/Schedule/MeetingNote)
- 30일 자동 purge 기본 구조
- **보류**: 사용자 즉시 완전 삭제 API/UI (정책적 차단)

### 통합검색 (Search) — ✅ 완료
- `GET /api/search`
- 6개 도메인 검색, 검색어 2자 이상 제한
- 진행 중 딜 우선 반환, 삭제 데이터 제외

---

## FE 작업 우선순위 (2026-06-13 기준)

PEN_UI_06 순서 + BE 완료 상태를 고려한 권장 순서:

### 즉시 착수 가능

1. **Product (제품)** — BE 완료, FE 화면 기존 구조 있음, company/contact 패턴 재사용
2. **Schedule (일정)** — BE 완료, FE 화면 기존 구조 있음, 캘린더 레이아웃 별도 설계 필요
3. **MeetingNote (회의록)** — BE 완료, FE 화면 기존 구조 있음
4. **Notification (알림)** — BE 완료, FE 화면 기존 구조 있음
5. **Trash (휴지통)** — BE 완료, FE 화면 기존 구조 있음
6. **Search (통합검색)** — BE 완료, GlobalSearch 기존 구조 있음
7. **Import/Export** — BE 완료, FE 화면 기존 구조 있음
8. **BusinessCard OCR** — BE 완료, scan 화면 기존 구조 있음

### BE 작업 대기 중

- **Deal (딜)** — FE pen 재설계 완료, BE DB migration drift 해소 후 연동

### 남은 핵심 FE 작업 성격

현재 FE 작업의 대부분은 "새로 만드는 것"이 아니라 **기존 화면을 pen 디자인 기준으로 정교화**하는 것이다.
- 기존 API hooks/types는 모두 존재
- 라우트 연결도 완료
- pen 디자인 반영(레이아웃/색상/타이포/컴포넌트 교체)이 주 작업

---

## 완료 판단 기준

각 도메인 FE가 "완료"로 판정되려면:

1. pen 기준 목록/상세/생성 화면 레이아웃 반영
2. 공용 shell/상태UI/컴포넌트 재사용
3. `pnpm --dir FE/user-web run typecheck` 통과
4. 실제 API 응답 기준 데이터 표시 검증 (BE 연동 가능 시)
