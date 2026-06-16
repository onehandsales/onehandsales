# Admin Web TODO

## 1. 목적

`FE/admin-web`은 운영자가 사용자와 전체 데이터를 확인하고, 민감정보 접근을 통제하며, 감사 로그를 추적하기 위한 데스크톱 전용 운영 콘솔이다.

Admin Web은 User Web처럼 빠르고 부드러운 입력 경험보다 정확성, 추적성, 안전성을 우선한다.

## 2. 스캐폴딩

### 해야 할 일

- Vite React TypeScript 앱 생성
- Tailwind CSS 설정
- shadcn/ui 초기 설정
- React Router 설정
- TanStack Query 설정
- TanStack Table 설치
- React Hook Form, Zod 설치
- lucide-react 설치
- Recharts는 MVP starter에서 설치하지 않고, 고급 대시보드 chart가 필요한 후속 goal에서 추가
- Playwright 설정

### 권장 구조

```text
FE/admin-web/
  package.json
  vite.config.ts
  tsconfig.json
  index.html
  src/
    app/
      providers/
      routes/
      styles/
      app.tsx
    pages/
      login/
      dashboard/
      users/
      deals/
      companies/
      contacts/
      products/
      audit-log/
      settings/
    features/
    shared/
      api/
      config/
      hooks/
      lib/
      types/
      ui/
  tests/
```

## 3. Admin 공통 기반

### 라우팅

| 경로 | 화면 | 우선순위 |
|---|---|---|
| `/login` | Admin 로그인 | 1 |
| `/` | Admin 대시보드 | 1 |
| `/users` | 사용자 목록 | 1 |
| `/users/:userId` | 사용자 상세 | 1 |
| `/users/:userId/deals` | 사용자별 딜 | 1 |
| `/users/:userId/companies` | 사용자별 회사 | 1 |
| `/users/:userId/contacts` | 사용자별 담당자 | 1 |
| `/users/:userId/products` | 사용자별 제품 | 1 |
| `/deals` | 전체 딜 | 1 |
| `/companies` | 전체 회사 | 1 |
| `/contacts` | 전체 담당자 | 1 |
| `/products` | 전체 제품 | 1 |
| `/audit-logs` | 감사 로그 | 1 |
| `/settings` | Admin 설정 | 2 |

### 앱 Shell

- 데스크톱 고정 좌측 사이드바
- 상단 현재 화면 제목
- 필터와 검색 영역
- 테이블 중심 본문
- row detail panel
- 위험 액션 dialog

### API client

위치:

```text
src/lib/admin-api-client.ts
```

이름:

```text
adminApiClient
```

규칙:

- base path는 `/admin/api`
- User API `/api/*` 호출 금지
- 401은 login 이동
- 403은 forbidden 화면 또는 접근 거부 상태 표시
- client log에 PII와 사유 text를 남기지 않음
- local/preview `VITE_API_URL`은 환경별 임시 Backend URL을 허용
- production `VITE_API_URL`은 같은 parent domain의 `https://api.<service-domain>` 기준
- production Admin Web origin은 `https://admin.<service-domain>` 기준
- Supabase callback URL은 local/preview/production별 `VITE_SUPABASE_REDIRECT_URL`로 분리
- token exchange/refresh/logout처럼 refresh cookie가 필요한 auth 요청은 credential 포함 요청을 사용할 수 있음
- 일반 Admin API 인증은 `Authorization: Bearer <app_access_token>` 기준

## 4. Admin 인증

### 기능

- Supabase Auth 기반 Admin 로그인
- Admin 로그인 provider는 MVP 초기에는 Kakao, Naver, Google을 활성화
- Apple 로그인은 iOS 앱 개발 단계 후속 provider로 두며 Web MVP에서는 disabled 또는 준비 중 상태
- 로그인 성공 후 `POST /api/auth/exchange` 호출
- token exchange 전 현재 기기 슬롯 선택 또는 확인: 모바일, 개인 노트북, 회사용 노트북
- 브라우저 profile 단위의 비밀이 아닌 stable local device id 생성/보관
- 같은 기기 슬롯 충돌 시 기존 등록 기기를 교체할지 확인
- 로그인 후 `GET /admin/api/me`로 role 확인
- `role !== ADMIN`이면 접근 거부
- Admin protected route guard
- 로그아웃

