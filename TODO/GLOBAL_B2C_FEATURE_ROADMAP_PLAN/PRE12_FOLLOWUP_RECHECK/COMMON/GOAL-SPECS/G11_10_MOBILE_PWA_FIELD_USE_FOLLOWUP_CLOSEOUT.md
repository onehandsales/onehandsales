# G11 10 Mobile PWA Field Use Follow-up Closeout

상태: Completed / 문서 closeout 완료 / 구현 금지
작성일: 2026-08-06
검토일: 2026-08-06

## 1. 목표

`10_MOBILE_PWA_FIELD_USE`에서 완료한 mobile browser field-use 범위를 재오픈하지 않고, 10 밖으로 남은 후속 후보와 문서/코드 정합성 이슈를 PRE12 후보로 분류한다.

이 goal은 구현 goal이 아니다. `BE`, `FE` 코드 변경, API 계약 확정, Prisma migration 생성, PWA/offline/native 구현, 신규 User Web route 활성화는 하지 않는다.

2026-08-06 재검토 결과, `NEXT_BACKEND_API_BACKLOG_PLAN`과 `USER_WEB_PRODUCTIZATION_GAP_PLAN`에는 있으나 10/PRE12에 빠진 10 직접 후속 후보는 추가로 확인되지 않았다. 기능 구현은 재오픈하지 않고 `PRE12-F09`, `PRE12-F30`, `PRE12-F31`, `PRE12-F32` 분류를 유지한다.

## 2. 판단 근거

대조 기준:

- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/01_IMPORT_JOB_PERSISTENCE`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/03_WEEKLY_SCHEDULE_REPORT`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/09_PRODUCT_ANALYTICS`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN`
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`
- 실제 코드: `BE`, `FE/user-web`

확인한 완료 사실:

| 범위 | 현재 사실 |
| --- | --- |
| 모바일 기본 방향 | 10은 native app이 아니라 mobile browser field-use를 완료 범위로 닫았다. |
| BusinessCard capture | `FE/user-web/src/features/business-card/components/business-card-scan-screen.tsx`에 `input type=file`, `accept="image/*"`, `capture="environment"` 기반 후면 카메라/앨범 선택 UX가 있다. |
| BusinessCard OCR safe failure | `BE/prisma/migrations/20260731010000_add_business_card_safe_failure_fields/migration.sql`, `BE/prisma/schema.prisma`, `BE/src/modules/business-card`에 `BusinessCardScanLog` safe failure field와 `business_card_ocr_failed` server event가 있다. provider raw detail은 사용자 response/analytics/local draft에 넣지 않는다. |
| MeetingNote recording/STT | `FE/user-web/src/features/meeting-note/hooks/use-meeting-note-audio-recorder.ts`에서 `MediaRecorder` 지원 감지와 사용자 클릭 후 microphone permission을 처리하고, `BE/src/modules/meeting-note/presentation/http/meeting-note.controller.ts`의 기존 `/api/meeting-notes/stt-draft`를 재사용한다. |
| Local draft | `FE/user-web/src/features/mobile-local-draft`에 IndexedDB primary, localStorage fallback, 24시간 TTL, 복원/폐기 UX가 있다. server draft DB, `UserDraft`, audio/image binary 저장은 없다. |
| Browser push permission UX | `/app/notifications`에서 사용자 클릭 후 `Notification.requestPermission()`을 호출하고 기존 notification settings/subscription API를 재사용한다. `FE/user-web/public/notification-sw.js`는 browser push용 service worker로만 본다. |
| Mobile analytics | `BE/src/modules/analytics`와 `FE/user-web/src/features/analytics`에 mobile field-use client event allowlist와 PII/raw payload 금지 기준이 있다. |
| PWA/offline/native | `FE/user-web`에서 `vite-plugin-pwa`, `workbox`, `manifest.webmanifest`, offline shell/full offline sync/native app 구현은 확인되지 않았다. |

## 3. 문서/코드 정합성 발견 사항

| 발견 사항 | PRE12 연결 | 판단 |
| --- | --- | --- |
| 10 FE/BE TODO 체크리스트 미체크 | `PRE12-F31` | `README`, `GOAL-COMPLETION-CHECKLIST`, G07 closeout, 실제 코드 기준으로 10은 완료다. 다만 `10/FE-TODO/USER-WEB-TODO.md`의 G03~G06, `10/BE-TODO/API-TODO.md`의 G03/G05/G06 체크박스가 미완료로 남아 후속 작업자가 오해할 수 있다. |
| FE generic ExportJob 잔여 코드 | `PRE12-F09` | `/app/export` route는 `/app`으로 redirect되고 BE `ExportJob`/`/api/exports` 구현은 없다. 다만 FE에 `ExportScreen`, `/api/exports` client/hook/type이 남아 있다. post-12 전에는 route/API를 열지 않는다. |
| FE route architecture 문서 stale | `PRE12-F32` | 실제 router에는 `/app/notifications`가 활성이고 `/app/export`만 redirect다. `FE/ARCHITECTURE.md`, `FE/user-web/ARCHITECTURE.md`는 `/app/notifications`도 redirect라고 적고 있어 문서 정정 후보로 둔다. |
| PWA/offline/native packaging | `PRE12-F30` | 10은 mobile browser field-use 완료다. PWA install/offline shell/full offline sync, iOS/Android native app, native push/contact/calendar, native install attribution은 10 미완성이 아니라 별도 mobile roadmap 후보다. |

## 4. PRE12 후보 분류

| 후보 | PRE12 ID | 분류 | 판단 |
| --- | --- | --- | --- |
| generic ExportJob/PDF | `PRE12-F09` | post-12-seed | 03/11 후속이다. FE 잔여 코드는 있어도 사용자 노출 route와 BE API/model은 없다. |
| PWA/native packaging과 install attribution | `PRE12-F30` | post-12-seed / 별도 mobile roadmap | 10을 재오픈하지 않는다. PWA/offline/full offline sync/native bridge/native attribution 계약은 post-12 또는 별도 mobile roadmap에서 만든다. |
| 10 FE/BE TODO 체크리스트 정합성 | `PRE12-F31` | pre-12-doc-cleanup | 구현 누락이 아니라 문서 체크리스트 정리 대상이다. |
| User Web route/architecture 문서 정합성 | `PRE12-F32` | pre-12-doc-cleanup | 실제 route를 기준으로 architecture 문서를 정정한다. route를 문서에 맞춰 되돌리지 않는다. |

## 5. 구현 금지

이 goal에서는 아래를 하지 않는다.

- `UserDraft`, `/api/drafts/*`, server draft DB 추가
- audio/image binary, transcript 전문, provider raw response 저장 table/API 추가
- `BusinessCardScanLog` safe failure 외 10 범위 신규 DB model 추가
- `NotificationSourceType` 또는 notification marketing opt-in API 확장
- mobile analytics runtime event를 payload 계약 없이 추가
- PWA manifest, offline shell, full offline sync, cache strategy, workbox/vite-plugin-pwa 추가
- iOS/Android native app, native push/contact/calendar bridge 추가
- `/app/export` route 활성화
- `/api/exports`, `ExportJob`, export file retention API/model 추가
- FE architecture stale 문서에 맞추기 위해 `/app/notifications` route를 redirect로 되돌리기

## 6. 코드 재대조 기준

확인한 주요 코드 기준:

```powershell
rg -n "safeErrorCode|safeErrorMessage|business_card_ocr_failed|OCR_FAILED" BE\prisma\schema.prisma BE\src\modules\business-card FE\user-web\src\features\business-card -g "*.ts" -g "*.tsx" -g "*.prisma"
rg -n "stt-draft|MediaRecorder|getUserMedia|audioFile|transcriptLength" BE\src\modules\meeting-note FE\user-web\src\features\meeting-note -g "*.ts" -g "*.tsx"
rg -n "MOBILE_LOCAL_DRAFT_TTL_MS|IndexedDB|localStorage|audioBase64|transcript|providerResponse" FE\user-web\src\features\mobile-local-draft -g "*.ts" -g "*.tsx"
rg -n "Notification.requestPermission|browser-push|public-key|endpointHash|p256dhCiphertext|notification-sw" BE\src\modules\notification FE\user-web\src\features\notification FE\user-web\public\notification-sw.js -g "*.ts" -g "*.tsx" -g "*.js"
rg -n "business_card_capture|meeting_note_recording|local_draft|mobile_push_permission|FORBIDDEN_PAYLOAD_KEY_CODES" BE\src\modules\analytics FE\user-web\src\features\analytics -g "*.ts" -g "*.tsx"
rg -n "UserDraft|/api/drafts|model UserDraft|MobileDraft" BE\src BE\prisma\schema.prisma FE\user-web\src -g "*.ts" -g "*.tsx" -g "*.prisma"
rg -n "api/exports|ExportJob|exportJob|ExportScreen" BE\src BE\prisma\schema.prisma FE\user-web\src -g "*.ts" -g "*.tsx" -g "*.prisma"
rg -n "path: \"notifications\"|path: \"export\"|notification-sw|serviceWorker|workbox|vite-plugin-pwa|manifest" FE\user-web
```

## 7. 완료 기준

- [x] 10 완료 범위를 mobile browser field-use로 유지한다고 기록했다.
- [x] PWA/offline/native는 `PRE12-F30`으로 유지하고 10 미완성으로 보지 않는다고 기록했다.
- [x] generic ExportJob은 `PRE12-F09`이며 FE 잔여 코드가 있어도 post-12 전 route/API 활성화 대상이 아니라고 기록했다.
- [x] 10 FE/BE TODO 체크리스트 정합성 이슈를 `PRE12-F31`로 분리했다.
- [x] User Web route/architecture 문서 stale 이슈를 `PRE12-F32`로 분리했다.
- [x] `UserDraft`, server draft DB, media/raw 저장, PWA/offline/native, `/app/export`, `/api/exports` 구현 금지를 명시했다.
- [x] `NEXT_BACKEND_API_BACKLOG_PLAN`과 `USER_WEB_PRODUCTIZATION_GAP_PLAN`에는 있으나 10/PRE12에 빠진 10 직접 후속 후보가 추가로 없는지 재확인했다.
