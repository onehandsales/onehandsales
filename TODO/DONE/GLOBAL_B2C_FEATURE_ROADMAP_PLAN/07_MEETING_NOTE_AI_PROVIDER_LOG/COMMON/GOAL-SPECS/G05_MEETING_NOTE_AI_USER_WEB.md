# G05 Meeting Note AI User Web

상태: Completed
목표: 회의록 AI 초안, 다음 행동 후보, follow-up draft UX 구현

## 1. 목적

회의록 생성/상세 화면에서 AI 기능을 사용자가 실제 업무에 바로 활용할 수 있게 만든다. UX는 Notion의 문서 편집 편의성과 Attio의 linked record 맥락을 참고한다.

## 2. 선행 조건

- G04 완료

## 3. 포함 범위

- 생성 모달 AI/STT 오류 UX 보강
- STT transcript 임시 표시
- 회의록 상세 AI 후속 작업 section
- 다음 행동 후보 확인/수정/저장 UX
- Follow-up draft 확인/수정/복사 UX
- loading/empty/error/success 상태
- mobile QA

## 4. 제외 범위

- Meeting Note list AI summary
- Admin 운영 화면
- 이메일/SMS 자동 발송 UX
- Follow-up draft 저장함
- 다국어 설정 화면

## 5. 생성 모달 작업

1. `createMeetingNoteTextAiDraft`, `createMeetingNoteSttAiDraft` error를 안전 메시지로 표시한다.
2. retry 가능한 오류에는 다시 시도 버튼을 제공한다.
3. 실패해도 사용자가 직접 작성하던 form 값을 유지한다.
4. STT transcript는 접을 수 있는 임시 확인 영역에만 표시한다.
5. 저장 시 transcript를 request body에 넣지 않는다.

## 6. 상세 화면 작업

1. 회의록 상세 하단 또는 우측 panel에 `AI 후속 작업` section을 추가한다.
2. 연결된 딜/담당자 context를 사용자가 확인할 수 있게 표시한다.
3. `다음 행동 만들기` 버튼으로 후보를 생성한다.
4. 후보는 편집 가능한 input 또는 textarea로 보여준다.
5. 사용자가 확인하면 기존 `POST /api/deals/:dealId/following-action-logs`를 호출한다.
6. `Follow-up 초안` 버튼으로 채널별 초안을 생성한다.
7. 초안은 편집 가능하며 복사 버튼을 제공한다.
8. 자동 저장/자동 발송으로 오해될 문구를 쓰지 않는다.

## 7. UX/UI 기준

- Notion처럼 회의록 본문 편집 흐름을 방해하지 않는다.
- Attio처럼 linked company/contact/deal 맥락을 작은 record chip으로 보여준다.
- 버튼 문구는 짧고 행동형으로 쓴다.
- 사용자 문구는 해요체를 따른다.
- 긴 본문/후보가 카드나 버튼 밖으로 넘치지 않는다.
- 모바일 390px/360px에서 section, 버튼, textarea가 겹치지 않는다.
- 카드 안에 카드를 중첩하지 않는다.

## 8. 검증

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
```

필요 시:

```powershell
pnpm run test:e2e
pnpm run test:e2e:mobile
```

## 9. 완료 기준

- 생성 모달 AI/STT 실패 UX가 안전하다.
- STT transcript가 임시 상태로만 유지된다.
- 회의록 상세에서 다음 행동 후보를 생성하고 사용자가 확인 후 저장할 수 있다.
- 회의록 상세에서 follow-up draft를 생성/수정/복사할 수 있다.
- User Web이 `/admin/api/*`를 호출하지 않는다.
- 코드 작업 시 한글 주석이 추가됐다.
- `COMMON/GOAL-COMPLETION-CHECKLIST.md`의 G05 항목이 갱신됐다.

## 10. 구현 결과

- `meeting-note-api.ts`, `meeting-note.ts`, `use-meeting-note-mutations.ts`에 next action draft/follow-up draft API 계약을 추가했다.
- 생성 모달 AI/STT 실패 UX에 safe message와 retryable 기반 다시 시도 버튼을 추가했다.
- STT transcript는 생성 모달의 접을 수 있는 `임시 확인` 영역에만 표시한다.
- 저장 request는 기존 `toCreateMeetingNoteInput` whitelist를 유지해 transcript를 포함하지 않는다.
- 회의록 상세에 `AI 후속 작업` section을 추가했다.
- 다음 행동 후보는 편집 후 기존 `POST /api/deals/:dealId/following-action-logs` 흐름으로 저장한다.
- Follow-up 초안은 이메일/SMS 채널과 어조를 선택해 생성하고, subject/body를 수정한 뒤 복사할 수 있다.
- 모바일 QA에 회의록 상세 route를 추가해 390px/360px overflow 검증에 포함했다.

## 11. 검증 결과

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e:mobile
```

결과:

- `pnpm run typecheck` 통과
- `pnpm run lint` 통과
- `pnpm run build` 통과
- `pnpm run test:e2e:mobile` 통과
- `rg -n "/admin/api" FE/user-web/src` 확인 결과 API client 차단 로직 외 호출 없음
- `git diff --check` 통과

비고:

- `pnpm run build`에서 Vite chunk size warning이 표시됐지만 build 실패는 아니다.
