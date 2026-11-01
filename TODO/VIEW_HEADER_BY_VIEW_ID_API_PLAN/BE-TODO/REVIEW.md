# Backend 구현 검토

2026-11-01. Frontend 연결 전에 Backend 규칙과 실제 실행을 검토한다.

- 모듈/계층: 기존 view-definition 안에서 Controller → UseCase → 공개 Query Port → Prisma adapter를 유지했다. application/domain의 Prisma·Supabase·ConfigService·Express 의존성 추가 없음.
- 소유권: WorkspaceAccessQuery와 Object/List Summary 공개 Port를 재사용한다. 다른 모듈의 Repository 직접 참조 없음.
- 공통화: 기존 헤더의 대상 요약과 일곱 필드 응답을 공통 reader/mapper로 옮겼다. 기존 constructor와 응답 type 재export를 유지해 대상 기준 첫 View 조회의 계약을 보존했다.
- 조회/권한: 멤버십을 View 조회보다 먼저 확인하고 인증으로 얻은 멤버 ID만 사용한다. 새 Repository 메서드는 View ID와 Workspace를 함께 제한하며 Favorite도 같은 Workspace/멤버로 제한한다.
- 도메인 보존: Actor 없는 읽기 허용, 실제 isFavorite 반환, 이중/무소속 FK 보존. View 부재를 첫 View나 null View 성공으로 대체하지 않는다.
- HTTP: 기존 AuthGuard·UUID Pipe·EmptyRequestPipe·공통 오류 Filter를 재사용한다. Query/Body는 없고 예약 키 포함 추가 입력을 거부한다.
- transaction/관측성: 기존 헤더와 같은 조회 전용이며 업무/이력 쓰기와 외부 Provider 호출을 추가하지 않았다. 기존 request/access/error 처리 외 개인정보·토큰·응답 원문 로그 추가 없음.
- 검증: 격리 PostgreSQL17.10을 포함한 전체70 suites/582 tests 통과, 실패·skip0. View 단건 정확성·Workspace/개인 Favorite 격리·이중 소속·UUID 대소문자를 실제 SQL로 검증했다. 임시 Workspace/User/View0건과 임시 DB 종료를 확인했다.
- 추가 검토: 실제 ViewDefinitionModule 조립에서 기존 헤더와 신규 단건 경로가 같은 공개 소유 Port를 거쳐 응답하는 HTTP 검증36개 통과.
- Backend typecheck/lint/build/Prisma validate 통과. 기존 SetNull 경고4개는 유지된다. 검토에서 미해결 항목이 없어 Frontend 연결을 시작한다. schema·migration·ENV·실제 업무 DB 변경 없음.
- Frontend 연결 후 실제 Supabase View24개를 컴파일한 새 헤더 UseCase와 공개 소유 Port로 읽어 요청 ID·타입 일치24개, 기존 본문24개·메뉴72개 정상 실행을 확인했다. 읽기 전용 검증이며 실제 인증 세션의 HTTP 검증과 구분한다. 로컬 Backend를 새 build로 재시작하고 health200·신규 경로 인증401을 확인했다.
