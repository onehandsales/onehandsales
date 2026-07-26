# User Web TODO

상태: Completed
확정일: 2026-07-26

## 1. 목적

`FE/user-web`에서 회의록 AI/STT를 Global B2C 판매 가능한 업무 흐름으로 만든다.

UX/UI는 반드시 `AGENT/UXUI_AGENT`를 따른다. MeetingNote 화면은 Notion식 record page와 Attio식 CRM linked record/activity 맥락을 유지한다.

## 2. 화면 범위

| 화면 | 작업 |
|---|---|
| `/app/meeting-notes` | 1차에서는 목록 summary를 추가하지 않는다. 기존 목록 흐름을 유지한다. |
| `/app/meeting-notes/:meetingNoteId` | AI 후속 작업 section을 추가한다. next action 후보 생성과 follow-up 초안 생성을 제공한다. |
| 회의록 생성 dialog/page | 기존 AI/STT 초안 생성 실패 UX를 safe failure 기준으로 정리한다. transcript는 임시 표시만 한다. |

## 3. User Web 작업

- `meeting-note-api.ts`에 next action draft API와 follow-up draft API client를 추가한다.
- TanStack Query mutation hook을 `use-meeting-note-mutations.ts`에 추가한다.
- MeetingNote 상세 화면에 `AI 후속 작업` section을 추가한다.
- next action 후보는 사용자가 확인/수정 후 기존 딜 다음 행동 저장 흐름으로 이어지게 한다.
- next action 후보의 권장일, memo, reason은 07 1차에서 표시/판단용으로만 쓰고 저장 API에는 `followingAction`만 보낸다.
- follow-up 초안은 사용자가 확인/수정/복사할 수 있게 한다.
- AI 실패는 provider 내부정보 없이 safe message로 표시한다.
- transcript 원문은 생성 dialog에서 임시 확인만 가능하고 저장된 회의록 상세/목록 summary에 노출하지 않는다.
- 새 API client, hook, 복잡한 event handler에는 한글 `// 기능 : ...` 주석을 추가한다.

## 4. UX/UI 기준

- Notion식 section/block 구조로 조용하게 배치한다.
- Attio식 CRM record 관계처럼 회의록, 딜, 담당자, 다음 행동의 연결 맥락을 보여준다.
- desktop은 상세 화면 안에서 조밀한 section/list로 표시한다.
- mobile은 card/list 형태로 표시하고 가로 table을 쓰지 않는다.
- 버튼에는 lucide icon과 짧은 label을 사용한다.
- 사용자 문구는 해요체를 따른다.
- 카드 안에 카드를 중첩하지 않는다.
- API 응답에 없는 summary/count/latest를 FE에서 꾸미지 않는다.

## 5. 사용자 문구 예시

Safe failure:

```text
AI 초안을 만들지 못했어요. 직접 작성으로 이어갈 수 있어요.
```

Next action 후보:

```text
다음 행동 후보를 만들었어요.
```

Follow-up 초안:

```text
후속 연락 초안을 만들었어요.
```

## 6. 금지

- `/admin/api/*` 호출 금지
- AI 후보 자동 저장 금지
- 자동 발송 금지
- provider raw response/API key/quota detail 노출 금지
- transcript 원문을 목록/상세 summary에 노출 금지
- MeetingNote 목록 summary 1차 구현 금지
- FE 단독으로 API 응답에 없는 next action summary 생성 금지

## 7. 검증 명령

FE 변경이 생기면 아래를 기본 gate로 실행한다.

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
pnpm run test:e2e:mobile
```

## 8. 구현 결과

- User Web meeting-note API client/type/mutation에 next action draft와 follow-up draft 계약을 추가했다.
- 회의록 생성 dialog/page에서 AI/STT 실패 시 safe message와 retryable 다시 시도를 제공한다.
- STT transcript는 접을 수 있는 임시 확인 영역에만 표시하고 저장 request body에는 포함하지 않는다.
- 회의록 상세에 `AI 후속 작업` section을 추가했다.
- 다음 행동 후보는 사용자가 확인/수정한 뒤 기존 딜 following-action 저장 API로 저장한다.
- Follow-up 초안은 이메일/SMS 채널과 어조를 선택해 생성하고, 수정 후 복사할 수 있다.
- 모바일 QA route에 회의록 상세를 포함했다.

## 9. 검증 결과

- `pnpm run typecheck` 통과
- `pnpm run lint` 통과
- `pnpm run build` 통과
- `pnpm run test:e2e:mobile` 통과
- `rg -n "/admin/api" FE/user-web/src` 확인 결과 API client 차단 로직 외 호출 없음
- `git diff --check` 통과

비고:

- `pnpm run build`에서 Vite chunk size warning이 표시됐지만 build 실패는 아니다.
- 전체 `pnpm run test:e2e`는 G06 closeout에서 Backend/User Web 전체 검증과 함께 실행한다.
