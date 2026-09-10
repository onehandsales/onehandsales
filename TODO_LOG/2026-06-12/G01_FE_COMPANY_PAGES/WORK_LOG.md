# G01 FE Company Pages

> 2026-09-11 문서 정리: 현재 `BE`와 `FE/user-web` 기준으로 축약한 보관 로그다.

## 작업 일자

2026-06-12

## 관련 계획과 goal

- `TODO/DONE/COMPANY_DOMAIN_PLAN/FE-TODO/G01-FE-COMPANY-PAGES.goal.md`
- `TODO/DONE/COMPANY_DOMAIN_PLAN/COMMON/API-SPEC/COMPANY_API.md`
- `TODO/DONE/COMPANY_DOMAIN_PLAN/COMMON/API-SPEC/COMPANY_API_DETAIL.md`

## 현재 기준 작업명

User Web 회사 목록, 생성, 분야/지역 옵션, xlsx 내보내기 화면 구현

## 현재 기준 적용 범위

- 회사 목록 검색, 분야/지역 필터, 페이지네이션
- 회사 생성 모달과 전체 화면 생성 진입
- 회사 분야/지역 옵션 생성과 삭제
- 회사 목록 xlsx 다운로드
- 현재 Company API 계약에 맞는 type/API/hook 정리

## 검증 기준

- `pnpm --dir FE/user-web run typecheck`
- `pnpm --dir FE/user-web run lint`
- `pnpm --dir FE/user-web run test`
- `pnpm --dir FE/user-web run build`
