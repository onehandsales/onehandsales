# Backend API 구현 TODO

## 1. 목적

이 문서는 Backend 구현 작업을 모듈과 API 기준으로 나눈다.

상세 API 계약의 정본은 `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC`에 둔다. 이 문서의 목적은 API 계약을 다시 정의하는 것이 아니라, Backend 구현자가 어떤 모듈과 endpoint 작업을 해야 하는지 빠짐없이 확인하는 것이다.

## 2. 프로젝트 스캐폴딩

### 해야 할 일

- NestJS 프로젝트 생성
- TypeScript strict 설정
- Prisma 설치
- Prisma datasource는 PostgreSQL provider를 사용하고 `DATABASE_URL`/`DIRECT_URL`을 지원
- dev/preview/prod managed DB는 Supabase Cloud PostgreSQL 기준으로 연결
- local/integration/E2E test DB는 Docker PostgreSQL 기준으로 연결 가능
- ConfigModule 설정
- `.env.example` 작성
- global ValidationPipe 설정
- global exception filter 작성
- request context middleware 작성
- structured logger 설정
- health check endpoint 작성

### 기본 파일 구조

```text
BE/
  package.json
  nest-cli.json
  tsconfig.json
  prisma/
    schema.prisma
    migrations/
  src/
    main.ts
    app.module.ts
    modules/
    shared/
```

### 완료 기준

- 서버가 local에서 실행된다.
- Prisma client가 생성된다.
- validation과 exception response 형식이 통일된다.

## 3. Shared 모듈

### 책임

- 공통 domain error
- pagination
- sorting/filtering type
- transaction manager port
- Prisma transaction manager adapter
- current user decorator
- auth guard base
- admin guard
- response mapper helper
- logger wrapper
- redaction helper
- file validation helper
- StoragePort
- SupabaseStorageAdapter
- EncryptionPort
- encrypted field mapper

### 작업 목록

- `shared/domain/errors`
- `shared/application/ports`
- `shared/infrastructure/prisma`
- `shared/presentation/guards`
- `shared/presentation/filters`
- `shared/presentation/decorators`
- `shared/presentation/dto`

### 완료 기준

- 각 도메인 모듈이 같은 방식으로 pagination, error, auth context를 사용한다.
- 공통 error mapper는 삭제된 리소스 단건 조회의 `DeletedResource`를 410으로, 수정/상태 변경/재삭제의 `DeletedResource`를 409로 응답한다.

## 4. Auth 모듈

### 사용자 기능

- Supabase Auth provider 목록 제공
- MVP 초기 실제 provider는 Kakao, Naver, Google
- Apple provider는 iOS 앱 단계 후속 구현으로 분리
- Supabase token을 Backend App token으로 exchange
- Backend App access token 검증
- 외부 Auth user와 local User 동기화
- App token refresh
- 로그아웃
- 내 정보 조회
- 회원 탈퇴 시 active session revoke에 사용할 AuthSession 처리

### Admin 기능

- Admin 로그인은 Supabase Auth 흐름을 사용하되 local `User.role = ADMIN` 확인이 필요하다.
- 초기 Admin은 `INITIAL_ADMIN_EMAILS`와 일치하는 사용자를 token exchange 시 `role = ADMIN`으로 승격한다.

### User API

| Method | Path | 설명 |
|---|---|---|
| `GET` | `/api/auth/providers` | 사용 가능한 소셜 로그인 provider 목록 |
| `POST` | `/api/auth/exchange` | 외부 Auth token을 Backend App token으로 교환하고 local User 동기화 |
| `POST` | `/api/auth/refresh` | App access token 갱신 |
| `POST` | `/api/auth/logout` | 로그아웃 |
| `GET` | `/api/me` | 현재 사용자 정보 |

### Admin API

| Method | Path | 설명 |
|---|---|---|
| `GET` | `/admin/api/me` | 현재 Admin 정보 |

### 작업 목록

