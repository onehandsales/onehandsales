# G08 07 MeetingNote AI Follow-up Defer Closeout

상태: Pending
목표: 07 완료 범위를 유지하면서 07에서 제외되었거나 후속으로 남은 MeetingNote AI 후보를 `PRE12_FOLLOWUP_RECHECK` 안에서 분류하고, 구현 금지 경계를 닫는다.

## 1. 판단 근거

- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/07_MEETING_NOTE_AI_PROVIDER_LOG`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/07_MEETING_NOTE_AI_PROVIDER_LOG/COMMON/SOURCE-PLAN-COVERAGE.md`
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN`
- 실제 구현 상태: `BE/prisma/schema.prisma`, `BE/src/modules/meeting-note`, `BE/src/modules/notification`, `FE/user-web/src/features/meeting-note`

## 2. 07 완료로 유지할 것

아래 항목은 07의 구현 완료 범위다. 이 goal에서 다시 구현하거나 완료 의미를 바꾸지 않는다.

- MeetingNote AI/STT draft provider call log
- `AiProviderCallLog`의 MeetingNote target/operation 확장
- `POST /api/meeting-notes/ai-draft`
- `POST /api/meeting-notes/stt-draft`
- `POST /api/meeting-notes/:meetingNoteId/next-actions/draft`
- `POST /api/meeting-notes/:meetingNoteId/follow-up-draft`
- User Web meeting note detail의 AI 후속 작업 section
- STT transcript 임시 표시와 저장 request body 제외
- next action 후보의 사용자 확인 후 기존 Deal following-action API 저장
- follow-up draft의 사용자 수정/복사 흐름
- provider raw, prompt, transcript 전문, follow-up body 전문 미저장 redaction 기준

## 3. PRE12 후보로 남길 것

| 후보 | 연결 후보 ID | 현재 분류 | 다음 조치 |
| --- | --- | --- | --- |
| 회의록 follow-up reminder | `PRE12-F02`, `G03` | post-12-seed | 알림 source, 취소, 재시도, 사용자 설정, draft/send 상태 계약 전 구현 금지 |
| MeetingNote follow-up 자동 발송 | `PRE12-F03`, `G03` | post-12-seed / 정책 결정 필요 | 명시적 사용자 동의, 발송 예약, 실패/재시도, unsubscribe, 비용 정책 전 구현 금지 |
| MeetingNote list latest/next summary | `PRE12-F08`, `G04` | post-12-seed | `GET /api/meeting-notes` 응답 필드 또는 별도 summary endpoint 계약 전 구현 금지 |
| AI data cleanup 제안 저장/적용 | `PRE12-F14` | post-12-seed / 별도 data quality 계획 | 09 Product Analytics 또는 별도 data quality TODO에서 필요성, 적용 권한, 감사 로그, rollback 기준 결정 |
| transcript/raw provider response/follow-up draft 저장 table | `PRE12-F15` | defer / 정책 필요 | 명시적 retention, 삭제권, raw access audit, redaction 정책 없이는 구현 금지 |
| MeetingNote Admin/internal provider audit 조회 | `PRE12-F16` | done | 11 Admin Operation 완료 범위를 참조한다. 07 또는 PRE12에서 재구현하지 않는다. |

## 4. 구현 금지

이 goal만으로 아래 작업을 시작하지 않는다.

- `NotificationSourceType`에 `MEETING_NOTE`, `FOLLOW_UP`, `NEXT_ACTION` 추가
- MeetingNote follow-up reminder scheduler, due processor, notification row 생성
- follow-up 자동 발송 worker 또는 자동 발송 toggle
- `GET /api/meeting-notes`에 `latestSummary`, `nextActionSummary` 필드 추가
- `MeetingNoteTranscript`, `MeetingNoteFollowUpDraft`, raw provider response 전용 table 추가
- AI data cleanup 제안 저장/적용 API 추가
- FE에서 API에 없는 MeetingNote list summary를 조합해 표시
- FE에서 transcript 원문, follow-up body 전체, provider raw를 목록/상세/admin 화면에 노출
- 11에서 닫힌 Admin provider audit/raw access 흐름 재구현

## 5. 확인 명령

```powershell
rg -n "latestSummary|nextActionSummary|MeetingNoteTranscript|MeetingNoteFollowUpDraft|rawProvider|providerRaw" BE FE
rg -n "enum NotificationSourceType|enum NotificationType|model Notification|model UserNotificationSetting" BE\prisma\schema.prisma
rg -n "ai-draft|stt-draft|next-actions/draft|follow-up-draft" BE\src\modules\meeting-note FE\user-web\src\features\meeting-note
```

## 6. 완료 기준

- `COMMON/CANDIDATE-MATRIX.md`에 07 후속 후보가 별도 ID로 보인다.
- `COMMON/GOAL-WORK-ORDER.md`에서 G08은 구현 goal이 아니라 closeout goal로 표시된다.
- `BE-TODO`, `FE-TODO`, `COMMON/API-SPEC`에 07 후속 후보의 구현 금지 조건이 연결된다.
- 07 완료 폴더에는 새 구현 goal을 만들지 않는다.
- 코드, Prisma migration, FE route/client 변경이 없다.
