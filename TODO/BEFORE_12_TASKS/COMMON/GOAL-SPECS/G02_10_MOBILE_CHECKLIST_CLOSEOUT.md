# G02 10 Mobile Checklist Closeout

상태: Draft / Skeleton
연결 PRE12 ID: `PRE12-F31`

## 1. 목표

10 Mobile Field Use의 완료 문서, 개별 goal 문서, 실제 BE/FE 코드와 stale TODO/checklist 상태를 맞춘다.

## 2. 포함 범위

- `10_MOBILE_PWA_FIELD_USE/FE-TODO/USER-WEB-TODO.md` 체크리스트 정합성
- `10_MOBILE_PWA_FIELD_USE/BE-TODO/API-TODO.md` 체크리스트 정합성
- 10 README, G07 closeout, goal specs 완료 상태와 비교
- 실제 BE/FE 코드 확인 결과 기록

## 3. 제외 범위

- PWA install/offline shell 구현
- iOS/Android native app 구현
- BusinessCard custom camera preview/crop 구현
- server draft/media raw storage 구현
- `UserDraft`, `/api/drafts/*` 추가
- `/api/exports`, `ExportJob` 추가

## 4. 확인 대상

- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE`
- `FE/user-web/src/features/business-card`
- `FE/user-web/src/features/meeting-note`
- `FE/user-web/src/features/mobile-local-draft`
- `FE/user-web/src/features/notification`
- `BE/src/modules/meeting-note`
- `BE/src/modules/notification`
- `BE/src/modules/analytics`
- `BE/prisma/schema.prisma`

## 5. 완료 기준

- [ ] 10 FE TODO의 완료된 G03~G06 항목이 실제 상태에 맞게 정리됐다.
- [ ] 10 BE TODO의 완료된 G03/G05/G06 항목이 실제 상태에 맞게 정리됐다.
- [ ] 10 완료 범위와 post-12 후보가 섞이지 않는다.
- [ ] PWA/native/server draft/export를 10 미완성으로 재오픈하지 않는다.

## 6. 관련 문서

- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/PRE12_FOLLOWUP_RECHECK/COMMON/GOAL-SPECS/G11_10_MOBILE_PWA_FIELD_USE_FOLLOWUP_CLOSEOUT.md`
