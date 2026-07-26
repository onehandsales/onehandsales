# G06 QA Review Closeout

상태: Completed
목표: 07 구현 검증과 문서 closeout

## 1. 목적

07 구현 결과가 Global B2C 제품 방향, API/DB 계약, redaction, UX/UI 기준을 만족하는지 최종 확인한다.

## 2. 선행 조건

- G05 완료

## 3. 포함 범위

- Backend 검증
- User Web 검증
- Provider log DB 확인
- Redaction 확인
- Ownership 확인
- Mobile QA
- 문서 closeout

## 4. 제외 범위

- 07 이후 backlog 구현
- Admin 운영 화면 구현
- Cleanup job 구현
- Global roadmap 전체 문서 일괄 closeout

## 5. Backend 검증

```powershell
cd BE
pnpm run prisma:validate
pnpm run typecheck
pnpm run lint
pnpm run test -- meeting-note
pnpm run test -- deal
pnpm run build
```

확인 항목:

- `AiProviderCallLog` operation/targetType/targetId 기록
- provider success/failure 기록
- raw text/transcript/prompt/follow-up body 저장 금지
- 다른 사용자 resource 접근 차단
- next action/follow-up draft 자동 저장 없음

## 6. User Web 검증

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

확인 항목:

- 생성 모달 AI/STT 실패 UX
- transcript 임시 표시와 저장 제외
- 다음 행동 후보 확인/수정/저장
- follow-up draft 확인/수정/복사
- 모바일 390px/360px layout
- `/admin/api/*` 호출 없음

## 7. 문서 Closeout

아래 문서를 구현 결과에 맞게 갱신한다.

- `README.md`
- `COMMON/API-SPEC/README.md`
- `COMMON/API-SPEC/MEETING_NOTE_AI_DRAFT_LOG_API.md`
- `COMMON/API-SPEC/MEETING_NOTE_NEXT_ACTION_FOLLOW_UP_API.md`
- `BE-TODO/API-TODO.md`
- `BE-TODO/DB-SCHEMA.md`
- `FE-TODO/USER-WEB-TODO.md`
- `COMMON/REVIEW-CHECKLIST.md`
- `COMMON/GOAL-COMPLETION-CHECKLIST.md`

## 8. 완료 기준

- S0/S1 blocker가 없다.
- 실행하지 못한 검증은 사유가 기록됐다.
- API spec과 구현 결과가 일치한다.
- Global B2C 제품 가치 범위가 유지됐다.
- 코드 작업 시 한글 주석이 추가됐다.
- 07 closeout 상태가 README에 반영됐다.

## 9. 실행 결과

Backend:

- `cd BE && pnpm run prisma:validate` 통과
- `cd BE && pnpm run typecheck` 통과
- `cd BE && pnpm run lint` 통과
- `cd BE && pnpm run test -- meeting-note` 통과
- `cd BE && pnpm run test -- deal` 통과
- `cd BE && pnpm run build` 통과

User Web:

- `cd FE/user-web && pnpm run typecheck` 통과
- `cd FE/user-web && pnpm run lint` 통과
- `cd FE/user-web && pnpm run build` 통과
- `cd FE/user-web && pnpm run test:e2e` 통과
- `cd FE/user-web && pnpm run test:e2e:mobile` 통과

추가 확인:

- `rg -n "/admin/api" FE/user-web/src` 확인 결과 API client 차단 로직 외 User Web 직접 호출 없음
- `git diff --check` 통과
- S0/S1 blocker 없음

비고:

- `pnpm run test:e2e` 최초 실행은 Playwright 관리 Chromium 누락으로 실패했고, `pnpm exec playwright install chromium` 후 재실행에서 27개 테스트가 통과했다.
- User Web build는 Vite chunk size warning을 표시했지만 실패는 아니다.
- meeting-note Jest 실행은 worker teardown warning을 표시했지만 test suite/test 실패는 없다.
