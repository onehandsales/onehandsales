# Goal Specs

상태: Draft
작성일: 2026-08-06

## 1. Goal 목록

| Goal | 문서 | 목적 |
| --- | --- | --- |
| G00 | `G00_SCOPE_CLASSIFICATION.md` | 후보 상태 확정과 완료 슬롯 경계 고정 |
| G01 | `G01_06_SCOPE_GUARD_AND_CODE_AUDIT.md` | 06 작업 결과가 범위를 넓히지 않았는지 audit |
| G02 | `G02_NEXT_ACTION_REMINDER_CONTRACT.md` | 다음 행동 reminder 계약 여부 결정 |
| G03 | `G03_MEETING_NOTE_FOLLOW_UP_REMINDER_CONTRACT.md` | 회의록 follow-up reminder/자동 발송 후보 분리 |
| G04 | `G04_RECORD_SUMMARY_CONTRACT.md` | NBA-003 record summary 보류 결정과 NBA-004 MeetingNote list summary 분리 |
| G05 | `G05_PROVIDER_SMOKE_CLOSEOUT.md` | 05 G10 운영 provider smoke closeout |
| G06 | `G06_06_RECORD_SUMMARY_DEFER_CLOSEOUT.md` | 06/NBA-003 record summary defer 결정 closeout |
| G07 | `G07_01_IMPORT_EXPANSION_DEFER_CLOSEOUT.md` | 01 import scale/source/Admin 확장 후보 defer 결정 closeout |
| G08 | `G08_07_MEETING_NOTE_AI_FOLLOWUP_DEFER_CLOSEOUT.md` | 07 MeetingNote AI 후속 후보 defer/closeout |
| G09 | `G09_08_GLOBAL_DATA_I18N_FOLLOWUP_DEFER_CLOSEOUT.md` | 08 Global Data I18N 후속 후보 defer/closeout 완료 |
| G10 | `G10_09_PRODUCT_ANALYTICS_FOLLOWUP_DEFER_CLOSEOUT.md` | 09 Product Analytics 후속 후보 defer/closeout 완료 |
| G11 | `G11_10_MOBILE_PWA_FIELD_USE_FOLLOWUP_CLOSEOUT.md` | 10 Mobile PWA Field Use 후속 후보와 문서/코드 정합성 closeout 완료 |
| G12 | `G12_11_ADMIN_OPERATION_FOLLOWUP_CLOSEOUT.md` | 11 Admin Operation 후속 후보와 문서/코드 정합성 closeout |
| G99 | `G99_PRE12_CLOSEOUT.md` | pre-12 재대조 closeout과 상위 문서 반영 |

## 2. 공통 금지

- confirmed API 없이 구현 goal로 들어가지 않는다.
- DB schema 변경 없이도 될 것처럼 추정하지 않는다.
- 06 완료 범위를 넓혀서 새 알림/summary 기능을 끼워 넣지 않는다.
- 06 완료 범위를 넓혀서 DealActivity 삭제/retention/audit, memo 통합, 공통 activity bus, 고급 검색/필터, 딜 score, AI activity 자동 판단, summary cache를 끼워 넣지 않는다.
- billing-linked 후보는 12 전 구현하지 않는다.
- 2026-08-06 A 결정으로 `NBA-003` 잔여 record summary는 12 전 계약화하지 않는다.
- 07 완료 범위를 넓혀서 MeetingNote list summary, follow-up 자동 발송/알림, AI data cleanup, transcript/raw 저장 기능을 끼워 넣지 않는다.
- 08 완료 범위를 넓혀서 신규 locale/country/currency/phone/auth provider, minor unit, `/app` locale prefix를 끼워 넣지 않는다.
- 09 완료 범위를 넓혀서 account deletion 실제 job, 세부 analytics event, 외부 provider, public/UTM attribution, growth experiment, billing runtime model, PWA/native attribution을 끼워 넣지 않는다.
- 10 완료 범위를 넓혀서 PWA/offline/native app, `UserDraft`, server draft DB, media/raw 저장, `/app/export`, `/api/exports`를 끼워 넣지 않는다.
- 10 문서 체크리스트나 FE architecture stale 문서를 기능 미구현 근거로 보지 않는다.
- 11 완료 범위를 넓혀서 Admin 직접 Trash 복구/유료 복구/hard delete/purge, export artifact/download, 자동 민감정보 감지, Billing Admin을 끼워 넣지 않는다.
- 11 문서 체크리스트나 Admin Web architecture stale 문서를 기능 미구현 근거로 보지 않는다.
