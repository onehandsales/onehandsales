# 05 AI Weekly Sales Report

상태: Draft Slot
순서: 05
성격: 기능 구현 전 검토 슬롯
결정 상태: `COMMON/DECISION-LOG.md` 2026-07-21 추천 결정 반영

## 1. 목적

일정, 딜, 회의록, 다음 행동 데이터를 바탕으로 주간 영업 상황을 AI가 요약하고 리스크, follow-up, 데이터 정리 후보, 다음 주 액션을 제안하게 한다.

## 2. 현재 상태

- 회의록 AI/STT draft는 구현되어 있다.
- 주간 일정 보고서는 아직 미구현이다.
- AI가 딜 리스크, follow-up, 주간 영업 리포트를 제안하는 기능은 없다.
- 명함/Import/회의록 데이터를 정리하거나 보강하라고 제안하는 AI 기능은 없다.

## 3. 착수 전 해야 할 일

추천 결정:

- 수동 생성형과 저장형으로 시작한다.
- 사용자가 `이번 주 리포트 생성`을 누르면 요약, 리스크, 다음 행동, follow-up 초안을 만든다.
- AI 제안은 자동으로 딜, 일정, 담당자, 제품을 변경하지 않는다.
- AI 입력 데이터는 redaction 후 사용하고 provider 비용/user 추적을 남긴다.

1. 03 주간 일정 보고서의 데이터 구조를 먼저 확정한다.
2. AI 입력 데이터 범위와 민감정보 redaction 기준을 정한다.
3. 리포트 결과는 저장형으로 확정하고, 재생성은 새 version 또는 overwrite 정책으로 정한다.
4. 05는 주간/cross-record 리포트, 07은 회의록 직후 next action/follow-up 후보 추출로 나눈다.
5. 비용/user와 provider failure 추적 기준을 정한다.

## 4. 참고

- `COMMON/REFERENCES.md`
- `AGENT/PM_AGENT/PLANNING/GLOBAL_B2C_SERIES_A_ROADMAP.md`
- `AGENT/SOFTWARE_AGENT/COMMON/NEXT_FEATURE_PRIORITIES.md`
