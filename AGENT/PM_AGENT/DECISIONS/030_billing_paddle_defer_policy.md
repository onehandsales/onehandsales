# 030 — 제품 이용료와 고객 청구의 구분

Status: Current boundary / 과거 과금 실행 순서는 역사 자료
Updated: 2026-11-17

## 현재 적용

OneHand CRM 자체의 이용료·플랜·entitlement·결제 제공자와, Bonsai에서 재현할 고객 청구·입금·반복 청구·구독 기능은 다른 업무다.

Bonsai 전체 대응에는 고객 Invoice·Payment와 관련 화면·권한·계산·상태가 포함된다. 과거 제품 구독 결제 보류 방침을 이유로 이 기능을 조사·설계·구현 범위에서 제외하지 않는다. 현재 순서는 [ROADMAP](../PLANNING/ROADMAP.md)과 [전체 기능 대응표](../PLANNING/BONSAI_FEATURE_PARITY_MATRIX.md)를 따른다.

## 과거 정책의 범위

이전 Global B2C 로드맵은 완료 보관 기록이며 Paddle·100명 베타·가격 확정의 순서는 당시 제품 이용료 과금 계획이었다. 이 숫자와 순서를 Bonsai 재현의 새로운 필수 조건으로 사용하지 않는다.

Paddle은 과거 검토 후보였고 현재 실제 결제 제공자를 확정한 것은 아니다. 사업의 가격·플랜·체험·환불·세무 연동, 고객 청구의 결제 제공자, 국가별 제공 조건은 별도 계약으로 정한다.

## 구현 계약

실제 과금·외부 결제 작업에서는 금액·통화·권한·상태 전이·중복 처리·webhook/재시도·실패 복구·환불과 검증 범위를 명시한다. OneHand 제품 구독과 고객의 반복 청구 데이터를 혼합하지 않는다.

화면 mock·로컬 구현·외부 결제 실행·운영 활성화는 각각 다른 완료 상태다. 이번 문서 전환은 결제 계정 연결·실결제·배포를 수행하지 않는다.

[현재 구현](../PLANNING/IMPLEMENTATION_STATUS.md), [Bonsai 결정](036_bonsai_benchmark_transition.md), [DB 계획](../../SOFTWARE_AGENT/DB_SCHEMA/BONSAI_SCHEMA_PLAN.md)을 함께 읽는다.
