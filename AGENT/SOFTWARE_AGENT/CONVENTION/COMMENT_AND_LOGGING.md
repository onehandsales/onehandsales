# Comment And Logging Convention

## 1. Comment Principle

Comments explain WHY, not WHAT.

Default:

- no comment
- clear naming first
- smaller function/component first
- type/schema first

Use comments only when code cannot express the reason.

## 2. When Comments Are Allowed

Allowed:

- business constraint
- legal/operational retention rule
- external provider oddity
- browser compatibility workaround
- performance tradeoff with measured or expected scale
- security/audit reason
- TODO/FIXME/HACK/NOTE/WARNING with context

Examples:

```text
// 거래처 삭제는 30일 soft delete 유지가 정책이다. 복구 요청 가능성이 높다.
// Google Calendar는 MVP에서 가져오기만 한다. 양방향 동기화는 의도적으로 제외했다.
// Admin raw view reason은 PII 가능성이 있어 client logger에 보내지 않는다.
```

## 3. Forbidden Comments

Forbidden:

- code translated into Korean
- JSX structure comments such as "header" or "body"
- parameter descriptions already obvious from TypeScript
- change history
- author/date
- commented-out code
- visual separators made of repeated symbols
- step comments like `// 1`, `// 2` inside straightforward code

If a step comment is needed, consider extracting a function.

## 4. JSDoc

Use JSDoc only for public APIs used across modules/features, and only when it adds rules or context.

Do not duplicate TypeScript types in JSDoc.

Useful JSDoc content:

- usage constraints
- permission assumptions
- external system behavior
- non-obvious serialization rules

## 5. Standard Comment Tags

Use these formats:

```text
TODO(#123): ...
TODO(2026-06-02): ...
FIXME(#123): ...
HACK: ...
NOTE: ...
WARNING: ...
```

Every tag needs a reason.

## 6. Backend Logging

Backend logs are structured JSON.

Rules:

- use pino or the project logger wrapper
- no `console.log`
- no ASCII boxes or multiline separators
- short English event key
- context object for details
- PII redacted
- request context injected automatically
- domain layer does not log
- exception filter logs domain errors

Good event shape:

```text
company.created
contact.duplicateDetected
deal.stageChanged
meetingNote.generated
admin.sensitiveRawView.requested
ocr.callFailed
```

Context examples:

```text
companyId
contactId
dealId
userId
targetUserId
provider
attempt
durationMs
err
```

Do not manually write `when`, `who`, `where`, route, or timestamp if middleware already injects them.

## 7. Frontend Logging

Frontend logs go through a logger wrapper.

Channels:

- Sentry for errors/warnings
- analytics for meaningful product events when introduced
- debug logger only in development

Rules:

- no direct `console.log`
- no PII in logs
- short English event key
- context object
- normal 401/403 flows are not noisy errors
- do not catch and silently ignore errors

## 8. Admin Logging Boundary

Admin has two separate concepts:

- client logs: browser/UI errors and non-sensitive events
- audit logs: backend records of Admin actions

Rules:

- client does not write audit logs directly
- backend writes audit log in the same transaction as the protected mutation
- reason text goes to backend audit flow only
- PII and reason text do not go to Sentry/client logs

## 9. Sensitive Data Redaction

Sensitive data includes:

- personal memo
- meeting note body
- deal amount
- user-marked sensitive data
- phone
- email
- token
- password
- business card image URL when private

Logs should use IDs or masked values.

## 10. Review Checklist

Comment checklist:

- no WHAT-only comments
- no commented-out code
- TODO/FIXME has issue number or date
- naming could not remove the comment
- security/audit comments include reason

Logging checklist:

- no direct console calls
- no PII plain text
- event key is short and searchable
- context is structured
- backend domain layer does not log
- Admin reason text is not in client logs



