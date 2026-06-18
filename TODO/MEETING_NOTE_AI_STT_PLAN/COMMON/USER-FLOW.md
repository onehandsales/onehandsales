# Meeting Note AI/STT 사용자 흐름

## 1. 텍스트 AI 초안

1. 사용자가 회의록 생성 모달을 연다.
2. 사용자가 회사, 담당자, 제품, 딜, 회의 일시를 직접 선택한다.
3. 사용자가 회의 원문 텍스트를 입력한다.
4. Frontend가 `POST /api/meeting-notes/ai-draft`를 호출한다.
5. Backend가 선택 ID ownership을 검증한다.
6. Backend가 `MeetingNoteAiDraftProvider`를 통해 OpenAI AI 초안을 생성한다.
7. Frontend가 `details`, `nextPlan`, `requiredAction` field에 초안을 채운다.
8. 사용자가 초안을 확인/수정한다.
9. Frontend가 기존 `POST /api/meeting-notes`로 최종 저장한다.

## 2. STT+AI 초안

1. 사용자가 회의록 생성 모달을 연다.
2. 사용자가 회사, 담당자, 제품, 딜, 회의 일시를 직접 선택한다.
3. 사용자가 음성 파일을 업로드하거나 녹음한다.
4. Frontend가 `POST /api/meeting-notes/stt-draft`를 multipart로 호출한다.
5. Backend가 선택 ID ownership과 음성 파일을 검증한다.
6. Backend가 `MeetingNoteSttProvider`를 통해 음성을 transcript로 변환한다.
7. Backend가 transcript를 `MeetingNoteAiDraftProvider`에 전달해 AI 초안을 생성한다.
8. Frontend가 transcript를 검토용으로 보여주고 `details`, `nextPlan`, `requiredAction` field에 초안을 채운다.
9. 사용자가 초안을 확인/수정한다.
10. Frontend가 기존 `POST /api/meeting-notes`로 최종 저장한다.

## 3. 선택 책임

사용자가 선택:

- 회사
- 담당자
- 제품
- 딜
- 회의 일시

AI/STT가 생성:

- transcript
- 회의 내용
- 다음 계획
- 필요 행동

AI/STT가 하지 않는 것:

- 회사/담당자/제품/딜 자동 선택
- 회의 일시 추론
- 자동 저장
- transcript 영구 저장

## 4. 관련 문서

- `COMMON/API-SPEC/MEETING_NOTE_AI_STT_API.md`
- `COMMON/GOAL-WORK-ORDER.md`
