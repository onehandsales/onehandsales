# Backend Modules

This folder contains Backend feature modules. The current baseline keeps User/Auth support and adds sales domain modules back one request at a time.

Current modules:

| Module | Purpose |
|---|---|
| `auth` | Supabase token exchange, App token, session, device registration |
| `user` | Current user profile and registered device lookup |
| `company` | User-owned company, company field/region, memo log, encrypted private memo log APIs |
| `contact` | User-owned contact, company option, department/job grade, memo log, encrypted private memo log APIs |
| `product` | User-owned product, product category/status, memo log, encrypted private memo log APIs |
| `deal` | User-owned deal, company/contact/product links, following action log, memo log, soft delete APIs |
| `schedule` | User-owned schedule, month/week list, schedule-deal link, hard delete APIs |
| `health` | Lightweight health endpoint |

Additional sales domain modules and DDL should still be added one request at a time.
