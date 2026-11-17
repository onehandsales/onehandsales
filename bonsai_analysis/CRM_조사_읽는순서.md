# Bonsai 학습과 문서 읽는 순서

Updated: 2026-11-17

현재 확정 방향은 **Bonsai의 전체 기능·UX를 재현한 뒤 차별화**하는 것이다. UX 조사에는 **Gummble**을 사용한다. 대표·영업사원·운영·실무자·고객의 역할을 포함하며 특정 업종을 먼저 확정해야 시작할 수 있는 작업이 아니다.

## 먼저 읽기

1. [Bonsai 학습 계획과 타깃 고객](CRM_Bonsai_학습계획과_타깃고객.md): 누구의 어떤 업무를 따라 배울지 확인한다.
2. [CRM 공통 개념](CRM_공통개념.md): 고객·거래·견적·문서·프로젝트·청구·입금을 구분한다.
3. [Bonsai 기능 지도와 확인 사항](CRM_Bonsai_기능지도와_확인사항.md): 전체 기능군과 중심 업무, 버전 조건을 확인한다.
4. [공식 문서 출처](CRM_공식문서_출처.md): 현재 근거와 과거 비교 기록을 구분한다.
5. [제품 전환 결정](../AGENT/PM_AGENT/DECISIONS/036_bonsai_benchmark_transition.md), [전체 기능 대응표](../AGENT/PM_AGENT/PLANNING/BONSAI_FEATURE_PARITY_MATRIX.md).
6. [Gummble 조사 절차](../AGENT/UXUI_AGENT/PLANNING/GUMMBLE_RESEARCH_GUIDE.md).

## 다시 작업을 시작할 때

확정한 방식은 **Bonsai 원본의 제품·UX 결정을 출발점으로 삼아 기능별로 구현하는 것**이다. Figma나 MCP로 Figma 화면을 먼저 만드는 단계는 필수가 아니다. 임시 데이터를 넣은 실제 프런트엔드 화면으로 검토하고 DB·API 계약을 구체화해 저장·조회까지 연결한다. [역할과 구현 착수 기준](../AGENT/UXUI_AGENT/DECISIONS/025_uxui_bonsai_reference.md#figma와-구현-착수)을 먼저 확인한다.

다음 시작점은 Bonsai에서 가상 고객 한 건의 업무를 직접 따라가고, Gummble의 Bonsai 화면 보유·버전·접근 상태를 확인하는 것이다. 확보한 기능부터 원본 확인 → 동작·권한 정리와 화면 제작 → DB·API 연결 → 비교 검증을 반복한다. 현재 조회·구현 상태는 아래 근거 문서에서 다시 확인한다.

## 과거 비교 자료

[CRM 관련 제품 비교 이력](CRM_제품비교_이력.md)은 2026-11-16의 다른 제품 조사 기록이다. Bonsai 외 제품을 현재 구현 기준으로 추가하거나 참고 제품 선택을 다시 미정으로 돌리는 자료가 아니다. 이번 변경에서 타사 제품 기능을 재검증하지 않았다.

## 근거와 예시

공식 문서는 기능·조건, 공식 API는 공개 계약, Gummble은 화면·flow, 실계정은 실제 상태 변화의 근거다. 가상 개발·청소 예시는 이해를 위한 설명이며 실제 테스트가 아니다.

현재 공식 주요 자료를 조회했으나 Gummble의 Bonsai 화면과 실제 계정 동작은 확인하지 않았다. 상세 상태는 [조사 정본](../AGENT/UXUI_AGENT/PLANNING/BONSAI_BENCHMARK_RESEARCH.md)에 기록한다.

이번 문서 반영 범위는 이 조사 폴더와 AGENT다. 루트·BE·FE 문서의 후속 전환과 실제 구현 완료를 뜻하지 않는다.
