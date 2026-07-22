# User Web TODO

상태: completed
최종 업데이트: 2026-07-22
정본 계약: `COMMON/API-SPEC/WEEKLY_SCHEDULE_REPORT_API.md`
아키텍처/UXUI 기준: `COMMON/ARCHITECTURE-GUARDRAILS.md`
Global B2C 대조: `COMMON/GLOBAL-B2C-ALIGNMENT-REVIEW.md`

## 0. Agent 기준

- User Web 구조는 `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/FRONTEND_USER_WEB.md`를 따른다.
- Frontend convention은 `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`를 따른다.
- UX/UI와 사용자 노출 문구는 `AGENT/UXUI_AGENT` 기준을 따른다.
- Global B2C 대조는 `COMMON/GLOBAL-B2C-ALIGNMENT-REVIEW.md`를 따른다.
- `pages`는 route entry와 화면 조립만 담당한다.
- business UI, API 호출, query key, hook, type은 `features/schedule` 안에 둔다.
- API 호출은 `apiClient`를 통해서만 한다.
- User Web은 `/admin/api/*`를 호출하지 않는다.
- app-wide i18n, currency/phone/address global data model, product analytics event taxonomy는 이번 03에서 새로 만들지 않는다.

## 1. 화면

- `/app/schedules/week`
- `/app/schedules`에서 주간 보고서 진입 버튼

이번 03에서는 `/app/export` redirect를 해제하지 않는다.

## 2. API 연결

| 사용자 행동 | API |
|---|---|
| 주간 보고서 조회 | `GET /api/schedules/week?weekStart=YYYY-MM-DD&timeZone=Asia/Seoul` |
| Excel 다운로드 | `GET /api/schedules/week/export/xlsx?weekStart=YYYY-MM-DD&timeZone=Asia/Seoul` |

FE API 함수:

```ts
listWeeklyScheduleReport(params: WeeklyScheduleReportParams)
downloadWeeklyScheduleReportXlsx(params: WeeklyScheduleReportParams)
```

Query key:

```ts
scheduleQueryKeys.weeklyReport({ weekStart, timeZone })
```

## 3. 라우트 작업

- `ScheduleWeekPage`를 실제 page로 export한다.
- `ScheduleWeekReportScreen` export 주석을 해제한다.
- `/app/schedules/week` redirect를 해제한다.
- legacy `/schedules/week`는 `/app/schedules/week`로 redirect한다.
- URL query `weekStart`를 지원한다.
  - 없으면 사용자 timezone 기준 이번 주 월요일을 기본값으로 쓴다.
  - 이전 주/다음 주/이번 주 버튼 클릭 시 URL query와 TanStack query key를 함께 갱신한다.
  - `Asia/Seoul`을 화면 기본값으로 하드코딩하지 않는다. 사용자/browser timezone을 우선하고 Backend fallback은 API에 맡긴다.

## 4. 화면 상태

- loading: `주간 보고서를 불러오고 있어요.`
- empty week: `일정을 등록하면 이번 주 계획을 한눈에 볼 수 있어요.`
- error: `보고서를 불러오지 못했어요. 다시 시도해 주세요.`
- export error: `보고서를 다운로드하지 못했어요. 다시 시도해 주세요.`
- export button: `엑셀 다운로드`

문구는 해요체를 따른다. 현재 한국어 UX writing을 쓰되, 나중에 locale key로 분리하기 어렵게 component 곳곳에 흩뿌리지 않는다.

## 5. 표시 정보

Top summary:

- 기간: `weekStart - weekEnd`
- timezone
- 전체 일정 수
- 연결 딜 수
- 일정 없는 날 또는 딜 미연결 일정 수
- 딜 단계별 count

Day section:

- 날짜와 요일
- 일정 수
- 연결 딜 수
- 일정 row/card 목록

Schedule row/card:

- 시간
- 일정 제목
- 장소
- 메모 있음 표시. 메모 본문은 표시하지 않는다.
- 연결 딜 요약
- 일정 row 클릭 시 `/app/schedules/:scheduleId`

