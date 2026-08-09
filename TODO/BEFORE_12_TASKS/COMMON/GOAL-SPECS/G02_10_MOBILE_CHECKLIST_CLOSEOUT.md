# G02 10 Mobile Checklist Closeout

상태: Done
연결 PRE12 ID: `PRE12-F31`
성격: 문서 정합성 closeout
최근 실행 로그: `TODO/BEFORE_12_TASKS/TODO_LOG/2026-08-09/G02_10_MOBILE_CHECKLIST_CLOSEOUT/WORK_LOG.md`

## 0. 착수 체크리스트

- [x] `TODO/BEFORE_12_TASKS/COMMON/SCOPE.md`를 확인한다.
- [x] `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE` 전체 상태를 확인한다.
- [x] 10 G07 QA/document closeout 결과를 확인한다.
- [x] 실제 `FE/user-web`와 `BE` 관련 코드 상태를 확인한다.
- [x] `BE/prisma/schema.prisma`에서 10 관련 DB 상태를 확인한다.
- [x] 새 API/DB/route를 만들지 않는 기준을 확인한다.
- [x] 코드 변경 발생 시 한글 주석 규칙과 typecheck/lint gate를 확인한다.

## 1. 목표

10 Mobile Field Use의 완료 문서, 개별 goal 문서, 실제 BE/FE 코드와 stale TODO/checklist 상태를 맞춘다.

## 2. 포함 범위

- `10_MOBILE_PWA_FIELD_USE/README.md` 상태 정합성
- `10_MOBILE_PWA_FIELD_USE/COMMON/GOAL-COMPLETION-CHECKLIST.md` 정합성
- `10_MOBILE_PWA_FIELD_USE/COMMON/GOAL-SPECS/README.md` 정합성
- `10_MOBILE_PWA_FIELD_USE/FE-TODO/USER-WEB-TODO.md` 체크리스트 정합성
- `10_MOBILE_PWA_FIELD_USE/BE-TODO/API-TODO.md` 체크리스트 정합성
- 10 README, G07 closeout, goal specs 완료 상태와 비교
- 실제 BE/FE 코드 확인 결과 기록
- 완료된 항목의 `[x]` 보정과 closeout 근거 기록

## 3. 제외 범위

- PWA install/offline shell 구현
- iOS/Android native app 구현
- BusinessCard custom camera preview/crop 구현
- server draft/media raw storage 구현
- `UserDraft`, `/api/drafts/*` 추가
- `/api/exports`, `ExportJob` 추가
- Notification TTL/cleanup 확장
- 모바일 기능 재구현

## 4. 확인 대상

문서:

- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE/README.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE/COMMON/GOAL-COMPLETION-CHECKLIST.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE/COMMON/GOAL-SPECS/README.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE/COMMON/GOAL-SPECS/G07_QA_DOCUMENT_CLOSEOUT.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE/BE-TODO/API-TODO.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE/FE-TODO/USER-WEB-TODO.md`

코드:

- `FE/user-web/src/features/business-card`
- `FE/user-web/src/features/meeting-note`
- `FE/user-web/src/features/mobile-local-draft`
- `FE/user-web/src/features/notification`
- `FE/user-web/src/app/router/router.tsx`
- `BE/src/modules/meeting-note`
- `BE/src/modules/notification`
- `BE/src/modules/analytics`
- `BE/prisma/schema.prisma`

## 5. Request/Response 체크

G02는 새 API를 만들지 않는다.

- 10 문서에 이미 구현된 API가 실제 코드와 맞는지 확인한다.
- `/api/drafts/*`, `/api/exports`는 추가하지 않는다.
- request/response 변경이 필요해 보이면 현재 goal에서 구현하지 않고 post-12 후보로 기록한다.

## 6. Business Logic / User Flow 체크

- 모바일 브라우저 기준 flow가 실제 구현과 문서에서 충돌하지 않는다.
- offline/PWA/native는 현재 완료 범위로 오해되지 않는다.
- server draft/raw media storage는 현재 완료 범위로 오해되지 않는다.
- Notification 확장 후보는 post-12 후보로 남긴다.
- UX/UI는 Notion식 작업공간과 Attio식 record 흐름을 해치지 않는다.

## 7. DB/Prisma 체크

- `BE/prisma/schema.prisma`에서 10 완료 범위에 필요한 모델이 실제 존재하는지 확인한다.
- `UserDraft`, `ExportJob`가 없음을 미완성으로 재오픈하지 않는다.
- 새 schema/migration을 추가하지 않는다.

## 8. 작업 순서

1. 10 상위 문서와 G07 closeout을 읽는다.
2. 10 FE/BE TODO의 미체크 항목을 실제 완료 상태와 비교한다.
3. 실제 BE/FE 코드 경로를 확인한다.
4. 완료된 항목은 `[x]`로 보정하고 근거를 남긴다.
5. post-12 후보는 완료 범위가 아니라 후속 후보로 명시한다.
6. 변경 결과가 PRE12 final classification과 충돌하지 않는지 확인한다.

## 9. 검증 명령

Backend:

```bash
cd BE
pnpm run typecheck
pnpm run lint
```

Frontend:

```bash
cd FE/user-web
pnpm run typecheck
pnpm run lint
```

문서/정적 확인:

```bash
git diff --check
rg -n "UserDraft|/api/drafts|ExportJob|/api/exports" TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE TODO/BEFORE_12_TASKS
```

## 10. 완료 기준

- [x] 10 FE TODO의 완료된 G03~G06 항목이 실제 상태에 맞게 정리됐다.
- [x] 10 BE TODO의 완료된 G03/G05/G06 항목이 실제 상태에 맞게 정리됐다.
- [x] 10 README와 goal completion checklist가 G07 closeout 상태와 맞는다.
- [x] 10 완료 범위와 post-12 후보가 섞이지 않는다.
- [x] PWA/native/server draft/export를 10 미완성으로 재오픈하지 않는다.
- [x] BE typecheck/lint가 통과했다.
- [x] FE user-web typecheck/lint가 통과했다.

## 11. 결과 기록 위치

권장 결과 기록:

```text
TODO/BEFORE_12_TASKS/TODO_LOG/<YYYY-MM-DD>/G02_10_MOBILE_CHECKLIST_CLOSEOUT/WORK_LOG.md
```

## 12. 권장 실행 문구

```text
/goal TODO/BEFORE_12_TASKS/COMMON/GOAL-SPECS/G02_10_MOBILE_CHECKLIST_CLOSEOUT.md 기준으로 G02를 진행해줘.
```

## 13. 관련 문서

- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/PRE12_FOLLOWUP_RECHECK/COMMON/GOAL-SPECS/G11_10_MOBILE_PWA_FIELD_USE_FOLLOWUP_CLOSEOUT.md`
- `TODO/BEFORE_12_TASKS/FE-TODO/USER-WEB-TODO.md`
- `TODO/BEFORE_12_TASKS/BE-TODO/API-TODO.md`
