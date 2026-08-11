# G04 Local Draft Recovery Work Log

상태: Done
작업일: 2026-07-31

## 작업 내용

- User Web에 `features/mobile-local-draft` 공통 모듈을 추가했다.
- IndexedDB primary, localStorage fallback 저장소를 구현했다.
- local draft TTL은 저장 시점 기준 24시간으로 처리했다.
- schemaVersion mismatch, 만료 draft는 복구하지 않고 즉시 삭제한다.
- userId를 storage key에 직접 넣지 않고 로컬 salt 기반 hash로 `userScopedHash`를 만든다.
- BusinessCard OCR 성공 confirm form에 debounce local draft 저장과 복구 prompt를 연결했다.
- BusinessCard OCR_SUCCESS 상세 dialog에서 같은 scanLogId confirm form으로 다시 진입하는 버튼을 추가했다.
- MeetingNote create form에 active clientDraftId 기반 local draft 저장과 복구 prompt를 연결했다.
- 저장 성공 또는 사용자의 버리기 선택 후 local draft를 삭제한다.
- MeetingNote 저장 성공 후 다음 create flow가 새 clientDraftId를 쓰도록 회전한다.
- audio/image blob, base64, transcript 전문, provider raw response, prompt는 local draft payload에 포함하지 않았다.
- G04 범위에서는 `/api/drafts/*`, `UserDraft`, DB migration, Backend runtime logic을 만들지 않았다.

## 검증 결과

- `pnpm.cmd --dir FE/user-web test -- local-draft` 통과
- `pnpm.cmd --dir FE/user-web test -- business-card` 통과
- `pnpm.cmd --dir FE/user-web test -- meeting-note` 통과
- `pnpm.cmd --dir FE/user-web typecheck` 통과
- `pnpm.cmd --dir FE/user-web lint` 통과
- `pnpm.cmd --dir FE/user-web test:e2e -- mobile-local-draft` 통과

## 검토 결과

- 검토 횟수: 3회 완료
- 1차: 구현 diff, storage 계약, payload 금지 필드 확인 후 `userScopedHash` crypto digest 경로를 보정하고 회귀 테스트를 추가했다.
- 2차: 테스트/검증 결과와 모바일 restore flow 확인
- 3차: commit 직전 checklist, DB/BE 무변경, 무관 변경 제외 확인. 추가 수정 사항 없음.

## 미실행 검증

- production build는 G04 권장 command가 아니라 실행하지 않았다.
- Backend 변경이 없으므로 Backend test/typecheck/lint는 실행하지 않았다.
