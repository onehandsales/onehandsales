# Backend Modules

This folder contains Backend feature modules. The current baseline is a single NestJS modular monolith with User API modules and admin auth verification support.

Current modules:

| Module | Purpose |
|---|---|
| `auth` | Supabase token exchange, App token, session, device registration |
| `user` | Current user profile and registered device lookup |
| `company` | User-owned company, company field/region, memo log, encrypted private memo log APIs, linked contacts/deals, xlsx export |
| `contact` | User-owned contact, company option, department/job grade, memo log, encrypted private memo log APIs, linked deals, xlsx export |
| `product` | User-owned product, product category/status, memo log, encrypted private memo log APIs, linked deals, xlsx export |
| `deal` | User-owned deal, company/contact/product links, `DealActivity`, following action log, memo log, soft delete APIs, xlsx export |
| `schedule` | User-owned schedule, month/week list, weekly report/xlsx export, schedule-deal link, Google Calendar read-only sync, soft delete APIs |
| `meeting-note` | User-owned meeting note, snapshot links, manual CRUD, AI/STT draft, next-action/follow-up draft, saved-note deal linking |
| `follow-up` | Follow-up message draft/send/retry/history and delivery settings |
| `sales-report` | AI weekly sales report generation/list/detail/snapshot summary |
| `analytics` | Product analytics client event collection and snapshot/AI usage summary foundation |
| `search` | Integrated search over company, contact, product, deal, schedule, and meeting note data |
| `trash` | 7-day trash list/detail/restore for supported entities and logs |
| `health` | Lightweight health endpoint |

Deferred scope: Paddle/Billing, B2B tenant/team features, paid recovery/hard purge policy.
