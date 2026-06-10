# Common

이 폴더는 FE와 BE가 함께 봐야 하는 계약과 작업 경계를 둔다.

문서:

- `AUTH-FE-CONTRACT.md`: Auth/User API와 FE 처리 계약
- `WORK-SPLIT.md`: FE/BE 작업 분리 기준

작업자는 `/goal` 실행 전에 `WORK-SPLIT.md`를 먼저 읽고, 그 다음 `AUTH-FE-CONTRACT.md`를 확인한다.

## 필수 선행 정본

이 폴더의 계약 문서는 `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`에 나열된 `AGENT/SOFTWARE_AGENT` 전체 문서를 먼저 참고한 뒤 작성/수정한다.

API 계약을 수정할 때는 요청값 형태, 응답값 형태, 내부 비즈니스 로직, 연결 DB 스키마, 에러 응답, FE/BE 처리 기준을 누락하지 않는다.
