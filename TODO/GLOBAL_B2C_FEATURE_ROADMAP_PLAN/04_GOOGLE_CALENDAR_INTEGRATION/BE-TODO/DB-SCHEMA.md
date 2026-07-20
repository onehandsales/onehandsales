# DB Schema TODO

상태: Draft

## 모델 후보

- `ExternalCalendarConnection`
- `ExternalCalendarEventMapping`
- `Schedule.source`
- `Schedule.externalSourceId`

## 결정 필요

- Google token 암호화 방식
- calendar id와 sync token 저장 여부
- 가져온 일정 삭제/수정 정책
- 중복 import 방지 index

## migration 주의

- 기존 `Schedule`과 source 컬럼 추가가 호환되어야 한다.
- Calendar token은 민감정보로 보고 암호화/삭제 정책을 연결한다.
