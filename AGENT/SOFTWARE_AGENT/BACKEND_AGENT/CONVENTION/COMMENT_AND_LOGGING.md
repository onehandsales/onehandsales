# Comment And Logging Convention

## Comment

- 코드가 의도를 바로 드러내면 주석을 추가하지 않는다.
- transaction, ownership, 복구 정책처럼 실수 비용이 큰 부분에만 짧은 설명을 둔다.
- 오래된 기능명이나 제거된 route를 주석에 남기지 않는다.

## Logging

- access token, refresh token, 개인정보 원문은 로그에 남기지 않는다.
- 사용자 입력 검색어는 필요한 경우에도 최소한으로 다룬다.
- 오류 로그에는 request id, user id, domain id처럼 추적에 필요한 값만 남긴다.
- 지원/에러 신고 같은 보조 flow 실패는 핵심 업무 실패와 분리해 기록한다.
