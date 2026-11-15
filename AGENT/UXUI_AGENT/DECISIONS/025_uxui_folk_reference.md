# 025 — folk 단일 UX 기준

Status: Accepted
Date: 2026-11-15

[PM 036](../../PM_AGENT/DECISIONS/036_folk_benchmark_transition.md)에 따라 제품 화면과 사용자 흐름의 기준을 folk로 통일한다. Notion과 Attio를 섞거나 기존 Kit 화면을 folk라는 이름으로 재사용하지 않는다.

## 적용

- Nicelydone MCP에서 folk의 화면, flow, component와 출처 식별자를 조사한다.
- 공식 도움말로 기능 의미를, 실제 folk 계정으로 동작과 상태를 대조한다.
- 캡처 날짜·요금제·역할·기기·언어를 기록한다. 다른 버전의 화면을 임의로 조합하지 않는다.
- 진입, 생성, 편집, 조회, 필터, 오류, 빈 상태, 권한 제한, 삭제·복구까지 조사한다.
- 테이블의 가로 스크롤, 상세 패널/모달/전체 화면, 모바일 전환, 저장 방식은 folk 증거에 맞춘다. 이전의 일괄 금지나 우측 패널 고정 규칙을 적용하지 않는다.
- 그룹의 People/Companies/custom object 탭과 탭 안의 Table/Pipeline view를 구분한다. Dashboard는 별도 조사한다.
- 프런트 프로토타입은 mock 데이터로 만들 수 있다. 실연동 전에는 API와 데이터 소유권 계약을 함께 확정한다.

## 현재 조사 상태

공식 문서 검토는 진행했다. 이 세션에서 Nicelydone 도구가 노출되지 않아 MCP 화면 조회는 수행하지 못했다. 사용자가 제공한 Capsule 이미지는 folk UX 근거로 사용하지 않는다. 실제 folk 화면 확인 전 수치·레이아웃·삭제 동작을 확정했다고 쓰지 않는다.

## 완료 기준

각 화면에 출처, 관련 기능, 상태별 동작, API 요구, DB 영향, 확인 결과를 연결한다. 전체 동등성 여부는 [기능 대응표](../../PM_AGENT/PLANNING/FOLK_FEATURE_PARITY_MATRIX.md)로 관리한다.

상세 조사 절차와 미확인 항목은 [FOLK_BENCHMARK_RESEARCH](../PLANNING/FOLK_BENCHMARK_RESEARCH.md)를 따른다.
