# User Web TODO

## 1. 목적

`FE/user-web`은 개인 영업자가 실제로 사용하는 MVP의 첫 번째 클라이언트다.

사용자는 앱을 열자마자 진행 중인 딜을 확인하고, 회사/담당자/제품을 빠르게 등록하며, 딜/일정/회의록을 연결해 영업 흐름을 관리할 수 있어야 한다.

## 2. 스캐폴딩

### 해야 할 일

- Vite React TypeScript 앱 생성
- Tailwind CSS 설정
- shadcn/ui 초기 설정
- React Router 설정
- TanStack Query 설정
- React Hook Form, Zod 설치
- lucide-react 설치
- 경로 alias `@/*` 설정
- ESLint, Prettier 또는 프로젝트 lint 규칙 설정
- Playwright 설정

### 권장 구조

```text
FE/user-web/
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

### 완료 기준

- `npm run dev` 또는 선택한 패키지 매니저의 dev 명령으로 앱이 실행된다.
- 빈 화면이 아니라 기본 protected app shell이 렌더링된다.
- TypeScript strict 오류 없이 빌드된다.

## 3. 앱 공통 기반

### 라우팅

구현할 기본 라우트:

| 경로 | 화면 | 우선순위 |
|---|---|---|
| `/login` | 로그인 | 1 |
| `/` | 딜 파이프라인 홈 | 1 |
| `/companies` | 회사 목록 | 1 |
| `/companies/:companyId` | 회사 상세 | 1 |
| `/contacts` | 담당자 목록 | 1 |
| `/contacts/:contactId` | 담당자 상세 | 1 |
| `/products` | 제품 목록 | 1 |
| `/products/:productId` | 제품 상세 | 1 |
| `/deals` | 딜 목록 | 1 |
| `/deals/:dealId` | 딜 상세 | 1 |
| `/schedules` | 일정 목록/캘린더 | 2 |
| `/schedules/week` | 주간 일정 보고서 | 2 |
| `/meetings` | 회의록 목록 | 2 |
| `/meetings/new` | AI 회의록 생성 | 2 |
| `/meetings/:meetingNoteId` | 회의록 상세 | 2 |
| `/contacts/scan` | 명함 OCR 업로드 | 3 |
| `/imports` | Import 작업 | 3 |
| `/exports` | Export 작업 | 3 |
| `/settings` | 설정 | 3 |
| `/trash` | 휴지통 | 3 |
| `/search` | 통합검색 결과 | 3 |

### 앱 Shell

- 좌측 사이드바
- 상단바
- 통합검색
- 빠른 생성 버튼
- 알림 버튼
- 사용자 메뉴
- 모바일에서는 사이드바를 drawer 또는 하단 접근 가능한 구조로 전환

### API client

위치:

```text
src/lib/api-client.ts
```

해야 할 일:

- `apiClient` 구현
- `VITE_API_URL` config wrapper 구현
- auth token 주입
- 401 처리
- 표준 error shape 정규화
- `410 DeletedResource`를 삭제된 항목 상태로 정규화
- `409 DeletedResource`를 복구 후 수정 필요 상태로 정규화
- 파일 업로드 요청 처리
- 파일 다운로드 요청 처리
- local/preview `VITE_API_URL`은 환경별 임시 Backend URL을 허용
- production `VITE_API_URL`은 같은 parent domain의 `https://api.<service-domain>` 기준
- Supabase callback URL은 local/preview/production별 `VITE_SUPABASE_REDIRECT_URL`로 분리
- token exchange/refresh/logout처럼 refresh cookie가 필요한 auth 요청은 credential 포함 요청을 사용할 수 있음
- 일반 business API 인증은 `Authorization: Bearer <app_access_token>` 기준

금지:

- User Web에서 `/admin/api/*` 호출 금지
- feature 내부에서 `fetch` 직접 호출 금지
- 서버 데이터를 Zustand에 복사 금지

