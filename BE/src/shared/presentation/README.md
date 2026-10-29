# Shared Presentation

여러 모듈이 공유하는 HTTP 요청·응답 경계의 구성 요소를 둔다.

정본은 [Shared Presentation Architecture](../../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/ARCHITECTURE/SHARED_PRESENTATION.md)다. 책임, 등록 위치, 요청 흐름, 전역 ValidationPipe와 공통 EmptyRequestPipe 사용법, 검증 기준을 먼저 참고한다.

| 폴더 | 현재 역할 |
| --- | --- |
| `guards` | AuthGuard / AdminGuard |
| `decorators` | 인증된 CurrentUserContext 추출 |
| `middleware` | 요청 ID 생성·전달 |
| `pipes` | 추가 입력이 없는 Query/Body 검증 |
| `filters` | 공통 HTTP 오류 응답 변환 |
| `http` | 파일 다운로드 응답 helper |

도메인별 DTO는 각 모듈의 presentation에, Workspace 접근과 비즈니스 규칙은 application에 둔다. 공통 폴더라는 이유로 application/domain에서 Nest·Express 경계를 가져오지 않는다.
