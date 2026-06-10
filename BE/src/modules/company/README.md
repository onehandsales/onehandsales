# Company Module

Current scope:

- `GET /api/companies`
- `GET /api/company-fields`
- `GET /api/company-regions`
- `GET /api/companies/:companyId`
- `POST /api/companies`
- `PATCH /api/companies/:companyId`
- `POST /api/company-fields`
- `DELETE /api/company-fields/:fieldId`
- `POST /api/company-regions`
- `DELETE /api/company-regions/:regionId`
- `POST /api/companies/:companyId/memo-logs`
- `GET /api/companies/:companyId/memo-logs`
- `PATCH /api/companies/:companyId/memo-logs/:memoLogId`
- `POST /api/companies/:companyId/private-memo-logs`
- `GET /api/companies/:companyId/private-memo-logs`
- `PATCH /api/companies/:companyId/private-memo-logs/:privateMemoLogId`

The module owns company, company field, company region, company memo log, and encrypted private memo log APIs for the user web only.

Private memo plaintext is accepted and returned through API DTOs as `memo`, but persistence stores only `memoCiphertext` and `memoKeyVersion`.
