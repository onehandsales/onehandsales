# Meeting Note AI/STT 사용자 흐름

## 1. 플로우 원칙

회의록 작성 화면의 기본 플로우는 `직접 작성 후 저장`이다.

AI/STT는 회의록 저장을 대체하는 기능이 아니라, 사용자가 입력한 텍스트 또는 음성으로 `details`, `nextPlan`, `requiredAction` 초안을 채워주는 보조 액션이다.

기준 흐름:

1. 사용자가 `/meeting-notes`에서 회의록 작성 화면을 연다.
2. 사용자가 회의 일시, 회사, 담당자를 선택한다.
3. 필요하면 제품, 딜을 선택한다.
4. 사용자는 아래 세 경로 중 하나를 선택한다.
   - 직접 작성 후 바로 저장
   - 텍스트를 입력하고 `AI로 정리`
   - 음성을 녹음/업로드하고 `음성으로 작성`
5. AI/STT를 사용한 경우에도 결과는 form field에만 채워진다.
6. 사용자가 내용을 확인/수정한다.
7. 사용자가 `저장`을 누르면 기존 `POST /api/meeting-notes`로 최종 저장한다.
8. 저장 후 회의록 상세에서 필요 시 `영업 딜과 연동`을 실행한다.

## 2. 직접 작성 저장

1. 사용자가 회의록 작성 화면을 연다.
2. 사용자가 회의 일시, 회사, 담당자를 선택한다.
3. 필요하면 제품, 딜을 선택한다.
4. 사용자가 `상세내용`, `향후계획`, `필요액션`을 직접 입력한다.
5. 사용자가 `저장`을 누른다.
6. Frontend가 기존 `POST /api/meeting-notes`를 호출한다.
7. 저장 요청의 `sourceType`은 `MANUAL`이다.

이 경로에서는 `POST /api/meeting-notes/ai-draft`, `POST /api/meeting-notes/stt-draft`를 호출하지 않는다.

## 3. 텍스트 AI 정리

1. 사용자가 회의록 작성 화면을 연다.
2. 사용자가 회의 일시, 회사, 담당자를 선택한다.
3. 필요하면 제품, 딜을 선택한다.
4. 사용자가 회의 원문 또는 거친 메모를 입력한다.
5. 사용자가 `AI로 정리`를 누른다.
6. Frontend가 `POST /api/meeting-notes/ai-draft`를 호출한다.
7. Backend가 선택 ID ownership을 검증한다.
8. Backend가 `MeetingNoteAiDraftProvider`를 통해 AI 초안을 생성한다.
9. Frontend가 `details`, `nextPlan`, `requiredAction` field에 초안을 채운다.
10. 사용자가 초안을 확인/수정한다.
11. 사용자가 `저장`을 누르면 기존 `POST /api/meeting-notes`로 최종 저장한다.
12. 저장 요청의 `sourceType`은 `TEXT_AI`다.

## 4. 음성 STT+AI 정리

1. 사용자가 회의록 작성 화면을 연다.
2. 사용자가 회의 일시, 회사, 담당자를 선택한다.
3. 필요하면 제품, 딜을 선택한다.
4. 사용자가 음성 파일을 업로드하거나 녹음한다.
5. 사용자가 `음성으로 작성`을 누른다.
6. Frontend가 `POST /api/meeting-notes/stt-draft`를 multipart로 호출한다.
7. Backend가 선택 ID ownership과 음성 파일을 검증한다.
8. Backend가 `MeetingNoteSttProvider`를 통해 음성을 transcript로 변환한다.
9. Backend가 transcript를 `MeetingNoteAiDraftProvider`에 전달해 AI 초안을 생성한다.
10. Frontend가 transcript를 검토용으로 보여주고 `details`, `nextPlan`, `requiredAction` field에 초안을 채운다.
11. 사용자가 초안을 확인/수정한다.
12. 사용자가 `저장`을 누르면 기존 `POST /api/meeting-notes`로 최종 저장한다.
13. 저장 요청의 `sourceType`은 `STT_AI`다.

## 5. 저장 후 딜 연동

딜 연동은 회의록 저장 이후의 별도 액션이다.

1. 사용자가 회의록 상세를 연다.
2. 사용자가 `영업 딜과 연동`을 누른다.
3. 사용자가 연결할 딜을 선택한다.
4. Frontend가 회의록-딜 연결을 저장한다.
5. 연결 성공 후 딜 상세의 활동기록에 해당 날짜의 회의록 링크와 요약이 표시된다.

현재 AI/STT 초안 API 범위에는 딜 활동기록 자동 생성 계약이 포함되지 않는다. 최종 구현 시 기존 딜 메모/활동 로그 API를 재사용할지, 회의록-딜 연결 전용 API를 둘지 별도 확정이 필요하다.

## 6. 선택 책임

사용자가 선택:

- 회의 일시
- 회사
- 담당자
- 제품
- 딜

사용자가 직접 입력하거나 AI/STT가 채우는 값:

- 회의 내용
- 다음 계획
- 필요 행동

STT가 생성:

- transcript

AI/STT가 하지 않는 것:

- 저장 필수화
- 회사/담당자/제품/딜 자동 선택
- 회의 일시 추론
- 자동 저장
- transcript 영구 저장

## 7. 화면 문구 기준

- 탭/메뉴명: `회의록`
- 작성 진입: `회의록 작성`
- 기본 저장 버튼: `저장`
- 텍스트 정리 버튼: `AI로 정리`
- 음성 정리 버튼: `음성으로 작성`

화면 전체를 `AI 회의록`으로만 부르면 수동 저장 경로가 보조처럼 보이므로 피한다.

## 8. 관련 문서

- `COMMON/API-SPEC/MEETING_NOTE_AI_STT_API.md`
- `COMMON/GOAL-WORK-ORDER.md`
