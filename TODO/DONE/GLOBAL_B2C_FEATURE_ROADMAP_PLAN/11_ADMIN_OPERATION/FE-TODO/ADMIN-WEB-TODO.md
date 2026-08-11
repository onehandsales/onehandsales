# Admin Web TODO

상태: Implemented / G04 Closeout Confirmed

이 문서가 11 Admin Operation의 Frontend 정본이다. 기존 `FE-TODO/USER-WEB-TODO.md`는 08 구조 호환과 User Web 영향 기록용이다.

## 1. 필수 참조

- `AGENT/UXUI_AGENT`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/ADMIN_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/ADMIN_WEB.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/COMMON/API-SPEC`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/COMMON/GOAL-SPECS`

## 2. 구현된 작업 순서

```text
Admin shell
-> Users list/detail
-> Audit logs/detail drawer
-> Trash/recovery request
-> Provider failures
-> Analytics overview
-> System operation gate
```

## 3. 공통 화면 체크리스트

- [x] Auth bootstrap 뒤 관리자만 접근한다.
- [x] 일반 사용자는 Admin route에서 차단된다.
- [x] sidebar route와 page title이 일치한다.
- [x] loading/empty/error 상태가 있다.
- [x] filter와 pagination이 table layout을 깨지 않는다.
- [x] 민감정보는 기본 masked다.
- [x] 원문 조회는 reason modal을 통과해야 한다.
- [x] 위험 action이 있는 경우 확인 modal 또는 reason gate가 있다.
- [x] 사용자 상세의 notification/browser push 상태는 safe summary만 표시한다.
- [x] Analytics 화면의 mobile field-use section은 event count/bucket만 표시하고 raw payload를 보여주지 않는다.
- [x] Admin Web은 User Web API/client/feature를 import하지 않는다.
- [x] `lucide-react` icon을 사용한다.
- [x] `// 기능 : ...` 주석 규칙을 필요한 위치에 적용한다.