## 4. 인증 Feature

### 화면

- `/login`

### 기능

- Supabase Auth 기반 카카오 로그인 버튼
- Supabase Auth 기반 구글 로그인 버튼
- Supabase Auth 기반 네이버 로그인 버튼
- 애플 로그인 버튼은 Web MVP에서는 disabled 또는 준비 중 상태로 표시
- 애플 로그인 실제 구현은 iOS 앱 개발 단계 후속 작업
- Supabase Auth callback 처리
- 로그인 성공 후 `POST /api/auth/exchange` 호출
- token exchange 전 현재 기기 슬롯 선택 또는 확인: 모바일, 개인 노트북, 회사용 노트북
- 브라우저 profile 단위의 비밀이 아닌 stable local device id 생성/보관
- 같은 기기 슬롯 충돌 시 기존 등록 기기를 교체할지 확인
- Backend App token 저장/refresh 처리
- 로그인 실패 메시지
- 보호 라우트
- 로그아웃

### 작업 목록

- `features/auth/api` 작성
- `features/auth/hooks` 작성
- `features/auth/components` 작성
- Supabase Auth client 초기화
- Supabase access token은 `POST /api/auth/exchange`에만 전달
- `POST /api/auth/exchange` body에 `deviceSlot`, `deviceId`, 선택적 `deviceLabel` 전달
- `DeviceSlotAlreadyRegistered` 응답 시 교체 확인 UI를 표시하고, 사용자가 확인하면 `replaceExistingDevice=true`로 token exchange 재시도
- 같은 등록 기기의 기존 탭/session은 새 로그인 때문에 강제로 로그아웃되지 않는다는 전제로 auth state 처리
- Backend API client에 Backend App access token을 `Authorization: Bearer` header로 전달
- Backend App access token은 memory에만 저장
- refresh token은 Backend가 발급한 httpOnly cookie를 사용하므로 FE에서 직접 읽지 않음
- 401 응답 시 `POST /api/auth/refresh`를 1회 호출하고 성공하면 원래 요청을 1회 재시도
- refresh 실패 시 memory의 App access token 제거 후 `/login` 이동
- auth query key 정의
- 로그인 후 `/` 이동
- 비로그인 사용자가 protected route 접근 시 `/login` 이동

### 완료 기준

- 로그인 상태에 따라 route 접근이 제어된다.
- 로그인 UI는 소셜 provider가 명확히 구분된다.
- 로그인 성공 후 local User 동기화와 Backend App token 발급이 완료된다.
- 인증 실패 시 사용자가 다시 시도할 수 있다.

## 5. 홈 딜 파이프라인

### 화면

- `/`

### 사용자에게 보여줄 정보

- 단계 탭: 전체, 초기 접촉, 협의중, 성사, 실패
- 딜 리스트
- 딜명
- 회사/담당자
- 단계
- 금액
- 가능성
- 다음 행동
- 마감일
- 최근 활동
- 오늘 일정
- 임박/지연 알림

### Desktop UI

- 중앙은 리스트/테이블형 딜 파이프라인
- 우측에는 선택한 딜 상세 패널
- 우측 패널에는 기본 정보, 활동 로그, Memo 기록, 일정/회의록 탭

### Mobile UI

- 상단 단계 탭
- 카드형 딜 리스트
- 테이블과 가로 칸반은 기본 UI로 사용하지 않음

### 작업 목록

- 홈 summary API hook
- stage tab URL search param 반영
- 딜 row/card 컴포넌트
- 가능성 badge
- 다음 행동 상태 badge
- 금액 표시 formatter
- 선택 딜 상세 패널
- 빠른 딜 생성 modal 연결

### 완료 기준

- 로그인 후 첫 화면이 딜 파이프라인이다.
- 딜 비교에 필요한 필드가 한눈에 보인다.
- 데스크톱과 모바일 UX가 각각 정본 방향을 따른다.

