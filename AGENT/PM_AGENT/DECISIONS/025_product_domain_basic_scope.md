# 제품 도메인 기본 기능 구현 범위 확정

참고 기준 갱신: 2026-11-17. 과거 구현·검증 날짜는 아래 기록을 따른다.

> **Historical / Superseded — 2026-11-15**
> 아래는 이전 방향의 기록이다. 기존 결정을 보존하기 위한 내용이며 새 작업의 요구사항·선행 조건으로 적용하지 않는다. 현재 기준은 [Bonsai 전환 결정](036_bonsai_benchmark_transition.md)이다.

## 이전 기록


Date: 2026-09-10
Updated: 2026-09-12
Status: Historical inactive record / current boundary

## 1. 결정

현재 활성 코드와 schema에는 전역 Product 도메인이 없다.

- `BE/prisma/schema.prisma`에 Product 계열 모델이 없다.
- `BE/src/modules/product`에는 런타임 TypeScript 코드가 없고 `AppModule`에 연결되어 있지 않다.
- `FE/user-web`의 `/app/products/*` route는 `/app`으로 redirect한다.

이 파일은 과거 Product 도메인 계획이 있었다는 기록만 남긴다.

## 2. 현재 기준

Product를 OneHand CRM 전체의 전역 기본 도메인으로 되살리지 않는다.

다만 특정 Kit 안에서 `상품`, `보험상품`, `제품`, `서비스` 같은 업무 대상이 필요하면 Kit의 Object로 정의할 수 있다. 이 경우에도 기존 Product 도메인을 그대로 복구하는 것이 아니라, Kit/CRM Core 기준으로 새로 설계한다.

## 3. 재활성화 조건

Product 성격의 관리 대상을 다시 활성화하려면 아래 문서가 필요하다.

- PM 결정
- Kit 범위 정의
- Prisma migration
- Backend module/API
- User Web route/API
- UX/UI 흐름
- QA 문서

## 4. 관련 문서

- `AGENT/PM_AGENT/PLANNING/KIT_STRATEGY.md`
- `AGENT/PM_AGENT/PLANNING/CRM_CORE_CONCEPT_MODEL.md`
- `AGENT/PM_AGENT/PLANNING/DATA_MODEL.md`
