# Frontend User Web Convention

## 1. Naming

Files:

- kebab-case
- role suffix where useful

Examples:

```text
company-list.page.tsx
contact-card.tsx
deal-form.tsx
use-deals.ts
deal.api.ts
deal.types.ts
date.utils.ts
auth.store.ts
api-client.ts
```

Components:

- PascalCase
- named export only

Variables/functions:

- camelCase

Constants:

- UPPER_SNAKE_CASE

Types/interfaces:

- PascalCase

## 2. TypeScript

Required:

- `strict`
- `noUnusedLocals`
- `noUnusedParameters`
- `noFallthroughCasesInSwitch`
- `noUncheckedIndexedAccess`

Rules:

- `any` is forbidden.
- Object shapes use `interface`.
- unions/utilities use `type`.
- minimize `as`; validate with Zod where needed.
- use `import type` for type-only imports.

## 3. React

Rules:

- function components only
- hooks only
- named exports only
- no default component export
- key uses stable IDs, never array index
- early return for loading/error/empty states when branches are complex

Component order:

1. library hooks
2. custom hooks
3. local state
4. derived values
5. event handlers
6. early returns
7. JSX
8. props interface

Event naming:

- prop callbacks: `on*`
- internal handlers: `handle*`

## 4. Server State

Use TanStack Query.

Rules:

- no `useEffect` + fetch for server data
- no Redux/Zustand for server data cache
- use query key factories
- invalidate after mutations
- use optimistic updates only when rollback is simple and tested

Query key example:

```text
['deals']
['deals', 'list', filter]
['deals', 'detail', dealId]
['companies', companyId, 'contacts']
```

## 5. Forms

Use React Hook Form + Zod.

Rules:

- schema is defined before form usage
- Korean validation messages live in Zod schema
- components do not hard-code validation messages when schema can own them
- default values are explicit
- async-loaded form values use `reset`

## 6. Imports

Order:

1. React
2. external libraries
3. `@/app/*`, `@/pages/*`
4. `@/features/*`
5. `@/shared/*`
6. relative paths

Feature imports must use public API:

```text
@/features/contact
```

Do not import another feature's internal files.

## 7. Styling

Use:

- Tailwind CSS
- shadcn/ui
- `cn`
- `cva` where shadcn-style variants are needed

Forbidden:

- CSS modules
- styled-components
- inline style except for dynamic values that Tailwind cannot express
- card-in-card layouts
- decorative gradient/orb-heavy backgrounds

Use lucide icons for icon buttons when possible.

## 8. API And Env

Use a single user API client in:

```text
src/shared/api/
```

Env variables use `VITE_` prefix and are wrapped in config:

```text
src/shared/config/env.ts
```

Do not access `import.meta.env` throughout feature code.

## 9. Accessibility

Rules:

- interactive elements are semantic buttons/links/inputs
- form inputs have labels
- dialogs are keyboard accessible
- focus states are visible
- text must not overflow buttons, tabs, cards, or table cells

## 10. Forbidden Summary

Forbidden:

- `any`
- default component export
- class components
- `useEffect` + fetch for server data
- feature internal-file import from another feature
- `process.env`
- direct `console.log`
- `key={index}`
- hard-coded form error messages outside Zod when avoidable



