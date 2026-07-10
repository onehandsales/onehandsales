# G00 질문 처리 기록

## 1. 목적

이 문서는 `MVP-STARTER_PLAN`의 G00 구현 전 결정 과정에서 새 미확정 질문과 확정된 질문 이력을 함께 기록한다.

현재 새 미확정 질문은 없다. 아래 `질문 처리 기록`의 선택지는 과거 검토 이력이며, 현재 구현 정본은 `TODO/DONE/MVP-STARTER_PLAN/COMMON/G00-DECISIONS.md`를 따른다.

새 미확정 질문이 생기면 대화로 바로 이어서 묻지 않고, 이후 작업을 재개할 때 이 문서를 기준으로 하나씩 결정한다.

질문은 반드시 다음 형식으로 검토한다.

- 질문의 의미
- 왜 지금 결정해야 하는지
- 선택지
- 예시
- 추천안
- 선택 시 문서에 반영할 위치

## 2. 이미 확정된 결정

현재까지 확정된 결정은 `TODO/DONE/MVP-STARTER_PLAN/COMMON/G00-DECISIONS.md`를 정본으로 따른다.

요약:

- package manager는 `pnpm`을 사용한다.
- Node.js는 `Node.js 24 LTS`를 사용한다.
- local DB는 `Docker PostgreSQL`을 사용한다.
- PostgreSQL Docker image는 `postgres:17-alpine`을 사용한다.
- local 개발 DB는 `sales_b2c_dev`, 테스트 DB는 `sales_b2c_test`를 사용한다.
- Supabase Cloud는 MVP 1차에서 `Auth`, `PostgreSQL`, 파일 저장소 adapter에 사용한다.
- managed business DB는 Supabase Cloud PostgreSQL이고, NestJS Backend가 Prisma로 직접 접속해 application layer에서 transaction을 관리한다.
- local/integration/E2E test DB는 재현성과 안전한 reset을 위해 Docker PostgreSQL을 사용할 수 있다.
- 인증 방식은 `Supabase Auth 외부 Provider + Backend token exchange + Backend 발급 App Bearer Token + local User/AuthDevice/AuthSession`으로 간다.
- FE는 Supabase access token을 `POST /api/auth/exchange`에만 전달한다.
- FE는 business API와 Admin API 요청에 `Authorization: Bearer <app_access_token>` header를 붙인다.
- Backend는 App access token을 검증해 current user context를 만든다.
- Backend는 Supabase access token 원문, Supabase refresh token, App access token 원문, refresh token 원문을 DB에 저장하지 않는다.
- Backend는 `AuthSession`을 만들고 refresh/session token은 hash만 저장한다.
- 로그인 유지 정책은 `7일 sliding session`으로 간다.
- application-level encryption은 `PersonalMemo.content`, `MeetingNote.rawText`, `BrowserPushSubscription.endpoint/p256dh/auth`부터 적용한다.
- Import는 preview 검증 후 확정 실행하고, 확정 실행 중 오류가 있으면 전체 rollback한다.
- Google Calendar, OCR, OpenAI, Notification email/browser push는 MVP 기능에서 처음부터 실제 provider로 연동한다.
- local/preview는 분리 domain을 허용하고, production은 같은 parent domain 아래의 `app`, `admin`, `api` subdomain으로 고정한다.
- 모든 영속 삭제 대상 리소스는 soft delete하고 30일 휴지통 보관 후 시스템이 자동 완전 삭제한다.
- `Company`, `Contact`, `Product`, `Deal`의 Log는 객관 기록, Memo는 주관 기록으로 분리한다.
- Memo는 `PersonalMemo` 기록 테이블에 암호화 저장하고, Admin 기본 화면은 원문 대신 요약/존재 여부만 반환한다.
- Admin 민감 원문 조회는 사유 필수 전용 API와 `AuditLog` transaction으로 처리한다.
- 일정 목록/캘린더의 기본 조회 기간은 사용자 timezone 기준 이번 달이며, User Web은 월간/주간 view mode 전환을 제공한다.
- 통합검색은 회사/담당자/제품/딜/일정/회의록을 기본 검색 대상으로 한다.

## 3. 완료된 문서 정합성 작업

App Bearer Token 방식 확정에 따라 인증 문서 정합성 작업은 완료했다.

정리된 방향:

- 로그인 provider 이동과 callback 처리는 User Web/Admin Web의 Supabase Auth client가 수행한다.
- 로그인 성공 후 FE는 `POST /api/auth/exchange`를 호출해 local `User`, `UserOAuthAccount`, `UserSetting`, `AuthDevice`, `AuthSession`을 생성하거나 갱신하고 Backend App token을 발급받는다.
- 인증된 Backend API는 `Authorization: Bearer <app_access_token>` header를 요구한다.
- Backend `AuthGuard`는 Backend가 발급한 App access token을 검증하고 current user context를 만든다.
- Supabase token 검증은 `ExternalAuthVerifier` port 뒤에 두고 token exchange 단계에서만 사용한다.
- cookie 기반 CSRF token은 MVP 1차 필수 요구사항으로 두지 않는다.
- CORS 허용 origin은 User Web/Admin Web 배포 origin으로 제한한다.

반영 대상:

- `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G01-G05-FOUNDATION-AUTH-API.md`
- `TODO/DONE/MVP-STARTER_PLAN/BE-TODO/API-TODO.md`
- `TODO/DONE/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`
- `TODO/DONE/MVP-STARTER_PLAN/FE-TODO/USER-WEB-TODO.md`
- `TODO/DONE/MVP-STARTER_PLAN/FE-TODO/ADMIN-WEB-TODO.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/USER-FLOW.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/PLANNING-REVIEW.md`

현재 새 미확정 질문은 없다.

## 4. 질문 처리 기록

아래 항목은 모두 확정 완료된 과거 질문 이력이다. 각 항목의 `선택지`는 당시 검토 후보이며 현재 미확정 선택지가 아니다.

### 확정 완료. Q01. App Bearer Token session 만료 시간과 갱신 정책

확정:

- Backend가 발급한 `App Bearer Token` 방식을 사용한다.
- Supabase access token은 token exchange에만 사용하고 business API 인증에는 사용하지 않는다.
- 로그인 유지 정책은 `7일 sliding session`으로 간다.
- Backend는 local `AuthSession`을 만들고 App access token/session을 검증한다.
- 세부 반영 위치는 `TODO/DONE/MVP-STARTER_PLAN/COMMON/G00-DECISIONS.md`의 D07, D08, D10이다.