- ExternalAuthVerifier port
- Supabase JWT verifier adapter
- AppTokenIssuer
- AuthSession repository
- Token exchange use case
- App token refresh use case
- Supabase user와 UserOAuthAccount 매핑 저장
- 같은 이메일의 다른 provider 계정은 자동 연결하지 않음
- 수동 계정 연결 API는 MVP 이후 후속 작업으로 분리
- `INITIAL_ADMIN_EMAILS` 기반 첫 로그인 Admin 승격
- email normalize 후 Admin email 목록 비교
- `AuthDevice` repository
- `deviceSlot`, `deviceId`, `deviceLabel`, `replaceExistingDevice` validation
- 같은 `AuthDevice` 안에서는 여러 active `AuthSession` 허용
- 같은 슬롯의 다른 `AuthDevice`가 이미 있으면 `DeviceSlotAlreadyRegistered` 반환
- `replaceExistingDevice=true`이면 기존 `AuthDevice`를 `REPLACED` 처리하고 그 하위 active `AuthSession` revoke
- AuthGuard
- AdminGuard

### 완료 기준

- 사용자는 Supabase Auth 소셜 로그인 후 Backend App token을 발급받고 local User와 동기화된다.
- Backend는 `Authorization: Bearer` App access token을 검증해 현재 사용자 context를 만든다.
- Backend는 Supabase access token 원문, Supabase refresh token, App access token 원문, refresh token 원문을 저장하지 않는다.
- Backend는 local `AuthSession`과 refresh token hash로 7일 sliding session을 관리한다.
- App access token은 FE memory 저장을 전제로 짧게 유지한다.
- refresh token은 httpOnly cookie로 발급하고 `AuthSession.refreshTokenHash`만 DB에 저장한다.
- refresh endpoint는 `SameSite=Lax` cookie와 Origin 검증을 적용한다.
- `INITIAL_ADMIN_EMAILS`와 일치하는 사용자는 첫 로그인 또는 token exchange 시 Admin으로 승격된다.
- active 등록 기기는 `MOBILE`, `PERSONAL_LAPTOP`, `WORK_LAPTOP` 슬롯별 1개씩만 유지된다.
- 같은 등록 기기에서는 여러 active session을 유지할 수 있다.
- Admin route는 `role = ADMIN`만 접근할 수 있다.

## 5. User 모듈

### 책임

- 사용자 기본 정보
- 사용자 상태
- 사용자 설정
- 알림 기본값
- 민감정보 경고 설정
- 계정 soft delete와 30일 보관 정책
- 회원 탈퇴 시 AuthSession revoke 호출

### User API

| Method | Path | 설명 |
|---|---|---|
| `GET` | `/api/users/me/settings` | 내 설정 조회 |
| `PATCH` | `/api/users/me/settings` | 내 설정 수정 |
| `DELETE` | `/api/users/me` | 회원 탈퇴 |

### Admin API

| Method | Path | 설명 |
|---|---|---|
| `GET` | `/admin/api/users` | 사용자 목록 |
| `GET` | `/admin/api/users/:userId` | 사용자 상세 |
| `PATCH` | `/admin/api/users/:userId/status` | 사용자 상태 변경. `DELETED`는 Admin 강제 계정 삭제, `DELETED -> ACTIVE`는 30일 이내 계정 복구 |

### 완료 기준

- 사용자별 데이터 조회와 Admin 사용자 관리의 기반이 준비된다.
- 회원 탈퇴와 Admin 강제 삭제는 모두 `User` soft delete와 30일 자동 완전 삭제 정책을 따른다.
- 삭제된 계정은 로그인, refresh, 일반 business API 접근이 차단된다.

## 6. Company 모듈

### 책임

- 회사 CRUD
- 회사 로그
- 태그 연결
- 휴지통 이동과 복구

### User API

