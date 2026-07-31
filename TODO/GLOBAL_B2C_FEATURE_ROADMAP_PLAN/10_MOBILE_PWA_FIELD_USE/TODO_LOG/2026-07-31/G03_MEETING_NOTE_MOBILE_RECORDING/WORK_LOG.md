# G03 MeetingNote Mobile Recording Work Log

상태: Done
작성일: 2026-07-31
완료일: 2026-07-31

## 작업 내용

- Backend MeetingNote STT draft에 `AUDIO_REQUIRED`, `AUDIO_TYPE_UNSUPPORTED`, `AUDIO_TOO_LARGE`, `STT_PROVIDER_UNAVAILABLE`, `STT_TRANSCRIPTION_FAILED`, `AI_DRAFT_FAILED` 안전 오류 코드를 추가했다.
- STT draft upload 용량 초과를 endpoint 전용 filter에서 `AUDIO_TOO_LARGE` 413 응답으로 변환하고, STT draft 성공 status를 G03 계약의 201로 맞췄다.
- User Web 회의록 생성 패널에 MediaRecorder 기반 녹음, 정지, 취소, timer, permission denied/unsupported fallback, 파일 업로드 fallback을 추가했다.
- 녹음 Blob은 File로만 변환해 기존 `/api/meeting-notes/stt-draft` multipart `audio`로 전송하고, audio blob/base64나 provider raw response를 저장하지 않았다.
- Mobile browser QA mock과 E2E에 녹음 미지원 상태의 파일 업로드 fallback 초안 적용 검증을 추가했다.
- DB/Prisma model, migration은 변경하지 않았다.

## 검토 결과

- 검토 횟수: 3회
- 1차 검토: G03 goal spec, STT API spec, 공통 체크리스트, UXUI/SOFTWARE/DB schema 문서를 대조해 BE/FE 구현 차이를 확인했다.
- 2차 검토: diff/stat, raw provider detail, localStorage/sessionStorage, MeetingNote 자동 저장, Prisma 변경 여부를 검색했다. STT mock은 초안 응답만 반환하고 `meetingNotes` store를 변경하지 않는 것을 확인했다.
- 수정 사항: E2E에서 드롭다운을 닫기 위해 누른 Escape가 생성 패널을 닫는 문제와 중복 텍스트 selector 문제를 수정했다.
- 3차 검토: lint/typecheck/unit/E2E 통과 후 G03 checklist와 금지 항목을 다시 대조했다. 추가 수정 사항은 없었다.

## 검증

```powershell
pnpm.cmd --dir BE test -- meeting-note
pnpm.cmd --dir FE/user-web test -- meeting-note
pnpm.cmd --dir BE typecheck
pnpm.cmd --dir FE/user-web typecheck
pnpm.cmd --dir BE lint
pnpm.cmd --dir FE/user-web lint
pnpm.cmd --dir FE/user-web exec playwright test -c playwright.release-qa.config.ts tests/e2e/mobile-browser-qa.spec.ts -g "meeting note audio upload"
pnpm.cmd --dir FE/user-web test:e2e:mobile
```

검증 결과:

- BE MeetingNote Jest 9 suites / 49 tests 통과.
- FE MeetingNote Vitest 2 files / 7 tests 통과.
- BE/FE typecheck 통과.
- BE/FE lint 통과.
- G03 meeting note audio fallback E2E Chrome/Edge 360px/390px 4 tests 통과.
- 전체 mobile browser release QA Chrome/Edge 360px/390px 20 tests 통과.

## 미실행 검증

- BE/FE production build는 별도 실행하지 않았다. 이번 변경은 typecheck/lint/unit/E2E로 검증했다.

## 후속

- 다음 goal은 G04 local draft recovery다.
