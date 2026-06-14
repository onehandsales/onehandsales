# Deal Pen Detail Page Rework

## Scope
- Compare deal-related `.pen` pages and apply the relevant layout details to the current deal UI.
- Make memo log content toggle open when the title is clicked.
- Build the missing deal detail page in the same tone as the existing deal designs.

## Pen References
- `[home] Desktop – Deal Pipeline Home`
- `Right Detail Panel`
- `[home] -Mobile – Deal Pipeline Home`
- `[home] - Mobile – Deal Detail Page`
- Shared memo card patterns from customer/company/product detail designs

## Notes
- Desktop deal list uses a separate controls row outside the table surface, with count and sort/filter chips.
- Right detail panel uses a 380px white panel, 60px header, compact metric cards, next action, activity timeline, and stage/status area.
- Mobile deal detail uses white cards on a gray background, key info first, then next action, tabs/log sections, memo cards, and warning text.
- Memo content should not push surrounding layout unexpectedly; the card expands only after the title is clicked.

## Changes
- [x] Redesign right-side deal detail panel.
- [x] Create a fuller deal detail page layout.
- [x] Convert memo log cards to title-triggered toggle content.
- [x] Recheck deal list controls against pen references.
- [x] Run focused validation.

## Implementation Summary
- Reworked `DealDetailPanel` so `panel` and `page` variants render different layouts.
- Matched the right detail panel to the pen structure: compact header, status badge, metric cards, next action, activity logs, stage chips, products, memo section.
- Built a full deal detail page with key info hero, next action card, activity/memo section, products, stage, and summary aside.
- Memo log cards now show only the title/date row by default. Clicking the title row expands/collapses the memo content.
- Added amount and deadline control chips to the desktop list controls row outside the table surface.

## Validation
- `pnpm --dir FE/user-web exec eslint src/features/deal/components/deal-detail-panel.tsx src/features/deal/components/deal-pipeline-home-screen.tsx src/pages/deals/detail.tsx` passed.
- `git diff --check` passed.
- `pnpm --dir FE/user-web typecheck` still fails on the pre-existing `src/features/product/components/product-edit-form.tsx` resolver type mismatch.
