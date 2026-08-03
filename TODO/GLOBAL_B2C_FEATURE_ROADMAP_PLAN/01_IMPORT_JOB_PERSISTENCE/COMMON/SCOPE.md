# Scope

상태: G01~G04 구현 완료 / G05~G08 구현 대기 / 01 최종 서비스 형태 미완료
G01~G04 완료일: 2026-07-21

## 0. 완료 체크리스트

- [x] 확정 전 ImportJob DB 영속화
- [x] row snapshot, mapping, validation result 저장
- [x] active job resume API
- [x] row edit, validate, confirm, cancel API
- [x] original file metadata/delete tracking
- [x] redacted ImportJobError 이력
- [x] User Web 새로고침/탭 이동 resume UX
- [x] G04 QA closeout
- [ ] G05 terminal ImportJob cleanup 구현
- [ ] G06 original file binary 즉시 삭제 구현
- [ ] G07 ImportUserLogRow 30일 cleanup 구현
- [ ] G08 10MB/5,000행 import 제한 구현

## 1. 목적

01은 확정 전 Import 작업을 DB에 영속화해 새로고침, 탭 이동, 서버 재시작, 배포 중에도 사용자가 작업을 이어갈 수 있게 만든다.

사용자 경험은 단순해야 한다. 화면은 `파일 올리기 -> 컬럼 매칭 확인 -> 오류 행만 수정 -> 가져오기 완료` 흐름으로 유지하고, 내부 테이블명이나 오류 로그 개념을 직접 노출하지 않는다.

## 2. 포함 범위

| 항목 | 확정 내용 |
|---|---|
| ImportJob 영속화 | 확정 전 작업의 원본 header snapshot(`sourceColumns`), 상태, mapping, summary, TTL을 DB에 저장한다. |
| ImportJobRow 영속화 | raw row, mapped row, normalized row, validation errors, row status를 DB에 저장한다. |
| ImportJobError | import 작업 단위 오류 이력을 redacted 형태로 저장한다. 사용자 cell 오류는 row에도 저장한다. |
| ImportUploadedFile | 업로드 원본 파일 metadata와 storage key를 저장한다. binary는 DB에 저장하지 않으며, parse와 DB snapshot 생성 성공 직후 storage binary도 삭제한다. |
| 이어받기 | 사용자가 `/app/import/review/:importJobId` 또는 `/app/import`의 진행 중 작업 카드에서 작업을 재개한다. |
| TTL | 확정 전 job TTL은 7일이다. |
| cleanup | Global B2C 최종형에서는 terminal job/row/error/file metadata를 terminal 상태 후 7일 뒤 자동 batch cleanup하고, 성공 이력 row-level snapshot인 `ImportUserLogRow`는 생성 후 30일 뒤 삭제한다. |
| confirm | confirm 성공 시 실제 도메인 row와 기존 `ImportUserLog`, `ImportUserLogRow`를 같은 transaction에서 생성한다. 이후 `ImportUserLogRow`는 30일 보관 대상으로 본다. |
| cancel | 사용자가 진행 중 가져오기를 취소할 수 있다. |
| validation | mapping 또는 row 수정 후 row 단위 검증을 재실행할 수 있다. |
| volume limit | 파일은 10MB 이하, data row는 5,000행 이하로 제한한다. 초과 시 job/storage/row 생성 전 거부한다. |
| 보안 | 모든 job, row, error, uploaded file은 `userId` ownership을 가진다. |
| UX | Notion식 조용한 단계 흐름과 Attio식 CRM record 연결 정확성을 유지한다. |

## 3. 제외 범위

| 항목 | 이유 |
|---|---|
| 일정/회의록 Import | 현재 Import 대상은 회사, 담당자, 제품, 딜이다. |
| 대용량 background worker | 01에서는 동기 confirm 흐름을 유지하고 10MB/5,000행 제한으로 닫는다. 대용량 처리와 worker는 scale import 후속으로 분리한다. |
| 범용 ExportJob | 03 Weekly Schedule Report/ExportJob 슬롯에서 다룬다. |
| Admin 오류 조회 UI | 11 Admin Operation에서 다룬다. 01은 User Web import flow를 닫는다. |
| 전역 ErrorLog | 11 ProviderFailureLog/Admin 운영 로그와 함께 설계한다. |
| 영구 원본 파일 보관 | 개인정보와 storage 비용 리스크가 있어 01에서는 short-lived 보관만 허용한다. |
| 결제/구독/Admin/다국어/분석 | Global B2C 첫 판매 gate의 별도 bundle이다. 01은 ImportJob 유실 방지와 데이터 신뢰성 slot만 닫는다. |
| ImportJob cleanup Admin 화면/API | G05는 safe summary log만 남긴다. Admin 표시가 필요하면 11/post-12 aggregate 운영 후속에서 다룬다. |

## 4. 확정 정책

