# 기능

비즈니스 feature slice를 이곳에 둔다.

`deal` feature를 구현할 때의 예시:

```text
features/deal/
  api/
    deal-api.ts
    deal-query-keys.ts
  components/
    deal-list.tsx
    deal-detail-panel.tsx
    deal-create-dialog.tsx
  hooks/
    use-deal-filters.ts
  schemas/
    deal-schema.ts
  types/
    deal.ts
  index.ts
```

page는 내부 feature 파일이 아니라 `@/features/deal`에서 import해야 한다.

현재 Schedule feature는 `@/features/schedule`에서 export한다.

```text
features/schedule/
  api/
    schedule-api.ts
    schedule-query-keys.ts
  components/
    schedule-screen.tsx
    schedule-week-report-screen.tsx
    schedule-form-dialog.tsx
  hooks/
    use-schedule-queries.ts
    use-schedule-mutations.ts
  schemas/
    schedule-schema.ts
  types/
    schedule.ts
  index.ts
```

일정 화면은 Backend `GET /api/schedules/deal-options`, `GET /api/schedules`, `POST/PATCH/DELETE /api/schedules/:scheduleId` 계약만 사용한다.
