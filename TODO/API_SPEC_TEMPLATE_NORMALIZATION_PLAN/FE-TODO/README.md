# Frontend TODO

상태: No frontend code work / G04 frontend diff none

## 1. 판단

이 계획은 API-SPEC 문서 템플릿 정규화 계획이다. User Web과 Admin Web 코드를 수정하지 않는다.

2026-08-31 G01에서는 Frontend API client와 도움말 모달 사용 흐름을 읽어 API-SPEC을 보강했으며 Frontend 코드는 수정하지 않았다.

2026-08-31 G02에서는 보관 API-SPEC 감사 인덱스만 작성했으며 Frontend 코드는 수정하지 않았다.

2026-08-31 G03에서는 User Web BusinessCard, Contact, Product, Deal, Import/Export, Meeting Note API client/type을 읽어 보관 API-SPEC을 보강했으며 Frontend 코드는 수정하지 않았다.

2026-08-31 G04에서는 User Web BusinessCard, MeetingNote audio recording, Analytics, Mobile Local Draft, Notification API client/type과 permission helper를 읽어 Mobile Field 보관 API-SPEC을 보강했으며 Frontend 코드는 수정하지 않았다.

## 2. Frontend 확인 범위

문서가 실제 사용 계약과 어긋나지 않는지 확인할 때만 아래를 읽는다.

- `FE/user-web`의 에러 신고 API client와 도움말 모달 코드
- `FE/user-web`의 지원 요청 API client와 도움말 모달 코드
- `FE/user-web/src/features/business-card`
- `FE/user-web/src/features/contact`
- `FE/user-web/src/features/product`
- `FE/user-web/src/features/deal`
- `FE/user-web/src/features/import-export`
- `FE/user-web/src/features/meeting-note`
- `FE/user-web/src/features/analytics`
- `FE/user-web/src/features/mobile-local-draft`
- `FE/user-web/src/features/notification`

## 3. 금지

- User Web 코드 수정
- Admin Web 코드 수정
- API client request/response 타입 변경
- 화면 문구나 UX 변경
