# CRM Core Backend — 현재와 folk 전환

Date: 2026-11-15
Status: 현재 소스 설명 + 전환 설계 방향

## 현재 구현

`workspace`, `object-definition`, `attribute-definition`, `record-definition`, `list-definition`, `view-definition` 모듈이 있다. 현재 API 목록은 [API_SAMPLE](../../COMMON/API_SAMPLE.md), 런타임 범위는 [IMPLEMENTATION_STATUS](../../../PM_AGENT/PLANNING/IMPLEMENTATION_STATUS.md)를 따른다.

Object와 List 생성은 첫 View·표시 설정을 관련 모듈 port를 통해 같은 트랜잭션에 저장한다. View 설정 저장은 기존 7개 설정 테이블을 사용하며 미리보기와 명시적 저장, 낙관적 충돌 처리가 있다.

## 목표 경계 제안

| 책임 | 제안 |
| --- | --- |
| 연락처 | Person/Company 기본 정보·연락수단·소속·중복 처리 |
| Group | 포함 관계·그룹 공유·객체 탭의 소스 |
| 사용자 필드 | 그룹·대상 범위 정의/옵션/값 검증 |
| Custom object | 그룹 객체 타입·레코드·연락처 연결 |
| View | Table/Pipeline 설정·조회·자동 저장 |
| 활동 | Notes/Tasks/Interactions 및 공개 범위 |
| 연동·확장 | 캠페인·Dashboard·동기화 등 기능별 경계 |

이는 모듈 분리 제안이다. 화면 단위마다 새 module을 만들거나 이 표의 이름을 확정 API 경로로 사용하지 않는다.

## 계약 요구

- Workspace 및 Group 접근을 application에서 검증한다.
- 기본 연락처 수정과 그룹별 값 변경을 구분한다.
- 생성·그룹 포함·연결·옵션 생성의 원자성 및 재시도 계약을 정한다.
- 자동 저장은 기존 save/undo 계약과 차이가 있다. 필드 단위/설정 단위 저장, debounce, 버전 충돌, 실패 복구를 결정한다.
- 그룹 제외·그룹 삭제·레코드 삭제의 영향과 복구를 서로 다른 계약으로 정의한다.
- 외부 동기화는 DB 트랜잭션 밖에서 처리하고 중복·재시도·부분 실패를 설계한다.
- 다른 모듈의 repository를 직접 import하지 않는다.

## 전환

[DB 계획](../../DB_SCHEMA/FOLK_SCHEMA_PLAN.md), [의존·순서](../../COMMON/FOLK_TRANSITION_MATRIX.md)를 따른다. 기존 코어 제거는 새 계약·데이터 전환·FE 전환과 함께 한다. 첫 Kit 확정은 착수 조건이 아니다.
