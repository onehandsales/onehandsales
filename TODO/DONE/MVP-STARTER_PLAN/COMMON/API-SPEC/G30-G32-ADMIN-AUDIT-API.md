# 현재 Admin API 명세

> 2026-09-11 문서 정리: 현재 BE/FE 기준과 충돌하는 과거 모델/API/페이지/부수 기록 언급은 제거했다.

## 1. 목적

이 문서는 현재 `BE`와 `FE/admin-web`에 남아 있는 Admin API 계약을 정의한다.

과거 Admin dashboard, 도메인 목록, 민감정보 원문 조회, 감사 로그 API 계약은 현재 런타임 코드와 Prisma schema에 없으므로 활성 계약으로 보지 않는다.

## 2. 현재 활성 API

| API 이름 | Method | Path | Request | Response | 연결 DB |
|---|---|---|---|---|---|
| 관리자 권한 확인 | `GET` | `/admin/api/me` | Bearer access token | `AdminMeResponse` | `User` |

## 3. 처리 기준

1. `AuthGuard`로 Backend App access token을 검증한다.
2. `AdminGuard`로 현재 사용자 role이 `ADMIN`인지 확인한다.
3. 성공 시 관리자 사용자 기본 정보를 반환한다.
4. Admin Web은 이 API 외의 Admin API를 호출하지 않는다.

## 4. Response

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | string | 사용자 ID |
| `email` | string | 관리자 이메일 |
| `name` | string 또는 null | 관리자 이름 |
| `role` | `ADMIN` | 관리자 권한 |

## 5. 비활성 범위

- Admin dashboard API
- Admin 도메인 목록/상세 API
- Admin 도메인 mutation API
- 민감정보 원문 조회 API
- 감사 로그 조회 API

## 6. 상세 계약

엔드포인트별 구현 상세는 `TODO/DONE/MVP-STARTER_PLAN/COMMON/API-SPEC/G30-G32-ENDPOINT-CONTRACT.md`를 따른다.