## 6. 회사 Feature

### 화면

- `/companies`
- `/companies/:companyId`

### 빠른 등록 필드

- 회사명
- 카테고리/업종 optional
- initial Memo optional

### 상세 필드

- 회사명
- 위치
- 분야(산업)
- Memo 기록
- 태그
- 회사 로그
- 연결된 담당자
- 연결된 제품
- 연결된 딜
- 연결된 일정

### 작업 목록

- 회사 목록 table/list
- 검색과 필터
- 회사 빠른 등록 modal
- 회사 상세 page
- 회사 수정 form
- 회사 로그 CRUD
- 태그 연결
- 삭제와 휴지통 이동
- 복구 진입점

### 완료 기준

- 사용자가 회사를 빠르게 만들고 상세 정보를 보강할 수 있다.
- 회사 상세에서 담당자, 제품, 딜 맥락을 확인할 수 있다.

## 7. 담당자 Feature

### 화면

- `/contacts`
- `/contacts/:contactId`
- `/contacts/scan`

### 빠른 등록 필드

- 이름
- 회사 연결
- 전화번호 optional
- 부서/직책 optional

### 상세 필드

- 이름
- 회사
- 부서
- 직급
- 위치
- 전화번호
- 이메일
- 태그
- Log 기록
- Memo 기록
- 연결된 제품
- 연결된 딜
- 연결된 일정
- 연결된 회의록

### 작업 목록

- 담당자 목록
- 회사별 필터
- 담당자 빠른 등록 modal
- 회사 검색 combobox
- 회사가 없을 때 최소 회사 생성
- 담당자 상세 page
- 연락처/이메일 표시와 복사 버튼
- Log 기록 영역
- Log 기록 영역은 담당자 상세 API 응답이 아니라 `GET /api/contacts/:contactId/logs`를 별도 호출해 표시
- Memo 기록 영역
- Memo 민감 경고 UI
- 명함 OCR 진입점

### 완료 기준

- 담당자는 회사 아래 사람이라는 구조가 UI에서 명확하다.
- 회사 없이 저장하는 예외는 제공하지 않는다.

## 8. 제품 Feature

### 화면

- `/products`
- `/products/:productId`

### 빠른 등록 필드

- 제품명
- 카테고리 optional
- 단가 optional

### 상세 필드

- 제품명
- 분류
- 단가
- Log 기록
- Memo 기록
- 태그
- 연결된 회사
- 연결된 담당자
- 연결된 딜
- 연결 타입

### 작업 목록

- 제품 목록
- 제품 빠른 등록 modal
- 제품 상세 page
- 단가 입력과 KRW 표시
- 제품 연결 타입 표시
- 제품 연결 추가/해제 UI
- 제품 Log 기록 영역
- 제품 Log 기록 영역은 제품 상세 API 응답이 아니라 `GET /api/products/:productId/logs`를 별도 호출해 표시

### 완료 기준

- 제품은 회사/담당자/딜과 연결 가능하다.
- 연결 타입이 사용자가 이해할 수 있는 라벨로 보인다.

## 9. 딜 Feature

### 화면

- `/deals`
- `/deals/:dealId`
- 홈 우측 상세 패널

### 빠른 등록 필드

- 딜명
- 회사
- 담당자
- 제품
- 금액
- 단계
- 가능성
- 다음 행동 optional
- 마감/예상 종료일 optional

### 상세 정보

- 딜명
- 회사/담당자
- 제품/연결 정보
- 금액
- 단계
- 가능성
- 다음 행동
- 마감/예상 종료일
- 활동 로그
- 일정/회의록
- Memo 기록
- 태그

### 작업 목록

