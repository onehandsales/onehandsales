# G04 Multi Account Security QA

상태: Done
우선순위: P0
담당 영역: BE, FE/user-web

## 1. 목표

다중 계정 환경에서 사용자 A/B 데이터가 Search, Trash, Export, 직접 API 접근, Admin API 경계에서 섞이지 않는지 확인한다.

## 1A. 확정 결정

- BE 자동 테스트는 필수다.
- 로컬 DB와 HTTP 실행 조건이 안전하게 충족될 때만 실제 HTTP smoke를 추가한다.
- 실제 운영 계정, 공유 계정, 기존 seed 데이터는 사용하지 않는다.
- 사용자 A/B fixture는 테스트 안에서 매번 격리 생성한다.
- 목록/search/export는 사용자 B fixture가 사용자 A 응답에 포함되지 않는지를 본다.
- detail/restore/update/delete 직접 접근은 `404`를 우선 기대값으로 둔다. 다른 사용자 리소스 존재 여부를 `403`, message, id, name으로 노출하지 않는다.
- 일반 사용자 token의 Admin API 접근은 `403`을 기대값으로 둔다.
- mutation은 S1 보안 smoke로 포함한다.
- XLSX export는 최소한 사용자 B fixture 문자열이 binary/string에 없는지 확인한다. 이미 workbook parser/helper가 있으면 sheet cell까지 파싱한다.

## 2. 먼저 읽을 문서

- `AGENT/SOFTWARE_AGENT/COMMON/QA_CHECKLIST.md`의 `24. 보안/개인정보 QA`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/TESTING.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/BACKEND.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `TODO/USER_WEB_RELEASE_QA_FOLLOWUP_PLAN/COMMON/API-SPEC/README.md`

## 3. 포함 범위

- 사용자 A/B test fixture 준비
- Company/Contact/Product/Deal/Schedule/MeetingNote 직접 조회 ownership 확인
- Search 결과 ownership 확인
- Trash 목록/detail/restore ownership 확인
- Company/Contact/Product/Deal XLSX export ownership 확인
- 일반 사용자 token의 `/admin/api/*` 접근 차단 확인
- User Web API client가 `/admin/api/*` 호출을 막는지 확인

## 4. 제외 범위

- 실제 운영 계정 데이터 사용
- 비밀값 기록
- 결제/구독 권한
- Admin 운영 화면 구현
- 새로운 Admin API 추가

## 5. Backend 구현 지침

가능하면 자동 테스트로 고정한다.

필수 테스트 방향:

- Jest 자동 테스트를 반드시 추가하거나 기존 spec에 보강한다.
- 테스트 파일 위치는 실제 코드 구조 기준으로 선택하고 `QA-RESULTS.md`에 기록한다.
- cross-module ownership을 한 파일로 묶는 편이 안전하면 `BE/src/modules/security/ownership-isolation.spec.ts`를 새로 만든다.
- 기존 모듈 spec에 붙이는 편이 침투가 적으면 `company`, `contact`, `product`, `deal`, `schedule`, `meeting-note`, `search`, `trash`, `auth`의 기존 `*.spec.ts`에 케이스를 추가한다.
- presentation/controller spec에서는 fake guard로 `CURRENT_USER_A`, `CURRENT_USER_B`를 명시하고, service/repository 호출에 `userId: CURRENT_USER_A.id`가 전달되는지 확인한다.
- application/repository spec에서는 사용자 B fixture가 A 응답으로 반환되지 않는지 확인한다.
- Search, Trash, Export처럼 데이터 유출 위험이 큰 흐름은 HTTP 또는 presentation-level test를 우선한다.
- XLSX export는 response binary를 파싱하거나 buffer string 검사로 사용자 B의 fixture name/id/email/title이 없는지 확인한다.
- controller에서 Prisma를 직접 호출하지 않는다.
- domain/application은 Prisma type을 import하지 않는다.
- domain error와 HTTP status mapping을 분리한다.

### 5A. Fixture 기준

자동 테스트 fixture 이름은 아래 prefix를 사용한다.

| 사용자 | ID 기준 | fixture marker |
|---|---|---|
| A | `CURRENT_USER_A.id` | `RQA004-A` |
| B | `CURRENT_USER_B.id` | `RQA004-B` |

각 테스트는 필요한 데이터만 만든다.

- Company: `RQA004-A Company`, `RQA004-B Company`
- Contact: `RQA004-A Contact`, `RQA004-B Contact`
- Product: `RQA004-A Product`, `RQA004-B Product`
- Deal: `RQA004-A Deal`, `RQA004-B Deal`
- Schedule: `RQA004-A Schedule`, `RQA004-B Schedule`
- MeetingNote: `RQA004-A MeetingNote`, `RQA004-B MeetingNote`
- Trash: A/B 각각 삭제된 entity 또는 log fixture

DB를 쓰는 테스트라면 `beforeEach`에서 생성하고 `afterEach`에서 삭제한다. 기존 seed와 실계정 데이터에 의존하면 실패로 본다.

### 5B. Endpoint 기대값 matrix

