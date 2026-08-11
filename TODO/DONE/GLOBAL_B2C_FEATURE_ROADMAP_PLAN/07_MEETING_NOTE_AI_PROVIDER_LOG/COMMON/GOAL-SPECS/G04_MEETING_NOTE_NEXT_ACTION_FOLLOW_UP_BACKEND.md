# G04 Meeting Note Next Action Follow Up Backend

상태: Completed
목표: 회의록 기반 다음 행동 후보와 follow-up draft Backend 구현
완료일: 2026-07-26

## 1. 목적

저장된 회의록에서 다음 행동 후보와 고객 follow-up 문안을 생성한다. AI 결과는 사용자 확인 전까지 DB를 변경하지 않는다.

## 1.1 완료 결과

- `POST /api/meeting-notes/:meetingNoteId/next-actions/draft`를 추가했다.
- `POST /api/meeting-notes/:meetingNoteId/follow-up-draft`를 추가했다.
- `MeetingNoteAiActionDraftApplicationService`가 회의록 소유권/soft delete와 연결 딜/담당자 검증을 담당한다.
- 다음 행동 후보는 최대 3개로 정규화하고 `clientSuggestionId`, `title`, `memo`, `recommendedDueDate`, `dealId`, `confidence`, `reason`만 반환한다.
- follow-up 문안은 EMAIL/SMS별 `subject`, `body`, `copyableText`, `suggestedRecipient`만 반환한다.
- 다음 행동 자동 저장, follow-up draft DB 저장, 이메일/SMS 자동 발송은 구현하지 않았다.
- `MEETING_NOTE_NEXT_ACTION_DRAFT`, `MEETING_NOTE_FOLLOW_UP_DRAFT` provider call log 성공/실패 기록을 구현했다.
- provider log metadata에는 길이/count/boolean/channel/language만 저장하고 회의록 본문, follow-up body, prompt 전문, provider raw, 연락처 이메일/전화번호를 저장하지 않도록 테스트했다.
- `pnpm run typecheck`, `pnpm run lint`, `pnpm run test -- meeting-note`, `pnpm run test -- deal`, `pnpm run build`를 통과했다.

## 2. 선행 조건

- G03 완료

## 3. 포함 범위

- `POST /api/meeting-notes/:meetingNoteId/next-actions/draft`
- `POST /api/meeting-notes/:meetingNoteId/follow-up-draft`
- MeetingNote ownership/soft delete 검증
- 연결된 deal/contact ownership 검증
- Provider call log success/failure
- 후보/초안 정규화
- safe failure response
- controller/application/provider test

## 4. 제외 범위

- 다음 행동 자동 저장
- follow-up draft DB 저장
- 이메일/SMS 자동 발송
- Admin 운영 API
- Meeting Note list AI summary

## 5. Next Action Backend 작업

1. DTO를 추가한다.
2. `meetingNoteId` 소유권과 soft delete 상태를 확인한다.
3. 선택 `dealId`가 회의록에 연결된 현재 사용자 소유 딜인지 확인한다.
4. 회의록 `details`, `nextPlan`, `requiredAction`, 연결 snapshot으로 provider input을 만든다.
5. `MEETING_NOTE_NEXT_ACTION_DRAFT` operation으로 provider log를 기록한다.
6. 후보를 최대 3개로 정규화한다.
7. `clientSuggestionId`, `title`, `memo`, `recommendedDueDate`, `dealId`, `confidence`, `reason` 형식으로 반환한다.
8. DB에는 다음 행동을 저장하지 않는다.

주의:

- 기존 following-action 저장 API는 `followingAction` 문자열만 받는다.
- `recommendedDueDate`, `memo`, `reason`은 07 1차에서 저장하지 않는다.

## 6. Follow Up Backend 작업

1. DTO를 추가한다.
2. `meetingNoteId` 소유권과 soft delete 상태를 확인한다.
3. 선택 `recipientContactId`, `dealId`가 회의록 맥락과 사용자 소유권을 만족하는지 확인한다.
4. 채널별 provider input을 만든다.
5. `MEETING_NOTE_FOLLOW_UP_DRAFT` operation으로 provider log를 기록한다.
6. EMAIL/SMS별 subject/body/copyableText를 정규화한다.
7. DB에는 follow-up draft 전문을 저장하지 않는다.
8. 발송 provider를 호출하지 않는다.

## 7. API 계약

- Request/response는 `COMMON/API-SPEC/MEETING_NOTE_NEXT_ACTION_FOLLOW_UP_API.md`를 따른다.
- User API path는 `/api/*`만 사용한다.
- 다른 사용자 resource는 안전한 not found로 처리한다.

## 8. 검증

```powershell
cd BE
pnpm run typecheck
pnpm run lint
pnpm run test -- meeting-note
pnpm run test -- deal
pnpm run build
```

## 9. 완료 기준

- [x] 두 신규 API가 구현됐다.
- [x] 후보/초안만 반환하고 DB 저장/발송이 없다.
- [x] provider log가 성공/실패 모두 저장된다.
- [x] raw/follow-up body/prompt redaction test가 있다.
- [x] 코드 작업 시 한글 주석이 추가됐다.
- [x] `COMMON/GOAL-COMPLETION-CHECKLIST.md`의 G04 항목이 갱신됐다.
