# 2026-06-13 Work Summary

## Scope

- Deal quick-create modal behavior and layout stability.
- Deal pipeline header, list controls, and click-only detail panel.
- Deal detail panel and dedicated detail page based on deal-related pen references.
- Desktop shell header/sidebar notification placement.

## User-Facing Changes

- Deal quick-create now supports inline company, contact, and product search/selection with simple creation flows.
- Amount input shows comma separators while preserving numeric values for form data.
- Deadline input accepts compact numeric entry such as `20260410` and converts it to a date value.
- Modal error/helper text areas keep stable height so fields do not shift when validation text appears.
- Deal pipeline no longer duplicates search/export controls below the header.
- The right-side deal detail panel appears only after a deal row is clicked.
- Sort/count controls are outside the deal list table surface, with amount and deadline chips in the same controls row.
- Deal detail panel/page now follow the tone of the pen references with compact cards, next action, activity logs, stage chips, products, and memo sections.
- Memo logs are collapsed by default and expand/collapse when the memo title row is clicked.
- Desktop header no longer shows the profile avatar or notification bell.
- The notification bell is now beside the sidebar bottom profile area.
- Header search is aligned to the right and placed before page action buttons.

## Validation

- Focused eslint passed for the changed deal/header files.
- `git diff --check` passed.
- Full `pnpm --dir FE/user-web typecheck` is still blocked by the pre-existing resolver type mismatch in `src/features/product/components/product-edit-form.tsx`.

## Related Logs

- `TODO_LOG/2026-06-13/DEAL_QUICK_CREATE_INLINE_ENTITIES/WORK_LOG.md`
- `TODO_LOG/2026-06-13/DEAL_PIPELINE_HEADER_DETAIL_PANEL/WORK_LOG.md`
- `TODO_LOG/2026-06-13/DEAL_PEN_DETAIL_PAGE_REWORK/WORK_LOG.md`
- `TODO_LOG/2026-06-13/HEADER_SIDEBAR_PROFILE_NOTIFICATION/WORK_LOG.md`
