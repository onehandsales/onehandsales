# 10 Mobile PWA Field Use

상태: Done
순서: 10
성격: Global B2C 개인 영업자 모바일 현장 사용성 필수 구현 슬롯
결정 상태: `COMMON/DECISION-LOG.md` 2026-07-30 확정 결정 반영
완료일: 2026-07-31

## 1. 목적

10번은 모바일이 필요한지 검증하는 슬롯이 아니다. 개인 영업자에게 모바일 현장 사용성은 필수 사용 환경이다.

1차 구현은 native app이 아니라 모바일 브라우저/PWA 기반으로 진행했다. 가장 빠르게 Global B2C 사용자에게 현장 입력성을 제공하기 위해 `/app/business-cards`, `/app/meeting-notes`, `/app/notifications`의 모바일 사용 흐름을 구체화했다.

## 2. 1차 확정 범위

| 범위 | 결정 |
|---|---|
| 모바일 기본 방향 | 모바일 브라우저 현장 입력 우선. PWA install/offline shell은 후속 문서화 대상 |
| 명함 촬영 | `input type=file` + `accept="image/*"` + `capture="environment"` 기반 후면 카메라 호출 |
| OCR 실패 계약 | `errorCode`, `userMessage`, `retryable` 안전 계약을 확정하고 provider raw detail은 사용자 응답에서 제외 |
| 회의록 음성 | `MediaRecorder` 기반 브라우저 녹음 UX를 구현하고 기존 `/api/meeting-notes/stt-draft`를 재사용 |
| local draft | 서버 DB draft가 아니라 FE local draft. 24시간 TTL, 복원 확인 UX |
| 모바일 알림 권한 | 02 Notification API를 재사용하고 모바일 permission UX만 보강 |
| 알림 동의 | 회원가입/약관 동의로 browser push를 자동 허용한 것으로 간주하지 않는다 |
| Analytics | 모바일 필수 기능 품질 개선용 event를 09 foundation에 추가 |
| Native app | iOS/Android 모두 필수 후속 로드맵. 10번에서는 별도 필수 항목으로 승격만 한다 |

## 3. 현재 코드 기준

- `FE/user-web/src/features/business-card`는 이미지 업로드 기반 `명함스캔` 흐름을 제공한다.
- `POST /api/business-card-scans`는 `image` multipart 파일을 받아 OCR scan log를 만든다.
- 현재 `BusinessCardScanLog`는 `OCR_FAILED` 상태는 갖지만 사용자-facing 안전 실패 code/message/retryable을 영속 저장하지 않는다.
- `FE/user-web/src/features/meeting-note`는 음성 파일 업로드 기반 `STT_AI` draft를 제공한다.
- `POST /api/meeting-notes/stt-draft`는 `audio` multipart 파일과 회의 맥락을 받아 STT+AI 초안을 반환한다.
- `FE/user-web/src/features/notification`과 `BE/src/modules/notification`은 browser push 구독/설정 API를 이미 제공한다.
- `BE/src/modules/analytics`와 `FE/user-web/src/features/analytics`는 09 Product Analytics foundation을 제공한다.

## 4. `/goal` 실행 방식

10번은 하나의 `/goal`로 끝내지 않고 각 `/goal`을 `COMMON/GOAL-SPECS`의 상세 명세 하나만 기준으로 실행했다.

권장 순서:

```text
G01_DOCUMENT_CONTRACT_SYNC
-> G02_BUSINESS_CARD_MOBILE_CAPTURE_AND_FAILURE
-> G03_MEETING_NOTE_MOBILE_RECORDING
-> G04_LOCAL_DRAFT_RECOVERY
-> G05_MOBILE_NOTIFICATION_PERMISSION_UX
-> G06_MOBILE_FIELD_ANALYTICS_EVENTS
-> G07_QA_DOCUMENT_CLOSEOUT
```

모든 goal은 구현 전에 `COMMON/IMPLEMENTATION-CONTRACT-RULES.md`, `COMMON/GOAL-REVIEW-CHECKLIST.md`, 해당 goal 문서의 `Goal 검토 체크리스트`를 확인해야 한다.

## 5. 10 완료 기준

- 모바일에서 명함을 촬영하거나 앨범에서 선택해 OCR을 요청할 수 있다.
- OCR 실패 시 provider/quota/API key/internal stack을 노출하지 않고 안전한 실패 안내와 재시도 행동을 보여준다.
- 모바일 브라우저에서 회의 직후 음성을 녹음해 STT+AI 초안을 만들 수 있다.
- 녹음 권한 거부 또는 미지원 브라우저에서 음성 파일 업로드 fallback을 제공한다.
- 명함 확인 폼과 회의록 작성 폼의 local draft가 24시간 TTL로 복원/폐기된다.
- browser push 권한은 사용자 명시 클릭으로만 요청하고, 거부/미지원 fallback을 제공한다.
- 모바일 field-use analytics event가 allowlist payload로만 저장된다.
- 이미지, 음성 파일, transcript, 회의록 본문, 명함 원문, provider raw response는 analytics/log/local draft에 무기한 저장하지 않는다.
- iOS/Android native app은 후속 필수 로드맵으로 문서화된다.

## 6. 참고

- `COMMON/DECISION-LOG.md`
- `COMMON/USER-FLOW.md`
- `COMMON/API-SPEC/README.md`
- `COMMON/GOAL-WORK-ORDER.md`
- `COMMON/GOAL-SPECS/README.md`
- `COMMON/SOFTWARE-AGENT-REVIEW.md`
- `COMMON/UXUI-AGENT-REVIEW.md`
- `COMMON/GOAL-COMPLETION-CHECKLIST.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/09_PRODUCT_ANALYTICS`
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN`
- `AGENT/UXUI_AGENT`
- `AGENT/SOFTWARE_AGENT`
- `BE/prisma/schema.prisma`

## 7. 완료 반영

- G01~G07 순서로 구현과 QA closeout을 완료했다.
- 명함 모바일 촬영, OCR safe failure 계약, 회의록 모바일 녹음과 음성 파일 fallback, client local draft 24시간 TTL, browser push permission UX, mobile field analytics event를 구현했다.
- `BusinessCardScanLog` safe failure field migration 외 신규 DB model은 만들지 않았고, `UserDraft`, server draft DB, audio/image binary 저장은 만들지 않았다.
- provider raw detail, transcript 전문, audio/image raw data, push endpoint/key/token, PII/raw text가 response/log/analytics/local draft에 저장되지 않는지 G07에서 확인했다.
- 360px/390px mobile QA, BE/FE targeted test, BE/FE typecheck/lint, `git diff --check`를 통과했다.
- PWA install/offline shell과 iOS/Android native app은 10 1차 완료 범위가 아니라 후속 로드맵 범위로 유지한다.
