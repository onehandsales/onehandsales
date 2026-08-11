# G03 MeetingNote Mobile Recording

상태: Done

## 1. 목적

모바일 브라우저에서 회의 직후 음성을 녹음하거나 파일로 업로드해 기존 STT draft API로 회의록 초안을 만든다.

## 2. 포함 범위

- `MediaRecorder` 기반 녹음 UX
- audio file upload fallback
- `POST /api/meeting-notes/stt-draft` request/response/error contract 반영
- permission denied/unsupported UX
- BE STT draft contract regression tests
- FE recording state/tests

## 3. 제외 범위

- native app recorder
- audio file DB 저장
- 녹음 local draft 저장
- provider raw response 표시
- 회의록 자동 저장

## 4. Request 계약

기준 문서: `COMMON/API-SPEC/MEETING_NOTE_MOBILE_RECORDING_STT_CONTRACT.md`

`POST /api/meeting-notes/stt-draft`

```ts
type MeetingNoteSttDraftRequest = {
  audio: File;
  meetingLocalDateTime?: string;
  companies?: string;
  contacts?: string;
  products?: string;
  deals?: string;
};
```

규칙:

- `audio` max 25MB
- `MediaRecorder` blob을 File로 변환해 전송 가능
- browser recording 미지원/권한 거부 시 파일 업로드 fallback

## 5. Response 계약

기존 `MeetingNoteAiDraftResponse` 유지.

```ts
type MeetingNoteAiDraftResponse = {
  sourceType: "STT_AI";
  transcript?: string | null;
  summary?: string | null;
  details?: string | null;
  nextPlan?: string | null;
  requiredAction?: string | null;
};
```

FE는 provider raw response를 표시하거나 local draft에 저장하지 않는다.

## 6. Backend Business Logic

1. audio file 존재, size, MIME을 검증한다.
2. STT provider와 AI draft provider 호출은 기존 MeetingNote application flow를 사용한다.
3. provider call result/failure는 `AiProviderCallLog`에 safe 형태로 남긴다.
4. MeetingNote row는 사용자가 저장하기 전까지 만들지 않는다.
5. provider raw detail과 transcript 전문을 log/analytics에 넣지 않는다.

## 7. User Flow

1. 사용자가 모바일 회의록 작성 화면에서 녹음 CTA를 누른다.
2. microphone permission prompt는 사용자 클릭 이후에만 열린다.
3. 녹음 중에는 시간, 정지, 취소 UI를 제공한다.
4. 정지 후 사용자가 `초안 만들기`를 누른다.
5. STT draft 성공 시 form에 초안을 채운다.
6. 권한 거부/미지원/녹음 실패 시 파일 업로드 fallback을 제공한다.
7. 사용자가 form을 수정하면 G04 local draft가 적용된다.

## 8. DB/Prisma 영향

신규 DB migration 없음.

사용 model:

- `AiProviderCallLog`
- 기존 MeetingNote 저장 관련 model

저장 금지:

- audio binary/blob/base64
- provider raw response
- provider raw error
- local draft

## 9. 코드 주석 기준

Backend:

- STT draft endpoint와 provider error mapper 수정 시 한국어 주석 기준 적용

Frontend:

- recorder hook, permission mapper, fallback component, API client에 `// 기능 : ...` 적용

## 10. 검증

권장 command:

```powershell
pnpm --dir BE test -- meeting-note
pnpm --dir FE/user-web test -- meeting-note
pnpm --dir FE/user-web test:e2e -- mobile-meeting-note-recording
```

## 11. Goal 검토 체크리스트

- [x] `MediaRecorder` 지원 여부를 감지한다.
- [x] permission denied/unsupported fallback이 있다.
- [x] audio file upload fallback이 있다.
- [x] STT draft request가 기존 API 계약과 일치한다.
- [x] audio blob/base64를 DB/local draft에 저장하지 않는다.
- [x] provider raw response/error가 UI/log/analytics에 없다.
- [x] MeetingNote row를 자동 저장하지 않는다.
- [x] DB 추가/생성 없이 기존 model만 사용했다.
- [x] 새로 만들거나 의미 있게 수정한 공개 함수/핵심 함수에 한국어 주석을 적용했다.
- [x] Global B2C 개인 영업자 모바일 현장 업무 target을 벗어나지 않았다.
- [x] UX/UI 변경 전 `AGENT/UXUI_AGENT` 기준을 확인했다.
- [x] Software/architecture 변경 전 `AGENT/SOFTWARE_AGENT` 기준을 확인했다.
- [x] 360px/390px viewport에서 녹음 UI가 겹치지 않는다.
- [x] BE/FE/E2E targeted 검증 결과를 기록했다.
- [x] `COMMON/GOAL-REVIEW-CHECKLIST.md`를 확인했다.

## 12. 실행 결과

완료일: 2026-07-31

구현 요약:

- Backend MeetingNote STT draft에 안전 오류 코드와 endpoint 전용 업로드 용량 초과 처리를 추가했다.
- User Web 회의록 생성 패널에 `MediaRecorder` 녹음, 정지, 취소, timer, permission denied/unsupported fallback, audio file upload fallback을 추가했다.
- 녹음 Blob은 기존 `/api/meeting-notes/stt-draft` multipart `audio`로만 전송하고 DB/local draft에는 저장하지 않는다.
- provider raw response/error는 UI/log/analytics/local draft에 노출하지 않는다.
- DB/Prisma model과 migration은 변경하지 않았다.

검증:

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

결과:

- BE MeetingNote Jest 9 suites / 49 tests 통과.
- FE MeetingNote Vitest 2 files / 7 tests 통과.
- BE/FE typecheck 통과.
- BE/FE lint 통과.
- G03 meeting note audio fallback E2E Chrome/Edge 360px/390px 4 tests 통과.
- 전체 mobile browser release QA Chrome/Edge 360px/390px 20 tests 통과.
- BE/FE production build는 별도 실행하지 않았다. G03은 typecheck/lint/unit/E2E로 검증했다.
