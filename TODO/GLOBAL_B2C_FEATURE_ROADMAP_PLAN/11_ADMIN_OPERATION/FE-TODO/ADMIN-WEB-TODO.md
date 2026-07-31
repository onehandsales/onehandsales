# Admin Web TODO

상태: Confirmed Planning

이 문서가 11 Admin Operation의 Frontend 정본이다. 기존 `FE-TODO/USER-WEB-TODO.md`는 08 구조 호환과 User Web 영향 기록용이다.

## 1. 필수 참조

- `AGENT/UXUI_AGENT`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/ADMIN_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/ADMIN_WEB.md`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/COMMON/API-SPEC`
- `TODO/GLOBAL_B2C_FEATURE_ROADMAP_PLAN/11_ADMIN_OPERATION/COMMON/GOAL-SPECS`

## 2. 작업 순서

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

- [ ] Auth bootstrap 뒤 관리자만 접근한다.
- [ ] 일반 사용자는 Admin route에서 차단된다.
- [ ] sidebar route와 page title이 일치한다.
- [ ] loading/empty/error 상태가 있다.
- [ ] filter와 pagination이 table layout을 깨지 않는다.
- [ ] 민감정보는 기본 masked다.
- [ ] 원문 조회는 reason modal을 통과해야 한다.
- [ ] 위험 action은 확인 modal이 있다.
- [ ] Admin Web은 User Web API/client/feature를 import하지 않는다.
- [ ] `lucide-react` icon을 사용한다.
- [ ] `// 기능 : ...` 주석 규칙을 필요한 위치에 적용한다.
