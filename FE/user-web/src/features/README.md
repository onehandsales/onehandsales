# Features

비즈니스 feature slice를 이곳에 둔다.

`deal` feature를 구현할 때의 예시:

```text
features/deal/
  components/
    deal-list.tsx
    deal-detail-panel.tsx
    deal-create-dialog.tsx
  hooks/
    use-deal-filters.ts
  api/
    deal.api.ts
    deal.queries.ts
  schemas/
    deal.schema.ts
  types/
    deal.types.ts
  index.ts
```

page는 내부 feature 파일이 아니라 `@/features/deal`에서 import해야 한다.
