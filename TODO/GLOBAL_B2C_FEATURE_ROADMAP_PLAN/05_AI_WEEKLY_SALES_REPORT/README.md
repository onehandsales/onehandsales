# 05 AI Weekly Sales Report

상태: Draft Slot
순서: 05
성격: 기능 구현 전 검토 슬롯

## 1. 목적

일정, 딜, 회의록, 다음 행동 데이터를 바탕으로 주간 영업 상황을 AI가 요약하고 리스크, follow-up, 데이터 정리 후보, 다음 주 액션을 제안하게 한다.

## 2. 현재 상태

- 회의록 AI/STT draft는 구현되어 있다.
- 주간 일정 보고서는 아직 미구현이다.
- AI가 딜 리스크, follow-up, 주간 영업 리포트를 제안하는 기능은 없다.
- 명함/Import/회의록 데이터를 정리하거나 보강하라고 제안하는 AI 기능은 없다.

## 3. 착수 전 해야 할 일

1. 03 주간 일정 보고서의 데이터 구조를 먼저 확정한다.
2. AI 입력 데이터 범위와 민감정보 redaction 기준을 정한다.
3. 리포트 결과를 저장할지, 매번 생성할지 결정한다.
4. follow-up/next action/딜 리스크/데이터 정리 제안 중 05와 07에 나눌 범위를 결정한다.
5. 비용/user와 provider failure 추적 기준을 정한다.

## 4. 참고

- `COMMON/REFERENCES.md`
- `AGENT/PM_AGENT/PLANNING/GLOBAL_B2C_SERIES_A_ROADMAP.md`
- `AGENT/SOFTWARE_AGENT/COMMON/NEXT_FEATURE_PRIORITIES.md`
