# Admin Web TODO

## 1. 이번 계획 상태

Admin Web 운영 화면 QA는 이번 계획 범위가 아니다.

## 2. 포함하는 최소 확인

- User Web이 `/admin/api/*`를 호출하지 않는지 확인
- 일반 사용자 token으로 `/admin/api/*` 접근이 차단되는지 BE/HTTP smoke에서 확인
- Admin Web 기존 typecheck/lint/build는 필요 시 선택 실행

## 3. 제외 범위

- Admin 운영 화면 구현
- Admin full E2E
- 사용자 목록, 글로벌 CRM 목록, 민감정보 원문 조회 화면
- 결제/구독 운영 화면

## 4. 관련 문서

- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/ADMIN_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/ADMIN_WEB.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/TESTING.md`

