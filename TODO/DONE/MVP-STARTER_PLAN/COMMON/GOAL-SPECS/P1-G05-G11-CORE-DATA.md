# P1 G05-G11 핵심 기준 데이터 상세 명세

## 1. 목적

P1은 사용자가 회사, 거래처(담당자), 제품을 등록하고 딜 생성의 기반 데이터를 준비할 수 있게 하는 단계다.

이 단계가 끝나야 딜 중심 핵심 루프를 안정적으로 구현할 수 있다.

## G05. Auth/User Backend 기반

### 화면 명세

- User Web `/login`: provider 목록을 API로 받아 소셜 로그인 버튼을 표시한다.
- MVP 초기 실제 로그인 provider는 Kakao, Naver, Google이다.
- Apple은 iOS 앱 개발 단계의 후속 provider로 두고, Web MVP에서는 disabled 또는 준비 중 상태로만 표시한다.
- 로그인 버튼은 Supabase Auth client로 provider login을 시작한다.
- Supabase Auth callback은 User Web/Admin Web이 처리하고, 로그인 성공 후 `POST /api/auth/exchange`로 local User/AuthDevice/AuthSession을 동기화하고 Backend App token을 발급받는다.
- token exchange 시 사용자는 현재 기기 슬롯 `mobile`, `personal_laptop`, `work_laptop` 중 하나를 선택하거나 확인한다.
- token exchange 시 FE는 브라우저 profile 또는 앱 설치 단위의 stable local `deviceId`를 함께 보낸다.
- 같은 등록 기기 안에서는 여러 active session을 허용하며, 새 로그인 때문에 기존 탭/session을 강제로 revoke하지 않는다.
- 같은 슬롯에 다른 등록 기기가 이미 있으면 교체 확인 후 기존 등록 기기와 그 하위 session을 revoke한다.
- User Web app shell: `GET /api/me` 성공 시 사용자명과 기본 설정을 사용할 수 있다.
- Admin Web app shell: `GET /admin/api/me` 성공 시 Admin navigation을 표시한다.
- `INITIAL_ADMIN_EMAILS`와 일치하는 사용자는 token exchange 시 `role = ADMIN`으로 승격되어 Admin Web에 접근할 수 있다.

### API 연결

