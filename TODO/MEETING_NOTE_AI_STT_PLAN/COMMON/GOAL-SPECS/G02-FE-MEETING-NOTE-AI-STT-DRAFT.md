# G02-FE-MEETING-NOTE-AI-STT-DRAFT

## 목표

회의록 작성 화면에서 기존 직접 작성 저장 흐름을 유지하면서 Backend AI/STT 초안 생성 API를 보조 액션으로 사용할 수 있게 한다.

## 요구사항

- 사용자가 회사, 담당자, 제품, 딜, 회의 일시를 먼저 선택하게 한다.
- 사용자가 AI/STT 없이 `details`, `nextPlan`, `requiredAction`을 직접 입력하고 `sourceType: MANUAL`로 바로 저장할 수 있게 한다.
- 텍스트 원문 입력 후 AI 초안 생성을 호출한다.
- 음성 업로드 또는 녹음 후 STT+AI 초안 생성을 호출한다.
- 응답의 `details`, `nextPlan`, `requiredAction`을 form field에 반영한다.
- 응답의 `transcript`는 사용자가 확인할 수 있게 보여주되 자동 저장하지 않는다.
- 최종 저장 시 `sourceType`을 `TEXT_AI` 또는 `STT_AI`로 전달한다.
- 사용자는 초안을 수정한 뒤 저장할 수 있어야 한다.
- 저장 후 영업 딜과 연동하는 흐름은 회의록 저장 이후의 별도 액션으로 둔다.

## 완료 기준

- 기존 수동 생성 흐름을 유지한다.
- 수동 작성 저장은 AI/STT draft API를 호출하지 않는다.
- AI/STT 버튼은 필수 선택값이 없으면 비활성 또는 validation 안내를 제공한다.
- provider 오류는 재시도 가능한 toast 또는 inline error로 표시한다.
- AI/STT 결과는 자동 저장하지 않고 사용자가 수정 가능한 field에만 채운다.
- `TEXT_AI`, `STT_AI` 저장을 위해 User Web `CreateMeetingNoteInput`과 저장 변환 로직이 `sourceType`을 전달할 수 있어야 한다.
- Backend STT provider가 바뀌어도 Frontend API 계약은 바뀌지 않는다.
- User Web typecheck/build가 통과한다.
