# Goal Completion Checklist

상태: In Progress
최종 업데이트: 2026-07-26

## 1. 목적

07 Meeting Note AI Provider Log의 `/goal` 실행 완료 여부를 확인한다.

구현 goal은 타입/테스트/build 결과 없이 완료로 체크하지 않는다. 실제 실행하지 못한 검증이 있으면 체크하지 않고 사유를 남긴다.

## 2. Goal 완료 현황

| 완료 | Goal | 상태 | 완료일 | 완료 기준 | 증거 | 비고 |
|---|---|---|---|---|---|---|
| [x] | G01 Planning API DB Contract | Completed | 2026-07-26 | 현재 코드와 계약 대조, blocking 질문 없음 | `PLANNING-REVIEW.md`, `pnpm run prisma:validate` | G02 착수 가능 |
| [x] | G02 AI Provider Log DB Prisma | Completed | 2026-07-26 | Prisma enum/field/index/migration 구현 | `BE/prisma/schema.prisma`, `20260726020000_add_meeting_note_ai_provider_log_target`, `pnpm run prisma:validate`, `pnpm run prisma:generate`, `pnpm run typecheck` | 원격 DB target이라 migrate/seed 미실행 |
| [ ] | G03 Meeting Note AI Log Backend | Ready | - | ai-draft/stt-draft provider log와 safe failure 구현 | Backend test/typecheck/lint/build | G04 착수 가능 |
| [ ] | G04 Meeting Note Next Action Follow Up Backend | Ready | - | next action/follow-up draft API 구현 | Backend test/typecheck/lint/build | 후보만 반환 |
| [ ] | G05 Meeting Note AI User Web | Ready | - | 생성/상세 AI UX 구현 | User Web typecheck/lint/build/E2E 또는 QA | Notion/Attio 기준 |
| [ ] | G06 QA Review Closeout | Ready | - | REVIEW-CHECKLIST 통과와 문서 closeout | `REVIEW-CHECKLIST.md` | 07 closeout |

## 3. Goal별 체크 조건

### G01

- [x] 현재 `BE/prisma/schema.prisma`의 `AiProviderOperation`, `AiProviderCallLog`, `MeetingNote`를 확인했다.
- [x] 현재 `BE/src/modules/meeting-note`의 AI/STT provider 흐름을 확인했다.
- [x] 현재 `FE/user-web/src/features/meeting-note`의 생성 모달과 상세 화면을 확인했다.
- [x] 기존 다음 행동 저장 API `POST /api/deals/:dealId/following-action-logs`와 07 next action draft 흐름이 충돌하지 않는다.
- [x] `COMMON/API-SPEC/*` request/response가 실제 DTO 네이밍과 충돌하지 않는다.
- [x] transcript/raw/prompt/follow-up body 저장 금지 기준이 명확하다.
- [x] G02~G06 착수 blocking 질문이 없다.

### G02

- [x] `AiProviderOperation`에 meeting-note operation이 추가됐다.
- [x] `AiProviderCallLog.targetType`이 추가됐다.
- [x] `AiProviderCallLog.targetId`가 추가됐다.
- [x] `[userId, targetType, targetId, createdAt]` index가 추가됐다.
- [x] `MeetingNoteTranscript`, `MeetingNoteFollowUpDraft`, `MeetingNoteProviderCallLog` 같은 별도 table이 추가되지 않았다.
- [x] Prisma schema에 한글 `/// 기능 : ...` 주석이 있다.
- [x] migration SQL에 의도 주석 또는 COMMENT가 있다.
- [x] 기존 migration 파일을 수정하지 않았다.
- [x] 공유/운영성 DB에 무단 migrate/seed를 실행하지 않았다.
- [x] `pnpm run prisma:validate`가 통과했다.

### G03

- [ ] `POST /api/meeting-notes/ai-draft` 성공/실패 provider call log가 저장된다.
- [ ] `POST /api/meeting-notes/stt-draft` STT provider call log가 저장된다.
- [ ] `POST /api/meeting-notes/stt-draft` AI draft provider call log가 저장된다.
- [ ] text 원문, transcript 전문, prompt 전문, provider raw response가 DB/log에 남지 않는다.
- [ ] safe failure message가 사용자에게 노출된다.
- [ ] FE가 retry 가능 여부를 판단할 수 있다.
- [ ] provider unavailable/failed/parse failed test가 있다.

### G04

- [ ] `POST /api/meeting-notes/:meetingNoteId/next-actions/draft`가 구현됐다.
- [ ] `POST /api/meeting-notes/:meetingNoteId/follow-up-draft`가 구현됐다.
- [ ] 다른 사용자 회의록/딜/담당자 접근이 차단된다.
- [ ] 다음 행동 후보가 자동 저장되지 않는다.
- [ ] follow-up draft가 DB에 저장되지 않는다.
- [ ] follow-up 자동 발송이 실행되지 않는다.
- [ ] provider log가 성공/실패 모두 저장된다.
- [ ] redaction test가 있다.

### G05

- [ ] 회의록 생성 모달에서 STT transcript가 임시 표시만 된다.
- [ ] 저장 API body에 transcript가 들어가지 않는다.
- [ ] AI/STT 실패 시 직접 작성 흐름이 유지된다.
- [ ] 회의록 상세에 AI 후속 작업 section이 있다.
- [ ] 다음 행동 후보를 확인/수정 후 기존 following-action API로 저장할 수 있다.
- [ ] follow-up draft를 확인/수정/복사할 수 있다.
- [ ] User Web이 `/admin/api/*`를 호출하지 않는다.
- [ ] 모바일 390px/360px에서 버튼/텍스트가 겹치지 않는다.

### G06

- [ ] Backend `pnpm run prisma:validate` 통과
- [ ] Backend `pnpm run typecheck` 통과
- [ ] Backend `pnpm run lint` 통과
- [ ] Backend 관련 test 통과
- [ ] Backend `pnpm run build` 통과
- [ ] User Web `pnpm run typecheck` 통과
- [ ] User Web `pnpm run lint` 통과
- [ ] User Web `pnpm run build` 통과
- [ ] E2E 또는 수동 QA 결과 기록
- [ ] README, API-SPEC, BE-TODO, FE-TODO가 구현 결과와 일치한다.

## 4. 현재 기록

- 2026-07-26: 구현 착수 가능 문서 작성.
- 2026-07-26: G01 코드/API/DB/FE 계약 대조 완료. `cd BE && pnpm run prisma:validate` 통과. 로컬 Node `v22.21.1`로 engine warning이 있었지만 Prisma schema validation은 성공했다.
- 2026-07-26: G02 Prisma schema와 신규 migration 작성 완료. `cd BE && pnpm run prisma:validate`, `pnpm run prisma:generate`, `pnpm run typecheck` 통과. DB target이 Supabase host라 `migrate dev`, `migrate deploy`, `seed`는 실행하지 않았다.
- 아직 G03~G06 코드 구현은 실행하지 않았다.
