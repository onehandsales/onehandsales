# RecordAttributeValueDefinition Update Plan

## 1. 목적

ObjectDefinition 목록 화면에서 사용자가 cell 1개를 수정할 때 해당 `RecordAttributeValueDefinition` 값을 저장하는 Backend API 계약을 정의한다.

이 계획은 `RecordDefinition` 생성 API가 만든 null cell value row를 후속 수정하는 범위다.

## 2. 현재 범위

- `RecordAttributeValueDefinition` 단건 update API 계약
- cell 수정 시 부모 `RecordDefinition.updatedAt` / `updatedByActorId` 갱신 계약
- attributeType별 최소 value mapping 계약
- 참조형 값은 1차에서 관계 의미로 해석하지 않고 프론트 표시용 값으로 저장한다.

## 3. 제외 범위

- SelectOption / StatusOption 생성 API
- RecordReference / ActorReference 대상 소속 검증
- 관계 생성, 양방향 연결, target object 자동 보강
- Frontend 구현

## 4. 계약 문서

- `COMMON/API-SPEC/RECORD_ATTRIBUTE_VALUE_DEFINITION_UPDATE_API.md`
- `BE-TODO/RECORD_ATTRIBUTE_VALUE_DEFINITION_UPDATE_BE_TODO.md`
