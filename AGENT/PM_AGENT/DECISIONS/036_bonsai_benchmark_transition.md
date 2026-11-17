# 036 — Bonsai 제품·UX 재현 전환

Status: Accepted
Updated: 2026-11-17
Origin: 사용자 결정

## 결정

OneHand CRM의 제품·UX 참고 기준은 **Bonsai(hellobonsai.com)**다. Bonsai의 전체 기능과 화면·상호작용을 재현한 뒤 차별점을 추가한다. 단계별 구현은 순서이며 최종 범위 축소가 아니다. 기존 제품명·브랜드명·저장소명은 유지한다.

조사는 Bonsai 공식 도움말, 공식 REST API 문서, Gummble 화면·flow, 실제 Bonsai 계정 관찰을 함께 사용한다. Gummble은 UX 조사 도구이고 제품 데이터 API가 아니다. 연결·검색·계정 실행을 하지 않았다면 완료로 기록하지 않는다.

## 사용자와 범위

대표, 회사의 영업 담당자, 운영·프로젝트 담당자, 실무자, 외부 고객을 역할별 시나리오에 포함한다. 특정 직군·업종·팀 규모를 제품 사용의 제한으로 정하지 않는다. Bonsai가 설명하는 서비스 사업자의 업무와 OneHand CRM의 최종 판매 타깃은 별개다.

고객·거래에서 견적·합의 문서, 프로젝트·작업·시간, 청구·수금으로 이어지는 흐름을 중심으로 학습한다. 고객 포털, 인력 배정, 비용·예산·보고서, 자동화·연동, 설정·권한 등도 전체 대응 범위다. 세부 기능은 [기능 대응표](../PLANNING/BONSAI_FEATURE_PARITY_MATRIX.md)에 추가하며 누락 여부를 계속 확인한다.

## 이전 결정과의 관계

PM 032~035의 Kit 중심 제품, 개인 우선·팀 후속 제한, 첫 Kit 선택 선행 조건, 개발 보류를 현행 요구로 적용하지 않는다. UX의 과거 패널 고정·모바일 테이블 금지 등도 재현 근거를 대신하지 않는다. 이전 결정은 역사 자료이며 충돌하지 않는 보안·아키텍처·문서 운영 기준은 유지한다.

이 결정의 현재 본문은 2026-11-17 사용자 방향이다. 과거 제품의 기능·API·화면 조사 결과를 Bonsai에서 확인한 사실로 바꾸어 쓰지 않는다.

## 설계 원칙

- Client/Company/Contact, Deal, Estimate, Document, Project, Task, Time Entry, Invoice, Payment의 의미와 상태를 구분한다.
- 공식 공개 API는 외부에 제공하는 계약이다. Bonsai의 비공개 DB 구조나 모든 화면의 내부 API를 공개한 것으로 해석하지 않는다.
- 기존 Object/List/Attribute/Record/View 엔진 보존을 목표로 삼지 않는다. 인증·사용자·Workspace를 유지 검토의 출발점으로 두고 실제 기능 요구에 따라 기존 코어를 교체·재설계한다.
- 모델명·카디널리티·권한·삭제·가격 계산을 화면만으로 확정하지 않는다. API가 제공하지 않는 제품 기능도 조사 범위에서 제외하지 않는다.
- 실제 사업의 결제 제공자·세무 연동과 OneHand 구독 과금은 별도 계약이다. Bonsai 고객에게 보내는 청구서와 혼동하지 않는다.

## 문서 전환 범위와 이력

2026-11-17 최초 전환은 `AGENT/`와 `ㅁㄴㅇㅁㄴㅇㅁㄴㅇㅁㄴㅇ/` 문서에 적용했다. 같은 날 사용자 후속 요청에 따라 루트 `AGENTS.md`·`prompt.md`·`README.md`와 BE·FE 문서의 제품·조사 기준, 업무 설명과 참조 링크도 Bonsai·Gummble 기준으로 정비한다.

TODO·TODO_LOG는 링크 대상으로도 접근하지 않는다. 코드·schema·migration·환경 설정·실제 DB·외부 계정 데이터·커밋은 문서 전환에 포함하지 않는다. 최초 전환과 후속 정비의 검증 결과는 [문서 검토 기록](../../SOFTWARE_AGENT/COMMON/DOCUMENTATION_REVIEW_20261117.md)에서 구분한다.

## 정본

- [제품 방향](../PLANNING/PRODUCT_DIRECTION.md), [기능 대응표](../PLANNING/BONSAI_FEATURE_PARITY_MATRIX.md)
- [현재 구현 기록](../PLANNING/IMPLEMENTATION_STATUS.md)
- [UX 결정](../../UXUI_AGENT/DECISIONS/025_uxui_bonsai_reference.md)
- [공식 출처·미확인 사항](../../UXUI_AGENT/PLANNING/BONSAI_BENCHMARK_RESEARCH.md)
- [DB 설계안](../../SOFTWARE_AGENT/DB_SCHEMA/BONSAI_SCHEMA_PLAN.md), [전환 영향](../../SOFTWARE_AGENT/COMMON/BONSAI_TRANSITION_MATRIX.md)
