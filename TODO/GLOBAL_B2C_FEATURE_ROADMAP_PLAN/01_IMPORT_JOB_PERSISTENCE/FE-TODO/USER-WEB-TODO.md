# User Web TODO

상태: Confirmed
기준 문서:

- `COMMON/USER-FLOW.md`
- `COMMON/API-SPEC/IMPORT_JOB_API.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`

## 1. 목표

사용자에게는 단순한 가져오기 흐름만 보여준다.

```text
파일 올리기 -> 컬럼 매칭 확인 -> 오류 행만 수정 -> 가져오기 완료
```

내부의 `ImportJob`, `ImportJobRow`, `ImportJobError`, `ImportUploadedFile` 용어는 UI에 노출하지 않는다. 단, 새로고침, 탭 이동, 서버 재시작 후에도 같은 가져오기 작업을 이어서 볼 수 있어야 한다.

## 2. Route

| Route | 목적 |
|---|---|
| `/app/import` | 가져오기 시작, 진행 중 작업 이어받기, 성공 내역 목록 |
| `/app/import/review/:importJobId` | 확정 전 가져오기 상세/resume |
| `/app/import/:importUserLogId` | 확정 성공 이력 상세. 기존 route를 유지한다. |

Route 정책:

- route 선언은 `/app/import/review/:importJobId`를 `/app/import/:importUserLogId`보다 먼저 둔다.
- `/app/import/review/:importJobId` 진입 시 항상 `GET /api/imports/:importJobId`로 서버 상태를 복구한다.
- job이 없거나 소유권이 없으면 `/app/import`로 이동하고 짧은 안내를 보여준다.
- job이 `EXPIRED`, `CANCELED`, `FAILED`이면 수정/confirm action을 숨기고 새 파일로 시작하는 action만 둔다.
- `CONFIRMED`이고 `job.importUserLogId`가 있으면 `/app/import/:importUserLogId` 성공 이력 상세로 이동한다.

## 3. API 연결

| 화면 행동 | API | FE 처리 |
|---|---|---|
| `/app/import` 진입 | `GET /api/imports/active` | 진행 중 작업 카드 표시 |
| 파일 업로드 | `POST /api/imports` | 성공 시 `/app/import/review/:importJobId` 이동 |
| 상세 진입/새로고침 | `GET /api/imports/:importJobId` | 단계, 매핑, row, 오류 summary 복구 |
| 자동/수동 매핑 실행 | `POST /api/imports/:importJobId/map` | 매핑 select와 preview 갱신 |
| 컬럼 매칭 변경 | `PATCH /api/imports/:importJobId/mapping` | row validation 결과 갱신 |
| cell/row 수정 | `PATCH /api/imports/:importJobId/rows` | 수정 row와 count 갱신 |
| 전체 검증 | `POST /api/imports/:importJobId/validate` | confirm button 활성/비활성 결정 |
| 가져오기 확정 | `POST /api/imports/:importJobId/confirm` | 성공 이력 상세로 이동 |
| 취소 | `POST /api/imports/:importJobId/cancel` | `/app/import`로 이동 |
| 문제 이력 열기 | `GET /api/imports/:importJobId/errors` | 기본 화면이 아니라 보조 panel에서만 표시 |

Upload request 기준:

- User Web은 사용자가 선택한 대상(`COMPANY`, `CONTACT`, `PRODUCT`, `DEAL`)과 file만 `POST /api/imports`에 보낸다.
- `templateId`는 사용자에게 노출하지 않는다. Backend가 `targetType` 기준 active template을 찾아 `ImportJob.templateId`에 저장한다.
- 업로드 후 response의 `sourceColumns`와 `templateColumns`를 기준으로 mapping UI를 복구한다.

## 4. Query Key

기존 query key 네이밍 규칙을 따르되, 아래 단위를 분리한다.

```ts
['importJobs', 'active', { targetType }]
['importJobs', importJobId]
['importJobs', importJobId, 'errors']
['importUserLogs', { page, targetType }]
['importUserLogs', importUserLogId]
```

Mutation 후 invalidation:

- upload success: active jobs, import job detail
- mapping/update/validate success: import job detail
- confirm success: import job detail, active jobs, import user logs
- cancel success: active jobs

## 5. 화면 컴포넌트

### `/app/import`

구성:

- 상단 제목: `데이터 가져오기`
- 진행 중 작업 카드
- 대상 선택 segmented control: `회사`, `담당자`, `제품`, `딜`
- file dropzone
- 성공 내역 목록

상태:

- active job 없음: 바로 새 파일을 올릴 수 있게 한다.
- active job 있음: 가장 최근 job을 작은 카드로 보여준다.
- active job 여러 개: 최근순 list로 보여주되 화면을 복잡하게 만들지 않는다.

사용자 문구:

- `진행 중인 가져오기가 있어요.`
- `이어서 확인할 수 있어요.`
- `새 파일로 시작하기`
- `이어서 보기`

### `/app/import/review/:importJobId`

구성:

- 제목: 대상별 `회사 가져오기`, `담당자 가져오기`, `제품 가져오기`, `딜 가져오기`
- 단계 표시: `파일`, `컬럼 매칭`, `오류 확인`, `완료`
- 파일 summary: 파일명, row 수, 만료까지 남은 시간
- 컬럼 매칭 table: 파일 컬럼 -> onehand.sales 필드
- preview record table
- 하단 sticky action: `가져오기`, `나중에 이어서 하기`, `취소하기`

단계 계산:

