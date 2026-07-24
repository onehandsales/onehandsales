# 05-A User Web TODO

상태: Implementation-ready draft

## 1. 위치

- route: `/app/schedules/week`
- 기존 page: `FE/user-web/src/pages/schedules/week/index.tsx`
- 기존 feature: `FE/user-web/src/features/schedule`
- 신규 feature 후보: `FE/user-web/src/features/ai-weekly-report`

## 2. API client

추가할 파일 후보:

```text
FE/user-web/src/features/ai-weekly-report/
  api/ai-weekly-report-api.ts
  api/ai-weekly-report-query-keys.ts
  components/ai-weekly-report-section.tsx
  components/ai-weekly-report-version-list.tsx
  components/ai-weekly-report-suggestion-card.tsx
  hooks/use-ai-weekly-report-queries.ts
  hooks/use-ai-weekly-report-mutations.ts
  types/ai-weekly-report.ts
```

API:

- `createAiWeeklyReport`
- `getAiWeeklyReportWeek`
- `getAiWeeklyReport`
- `getAiWeeklyReportSnapshotSummary`

Query key:

```ts
aiWeeklyReportQueryKeys.week({
  weekStart,
  timeZone,
})

aiWeeklyReportQueryKeys.detail(reportId)
aiWeeklyReportQueryKeys.snapshotSummary(reportId)
```

## 3. 화면 상태

| 상태 | UI |
|---|---|
| no successful report | empty 문구와 `리포트 생성` |
| generating | skeleton/polling, 버튼 disabled |
| ready | report sections 표시 |
| failed latest attempt | 안전한 실패 문구와 `다시 생성` |
| existing generating conflict | 기존 생성 중 report polling |
| empty week | 기존 주간 보고서는 empty, AI section은 생성 가능하되 coverage 부족 안내 |

## 4. 표시 section

필수:

- 생성 정보: version, status, generatedAt
- 주간 요약
- 주요 리스크
- 다음 주 행동
- follow-up 초안
- 데이터 정리 제안
- 참고 데이터 요약
- version 목록

표시하지 않을 것:

- input snapshot 원문 전체
- provider prompt
- provider raw response
- 비용
- Admin/운영 detail

## 5. UX writing 예시

| 상황 | 문구 |
|---|---|
| 생성 버튼 | `리포트 생성` |
| 재생성 버튼 | `다시 생성` |
| loading | `리포트를 만들고 있어요.` |
| provider 실패 | `리포트를 만들지 못했어요. 다시 시도해 주세요.` |
| 생성 중 중복 | `이번 주 리포트를 만들고 있어요.` |
| 참고 데이터 | `일정 8건, 딜 5건, 회의록 3건을 참고했어요.` |
| snapshot 원문 제한 | `AI가 참고한 원본은 안전하게 보관하고, 화면에는 요약만 보여줘요.` |

## 6. FE 검증

- `/app/schedules/week` 기존 보고서 API가 실패하지 않는다.
- Excel 다운로드가 그대로 동작한다.
- 생성 요청 중 버튼이 중복 클릭되지 않는다.
- polling이 unmount 시 중단된다.
- `READY` 후 week query를 invalidate한다.
- `FAILED` 후 최신 성공 report는 유지된다.
- 390px/360px에서 card text가 겹치지 않는다.
- `입니다/습니다/합니다/없습니다` 체 문구를 쓰지 않는다.
