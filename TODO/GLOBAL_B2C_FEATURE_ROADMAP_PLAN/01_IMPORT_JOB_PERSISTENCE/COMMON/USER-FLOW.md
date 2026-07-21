# User Flow

상태: Confirmed
구현 상태: Done (G03/G04 완료, 2026-07-21)

## 1. UX 원칙

01의 사용자 경험은 Notion식 단순한 작업 흐름과 Attio식 CRM record 연결 정확성을 따른다.

- 사용자는 `ImportJob`, `ImportJobRow`, `ImportJobError`, `ImportUploadedFile` 같은 내부 개념을 보지 않는다.
- 화면은 `파일 올리기 -> 컬럼 매칭 확인 -> 오류 행만 수정 -> 가져오기 완료`로 보인다.
- 오류는 긴 로그가 아니라 row/cell 단위로 보인다.
- 진행 중 작업은 조용한 배너나 작은 카드로 이어받을 수 있게 한다.
- 가져온 결과는 회사, 담당자, 제품, 딜 record와 연결 관계를 정확하게 만든다.

## 2. 기본 흐름

```text
1. 사용자가 /app/import에 들어온다.
2. User Web이 GET /api/imports/active로 진행 중 작업을 확인한다.
3. 진행 중 작업이 있으면 "진행 중인 가져오기가 있어요" 카드를 보여준다.
4. 사용자가 가져올 대상을 선택한다.
   - 회사
   - 담당자
   - 제품
   - 딜
5. 사용자가 CSV/XLSX 파일을 올린다.
6. User Web이 POST /api/imports를 호출한다.
7. Backend가 파일 metadata, job, row를 저장한다.
8. Backend가 AI/rule mapping을 실행하거나 User Web이 POST /api/imports/:importJobId/map을 호출한다.
9. User Web은 컬럼 매칭 화면을 보여준다.
10. 사용자가 매칭을 확인하거나 바꾼다.
11. User Web이 PATCH /api/imports/:importJobId/mapping을 호출한다.
12. User Web은 preview table을 보여준다.
13. 오류가 있는 cell만 강조한다.
14. 사용자가 오류 cell 또는 row를 고친다.
15. User Web이 PATCH /api/imports/:importJobId/rows를 호출한다.
16. User Web이 POST /api/imports/:importJobId/validate를 호출한다.
17. 모든 필수 row가 valid이면 가져오기 버튼을 활성화한다.
18. User Web이 POST /api/imports/:importJobId/confirm을 호출한다.
19. Backend가 도메인 row와 성공 로그를 같은 transaction에서 생성한다.
20. User Web은 성공 화면으로 이동한다.
```

## 3. 새로고침/탭 이동 흐름

```text
1. 사용자가 mapping 또는 preview 화면에서 새로고침한다.
2. route의 importJobId로 GET /api/imports/:importJobId를 호출한다.
3. Backend가 job, mapping, row, validation summary를 반환한다.
4. User Web은 같은 단계 화면을 복구한다.
5. job이 만료됐으면 새 파일로 다시 시작하는 안내를 보여준다.
```

사용자 문구:

- `진행 중인 가져오기가 있어요.`
- `이어서 확인할 수 있어요.`
- `이 가져오기는 만료됐어요. 새 파일로 다시 시작해 주세요.`

## 4. 취소 흐름

```text
1. 사용자가 가져오기 화면에서 취소를 누른다.
2. 중앙 확인 dialog를 연다.
3. 사용자가 확인하면 POST /api/imports/:importJobId/cancel을 호출한다.
4. Backend는 job을 CANCELED로 바꾸고 원본 파일을 삭제 대상에 올린다.
5. User Web은 /app/import로 돌아간다.
```

사용자 문구:

- 확인 제목: `가져오기를 취소할까요?`
- 보조 문구: `지금까지 확인한 내용은 더 이상 이어서 볼 수 없어요.`
- 버튼: `닫기`, `취소하기`

## 5. 오류 표시 흐름

오류는 세 단계로 나눈다.

| 오류 종류 | 사용자 표시 | 저장 위치 |
|---|---|---|
| cell validation | 해당 cell 아래 짧은 문구 | `ImportJobRow.validationErrorsJson`, `ImportJobError` |
| job 처리 실패 | 화면 상단 error state | `ImportJob.lastErrorCode`, `ImportJob.lastErrorMessage`, `ImportJobError` |
| provider/storage/internal failure | 안전한 사용자 문구만 표시 | `ImportJobError.detailJson` redacted, structured log |

사용자 문구 예:

- `회사명을 입력해 주세요.`
- `휴대폰 번호를 다시 확인해 주세요.`
- `파일을 읽지 못했어요. 형식을 확인하고 다시 올려 주세요.`
- `문제가 생겼어요. 잠시 후 다시 시도해 주세요.`

## 6. 화면 구조

### /app/import

- 상단: `데이터 가져오기`
- 진행 중 작업 카드: 최근 active job 1개 또는 목록
- 대상 선택: 회사, 담당자, 제품, 딜
- 파일 올리기 영역
- 성공 내역 목록

### /app/import/review/:importJobId

- 상단: 대상별 제목. 예: `회사 가져오기`
- 단계 표시: 파일, 컬럼 매칭, 오류 확인, 완료
- 본문: 조용한 record table
- 오류 cell만 강조
- 하단 action:
  - `가져오기`
  - `나중에 이어서 하기`
  - `취소하기`

## 7. 모바일 기준

- desktop table을 그대로 억지로 유지하지 않는다.
- row card/list로 전환한다.
- 오류가 있는 row를 먼저 보여준다.
- row를 열면 수정 가능한 field 목록을 보여준다.
- 버튼은 화면 하단 sticky action으로 둔다.

## 8. Attio식 CRM 관계 기준

딜 Import는 연결 record 정확성이 가장 중요하다.

- 딜은 회사, 담당자, 제품 연결이 깨지면 안 된다.
- 누락 회사/담당자/제품 보정값은 preview 단계에서 사용자에게 확인받는다.
- confirm 전까지 실제 Company/Contact/Product/Deal을 만들지 않는다.
- confirm 성공 후에는 `DealCompany`, `DealContact`, `DealProduct`를 같은 transaction에서 만든다.

## 9. 완료 후 흐름

confirm 성공 후 User Web은 성공 내역 상세로 이동한다.

```text
/app/import/:importUserLogId
```

성공 문구:

- `가져오기를 완료했어요.`
- `25개 행을 저장했어요.`

성공 내역은 기존 `ImportUserLog`, `ImportUserLogRow`를 조회한다.