| job status | 화면 단계 | primary action |
|---|---|---|
| `UPLOADED` | 컬럼 매칭 | 매칭 확인 |
| `MAPPED` | 컬럼 매칭 | 오류 확인 |
| `NEEDS_REVIEW` | 오류 확인 | 오류 row 저장 |
| `READY_TO_CONFIRM` | 오류 확인 | 가져오기 |
| `CONFIRMING` | 완료 처리 중 | disabled loading |
| `CONFIRMED` | 완료 | 성공 이력 이동 |
| `FAILED` | 오류 상태 | 새 파일로 시작 |
| `CANCELED` | 취소됨 | 새 파일로 시작 |
| `EXPIRED` | 만료됨 | 새 파일로 시작 |

## 6. UX 기준

Notion식 단순함:

- 단계는 많아 보여도 한 화면에서 해야 할 일은 하나만 강조한다.
- 내부 error log list를 기본 화면에 길게 펼치지 않는다.
- 사용자가 수정해야 하는 cell만 강조한다.
- action label은 짧게 쓴다.

Attio식 CRM 정확성:

- 연결 record가 있는 field는 단순 text input처럼 보이더라도 backend 검증 결과를 보여준다.
- 딜 import에서 회사/담당자/제품 연결 누락은 preview 단계에서 명확히 표시한다.
- confirm 전까지 실제 record가 생성되지 않는다는 전제를 지킨다.
- confirm 후 생성되는 관계는 success detail에서 확인 가능해야 한다.

금지:

- 화면에 `ImportJob`, `ImportJobRow`, `ImportJobError`, `ImportUploadedFile` 용어를 표시하지 않는다.
- 긴 기술 로그를 사용자에게 보여주지 않는다.
- 만료/취소/실패 job에서 confirm button을 유지하지 않는다.
- error response의 raw detail을 toast에 그대로 표시하지 않는다.

## 7. 오류 표시

Cell validation:

- cell 아래 짧은 문구를 보여준다.
- row 전체를 빨간색으로 덮지 않는다.
- 오류 row를 먼저 볼 수 있는 filter를 둔다.

Job-level error:

- 화면 상단 inline alert로 보여준다.
- 문구는 안전한 사용자 메시지만 사용한다.
- 보조 panel의 "문제 이력"은 필요할 때만 연다.

문구:

- `회사명을 입력해 주세요.`
- `휴대폰 번호를 다시 확인해 주세요.`
- `파일을 읽지 못했어요. 형식을 확인하고 다시 올려 주세요.`
- `문제가 생겼어요. 잠시 후 다시 시도해 주세요.`
- `이 가져오기는 만료됐어요. 새 파일로 다시 시작해 주세요.`

## 8. 상태 보존

서버 상태가 source of truth이다.

- mapping, row 수정, validation 결과는 모두 API 성공 response 기준으로 화면을 갱신한다.
- local component state는 편집 중 draft에만 사용한다.
- 새로고침 후 local draft는 버려도 되지만, 마지막 저장 성공 상태는 반드시 복구되어야 한다.
- "나중에 이어서 하기"는 별도 저장 API를 호출하지 않는다. 이미 서버에 저장된 상태를 기준으로 `/app/import`로 이동한다.

## 9. Mobile

- desktop table을 그대로 축소하지 않는다.
- row card/list로 전환한다.
- 오류 row를 우선 노출한다.
- row card를 열면 수정 가능한 field를 form 형태로 보여준다.
- 하단 sticky action은 한 줄에 들어가지 않으면 primary action만 보이고 secondary는 menu로 둔다.

## 10. Frontend 구현 파일 후보

실제 경로는 기존 구조를 확인한 뒤 맞춘다.

- `FE/user-web/src/features/import-export/api/*`
- `FE/user-web/src/features/import-export/components/*`
- `FE/user-web/src/features/import-export/hooks/*`
- `FE/user-web/src/features/import-export/pages/*`
- `FE/user-web/src/features/import-export/types/*`

필요 타입:

- `ImportJobStatus`
- `ImportJobRowStatus`
- `ImportJobMappingSource`
- `ImportJobSummary`
- `ImportJobDetail`
- `ImportJobRow`
- `ImportCellValidationError`
- `ImportJobError`

## 11. 테스트 기준

### Component

- active job card가 있을 때 이어서 보기 action이 노출된다.
- expired job detail은 confirm button을 숨긴다.
- invalid cell만 오류 문구를 보여준다.
- mapping 변경 후 row preview가 response 기준으로 갱신된다.
- confirm loading 중 중복 click이 막힌다.

### Integration / E2E

- 파일 업로드 후 detail route로 이동한다.
- detail route 새로고침 후 같은 mapping/row 상태가 보인다.
- 다른 사용자 job 404 응답은 `/app/import` 안내로 처리된다.
- invalid row 수정 후 confirm button이 활성화된다.
- confirm 성공 후 success history detail로 이동한다.
- cancel 후 active job 목록에서 사라진다.

## 12. 완료 기준

- 사용자는 `파일 올리기 -> 컬럼 매칭 확인 -> 오류 행만 수정 -> 가져오기 완료` 흐름으로만 이해한다.
- 새로고침/탭 이동 후 같은 job 상태가 복구된다.
- 만료/취소/실패 상태가 사용자를 막다른 화면에 두지 않는다.
- API request/response 타입이 `COMMON/API-SPEC/IMPORT_JOB_API.md`와 일치한다.
- 원본 파일 보관/삭제 문구가 실제 Backend 정책과 충돌하지 않는다.
