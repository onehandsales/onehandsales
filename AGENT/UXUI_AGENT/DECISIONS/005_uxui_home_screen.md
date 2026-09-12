# UX/UI Home Screen Decision

Date: 2026-09-12

## 1. 결정

현재 `/app` home은 CRM Core가 붙기 전의 foundation 화면으로 유지한다.

후속 OneHand CRM에서 home은 사용자의 상태에 따라 아래처럼 바뀐다.

- Kit 미선택 사용자: 업무 유형 선택으로 안내
- Kit 선택 완료, 첫 Record 없음: Workspace home과 첫 Record CTA 제공
- 기존 사용자: Workspace home에서 최근 기록, 예정된 일, 다음 행동 제공

## 2. 이유

OneHand CRM은 사용자가 빈 CRM builder에 들어가는 제품이 아니다. home은 사용자가 "내 일에 맞는 CRM이 준비됐다"고 느끼는 화면이어야 한다.

현재 구현에는 아직 Kit, Workspace, Record Core가 없으므로 존재하지 않는 업무 데이터를 실제 기능처럼 보여주지 않는다.

## 3. UX 기준

- foundation home은 현재 구현 상태를 정직하게 반영한다.
- 후속 Workspace home은 Kit의 업무 언어를 우선한다.
- 첫 화면에서 설정 항목보다 첫 업무 행동을 우선한다.
- 빈 상태는 `데이터가 없습니다`가 아니라 첫 Record 생성으로 이어진다.

## 4. 제외

- 고정형 Contact/Product/Deal home 복구
- Deal pipeline을 전역 home으로 고정
- 샘플 데이터를 실제 데이터처럼 노출
- Team, billing, automation을 첫 화면에서 주요 CTA로 노출

## 5. 관련 문서

- `AGENT/UXUI_AGENT/PLANNING/WORKSPACE_HOME_UX.md`
- `AGENT/UXUI_AGENT/PLANNING/FIRST_USE_FLOW.md`
- `AGENT/PM_AGENT/PLANNING/IMPLEMENTATION_STATUS.md`