### 확정 완료. Q02. App Bearer Token 저장, 갱신, 401 처리 정책

확정:

- App access token은 FE memory에만 저장한다.
- refresh token은 httpOnly refresh cookie로 보관한다.
- DB에는 refresh token 원문이 아니라 `AuthSession.refreshTokenHash`만 저장한다.
- refresh cookie는 `SameSite=Lax`를 사용한다.
- `POST /api/auth/refresh`는 Origin 검증을 통과해야 한다.
- API client가 401을 받으면 refresh를 1회 시도하고, 성공하면 원래 요청을 1회 재시도한다.
- refresh 실패 시 FE는 App access token을 제거하고 로그인 화면으로 이동한다.

기존 검토 내용:

질문의 의미:

- App Bearer Token 방식에서는 FE가 Backend가 발급한 access token을 Backend API에 전달한다.
- 따라서 App access token과 refresh 수단을 어디에 보관할지, 새로고침 후 로그인 유지가 가능한지, access token 만료 시 어떻게 refresh할지 정해야 한다.

왜 지금 결정해야 하는가:

- User Web/Admin Web의 API client interceptor, route guard, 401 처리, refresh API, `AuthSession` schema, E2E mock 방식이 모두 달라진다.
- token 저장 방식은 XSS 리스크와 사용자 편의성에 직접 영향을 준다.
- Supabase Auth를 나중에 걷어내도 유지할 인증 구조를 지금 결정해야 한다.

선택지:

- A. App access token은 memory에 두고, refresh token은 httpOnly refresh cookie + `AuthSession` hash로 관리한다. API 인증은 계속 Bearer Token을 사용하고, refresh endpoint에는 `SameSite=Lax`와 Origin 검증을 적용한다.
- B. App access token과 refresh token을 FE storage에 보관하고, API 요청마다 Bearer header로 전달한다.
- C. App access token은 memory에만 두고, 새로고침하면 Supabase session으로 다시 exchange한다.

예시:

- A를 선택하면 business API는 Bearer Token으로 유지하면서 refresh token은 JavaScript에서 직접 읽지 못하게 할 수 있다. 자체 Auth로 이전할 때도 구조를 유지하기 쉽다. 단, refresh endpoint에는 cookie 자동 전송에 대한 방어가 필요하다.
- B를 선택하면 순수 Bearer 방식이라 구현은 단순하지만 XSS 발생 시 refresh token까지 노출될 수 있다.
- C를 선택하면 Backend refresh 구현은 가볍지만 새로고침/session 복원이 Supabase session에 계속 의존한다.

추천안:

- A. App access token memory + httpOnly refresh cookie + `AuthSession` hash

문서 반영 위치:

- `TODO/DONE/MVP-STARTER_PLAN/COMMON/G00-DECISIONS.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G01-G05-FOUNDATION-AUTH-API.md`
- `TODO/DONE/MVP-STARTER_PLAN/FE-TODO/USER-WEB-TODO.md`
- `TODO/DONE/MVP-STARTER_PLAN/FE-TODO/ADMIN-WEB-TODO.md`

### 확정 완료. Q03. OAuth provider 초기 구현 순서

확정:

- MVP 초기 실제 로그인 provider는 `Kakao`, `Google`로 간다.
- `Apple` 로그인은 Web MVP 초기 범위에서 제외한다.
- `Apple` 로그인은 iOS 앱을 만들 때 후속으로 구현한다.
- Apple 버튼을 노출한다면 disabled 또는 준비 중 상태로 둔다.

기존 검토 내용:

질문의 의미:

- 문서에는 Kakao, Google, Apple을 후보로 둔다.
- 하지만 초기 구현에서 4개 provider를 한 번에 붙일지, 일부만 먼저 붙일지 결정해야 한다.

왜 지금 결정해야 하는가:

- Supabase Auth 설정, callback 테스트, 로그인 버튼 상태, E2E mock 범위가 달라진다.

선택지:

- A. Kakao + Google을 먼저 구현하고 Apple은 iOS 앱 단계로 미룬다.
- B. Kakao, Google, Apple을 G05에서 모두 구현한다.
- C. Google만 먼저 구현하고 나머지는 버튼 disabled 상태로 둔다.

예시:

- A를 선택하면 국내 사용자 기준 Kakao와 개발/테스트가 쉬운 Google을 먼저 검증할 수 있다.
- B를 선택하면 기획 완성도는 높지만 초기 인증 작업량이 커진다.
- C를 선택하면 가장 빠르지만 실제 한국 사용자 로그인 검증이 늦어진다.

추천안:

- A. Kakao + Google 먼저 구현, Apple은 iOS 앱 단계 후속 구현

문서 반영 위치:

- `TODO/DONE/MVP-STARTER_PLAN/COMMON/G00-DECISIONS.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G01-G05-FOUNDATION-AUTH-API.md`
- `TODO/DONE/MVP-STARTER_PLAN/FE-TODO/USER-WEB-TODO.md`
- `TODO/DONE/MVP-STARTER_PLAN/FE-TODO/ADMIN-WEB-TODO.md`

### 확정 완료. Q04. 같은 이메일의 다른 provider 계정 처리 방식

확정:

- 같은 이메일이라도 provider account id가 다르면 자동 연결하지 않는다.
- provider account id 기준으로 local `User`를 찾는다.
- provider 매핑이 없으면 같은 이메일의 기존 local `User`가 있어도 새 local `User`를 만든다.
- 사용자가 직접 여러 provider를 묶는 계정 연결 기능은 후속 작업으로 분리한다.

기존 검토 내용:

질문의 의미:

- 사용자가 Kakao, Google에서 같은 이메일을 사용할 수 있다.
- 이때 같은 local `User`로 묶을지, provider별로 다른 사용자로 볼지 결정해야 한다.

왜 지금 결정해야 하는가:

- `UserOAuthAccount` 생성 로직, account linking 정책, 중복 계정 대응 방식이 달라진다.

선택지:

- A. 같은 이메일이면 같은 local User로 자동 연결한다.
- B. provider account id가 다르면 자동 연결하지 않는다.
- C. MVP에서는 첫 provider만 허용하고 추가 연결은 설정 화면에서 나중에 처리한다.

