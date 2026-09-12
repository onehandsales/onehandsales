# Implementation Status

## 현재 활성 범위

- Backend: Auth/User, Error Report, Support Request, Public Contact Request, Health, `GET /admin/api/me`
- Frontend User Web: `/app` 빈 홈, `/app/more`, 계정 설정 모달, 도움말 접수, 공개 문의, locale 공개 사이트
- Frontend Admin Web: access token 입력 후 관리자 권한 확인
- Prisma: User/Auth session, ErrorReport, SupportRequest, PublicContactRequest 모델만 유지

## 제거된 런타임 범위

- 고정형 고객사 관리 도메인
- 고정형 고객사 검색 API와 화면
- 고정형 고객사 xlsx export
- 고정형 고객사 앱 화면
- 고정형 고객사/분류/지역 API
- 통합검색 API

위 범위는 현재 `BE`, `FE/user-web`, `BE/prisma/schema.prisma` 기준 런타임에 존재하지 않는다. 다음 CRM 코어는 기존 고정 테이블을 되살리지 않고 Workspace/Object/Attribute/Record/List/View 계열의 유연한 모델로 별도 설계한다.

## 검증 기준

- BE typecheck/lint/test/build
- FE/user-web typecheck/lint/test/build/e2e
- FE/admin-web typecheck/lint/build/e2e
- Prisma validate/generate

## 문서 기준

문서는 현재 코드에 남아 있는 기능만 활성 범위로 설명한다. 삭제된 고정형 고객사 도메인 문서는 활성 API, 화면, DB 모델처럼 쓰지 않는다.

공개 문의의 회사명과 회사 규모 입력 필드는 실제 `PublicContactRequest` 모델에 남아 있으므로 삭제하지 않는다.
