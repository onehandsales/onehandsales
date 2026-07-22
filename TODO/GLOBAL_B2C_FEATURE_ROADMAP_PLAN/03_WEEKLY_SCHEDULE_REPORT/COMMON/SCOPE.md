# Scope

상태: confirmed
최종 업데이트: 2026-07-22
정본 계약: `COMMON/API-SPEC/WEEKLY_SCHEDULE_REPORT_API.md`
아키텍처/UXUI 기준: `COMMON/ARCHITECTURE-GUARDRAILS.md`
Global B2C 대조: `COMMON/GLOBAL-B2C-ALIGNMENT-REVIEW.md`
사용자 결정: 2026-07-22, 03은 주간 보고서 화면과 동기식 Excel 다운로드까지만 구현한다.

## 포함

| 항목 | 내용 |
|---|---|
| 주간 보고서 조회 | `weekStart`와 `timeZone` 기준 7일 보고서 |
| route 노출 | `/app/schedules/week` redirect 해제 |
| 날짜별 보고서 | 일정 없는 날도 포함하는 7개 `days[]` |
| 다일 일정 표시 | 요청 timezone 기준 겹치는 모든 날짜 bucket에 표시 |
| 딜 연결 요약 | active linked deal의 단계, 금액, 마감일, 회사, 담당자, 다음 행동 |
| 주간 summary | 일정 수, 일정 있는 날짜 수, 미연결 일정 수, 연결 딜 수, 딜 단계별 count, 중복 제거 딜 금액 합계 |
| Excel export | `GET /api/schedules/week/export/xlsx` 동기식 다운로드 |
| AI 리포트 준비 | 05 AI 주간 영업 리포트가 재사용할 report response 구조 |
| 보안/노출 제한 | 일정 메모 본문, private memo, meeting note body, provider raw response 제외 |
| 아키텍처 기준 | `AGENT/SOFTWARE_AGENT` 기반 Backend/DB/Frontend 구조 |
| UX/UI 기준 | `AGENT/UXUI_AGENT` 기반 Notion식 page/report + Attio식 linked record UX |
| Global B2C 대조 | `NBA-009` 승격, first-sale gate 중 retention/Product UX 일부 반영 |

## 제외

| 항목 | 이유 |
|---|---|
| AI 요약 생성 | 05 AI Weekly Sales Report에서 분리 |
| Google Calendar import | 04 Google Calendar Integration에서 분리 |
| PDF export | 별도 사용자 결정/goal |
| 범용 ExportJob | 대용량 worker, 파일 저장, TTL, 다운로드 권한은 별도 사용자 결정/goal |
| `/app/export` | 이번 03에서는 계속 숨김/redirect |
| 반복 일정 정식 모델 | 별도 사용자 결정/goal로 분리 |
| 제품 요약 | `NBA-001` 별도 계약 전까지 제외 |
| 민감정보 포함 export | 11 Admin/Trust/Policy gate에서 별도 정책 확정 후 진행 |
| 신규 DB 구조 | 이번 03은 기존 DB 조회만 사용. 새 model/table/column/index/migration 금지 |
| 앱 전체 다국어 | Global B2C first-sale gate 별도 계획 |
| 국가별 통화/전화번호/주소 모델 | Global data model 별도 계획 |
| Product analytics | event taxonomy/privacy 기준 별도 계획 |
| Pricing/Billing/Admin/Trust policy | Global B2C first-sale gate 별도 계획 |

## 구현 전 확정된 결정

- 여기까지만 진행한다: 주간 보고서 화면 + 동기식 Excel 다운로드.
- 보고서 1차 형식은 화면 + Excel이다.
- `weekStart`는 `YYYY-MM-DD`이고 월요일만 허용한다.
- `timeZone`은 IANA timezone ID다.
- 일정이 없는 날도 보고서에 표시한다.
- 다일 일정은 겹치는 날짜마다 표시한다.
- 딜 금액/단계/예상 마감일/다음 행동은 보고서에 포함한다.
- 일정 메모 본문은 포함하지 않고 `hasMemo`만 반환한다.
- Excel은 서버에 저장하지 않고 즉시 응답한다.
- 새 DB 구조, 새 Prisma model, 새 migration은 만들지 않는다.
- DB 관련 구현 또는 문서 변경이 생기면 한글 주석을 반드시 둔다.
- 범용 ExportJob, 파일 retention, 다운로드 재조회 API는 이번 03에서 구현하지 않는다.
- 반복 일정은 정식 구현하지 않는다.
- 범위 밖 항목은 03 구현에 섞지 않고 별도 사용자 결정/goal로 분리한다.
- 03은 `NBA-009 Schedule week report`만 승격한다. 다른 NBA 후보는 섞지 않는다.
- Global B2C 첫 판매 gate 전체를 닫지 않는다.

## 완료 기준

- `/app/schedules/week`에서 주간 보고서를 볼 수 있다.
- `GET /api/schedules/week`가 API spec대로 동작한다.
- `GET /api/schedules/week/export/xlsx`가 Excel 파일을 내려준다.
- `weekStart`와 `timeZone` 기준이 FE/BE에서 일관된다.
- 사용자 소유 일정과 active linked deal만 포함된다.
- 일정 없는 주도 7개 day가 표시된다.
- 일정 메모 본문, private memo, meeting note body는 response/export/log에 노출되지 않는다.
- `/app/export`, `/api/exports`, PDF, 반복 일정은 별도 사용자 결정/goal 항목으로 문서화되어 있다.
- Backend/DB/Frontend 구조가 `COMMON/ARCHITECTURE-GUARDRAILS.md`와 `AGENT/SOFTWARE_AGENT`를 따른다.
- UX/UI와 사용자 노출 문구가 `COMMON/ARCHITECTURE-GUARDRAILS.md`와 `AGENT/UXUI_AGENT`를 따른다.
- Global B2C 대조 결과가 `COMMON/GLOBAL-B2C-ALIGNMENT-REVIEW.md`와 일치한다.