예시:

- A를 선택하면 사용자는 provider를 바꿔도 같은 계정으로 들어오기 쉽다. 다만 이메일 검증 신뢰도가 낮은 provider가 있으면 계정 연결 위험이 생긴다.
- B를 선택하면 보안적으로 보수적이지만 같은 사람이 중복 계정을 만들 수 있다.
- C를 선택하면 MVP 구현은 명확하지만 계정 연결 UX를 나중에 별도로 만들어야 한다.

추천안:

- B. provider account id 기준으로 보수적으로 처리하고, 계정 연결은 MVP 이후로 분리

문서 반영 위치:

- `TODO/DONE/MVP-STARTER_PLAN/COMMON/G00-DECISIONS.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G01-G05-FOUNDATION-AUTH-API.md`
- `TODO/DONE/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`

### 확정 완료. Q05. 초기 Admin 계정 생성 방식

확정:

- `.env`의 `INITIAL_ADMIN_EMAILS` 값과 일치하는 사용자를 첫 로그인 또는 token exchange 시 Admin으로 승격한다.
- `INITIAL_ADMIN_EMAILS`는 comma-separated email 목록으로 관리한다.
- email 비교는 trim/lowercase normalize 후 수행한다.
- 이미 승격된 Admin은 env 값 제거만으로 자동 강등하지 않는다.

기존 검토 내용:

질문의 의미:

- Admin Web에 접근하려면 local `User.role = ADMIN`인 계정이 필요하다.
- 첫 Admin을 어떻게 만들지 결정해야 한다.

왜 지금 결정해야 하는가:

- seed, env, 운영자 로그인 테스트, AdminGuard E2E 기준이 달라진다.

선택지:

- A. `.env`의 `INITIAL_ADMIN_EMAILS` 값과 일치하는 사용자를 첫 로그인 시 Admin으로 승격한다.
- B. seed script에서 특정 email을 Admin으로 만든다.
- C. DB에서 수동으로 role을 바꾼다.

예시:

- A를 선택하면 개발/초기 운영에서 Admin 계정 생성이 빠르고 재현 가능하다.
- B를 선택하면 seed 실행 흐름이 명확하지만 Supabase user 생성 시점과 맞춰야 한다.
- C를 선택하면 구현은 적지만 실수 위험이 크고 재현성이 낮다.

추천안:

- A. `INITIAL_ADMIN_EMAILS` 기반 첫 로그인 승격

문서 반영 위치:

- `TODO/DONE/MVP-STARTER_PLAN/COMMON/G00-DECISIONS.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G01-G05-FOUNDATION-AUTH-API.md`
- `TODO/DONE/MVP-STARTER_PLAN/BE-TODO/API-TODO.md`

### 확정 완료. Q06. 동시에 허용할 로그인 session 수

확정:

- 사용자별 active 등록 기기 `AuthDevice`는 최대 3개까지 허용한다.
- 슬롯은 `MOBILE`, `PERSONAL_LAPTOP`, `WORK_LAPTOP`이다.
- 각 슬롯별 active `AuthDevice`는 1개만 허용한다.
- 같은 `AuthDevice` 안에서는 여러 active `AuthSession`을 허용한다.
- 같은 등록 기기에서 새 로그인하거나 여러 탭/session을 사용해도 기존 session을 강제로 revoke하지 않는다.
- 이미 다른 기기가 등록된 슬롯으로 로그인하면 Backend는 `DeviceSlotAlreadyRegistered`를 반환하고, 사용자가 교체를 확인한 경우에만 기존 `AuthDevice`와 그 하위 active `AuthSession`을 폐기한다.
- token exchange 요청에는 `deviceSlot`, `deviceId`, 선택적 `deviceLabel`, 선택적 `replaceExistingDevice`를 포함한다.
- Admin 강제 logout은 MVP 이후 운영 기능으로 분리한다.

기존 검토 내용:

질문의 의미:

- 사용자가 여러 브라우저나 기기에서 동시에 Backend `AuthSession`을 유지할 수 있게 할지 결정해야 한다.

왜 지금 결정해야 하는가:

- `AuthSession` 생성 정책, logout 범위, 보안 이벤트 대응 방식, Admin 강제 logout 기능 범위가 달라진다.

선택지:

- A. 여러 session을 허용한다.
- B. 사용자당 하나의 active session만 허용한다.
- C. 여러 session을 허용하되 Admin에서 강제 logout 기능을 나중에 만든다.

예시:

- A를 선택하면 PC와 모바일을 동시에 쓰기 편하다.
- B를 선택하면 보안은 단순하지만 사용자가 다른 기기에서 로그인할 때 기존 session이 끊긴다.
- C를 선택하면 MVP에서는 편의성을 유지하고, 운영 관리 기능은 이후로 뺄 수 있다.

추천안:

- C. 여러 session 허용 + 강제 logout은 이후 작업

문서 반영 위치:

- `TODO/DONE/MVP-STARTER_PLAN/COMMON/G00-DECISIONS.md`
- `TODO/DONE/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`

### 확정 완료. Q07. 파일 저장소 1차 전략

확정:

- MVP 1차 파일 저장소는 `Supabase Storage adapter`로 시작한다.
- Backend는 `StoragePort`를 정의하고 application/domain 계층은 `StoragePort`에만 의존한다.
- 나중에 서비스 규모가 커지면 `StoragePort` 구현체를 `AwsS3StorageAdapter`로 교체할 수 있게 만든다.
- 명함 OCR 이미지, Import 원본 파일, Export 생성 파일은 같은 파일 저장소 port를 사용한다.
- FE는 MVP 1차에서 파일을 Backend API로 업로드하고, Backend가 검증 후 Supabase Storage에 저장한다.
- DB에는 Supabase public URL을 정본으로 저장하지 않고 `storageProvider`, `bucket`, `objectKey`, `contentType`, `sizeBytes`, `fileName` 같은 중립 metadata를 저장한다.
- 다운로드/조회 시 Backend가 `StoragePort`를 통해 stream 또는 짧은 만료 시간의 signed URL을 만든다.

기존 검토 내용:

질문의 의미:

- Supabase Storage는 처음에 제외 후보였지만, 명함 OCR 이미지, Export 파일, Import 파일은 저장 위치가 필요하다.

