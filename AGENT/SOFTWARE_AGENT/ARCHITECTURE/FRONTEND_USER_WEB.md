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

## 3. Feature-First Structure

Use a feature-first frontend structure. The frontend is not a backend-style Clean Architecture copy. It has route composition, feature slices, and shared UI/technical primitives.

Canonical source structure:

```text
src/
  assets/
  app/
    providers/
    router/
    app.tsx
  components/
    ui/
    layout/
  features/
    <feature>/
      components/
      hooks/
      api/
      schemas/
      types/
      index.ts
  hooks/
  lib/
    api-client.ts
    env.ts
    query-client.ts
  pages/
  store/
  types/
  utils/
  styles/
  main.tsx
```

Dependency direction:

```text
main/app/router -> pages -> features -> components/hooks/lib/store/types/utils/styles
```

Rules:

- `app` owns providers, router creation, and app-level composition only.
- `pages` are route entry points. They compose feature components and remain thin.
- `features` own product-specific behavior, server state hooks, forms, schemas, feature components, and feature-local types.
- `components/ui` contains generic shadcn-style primitives such as Button, Input, Dialog, Badge, Toast, Table primitives.
- `components/layout` contains app layout primitives such as Sidebar, Header, PageLayout, EmptyState, PageToolbar.
- `hooks` contains domain-free shared hooks such as `useDebounce` and `useMediaQuery`.
- `lib` contains technical clients and singletons such as API client, env wrapper, date helpers with dependencies, and TanStack Query client.
- `store` is only for cross-page client UI state. Do not store server data there.
- `types` contains domain-free shared types such as pagination and normalized API error shapes.
- `utils` contains pure domain-free formatting and calculation helpers.
- shared root folders cannot import from `pages`, `features`, `app`, or `router`.
- Feature-to-feature imports are allowed only through the other feature's `index.ts`.
- Pages must import feature public APIs, not feature internal files.

If a feature is small, `api.ts` and `types.ts` are acceptable. If it grows, split them into `api/` and `types/` without changing imports outside the feature.

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
src/lib/api-client.ts
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

Feature API files call the app API client from `src/lib/api-client.ts`. Pages and components do not call `fetch` or the client directly for business data.

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
- public exports are in `index.ts`
- API functions and TanStack Query hooks are under `api` or `api.ts`
- UI components are under `components`
- business hooks are under `hooks`
- validation schemas are under `schemas`
- feature-local types are under `types` or `types.ts`
- page imports from feature public API only
- form validation uses Zod
- server data uses TanStack Query
- route state that affects list views uses search params
- feature code does not import from another feature's internal files
