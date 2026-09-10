# Observability Convention

- request id와 user id를 기준으로 문제를 추적한다.
- 인증 실패와 권한 실패는 구분해 기록한다.
- DB transaction 실패는 domain operation 단위로 기록한다.
- 지원/에러 신고 같은 보조 flow 실패는 사용자 핵심 업무 flow와 구분해 기록한다.
- 민감정보, 토큰, 긴 사용자 입력 원문은 로그에 남기지 않는다.
