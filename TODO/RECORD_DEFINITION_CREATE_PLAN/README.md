# RecordDefinition Create Plan

상태: confirmed

## 1. 목적

ObjectDefinition 목록 화면에서 사용자가 `생성하기` 버튼을 눌렀을 때 값이 비어 있는 RecordDefinition row를 생성한다.

이 API는 Notion/Attio형 UX를 위한 첫 단계다. RecordDefinition만 먼저 생성하고, 각 cell 값인 RecordAttributeValueDefinition 생성/수정은 후속 API에서 별도로 다룬다.

## 2. 범위

포함:

- RecordDefinition 단건 생성 API 계약
- Backend 구현 TODO
- Workspace membership 검증
- ObjectDefinition Workspace 소속 검증
- 생성 감사 Actor 저장
- 생성 성공 구조화 로그 기준

제외:

- RecordAttributeValueDefinition 생성/수정
- cell 값 validation/mapping
- Select/Status/RecordReference/ActorReference 값 저장
- Frontend API client 연결
- DB schema 변경

## 3. API 계약

- `COMMON/API-SPEC/RECORD_DEFINITION_CREATE_API.md`

## 4. Backend TODO

- `BE-TODO/RECORD_DEFINITION_CREATE_BE_TODO.md`

## 5. 구현 기준

- Backend는 modular monolith + Clean Architecture 계층 구조를 유지한다.
- `record-definition` module 내부에 command port와 Prisma adapter를 추가한다.
- 다른 module의 infrastructure repository를 직접 import하지 않는다.
- Workspace 접근은 `WorkspaceAccessQuery` 공개 port를 사용한다.
- ObjectDefinition 소속 확인은 `ObjectDefinitionAccessQuery` 공개 port를 사용한다.
- controller는 HTTP route 연결과 application use case 위임만 담당한다.

