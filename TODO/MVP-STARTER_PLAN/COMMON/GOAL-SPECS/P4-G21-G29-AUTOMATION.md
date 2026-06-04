# P4 G21-G29 입력/출력 자동화 상세 명세

## 1. 목적

P4는 사용자가 데이터를 더 빠르게 입력하고, 필요한 데이터를 다시 찾고, 내보내고, 삭제 데이터를 복구할 수 있게 하는 단계다.

외부 Provider와 AI는 처음부터 실제 호출로 고정하지 않고 mock adapter를 기준으로 구현한다.

## G21. BusinessCard OCR Backend

### 화면 영향

G22 명함 OCR 화면이 사용할 API를 제공한다.

### API 연결

- `POST /api/business-cards/scan`
- `GET /api/business-cards/:scanId`
- `POST /api/business-cards/:scanId/confirm`
- API 요약: `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-WORKFLOW-AUTOMATION-API.md`
- 엔드포인트 구현 계약: `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-ENDPOINT-CONTRACT.md`

### DB 연결

- BusinessCardScan
- AiJob
- Company
- Contact

### 비즈니스 기준

- OCR 결과는 자동 저장하지 않는다.
- 사용자가 확인/수정/확정해야 Company/Contact가 생성된다.
- 기존 회사 후보를 먼저 보여준다.

### 완료 기준

- OCR 요청, 결과 조회, 확정 저장 API가 동작한다.
- mock OCR adapter로 로컬 E2E가 가능하다.

## G22. BusinessCard OCR User Web 화면

### 화면 목적

사용자가 명함 이미지를 업로드하고 OCR 결과를 확인/수정한 뒤 거래처(담당자)로 저장할 수 있게 한다.

### 화면 구성

- 이미지 업로드 영역
- OCR 처리 상태
- 추출 결과 수정 form
- 기존 회사 후보 목록
- 새 회사 생성 또는 회사 없이 저장 선택

### API 연결

- `POST /api/business-cards/scan`
- `GET /api/business-cards/:scanId`
- `POST /api/business-cards/:scanId/confirm`

### 상태/validation

- 이미지 파일 형식과 용량 validation
- OCR processing 상태 표시
- OCR 실패 시 재시도
- contactName 필수
- 회사 처리 방식은 `기존 회사 / 새 회사 / 회사 없이 저장` 중 하나를 선택해야 한다.

### 완료 기준

- OCR mock 결과를 확인하고 거래처로 저장할 수 있다.

## G23. Import Backend

### API 연결

- `POST /api/imports`
- `POST /api/imports/:importJobId/map`
- `PATCH /api/imports/:importJobId/mapping`
- `POST /api/imports/:importJobId/confirm`
- `GET /api/imports/:importJobId`
- 엔드포인트 구현 계약: `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-ENDPOINT-CONTRACT.md`

### DB 연결

- ImportJob
- ImportJobRow
- AiJob
- Company
- Contact
- Product
- Deal

### 비즈니스 기준

- Import 대상은 Company, Contact, Product, Deal 1차 범위다.
- 일정/회의록 Import는 MVP 제외다.
- AI mapping은 mock adapter를 우선 사용한다.
- 사용자가 매핑 결과를 확인해야 실행한다.

### 완료 기준

- 업로드, 매핑 제안, 매핑 수정, 확정 실행 흐름이 API로 가능하다.

## G24. Import User Web 화면

### 화면 목적

사용자가 Excel/CSV 파일을 올리고 AI 매핑 결과를 확인/수정한 뒤 Import를 실행할 수 있게 한다.

### 화면 구성

- 대상 선택: 회사, 거래처(담당자), 제품, 딜
- 파일 업로드
- 컬럼 미리보기
- AI 매핑 결과 표시
- 매핑 수정 UI
- row별 결과 표시

### API 연결

- Import API 전체

### 상태/validation

- 파일 없음 상태
- 지원하지 않는 파일 형식
- 매핑 미완료 상태
- row별 성공/실패 표시
- 확정 전 경고 dialog

### 완료 기준

- 사용자가 매핑을 확인한 뒤 Import를 실행할 수 있다.