| Method | Path | 설명 |
|---|---|---|
| `GET` | `/api/companies` | 회사 목록 |
| `POST` | `/api/companies` | 회사 생성 |
| `GET` | `/api/companies/:companyId` | 회사 상세 |
| `PATCH` | `/api/companies/:companyId` | 회사 수정 |
| `DELETE` | `/api/companies/:companyId` | 회사 휴지통 이동 |
| `POST` | `/api/companies/:companyId/restore` | 회사 복구 |
| `GET` | `/api/companies/:companyId/logs` | 회사 로그 목록 |
| `POST` | `/api/companies/:companyId/logs` | 회사 로그 생성 |
| `PATCH` | `/api/companies/:companyId/logs/:logId` | 회사 로그 수정 |
| `DELETE` | `/api/companies/:companyId/logs/:logId` | 회사 로그 삭제 |

### Admin API

| Method | Path | 설명 |
|---|---|---|
| `GET` | `/admin/api/companies` | 전체 회사 목록 |
| `GET` | `/admin/api/companies/:companyId` | 회사 상세 |
| `GET` | `/admin/api/users/:userId/companies` | 특정 사용자 회사 목록 |

### 완료 기준

- 회사 데이터는 사용자별로 분리된다.
- 회사 삭제는 soft delete다.

## 6.5 Memo 모듈

### 책임

- 회사/거래처/제품/딜 Memo 기록 CRUD
- 대상 도메인 ownership 검증
- Memo 원문 암호화 저장
- 휴지통 이동과 복구 정책 적용

### User API

| Method | Path | 설명 |
|---|---|---|
| `GET` | `/api/memos` | 대상별 Memo 목록 |
| `POST` | `/api/memos` | Memo 생성 |
| `PATCH` | `/api/memos/:memoId` | Memo 수정 |
| `DELETE` | `/api/memos/:memoId` | Memo 휴지통 이동 |

### 완료 기준

- `targetType`은 `COMPANY`, `CONTACT`, `PRODUCT`, `DEAL`만 허용한다.
- Memo 원문은 `PersonalMemo.contentCiphertext`로 암호화 저장된다.
- 목록/요약 API는 원문 대신 `hasMemo`, `memoCount`, `latestMemoAt`을 사용할 수 있다.

## 7. Contact 모듈

### 책임

- 거래처(담당자) CRUD
- 회사 연결
- 거래처 Log
- Memo 기록
- 명함 OCR 저장 결과 반영
- 휴지통 이동과 복구

### User API

| Method | Path | 설명 |
|---|---|---|
| `GET` | `/api/contacts` | 거래처 목록 |
| `POST` | `/api/contacts` | 거래처 생성 |
| `GET` | `/api/contacts/:contactId` | 거래처 상세 |
| `PATCH` | `/api/contacts/:contactId` | 거래처 수정 |
| `DELETE` | `/api/contacts/:contactId` | 거래처 휴지통 이동 |
| `POST` | `/api/contacts/:contactId/restore` | 거래처 복구 |
| `GET` | `/api/contacts/:contactId/logs` | 거래처 Log 목록 |
| `POST` | `/api/contacts/:contactId/logs` | 거래처 Log 생성 |
| `PATCH` | `/api/contacts/:contactId/logs/:logId` | 거래처 Log 수정 |
| `DELETE` | `/api/contacts/:contactId/logs/:logId` | 거래처 Log 삭제 |

### Admin API

| Method | Path | 설명 |
|---|---|---|
| `GET` | `/admin/api/contacts` | 전체 거래처 목록 |
| `GET` | `/admin/api/contacts/:contactId` | 거래처 상세 |
| `GET` | `/admin/api/users/:userId/contacts` | 특정 사용자 거래처 목록 |

### 완료 기준

- 거래처는 회사에 연결될 수 있고, 회사 없이도 예외적으로 저장 가능하다.
- 거래처 Log는 객관 기록이고, Memo 기록과 분리된다.
- Admin 목록에서는 전화번호와 이메일이 기본 마스킹된다.
- Memo 원문은 `PersonalMemo.contentCiphertext`로 암호화 저장된다.

