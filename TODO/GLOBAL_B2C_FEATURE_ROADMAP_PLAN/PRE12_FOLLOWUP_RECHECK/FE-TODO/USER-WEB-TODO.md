# User Web Todo

상태: Draft / confirmed User Web 작업 없음
작성일: 2026-08-06
최종 업데이트: 2026-08-06

## 1. 목적

이 문서는 후속 후보가 User Web에 어떤 영향을 줄 수 있는지 기록한다. 현재 이 계획만으로 새 화면, route, API client, state를 만들지 않는다.

## 2. 현재 기준

| 영역 | 현재 기준 |
| --- | --- |
| Notification | `/app/notifications`, notification settings, browser push 설정은 02 범위로 완료됐다. |
| Weekly report | `/app/schedules/week`와 Excel export는 03 범위로 완료됐다. |
| Google Calendar | `/app/schedules`, `/app/settings`, schedule detail source badge/sync/status는 04 범위로 완료됐다. |
| AI weekly report/follow-up | `/app/schedules/week` AI report section, `/app/settings` follow-up delivery settings, compose/send/retry UX는 05 범위로 구현됐다. |
| DealActivity | deal list `latestActivity`, deal detail activity timeline은 06 범위다. |
| MeetingNote AI | meeting note detail AI next action/follow-up draft section은 07 범위다. |
| Import | `/app/import` review/resume, row detail 만료 안내, 10MB/5,000행 제한 안내는 01 범위로 완료됐다. |

## 3. 구현 금지

G00과 API contract 확정 전에는 아래 User Web 변경을 하지 않는다.

- 다음 행동 reminder 설정 UI 추가
- MeetingNote follow-up reminder UI 추가
- follow-up 자동 발송 toggle 추가
- Company/Contact/Product latest summary를 API 없이 FE에서 조합 표시
- MeetingNote list latest/next summary를 API 없이 FE에서 조합 표시
- 대용량 import worker UI 추가
- 일정/회의록 import source UI 추가
- ImportJob Admin 전용 화면 추가
- generic ExportJob/PDF/export route 추가
- billing/paywall/churn UI 추가

2026-08-06 A 결정에 따라 Company/Contact/Product latest summary, generic summary endpoint, record별 상세 timeline은 12 전 User Web 작업으로 올리지 않는다. UX/UI 전체 polish는 별도 전면 유지보수 계획에서 다룬다.

## 4. 후보별 FE 영향

| 후보 | 예상 FE 영향 | 현재 상태 |
| --- | --- | --- |
| 다음 행동 reminder | notification settings, next action form, deal detail 상태 표시 | Question |
| 회의록 follow-up reminder | meeting note detail/list, notification settings, follow-up draft 상태 표시 | post-12-seed |
| record summary | Company/Contact/Product/MeetingNote list item summary 위치와 empty fallback | Company/Contact/Product는 defer. 비고: post-12 B2B/team CRM strategy seed. MeetingNote list summary는 post-12-seed. |
| Import scale/source/Admin 확장 | 대용량 import progress, 일정/회의록 source mapping, Admin-only job cleanup/조회 화면 | post-12-seed |
| provider smoke | 화면 변경 없음. 운영 smoke 결과 문서 반영 | pre-12-follow-up-needed |

## 5. UX 기준

- list item에 없는 API 정보를 FE에서 사실처럼 만들지 않는다.
- reminder나 자동 발송처럼 사용자 신뢰에 영향을 주는 기능은 명시적 상태, 취소, 실패, 재시도 기준이 먼저 있어야 한다.
- 모바일에서는 table 확장이 아니라 card/list summary 기준을 우선 검토한다.
- private memo, meeting note raw text, follow-up body 전체를 list summary에 노출하지 않는다.

## 6. 관련 문서

- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`
- `../COMMON/CANDIDATE-MATRIX.md`