- `GET /api/auth/providers`
- `POST /api/auth/exchange`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/me`
- `GET /api/users/me/settings`
- `PATCH /api/users/me/settings`
- `GET /admin/api/me`
- 상세 계약: `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G01-G05-FOUNDATION-AUTH-API.md`

### DB 연결

- User
- UserOAuthAccount
- UserSetting
- AuthDevice
- AuthSession

### 상태/validation

- 로그인 전: 보호 route 접근 시 `/login`으로 이동한다.
- 로그인 실패: provider 오류 메시지를 표시한다.
- Admin 아님: Admin Web에서 접근 차단 상태를 표시한다.

### 완료 기준

- Supabase token을 Backend App token으로 교환할 수 있다.
- Backend App Bearer Token 검증이 동작한다.
- 외부 Auth user와 local User/UserOAuthAccount/UserSetting/AuthSession이 동기화된다.
- User API는 current user context를 받을 수 있다.
- Admin API는 AdminGuard를 통과해야 접근된다.
- User Web과 Admin Web이 각각 자기 API client로 me API를 호출할 수 있다.

## G06. Company Backend vertical slice

### 화면 영향

G07 회사 화면이 사용할 API를 제공한다.

### API 연결

- Company CRUD
- CompanyLog CRUD
- API 요약: `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G06-G12-CORE-DOMAIN-API.md`
- 엔드포인트 구현 계약: `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G06-G12-ENDPOINT-CONTRACT.md`

### DB 연결

- Company
- CompanyLog
- TagAssignment

### 비즈니스 기준

- 회사는 사용자별로 분리된다.
- 삭제는 soft delete다.
- 회사 로그는 영업 접촉 이력이 아니라 회사 자체 히스토리다.

### 완료 기준

- `/api/companies` CRUD가 동작한다.
- 다른 사용자의 회사는 조회/수정/삭제할 수 없다.
- 회사 로그를 조회/생성/수정/삭제할 수 있다.

## G07. Company User Web 화면

### 화면 목적

사용자가 회사 정보를 빠르게 등록하고, 목록에서 찾고, 상세에서 보강할 수 있게 한다.

### 화면 구성

#### 회사 목록

- 경로: `/companies`
- 주요 UI: 검색 input, 회사 생성 버튼, 회사 목록 table/list, 삭제/복구 상태 표시
- 컬럼: 회사명, 분야, 지역, 거래처 수, 딜 수, 최근 수정일

#### 회사 빠른 등록 modal

- 필수 입력: 회사명
- 선택 입력: 분야, 지역, initial Memo
- 저장 후 목록 갱신

#### 회사 상세

- 경로: `/companies/:companyId`
- 주요 UI: 기본 정보, 회사 로그, Memo 기록, 연결 거래처/딜/제품 요약

### API 연결

- `GET /api/companies`
- `POST /api/companies`
- `GET /api/companies/:companyId`
- `PATCH /api/companies/:companyId`
- `DELETE /api/companies/:companyId`
- `POST /api/companies/:companyId/logs`

### 상태/validation

- loading: 목록 skeleton
- empty: "등록된 회사가 없습니다"와 생성 버튼
- error: 재시도 버튼
- validation: 회사명 필수
- success: 저장 후 toast 또는 inline success

### 완료 기준

- 회사 생성, 목록, 상세, 수정, 삭제가 가능하다.
- API error와 loading 상태가 화면에 표현된다.

## G08. Contact Backend vertical slice

### 화면 영향

G09 거래처(담당자) 화면과 딜 생성의 담당자 선택 UI가 사용할 API를 제공한다.

### API 연결

- Contact CRUD
- API 요약: `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G06-G12-CORE-DOMAIN-API.md`
- 엔드포인트 구현 계약: `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G06-G12-ENDPOINT-CONTRACT.md`

### DB 연결

- Contact
- ContactLog
- Company
- PersonalMemo

### 비즈니스 기준

- 거래처(담당자)는 회사와 연결될 수 있다.
- 회사 없이도 저장 가능하다.
- 회사 연결 시 현재 사용자 소유 회사인지 검증한다.
- 거래처 Log는 `ContactLog`에 객관 기록으로 저장한다.
- 거래처 Memo는 Contact 단일 필드가 아니라 `PersonalMemo(targetType=CONTACT)`에 암호화 저장한다.
- 전화번호, 이메일, Memo 원문은 민감정보 후보로 본다.

### 완료 기준

- `/api/contacts` CRUD가 동작한다.
- 연결 회사 ownership 검증이 있다.

## G09. Contact User Web 화면

### 화면 목적

사용자가 거래처(담당자)를 등록하고 회사와 연결할 수 있게 한다.

### 화면 구성

#### 거래처 목록

- 경로: `/contacts`
- 주요 UI: 검색, 회사 필터, 거래처 생성 버튼, 목록
- 컬럼: 이름, 회사명, 부서, 직책, 전화번호, 이메일, 최근 수정일

#### 거래처 빠른 등록 modal

- 필수 입력: 이름
- 선택 입력: 회사, 부서, 직책, 전화번호, 이메일
- 회사 검색 combobox 제공

#### 거래처 상세

- 기본 정보
- 연결 회사
- 관련 딜 요약
- Log 기록 영역
- Memo 기록 영역

### API 연결

- `GET /api/contacts`
- `POST /api/contacts`
- `GET /api/contacts/:contactId`
- `PATCH /api/contacts/:contactId`
- `DELETE /api/contacts/:contactId`
- `GET /api/companies` for company combobox

### 상태/validation

- 이름 필수
- 이메일 형식 validation
- 전화번호는 느슨한 형식 validation
- 회사 검색 결과 없음 시 회사 없이 저장 가능

### 완료 기준

- 거래처 생성, 목록, 상세, 수정, 삭제가 가능하다.
- 회사 연결 UI가 동작한다.

## G10. Product Backend vertical slice

### 화면 영향

G11 제품 화면과 G13 딜 생성의 제품 선택 UI가 사용할 API를 제공한다.

### API 연결

- Product CRUD
- ProductConnection 생성/삭제
- API 요약: `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G06-G12-CORE-DOMAIN-API.md`
- 엔드포인트 구현 계약: `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G06-G12-ENDPOINT-CONTRACT.md`

### DB 연결

- Product
- ProductLog
- ProductConnection
- Company
- Contact
- Deal
- PersonalMemo

### 비즈니스 기준

- 제품 단가는 선택 입력이다.
- 제품 연결 대상은 Company, Contact, Deal 중 하나다.
- 연결 대상은 현재 사용자 소유여야 한다.
- 제품 Log는 `ProductLog`에 객관 기록으로 저장한다.
- 제품 Memo는 `PersonalMemo(targetType=PRODUCT)`에 암호화 저장한다.

### 완료 기준

- `/api/products` CRUD가 동작한다.
- 제품을 회사/거래처/딜과 연결할 수 있다.

## G11. Product User Web 화면

### 화면 목적

사용자가 제품을 등록하고 기본 정보를 관리할 수 있게 한다.

### 화면 구성

#### 제품 목록

- 경로: `/products`
- 주요 UI: 검색, 분류 필터, 제품 생성 버튼, 목록
- 컬럼: 제품명, 분류, 단가, 연결 수, 최근 수정일

#### 제품 빠른 등록 modal

- 필수 입력: 제품명
- 선택 입력: 분류, 단가, 설명

#### 제품 상세

- 기본 정보
- 연결 대상 요약
- 연결 타입 라벨 표시
- Log 기록 영역
- Memo 기록 영역

### API 연결

- `GET /api/products`
- `POST /api/products`
- `GET /api/products/:productId`
- `PATCH /api/products/:productId`
- `DELETE /api/products/:productId`
- `POST /api/products/:productId/connections`
- `DELETE /api/products/:productId/connections/:connectionId`

### 상태/validation

- 제품명 필수
- 단가는 0 이상 숫자
- KRW 기본 표시
- 연결 대상이 없으면 연결 섹션은 empty 상태 표시

### 완료 기준

- 제품 생성, 목록, 상세, 수정, 삭제가 가능하다.
- 제품 단가가 KRW로 표시된다.

## 관련 문서

- `TODO/DONE/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G01-G05-FOUNDATION-AUTH-API.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G06-G12-CORE-DOMAIN-API.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G06-G12-ENDPOINT-CONTRACT.md`
- `TODO/DONE/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`
