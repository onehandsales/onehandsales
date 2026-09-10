# Error Handling Notes

이 문서는 현재 서비스의 공통 오류 처리 원칙만 기록한다.

## 기본 원칙

- 사용자 화면에는 provider, quota, billing, API key, stack trace를 노출하지 않는다.
- 사용자에게는 짧고 행동 가능한 일반 안내만 보여준다.
- 서버 로그에는 원인 분류에 필요한 최소 메타데이터만 남긴다.
- 외부 provider 장애는 앱 전체 실패가 아니라 해당 기능 실패 상태로 격리한다.
