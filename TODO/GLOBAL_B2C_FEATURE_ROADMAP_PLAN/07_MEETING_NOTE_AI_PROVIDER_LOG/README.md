# 07 MeetingNote AI Provider Log

상태: Draft Slot
순서: 07
성격: 기능 구현 전 검토 슬롯

## 1. 목적

회의록 AI/STT의 provider 호출, transcript, 실패 원인, next action 추출 결과를 추적해 AI 품질과 운영 신뢰를 높인다. 이 슬롯에는 회의 후 follow-up 문구, 회의록 기반 다음 행동 추출, AI 데이터 정리 후보도 포함한다.

## 2. 현재 상태

- 회의록 직접 작성, AI draft, STT draft, 딜 연결은 구현되어 있다.
- provider call log table은 없다.
- transcript/원문 보관 정책은 추가 정리가 필요하다.
- MeetingNote list next/latest summary 후보가 남아 있다.
- 회의록에서 next action을 구조화해 딜 following action으로 연결하는 기능은 없다.
- follow-up 메시지 초안과 회의록 데이터 정리 제안은 없다.

## 3. 착수 전 해야 할 일

1. transcript 저장 여부와 보관 기간을 결정한다.
2. provider input/output 저장 금지/허용 범위를 정한다.
3. next action 추출을 이 슬롯에 포함할지 결정한다.
4. Admin 원문 조회와는 분리한다.
5. follow-up 초안과 데이터 정리 제안을 05 AI 리포트와 어떻게 나눌지 결정한다.

## 4. 참고

- `COMMON/REFERENCES.md`
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN/COMMON/CANDIDATE-MATRIX.md` NBA-004/NBA-011
