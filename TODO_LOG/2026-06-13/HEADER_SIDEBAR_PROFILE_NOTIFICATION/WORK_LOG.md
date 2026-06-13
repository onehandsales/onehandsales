# Header Sidebar Profile Notification

## Scope
- Remove profile/avatar from the desktop header.
- Move the notification bell to the right side of the sidebar bottom profile area.
- Push the header search box to the right side and place it before header action buttons.

## Changes
- [x] Removed header profile/avatar from regular, product detail, and deal detail header variants.
- [x] Removed notification bell from the desktop header.
- [x] Added notification bell link to the sidebar profile footer.
- [x] Moved search into the right-side header action area before buttons.
- [x] Kept product-list-specific search behavior on `/products`; other pages use global search.

## Validation
- [x] `pnpm --dir FE/user-web exec eslint src/components/layout/app-shell.tsx`
- [x] `git diff --check`
- [x] `pnpm --dir FE/user-web typecheck` checked; still fails on the pre-existing `src/features/product/components/product-edit-form.tsx` resolver type mismatch.