왜 지금 결정해야 하는가:

- 파일 upload API, 파일 URL, local 개발 환경, 운영 이전 전략이 달라진다.

선택지:

- A. local filesystem adapter로 시작하고 storage port를 분리한다.
- B. Cloudflare R2 또는 S3 호환 storage를 처음부터 사용한다.
- C. Supabase Storage를 파일 저장에만 예외적으로 사용한다.

예시:

- A를 선택하면 개발 속도가 빠르고 Clean Architecture의 storage port를 먼저 만들 수 있다. 운영 전에는 R2/S3 adapter로 교체해야 한다.
- B를 선택하면 운영 전환이 쉽지만 초기 계정/버킷/CORS 설정 작업이 늘어난다.
- C를 선택하면 Supabase 생태계를 활용할 수 있지만 MVP 1차에서 Supabase 사용 범위가 다시 넓어진다.

추천안:

- C 변형. Supabase Storage adapter + `StoragePort` + AWS S3 후속 이전 가능 구조

문서 반영 위치:

- `TODO/DONE/MVP-STARTER_PLAN/COMMON/G00-DECISIONS.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-WORKFLOW-AUTOMATION-API.md`
- `TODO/DONE/MVP-STARTER_PLAN/BE-TODO/API-TODO.md`

### 확정 완료. Q08. 민감정보 암호화 적용 범위

확정:

- MVP 1차 application-level encryption 대상은 `PersonalMemo.content`, `MeetingNote.rawText`, `BrowserPushSubscription.endpoint/p256dh/auth`이다.
- 전화번호, 이메일, 명함 OCR 결과, 회의록 구조화 요약 필드는 MVP 1차 암호화 대상에서 제외한다.
- 암호화 제외 민감 후보 필드도 Admin 목록/상세에서는 기본 마스킹 또는 존재 여부만 반환한다.
- Backend는 `EncryptionPort`를 정의하고 application/domain 계층은 구체 암호화 library에 직접 의존하지 않는다.
- DB에는 Memo 원문, 회의록 원문, browser push subscription endpoint/key를 평문으로 저장하지 않고 ciphertext와 key version을 저장한다.
- Admin 민감정보 원문 조회 API는 사유 검증과 `AuditLog` 기록을 통과한 뒤 복호화한 값을 반환한다.
- key rotation은 key version 필드로 확장 가능하게 두고 실제 운영은 MVP 이후 별도 작업으로 분리한다.

기존 검토 내용:

질문의 의미:

- Memo 원문, 회의록 원문, 전화번호, 이메일, 명함 OCR 결과 같은 데이터는 민감정보 가능성이 있다.
- 어떤 필드를 application layer에서 암호화할지 결정해야 한다.

왜 지금 결정해야 하는가:

- Prisma schema만으로는 암호화 정책이 보장되지 않는다.
- domain/application/infrastructure layer에서 encryption adapter와 redaction policy가 필요하다.

선택지:

- A. Memo 원문과 회의록 원문부터 application-level encryption 적용
- B. 전화번호, 이메일, OCR 결과까지 MVP 1차부터 암호화
- C. MVP 1차는 masking/audit만 적용하고 암호화는 이후 작업

예시:

- A를 선택하면 가장 민감한 사용자 입력부터 보호하면서 구현량을 통제할 수 있다.
- B를 선택하면 보호 수준은 높지만 검색, 정렬, 중복 검사가 복잡해진다.
- C를 선택하면 빠르지만 Admin 원문 조회와 데이터 유출 리스크가 커진다.

추천안:

- A. Memo 원문과 회의록 원문부터 적용

문서 반영 위치:

- `TODO/DONE/MVP-STARTER_PLAN/COMMON/G00-DECISIONS.md`
- `TODO/DONE/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G30-G32-ADMIN-AUDIT-API.md`

### 확정 완료. Q09. Import 미리보기와 확정 실행 rollback 정책

확정:

- Excel/CSV bulk import는 업로드 즉시 DB에 반영하지 않는다.
- 파일 업로드 후 Backend가 parsing, mapping preview, row별 validation을 수행한다.
- User Web은 확정 실행 전에 preview table로 데이터 세팅 상태와 오류 row를 보여준다.
- preview에 오류 row가 있으면 확정 실행을 막는다.
- 사용자가 preview와 mapping을 확인한 뒤에만 Import를 확정 실행한다.
- 확정 실행은 all-or-nothing transaction으로 처리한다.
- 실행 중 한 row라도 실패하면 해당 Import로 생성/수정하려던 도메인 데이터는 전체 rollback한다.
- 실행 실패 시 실패한 row number와 error reason을 보여준다.
- 성공 row만 부분 저장하는 정책은 MVP 1차에서 사용하지 않는다.

기존 검토 내용:

질문의 의미:

- Import 중 일부 row는 성공하고 일부 row는 실패할 수 있다.
- 전체를 실패로 볼지, 성공 row는 저장하고 실패 row만 따로 보여줄지 결정해야 한다.

왜 지금 결정해야 하는가:

- `ImportJob`, `ImportJobRow`, response shape, UI 결과 화면이 달라진다.

선택지:

- A. row 단위 부분 성공 허용
- B. 하나라도 실패하면 전체 rollback
- C. 사용자 확인 단계에서는 실패 row를 제외하고 확정 실행

예시:

- A를 선택하면 100개 중 95개 성공, 5개 실패 같은 현실적인 import 결과를 제공할 수 있다.
- B를 선택하면 데이터 정합성은 단순하지만 사용자가 작은 오류 하나 때문에 전체를 다시 올려야 한다.
- C를 선택하면 사용자가 확정 전에 실패 row를 정리할 수 있지만 화면 구현이 더 필요하다.

추천안:

- 사용자 결정: preview/validation 후 확정 실행, 실행 중 오류 발생 시 전체 rollback

문서 반영 위치:

- `TODO/DONE/MVP-STARTER_PLAN/COMMON/G00-DECISIONS.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-WORKFLOW-AUTOMATION-API.md`
- `TODO/DONE/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`

### 확정 완료. Q10. 외부 연동 실제 호출 범위

확정 내용:

