# Admin Domain Readonly API

> 2026-09-11 문서 정리: 현재 BE/FE 기준과 충돌하는 과거 모델/API/페이지/부수 기록 언급은 제거했다.

상태: 비활성 보관 문서
소비자: 없음

## 1. 현재 기준

현재 Backend와 Admin Web은 도메인 read-only 조회 API를 제공하지 않는다.

활성 Admin API는 `GET /admin/api/me` 관리자 권한 확인뿐이다. 현재 계약은 아래 문서를 기준으로 한다.

- `FE/admin-web/README.md`
- `FE/admin-web/ARCHITECTURE.md`
- `BE/src/modules/auth/presentation/http/me.controller.ts`

## 2. 비활성 범위

- `/admin/api/users/:userId/domain-records`
- Admin domain tab
- 도메인 safe summary drawer
- Admin 도메인 mutation
- Admin 민감정보 원문 조회
- Admin audit log 조회

위 범위를 다시 열려면 현재 Prisma schema와 Admin Web 화면을 기준으로 새 계획 문서를 작성한다.