## G25. Export Backend

### API 연결

- `POST /api/exports`
- `GET /api/exports/:exportJobId`
- `GET /api/exports/:exportJobId/download`
- `POST /api/schedules/week/export`
- 엔드포인트 구현 계약: `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-ENDPOINT-CONTRACT.md`

### DB 연결

- ExportJob
- Company
- Contact
- Product
- Deal
- Schedule
- MeetingNote

### 비즈니스 기준

- 민감 데이터는 기본 제외한다.
- 민감 데이터 포함 시 명시적 확인값이 필요하다.
- PDF adapter는 placeholder로 둘 수 있고 Excel adapter부터 구현 가능하다.

### 완료 기준

- Export job 생성, 상태 조회, 다운로드가 가능하다.
- 민감 데이터 포함 확인 없이 Export가 실행되지 않는다.

## G26. Export User Web 화면

### 화면 목적

사용자가 Export 대상을 고르고 파일을 받을 수 있게 한다.

### 화면 구성

- Export 대상 선택
- 파일 형식 선택
- 민감 데이터 포함 여부
- 민감 데이터 포함 시 경고 dialog
- job 상태 표시
- 다운로드 버튼

### API 연결

- Export API 전체

### 상태/validation

- 대상과 형식은 필수
- 민감 데이터 포함 시 확인 전 실행 불가
- job processing 상태 polling
- 다운로드 실패 시 재시도

### 완료 기준

- 민감 데이터 포함 시 경고 확인 전에는 export가 실행되지 않는다.

## G27. Notification 기본 흐름

### 화면 목적

사용자가 일정, 딜 마감, 다음 행동, 회의록 생성 완료 알림을 확인하고 읽음 처리할 수 있게 한다.

### API 연결

- `GET /api/notifications`
- `PATCH /api/notifications/:notificationId/read`
- `PATCH /api/notifications/settings`

### DB 연결

- Notification
- UserSetting
- Schedule
- Deal
- MeetingNote

### 화면 구성

- 상단 알림 아이콘 또는 알림 목록
- 읽지 않은 알림 count
- 알림 항목: 제목, 내용, 대상, 예정 시각, 읽음 상태
- 설정 화면의 알림 기본값

### 완료 기준

- 알림 데이터가 생성되고 User Web에서 확인할 수 있다.
- 읽음 처리가 가능하다.

## G28. Trash 기본 흐름

### 화면 목적

삭제된 주요 데이터를 휴지통에서 확인하고 복구할 수 있게 한다.

### API 연결

- `GET /api/trash`
- `POST /api/trash/:targetType/:targetId/restore`
- `DELETE /api/trash/:targetType/:targetId/permanent`

### DB 연결

- Company
- Contact
- Product
- Deal
- Schedule
- MeetingNote

### 화면 구성

- 휴지통 목록
- entity type 필터
- 삭제일과 완전 삭제 예정일
- 복구 버튼
- 완전 삭제 위험 확인 dialog

### 완료 기준

- 삭제 데이터가 휴지통에 표시된다.
- 복구가 가능하다.

## G29. 통합검색 기본 흐름

### 화면 목적

사용자가 하나의 키워드로 주요 엔티티를 빠르게 찾을 수 있게 한다.

### API 연결

- `GET /api/search`

### DB 연결

- Company
- Contact
- Product
- Deal
- Schedule
- MeetingNote

### 화면 구성

- 상단 통합검색
- 모바일 전체 화면 검색 시트
- 결과 group: 회사, 거래처(담당자), 제품, 딜, 일정, 회의록
- 결과 선택 시 상세로 이동

### 상태/validation

- 검색어 1자 이하는 실행하지 않거나 최근 항목을 표시한다.
- 결과 없음 상태
- 진행 중 딜과 최근 항목 우선 표시

### 완료 기준

- 주요 엔티티가 entity type별로 묶여 검색된다.
- 결과 선택 시 상세 화면으로 이동한다.

## 관련 문서

- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-WORKFLOW-AUTOMATION-API.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-ENDPOINT-CONTRACT.md`
- `TODO/MVP-STARTER_PLAN/COMMON/USER-FLOW.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`