- MVP 기능 구현은 Google Calendar, OCR, OpenAI를 처음부터 실제 provider로 연동한다.
- 후속 확정으로 Notification email/browser push도 MVP 1차에서 실제 provider로 연동한다.
- Google Calendar는 실제 OAuth 연결과 Calendar event 조회를 구현한다.
- 명함 OCR, AI 회의록 생성, Import AI 컬럼 매핑은 실제 OpenAI/OCR provider 호출을 사용한다.
- port/interface 경계는 유지한다.
- mock/stub adapter는 제품 기본 동작이 아니라 자동 테스트, 로컬 실패 재현, provider 장애 대체 검증 용도로만 둔다.

기존 검토 내용:

질문의 의미:

- Google Calendar, OCR, OpenAI 같은 외부 연동을 처음부터 실제 연동할지, adapter와 mock을 먼저 만들지 결정해야 한다.

왜 지금 결정해야 하는가:

- 개발 속도, 테스트 안정성, 비용, API key 관리 방식이 달라진다.

선택지:

- A. adapter interface와 mock을 먼저 만들고, 실제 provider는 goal 후반에 연결한다.
- B. 처음부터 실제 Google Calendar, OCR, OpenAI를 연결한다.
- C. OpenAI만 실제 연결하고 Google Calendar/OCR은 mock으로 둔다.

예시:

- A를 선택하면 핵심 도메인과 UI를 빠르게 완성하고, 외부 API 불안정성 없이 테스트할 수 있다.
- B를 선택하면 실제 동작을 빨리 검증하지만 API key, quota, provider 장애 영향을 바로 받는다.
- C를 선택하면 AI 회의록의 핵심 가치는 빨리 검증하고 나머지 자동화는 뒤로 미룰 수 있다.

사용자 결정:

- B. 처음부터 실제 Google Calendar, OCR, OpenAI를 연결한다.

문서 반영 위치:

- `TODO/DONE/MVP-STARTER_PLAN/COMMON/G00-DECISIONS.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P4-G21-G29-AUTOMATION.md`
- `TODO/DONE/MVP-STARTER_PLAN/BE-TODO/API-TODO.md`

### 확정 완료. Q11. FE/BE 배포 도메인 전략

확정 내용:

- local과 preview 환경은 배포 서비스별 임시 domain을 허용한다.
- production은 같은 parent domain 아래로 고정한다.
- production 예시는 `https://app.salesb2c.com`, `https://admin.salesb2c.com`, `https://api.salesb2c.com`이다.
- production CORS 허용 origin은 User Web/Admin Web production origin으로 제한한다.
- local/preview CORS 허용 origin은 환경 변수로 명시한 origin만 허용한다.
- Supabase Auth redirect URL은 local, preview, production의 User Web/Admin Web callback URL을 환경별로 등록한다.
- business API 인증은 계속 App Bearer Token 기준이며, refresh cookie는 auth refresh 용도로만 사용한다.

기존 검토 내용:

질문의 의미:

- App Bearer Token 인증에서도 FE, Admin, BE, Supabase callback URL의 배포 도메인 기준을 정해야 한다.

왜 지금 결정해야 하는가:

- CORS 허용 origin, Supabase redirect URL, API base URL, preview 환경 설정, 운영 reverse proxy 구성이 달라진다.

선택지:

- A. 같은 site 아래에 배포한다. 예: `app.example.com`, `admin.example.com`, `api.example.com`
- B. FE와 BE를 완전히 다른 domain에 배포한다.
- C. MVP local과 preview는 분리 도메인을 허용하되 운영은 같은 parent domain으로 고정한다.

예시:

- A를 선택하면 CORS와 Supabase redirect URL 관리가 비교적 단순하다.
- B를 선택하면 CORS와 Supabase redirect URL을 서비스별로 엄격히 관리해야 한다.
- C를 선택하면 개발/preview 유연성과 운영 안정성을 둘 다 고려할 수 있다.

사용자 결정:

- C. preview는 유연하게, 운영은 같은 parent domain 기준

문서 반영 위치:

- `TODO/DONE/MVP-STARTER_PLAN/COMMON/G00-DECISIONS.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G01-G05-FOUNDATION-AUTH-API.md`
- `TODO/DONE/MVP-STARTER_PLAN/FE-TODO/USER-WEB-TODO.md`
- `TODO/DONE/MVP-STARTER_PLAN/FE-TODO/ADMIN-WEB-TODO.md`

### 확정 완료. Q12. 삭제된 리소스 조회/수정 응답 정책

확정 내용:

- soft delete된 리소스는 일반 목록 API에서 기본 제외한다.
- 소유자가 기존 상세 URL로 soft delete된 리소스를 조회하면 `410 DeletedResource`를 반환한다.
- soft delete된 리소스에 대한 수정, 단계 변경, 다음 행동 변경, 연결 변경, 재삭제 같은 일반 변경 요청은 `409 DeletedResource`로 막는다.
- 복구는 일반 수정 API가 아니라 restore API 또는 휴지통 restore API로만 처리한다.
- 일반 상세 API에서 `includeDeleted=true`로 삭제 리소스를 직접 반환하는 정책은 MVP 1차에서 사용하지 않는다.

기존 검토 내용:

질문의 의미:

- 회사, 담당자, 제품, 딜, 일정, 회의록 같은 리소스가 soft delete된 뒤 사용자가 기존 URL로 상세 조회하거나 수정 API를 호출했을 때 어떤 응답을 줄지 정해야 한다.

왜 지금 결정해야 하는가:

- FE 상세 화면의 에러 처리, 휴지통 복구 UX, Backend 공통 error, API status code가 달라진다.
- 삭제된 데이터가 일반 목록/상세에서 보이면 사용자가 혼란스러울 수 있고, 반대로 무조건 404로 숨기면 복구 안내가 어렵다.

선택지:

- A. 일반 API에서는 삭제된 리소스를 `404 NotFound`처럼 숨긴다.
- B. 소유자가 기존 URL로 조회하면 `410 DeletedResource`를 반환하고, 수정/삭제 같은 변경 요청은 `409 DeletedResource`로 막는다.
- C. `includeDeleted=true`가 있을 때만 일반 상세 API에서도 삭제된 리소스를 조회하게 한다.

예시:

