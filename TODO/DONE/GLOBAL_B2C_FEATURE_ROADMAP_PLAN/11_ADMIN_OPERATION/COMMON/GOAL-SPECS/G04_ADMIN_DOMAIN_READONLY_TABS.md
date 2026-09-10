# G04 Admin Domain Readonly Tabs

> 2026-09-11 문서 정리: 현재 BE/FE 기준과 충돌하는 과거 모델/API/페이지/부수 기록 언급은 제거했다.

상태: 비활성 보관 문서

## 현재 기준

현재 `FE/admin-web`은 관리자 권한 확인 화면만 제공한다. Backend의 활성 Admin API도 `GET /admin/api/me`뿐이다.

## 비활성 범위

- Admin 사용자 상세 domain tab
- `/admin/api/users/:userId/domain-records`
- 도메인 safe summary drawer
- Admin 도메인 직접 수정/삭제/복구 action
- Admin 민감정보 원문 조회 modal

## 재개 조건

이 기능을 다시 열려면 현재 `BE/prisma/schema.prisma`, `BE/src/app.module.ts`, `FE/admin-web` route를 기준으로 새 API 계약과 화면 계획을 먼저 작성한다.
