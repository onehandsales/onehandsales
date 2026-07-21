# DB Schema TODO

상태: Draft

## 모델 후보

- `ExternalCalendarConnection`
- `ExternalCalendarEventMapping`
- `Schedule.source`
- `Schedule.externalSourceId`

## 결정 baseline 반영 후 세부 확인

- Google token 암호화 방식
- calendar id와 provider 지원 시 syncToken 저장 방식
- 가져온 일정 유지/read-only 표시와 source 상태 정책
- 중복 import 방지 index

## migration 주의

- 기존 `Schedule`과 source 컬럼 추가가 호환되어야 한다.
- Calendar token은 민감정보로 보고 암호화/삭제 정책을 연결한다.
