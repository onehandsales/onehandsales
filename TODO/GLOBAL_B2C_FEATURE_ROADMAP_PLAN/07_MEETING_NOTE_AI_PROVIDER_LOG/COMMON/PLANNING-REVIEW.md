# Planning Review

상태: Ready
검토일: 2026-07-26

## 1. 결론

07은 구현 착수 가능하다.

단, G01에서 실제 코드와 한 번 더 대조한 뒤 API/DTO 이름을 최종 보정한다. 현재 문서는 Global B2C 제품 방향, 사용자 의사결정, 기존 BE/FE/Prisma 구조를 기준으로 작성됐다.

## 2. 확인한 현재 코드 기준

- `BE/prisma/schema.prisma`에 공통 `AiProviderCallLog`가 이미 있다.
- `AiProviderOperation`은 현재 `WEEKLY_SALES_REPORT`, `FOLLOW_UP_EMAIL_DRAFT`, `FOLLOW_UP_SMS_DRAFT`만 있다.
- `MeetingNote`에는 `details`, `nextPlan`, `requiredAction`, `rawText` field가 있지만 STT transcript 별도 저장 table은 없다.
- 기존 Meeting Note AI API는 `POST /api/meeting-notes/ai-draft`, `POST /api/meeting-notes/stt-draft`다.
- STT draft response는 `transcript`를 반환하지만 저장은 별도 생성 API에서 사용자가 확정한 field만 저장한다.
- 기존 다음 행동 저장 API는 `POST /api/deals/:dealId/following-action-logs`다.
- User Web meeting-note feature는 생성 모달, 목록, 상세, 편집 화면이 이미 있다.

## 3. 사용자 결정 반영

- 공통 `AiProviderCallLog`를 확장한다.
- STT transcript는 기본 저장하지 않는다.
- Provider raw response, prompt, raw input은 저장하지 않는다.
- AI next action은 후보만 만들고 사용자가 확인한다.
- Follow-up draft는 초안만 만들고 사용자가 확인/수정/복사한다.
- Admin/ops 조회 화면은 07에서 제외한다.
- UX/UI는 Notion과 Attio 참고 방향으로 간다.

## 4. Blocking 질문

현재 구현 착수를 막는 질문은 없다.

## 5. G01에서 재확인할 점

- 전역 오류 응답에 `retryable`을 어떤 방식으로 포함할지 결정한다.
- `AiProviderCallLog` 저장 port를 MeetingNote module 내부에 둘지, 공통 AI logging module로 분리할지 결정한다.
- OpenAI provider adapter가 token/cost/requestId를 얻을 수 있는지 확인한다.
- 다음 행동 후보의 `recommendedDueDate`는 07 1차에서 표시/판단용으로만 둔다. 저장은 기존 `followingAction` 문자열만 사용한다.