## 8. Product 모듈

### 책임

- 제품 CRUD
- 제품 분류
- 단가
- 제품 Log
- 제품 연결 타입
- 회사/거래처/딜 연결

### User API

| Method | Path | 설명 |
|---|---|---|
| `GET` | `/api/products` | 제품 목록 |
| `POST` | `/api/products` | 제품 생성 |
| `GET` | `/api/products/:productId` | 제품 상세 |
| `PATCH` | `/api/products/:productId` | 제품 수정 |
| `DELETE` | `/api/products/:productId` | 제품 휴지통 이동 |
| `POST` | `/api/products/:productId/restore` | 제품 복구 |
| `POST` | `/api/products/:productId/connections` | 제품 연결 생성 |
| `DELETE` | `/api/products/:productId/connections/:connectionId` | 제품 연결 삭제 |
| `GET` | `/api/products/:productId/logs` | 제품 Log 목록 |
| `POST` | `/api/products/:productId/logs` | 제품 Log 생성 |
| `PATCH` | `/api/products/:productId/logs/:logId` | 제품 Log 수정 |
| `DELETE` | `/api/products/:productId/logs/:logId` | 제품 Log 삭제 |

### Admin API

| Method | Path | 설명 |
|---|---|---|
| `GET` | `/admin/api/products` | 전체 제품 목록 |
| `GET` | `/admin/api/products/:productId` | 제품 상세 |
| `GET` | `/admin/api/users/:userId/products` | 특정 사용자 제품 목록 |

### 완료 기준

- 제품은 회사/거래처/딜과 연결할 수 있다.
- 제품 Log는 객관 기록이고, Memo 기록과 분리된다.
- 연결 타입을 저장한다.

## 9. Deal 모듈

### 책임

- 딜 CRUD
- 단계 변경
- 가능성
- 다음 행동
- 제품 연결
- 딜 활동 로그
- 휴지통 이동과 복구

### User API

| Method | Path | 설명 |
|---|---|---|
| `GET` | `/api/deals` | 딜 목록 |
| `POST` | `/api/deals` | 딜 생성 |
| `GET` | `/api/deals/:dealId` | 딜 상세 |
| `PATCH` | `/api/deals/:dealId` | 딜 수정 |
| `PATCH` | `/api/deals/:dealId/stage` | 딜 단계 변경 |
| `PATCH` | `/api/deals/:dealId/next-action` | 다음 행동 수정 |
| `POST` | `/api/deals/:dealId/next-action/complete` | 다음 행동 완료 |
| `POST` | `/api/deals/:dealId/next-action/snooze` | 다음 행동 미루기 |
| `DELETE` | `/api/deals/:dealId` | 딜 휴지통 이동 |
| `POST` | `/api/deals/:dealId/restore` | 딜 복구 |
| `GET` | `/api/deals/:dealId/activities` | 활동 로그 목록 |
| `POST` | `/api/deals/:dealId/activities` | 활동 로그 생성 |
| `PATCH` | `/api/deals/:dealId/activities/:activityId` | 활동 로그 수정 |
| `DELETE` | `/api/deals/:dealId/activities/:activityId` | 활동 로그 삭제 |

### Admin API

| Method | Path | 설명 |
|---|---|---|
| `GET` | `/admin/api/deals` | 전체 딜 목록 |
| `GET` | `/admin/api/deals/:dealId` | 딜 상세 |
| `GET` | `/admin/api/users/:userId/deals` | 특정 사용자 딜 목록 |
| `POST` | `/admin/api/deals/:dealId/sensitive/raw` | 민감 원문 조회 |

### 완료 기준

- 딜 금액은 필수다.
- 단계 변경은 자동 활동 로그를 생성한다.
- 다음 행동 상태가 목록과 상세에서 조회된다.

## 10. Schedule 모듈

### 책임

