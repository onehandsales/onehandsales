# G03 User Web Weekly Report UX

상태: Done

## 1. 목적

User Web에서 `/app/schedules/week` 주간 일정 보고서 화면을 열고 Backend API와 Excel 다운로드를 연결한다.

## 2. 선행 조건

- G01 Backend Weekly Report API 완료
- G02 Backend Weekly Report Xlsx Export 완료
- `COMMON/API-SPEC/WEEKLY_SCHEDULE_REPORT_API.md` 계약 상태가 `confirmed`다.
- `COMMON/ARCHITECTURE-GUARDRAILS.md`를 먼저 읽고 따른다.
- `COMMON/GLOBAL-B2C-ALIGNMENT-REVIEW.md`를 먼저 읽고 따른다.
- Frontend 구조는 `AGENT/SOFTWARE_AGENT/FRONT_AGENT` 기준을 따른다.
- UX/UI와 사용자 노출 문구는 `AGENT/UXUI_AGENT` 기준을 따른다.

## 3. 포함 범위

- `/app/schedules/week` redirect 해제
- legacy `/schedules/week` -> `/app/schedules/week` redirect
- `ScheduleWeekPage` export
- `ScheduleWeekReportScreen` export
- weekly report API client
- weekly report query key/hook
- xlsx download API client
- URL query `weekStart`
- 이전 주/다음 주/이번 주 이동
- loading/empty/error/export error 상태
- Excel 다운로드 버튼
- `/app/schedules`에서 주간 보고서 진입 버튼
- 모바일 390px/360px 대응

## 4. 제외 범위

- `/app/export` route 노출
- generic Export 화면
- PDF 다운로드
- 반복 일정 UI
- 제품 요약
- 일정 메모 본문 표시
- 민감정보 포함 export toggle

## 5. User Web 구조 기준

- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`를 따른다.
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`를 따른다.
- page entry는 `FE/user-web/src/pages/schedules/week/index.tsx`에 둔다.
- business UI는 `FE/user-web/src/features/schedule/components/schedule-week-report-screen.tsx`에 둔다.
- API 함수는 `features/schedule/api/schedule-api.ts`에 둔다.
- query key는 `features/schedule/api/schedule-query-keys.ts`에 둔다.
- hook은 `features/schedule/hooks/use-schedule-queries.ts`에 둔다.
- types는 `features/schedule/types/schedule.ts`에 둔다.
- page component는 조립만 담당한다.
- API 호출은 `apiClient`를 통해서만 한다.
- app-wide i18n, currency/phone/address global data model, product analytics event taxonomy는 이번 G03에서 새로 만들지 않는다.

## 6. UX/UI 기준

- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`를 따른다.
- `AGENT/UXUI_AGENT/DECISIONS/015_uxui_list_filter_pagination.md`를 따른다.
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`를 따른다.
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`를 따른다.
- `AGENT/UXUI_AGENT/PLANNING/UX_WRITING_GUIDE.md`를 따른다.
- `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`를 따른다.
- Notion식 page/report 구조를 따른다.
- Attio식 linked record 맥락이 보이도록 일정 안에 딜/회사/담당자/다음 행동 관계를 보여준다.
- 데스크톱은 날짜별 section + compact schedule row를 우선한다.
- 모바일은 날짜별 card/list로 전환한다.
- 페이지를 큰 카드 안에 넣지 않는다.
- 버튼은 lucide icon과 짧은 label을 사용한다.
- Excel 다운로드 중에는 버튼을 disabled 처리한다.
- 일정 row 클릭 시 `/app/schedules/:scheduleId`로 이동할 수 있어야 한다.
- 딜 summary 클릭 시 `/app/deals/:dealId`로 이동할 수 있어야 한다.
- 현재 한국어 UX writing을 쓰되, 나중에 locale key로 분리하기 어렵게 component 곳곳에 흩뿌리지 않는다.
- 날짜/시간/금액 표시는 기존 formatter 또는 `Intl` 기반 helper를 우선 사용한다.
- `Asia/Seoul`을 화면 기본값으로 하드코딩하지 않는다.
- Product analytics event taxonomy를 임의로 만들지 않는다.

## 7. UX writing

| 상황 | 문구 |
|---|---|
| loading | `주간 보고서를 불러오고 있어요.` |
| empty week | `일정을 등록하면 이번 주 계획을 한눈에 볼 수 있어요.` |
| error | `보고서를 불러오지 못했어요. 다시 시도해 주세요.` |
| export error | `보고서를 다운로드하지 못했어요. 다시 시도해 주세요.` |
| export button | `엑셀 다운로드` |

## 8. 시간 처리

- FE는 `weekStart` date-only 값을 UTC로 변환하지 않는다.
- URL query `weekStart`가 없으면 사용자 timezone 기준 이번 주 월요일을 계산한다.
- API response의 UTC instant는 response `timeZone` 기준으로 표시한다.
- 날짜 전용 값은 timezone 변환 없이 표시한다.
- 사용자/browser timezone을 우선하고 Backend fallback은 API에 맡긴다.

## 9. 검증 명령

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
```

## 10. 완료 기준

- `/app/schedules/week`가 redirect되지 않는다.
- legacy `/schedules/week`는 `/app/schedules/week`로 이동한다.
- `/app/schedules`에서 주간 보고서로 진입할 수 있다.
- `weekStart` 이동 후 URL query와 TanStack query key가 갱신된다.
- loading/empty/error/export error 문구가 UX writing 기준과 맞다.
- Excel 다운로드가 현재 보고서와 같은 `weekStart`, `timeZone`으로 호출된다.
- 다운로드 중 버튼이 disabled 처리된다.
- 390px/360px에서 날짜 section, summary, row/card, 다운로드 버튼이 겹치지 않는다.
- 제품 요약, 일정 메모 본문, private memo, meeting note body를 화면/export에 꾸며 넣지 않는다.
- FE가 Backend 응답에 없는 DB 파생값을 사실처럼 꾸며 넣지 않는다.
- UX/UI가 `AGENT/UXUI_AGENT` 기준과 충돌하지 않는다.
- Global B2C 첫 판매 gate 중 결제/Admin/앱 전체 다국어/통화 모델/제품 분석을 G03에 섞지 않는다.
