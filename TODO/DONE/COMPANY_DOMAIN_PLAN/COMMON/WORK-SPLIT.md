# Company Work Split

> 2026-09-11 문서 정리: 현재 BE/FE 기준과 충돌하는 과거 모델/API/페이지/부수 기록 언급은 제거했다.

## Backend

- Prisma schema와 migration은 `Company`, `CompanyField`, `CompanyRegion`만 다룬다.
- Controller/application/repository는 회사, 분야, 지역, export 계약을 구현한다.
- 모든 query와 mutation은 current user ownership을 먼저 적용한다.

## Frontend

- User Web은 회사 목록과 생성 화면을 현재 API 계약에 맞춰 호출한다.
- `/app/companies/new/full`은 전체 화면 생성 흐름을 담당한다.
- 현재 활성 범위를 벗어난 도메인 화면은 `/app`으로 돌려보내는 정책을 따른다.

## 문서

- 현재 정본은 `AGENT`와 `BE/src/modules/company/README.md`를 우선한다.