- 일정 CRUD
- 딜/회사/거래처 연결
- 일정 알림
- 월간 기본 일정 조회
- 주간 보기 기간 조회
- 주간 일정 보고서
- Google Calendar 가져오기

### User API

| Method | Path | 설명 |
|---|---|---|
| `GET` | `/api/schedules` | 일정 목록. `from`, `to` 없으면 사용자 timezone 기준 이번 달. 주간 보기는 명시적 `from`, `to` 사용 |
| `POST` | `/api/schedules` | 일정 생성 |
| `GET` | `/api/schedules/:scheduleId` | 일정 상세 |
| `PATCH` | `/api/schedules/:scheduleId` | 일정 수정 |
| `DELETE` | `/api/schedules/:scheduleId` | 일정 휴지통 이동 |
| `POST` | `/api/schedules/:scheduleId/restore` | 일정 복구 |
| `GET` | `/api/schedules/week` | 주간 보고서 조회 |
| `POST` | `/api/schedules/week/export` | 주간 일정 보고서 Export 생성 |
| `POST` | `/api/schedules/google/connect` | Google Calendar 연결 시작 |
| `POST` | `/api/schedules/google/import` | Google Calendar 일정 가져오기 |

### 완료 기준

- 일정은 딜 없이 저장 가능하다.
- `GET /api/schedules`는 기간 query가 없으면 이번 달 범위를 기본 적용한다.
- 월간/주간 보기 전환은 `GET /api/schedules`의 range query로 처리한다.
- Google Calendar 연결과 가져오기는 실제 Google Calendar adapter를 통해 동작한다.
- 가져온 Google 일정은 `source = GOOGLE`로 구분된다.

## 11. MeetingNote 모듈

### 책임

- 회의록 텍스트 입력
- AI 회의록 생성
- 회의록 저장/수정
- 딜 연결
- 딜 연결 시 활동 로그 자동 생성

### User API

| Method | Path | 설명 |
|---|---|---|
| `GET` | `/api/meeting-notes` | 회의록 목록 |
| `POST` | `/api/meeting-notes/generate` | AI 회의록 생성 |
| `POST` | `/api/meeting-notes` | 회의록 저장 |
| `GET` | `/api/meeting-notes/:meetingNoteId` | 회의록 상세 |
| `PATCH` | `/api/meeting-notes/:meetingNoteId` | 회의록 수정 |
| `POST` | `/api/meeting-notes/:meetingNoteId/link-deal` | 딜 연결 |
| `DELETE` | `/api/meeting-notes/:meetingNoteId` | 회의록 휴지통 이동 |
| `POST` | `/api/meeting-notes/:meetingNoteId/restore` | 회의록 복구 |

### Admin API

| Method | Path | 설명 |
|---|---|---|
| `GET` | `/admin/api/meeting-notes` | 전체 회의록 목록 |
| `POST` | `/admin/api/meeting-notes/:meetingNoteId/sensitive/raw` | 회의록 원문 조회 |

### 완료 기준

- AI 회의록 생성은 실제 OpenAI adapter를 통해 동작한다.
- 회의록은 딜 없이 저장 가능하다.
- 회의록 원문 입력값은 `MeetingNote.rawTextCiphertext`로 암호화 저장된다.
- 딜 연결 시 `DealActivity`가 자동 생성된다.

## 12. BusinessCard 모듈

### 책임

- 명함 이미지 업로드
- OCR 처리
- OCR 결과 확인용 데이터 저장
- 회사 후보 제안
- 사용자 확정 후 회사/거래처 저장
- 명함 이미지는 `StoragePort`로 저장하고 DB에는 bucket/object key 중심 metadata 저장

### User API

| Method | Path | 설명 |
|---|---|---|
| `POST` | `/api/business-cards/scan` | 명함 OCR 요청 |
| `GET` | `/api/business-cards/:scanId` | OCR 결과 조회 |
| `POST` | `/api/business-cards/:scanId/confirm` | OCR 결과 확정 저장 |

