# Backend Integration QA

## 1. 목적

실제 BE와 DB를 기준으로 API, transaction, ownership, Admin 권한, Prisma 상태를 확인한다.

## 2. 사전 확인

```powershell
cd D:\workspace_repository\onehandsales\BE
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd run test
pnpm.cmd run build
pnpm.cmd prisma:validate
pnpm.cmd prisma:generate
pnpm.cmd exec prisma migrate status
```

주의:

- `DATABASE_URL` 실제 값은 문서에 기록하지 않는다.
- DB 대상이 shared/production이면 `prisma:migrate`, `prisma:seed`, destructive SQL을 실행하지 않는다.
- local disposable DB에서만 seed와 destructive cleanup을 허용한다.

## 3. 서버 실행 기준

Backend:

```powershell
cd D:\workspace_repository\onehandsales\BE
pnpm.cmd run start:dev
```

Health check:

```powershell
Invoke-WebRequest http://localhost:3000/api/health
```

## 4. API 공통 QA

- `GET /api/health`가 200을 반환한다.
- 인증 없는 보호 API는 401을 반환한다.
- 잘못된 token은 401을 반환한다.
- 일반 사용자 token으로 `/admin/api/*` 호출 시 403 또는 접근 차단이 발생한다.
- 존재하지 않는 route/resource는 404를 반환한다.
- validation error는 400과 안전한 메시지를 반환한다.
- DTO whitelist가 적용되어 허용되지 않은 필드를 거부한다.
- response body에 stack trace나 provider raw error가 노출되지 않는다.

## 5. User API QA

확인 대상:

- 회사 CRUD
- 담당자 CRUD
- 제품 CRUD
- 딜 CRUD, 상태 변경, 활동 로그
- 일정 CRUD
- 회의록 CRUD, 딜 연결, 활동 로그 연동
- 명함 OCR 결과 저장
- Import 미리보기/확정
- Search
- Trash 삭제/복구
- Settings profile/devices

필수 확인:

- 생성 후 조회 가능
- 수정 후 조회 값 반영
- 삭제 후 일반 목록/검색 미노출
- 복구 후 일반 목록/검색 재노출
- 다른 사용자 데이터 접근 차단
- transaction 중간 실패 시 부분 저장 없음

## 6. Admin API QA

확인 대상:

- `GET /admin/api/me`
- 사용자 목록/상세
- 사용자 activity timeline
- domain records
- sensitive raw access
- audit logs
- provider failures
- analytics overview
- account deletion/data export requests
- trash recovery requests
- system operation checks

필수 확인:

- AdminGuard 적용
- 기본 응답은 masked/safe field만 반환
- 민감 원문 조회는 reason validation 필요
- 민감 원문 조회 후 audit log 생성
- reason과 raw body가 일반 application log에 평문 노출되지 않음

## 7. Prisma/DB QA

- Prisma schema validation 통과
- Prisma client generate 통과
- migration status 확인
- `_prisma_migrations` 상태와 실제 schema가 모순되지 않음
- soft delete/trash retention 관련 필드가 기대대로 갱신됨
- audit log row가 mutation 또는 sensitive access와 함께 생성됨
- provider failure row가 안전한 error code/message만 저장함

## 8. 실패 기록 기준

Backend 실패는 다음 정보를 `COMMON/ISSUE-LOG.md`에 남긴다.

- HTTP method/path
- 요청 조건
- 기대 status/body
- 실제 status/body
- 관련 user/admin role
- DB 대상 분류
- transaction 여부
- 관련 test command