| 영역 | 필수 확인 | 기대값 |
|---|---|---|
| Company list | `GET /api/companies` | A 응답에 `RQA004-B` 없음 |
| Company detail | `GET /api/companies/:companyId` with B id | `404`, B id/name 미노출 |
| Company export | `GET /api/companies/export/xlsx` | `200`, export에 `RQA004-B` 없음 |
| Company mutation | `PATCH/DELETE /api/companies/:companyId` with B id | `404`, B id/name 미노출 |
| Contact list | `GET /api/contacts` | A 응답에 `RQA004-B` 없음 |
| Contact detail | `GET /api/contacts/:contactId` with B id | `404`, B id/name 미노출 |
| Contact export | `GET /api/contacts/export/xlsx` | `200`, export에 `RQA004-B` 없음 |
| Contact mutation | `PATCH/DELETE /api/contacts/:contactId` with B id | `404`, B id/name 미노출 |
| Product list | `GET /api/products` | A 응답에 `RQA004-B` 없음 |
| Product detail | `GET /api/products/:productId` with B id | `404`, B id/name 미노출 |
| Product export | `GET /api/products/export/xlsx` | `200`, export에 `RQA004-B` 없음 |
| Product mutation | `PATCH/DELETE /api/products/:productId` with B id | `404`, B id/name 미노출 |
| Deal list | `GET /api/deals`, `GET /api/deals/stage-counts` | A 응답/count에 B 데이터 미포함 |
| Deal detail | `GET /api/deals/:dealId` with B id | `404`, B id/name 미노출 |
| Deal export | `GET /api/deals/export/xlsx` | `200`, export에 `RQA004-B` 없음 |
| Deal mutation | `PATCH/DELETE /api/deals/:dealId` with B id | `404`, B id/name 미노출 |
| Schedule list | `GET /api/schedules` | A 응답에 `RQA004-B` 없음 |
| Schedule detail | `GET /api/schedules/:scheduleId` with B id | `404`, B id/name 미노출 |
| Schedule mutation | `PATCH/DELETE /api/schedules/:scheduleId` with B id | `404`, B id/name 미노출 |
| MeetingNote list | `GET /api/meeting-notes` | A 응답에 `RQA004-B` 없음 |
| MeetingNote detail | `GET /api/meeting-notes/:meetingNoteId` with B id | `404`, B id/title 미노출 |
| MeetingNote mutation | `PATCH/DELETE /api/meeting-notes/:meetingNoteId` with B id | `404`, B id/title 미노출 |
| Search | `GET /api/search?q=RQA004-B` as A | B result group/item 없음 |
| Trash list | `GET /api/trash` | A 응답에 B 삭제 데이터 없음 |
| Trash detail | `GET /api/trash/:targetType/:targetId` with B target | `404`, B id/name 미노출 |
| Trash restore | `POST /api/trash/:targetType/:targetId/restore` with B target | `404`, B id/name 미노출 |
| Admin boundary | `GET /admin/api/me` with USER role | `403` |

### 5C. Assertion 기준

- JSON 응답은 `JSON.stringify(response.body)` 기준으로 `RQA004-B`가 없어야 한다.
- XLSX 응답은 `Buffer.toString("utf8")` 또는 workbook parser 결과 기준으로 `RQA004-B`가 없어야 한다.
- `404` 응답 body에는 B resource id, name, title, email, phone이 없어야 한다.
- `403`은 Admin API 일반 사용자 접근에서만 기대한다.
- 하나라도 B fixture가 노출되면 `RQA-004`를 S1 이상으로 유지하고 G06 수정 대상으로 보낸다.

### 5D. 조건부 HTTP smoke

아래 조건을 모두 만족할 때만 실제 HTTP smoke를 추가 실행한다.

1. `BE/.env`의 `DATABASE_URL`이 로컬 dev/test DB임을 확인했다.
2. 공유 QA DB 또는 운영성 DB가 아니다.
3. `pnpm db:dev:up` 또는 이미 실행 중인 local Postgres가 정상이다.
4. 테스트가 A/B fixture를 생성하고 정리할 수 있다.

조건이 하나라도 불명확하면 HTTP smoke는 `Blocked`로 기록하고, Jest 자동 테스트 결과만 release QA 증거로 남긴다.

## 6. Frontend 확인 지침

- `FE/user-web/src/lib/api-client.ts`가 `/admin/api/*`를 차단하는지 확인한다.
- User Web feature API 파일에서 `/admin/api/` 문자열이 없는지 검색한다.
- 보호 route에서 로그아웃 후 뒤로가기로 사용자 데이터가 보이지 않는지 smoke 확인한다.

검색 명령:

```powershell
rg -n "\"/admin/api|'/admin/api|admin/api" FE/user-web/src
```

## 7. 검증 명령

```powershell
cd BE
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build

cd ../FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
git diff --check
```

## 8. 완료 기준

- `RQA-004`가 `Fixed`, `Blocked`, 또는 구체 이슈 목록으로 정리되어 있다.
- 다른 사용자 데이터 노출 후보가 있으면 S1 이상으로 기록되어 있다.
- Search, Trash, Export, 직접 API 접근 중 확인하지 못한 항목이 있으면 이유와 다음 조치가 `QA-RESULTS.md`에 있다.
- endpoint 기대값 matrix의 각 행이 `Passed`, `Failed`, `Blocked`, `N/A` 중 하나로 기록되어 있다.
- 추가/수정한 자동 테스트 파일 경로가 `QA-RESULTS.md`에 기록되어 있다.
- 테스트 또는 smoke 결과가 명령과 함께 남아 있다.
