# 첫 구현 범위

Status: Proposed first delivery / 전체 목표와 구분
Date: 2026-11-15

최종 목표는 folk 전체 기능·UX 대응이다. 이 문서는 첫 검증 가능한 구현 단위를 제안한다. 이전 Kit MVP나 개인 전용 제품 범위를 유지하지 않는다.

## 첫 흐름

Workspace 진입 → Group 생성 → Person/Company 등록·그룹 추가 → Table의 기본/사용자 필드 편집 → Pipeline 분류 → 상세 재조회.

이 흐름에서 같은 연락처의 여러 그룹 포함, 기본 정보 공유와 그룹 값 격리, 권한, 저장 후 새로고침을 검증한다.

## 후속 단계

Custom objects/Deals, Notes/Tasks, 전체 검색·일괄 작업·가져오기, 협업·외부 동기화·캠페인·Dashboard·AI 등은 [기능 대응표](FOLK_FEATURE_PARITY_MATRIX.md)에 남긴다. 첫 배치에 없다는 이유로 제품 제외 항목으로 바꾸지 않는다.

## 착수 조건

화면·상태 근거, 같은 흐름의 API·DB·권한 계약, 기존 코드 재사용과 제거 영향이 정리되어 있어야 한다. mock 화면 제작은 계약 확정 전에 가능하다. 첫 직군·Kit을 선택할 필요는 없다.

1개월 전체 완성 일정은 확정하지 않았다. 조사 후 작업량과 배치 범위를 산정한다.
