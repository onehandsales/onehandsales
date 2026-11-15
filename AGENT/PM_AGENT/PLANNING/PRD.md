# Product Requirements

Status: folk transition PRD
Date: 2026-11-15

## 목표

folk의 기능과 UX를 기준으로 OneHand CRM을 전환한다. 기존 범용 CRM 엔진의 복잡성을 줄이되 실제 제품 기능에 필요한 확장성은 보존한다. 현재 타겟 직군은 미확정이다.

## 요구사항

| 영역 | 요구 |
| --- | --- |
| 연락처 | People/Companies 기본 정보, 연결·검색·수정·중복 처리 |
| 그룹 | 여러 그룹에 연락처 포함, 그룹별 사용자 필드·값·공유 범위 |
| 화면 | 그룹의 객체 탭과 Table/Pipeline, 상세와 생성·편집 흐름 |
| 확장 객체 | 그룹 범위 Custom objects/Deals와 연락처 연결 |
| 활동 | 메모·작업·상호작용 및 후속 알림 |
| 협업 | Workspace/Group 접근, 초대·공유·비공개 데이터 |
| 운영 기능 | 가져오기·내보내기, 메시지·캠페인·연동·대시보드·AI 등 전체 대응 조사 |

세부 범위·근거·차이는 [FOLK_FEATURE_PARITY_MATRIX](FOLK_FEATURE_PARITY_MATRIX.md)를 따른다. 위 표에 적었다고 구현 완료로 표시하지 않는다.

## 입력과 저장의 기준

기본 연락처 정보와 그룹별 정보는 소유 범위가 다르다. Group 제거, 레코드 삭제, 필드 삭제, View 삭제를 별개 동작으로 정의한다. 공식 문서가 충돌하는 삭제·권한 규칙은 실계정 확인 전 확정하지 않는다.

## 수용 기준

1. 각 흐름에 원본 화면·공식 근거·버전 조건이 있다.
2. 정상·빈·오류·권한 제한·삭제 상태가 정의되어 있다.
3. API와 DB가 화면 행동을 실제 저장·조회한다.
4. 다른 그룹과 Workspace로 데이터·권한이 누출되지 않는다.
5. 미구현 기능과 원본과의 차이를 숨기지 않는다.

## 실행

[ROADMAP](ROADMAP.md)에 따라 단계적으로 구현한다. 이번 문서 변경은 실제 schema/API 전환을 수행하지 않는다. 현재 코드는 [IMPLEMENTATION_STATUS](IMPLEMENTATION_STATUS.md)를 따른다.
