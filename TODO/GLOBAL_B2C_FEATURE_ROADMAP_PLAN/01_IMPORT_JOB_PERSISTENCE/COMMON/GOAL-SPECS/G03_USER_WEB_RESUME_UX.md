# G03 User Web Resume UX

상태: Done
완료일: 2026-07-21
완료 근거: `TODO_LOG/2026-07-21/G04_IMPORT_JOB_PERSISTENCE_QA_CLEANUP/WORK_LOG.md`

## 1. 목적

User Web에서 확정 전 import 작업을 새로고침, 탭 이동, 서버 재시작 이후에도 이어서 볼 수 있게 한다. 사용자는 내부 DB 개념을 보지 않고 단순한 흐름만 경험해야 한다.

```text
파일 올리기 -> 컬럼 매칭 확인 -> 오류 행만 수정 -> 가져오기 완료
```

## 2. 선행 조건

- G02가 완료되어 `/api/imports` DB persistence API를 사용할 수 있다.
- API request/response 타입이 `COMMON/API-SPEC/IMPORT_JOB_API.md`와 일치한다.
- 기존 `/app/import` 구현 구조를 확인한 뒤 같은 feature 경계 안에서 수정한다.

## 3. 포함 범위

- `/app/import` active job 조회
- 진행 중 작업 카드
- upload 성공 후 `/app/import/review/:importJobId` 이동
- `/app/import/review/:importJobId` detail resume 조회
- mapping 수정 API 연결
- row/cell 수정 API 연결
- validate API 연결
- confirm API 연결과 `importUserLogId` 기준 성공 이력 이동
- cancel API 연결
- expired/canceled/failed 상태 UI
- mobile row card/list 전환 보강
- TanStack Query key/invalidation 정리

## 4. 제외 범위

- Admin Web
- `/admin/api/*` 호출
- Notification route 노출
- generic `/app/export` 재노출
- 결제/구독 UX
- 앱 전체 다국어 전환
- 새로운 Import 대상 추가

## 5. 화면 기준

`/app/import`:

- 제목: `데이터 가져오기`
- 진행 중 작업 카드
- 대상 선택: 회사, 담당자, 제품, 딜
- file dropzone
- 성공 내역 목록

`/app/import/review/:importJobId`:

- 대상별 제목: `회사 가져오기`, `담당자 가져오기`, `제품 가져오기`, `딜 가져오기`
- 단계: 파일, 컬럼 매칭, 오류 확인, 완료
- 파일 summary: 파일명, row 수, 만료까지 남은 시간
- 컬럼 매칭 table
- preview record table 또는 mobile row card/list
- 하단 action: `가져오기`, `나중에 이어서 하기`, `취소하기`

Route 선언:

- `/app/import/review/:importJobId`는 `/app/import/:importUserLogId`보다 먼저 선언한다.

## 6. State 기준

Source of truth:

- 서버 응답이 source of truth다.
- local state는 저장 전 draft 편집에만 사용한다.
- API 성공 response를 기준으로 query cache를 갱신한다.

Query key:

```ts
['importJobs', 'active', { targetType }]
['importJobs', importJobId]
['importJobs', importJobId, 'errors']
['importUserLogs', { page, targetType }]
['importUserLogs', importUserLogId]
```

Error state:

- `ImportJobNotFound`: `/app/import`로 이동하고 짧은 안내
- `ImportJobExpired`: 새 파일 시작 안내
- `ImportJobAlreadyClosed`: 현재 상태 재조회
- `ImportJobNotReady`: 오류 row 표시

## 7. UX 기준

반드시 지킨다:

- UI에 `ImportJob`, `ImportJobRow`, `ImportJobError`, `ImportUploadedFile` 용어를 표시하지 않는다.
- 긴 오류 로그를 기본 화면에 노출하지 않는다.
- 오류 cell만 짧게 강조한다.
- API response에 없는 summary를 FE에서 꾸미지 않는다.
- desktop table을 mobile에 억지로 축소하지 않는다.

사용자 문구:

- `진행 중인 가져오기가 있어요.`
- `이어서 확인할 수 있어요.`
- `이 가져오기는 만료됐어요. 새 파일로 다시 시작해 주세요.`
- `파일을 읽지 못했어요. 형식을 확인하고 다시 올려 주세요.`
- `문제가 생겼어요. 잠시 후 다시 시도해 주세요.`

## 8. 연결 문서

- `FE-TODO/USER-WEB-TODO.md`
- `COMMON/USER-FLOW.md`
- `COMMON/API-SPEC/IMPORT_JOB_API.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`

## 9. 검증 명령

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
```

## 10. 완료 기준

- `/app/import`에서 active job을 이어서 볼 수 있다.
- upload 성공 후 detail route로 이동한다.
- detail route 새로고침 후 mapping/row/error state가 복구된다.
- invalid cell만 오류 문구를 보여준다.
- validate 성공 후 confirm button 활성 여부가 서버 count/status 기준으로 바뀐다.
- confirm 성공 후 success history detail로 이동한다.
- confirmed job detail을 다시 조회하면 `job.importUserLogId` 기준으로 success history detail로 이동한다.
- expired/canceled/failed job에서 confirm action이 보이지 않는다.
- mobile에서 row card/list로 확인과 수정이 가능하다.
