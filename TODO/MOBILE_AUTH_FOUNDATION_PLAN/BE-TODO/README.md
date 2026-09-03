# BE TODO

## 1. 역할

이 폴더는 Mobile Auth Foundation Plan의 Backend 작업을 관리한다.

Backend 작업의 목표는 기존 웹 인증 API를 깨지 않고 모바일 전용 `/api/auth/mobile/*` API를 추가하는 것이다.

네이티브 Mobile App의 API `deviceSlot`은 `native_mobile`, Backend Prisma enum은 `NATIVE_MOBILE`로 확정됐다.

## 2. 문서 목록

| 문서 | 목적 |
| --- | --- |
| `API-TODO.md` | Backend API 구현 작업 |
| `DB-SCHEMA.md` | DB schema 사용 기준과 migration 필요 여부 |
| `G01-BE-MOBILE-AUTH-API.goal.md` | `/goal` 실행 문서 |

## 3. 구현 기준

- `COMMON/API-SPEC/MOBILE_AUTH_API.md`를 우선한다.
- 새 API는 `BE/src/modules/auth` 안에 구현한다.
- 웹 cookie API와 모바일 body token API를 controller/DTO/response mapper에서 분리한다.
- `ExternalAuthVerifier` port 경계는 유지한다.
- raw refresh token은 DB나 로그에 저장하지 않는다.
- 모바일 refresh API는 `NATIVE_MOBILE` device slot session만 허용한다.
- 기존 User Web/Admin Web auth 회귀 테스트를 함께 확인한다.