### 작업 목록

- auth API hook
- Supabase Auth client 초기화
- Supabase access token은 `POST /api/auth/exchange`에만 전달
- `POST /api/auth/exchange` body에 `deviceSlot`, `deviceId`, 선택적 `deviceLabel` 전달
- `DeviceSlotAlreadyRegistered` 응답 시 교체 확인 UI를 표시하고, 사용자가 확인하면 `replaceExistingDevice=true`로 token exchange 재시도
- 같은 등록 기기의 기존 탭/session은 새 로그인 때문에 강제로 로그아웃되지 않는다는 전제로 auth state 처리
- `adminApiClient`에 Backend App access token을 `Authorization: Bearer` header로 전달
- Backend App access token은 memory에만 저장
- refresh token은 Backend가 발급한 httpOnly cookie를 사용하므로 FE에서 직접 읽지 않음
- 401 응답 시 `POST /api/auth/refresh`를 1회 호출하고 성공하면 원래 요청을 1회 재시도
- refresh 실패 시 memory의 App access token 제거 후 `/login` 이동
- Admin route guard
- forbidden state
- 로그인 실패 표시

### 완료 기준

- Admin이 아닌 사용자는 Admin 화면에 진입할 수 없다.
- client role check는 UX용이고 Backend AdminGuard가 최종 권한을 가진다.

## 5. 대시보드

### 목적

운영자가 서비스 상태를 빠르게 확인한다.

### 표시 항목

- 전체 사용자 수
- 최근 가입 사용자
- 전체 딜 수
- 전체 회사/담당자/제품 수
- 최근 Import/Export 작업
- 최근 감사 로그
- 민감정보 원문 조회 요청 수

### 작업 목록

- dashboard summary query
- 기본 metric card
- 최근 감사 로그 table
- 최근 작업 table

### 완료 기준

- 운영자가 현재 서비스 데이터 상태를 빠르게 파악할 수 있다.

## 6. 사용자 관리

### 화면

- `/users`
- `/users/:userId`

### 사용자 목록 컬럼

- 사용자 ID
- 이메일 masked
- 표시 이름
- role
- status
- 가입일
- 최근 로그인일
- 생성된 딜 수
- 생성된 회사 수
- row action

### 사용자 상세 정보

- 기본 프로필
- 연결된 Supabase Auth provider
- 사용자별 회사/담당자/제품/딜 요약
- 최근 활동
- 최근 Import/Export
- 최근 감사 대상 여부

### 작업 목록

- 사용자 목록 table
- 서버 페이지네이션
- 서버 검색
- role/status 필터
- 사용자 상세 panel/page
- 사용자별 데이터 링크

### 완료 기준

- Admin은 특정 사용자의 전체 데이터 맥락으로 이동할 수 있다.

## 7. 전체 도메인 데이터 조회

### 공통 원칙

- 서버 페이지네이션
- 서버 검색/필터
- row detail panel
- 민감 데이터 기본 마스킹
- 원문 보기 필요 시 사유 입력

### 전체 회사

컬럼:

- 회사명
- 소유 사용자
- 위치
- 분야
- 담당자 수
- 딜 수
- 삭제 여부
- 완전 삭제 예정일
- 생성일

### 전체 담당자

컬럼:

- 이름
- 소유 사용자
- 회사
- 부서
- 직급
- 전화번호 masked
- 이메일 masked
- 삭제 여부
- 완전 삭제 예정일
- 생성일

### 전체 제품

컬럼:

- 제품명
- 소유 사용자
- 분류
- 단가 masked 또는 제한 표시
- 연결 수
- 삭제 여부
- 완전 삭제 예정일
- 생성일

### 전체 딜

컬럼:

- 딜명
- 소유 사용자
- 회사/담당자
- 단계
- 금액 masked
- 가능성
- 다음 행동 상태
- 삭제 여부
- 완전 삭제 예정일
- 생성일

### 작업 목록

- 공통 admin table 컴포넌트
- query key factory
- filter state URL 반영
- row detail panel과 `/admin/api/companies/:companyId`, `/admin/api/contacts/:contactId`, `/admin/api/products/:productId`, `/admin/api/deals/:dealId` 연결
- masked field 컴포넌트
- raw sensitive view dialog 연결