- A를 선택하면 구현과 보안 처리가 단순하지만, 사용자가 북마크나 알림 링크로 들어왔을 때 왜 안 보이는지 알기 어렵다.
- B를 선택하면 사용자는 "삭제된 항목이며 휴지통에서 복구할 수 있음"을 알 수 있고, 수정은 명확히 차단된다.
- C를 선택하면 유연하지만 모든 상세 API와 FE route가 `includeDeleted` 분기를 가져야 한다.

사용자 결정:

- B. 삭제 상태를 명확히 알려주되, 일반 수정은 막고 복구는 휴지통/restore API로만 처리

문서 반영 위치:

- `TODO/DONE/MVP-STARTER_PLAN/COMMON/G00-DECISIONS.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/*-ENDPOINT-CONTRACT.md`
- `TODO/DONE/MVP-STARTER_PLAN/BE-TODO/API-TODO.md`
- `TODO/DONE/MVP-STARTER_PLAN/FE-TODO/USER-WEB-TODO.md`

### 확정 완료. Q13. soft delete 보관 기간, restore, hard delete 정책

확정:

- 사용자 또는 Admin이 삭제 API로 지우는 영속 삭제 대상 리소스는 soft delete한다.
- 삭제 시 `deletedAt`을 기록하고, `permanentDeleteAt`은 `deletedAt + 30일`로 기록한다.
- 삭제된 리소스는 30일 동안 휴지통에 보관한다.
- 30일이 지나면 시스템 자동 작업이 해당 리소스를 완전 삭제한다.
- MVP 1차에서 사용자가 직접 즉시 완전 삭제하는 API와 UI는 제공하지 않는다.
- 복구는 `permanentDeleteAt` 이전에만 가능하다.

질문의 의미:

- 삭제된 데이터를 휴지통에 얼마나 보관할지, 사용자가 직접 완전 삭제할 수 있는지, 30일 후 자동 완전 삭제를 할지 정해야 한다.

왜 지금 결정해야 하는가:

- DB의 `deletedAt`, `permanentDeleteAt`, 휴지통 화면, restore API, 완전 삭제 API, 배치 작업 기준이 달라진다.

선택지:

- A. 30일 보관 후 자동 완전 삭제, 사용자는 즉시 완전 삭제 불가
- B. 30일 보관 후 자동 완전 삭제, 사용자는 확인 dialog 후 즉시 완전 삭제 가능
- C. MVP에서는 완전 삭제를 하지 않고 soft delete와 restore만 제공

예시:

- A를 선택하면 실수 삭제 복구가 가능하고 위험한 즉시 삭제 UX를 줄일 수 있다.
- B를 선택하면 사용자가 민감 데이터를 즉시 지울 수 있지만, 실수로 영구 삭제할 위험이 커진다.
- C를 선택하면 구현은 단순하지만 오래된 삭제 데이터가 계속 쌓인다.

추천안:

- A. 30일 보관 후 자동 완전 삭제, MVP 1차에서는 사용자 즉시 완전 삭제 제외

문서 반영 위치:

- `TODO/DONE/MVP-STARTER_PLAN/COMMON/G00-DECISIONS.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-ENDPOINT-CONTRACT.md`
- `TODO/DONE/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`
- `TODO/DONE/MVP-STARTER_PLAN/BE-TODO/API-TODO.md`
- `TODO/DONE/MVP-STARTER_PLAN/FE-TODO/USER-WEB-TODO.md`

### 확정 완료. Q14. 도메인별 Memo 기록과 민감정보 저장 위치

확정:

- `Company`, `Contact`, `Product`, `Deal`은 각각 Log 기록과 Memo 기록을 가질 수 있다.
- Log는 대상 도메인에 대한 객관적 사실, 변경, 만남, 소식, 이력 기록이다.
- Memo는 대상 도메인에 대한 사용자의 주관적 생각, 판단, 개인 참고 기록이다.
- Memo는 각 엔티티의 단일 `memo` 필드에 저장하지 않고 Log처럼 여러 건 누적되는 기록형 데이터로 저장한다.
- `PersonalMemo`는 회사 Memo, 담당자 Memo, 제품 Memo, 딜 Memo를 담는 기록 테이블로 사용한다.
- `PersonalMemo`는 `targetType`, `targetId`, `memoDate`, 선택적 `title`, `contentCiphertext`, `contentKeyVersion`을 가진다.
- Admin 목록/상세에서는 Memo 원문을 반환하지 않고 `hasMemo`, `memoCount`, `latestMemoAt` 같은 요약 또는 존재 여부만 반환한다.
- Admin 원문 조회는 사유 입력과 `AuditLog` 기록을 거친 별도 민감정보 원문 조회 API에서만 허용한다.

질문의 의미:

- 도메인 정보에 대한 객관적 기록(Log)과 사용자의 주관적 생각(Memo)을 어떻게 구분하고 저장할지 결정해야 한다.

왜 지금 결정해야 하는가:

- Company/Contact/Product/Deal detail 화면, Log/Memo API, `PersonalMemo` schema, encryption 적용 위치, Admin masking, 원문 조회 transaction 기준이 달라진다.

선택지:

- A. Log와 Memo를 분리하고, Memo는 도메인별 기록 테이블 `PersonalMemo`에 암호화 저장한다.
- B. Log와 Memo를 같은 timeline 테이블에 두고 type만 구분한다.
- C. MVP에서는 각 엔티티의 단일 `memo` 필드만 사용한다.

예시:

- A를 선택하면 회사 소식 변경은 `CompanyLog`에 객관 기록으로 남기고, 그 소식에 대한 내 판단은 `PersonalMemo(targetType=COMPANY)`에 주관 기록으로 남긴다.
- B를 선택하면 timeline UI는 단순하지만 객관 기록과 주관 기록의 권한, 마스킹, 검색 기준이 섞인다.
- C를 선택하면 구현은 단순하지만 시간순 기록이 어렵고, Log와 Memo 의미가 섞인다.

사용자 결정:

- A. Log는 객관 기록, Memo는 주관 기록으로 분리하고, Memo는 `PersonalMemo`에 암호화 저장한다.

문서 반영 위치:

- `TODO/DONE/MVP-STARTER_PLAN/COMMON/G00-DECISIONS.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G06-G12-ENDPOINT-CONTRACT.md`
- `TODO/DONE/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`
- `AGENT/PM_AGENT/PLANNING/DATA_MODEL.md`

### 확정 완료. Q15. Admin masking, 원문 조회, AuditLog transaction 정책