- 딜 목록
- 단계 탭
- 딜 필터: 단계, 금액, 가능성, 다음 행동, 마감일, 회사/담당자, 태그
- 딜 빠른 등록 modal
- 딜 상세에서 활동 로그와 Memo 기록 영역 분리
- 회사/담당자/제품 검색 combobox
- inline entity creation
- 딜 상세 page
- 우측 상세 패널
- 단계 변경 UI
- 가능성 선택 UI
- 숫자 퍼센트 고급 옵션
- 활동 로그 timeline
- 활동 로그 빠른 추가
- 다음 행동 완료/미루기/날짜 변경/일정 추가/활동 로그 추가

### 완료 기준

- 딜 금액은 필수다.
- 회사/담당자/제품은 자유 텍스트만으로 저장하지 않는다.
- 단계 변경은 자동 활동 로그로 보인다.
- 다음 행동은 목록과 상세에서 1급 정보로 보인다.

## 10. 일정 Feature

### 화면

- `/schedules`
- `/schedules/week`

### 기능

- 일정 CRUD
- 딜/회사/담당자 연결
- 일정 알림 설정
- Google Calendar형 월간 일정 캘린더 기본 화면
- 월간/주간 view mode 전환
- 주간 보기
- 주간 일정 보고서 PDF 다운로드
- 주간 일정 보고서 Excel 다운로드
- Google Calendar 가져오기 진입점

### 작업 목록

- 일정 목록
- Google Calendar형 월간 캘린더 UI
- 월간/주간 segmented control
- 주간 캘린더 UI
- 일정 생성/수정 form
- 딜/회사/담당자 검색 연결
- 알림 시간 설정 UI
- Google Calendar 연결 상태 UI
- 가져온 일정 표시
- PDF/Excel export 버튼

### 완료 기준

- 일정은 딜 없이도 저장할 수 있다.
- 딜에서 만든 일정은 회사/담당자 정보를 기본 상속한다.
- `/schedules`는 기본적으로 이번 달 일정을 보여준다.
- `/schedules`에서 월간/주간 보기 전환이 가능하다.
- 주간 보고서를 화면과 파일로 확인할 수 있다.

## 11. 회의록 Feature

### 화면

- `/meetings`
- `/meetings/new`
- `/meetings/:meetingNoteId`

### AI 결과 항목

- 날짜
- 회사
- 담당자
- 부서
- 품목(`productName`)
- 진행단계(`stageText`)
- 상세내용(`details`)
- 향후계획(`nextPlan`)
- 필요액션(`requiredAction`)

### 작업 목록

- 회의록 목록
- 텍스트 입력 화면
- AI 생성 요청 버튼
- 생성 중 상태
- AI 결과 수정 form
- 회사/담당자/딜 후보 선택 UI
- 딜 없이 저장
- 나중에 딜 연결
- 딜 연결 시 활동 로그 생성 결과 표시

### 완료 기준

- AI 결과는 사용자가 수정 후 저장한다.
- 회의록은 딜 없이 저장 가능하다.
- 딜 연결 시 딜 활동 로그에 반영된다.

## 12. 명함 OCR Feature

### 화면

- `/business-cards`
- `/contacts/scan`은 legacy redirect

### 작업 목록

- 이미지 업로드
- 파일 형식/크기 검증
- `명함등록 중` 진행 표시
- OCR 결과 확인/수정 form
- 상태 다중 필터와 `상태 초기화`
- 확정 저장 시 Backend가 기존 회사/담당자를 재사용하거나 없으면 생성
- 회사 없는 담당자 저장은 제공하지 않음

### 완료 기준

- OCR 결과는 자동 저장되지 않는다.
- 사용자가 확인한 결과만 회사/담당자로 저장된다.

## 13. Import/Export Feature

### Import 작업

- 대상 선택: 회사, 담당자, 제품, 딜
- Excel/CSV 업로드
- 업로드 후 preview table 표시
- AI 컬럼 매핑 결과 표시
- 매핑 수정 UI
- row별 validation error 표시
- 오류 row가 있으면 Import 확정 버튼 비활성화
- Import 확정
- 실행 실패 시 실패 row number와 error reason 표시

