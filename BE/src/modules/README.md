# Backend Modules

This folder contains Backend feature modules. The current baseline is a single NestJS modular monolith with User API modules and current Admin Operation API modules.

Current modules:

| Module | Purpose |
|---|---|
| `auth` | Supabase token exchange, App token, session, device registration |
| `user` | Current user profile and registered device lookup |
| `company` | User-owned company, company field/region, memo log, encrypted private memo log APIs, linked contacts/deals, xlsx export |
| `contact` | User-owned contact, company option, department/job grade, memo log, encrypted private memo log APIs, linked deals, xlsx export |
| `business-card` | Business card OCR scan log and confirmed company/contact creation or reuse |
| `product` | User-owned product, product category/status, memo log, encrypted private memo log APIs, linked deals, xlsx export |
| `deal` | User-owned deal, company/contact/product links, `DealActivity`, following action log, memo log, soft delete APIs, xlsx export |
| `schedule` | User-owned schedule, month/week list, weekly report/xlsx export, schedule-deal link, Google Calendar read-only sync, soft delete APIs |
| `meeting-note` | User-owned meeting note, snapshot links, manual CRUD, AI/STT draft, next-action/follow-up draft, saved-note deal linking |
| `follow-up` | Follow-up message draft/send/retry/history and delivery settings |
| `sales-report` | AI weekly sales report generation/list/detail/snapshot summary |
| `notification` | User notification APIs, settings, unread count, read state, encrypted browser push subscription storage, reminder delivery foundation |
| `analytics` | Product analytics client event collection and snapshot/AI usage summary foundation |
| `account-request` | User data export and account deletion request APIs |
| `admin-operation` | Admin user/domain read-only operation, audit/sensitive raw access, provider failure, analytics, account/trash/system operation APIs |
| `search` | Integrated search over company, contact, product, deal, schedule, and meeting note data |
| `trash` | 7-day trash list/detail/restore and recovery request support for supported entities and logs |
| `data-import` | Import templates, DB-backed ImportJob, CSV/XLSX upload, AI mapping, confirm/cancel/expire import, import logs for company/contact/product/deal |
| `health` | Lightweight health endpoint |

Deferred scope: Paddle/Billing, Billing Admin, B2B tenant/team admin, native apps, generic ExportJob, and paid recovery/hard purge policy.
