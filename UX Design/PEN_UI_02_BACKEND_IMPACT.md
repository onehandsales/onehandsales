# PEN UI 02 Backend Impact

## 목적

이 문서는 `/Users/user/Sales_b2c/UX Design/onehand_sales.pen` 기준으로 재설계되는 CRM UI가 백엔드에 어떤 영향을 주는지 정리하기 위한 문서다.

목표:
- 화면 기준으로 필요한 데이터와 액션을 정리한다.
- 기존 API 재사용 가능 여부를 판단한다.
- 부족한 응답 필드, 집계값, 상태값, 신규 API 필요 여부를 식별한다.
- MVP 범위에서 백엔드가 먼저 맞춰야 할 항목을 정리한다.

---

## 범위

이번 pen 파일은 CRM 전체 UI를 포함한다.

포함 화면군:
- 딜 파이프라인
- 딜 상세 / 빠른등록
- 회사
- 거래처
- 제품
- 일정
- 회의록
- 명함 스캔
- Import / Export
- 휴지통
- 검색 / 알림 / 더보기
- 공통 상태 화면 및 공통 컴포넌트

주의:
- 이 문서는 디자인을 코드로 옮기기 전, 백엔드 관점에서 필요한 데이터 계약을 정리하는 용도다.
- 프론트 구조 자체보다 화면이 요구하는 데이터, 상태, 액션, API를 중심으로 본다.

---

## 1. 주요 화면 목록

| 화면 | 목적 | 관련 도메인 | 우선순위 | MVP 포함 여부 |
|---|---|---|---|---|
| Deal Pipeline Home | 핵심 홈, 딜 흐름 파악 | deal, company, contact | 높음 | TBD |
| Deal Quick Create Modal | 빠른 딜 생성 | deal, company, contact, product | 높음 | TBD |
| Deal Detail | 딜 상세 확인 및 액션 | deal, activity, memo, schedule, meeting-note | 높음 | TBD |
| Company List/Detail | 회사 관리 | company | 중간 | TBD |
| Contact List/Detail | 거래처 관리 | contact | 중간 | TBD |
| Product List/Detail | 제품 관리 | product | 중간 | TBD |
| Schedule | 일정 관리/캘린더 | schedule, deal, company, contact | 중간 | TBD |
| Meeting Note | 회의록 관리 | meeting-note, deal | 낮음/중간 | TBD |
| Business Card Scan | 명함 OCR/확정 | business-card, company, contact | 낮음/중간 | TBD |
| Import / Export | 데이터 이동 | import-export | 낮음/중간 | TBD |
| Trash | 삭제 자원 복구 | trash | 낮음 | TBD |
| Search / Notification / More | 보조 기능 | search, notification, user | 낮음 | TBD |

---

## 2. 1차 핵심 화면 기준 백엔드 요구사항

### Deal Pipeline Home

필요한 읽기 API:
- 딜 목록
- 단계별 카운트
- 다음 액션 정보
- 회사/거래처 연결 정보
- 필터 상태에 따른 결과 수

필요한 쓰기 API:
- 딜 생성
- 단계 변경
- 다음 액션 수정
- 다음 액션 완료
- 다음 액션 연기

필요한 응답 필드:
- `id`
- `title`
- `stage`
- `likelihoodStatus`
- `likelihoodPercent`
- `nextActionText`
- `nextActionDueAt`
- `nextActionStatus`
- `companyName`
- `contactName`
- `amount`
- `expectedCloseDate`
- `deletedAt`

필요한 집계값:
- stage summary
- overdue / due soon / scheduled summary

필요한 필터:
- stage
- likelihood
- next action status
- search

메모:
- pen 기준 stage 구조와 현재 백엔드 stage 구조 충돌 여부 확인 필요
- 모바일 홈이 핵심이면 aggregate endpoint 필요성이 높아질 수 있음

### Deal Quick Create Modal

필요한 읽기 API:
- 회사 선택 후보
- 거래처 선택 후보
- 제품 선택 후보

필요한 쓰기 API:
- 딜 생성
- 필요 시 inline 회사 생성
- 필요 시 inline 거래처 생성
- 필요 시 inline 제품 연결

