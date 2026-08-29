# API-SPEC Audit Result

상태: Ready / G01 Next reference
감사일: 2026-08-29
생성 근거: `TODO\BE_SOFTWARE_AGENT_RULE_RECHECK_FIX_PLAN\COMMON\G07-API-SPEC-TEMPLATE-AUDIT.goal.md`

## 1. 감사 기준

기준 문서:

- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
- `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
- `AGENT/PM_AGENT/DECISIONS/018_todo_common_contract_structure.md`
- `AGENT/PM_AGENT/DECISIONS/020_todo_execution_plan_standard.md`

필수 항목 후보:

- 계약 상태
- API 이름
- API 식별자
- 소비자
- 호환성
- Method
- Path
- 인증
- 권한
- Request 이름
- Request field
- 비즈니스 로직 흐름
- Response 이름
- Response field
- 연결 DB 스키마
- Transaction
- Observability
- Error
- FE/BE 처리 기준

## 2. 감사 명령

```bash
rg --files TODO | rg 'COMMON[\\/]+API-SPEC[\\/]+.*\.md$'
find TODO -path '*/COMMON/API-SPEC/*.md' -not -path 'TODO/DONE/*' -print
find TODO/DONE -path '*/COMMON/API-SPEC/*.md' -print
```

필수 항목 누락 후보는 `grep -Eiq` 기반의 1차 정적 검색으로 확인했다. README, `NO_API_CHANGE`, `NO_NEW_API_CONTRACT` 같은 인덱스/비계약 문서는 false positive가 날 수 있으므로 실제 수정 전 수동 판정이 필요하다.

## 3. 파일 수

| 구분 | 파일 수 | 비고 |
| --- | ---: | --- |
| 전체 API-SPEC Markdown | 95 | `TODO/**/COMMON/API-SPEC/*.md` |
| 활성 TODO API-SPEC | 3 | `TODO/DONE` 제외 |
| 완료 보관 API-SPEC | 92 | `TODO/DONE` 아래 |
| 완료 보관 중 README 제외 | 71 | 비인덱스 문서. `NO_API_CHANGE`, `NO_NEW_API_CONTRACT` 2개를 수동 제외하면 API 계약 후보는 69개 |

정적 검색상 누락 후보가 있는 문서 수:

| 구분 | 파일 수 |
| --- | ---: |
| 전체 | 85 |
| 활성 TODO | 3 |
| 완료 보관 | 82 |
| 완료 보관 중 README 제외 | 61 |

## 4. 활성 API-SPEC 수동 판정

| 문서 | production 연결 | 판정 | 후속 조치 |
| --- | --- | --- | --- |
| `TODO/SERVICE_QA_PLAN/COMMON/API-SPEC/ERROR_REPORT_API.md` | 예. `POST /api/error-reports` | 보강 대상 | 계약 상태 `implemented` 여부, API 이름, API 식별자, 소비자, 호환성, 권한, Request 이름, Response 이름, Error FE 처리/log level, Transaction/Observability 세부 항목을 현재 코드 기준으로 보강한다. |
| `TODO/SERVICE_QA_PLAN/COMMON/API-SPEC/SUPPORT_REQUEST_API.md` | 예. `POST /api/support-requests` | 보강 대상 | 별도 `권한` 항목과 `계약 상태` 표기를 정규화한다. API 의미 변경은 하지 않는다. |
| `TODO/SERVICE_QA_PLAN/COMMON/API-SPEC/README.md` | 인덱스 | per-API 템플릿 감사 제외 | `SUPPORT_REQUEST_API.md`가 인덱스에서 누락되어 있으므로 README를 최신화한다. |

## 5. 완료 보관 문서 판정

`TODO/DONE` 아래 API-SPEC 문서는 완료 이력이다. G07과 이 후속 계획에서는 다음 원칙을 따른다.

- 완료 보관 문서를 현재 Goal에서 직접 대량 수정하지 않는다.
- 현재 production API와 연결된 문서를 우선순위로 분류한다.
- README/index, `NO_API_CHANGE`, `NO_NEW_API_CONTRACT` 문서는 per-API 템플릿 보강 대상에서 제외하고 인덱스 또는 비계약 문서로 분류한다.
- 보관 문서를 수정해야 한다면 별도 goal에서 수정 이유, 변경하지 않는 API 의미, 검증 범위를 TODO_LOG에 남긴다.

우선 감사해야 할 production API 관련 보관 문서 그룹:

| 우선순위 | 그룹 | 예시 |
| --- | --- | --- |
| P1 | 인증/사용자, 핵심 도메인 | `AUTH_USER_API_DETAIL.md`, `COMPANY_API*.md`, `CONTACT_API*.md`, `PRODUCT_API*.md`, `DEAL_API*.md` |
| P1 | 일정/회의록/검색/휴지통 | `SCHEDULE_API.md`, `MEETING_NOTE_API.md`, `SEARCH_API.md`, `LOG_SOFT_DELETE_API.md` |
| P1 | Import/OCR/알림/Google Calendar | `IMPORT_TEMPLATE_API.md`, `IMPORT_JOB_API.md`, `BUSINESS_CARD_OCR_API.md`, `NOTIFICATION_API.md`, `GOOGLE_CALENDAR_INTEGRATION_API.md` |
| P1 | AI Weekly/Follow-up/Activity | `AI_WEEKLY_REPORT_API.md`, `FOLLOW_UP_DELIVERY_API.md`, `FOLLOW_UP_EMAIL_PROVIDER_INTEGRATION_API.md`, `DEAL_ACTIVITY_API.md` |
| P1 | Admin Operation | `ADMIN_*_API.md`, `ACCOUNT_DATA_REQUEST_API.md`, `TRASH_USER_RECOVERY_API.md` |
| P2 | Product Analytics/Global I18N/Mobile field | `PRODUCT_ANALYTICS_*`, `USER_GLOBAL_SETTINGS_API.md`, `DOMAIN_GLOBAL_DATA_API.md`, mobile contract 문서 |
| 제외 후보 | README 또는 no API 문서 | `README.md`, `NO_API_CHANGE.md`, `NO_NEW_API_CONTRACT.md` |

## 6. 정적 누락 후보 요약

아래 수치는 텍스트 패턴 기반 후보 수이며, 수동 판정 전 확정 결함 수가 아니다.

| 항목 | 누락 후보 수 |
| --- | ---: |
| 계약 상태 | 16 |
| API 이름 | 48 |
| API 식별자 | 50 |
| 소비자 | 34 |
| 호환성 | 58 |
| Method | 12 |
| Path | 8 |
| 인증 | 36 |
| 권한 | 46 |
| Request 이름 | 51 |
| Request field | 56 |
| 비즈니스 로직 흐름 | 18 |
| Response 이름 | 52 |
| Response field | 28 |
| 연결 DB 스키마 | 21 |
| Transaction | 15 |
| Observability | 25 |
| Error | 14 |
| FE/BE 처리 기준 | 56 |

## 7. 다음 작업

1. `G01-ACTIVE-SERVICE-QA-API-SPEC-NORMALIZATION.goal.md`에서 활성 API-SPEC 3개를 먼저 정리한다.
2. `G02-DONE-API-SPEC-AUDIT-INDEX.goal.md`에서 보관 API-SPEC 92개를 직접 수정 대상, 인덱스/비계약 제외 대상, 보류 대상으로 분류한다.
3. `G99-FINAL-REVIEW.goal.md`에서 API 계약 의미 변경이 없고 BE/FE 코드 diff가 없음을 확인한다.
