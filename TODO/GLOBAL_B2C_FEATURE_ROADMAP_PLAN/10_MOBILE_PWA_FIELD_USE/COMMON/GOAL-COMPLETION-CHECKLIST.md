# Goal Completion Checklist

상태: Confirmed

## 1. 목적

10번 전체 완료 시 빠진 구현, 테스트, 문서 검토가 없는지 확인한다.

## 2. 전체 완료 조건

- [x] G01~G07이 순서대로 완료되었다.
- [x] 각 goal 문서의 `Goal 검토 체크리스트`가 확인되었다.
- [x] `COMMON/GOAL-REVIEW-CHECKLIST.md` 공통 항목이 각 goal final에서 확인되었다.
- [x] BusinessCard OCR failure safe response가 BE/FE/test에 반영되었다.
- [x] `BusinessCardScanLog` safe failure migration이 생성되었다.
- [x] DB 추가/생성 항목에는 Prisma 한국어 주석과 migration SQL `COMMENT ON COLUMN` 또는 `COMMENT ON TABLE`이 있다.
- [x] 새로 만들거나 의미 있게 수정한 공개 함수/핵심 함수에는 한국어 주석이 있다.
- [x] MeetingNote mobile recording과 audio file fallback이 구현되었다.
- [x] local draft는 DB 없이 client 24h TTL로 구현되었다.
- [x] browser push permission은 explicit user click 이후에만 요청된다.
- [x] service notification과 marketing notification copy가 섞이지 않는다.
- [x] Global B2C 개인 영업자 모바일 현장 업무 target을 벗어나지 않았다.
- [x] UX/UI 변경은 `AGENT/UXUI_AGENT` 기준을 따랐다.
- [x] Software/architecture 변경은 `AGENT/SOFTWARE_AGENT` 기준을 따랐다.
- [x] mobile field analytics event가 09 privacy/taxonomy 규칙을 따른다.
- [x] provider raw response/error, prompt, audio/image raw data가 response/log/analytics/local draft에 저장되지 않는다.
- [x] 360px/390px mobile viewport 검증이 완료되었다.
- [x] 실행 command와 결과가 closeout에 기록되었다.
- [x] 실행하지 못한 검증은 사유와 잔여 위험이 기록되었다.

## 3. 완료 불가 조건

아래 중 하나라도 남아 있으면 10번을 완료로 표시하지 않는다.

- [ ] `/api/drafts/*` 또는 `UserDraft`를 10번에서 만들었다.
- [ ] 약관 동의만으로 browser push permission 요청/구독 등록을 처리했다.
- [ ] BusinessCard OCR 실패가 HTTP 500 raw error로 사용자에게 노출된다.
- [ ] MeetingNote audio blob이 local draft나 DB에 저장된다.
- [ ] analytics payload에 PII/raw text가 들어간다.
- [ ] goal별 체크리스트 검토 기록이 없다.

G07 확인 결과:

- 위 완료 불가 조건은 발견되지 않았다.
- `/api/follow-up-messages/drafts`는 기존 별도 도메인 API이며, 10번 범위에서 `/api/drafts/*` 또는 `UserDraft`를 만들지 않았다.
- 미실행 검증은 없다. 최초 병렬 실행 중 tool timeout이 있었던 FE notification/local-draft 테스트는 단독 재실행해 통과했다.