확정:

- A. Admin 목록과 기본 상세 API는 민감 데이터 원문을 기본 마스킹하거나 존재 여부만 반환한다.
- Admin 원문 조회는 전용 민감정보 원문 조회 API에서만 허용한다.
- 원문 조회 요청에는 사유 `reason`이 필수다.
- 대상 데이터 조회와 `AuditLog` 생성은 같은 transaction에서 처리한다.
- transaction이 실패하면 원문을 반환하지 않는다.
- `AuditLog`에는 원문 PII와 복호화된 값을 저장하지 않는다.

질문의 의미:

- Admin이 운영상 민감 원문을 볼 수 있어야 하는 경우, 어떤 절차와 감사 기준을 강제할지 결정해야 한다.

왜 지금 결정해야 하는가:

- Admin API response, raw view API, Admin Web 사유 입력 dialog, AuditLog schema/use case, transaction 테스트 기준이 달라진다.

선택지:

- A. 기본 마스킹 + 사유 필수 원문 조회 API + AuditLog transaction
- B. Admin detail에서 권한만 있으면 일부 원문 표시, AuditLog는 별도 기록
- C. MVP에서는 Admin 원문 조회를 제공하지 않고 모두 마스킹

예시:

- A를 선택하면 Admin 연락처 목록에는 `phoneMasked`, `emailMasked`, `hasMemo`만 보이고, 원문이 필요할 때 사유를 입력한 뒤 별도 API가 AuditLog와 함께 처리한다.
- B를 선택하면 운영은 빠르지만 원문 접근 감사 누락 가능성이 커진다.
- C를 선택하면 보호는 강하지만 CS/장애 대응에서 필요한 원문 확인이 어렵다.

사용자 결정:

- A. 기본 마스킹 + 사유 필수 원문 조회 API + AuditLog transaction

문서 반영 위치:

- `TODO/DONE/MVP-STARTER_PLAN/COMMON/G00-DECISIONS.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G30-G32-ENDPOINT-CONTRACT.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G30-G32-ADMIN-AUDIT-API.md`
- `TODO/DONE/MVP-STARTER_PLAN/FE-TODO/ADMIN-WEB-TODO.md`
- `TODO/DONE/MVP-STARTER_PLAN/BE-TODO/API-TODO.md`

### 확정 완료. Q16. 도메인별 Log와 사용자 개인 Memo Log 구현 단위

확정:

- B. 도메인별 Log 테이블을 둔다.
- 회사 Log는 `CompanyLog`를 사용한다.
- 담당자 Log는 `ContactLog`를 추가한다.
- 제품 Log는 `ProductLog`를 추가한다.
- 딜 Log는 기존 `DealActivity`를 사용한다.
- 각 도메인별 사용자 개인 Memo Log도 객관 Log와 별도로 둔다.
- 사용자 개인 Memo Log는 `PersonalMemo`를 사용하되 `targetType`, `targetId`로 `Company`, `Contact`, `Product`, `Deal` 중 하나에 연결한다.
- 각 도메인 상세 화면은 `Log` 섹션과 `Memo` 섹션을 분리한다.

질문의 의미:

- Log는 회사/담당자/제품/딜에 대한 객관적 사실, 변경, 만남, 소식, 이력 기록이다.
- 기존 문서에는 `CompanyLog`와 `DealActivity`가 있지만, 담당자와 제품 Log 구현 단위는 아직 명확하지 않다.
- Log를 공통 테이블로 둘지, 도메인별 개별 테이블로 둘지 결정해야 한다.

왜 지금 결정해야 하는가:

- DB schema, API path, 상세 화면 timeline, 자동 생성 로그, 소유권 검증 방식이 달라진다.
- Memo는 `PersonalMemo` 공통 테이블로 확정했으므로, Log도 같은 방식으로 갈지 별도 판단이 필요하다.

선택지:

- A. 공통 `DomainLog` 테이블을 만들고 `targetType`, `targetId`로 `COMPANY|CONTACT|PRODUCT|DEAL`에 연결한다.
- B. 도메인별 Log 테이블을 둔다. 기존 `CompanyLog`, `DealActivity`를 유지하고 `ContactLog`, `ProductLog`를 추가한다.
- C. MVP 1차에서는 기존 `CompanyLog`, `DealActivity`만 구현하고, 담당자/제품 Log는 후속으로 미룬다.

예시:

- A를 선택하면 `/api/logs?targetType=CONTACT&targetId=...` 같은 공통 API로 회사/담당자/제품/딜 Log를 모두 처리할 수 있다. 다만 딜 단계 변경, 다음 행동 완료 같은 특수 자동 로그도 공통 metadata로 표현해야 한다.
- B를 선택하면 `CompanyLog`, `ContactLog`, `ProductLog`, `DealActivity`가 각각 명확한 FK와 도메인 규칙을 가진다. 대신 schema와 API 반복이 늘어난다.
- C를 선택하면 구현은 빠르지만 사용자가 기대하는 담당자/제품 Log가 MVP에서 빠진다.

추천안:

- B. 기존 문서의 `CompanyLog`, `DealActivity`를 보존하면서 `ContactLog`, `ProductLog`를 추가한다.

사용자 결정:

- B. 각 도메인별 Log가 있어야 하고, 각 도메인별 사용자 개인 Memo Log도 별도로 있어야 한다.

문서 반영 위치:

- `TODO/DONE/MVP-STARTER_PLAN/COMMON/G00-DECISIONS.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G06-G12-CORE-DOMAIN-API.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G06-G12-ENDPOINT-CONTRACT.md`
- `TODO/DONE/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`
- `TODO/DONE/MVP-STARTER_PLAN/FE-TODO/USER-WEB-TODO.md`
- `AGENT/PM_AGENT/PLANNING/DATA_MODEL.md`

### 확정 완료. Q17. 일정 기본 조회 기간

확정:

- C. 일정 목록/캘린더의 기본 조회 기간은 사용자 timezone 기준 이번 달이다.
- `GET /api/schedules`에서 `from`, `to` query가 없으면 Backend가 이번 달 1일~말일 범위를 계산한다.
- User Web `/schedules`는 Google Calendar처럼 월간 캘린더를 기본 화면으로 보여준다.
- User Web `/schedules`는 월간/주간 view mode 전환을 제공한다.
- 월 이동 또는 주 이동 시 User Web은 해당 기간의 `from`, `to`를 명시해 `GET /api/schedules`를 호출한다.
- 주간 보고서와 파일 export는 별도 `/api/schedules/week`, `/api/schedules/week/export`로 유지한다.

