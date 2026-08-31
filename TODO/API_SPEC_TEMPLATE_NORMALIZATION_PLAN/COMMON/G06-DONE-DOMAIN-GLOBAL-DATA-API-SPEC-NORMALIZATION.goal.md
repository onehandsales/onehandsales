# G06 완료 보관 Domain Global Data API-SPEC 정규화

상태: Completed 2026-08-31
성격: 문서 정규화
우선순위: P2

## 1. 목적

G03 수동 판단 결과 별도로 분리한 `DOMAIN_GLOBAL_DATA_API.md`를 현재 Product, Deal, Contact, Company 구현 기준으로 제한 정규화한다.

## 2. 선행 문서

- `TODO\API_SPEC_TEMPLATE_NORMALIZATION_PLAN\COMMON\DONE_API_SPEC_AUDIT_INDEX.md`
- `TODO\API_SPEC_TEMPLATE_NORMALIZATION_PLAN\COMMON\G03-DONE-CORE-USER-API-SPEC-NORMALIZATION.goal.md`
- `TODO\DONE\GLOBAL_B2C_FEATURE_ROADMAP_PLAN\08_GLOBAL_DATA_I18N\COMMON\API-SPEC\DOMAIN_GLOBAL_DATA_API.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\API_SPEC.md`
- `AGENT\SOFTWARE_AGENT\BACKEND_AGENT\CONVENTION\API_CONTRACT.md`

## 3. 포함 범위

- Product currency request/response template matrix
- Deal currency request/response template matrix
- Contact global phone request/response template matrix
- Company region/address request/response template matrix
- current BE controller/application/DTO와 User Web API client/type 대조
- `DOMAIN_GLOBAL_DATA_API.md`의 G03 수동 판단 후속 보강

## 4. 제외 범위

- BE 코드 변경
- FE 코드 변경
- API 계약 의미 변경
- DB schema 변경
- G04 mobile field 문서
- G05 Admin Operation 문서

## 5. 실행 지시

1. 현재 Backend Product, Deal, Contact, Company controller, DTO, application service를 확인한다.
2. User Web Product, Deal, Contact, Company API client와 type을 확인한다.
3. `DOMAIN_GLOBAL_DATA_API.md`에 per-domain API 이름, API 식별자, 계약 상태, 소비자, 호환성, 인증/권한, Request/Response 이름, Error FE 처리/log level, Transaction, Observability, FE/BE 처리 기준을 current 구현 기준으로 보강한다.
4. Product/Deal/Contact/Company 보관 API-SPEC에 흡수하지 않고, 이 복합 계약 문서 안에서 matrix로 정리한다.

## 6. 검증

```powershell
cd D:\workspace_repository\onehandsales
rg -n "API 이름|API 식별자|계약 상태|소비자|호환성|권한|Request 이름|Response 이름|Transaction|Observability|FE/BE|currencyCode|phoneCountryCode|regionCode|address" TODO\DONE\GLOBAL_B2C_FEATURE_ROADMAP_PLAN\08_GLOBAL_DATA_I18N\COMMON\API-SPEC\DOMAIN_GLOBAL_DATA_API.md
git diff -- TODO
git diff -- BE FE
git diff --check
```

## 7. TODO_LOG

```text
D:\workspace_repository\onehandsales\TODO_LOG\<YYYY-MM-DD>\API_SPEC_TEMPLATE_NORMALIZATION\G06_DONE_DOMAIN_GLOBAL_DATA_API_SPEC_NORMALIZATION\WORK_LOG.md
```

## 8. 완료 기준

- `DOMAIN_GLOBAL_DATA_API.md`가 current Product/Deal/Contact/Company BE/FE 구현과 어긋나지 않게 정규화되어 있다.
- API 계약 의미 변경이 없다.
- BE/FE 코드 diff가 없다.
- 결과와 남은 리스크가 TODO_LOG에 기록되어 있다.

## 9. 완료 결과

- `DOMAIN_GLOBAL_DATA_API.md`에 Product/Deal currency request-response matrix, Contact global phone matrix, Company region/address matrix를 current BE/FE 구현 기준으로 보강했다.
- BE controller/DTO/application service, User Web API client/type, Prisma schema를 대조했고 문서 변경 외 BE/FE 코드 변경은 없다.
- API path, method, runtime request/response/error, transaction, observability 의미를 바꾸지 않았다.
- 검증 결과와 남은 리스크는 `TODO_LOG/2026-08-31/API_SPEC_TEMPLATE_NORMALIZATION/G06_DONE_DOMAIN_GLOBAL_DATA_API_SPEC_NORMALIZATION/WORK_LOG.md`에 기록했다.
