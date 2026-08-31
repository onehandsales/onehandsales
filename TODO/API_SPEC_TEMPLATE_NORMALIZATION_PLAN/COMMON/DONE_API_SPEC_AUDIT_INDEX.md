# Done API-SPEC Audit Index

상태: G05 Completed / G06 Next
감사일: 2026-08-31

## 1. 목적

`TODO/DONE` 아래 보관된 API-SPEC 문서를 직접 대량 수정하기 전에 current production API 관련성, 템플릿 누락 정도, 제외 여부를 전수 분류한다.

이번 인덱스는 보관 문서 원문을 수정하지 않고, 후속 정규화가 필요한 문서와 제외/참조 문서를 나누기 위한 감사 결과다.

## 2. 감사 기준

기준 문서:

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/PM_AGENT/DECISIONS/018_todo_common_contract_structure.md`
- `AGENT/PM_AGENT/DECISIONS/020_todo_execution_plan_standard.md`
- `AGENT/PM_AGENT/DECISIONS/022_goal_completion_review_todo_log.md`

분류 상태:

| 상태 | 의미 |
| --- | --- |
| `normalize-now-candidate` | 현재 production API와 직접 연결되고 템플릿 누락이 큰 문서 |
| `index-only` | README/index 문서 |
| `no-api-contract` | API 변경 없음, 신규 API 없음, 또는 HTTP API가 아닌 내부/local contract 문서 |
| `archive-reference-only` | 과거 구현 이력으로만 참고하고 현재 goal에서 보강하지 않을 문서 |
| `needs-manual-review` | 자동 검색과 파일명만으로 per-API 정규화 방식을 확정하기 어려운 문서 |

정적 누락 수는 아래 14개 키워드 검색 결과다. README/index와 no-api 문서는 누락 수를 산정하지 않았다.

```text
계약 상태, API 이름, API 식별자, 소비자, 호환성, Method, Path, 인증, 권한, Request 이름, Response 이름, Transaction, Observability, FE/BE
```

## 3. 요약

| 분류 | 파일 수 | 판단 |
| --- | ---: | --- |
| 전체 보관 API-SPEC | 92 | `TODO/DONE/**/COMMON/API-SPEC/*.md` 전수 |
| `normalize-now-candidate` | 22 | 후속 G03/G04/G05 완료 |
| `index-only` | 21 | per-API 템플릿 감사 제외 |
| `no-api-contract` | 6 | API 없음 또는 HTTP API가 아닌 contract |
| `archive-reference-only` | 42 | 보관 이력 참조. 현재 goal에서 직접 수정하지 않음 |
| `needs-manual-review` | 1 | G03에서 복합 도메인 확장 계약으로 별도 G06 분리 판단 완료 |

## 4. Normalize Now Candidates

아래 문서는 현재 production API와 직접 연결되어 있고 정적 누락 수가 크다. 보관 문서 원문을 바로 고치지 않고 후속 goal에서 제한적으로 정규화한다.

| 파일 | 누락 수 | production 연결 | 후속 |
| --- | ---: | --- | --- |
| `TODO/DONE/BUSINESS_CARD_OCR_PLAN/COMMON/API-SPEC/BUSINESS_CARD_OCR_API.md` | 13 | `POST /api/business-card-scans`, `GET /api/business-card-scans`, confirm API | G03 완료 |
| `TODO/DONE/CONTACT_DOMAIN_PLAN/COMMON/API-SPEC/CONTACT_API.md` | 7 | `api/contacts`, `api/contact-job-grades`, `api/contact-departments` | G03 완료 |
| `TODO/DONE/DEAL_DOMAIN_PLAN/COMMON/API-SPEC/DEAL_API.md` | 11 | `api/deals` | G03 완료 |
| `TODO/DONE/DEAL_DOMAIN_PLAN/COMMON/API-SPEC/DEAL_API_DETAIL.md` | 11 | `api/deals` detail/memo/following action 계약 | G03 완료 |
| `TODO/DONE/PRODUCT_DOMAIN_PLAN/COMMON/API-SPEC/PRODUCT_API.md` | 7 | `api/products`, `api/product-categories`, `api/product-statuses` | G03 완료 |
| `TODO/DONE/IMPORT_TEMPLATE_PLAN/COMMON/API-SPEC/IMPORT_TEMPLATE_API.md` | 14 | `api/import-templates`, `api/import-user-logs` | G03 완료 |
| `TODO/DONE/MEETING_NOTE_AI_STT_PLAN/COMMON/API-SPEC/MEETING_NOTE_AI_STT_API.md` | 7 | `POST /api/meeting-notes/ai-draft`, `POST /api/meeting-notes/stt-draft` | G03 완료 |
| `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/07_MEETING_NOTE_AI_PROVIDER_LOG/COMMON/API-SPEC/MEETING_NOTE_AI_DRAFT_LOG_API.md` | 11 | meeting note AI draft log/provider contract | G03 완료 |
| `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/07_MEETING_NOTE_AI_PROVIDER_LOG/COMMON/API-SPEC/MEETING_NOTE_NEXT_ACTION_FOLLOW_UP_API.md` | 11 | meeting note next action/follow-up draft contract | G03 완료 |
| `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE/COMMON/API-SPEC/BUSINESS_CARD_MOBILE_CAPTURE_AND_FAILURE_CONTRACT.md` | 10 | `POST /api/business-card-scans`, confirm flow | G04 완료 |
| `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE/COMMON/API-SPEC/MEETING_NOTE_MOBILE_RECORDING_STT_CONTRACT.md` | 10 | `POST /api/meeting-notes/stt-draft` | G04 완료 |
| `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE/COMMON/API-SPEC/MOBILE_FIELD_ANALYTICS_EVENT_CONTRACT.md` | 12 | `POST /api/analytics/events` mobile event contract | G04 완료 |
| `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE/COMMON/API-SPEC/MOBILE_NOTIFICATION_PERMISSION_CONTRACT.md` | 11 | `api/notifications/settings`, browser push endpoints | G04 완료 |
| `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/COMMON/API-SPEC/ACCOUNT_DATA_REQUEST_API.md` | 9 | `api/users/me/*requests`, `admin/api/*requests` | G05 완료 |
| `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/COMMON/API-SPEC/ADMIN_ANALYTICS_API.md` | 9 | `GET /admin/api/analytics/overview` | G05 완료 |
| `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/COMMON/API-SPEC/ADMIN_AUDIT_SECURITY_API.md` | 7 | `admin/api/me`, `admin/api/audit-logs`, sensitive raw access | G05 완료 |
| `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/COMMON/API-SPEC/ADMIN_DOMAIN_READONLY_API.md` | 8 | `GET /admin/api/users/:userId/domain-records` | G05 완료 |
| `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/COMMON/API-SPEC/ADMIN_PROVIDER_FAILURE_API.md` | 9 | `admin/api/provider-failures` | G05 완료 |
| `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/COMMON/API-SPEC/ADMIN_SYSTEM_OPERATION_API.md` | 9 | `admin/api/system/operation-checks` | G05 완료 |
| `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/COMMON/API-SPEC/ADMIN_TRASH_OPERATION_API.md` | 9 | `admin/api/users/:userId/trash-*`, `admin/api/trash/recovery-requests` | G05 완료 |
| `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/COMMON/API-SPEC/ADMIN_USER_OPERATION_API.md` | 8 | `admin/api/users` | G05 완료 |
| `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/COMMON/API-SPEC/TRASH_USER_RECOVERY_API.md` | 9 | `POST /api/trash/recovery-requests` | G05 완료 |

## 5. Index Only

아래 문서는 인덱스이므로 per-API 템플릿 정규화 대상에서 제외한다.

| 파일 | 분류 |
| --- | --- |
| `TODO/DONE/BEFORE_12_TASKS/COMMON/API-SPEC/README.md` | index-only |
| `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/01_IMPORT_JOB_PERSISTENCE/COMMON/API-SPEC/README.md` | index-only |
| `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/02_NOTIFICATION_REMINDER/COMMON/API-SPEC/README.md` | index-only |
| `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/03_WEEKLY_SCHEDULE_REPORT/COMMON/API-SPEC/README.md` | index-only |
| `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/04_GOOGLE_CALENDAR_INTEGRATION/COMMON/API-SPEC/README.md` | index-only |
| `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/05_AI_WEEKLY_SALES_REPORT/COMMON/API-SPEC/README.md` | index-only |
| `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE/COMMON/API-SPEC/README.md` | index-only |
| `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/07_MEETING_NOTE_AI_PROVIDER_LOG/COMMON/API-SPEC/README.md` | index-only |
| `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N/COMMON/API-SPEC/README.md` | index-only |
| `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/09_PRODUCT_ANALYTICS/COMMON/API-SPEC/README.md` | index-only |
| `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE/COMMON/API-SPEC/README.md` | index-only |
| `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/COMMON/API-SPEC/README.md` | index-only |
| `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/PRE12_FOLLOWUP_RECHECK/COMMON/API-SPEC/README.md` | index-only |
| `TODO/DONE/INTEGRATED_SEARCH_PLAN/COMMON/API-SPEC/README.md` | index-only |
| `TODO/DONE/MEETING_NOTE_AI_STT_PLAN/COMMON/API-SPEC/README.md` | index-only |
| `TODO/DONE/MEETING_NOTE_MANUAL_PLAN/COMMON/API-SPEC/README.md` | index-only |
| `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/README.md` | index-only |
| `TODO/DONE/NEXT_BACKEND_API_BACKLOG_PLAN/COMMON/API-SPEC/README.md` | index-only |
| `TODO/DONE/SOFTWARE_AGENT_RULE_COMPLIANCE_PLAN/COMMON/API-SPEC/README.md` | index-only |
| `TODO/DONE/USER_WEB_RELEASE_QA_FOLLOWUP_PLAN/COMMON/API-SPEC/README.md` | index-only |
| `TODO/DONE/USER_WEB_UXUI_COMMON_QA_PLAN/COMMON/API-SPEC/README.md` | index-only |

## 6. No API Contract

아래 문서는 API 변경 없음, 신규 API 없음, 또는 HTTP API가 아닌 내부/local contract로 분류한다. per-HTTP API 템플릿 보강 대상에서 제외한다.

| 파일 | 근거 |
| --- | --- |
| `TODO/DONE/ACCOUNT_SETTINGS_MODAL_PLAN/COMMON/API-SPEC/NO_API_CHANGE.md` | API 변경 없음 문서 |
| `TODO/DONE/BEFORE_12_TASKS/COMMON/API-SPEC/NO_NEW_API_CONTRACT.md` | 신규 API 없음 문서 |
| `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE/COMMON/API-SPEC/LOCAL_DRAFT_CONTRACT.md` | 서버 API 없음, IndexedDB/localStorage local contract |
| `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/09_PRODUCT_ANALYTICS/COMMON/API-SPEC/AI_USAGE_ANALYTICS_CONTRACT.md` | HTTP API가 아닌 Backend internal aggregation contract |
| `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/09_PRODUCT_ANALYTICS/COMMON/API-SPEC/PRODUCT_ANALYTICS_SERVER_EVENT_CONTRACT.md` | 문서가 HTTP API가 아닌 application 내부 contract라고 명시 |
| `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/09_PRODUCT_ANALYTICS/COMMON/API-SPEC/PRODUCT_ANALYTICS_SNAPSHOT_CONTRACT.md` | 문서가 HTTP API가 아닌 background/application use case contract라고 명시 |

## 7. Archive Reference Only

아래 문서는 현재 goal에서 보관 문서 원문을 수정하지 않고 완료 이력 참조로 둔다. 누락 수가 낮거나, 더 최신 세부 계약 문서가 있거나, MVP 초기 통합 명세라 현재 per-API 정규화의 우선 대상이 아니다.

| 파일 | 누락 수 | 판단 |
| --- | ---: | --- |
| `TODO/DONE/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/COMPANY_CONTACT_LIST_API.md` | 2 | production endpoint 연결, 낮은 누락. 후속 도메인 변경 시 참조 |
| `TODO/DONE/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/COMPANY_DEAL_LIST_API.md` | 2 | production endpoint 연결, 낮은 누락. 후속 도메인 변경 시 참조 |
| `TODO/DONE/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/COMPANY_EXPORT_DEAL_COUNT_API.md` | 3 | export response 확장 이력. 후속 export 정리 시 참조 |
| `TODO/DONE/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/COMPANY_EXPORT_XLSX_API.md` | 2 | export endpoint 이력. 후속 export 정리 시 참조 |
| `TODO/DONE/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/COMPANY_LIST_CONTACT_COUNT_API.md` | 3 | list response 확장 이력. 후속 company 정리 시 참조 |
| `TODO/DONE/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/COMPANY_LIST_DEAL_COUNT_API.md` | 3 | list response 확장 이력. 후속 company 정리 시 참조 |
| `TODO/DONE/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/CONTACT_DEAL_LIST_API.md` | 2 | production endpoint 연결, 낮은 누락. 후속 contact 정리 시 참조 |
| `TODO/DONE/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/CONTACT_EXPORT_XLSX_API.md` | 2 | export endpoint 이력. 후속 export 정리 시 참조 |
| `TODO/DONE/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/PRODUCT_DEAL_LIST_API.md` | 2 | production endpoint 연결, 낮은 누락. 후속 product 정리 시 참조 |
| `TODO/DONE/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/PRODUCT_EXPORT_DEAL_COUNT_API.md` | 3 | export response 확장 이력. 후속 export 정리 시 참조 |
| `TODO/DONE/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/PRODUCT_EXPORT_XLSX_API.md` | 2 | export endpoint 이력. 후속 export 정리 시 참조 |
| `TODO/DONE/ADDITIONAL_WORK_PLAN/COMMON/API-SPEC/PRODUCT_LIST_DEAL_COUNT_SORT_API.md` | 3 | list sort/response 확장 이력. 후속 product 정리 시 참조 |
| `TODO/DONE/AUTH_FE_INTEGRATION_PLAN/COMMON/API-SPEC/AUTH_USER_API_DETAIL.md` | 1 | auth/user current API detail, 낮은 누락 |
| `TODO/DONE/COMPANY_DOMAIN_PLAN/COMMON/API-SPEC/COMPANY_API.md` | 1 | company current API, 낮은 누락 |
| `TODO/DONE/COMPANY_DOMAIN_PLAN/COMMON/API-SPEC/COMPANY_API_DETAIL.md` | 1 | company detail current API, 낮은 누락 |
| `TODO/DONE/CONTACT_DOMAIN_PLAN/COMMON/API-SPEC/CONTACT_API_DETAIL.md` | 0 | contact detail current API, 템플릿 키워드 충족 |
| `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/01_IMPORT_JOB_PERSISTENCE/COMMON/API-SPEC/IMPORT_JOB_API.md` | 0 | import job current API, 템플릿 키워드 충족 |
| `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/02_NOTIFICATION_REMINDER/COMMON/API-SPEC/NOTIFICATION_API.md` | 0 | notification current API, 템플릿 키워드 충족 |
| `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/03_WEEKLY_SCHEDULE_REPORT/COMMON/API-SPEC/WEEKLY_SCHEDULE_REPORT_API.md` | 0 | weekly schedule report current API, 템플릿 키워드 충족 |
| `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/04_GOOGLE_CALENDAR_INTEGRATION/COMMON/API-SPEC/GOOGLE_CALENDAR_INTEGRATION_API.md` | 4 | google calendar current API, 중간 이하 누락 |
| `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/05_AI_WEEKLY_SALES_REPORT/COMMON/API-SPEC/AI_WEEKLY_REPORT_API.md` | 0 | AI weekly report current API, 템플릿 키워드 충족 |
| `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/05_AI_WEEKLY_SALES_REPORT/COMMON/API-SPEC/FOLLOW_UP_DELIVERY_API.md` | 1 | follow-up delivery current API, 낮은 누락 |
| `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/05_AI_WEEKLY_SALES_REPORT/COMMON/API-SPEC/FOLLOW_UP_EMAIL_PROVIDER_INTEGRATION_API.md` | 0 | follow-up provider current API, 템플릿 키워드 충족 |
| `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE/COMMON/API-SPEC/DEAL_ACTIVITY_API.md` | 1 | deal activity current API, 낮은 누락 |
| `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/06_DEAL_ACTIVITY_TIMELINE/COMMON/API-SPEC/DEAL_RECORD_SUMMARY_API.md` | 3 | deal response 확장 이력, 중간 이하 누락 |
| `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N/COMMON/API-SPEC/AUTH_PROVIDER_API.md` | 0 | auth provider current API, 템플릿 키워드 충족 |
| `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N/COMMON/API-SPEC/IMPORT_EXPORT_LOCALIZATION_API.md` | 0 | import/export localization contract, 템플릿 키워드 충족 |
| `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N/COMMON/API-SPEC/USER_GLOBAL_SETTINGS_API.md` | 0 | user settings current API, 템플릿 키워드 충족 |
| `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/09_PRODUCT_ANALYTICS/COMMON/API-SPEC/PRODUCT_ANALYTICS_EVENT_API.md` | 0 | product analytics event current API, 템플릿 키워드 충족 |
| `TODO/DONE/INTEGRATED_SEARCH_PLAN/COMMON/API-SPEC/SEARCH_API.md` | 3 | search current API, 중간 이하 누락 |
| `TODO/DONE/LOG_SOFT_DELETE_PLAN/COMMON/API-SPEC/LOG_SOFT_DELETE_API.md` | 3 | soft delete current API, 중간 이하 누락 |
| `TODO/DONE/MEETING_NOTE_MANUAL_PLAN/COMMON/API-SPEC/MEETING_NOTE_API.md` | 1 | meeting note current API, 낮은 누락 |
| `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G01-G05-FOUNDATION-AUTH-API.md` | 6 | MVP 초기 통합 명세. 현재 세부 auth/user 계약을 우선 참조 |
| `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G06-G12-CORE-DOMAIN-API.md` | 8 | MVP 초기 통합 명세. 현재 company/contact/product/deal 세부 계약을 우선 참조 |
| `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G06-G12-ENDPOINT-CONTRACT.md` | 9 | MVP 초기 endpoint 구현 계약. 현재 도메인별 문서를 우선 참조 |
| `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-ENDPOINT-CONTRACT.md` | 8 | MVP 초기 endpoint 구현 계약. 현재 기능별 문서를 우선 참조 |
| `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G17-G29-WORKFLOW-AUTOMATION-API.md` | 8 | MVP 초기 통합 명세. 현재 schedule/meeting/import/search 문서를 우선 참조 |
| `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G30-G32-ADMIN-AUDIT-API.md` | 5 | MVP 초기 Admin 통합 명세. 현재 11 Admin Operation 문서를 우선 참조 |
| `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G30-G32-ENDPOINT-CONTRACT.md` | 8 | MVP 초기 Admin endpoint 구현 계약. 현재 11 Admin Operation 문서를 우선 참조 |
| `TODO/DONE/PRODUCT_DOMAIN_PLAN/COMMON/API-SPEC/PRODUCT_API_DETAIL.md` | 0 | product detail current API, 템플릿 키워드 충족 |
| `TODO/DONE/SCHEDULE_DOMAIN_PLAN/COMMON/API-SPEC/SCHEDULE_API.md` | 0 | schedule current API, 템플릿 키워드 충족 |
| `TODO/DONE/USER_TIMEZONE_FOUNDATION_PLAN/COMMON/API-SPEC/USER_TIMEZONE_API.md` | 4 | user timezone current API, 중간 이하 누락 |

## 8. Needs Manual Review

| 파일 | 누락 수 | 판단 |
| --- | ---: | --- |
| `TODO/DONE/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/08_GLOBAL_DATA_I18N/COMMON/API-SPEC/DOMAIN_GLOBAL_DATA_API.md` | 6 | Product/Deal/Contact/Company response/request 확장을 한 문서에 묶은 복합 계약이다. G03에서 core domain 문서에 흡수하지 않고 별도 G06으로 분리하기로 판단했다. |

## 9. Follow-up Goals

G02 결과 대량 보강 후보가 22개이므로 아래 follow-up goal로 분리한다.

| Goal | 대상 | 완료 기준 |
| --- | --- | --- |
| `G03-DONE-CORE-USER-API-SPEC-NORMALIZATION.goal.md` | BusinessCard, Contact, Product, Deal, Import Template, Meeting Note AI/STT 후보 9개와 `DOMAIN_GLOBAL_DATA_API.md` 수동 판단 1개 | 2026-08-31 완료. 6개 문서 템플릿 보강, 3개 개요 문서 archive-reference-only 판단, `DOMAIN_GLOBAL_DATA_API.md` G06 분리 판단 |
| `G04-DONE-MOBILE-FIELD-API-SPEC-NORMALIZATION.goal.md` | Mobile PWA field use 후보 4개 | 2026-08-31 완료. HTTP API와 browser/local-only contract 경계를 분리하고 템플릿 항목을 보강 |
| `G05-DONE-ADMIN-OPERATION-API-SPEC-NORMALIZATION.goal.md` | Admin Operation 후보 9개 | 2026-08-31 완료. Admin/User API prefix와 소비자 분리, 민감정보 masking, audit/observability, FE error 처리/log level 보강 |
| `G06-DONE-DOMAIN-GLOBAL-DATA-API-SPEC-NORMALIZATION.goal.md` | `DOMAIN_GLOBAL_DATA_API.md` 1개 | 다음 실행 대상. Product/Deal/Contact/Company global data 복합 계약을 current BE/FE 구현 기준 matrix로 보강 |

`needs-manual-review` 1개는 G03에서 core domain 문서 흡수 없이 별도 G06으로 분리했다.

## 10. G03 처리 결과

| 처리 | 파일 수 | 파일 |
| --- | ---: | --- |
| 템플릿 보강 | 6 | `BUSINESS_CARD_OCR_API.md`, `DEAL_API_DETAIL.md`, `IMPORT_TEMPLATE_API.md`, `MEETING_NOTE_AI_STT_API.md`, `MEETING_NOTE_AI_DRAFT_LOG_API.md`, `MEETING_NOTE_NEXT_ACTION_FOLLOW_UP_API.md` |
| `archive-reference-only` 판단 | 3 | `CONTACT_API.md`, `DEAL_API.md`, `PRODUCT_API.md` |
| 별도 G06 분리 | 1 | `DOMAIN_GLOBAL_DATA_API.md` |

G03에서는 BE/FE 코드를 수정하지 않았고 API 계약 의미를 변경하지 않았다.

## 11. G04 처리 결과

| 처리 | 파일 수 | 파일 |
| --- | ---: | --- |
| 템플릿 보강 | 4 | `BUSINESS_CARD_MOBILE_CAPTURE_AND_FAILURE_CONTRACT.md`, `MEETING_NOTE_MOBILE_RECORDING_STT_CONTRACT.md`, `MOBILE_FIELD_ANALYTICS_EVENT_CONTRACT.md`, `MOBILE_NOTIFICATION_PERMISSION_CONTRACT.md` |
| 서버 API 없음 경계 확인 | 1 | `LOCAL_DRAFT_CONTRACT.md` |

G04에서는 Mobile Field 보관 API-SPEC 문서의 HTTP API와 browser/local-only contract 경계를 명확히 했다. BE/FE 코드는 수정하지 않았고 API path, method, runtime request/response/error/transaction/observability 동작을 변경하지 않았다.

## 12. G05 처리 결과

| 처리 | 파일 수 | 파일 |
| --- | ---: | --- |
| 템플릿 보강 | 9 | `ACCOUNT_DATA_REQUEST_API.md`, `ADMIN_ANALYTICS_API.md`, `ADMIN_AUDIT_SECURITY_API.md`, `ADMIN_DOMAIN_READONLY_API.md`, `ADMIN_PROVIDER_FAILURE_API.md`, `ADMIN_SYSTEM_OPERATION_API.md`, `ADMIN_TRASH_OPERATION_API.md`, `ADMIN_USER_OPERATION_API.md`, `TRASH_USER_RECOVERY_API.md` |
| Admin/User prefix 분리 | 2 | `ACCOUNT_DATA_REQUEST_API.md`, `TRASH_USER_RECOVERY_API.md` |
| 민감정보/audit/observability 보강 | 9 | G05 포함 범위 전체 |

G05에서는 Admin Operation 보관 API-SPEC 문서의 Admin/User API 경계, `AuthGuard`/`AdminGuard` 권한, 민감정보 masking, audit action, request id, transaction, FE error 처리/log level을 current BE/FE 구현 기준으로 보강했다. BE/FE 코드는 수정하지 않았고 API path, method, runtime request/response/error/transaction/observability 동작을 변경하지 않았다.

## 13. 보관 문서 수정 원칙

- G02에서는 `TODO/DONE/**/COMMON/API-SPEC/*.md` 본문을 직접 수정하지 않는다.
- 후속 goal에서 보관 문서를 수정할 때는 대상 파일을 명시하고 API 계약 의미 변경 없음, BE/FE diff 없음, TODO_LOG 검증 결과를 남긴다.
- README/index와 no-api 문서는 per-API 템플릿 보강 대상에서 제외한다.