입력 검증 포인트:
- 제목
- 회사/거래처 연계
- 금액
- stage
- next action 관련 값

메모:
- UX상 단순 modal로 보여도 실제로는 복합 생성 플로우일 가능성이 높음

### Deal Detail

필요한 읽기 API:
- 딜 상세
- 활동 로그
- 메모
- 연결 제품
- 일정 summary
- 회의록 summary

필요한 쓰기 API:
- 딜 수정
- 단계 변경
- 다음 액션 처리
- 활동 생성/수정/삭제

메모:
- 단일 상세 화면에 복수 도메인 요약값이 동시에 필요함
- desktop 우측 detail panel과 mobile detail page가 같은 데이터를 쓰는 구조가 적합함

---

## 3. 후속 화면 기준 백엔드 요구사항

### Company / Contact / Product

필요한 읽기 API:
- 목록
- 상세
- 로그/연결/메모

필요한 쓰기 API:
- 생성
- 수정
- 삭제
- 복구
- 로그 생성/수정/삭제

메모:
- 디자인 카드형 리스트 기준으로 요약 필드 부족 여부 확인 필요

### Schedule

필요한 읽기 API:
- range 기반 일정 목록
- 주간 일정
- 일정 상세

필요한 쓰기 API:
- 일정 생성/수정/삭제/복구

메모:
- 캘린더 UI가 요구하는 월/주/일 데이터 단위 확인 필요
- 현재 응답으로 캘린더 렌더링이 충분한지 검토 필요

### Meeting Note

필요한 읽기 API:
- 목록
- 상세

필요한 쓰기 API:
- 생성
- AI 생성
- 수정
- 딜 연결
- 삭제/복구

메모:
- AI 생성 후 저장/확정 흐름이 pen UX와 일치하는지 확인 필요

### Business Card Scan

필요한 읽기 API:
- 스캔 상태 조회
- 후보 회사 목록

필요한 쓰기 API:
- 이미지 업로드
- OCR 실행
- 확정

메모:
- polling UX 여부 확인 필요

### Import / Export

필요한 읽기 API:
- import job detail
- export job detail
- export download

필요한 쓰기 API:
- import 생성
- mapping 생성
- mapping 수정
- import confirm
- export 생성

메모:
- job 기반 UI로 가는지 즉시 완료 UX인지 확인 필요

---

## 4. 현재 API 매핑

### 재사용 가능성이 높은 기존 API

- deal
- company
- contact
- product
- schedule
- meeting-note
- business-card
- import-export
- trash
- search
- notification

### 재사용 가능성이 높은 기존 로직

- auth guard / current user
- 도메인별 query/mutation 흐름
- soft delete / restore 처리
- paginated response 구조
- 공통 error handling 규칙

### 응답 확장 가능성이 있는 영역

- 모바일 홈 전용 summary
- stage metadata
- dashboard aggregate
- quick create candidate endpoints
- 캘린더 요약/집계 응답

---

## 5. 현재 구조와 pen 간 충돌 사항

### Deal Stage 충돌

현재 백엔드:
- `INITIAL_CONTACT`
- `IN_DISCUSSION`
- `WON`
- `LOST`

pen 기준:
- 초기 접촉
- 니즈 확인
- 제안/견적
- 협상
- 성사
- 실패

판단 필요:
- 프론트 임시 매핑으로 갈지
- 백엔드 enum / DB / API를 6단계로 확장할지

### Summary / Aggregate 충돌

- pen 홈 화면은 단일 화면에서 많은 집계 정보를 요구할 가능성이 큼
- 현재 API가 여러 호출 조합인지, 단일 aggregate endpoint가 필요한지 확인 필요

### Quick Create 충돌

- 디자인은 단순 modal처럼 보이지만
- 실제로는 회사/거래처/제품 인라인 생성과 연결될 수 있음

### Calendar 충돌

- 일정 화면이 라이브러리 선택과 데이터 shape에 크게 영향 받음
- 현재 응답 구조로 충분한지 확인 필요

### Navigation Badge 충돌