질문의 의미:

- 일정 화면에 처음 들어왔을 때 어떤 기간의 일정을 기본으로 조회하고 표시할지 결정해야 한다.

왜 지금 결정해야 하는가:

- 일정 API 기본 query, 캘린더 UI, 빈 상태, 페이지 이동, E2E 기본 fixture 범위가 달라진다.

선택지:

- A. 기본은 이번 주 월~일, 주간 일정표 중심
- B. 기본은 오늘부터 14일, 가까운 후속 행동 중심
- C. 기본은 이번 달, 월간 관리 중심

예시:

- A를 선택하면 주간 보고서와 같은 기준이라 단순하지만, 월 전체 일정 맥락은 한 번 더 이동해야 한다.
- B를 선택하면 임박 일정 관리에 강하지만 달력 월 이동과 기준이 다르다.
- C를 선택하면 `/schedules`가 월간 캘린더 중심이 되고, 주간 보기로 전환할 수 있으며, 주간 보고서는 별도 기능으로 다룬다.

사용자 결정:

- C. 월간 관리 중심

문서 반영 위치:

- `TODO/DONE/MVP-STARTER_PLAN/COMMON/G00-DECISIONS.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-ENDPOINT-CONTRACT.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-WORKFLOW-AUTOMATION-API.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P3-G17-G20-SCHEDULE-MEETING.md`
- `TODO/DONE/MVP-STARTER_PLAN/FE-TODO/USER-WEB-TODO.md`

### 확정 완료. Q18. 통합검색 기본 정책

확정:

- B. 현재 UX 정본 범위 그대로 회사/담당자/제품/딜/일정/회의록을 검색한다.
- 삭제된 데이터는 통합검색 기본 결과에서 제외한다. 휴지통 데이터는 휴지통 화면/API에서만 찾는다.
- 검색 실행은 trim 후 2자 이상부터 한다. 1자 이하는 검색 대신 최근 항목 또는 빈 상태를 표시한다.
- 결과는 type별 그룹으로 묶고 기본 limit은 type별 최대 5개로 둔다.
- Memo 원문, `MeetingNote.rawText`, Admin 민감 원문은 통합검색 결과 title/subtitle에 노출하지 않는다.

질문의 의미:

- 상단 통합검색에서 어떤 도메인을 기본 검색할지, 검색어 최소 길이와 결과 노출 범위를 어떻게 둘지 결정해야 한다.

왜 지금 결정해야 하는가:

- `GET /api/search` contract, DB query/index, User Web command palette, 검색 결과 그룹, E2E fixture가 달라진다.
- Memo/회의록/휴지통 데이터는 민감 정보와도 연결되므로 기본 노출 정책을 먼저 고정해야 한다.

선택지:

- A. 핵심 영업 데이터 중심: 회사/담당자/제품/딜만 검색한다.
- B. 현재 UX 정본 범위 그대로: 회사/담당자/제품/딜/일정/회의록을 검색한다.
- C. 최소 MVP: 회사/담당자/딜만 검색하고 제품/일정/회의록은 이후로 미룬다.

공통 전제:

- 삭제된 데이터는 통합검색 기본 결과에서 제외한다. 휴지통 데이터는 휴지통 화면/API에서만 찾는다.
- 검색 실행은 trim 후 2자 이상부터 한다. 1자 이하는 검색 대신 최근 항목 또는 빈 상태를 표시한다.
- 결과는 type별 그룹으로 묶고 기본 limit은 type별 최대 5개로 둔다.
- Memo 원문, `MeetingNote.rawText`, Admin 민감 원문은 통합검색 결과 title/subtitle에 노출하지 않는다.

예시:

- A를 선택하면 영업 핵심 데이터 탐색이 빠르고 단순하다. 다만 일정이나 회의록 제목을 찾으려면 각 화면으로 들어가야 한다.
- B를 선택하면 사용자는 상단 검색 하나로 회사/담당자/제품/딜/일정/회의록을 모두 찾을 수 있다. 대신 API query와 결과 그룹이 조금 더 복잡하다.
- C를 선택하면 구현량은 가장 적지만 제품명이나 일정 제목 검색이 MVP에서 빠져 사용성이 좁아진다.

추천안:

- B. 기존 UX 문서가 이미 회사/담당자/제품/딜/일정/회의록 통합검색을 전제로 하므로, 삭제 데이터 제외와 민감 원문 비노출만 명확히 고정하는 편이 좋다.

사용자 결정:

- B. 현재 UX 정본 범위 그대로 회사/담당자/제품/딜/일정/회의록을 검색한다.

문서 반영 위치:

- `TODO/DONE/MVP-STARTER_PLAN/COMMON/G00-DECISIONS.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-ENDPOINT-CONTRACT.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-WORKFLOW-AUTOMATION-API.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P4-G21-G29-AUTOMATION.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/DONE/MVP-STARTER_PLAN/FE-TODO/USER-WEB-TODO.md`

## 5. 질문 처리 원칙

- 질문은 한 번에 하나씩 확정한다.
- 답변이 `A`, `B`, `C`처럼 짧아도 되도록 각 질문에는 충분한 예시를 둔다.
- 사용자가 답변하면 즉시 `G00-DECISIONS.md`와 관련 실행 문서에 반영한다.
- 이미 확정된 결정은 같은 질문을 반복하지 않는다.
- 변경된 결정이 기존 문서와 충돌하면, 충돌 문서를 먼저 찾아서 정합성을 맞춘다.

## 6. 관련 문서

- `TODO/DONE/MVP-STARTER_PLAN/COMMON/G00-DECISIONS.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/PLANNING-REVIEW.md`
- `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G01-G05-FOUNDATION-AUTH-API.md`
- `TODO/DONE/MVP-STARTER_PLAN/BE-TODO/API-TODO.md`
- `TODO/DONE/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`
- `TODO/DONE/MVP-STARTER_PLAN/FE-TODO/USER-WEB-TODO.md`
- `TODO/DONE/MVP-STARTER_PLAN/FE-TODO/ADMIN-WEB-TODO.md`