### Export 작업

- 대상 선택: 회사, 담당자, 제품, 딜, 일정, 회의록
- 형식 선택: PDF, Excel
- 민감 데이터 포함 여부 선택
- 민감 데이터 포함 경고
- 파일 다운로드

### 완료 기준

- Import는 사용자 확인 후 확정된다.
- 사용자는 확정 전에 preview table로 데이터 세팅과 오류 row를 확인할 수 있다.
- 확정 실행 중 오류가 발생하면 부분 저장 없이 실패 row 번호와 사유가 표시된다.
- Export 민감 데이터는 기본 제외다.

## 14. 통합검색 Feature

### 작업 목록

- 상단 검색 input
- 검색 결과 command palette 또는 search sheet
- entity type grouping
- 회사/담당자/제품/딜/일정/회의록 기본 검색
- 삭제 데이터 제외
- 검색어 2자 이상부터 실행
- type별 최대 5개 기본 표시
- Memo 원문과 회의록 원문 비노출
- 최근 항목과 진행 중 딜 우선 표시
- 상세 페이지 또는 상세 패널 이동
- 모바일 full-screen search sheet

### 완료 기준

- 한 키워드로 회사, 담당자, 제품, 딜, 일정, 회의록을 찾을 수 있다.

## 15. 휴지통 Feature

### 작업 목록

- 삭제된 회사/담당자/제품/딜/일정/회의록 목록
- 대상 유형 필터
- 복구
- 완전 삭제 예정일 표시
- 7일 전 알림 상태 표시
- 즉시 완전 삭제 버튼은 MVP 1차에서 표시하지 않음

### 완료 기준

- 삭제 후 30일 보관 정책이 UI에 반영된다.
- 휴지통 목록에서 `permanentDeleteAt` 기준 완전 삭제 예정일을 확인할 수 있다.
- 기존 상세 URL에서 `410 DeletedResource`를 받으면 삭제된 항목 안내와 휴지통/복구 CTA를 표시한다.
- 수정 중 `409 DeletedResource`를 받으면 저장을 막고 복구 후 수정하라는 안내를 표시한다.

## 16. 설정 Feature

### 작업 목록

- 프로필 정보
- 소셜 계정 연결 상태
- 소셜 계정 직접 연결/해제는 MVP 이후 후속 작업
- Google Calendar 연결
- 알림 기본값
- email 알림 on/off
- browser push 권한 요청
- browser push service worker 등록
- browser push subscription 등록/해제
- 민감정보 저장 경고 설정
- 로그아웃

### 완료 기준

- 사용자가 알림과 외부 연결 상태를 확인할 수 있다.
- browser push 권한 상태와 구독 상태를 확인하고 변경할 수 있다.

## 17. User Web E2E

### Smoke E2E

- 로그인 보호 라우트
- 회사 생성
- 담당자 생성
- 제품 생성
- 딜 생성
- 딜 단계 변경
- 일정 생성
- 회의록 저장

### Full E2E

- 명함 OCR 실제 연동 flow: 이미지 업로드, 진행 표시, 확인/수정, 확정 저장
- Import AI 매핑 실제 연동 flow
- Export flow
- 휴지통 복구
- 통합검색
- 딜 상세 일정/회의록 연결

### 완료 기준

- PR에서는 smoke E2E를 안정적으로 실행할 수 있다.
- PR smoke E2E는 외부 Provider를 stub/mock으로 처리할 수 있고, 별도 provider smoke에서 실제 OpenAI/OCR/Google Calendar/SMTP/Web Push VAPID 연동을 확인한다.

## 18. 관련 문서

- `TODO/DONE/MVP-STARTER_PLAN/COMMON/USER-FLOW.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/README.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/README.md`
- `TODO/DONE/MVP-STARTER_PLAN/FE-TODO/README.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`

