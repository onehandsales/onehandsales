# Candidate Matrix

상태: Draft
작성일: 2026-08-06
최종 업데이트: 2026-08-06

## 1. 목적

이 문서는 01~06 재대조와 07 연결 과정에서 나온 후속 후보를 한 표로 관리한다. 이 표는 구현 지시가 아니라 분류 기준이다.

## 2. 후보 표

| ID | 후보 | 출처 | 현재 코드/문서 사실 | 기본 분류 | 다음 조치 |
| --- | --- | --- | --- | --- | --- |
| PRE12-F01 | 다음 행동 reminder | 02 제외, 06에서 재설계 언급 | Notification source는 `SCHEDULE`, `DEAL`만 있다. 06의 다음 행동 범위는 Notification reminder가 아니라 DealActivity `NEXT_ACTION_CREATED/COMPLETION_CHANGED` 기록이다. | Question | G00에서 12 전 처리 여부 결정. 결정 전 구현 금지. |
| PRE12-F02 | 회의록 follow-up reminder | 02 제외, 07에서 재검토 언급 | 07은 follow-up draft만 만들고 자동 발송/알림/DB 저장을 제외한다. | post-12-seed | G03에서 계약 후보만 정리. 구현 금지. |
| PRE12-F03 | MeetingNote follow-up 자동 발송 | 05/07 후속 | 05는 사용자가 확인 후 발송하는 follow-up delivery다. 07은 초안만 반환한다. | post-12-seed | 자동 발송 정책, 수신 동의, retry, 취소, 알림 정책 필요. |
| PRE12-F04 | Gmail/Microsoft provider smoke | 05 G10 | Gmail/Microsoft adapter와 자동 검증은 완료. 운영 credential/callback/allowlist 실제 수신자 smoke는 미실행. | pre-12-follow-up-needed | G05에서 운영 smoke 실행 조건과 결과 기록. |
| PRE12-F05 | SMS 실제 provider | 05 G10 제외 | SMS sender verification UI/API foundation은 있으나 실제 SMS provider는 제외. | post-12-seed | SMS 비용/국가/발신자 정책 결정 후 별도 계획. |
| PRE12-F06 | B2B sender/email sync/sequence/campaign | 05 G10 제외 | G10은 Gmail/Microsoft send adapter만 닫는다. | post-12-seed | Growth/B2B 정책 후 별도 계획. |
| PRE12-F07 | Company/Contact/Product latest summary | NBA-003 잔여, 06 제외 | 06은 Deal list `latestActivity`만 완료했다. 2026-08-06 A 결정으로 06 완료 범위를 재오픈하지 않는다. | defer | pre-12 G04 계약화와 구현을 하지 않는다. 비고: post-12 B2B/team CRM strategy seed로 12 완료 후 Global B2C 지표와 B2B/team CRM 전략에서 재검토한다. |
| PRE12-F08 | MeetingNote list latest/next summary | NBA-004 잔여, 07 제외 | 07은 상세 next action/follow-up draft만 완료했다. | post-12-seed | 12 전 구현하지 않는다. list response와 raw text 제외 계약은 post-12 재검토에서 필요성이 확인될 때만 만든다. |
| PRE12-F09 | generic ExportJob/PDF | 03/11 후속 | 03은 sync Excel만 완료했고 generic ExportJob/PDF는 제외했다. | post-12-seed | Trust/policy, file TTL, audit, Admin queue와 함께 재검토. |
| PRE12-F10 | Google Calendar write/watch/recurrence | 03/04 후속 | 03은 반복 일정 정식 모델을 제외했고, 04는 read-only import/sync만 완료했다. write, webhook, recurrence는 제외했다. | post-12-seed | Calendar 정책과 conflict resolution 결정 필요. |
| PRE12-F11 | backup/restore runbook/drill | NBA-014/data reliability | 11 Admin system gate는 점검 결과 기록이지 shell 실행/운영 runbook이 아니다. | post-12-seed | 운영 절차 문서로 승격할지 재검토한다. 비고: ops follow-up 성격. |
| PRE12-F12 | billing/paywall/churn/paid conversion | 09/11/12 연결 | 09는 reserved taxonomy만, 11은 Admin operation만 완료했다. | billing-blocked | 12 전 구현 금지. |
| PRE12-F13 | Import scale/source/Admin 확장 | 01 제외 | 01은 회사/담당자/제품/딜 import와 10MB/5,000 data row 제한, 보관/삭제/복구 신뢰 기준으로 완료됐다. 대용량 import background worker, 일정/회의록 import, ImportJob Admin 전용 화면/API는 01 최종형 밖이다. | post-12-seed | 12 전 구현하지 않는다. post-12 product scale, Admin ops, import source 전략에서 새 TODO 승격 여부를 판단한다. |

## 3. 06과 직접 충돌하는 후보

아래 후보는 06 작업자가 특히 조심해야 한다.

| 후보 | 06에서 가능한 것 | 06에서 금지 |
| --- | --- | --- |
| 다음 행동 reminder | 다음 행동 생성/완료 변경을 DealActivity로 기록 | Notification scheduling, due processor, reminder setting 추가 |
| 회의록 follow-up reminder | 회의록 연결/해제를 DealActivity로 기록 | MeetingNote 기반 Notification 생성 |
| follow-up sent/failed | Deal target follow-up delivery attempt를 safe summary로 기록 | follow-up body 전체, provider raw, 연락처 원문을 summary/log에 저장 |
| record summary | Deal list `latestActivity` 유지 | Company/Contact/Product/MeetingNote list summary를 몰래 추가. 2026-08-06 A 결정에 따라 Company/Contact/Product latest summary와 generic summary endpoint는 12 전 계약화하지 않는다. |

## 4. 관련 문서

- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/COMMON/COVERAGE-MATRIX.md`
- `TODO/NEXT_BACKEND_API_BACKLOG_PLAN/README.md`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN/README.md`