### 완료 기준

- 명함 OCR은 실제 OpenAI/OCR adapter를 통해 동작한다.
- OCR 결과는 자동 저장되지 않는다.
- 사용자가 확정해야 회사/거래처 데이터가 생성된다.
- Supabase Storage SDK는 infrastructure adapter 내부에서만 사용된다.

## 13. Import/Export 모듈

### Import User API

| Method | Path | 설명 |
|---|---|---|
| `POST` | `/api/imports` | Import 파일 업로드와 job 생성 |
| `POST` | `/api/imports/:importJobId/map` | AI 컬럼 매핑 요청 |
| `PATCH` | `/api/imports/:importJobId/mapping` | 사용자 매핑 수정 |
| `POST` | `/api/imports/:importJobId/confirm` | Import 확정 실행 |
| `GET` | `/api/imports/:importJobId` | Import 결과 조회 |

### Export User API

| Method | Path | 설명 |
|---|---|---|
| `POST` | `/api/exports` | Export job 생성 |
| `GET` | `/api/exports/:exportJobId` | Export 상태 조회 |
| `GET` | `/api/exports/:exportJobId/download` | Export 파일 다운로드 |

### 완료 기준

- Import AI 컬럼 매핑은 실제 OpenAI adapter를 통해 동작한다.
- Import는 사용자가 매핑을 확인한 뒤 확정한다.
- Import는 확정 전 preview table과 row별 validation 결과를 제공한다.
- preview에 오류 row가 있으면 확정 실행을 막는다.
- Import 확정 실행은 all-or-nothing transaction이며, 한 row라도 실패하면 도메인 데이터는 전체 rollback된다.
- 실행 실패 시 실패 row number와 error reason을 `ImportJobRow`와 response에 남긴다.
- Export 민감 데이터는 기본 제외다.
- Import 원본 파일과 Export 생성 파일은 `StoragePort`로 저장한다.
- DB에는 public URL 대신 storage provider, bucket, object key, content type, file size, file name metadata를 저장한다.
- Export 다운로드는 `StoragePort`에서 stream 또는 signed URL을 받아 반환한다.

## 14. Tag 모듈

### User API

| Method | Path | 설명 |
|---|---|---|
| `GET` | `/api/tags` | 태그 목록 |
| `POST` | `/api/tags` | 태그 생성 |
| `PATCH` | `/api/tags/:tagId` | 태그 수정 |
| `DELETE` | `/api/tags/:tagId` | 태그 삭제 |
| `POST` | `/api/tags/:tagId/assignments` | 태그 연결 |
| `DELETE` | `/api/tags/:tagId/assignments/:assignmentId` | 태그 연결 해제 |
| `GET` | `/api/tags/logs` | 태그/태그 연결 로그 목록 |

### 완료 기준

- 주요 엔티티에 태그를 연결할 수 있다.
- 태그 자체 삭제는 분류 설정 삭제로 보고 `Tag`를 hard delete한다.
- 태그 삭제 시 해당 태그의 active `TagAssignment`마다 `TagLog(TAG_UNASSIGNED)`를 남기고, `TagLog(TAG_DELETED)`를 남긴 뒤 같은 transaction에서 `TagAssignment`와 `Tag`를 hard delete한다.
- 태그 생성/수정/삭제와 태그 연결/해제는 모두 `TagLog`에 append-only로 남긴다.
- 태그와 태그 연결이 hard delete되어도 `TagLog`는 남아야 하므로 태그명/색상/대상 정보 스냅샷을 함께 저장한다.
- `Tag`와 `TagAssignment`는 휴지통에 넣지 않는다.

## 15. Notification 모듈

### 책임

- 일정 시작 전 알림
- 딜 마감일 알림
- 다음 행동 알림
- 회의록 생성 완료 알림
- 실제 이메일 알림 발송
- 실제 브라우저 푸시 알림 발송
- browser push subscription 등록/해제
- 알림 발송 job과 실패 재시도

