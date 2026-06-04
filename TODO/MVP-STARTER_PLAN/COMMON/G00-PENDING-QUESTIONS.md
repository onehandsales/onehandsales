# G00 남은 질문 기록

## 1. 목적

이 문서는 `MVP-STARTER_PLAN`의 G00 구현 전 결정 과정에서 아직 확정하지 않은 질문을 기록한다.

대화로 바로 이어서 묻지 않고, 이후 작업을 재개할 때 이 문서를 기준으로 하나씩 결정한다.

질문은 반드시 다음 형식으로 검토한다.

- 질문의 의미
- 왜 지금 결정해야 하는지
- 선택지
- 예시
- 추천안
- 선택 시 문서에 반영할 위치

## 2. 이미 확정된 결정

현재까지 확정된 결정은 `TODO/MVP-STARTER_PLAN/COMMON/G00-DECISIONS.md`를 정본으로 따른다.

요약:

- package manager는 `pnpm`을 사용한다.
- Node.js는 `Node.js 24 LTS`를 사용한다.
- local DB는 `Docker PostgreSQL`을 사용한다.
- PostgreSQL Docker image는 `postgres:17-alpine`을 사용한다.
- local 개발 DB는 `sales_b2c_dev`, 테스트 DB는 `sales_b2c_test`를 사용한다.
- Supabase는 MVP 1차에서 `Auth`에만 사용한다.
- business DB는 Supabase DB가 아니라 Docker PostgreSQL과 Prisma가 관리한다.
- 인증 방식은 `Supabase Cloud Auth + Backend OAuth bridge + httpOnly session cookie + local AuthSession`으로 간다.
- FE는 Supabase access token을 직접 저장하거나 전달하지 않는다.
- Backend API 호출은 `credentials: "include"`와 CSRF 방어 기준을 전제로 한다.

## 3. 재개 후 먼저 해야 할 문서 정합성 작업

httpOnly cookie 방식은 확정되었으므로, 이후 문서 정리 시 다음 표현이 남아 있으면 모두 수정해야 한다.

- `POST /api/auth/sync`
- `Supabase access token을 Backend API client에 전달`
- `Backend가 Supabase JWT만 검증해서 current user를 만든다`
- `Backend는 local session table을 저장하지 않는다`
- `UserSyncRequired`
- `Bearer token`

수정 방향:

- 로그인 시작 API는 `GET /api/auth/:provider/start`로 작성한다.
- Supabase callback 처리 API는 `GET /api/auth/callback`으로 작성한다.
- Backend는 callback에서 local `User`, `UserOAuthAccount`, `UserSetting`, `AuthSession`을 생성하거나 갱신한다.
- Backend는 FE에 Supabase access token을 노출하지 않고 httpOnly cookie를 발급한다.
- 인증된 API는 httpOnly cookie와 `AuthSession` 검증으로 current user context를 만든다.
- mutating API는 CSRF token 또는 Origin 검증을 요구한다.

반영 대상:

- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G01-G05-FOUNDATION-AUTH-API.md`
- `TODO/MVP-STARTER_PLAN/BE-TODO/API-TODO.md`
- `TODO/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`
- `TODO/MVP-STARTER_PLAN/FE-TODO/USER-WEB-TODO.md`
- `TODO/MVP-STARTER_PLAN/FE-TODO/ADMIN-WEB-TODO.md`
- `TODO/MVP-STARTER_PLAN/COMMON/USER-FLOW.md`
- `TODO/MVP-STARTER_PLAN/COMMON/PLANNING-REVIEW.md`

## 4. 남은 질문 목록

### Q01. AuthSession 만료 시간과 갱신 정책

질문의 의미:

- httpOnly cookie 방식에서는 Backend가 자체 `AuthSession`을 관리한다.
- 따라서 session이 언제 만료되는지, 사용자가 활동 중일 때 만료 시간을 연장할지 결정해야 한다.

왜 지금 결정해야 하는가:

- `AuthSession.expiresAt`, cookie `maxAge`, logout, 자동 로그아웃 UX, 테스트 기준이 모두 달라진다.
- 만료 정책이 없으면 FE와 BE가 서로 다른 기준으로 로그인 상태를 판단할 수 있다.

선택지:

- A. 7일 sliding session
- B. 24시간 fixed session
- C. 30일 session + 나중에 remember me 옵션

예시:

- A를 선택하면 사용자가 매일 접속할 때 session 만료 시간이 계속 연장된다. 실무 SaaS MVP에서 사용성이 좋다.
- B를 선택하면 보안은 강하지만 사용자가 매일 다시 로그인해야 해서 초기 서비스 UX가 불편할 수 있다.
- C를 선택하면 편의성은 높지만 session 탈취 시 노출 기간이 길어져 추가 보안 장치가 필요하다.

추천안:

- A. 7일 sliding session

문서 반영 위치:

- `TODO/MVP-STARTER_PLAN/COMMON/G00-DECISIONS.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G01-G05-FOUNDATION-AUTH-API.md`
- `TODO/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`

### Q02. CSRF 방어 방식

질문의 의미:

- httpOnly cookie 인증은 XSS로 token을 직접 빼앗기는 위험은 줄지만, cookie가 자동 전송되므로 CSRF 방어가 필요하다.

왜 지금 결정해야 하는가:

- 모든 `POST`, `PATCH`, `PUT`, `DELETE` API의 공통 guard와 FE API client 구현이 결정된다.

선택지:

- A. `SameSite=Lax` + Origin 검증 + `X-CSRF-Token` header
- B. `SameSite=Lax` + Origin 검증만 사용
- C. double-submit cookie + `X-CSRF-Token` header

예시:

- A를 선택하면 FE는 로그인 후 `GET /api/auth/csrf`로 token을 받고, mutation 요청에 `X-CSRF-Token`을 붙인다.
- B를 선택하면 구현은 빠르지만 CSRF 방어 기준이 약하다.
- C를 선택하면 정석적이지만 구현과 테스트가 A보다 조금 더 복잡하다.

추천안:

- A. `SameSite=Lax` + Origin 검증 + `X-CSRF-Token` header

문서 반영 위치:

- `TODO/MVP-STARTER_PLAN/COMMON/G00-DECISIONS.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G01-G05-FOUNDATION-AUTH-API.md`
- `TODO/MVP-STARTER_PLAN/FE-TODO/USER-WEB-TODO.md`
- `TODO/MVP-STARTER_PLAN/FE-TODO/ADMIN-WEB-TODO.md`

### Q03. OAuth provider 초기 구현 순서

질문의 의미:

- 문서에는 Kakao, Google, Naver, Apple을 모두 후보로 둔다.
- 하지만 초기 구현에서 4개 provider를 한 번에 붙일지, 일부만 먼저 붙일지 결정해야 한다.

왜 지금 결정해야 하는가:

- Supabase Auth 설정, callback 테스트, 로그인 버튼 상태, E2E mock 범위가 달라진다.

선택지:

- A. Google + Kakao 먼저 구현하고 Naver + Apple은 다음 goal로 미룬다.
- B. Kakao, Google, Naver, Apple을 G05에서 모두 구현한다.
- C. Google만 먼저 구현하고 나머지는 버튼 disabled 상태로 둔다.

예시:

- A를 선택하면 국내 사용자 기준 Kakao와 개발/테스트가 쉬운 Google을 먼저 검증할 수 있다.
- B를 선택하면 기획 완성도는 높지만 초기 인증 작업량이 커진다.
- C를 선택하면 가장 빠르지만 실제 한국 사용자 로그인 검증이 늦어진다.

추천안:

- A. Google + Kakao 먼저 구현

문서 반영 위치:

- `TODO/MVP-STARTER_PLAN/COMMON/G00-DECISIONS.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G01-G05-FOUNDATION-AUTH-API.md`
- `TODO/MVP-STARTER_PLAN/FE-TODO/USER-WEB-TODO.md`
- `TODO/MVP-STARTER_PLAN/FE-TODO/ADMIN-WEB-TODO.md`

### Q04. 같은 이메일의 다른 provider 계정 처리 방식

질문의 의미:

- 사용자가 Google과 Kakao에서 같은 이메일을 사용할 수 있다.
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

- `TODO/MVP-STARTER_PLAN/COMMON/G00-DECISIONS.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G01-G05-FOUNDATION-AUTH-API.md`
- `TODO/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`

### Q05. 초기 Admin 계정 생성 방식

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

- `TODO/MVP-STARTER_PLAN/COMMON/G00-DECISIONS.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G01-G05-FOUNDATION-AUTH-API.md`
- `TODO/MVP-STARTER_PLAN/BE-TODO/API-TODO.md`

### Q06. 동시에 허용할 로그인 session 수

질문의 의미:

- 사용자가 여러 브라우저나 기기에서 동시에 로그인할 수 있게 할지 결정해야 한다.

왜 지금 결정해야 하는가:

- `AuthSession` 생성 정책, logout 범위, 보안 이벤트 대응 방식이 달라진다.

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

- `TODO/MVP-STARTER_PLAN/COMMON/G00-DECISIONS.md`
- `TODO/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`

### Q07. 파일 저장소 1차 전략

질문의 의미:

- Supabase Storage는 MVP 1차 제외로 정했다.
- 하지만 명함 OCR 이미지, Export 파일, Import 파일은 저장 위치가 필요하다.

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

- A. local filesystem adapter + storage port

문서 반영 위치:

- `TODO/MVP-STARTER_PLAN/COMMON/G00-DECISIONS.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-WORKFLOW-AUTOMATION-API.md`
- `TODO/MVP-STARTER_PLAN/BE-TODO/API-TODO.md`

### Q08. 민감정보 암호화 적용 범위

질문의 의미:

- 개인 메모, 회의록 원문, 전화번호, 이메일, 명함 OCR 결과 같은 데이터는 민감정보 가능성이 있다.
- 어떤 필드를 application layer에서 암호화할지 결정해야 한다.

왜 지금 결정해야 하는가:

- Prisma schema만으로는 암호화 정책이 보장되지 않는다.
- domain/application/infrastructure layer에서 encryption adapter와 redaction policy가 필요하다.

선택지:

- A. 개인 메모와 회의록 원문부터 application-level encryption 적용
- B. 전화번호, 이메일, OCR 결과까지 MVP 1차부터 암호화
- C. MVP 1차는 masking/audit만 적용하고 암호화는 이후 작업

예시:

- A를 선택하면 가장 민감한 사용자 입력부터 보호하면서 구현량을 통제할 수 있다.
- B를 선택하면 보호 수준은 높지만 검색, 정렬, 중복 검사가 복잡해진다.
- C를 선택하면 빠르지만 Admin 원문 조회와 데이터 유출 리스크가 커진다.

추천안:

- A. 개인 메모와 회의록 원문부터 적용

문서 반영 위치:

- `TODO/MVP-STARTER_PLAN/COMMON/G00-DECISIONS.md`
- `TODO/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G30-G32-ADMIN-AUDIT-API.md`

### Q09. Import 부분 성공 정책

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

- A. row 단위 부분 성공 허용

문서 반영 위치:

- `TODO/MVP-STARTER_PLAN/COMMON/G00-DECISIONS.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-WORKFLOW-AUTOMATION-API.md`
- `TODO/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`

### Q10. 외부 연동 mock 범위

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

추천안:

- A. adapter interface + mock 우선

문서 반영 위치:

- `TODO/MVP-STARTER_PLAN/COMMON/G00-DECISIONS.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/P4-G21-G29-AUTOMATION.md`
- `TODO/MVP-STARTER_PLAN/BE-TODO/API-TODO.md`

### Q11. FE/BE 배포 도메인 전략

질문의 의미:

- httpOnly cookie 인증은 FE와 BE가 같은 site인지, 다른 site인지에 따라 cookie 설정이 달라진다.

왜 지금 결정해야 하는가:

- `sameSite`, `secure`, CORS, `credentials: "include"`, reverse proxy 구성이 달라진다.

선택지:

- A. 같은 site 아래에 배포한다. 예: `app.example.com`, `admin.example.com`, `api.example.com`
- B. FE와 BE를 완전히 다른 domain에 배포한다.
- C. MVP local과 preview는 분리 도메인을 허용하되 운영은 같은 parent domain으로 고정한다.

예시:

- A를 선택하면 cookie와 CORS 설정이 비교적 단순하다.
- B를 선택하면 cross-site cookie 설정 때문에 `SameSite=None; Secure`와 엄격한 CORS 설정이 필요하다.
- C를 선택하면 개발/preview 유연성과 운영 안정성을 둘 다 고려할 수 있다.

추천안:

- C. preview는 유연하게, 운영은 같은 parent domain 기준

문서 반영 위치:

- `TODO/MVP-STARTER_PLAN/COMMON/G00-DECISIONS.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G01-G05-FOUNDATION-AUTH-API.md`
- `TODO/MVP-STARTER_PLAN/FE-TODO/USER-WEB-TODO.md`
- `TODO/MVP-STARTER_PLAN/FE-TODO/ADMIN-WEB-TODO.md`

## 5. 질문 처리 원칙

- 질문은 한 번에 하나씩 확정한다.
- 답변이 `A`, `B`, `C`처럼 짧아도 되도록 각 질문에는 충분한 예시를 둔다.
- 사용자가 답변하면 즉시 `G00-DECISIONS.md`와 관련 실행 문서에 반영한다.
- 이미 확정된 결정은 같은 질문을 반복하지 않는다.
- 변경된 결정이 기존 문서와 충돌하면, 충돌 문서를 먼저 찾아서 정합성을 맞춘다.

## 6. 관련 문서

- `TODO/MVP-STARTER_PLAN/COMMON/G00-DECISIONS.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/MVP-STARTER_PLAN/COMMON/PLANNING-REVIEW.md`
- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/G01-G05-FOUNDATION-AUTH-API.md`
- `TODO/MVP-STARTER_PLAN/BE-TODO/API-TODO.md`
- `TODO/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`
- `TODO/MVP-STARTER_PLAN/FE-TODO/USER-WEB-TODO.md`
- `TODO/MVP-STARTER_PLAN/FE-TODO/ADMIN-WEB-TODO.md`