- 확정 전 job TTL은 `createdAt + 7일`이다.
- terminal job cleanup 보관 기간은 terminal 상태가 된 뒤 7일이다.
- `ImportJob.expiresAt`은 UTC instant로 저장하고 API 응답은 ISO 8601 UTC string이다.
- active status는 `UPLOADED`, `MAPPED`, `NEEDS_REVIEW`, `READY_TO_CONFIRM`, `CONFIRMING`이다.
- terminal status는 `CONFIRMED`, `FAILED`, `CANCELED`, `EXPIRED`이다.
- terminal cleanup 기준 시점은 `confirmedAt`, `canceledAt`, `failedAt`, `expiresAt`이다. 비정상 legacy row는 `updatedAt` fallback을 허용한다.
- 원본 파일 binary는 DB에 저장하지 않는다.
- 원본 파일 binary는 parse와 DB snapshot 생성 성공 직후 storage에서도 삭제한다.
- 정상 삭제 시 `ImportUploadedFile.status=DELETED`, `deletedAt`을 남긴다.
- storage provider가 준비되지 않은 local 환경에서도 `ImportUploadedFile` row는 생성한다. 이때 `storageProvider = LOCAL`, `storageKey`는 local adapter가 반환한 key를 저장한다.
- cleanup 시 `ImportUploadedFile.deletedAt`이 없으면 storage delete를 재시도하고 성공한 경우에만 DB snapshot을 삭제한다.
- terminal cleanup은 `ImportJob` aggregate만 삭제한다. `ImportUserLog`, 실제 CRM 데이터는 유지한다.
- `ImportUserLogRow`는 생성 후 30일이 지나면 row 자체를 삭제한다. 축약 보관하지 않는다.
- cleanup runner는 env flag로만 자동 실행하고 기본 batch size는 500이다.
- cleanup log에는 count 중심 safe summary만 남긴다. row 원문, 파일명, storage key, job ID 목록은 남기지 않는다.
- 업로드 파일 크기는 10MB 이하로 제한한다.
- data row는 header를 제외하고 5,000행 이하로 제한한다.
- 5,001행 이상은 `ImportJob`, `ImportJobRow`, `ImportUploadedFile`, storage object를 만들기 전에 거부한다.
- provider/parser/storage/internal failure detail은 사용자 response와 log에 원문으로 노출하지 않는다.
- row/cell validation error는 사용자가 수정할 수 있도록 `fieldKey`, `message` 중심으로 내려준다.
- `ImportUserLog`는 성공 이력 summary 정본으로 유지하며, 확정 전 job 상태 저장에 재사용하지 않는다.
- `ImportUserLogRow`는 성공 이력 row-level detail로 생성하지만, 생성 30일 후 cleanup 대상이다.

## 5. 완료 기준

- `InMemoryImportJobStore` 의존이 제거되고 DB 기반 repository가 사용된다.
- 업로드 후 새로고침해도 mapping/preview/validation 상태가 복구된다.
- 서버 재시작 후에도 7일 내 job을 조회할 수 있다.
- 다른 사용자의 `importJobId`로 접근하면 존재 여부를 노출하지 않는다.
- row validation 오류는 cell 단위로 표시할 수 있다.
- confirm 성공 시 도메인 row와 `ImportUserLog`/`ImportUserLogRow`가 같은 transaction에서 생성된다.
- confirm 실패 시 부분 생성이 남지 않는다.
- cancel/expire 상태에서는 confirm을 실행할 수 없다.
- 원본 파일 삭제 상태와 metadata가 추적된다.
- 정상 upload 후 원본 파일 binary는 즉시 삭제되고, 이어받기는 DB snapshot만으로 동작한다.
- terminal 상태가 된 지 7일 지난 ImportJob 임시 snapshot은 G05 cleanup으로 정리된다.
- storage delete 실패 job은 DB snapshot을 삭제하지 않아 storage key 추적을 잃지 않는다.
- `ImportUserLogRow`는 생성 30일 후 삭제되고, `ImportUserLog` summary와 실제 CRM 데이터는 유지된다.
- 5,001행 이상 upload는 job/storage/row 생성 없이 안전한 validation message로 거부된다.
- User Web은 API 응답에 없는 summary를 임의로 꾸미지 않는다.

## 6. 검증 기준

- Backend: `pnpm run typecheck`, `pnpm run lint`, `pnpm run test`, `pnpm run build`
- User Web: `pnpm run typecheck`, `pnpm run lint`, `pnpm run build`, import flow E2E 또는 수동 QA
- 수동 QA: upload, map, refresh resume, row edit, validate, confirm, cancel, expired job 접근, cross-user 접근 차단, row detail 만료 import log 상세, 5,001행 초과 upload 안내

## 7. 출시 범위 대조

01은 `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`의 `NBA-006` 구현 완료 계획이다.

- 포함: Import upload/mapping/validation/confirm 중 유실 방지, DB persistence, TTL, cleanup, resume UX
- 제외: 결제/구독, Admin 운영, 앱 다국어, 제품 분석, Notification, Schedule week report, Trash 장기 복구 정책

상세 대조는 `COMMON/RELEASE-SCOPE-CHECK.md`를 따른다.