### User API

| Method | Path | 설명 |
|---|---|---|
| `GET` | `/api/notifications` | 알림 목록 |
| `PATCH` | `/api/notifications/:notificationId/read` | 알림 읽음 처리 |
| `PATCH` | `/api/notifications/settings` | 알림 기본값 수정 |
| `GET` | `/api/notifications/browser-push/public-key` | VAPID public key 조회 |
| `POST` | `/api/notifications/browser-subscriptions` | browser push 구독 등록 |
| `DELETE` | `/api/notifications/browser-subscriptions/:subscriptionId` | browser push 구독 해제 |

### 작업 목록

- EmailDeliveryPort
- SMTP email adapter
- BrowserPushPort
- Web Push VAPID adapter
- BrowserPushSubscription repository
- browser push endpoint/key encryption mapper
- Notification delivery worker
- Notification provider error mapper
- email/browser push 테스트 stub adapter

### 완료 기준

- 알림은 기본값을 제공하고 사용자가 수정할 수 있다.
- email 알림은 SMTP adapter로 실제 발송된다.
- browser push 알림은 Web Push VAPID adapter로 실제 발송된다.
- 자동 테스트에서는 email/browser push stub adapter를 사용할 수 있다.

## 16. Trash 모듈

### User API

| Method | Path | 설명 |
|---|---|---|
| `GET` | `/api/trash` | 휴지통 목록 |
| `POST` | `/api/trash/:targetType/:targetId/restore` | 복구 |
| `DELETE` | `/api/trash/:targetType/:targetId/permanent` | MVP 1차에서는 사용자 즉시 완전 삭제를 막고 `PermanentDeleteNotAllowed` 반환 |

### 완료 기준

- 삭제된 모든 soft delete 대상 데이터는 30일 보관된다.
- soft delete 시 `deletedAt`과 `permanentDeleteAt`이 함께 기록된다.
- 30일 경과 데이터는 시스템 자동 작업으로 완전 삭제될 수 있다.
- 사용자 즉시 완전 삭제는 MVP 1차에서 허용하지 않는다.
- 완전 삭제 7일 전 알림을 준비할 수 있다.

## 17. Admin 모듈

### 책임

- Admin dashboard
- 사용자 목록/상세
- 전체 딜/회사/거래처/제품 조회
- 사용자별 데이터 조회
- 민감정보 원문 조회
- 암호화된 Memo/회의록 원문 복호화
- 감사 로그 조회

### Admin API

| Method | Path | 설명 |
|---|---|---|
| `GET` | `/admin/api/dashboard` | Admin 대시보드 요약 |
| `GET` | `/admin/api/audit-logs` | 감사 로그 목록 |
| `GET` | `/admin/api/audit-logs/:auditLogId` | 감사 로그 상세 |
| `POST` | `/admin/api/sensitive/raw` | 공통 민감 원문 조회 |

### 완료 기준

- Admin API는 User API와 분리된다.
- 민감 원문 조회는 감사 로그와 같은 transaction에서 처리된다.

## 18. 테스트 TODO

### Unit Test

- domain entity
- value object
- deal stage transition
- next action state
- sensitive access reason validation
- import mapping validation

### Integration Test

- user ownership isolation
- AdminGuard
- deal stage change with activity log
- meeting note link with deal activity
- sensitive raw view with audit log
- trash restore

### 완료 기준

- 데이터 유출, 감사 누락, irreversible action에 해당하는 흐름은 테스트가 있다.

## 19. 관련 문서

- `TODO/MVP-STARTER_PLAN/COMMON/API-SPEC/README.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-WORK-ORDER.md`
- `TODO/MVP-STARTER_PLAN/COMMON/GOAL-SPECS/README.md`
- `TODO/MVP-STARTER_PLAN/BE-TODO/DB-SCHEMA.md`
- `AGENT/SOFTWARE_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/ARCHITECTURE/BACKEND.md`



