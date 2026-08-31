# Backend TODO

상태: No backend code work / G05 backend diff none

## 1. 판단

이 계획은 API-SPEC 문서 템플릿 정규화 계획이다. Backend 코드를 수정하지 않는다.

2026-08-31 G01에서는 Backend 구현을 읽어 API-SPEC을 보강했으며 Backend 코드는 수정하지 않았다.

2026-08-31 G02에서는 Backend controller 목록을 확인해 보관 API-SPEC production 연결 여부를 분류했으며 Backend 코드는 수정하지 않았다.

2026-08-31 G03에서는 BusinessCard, Contact, Product, Deal, Data Import, Meeting Note controller/application service를 읽어 보관 API-SPEC을 보강했으며 Backend 코드는 수정하지 않았다.

2026-08-31 G04에서는 BusinessCard, MeetingNote STT, Analytics, Notification controller/DTO/application service를 읽어 Mobile Field 보관 API-SPEC을 보강했으며 Backend 코드는 수정하지 않았다.

2026-08-31 G05에서는 Admin Operation, AccountRequest, Trash controller/DTO/application service와 Prisma schema model을 읽어 Admin Operation 보관 API-SPEC 9개를 보강했으며 Backend 코드는 수정하지 않았다.

## 2. Backend 확인 범위

문서가 실제 구현과 어긋나지 않는지 확인할 때만 아래를 읽는다.

- `BE/src/modules/error-report`
- `BE/src/modules/support-request`
- `BE/src/modules/business-card`
- `BE/src/modules/contact`
- `BE/src/modules/product`
- `BE/src/modules/deal`
- `BE/src/modules/data-import`
- `BE/src/modules/meeting-note`
- `BE/src/modules/analytics`
- `BE/src/modules/notification`
- `BE/src/modules/admin-operation`
- `BE/src/modules/account-request`
- `BE/src/modules/trash`
- `BE/prisma/schema.prisma`
- 관련 controller, application service, FE API client

## 3. 금지

- Backend controller/service/repository 수정
- Prisma schema 또는 migration 수정
- API path/method/request/response/error 동작 변경
