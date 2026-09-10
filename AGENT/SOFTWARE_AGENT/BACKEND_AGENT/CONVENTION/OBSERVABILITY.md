# Observability Convention

- request id와 user id를 기준으로 문제를 추적한다.
- 인증 실패와 권한 실패는 구분해 기록한다.
- DB transaction 실패는 domain operation 단위로 기록한다.
- 제품 분석 이벤트 수집 실패는 사용자 핵심 업무 flow와 분리한다.
- 민감정보, 토큰, 긴 사용자 입력 원문은 로그에 남기지 않는다.
