# Frontend User Web Architecture

## 1. Position

User Web is a separate React app under:

```text
FE/user-web
```

Stack:

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Router
- TanStack Query
- React Hook Form
- Zod

User Web is the first MVP client. It must be responsive because the first users are individual salespeople who may use it on desktop and mobile web before the native app exists.

## 2. Separation Rule

`FE/user-web` does not share packages with:

- `FE/admin-web`
- `BE`
- future mobile app

No root workspace package is used.

OpenAPI-generated types may be generated inside `FE/user-web`, but not through a shared package.

## 3. Feature-Sliced Structure

Use Feature-Sliced Design:

```text
src/
  app/
    providers/
    routes/
    styles/
    app.tsx
  pages/
  features/
  shared/
    ui/
    lib/
    api/
    config/
    hooks/
    types/
```

Dependency direction:

```text
app -> pages -> features -> shared
```

Rules:

- `shared` imports no business feature.
- `pages` compose features and stay thin.
- `features` expose public API through `index.ts`.
- Other features/pages import a feature through its `index.ts`, not internal files.

## 4. MVP Feature Folders

Recommended feature folders:

- `auth`
- `company`
- `contact`
- `product`
- `deal`
- `schedule`
- `meeting-note`
- `business-card`
- `tag`
- `import-export`
- `notification`
- `trash`

Use the UI label `거래처(담당자)` for Contact where ambiguity is likely.

## 5. State Management

Server state:

- TanStack Query only.
- No `useEffect` + fetch for server data.
- Do not copy server data into Zustand.

Client state:

- `useState` for local UI state.
- Zustand only for cross-page client UI state such as sidebar, theme, draft view settings.

Form state:

- React Hook Form + Zod.

URL state:

- list filters, page, sort, and search should live in URL search params when users may bookmark or share a view.

## 6. API Client

The API client lives in:

```text
src/shared/api/
```

User Web calls User API only:

```text
/api/*
```

Do not call `/admin/api/*` from User Web.

The client handles:

- base URL
- auth token
- refresh or logout behavior
- error normalization

Feature API files should call the shared API client.

## 7. Routing

Use React Router.

Recommended MVP routes:

- `/login`
- `/`
- `/companies`
- `/companies/:companyId`
- `/contacts`
- `/contacts/:contactId`
- `/products`
- `/products/:productId`
- `/deals`
- `/deals/:dealId`
- `/schedules`
- `/meeting-notes`
- `/business-cards`
- `/import`
- `/export`
- `/trash`
- `/settings`

Protected routes require an authenticated user.

## 8. UI Direction

This is a productivity tool for individual salespeople, not a marketing site.

Rules:

- Start with the app experience, not a landing page.
- Prioritize fast entry, search, filtering, and detail editing.
- Use restrained business UI.
- Avoid decorative hero layouts.
- Use shadcn/ui components and lucide icons where appropriate.
- Keep cards only for repeated items, modals, and genuinely framed tools.
- Do not nest cards inside cards.

Salespeople may use the product in a hurry. Forms and lists should be scannable and input-heavy screens should not be visually noisy.

## 9. Accessibility And Mobile Web

User Web must support mobile web.

Rules:

- Use semantic buttons, inputs, labels, and dialogs.
- Avoid `div onClick` for interactive elements.
- Keep touch targets large enough for mobile.
- Ensure text does not overflow buttons/cards.
- Keyboard navigation should work for dialogs and forms.

## 10. Performance

Default:

- avoid premature `useMemo`/`useCallback`
- measure before optimizing

Use virtualization when a list can realistically exceed 1,000 rows.

Images:

- business card images should use optimized Supabase Storage URLs when available
- lazy-load non-critical images

## 11. Checklist

When creating a feature:

- feature folder exists
- API functions and TanStack Query hooks are under `api`
- UI components are under `components`
- business hooks are under `hooks`
- extra local types are under `types`
- public exports are in `index.ts`
- page imports from feature public API only
- form validation uses Zod
- server data uses TanStack Query
- route state that affects list views uses search params


