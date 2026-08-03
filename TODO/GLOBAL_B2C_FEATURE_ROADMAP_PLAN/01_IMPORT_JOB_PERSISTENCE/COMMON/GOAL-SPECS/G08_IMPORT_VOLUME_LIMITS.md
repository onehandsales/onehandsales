# G08 Import Volume Limits

상태: Confirmed
결정일: 2026-08-03
성격: 01 ImportJob Persistence 최종 서비스 형태 보강 구현 명세

## 0. 착수/완료 체크리스트

- [ ] Request/Response 영향 확인: `POST /api/imports`에서 10MB/5,000행 초과 error code와 safe message를 확정한다.
- [ ] Business Logic 확인: file size 검증, parser row count 검증, 초과 시 job/storage/row 생성 전 실패 조건을 이 문서 기준으로 구현한다.
- [ ] User Flow 확인: upload 화면에서 제한 초과 안내를 보여주고 기존 import resume/review 흐름은 유지한다.
- [ ] UX/UI 확인: User Web 변경 시 `AGENT/UXUI_AGENT`, `FE-TODO/USER-WEB-TODO.md`, `COMMON/USER-FLOW.md`를 대조한다.
- [ ] DB/Prisma 확인: `BE/prisma/schema.prisma`, `BE/prisma/migrations`, `BE-TODO/DB-SCHEMA.md`를 대조하고 row limit을 DB constraint가 아니라 application validation으로 유지한다.
- [ ] SQL 주석 확인: Prisma migration SQL, raw SQL, cleanup/retention 보조 SQL을 작성하면 한글 `COMMENT ON` 또는 `-- 한글 주석`으로 목적, 보관/삭제 기준, 안전 조건을 남긴다.
- [ ] 소프트웨어 아키텍처/컨벤션 확인: `AGENT/SOFTWARE_AGENT/BACKEND_AGENT`, `AGENT/SOFTWARE_AGENT/FRONT_AGENT`, `AGENT/SOFTWARE_AGENT/DB_SCHEMA`를 읽고 validation, parser, controller/use case 책임을 맞춘다.
- [ ] 코드 주석 확인: row count 계산 기준, storage 생성 전 실패 분기, safe validation response 처리에는 한글 주석을 반드시 추가한다.
- [ ] 테스트 확인: 5,000행 통과, 5,001행 실패, storage 미호출, DB 미생성, safe error response/log를 검증한다.
- [ ] 문서 확인: 구현 결과가 `COMMON/API-SPEC/IMPORT_JOB_API.md`, `BE-TODO/API-TODO.md`, `FE-TODO/USER-WEB-TODO.md`와 충돌하지 않는지 갱신한다.

## 1. 목표

01 최종 서비스 형태에서는 대용량 import background worker를 만들지 않고, 명확한 파일/row 제한을 둔다.

Global B2C 첫 판매 기준으로는 동기 confirm 흐름을 유지한다. 대량 비동기 import, progress, retry, partial success는 별도 scale 후속으로 분리한다.

## 2. 포함 범위

- 파일 크기 10MB 제한 유지
- row 최대 5,000행 제한 추가
- 제한 초과 시 DB job/row/file metadata를 만들지 않음
- 제한 초과 safe validation error
- User Web 오류 안내
- Backend test

## 3. 제외 범위

- background worker
- progress UI
- partial import
- 대량 retry queue
- chunked upload
- 범용 ImportJob processor
- Admin 대량 작업 화면

## 4. 확정 정책

| 항목 | 정책 |
|---|---|
| file size | 10MB |
| row count | 최대 5,000 data row |
| 초과 처리 | import job 생성 전 실패 |
| confirm 방식 | 동기 confirm 유지 |
| 후속 | 실제 사용량/성능 지표 확인 후 scale import 로드맵에서 검토 |

row count 기준:

- header row는 제외한다.
- data row만 계산한다.
- CSV/XLSX parser 결과 `parsedFile.rows.length`가 5,000을 초과하면 실패한다.

## 5. Request / Response

신규 API는 없다.

`POST /api/imports`에서 제한 초과 시 기존 validation error 응답 체계를 사용한다.

사용자 표시 문구 예시:

```text
한 번에 가져올 수 있는 행 수를 초과했어요. 5,000행 이하로 나눠서 다시 올려주세요.
```

파일 크기 초과 문구 예시:

```text
파일 크기가 너무 커요. 10MB 이하 파일로 다시 올려주세요.
```

## 6. Business Logic

1. file size는 upload interceptor와 request validation에서 10MB 이하로 제한한다.
2. parser가 data row를 만든다.
3. row count가 5,000을 초과하면 validation error를 던진다.
4. row count 초과 시 storage 저장, `ImportJob`, `ImportJobRow`, `ImportUploadedFile` 생성이 일어나지 않아야 한다.
5. 정상 범위에서는 기존 mapping/resume/confirm 흐름을 유지한다.

## 7. DB/Prisma 영향

신규 migration은 만들지 않는다.

row limit은 application validation 정책이다. DB constraint로 만들지 않는다.

## 8. Logging

제한 초과 로그는 count/bucket 중심으로만 남긴다.

허용:

- target type
- row count bucket
- safe error code

금지:

- 파일명
- row 원문
- email/phone/name
- source column 원문 대량 dump

## 9. 검증 기준

Backend test:

- 5,000행 import는 통과한다.
- 5,001행 import는 validation error로 실패한다.
- row limit 초과 시 storage store가 호출되지 않는다.
- row limit 초과 시 `ImportJob`과 child row가 생성되지 않는다.
- error response/log에 raw row가 없다.

User Web 확인:

- 제한 초과 error message가 upload 화면에서 깨지지 않고 표시된다.

검증 명령:

```powershell
cd BE
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd run test -- data-import
pnpm.cmd run build
```

User Web을 변경한 경우:

```powershell
cd FE/user-web
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd run build
```

## 10. 완료 기준

- 10MB file size 제한이 유지된다.
- 5,000 data row 제한이 적용된다.
- 대용량 worker 없이도 사용자가 명확한 안내를 받는다.
- 제한 초과 요청은 DB와 storage에 임시 데이터를 남기지 않는다.
