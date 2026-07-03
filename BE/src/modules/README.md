# Backend Modules

This folder contains Backend feature modules. The current baseline is a single NestJS modular monolith with User API modules and the limited current Admin auth API.

Current modules:

| Module | Purpose |
|---|---|
| `auth` | Supabase token exchange, App token, session, device registration |
| `user` | Current user profile and registered device lookup |
| `company` | User-owned company, company field/region, memo log, encrypted private memo log APIs, linked contacts/deals, xlsx export |
| `contact` | User-owned contact, company option, department/job grade, memo log, encrypted private memo log APIs, linked deals, xlsx export |
| `business-card` | Business card OCR scan log and confirmed company/contact creation or reuse |
| `product` | User-owned product, product category/status, memo log, encrypted private memo log APIs, linked deals, xlsx export |
| `deal` | User-owned deal, company/contact/product links, following action log, memo log, soft delete APIs |
| `schedule` | User-owned schedule, month/week list, schedule-deal link, hard delete APIs |
| `meeting-note` | User-owned meeting note, snapshot links, manual CRUD, AI/STT draft, saved-note deal linking |
| `search` | Integrated search over company, contact, product, deal, schedule, and meeting note data |
| `trash` | 7-day trash list/detail/restore for supported entities and logs |
| `data-import` | Import templates, CSV/XLSX upload, AI mapping, confirm import, import logs for company/contact/product/deal |
| `health` | Lightweight health endpoint |

Admin operation APIs beyond `GET /admin/api/me`, Notification, persistent ImportJob recovery, and generic DealActivity remain future scope.