Deal summary:

- 딜명
- 단계
- 금액
- 예상 마감일
- 회사/담당자
- 다음 행동
- 딜 클릭 시 `/app/deals/:dealId`

이번 03에서는 제품 요약을 표시하지 않는다. `NBA-001` 전에는 FE에서 제품 정보를 꾸며내지 않는다.

딜 금액은 기존 Deal 금액 표시 방식을 재사용한다. 통화 코드/통화 변환/국가별 금액 정책은 03에서 만들지 않는다.

## 6. UX/UI 기준

- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`를 따른다.
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`를 따른다.
- `AGENT/UXUI_AGENT/PLANNING/UX_WRITING_GUIDE.md`를 따른다.
- `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`를 따른다.
- Notion식 page/report 구조를 따른다.
- Attio식 linked record 맥락이 보이도록 일정 안에 딜/회사/담당자/다음 행동 관계를 보여준다.
- 데스크톱은 날짜별 section + compact schedule row를 우선한다.
- 모바일 390px/360px은 날짜별 card/list로 전환한다.
- 페이지를 큰 카드 안에 넣지 않는다.
- 버튼은 lucide icon과 짧은 label을 사용한다.
- Excel 다운로드 중에는 버튼을 disabled 처리한다.
- 민감정보 포함 toggle은 만들지 않는다. 이번 export는 민감 raw data를 포함하지 않는다.
- `/app/export`를 사용자에게 노출하지 않는다.
- 날짜/시간/금액 표시는 기존 formatter 또는 `Intl` 기반 helper를 우선 사용한다.
- Product analytics event taxonomy를 임의로 만들지 않는다.

## 7. 검증 기준

- `/app/schedules/week`가 redirect되지 않는다.
- `weekStart` 이동 후 URL query와 TanStack query key가 갱신된다.
- FE가 `weekStart` date-only 값을 UTC로 변환하지 않는다.
- API response의 UTC instant는 response `timeZone` 기준으로 표시한다.
- 날짜/시간/금액 표시가 기존 formatter 또는 `Intl` 기준을 따른다.
- 390px/360px에서 날짜 section, summary, row/card, 다운로드 버튼이 겹치지 않는다.
- 일정 없는 주도 7개 날짜가 표시된다.
- Excel 다운로드 실패 시 재시도 안내가 있다.
- 제품 요약, 일정 메모 본문, private memo, meeting note body를 화면/export에 꾸며 넣지 않는다.

## 8. 구현 결과

- `FE/user-web/src/pages/schedules/week/index.tsx`가 `ScheduleWeekReportScreen`을 page entry로 export한다.
- `FE/user-web/src/app/router/router.tsx`에서 `/app/schedules/week` route가 열렸고 legacy `/schedules/week`는 query를 유지한 채 `/app/schedules/week`로 이동한다.
- `features/schedule/api/schedule-api.ts`에 `listWeeklyScheduleReport`, `downloadWeeklyScheduleReportXlsx`가 추가됐다.
- `features/schedule/api/schedule-query-keys.ts`에 `scheduleQueryKeys.weeklyReport({ weekStart, timeZone })`가 추가됐다.
- `features/schedule/hooks/use-schedule-queries.ts`에 `useWeeklyScheduleReport`가 추가됐다.
- `/app/schedules` header에 현재 anchor 주차의 주간 보고서 진입 버튼이 추가됐다.
- `/app/schedules/week` 화면은 URL `weekStart`, 이전 주/다음 주/이번 주 이동, loading/empty/error/export error, Excel 다운로드 disabled 상태를 처리한다.
- 화면은 일정 row에서 `/app/schedules/:scheduleId`, 딜 summary에서 `/app/deals/:dealId`로 이동한다.
- `weekStart` date-only 값은 UTC instant로 변환해 API에 보내지 않고, API response UTC instant는 response `timeZone` 기준으로 표시한다.
- 모바일 390px/360px QA route에 `/app/schedules/week?weekStart=2026-07-20`가 포함됐다.