### 완료 기준

- Admin은 전체 데이터를 조회할 수 있지만 민감 데이터는 기본적으로 볼 수 없다.

## 8. 사용자별 데이터 조회

### 화면

- `/users/:userId/deals`
- `/users/:userId/companies`
- `/users/:userId/contacts`
- `/users/:userId/products`

### 목적

특정 사용자 CS, 장애 확인, 데이터 확인 요청에 대응한다.

### 작업 목록

- 사용자별 데이터 table
- 사용자 상세에서 바로 진입
- 현재 조회 중인 target user context 표시
- 전체 목록과 동일한 masking 정책 적용

### 완료 기준

- 운영자는 특정 사용자 데이터만 좁혀서 볼 수 있다.

## 9. 민감정보 원문 조회

### 민감 데이터

- Memo 원문
- 회의록 본문
- 딜 금액
- 전화번호
- 이메일
- 사용자가 민감 표시한 데이터

### 화면 흐름

1. Admin이 masked field 옆 원문 보기 버튼을 누른다.
2. 사유 입력 dialog가 열린다.
3. 사유를 입력하지 않으면 진행할 수 없다.
4. 확인 시 Backend에 raw view 요청을 보낸다.
5. Backend가 감사 로그를 남긴 뒤 원문을 반환한다.
6. UI는 원문 표시 상태를 명확하게 구분한다.

### 작업 목록

- masked field 컴포넌트
- raw view button
- reason dialog
- reason form validation
- raw value 표시 상태
- 사유 text client log 금지

### 완료 기준

- 원문 조회에는 항상 사유가 필요하다.
- 원문 조회 후 감사 로그에서 기록을 확인할 수 있다.

## 10. 감사 로그

### 화면

- `/audit-logs`

### 컬럼

- 일시
- actor user
- action
- target type
- target id
- reason 여부
- metadata summary

### 필터

- action
- actor user
- target type
- target id
- 기간

### 작업 목록

- 감사 로그 table
- 서버 페이지네이션
- 필터
- 상세 panel
- reason 표시 정책 확인

### 완료 기준

- 민감 원문 조회와 위험 액션이 감사 로그로 추적된다.

## 11. 위험 액션

### 대상

- 사용자 정지
- 사용자 강제 삭제 또는 30일 이내 계정 복구
- 민감정보 원문 보기
- 강제 데이터 수정
- 휴지통 복구

### 작업 목록

- AlertDialog 기반 확인
- 사유 입력이 필요한 액션 구분
- 사용자 강제 삭제 시 `DELETED` 상태와 완전 삭제 예정일 표시
- 삭제 계정 복구는 `permanentDeleteAt` 이전에만 가능하게 표시
- mutation 성공/실패 처리
- client log에 PII와 reason text 남기지 않음

### 완료 기준

- 위험 액션은 실수로 실행되기 어렵다.
- Backend 감사 로그와 연결된다.

## 12. MVP 이후: 수동 결제 관리

### 상태

MVP 이후 작업이다.

MVP starter 구현에서는 Admin route, sidebar menu, API client, DB table을 만들지 않는다.

### 추후 작업

- 계좌이체 입금 확인 목록
- 사용자 유료 상태 변경
- 변경 사유 입력
- 감사 로그 연결

### 완료 기준

- 초기 유료 운영 단계에서 추가한다.

## 13. Admin Web E2E

### Smoke E2E

- Admin 로그인
- non-admin 접근 차단
- 사용자 목록 조회
- 전체 딜 목록 조회
- 민감 데이터 masking 확인

### Full E2E

- 원문 조회 사유 입력
- 감사 로그 생성 확인
- 사용자별 데이터 조회
- 필터와 서버 페이지네이션

### 완료 기준

- Admin 핵심 안전 흐름이 자동 테스트로 보호된다.

## 14. 관련 문서

- `TODO/DONE/MVP-STARTER_PLAN/COMMON/USER-FLOW.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G30-G32-ADMIN-AUDIT-API.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P5-G30-G32-ADMIN-AUDIT.md`
- `TODO/DONE/MVP-STARTER_PLAN/FE-TODO/README.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/ADMIN_WEB.md`

