# G06 Original File Binary Minimization

상태: Confirmed
결정일: 2026-08-03
성격: 01 ImportJob Persistence 최종 서비스 형태 보강 구현 명세

## 0. 착수/완료 체크리스트

- [ ] Request/Response 영향 확인: `CreateImportJobResponse` 구조는 유지하고 raw storage/file detail을 노출하지 않는다.
- [ ] Business Logic 확인: parse, storage 임시 저장, DB snapshot 생성, transaction 성공 후 즉시 storage delete 순서를 이 문서 기준으로 구현한다.
- [ ] User Flow 확인: User Web에 원본 파일 삭제 여부를 기능으로 표시하지 않고 기존 resume flow를 유지한다.
- [ ] DB/Prisma 확인: `BE/prisma/schema.prisma`, `BE/prisma/migrations`, `BE-TODO/DB-SCHEMA.md`를 대조하고 기존 `ImportUploadedFile`, `ImportJobError` field만 사용하는지 확인한다.
- [ ] 소프트웨어 아키텍처/컨벤션 확인: `AGENT/SOFTWARE_AGENT/BACKEND_AGENT`, `AGENT/SOFTWARE_AGENT/DB_SCHEMA`를 읽고 use case, repository, storage port 책임을 맞춘다.
- [ ] 코드 주석 확인: transaction 이후 file delete, delete 실패 warning, G05 재시도 metadata 유지 분기에는 한글 주석을 반드시 추가한다.
- [ ] 테스트 확인: delete 성공, delete 실패, DB 실패 시 orphan best-effort delete, response/log redaction을 검증한다.
- [ ] 문서 확인: 구현 결과가 `COMMON/API-SPEC/IMPORT_JOB_API.md`, `BE-TODO/API-TODO.md`, `FE-TODO/USER-WEB-TODO.md`와 충돌하지 않는지 갱신한다.

## 1. 목표

업로드 원본 파일 binary를 parse와 DB snapshot 생성 성공 직후 삭제한다.

G01~G04에서는 원본 파일을 confirm/cancel/expire 시점에 삭제하는 흐름까지 구현했다. Global B2C 최종 서비스 형태에서는 원본 Excel/CSV binary 자체의 보관 시간을 더 줄이고, 이어받기는 `ImportJobRow` DB snapshot으로만 유지한다.

## 2. 포함 범위

- `CreateImportJob` 성공 흐름에서 원본 file binary 즉시 삭제
- `ImportUploadedFile.status`, `deletedAt` metadata 갱신
- 즉시 삭제 실패 시 safe warning 기록
- terminal cleanup에서 legacy 또는 삭제 실패 파일을 재시도할 수 있도록 metadata 유지
- Backend unit test

## 3. 제외 범위

- 원본 파일 재다운로드
- 원본 파일 재파싱
- 원본 파일 장기/영구 보관
- Admin 화면/API
- User Web 화면 변경
- 외부 storage adapter 신규 도입

## 4. 확정 정책

| 항목 | 정책 |
|---|---|
| 원본 binary 보관 | parse + DB snapshot 생성 성공 직후 삭제 |
| 이어받기 근거 | `ImportJobRow.rawDataJson`, `mappedDataJson`, `normalizedDataJson`, `validationErrorsJson` |
| metadata | `ImportUploadedFile` row는 남기고 `status=DELETED`, `deletedAt` 기록 |
| 삭제 실패 | import job은 유지하고 `ImportJobError` safe warning을 남긴다 |
| 재시도 | G05 terminal cleanup에서 `deletedAt` 없는 파일을 재시도한다 |

## 5. Business Logic

1. 사용자가 CSV/XLSX 파일을 업로드한다.
2. parser가 source column과 row snapshot을 만든다.
3. storage adapter가 원본 binary를 저장하고 checksum/storage metadata를 만든다.
4. DB transaction에서 `ImportJob`, `ImportJobRow`, `ImportUploadedFile`을 생성한다.
5. DB transaction 성공 직후 storage delete를 실행한다.
6. delete 성공 시 `ImportUploadedFile.status=DELETED`, `deletedAt=now`로 갱신한다.
7. delete 실패 시 job 생성은 성공으로 유지하고 `ImportJobError`에 `STORAGE_DELETE_FAILED` warning만 남긴다.
8. response에는 raw storage key, 파일 binary, provider/internal error detail을 포함하지 않는다.

## 6. Request / Response 영향

신규 HTTP API는 없다.

`CreateImportJob` response는 기존 `ImportJobDetailResponse`를 유지한다. User Web은 원본 파일 삭제 여부를 기능으로 표시하지 않는다.

## 7. DB/Prisma 영향

신규 migration은 만들지 않는다.

기존 field를 사용한다.

- `ImportUploadedFile.status`
- `ImportUploadedFile.deletedAt`
- `ImportUploadedFile.storageKey`
- `ImportJobError.errorType=STORAGE`
- `ImportJobError.errorCode=STORAGE_DELETE_FAILED`

## 8. Logging

성공 로그는 job 생성 summary와 분리하지 않아도 된다. 실패 로그는 safe code만 남긴다.

금지:

- 업로드 파일명
- `storageKey`
- row 원문
- 사용자 email/phone/name
- parser/internal stack

## 9. 검증 기준

Backend test:

- `CreateImportJob` 성공 후 storage delete가 호출된다.
- delete 성공 시 `ImportUploadedFile.status=DELETED`, `deletedAt`이 기록된다.
- delete 실패 시 job 생성은 성공하고 `ImportJobError` safe warning이 생성된다.
- delete 실패 response에 storage key나 raw error가 노출되지 않는다.
- DB 생성 실패 시 기존 orphan file best-effort delete 흐름이 유지된다.

검증 명령:

```powershell
cd BE
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd run test -- data-import
pnpm.cmd run build
```

## 10. 완료 기준

- 원본 업로드 file binary는 정상 import job 생성 직후 삭제된다.
- refresh/resume UX는 DB snapshot만으로 계속 동작한다.
- storage delete 실패는 terminal cleanup에서 재시도 가능한 metadata를 유지한다.
- raw file/storage 정보는 response/log/Admin에 노출되지 않는다.
