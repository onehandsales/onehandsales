# 032 Product Pivot To No Setup CRM

Date: 2026-09-12
Status: Confirmed

## 1. 결정

OneHand CRM은 기존 고정형 영업 CRM 또는 빈 CRM builder 방향이 아니라, Kit 기반 No Setup CRM 방향으로 제품을 전환한다.

핵심 문장:

> CRM을 배우거나 설계할 필요 없이, 내 일에 맞는 CRM이 바로 준비된다.

제품 철학:

> Ready-made, but never locked.

## 2. 배경

고정형 CRM은 바로 시작하기 쉽지만 특정 영업 구조에 갇힌다. 자유로운 CRM/DB 도구는 확장성이 높지만 사용자가 먼저 구조를 설계해야 한다.

OneHand CRM의 차별점은 이 둘을 단순히 섞는 것이 아니라, 사용자가 자기 일을 말하면 제품이 업무에 맞는 CRM 구조를 먼저 준비하는 것이다.

## 3. 적용 범위

PM 문서:

- 제품 방향, PRD, MVP, Kit 전략, 로드맵은 이 결정을 우선한다.

UX/UI 문서:

- 첫 화면과 onboarding은 빈 builder가 아니라 업무 선택과 Kit 적용 경험을 중심으로 설계한다.

Software 문서:

- 다음 CRM Core는 기존 Company/Product/Deal 고정 테이블을 되살리지 않고 Workspace/Kit/Object/Attribute/Relationship/Record/View 기반으로 설계한다.

## 4. 내려가는 기준

아래 표현과 방향은 현재 정본 기준에서 내려간다.

- OneHand Sales를 현재 제품명으로 사용하는 방식
- `onehand.sales`를 현재 브랜드 기준으로 사용하는 방식
- Global B2C/Series A 로드맵을 현재 제품 우선순위로 보는 방식
- Company/Product/Deal을 전역 기본 도메인으로 보는 방식
- CRM builder처럼 사용자가 처음부터 구조를 직접 만드는 경험

## 5. 유지되는 기준

아래는 유지한다.

- 현재 Auth/User/Support/PublicContact foundation
- 공개 문의의 회사명/회사 규모 입력
- KR/US/CA 우선 시장 판단
- 결제/Paddle은 제품 가설 검증 이후로 미루는 판단
- 과거 결정 문서는 역사적 참고 기록으로 보존

## 6. 관련 문서

- `README.md`
- `AGENT/PM_AGENT/DECISIONS/000_확정_결정.md`
- `AGENT/PM_AGENT/PLANNING/PRODUCT_DIRECTION.md`
- `AGENT/PM_AGENT/PLANNING/PRD.md`
- `AGENT/PM_AGENT/PLANNING/MVP_SCOPE.md`
