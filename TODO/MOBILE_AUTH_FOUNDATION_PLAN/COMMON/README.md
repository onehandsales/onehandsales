# Common

## 1. 역할

이 폴더는 Mobile Auth Foundation Plan에서 Backend와 Mobile App이 함께 봐야 하는 범위, API 계약, 사용자 흐름, goal 실행 순서를 관리한다.

Backend와 Mobile App의 구현 내용이 충돌하면 `COMMON/API-SPEC/MOBILE_AUTH_API.md`와 `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/ARCHITECTURE/AUTH_SESSION.md`를 우선한다.

## 2. 문서 목록

| 문서 | 목적 |
| --- | --- |
| `SCOPE.md` | 1차 구현 범위와 제외 범위 |
| `USER-FLOW.md` | 로그인, 세션 복구, 로그아웃 흐름 |
| `PENDING-DECISIONS.md` | 구현 전 확정해야 하는 의사결정 |
| `REFERENCES.md` | 구현 전 읽을 문서와 코드 위치 |
| `PLANNING-REVIEW.md` | 기획/아키텍처 검토 결과 |
| `GOAL-WORK-ORDER.md` | `/goal` 실행 순서와 완료 조건 |
| `API-SPEC/MOBILE_AUTH_API.md` | 모바일 인증 API 계약 |
| `GOAL-SPECS/*` | goal별 상세 명세 |

## 3. 공통 규칙

- 새 API 구현 전에 API 계약 상태는 최소 `confirmed`여야 한다.
- 네이티브 Mobile App의 API `deviceSlot`은 `native_mobile`, Backend Prisma enum은 `NATIVE_MOBILE`이다.
- 모바일 refresh token 원문은 secure storage 외부에 저장하지 않는다.
- access token은 메모리 auth 상태에만 둔다.
- Backend는 refresh token hash만 DB에 저장한다.
- 모바일 앱은 `/api/*`만 호출하고 `/admin/api/*`를 호출하지 않는다.
- WebView 로그인은 금지한다.
- Supabase SDK는 auth provider adapter 밖으로 퍼지면 안 된다.
- CRM 도메인 화면은 이 계획의 1차 범위가 아니다.