- 모바일 bottom tab / more / bell 영역에서 badge count나 상태 count가 필요할 수 있음
- 현재 전용 API가 있는지 검토 필요

---

## 6. 신규 API / 응답 확장 필요 후보

### 신규 API 후보

- mobile home aggregate endpoint
- stage metadata endpoint
- quick create candidate search endpoint
- dashboard summary endpoint
- navigation badge count endpoint
- unified global search suggestion endpoint

### 기존 API 응답 확장 후보

- deal list: 시각적 배지/카운트용 필드
- deal detail: 추가 summary 정보
- company/contact/product list: 디자인 카드용 요약 필드
- notification list: 분류/우선순위 표시 필드
- schedule list: 캘린더 렌더링 보조 정보

---

## 7. 공통 응답 계약 규칙

### 날짜

- 대부분 ISO string 사용
- nullable 날짜 필드 일관성 유지 필요

### Pagination

기본 구조:
- `items`
- `page`
- `pageSize`
- `totalCount`
- `hasNext`

### Delete / Restore

- `deletedAt`
- `permanentDeleteAt`
- restore action 지원 여부

### Error

공통 에러 응답:
- `statusCode`
- `error`
- `message`

특이 케이스:
- 삭제된 리소스 read: `410`
- 삭제된 리소스 write/action: `409`

---

## 8. 상태 전이 / 액션 규칙

### Deal

- stage 변경 규칙
- next action 완료/연기 규칙
- won/lost 전환 규칙
- deleted resource 처리 규칙

### Schedule

- 생성/수정/삭제/복구 규칙
- all-day 처리 규칙
- reminder 상태 처리

### Meeting Note

- AI 생성 후 저장/확정 규칙
- 딜 연결 규칙

### Import / Export

- job 상태 전이
- mapping 필수 여부
- confirm 전 검증 규칙
- download 준비 상태 규칙

### Business Card

- scan 상태 전이
- confirm 중복 방지 규칙

---

## 9. MVP 범위

### 1차에 반드시 백엔드가 맞춰야 할 것

- Deal Pipeline Home
- Deal Quick Create
- Deal Detail
- 필요한 stage / filter / next action 규칙
- 홈 화면에 필요한 summary / aggregate 판단

### 2차 이후로 미뤄도 되는 것

- Meeting Note
- Business Card
- Import / Export
- Trash
- Notification 고도화
- Search 고도화

---

## 10. 리스크

- deal stage 구조 변경 시 DB/API/FE 전체 영향
- 모바일 홈 화면이 aggregate endpoint 없이 다중 호출 과다 발생 가능
- 빠른등록 modal이 단순 생성이 아니라 복합 액션일 가능성
- 캘린더 데이터 구조가 라이브러리 선택에 종속될 가능성
- pen 기준 디자인이 요구하는 상태/요약 필드가 현재 API에 부족할 가능성
- MVP 범위가 고정되지 않으면 백엔드 변경 범위가 급격히 커질 가능성

---

## 11. 구현 전 결정 필요 사항

- deal stage를 백엔드까지 6단계로 바꿀지 여부
- MVP 범위를 딜만 할지, 회사/거래처/제품/일정까지 확장할지
- 모바일 홈 전용 aggregate API를 만들지 여부
- quick create에서 inline 생성 UX를 유지할지 여부
- 일정 화면을 1차에 포함할지 여부
- 디자인 기준으로 필요한 summary field를 어디까지 백엔드에서 책임질지 여부

---

## 최종 정리

이 pen 기반 리디자인은 단순 UI 변경이 아니라, 백엔드 입장에서도 아래를 다시 판단해야 하는 작업이다.

- 현재 API로 충분한가
- stage / summary / aggregate 구조가 맞는가
- 홈 화면 / modal / detail이 요구하는 데이터 밀도를 현재 응답이 감당하는가
- MVP에서 어디까지 먼저 지원할 것인가

이 문서는 `/Users/user/Sales_b2c/UX Design/onehand_sales.pen` 분석 이후,
프론트/백엔드가 함께 무엇을 유지하고 무엇을 바꿀지 결정하는 기준 문서로 사용한다.
