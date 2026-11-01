# Frontend 구현·검토

Backend 검토 문서의 통과 결과를 확인한 뒤 User Web 연결을 시작했다. Admin Web은 변경하지 않는다.

## 화면·API 연결

- `features/workspace` 공개 route helper와 router에 `/app/workspaces/:workspaceId/view-definitions/:viewDefinitionId`를 추가한다. SidebarNav는 이미 받은 viewDefinitionId로 이 경로를 사용하며 기존 SidebarDataRow/NavLink 스타일·선택 표시를 유지한다.
- AppShell의 기존 단일 헤더 모델에 View ID 진입을 연결한다. 단건 헤더와 대상 기준 헤더는 조건에 따라 하나만 조회한다. API client·AbortSignal·인증 refresh는 기존 구현을 사용한다.
- 새 headerByView key는 사용자·Workspace·View별로 분리하고 기존 headers prefix 아래에 둔다. 기존 하트 쓰기 성공 시 이 캐시에도 실제 isFavorite가 반영되며 sidebar refetch를 재사용한다.
- 같은 WorkspaceViewPage와 본문 Query/컴포넌트를 사용한다. TABLE·KANBAN·LIST와 검색·페이지·기존 직접 Record 수정/생성은 기존 API를 사용한다. 메뉴는 열 때만 기존 API로 조회한다.
- 다른 보기 선택은 직접 View route의 ID를 갱신한다. 새로고침·뒤로가기에도 같은 View를 복원하고 사용자/Workspace/View/소속 변경 시 검색·페이지·메뉴 임시 상태를 기존 scope로 격리한다.
- 단일 소속은 자동으로 열고, 이중 소속은 실제 대상 이름을 표시해 열 위치를 선택하게 한다. sourceType은 Frontend URL에만 보존하며 새 헤더 GET에 보내지 않는다. 잘못된/중복 sourceType과 응답에 없는 소속은 본문 조회 전에 차단한다.
- 무소속은 View 헤더 정보를 보존한 안내와 재시도를 표시한다. 404/잘못된 응답은 기존 오류 UX를 사용하고 기본 View를 요청하지 않는다. 현재 대상이 확정되기 전의 조회/쓰기 도구는 비활성 상태다.

## 규칙 검토

- feature 외부는 공개 index를 사용한다. 새 UI 문구는 ko-KR/en 리소스에 두며 내부 원본 식별자·JSON을 사용자 화면에 노출하지 않는다.
- 공통 API client 밖의 직접 fetch, Backend 타입·Prisma 의존성, console 로그, 임의 즐겨찾기 PK 생성은 추가하지 않았다.
- 신규/수정 함수·이벤트·hook·API 요청·탐색 흐름에 기능·번호 주석을 둔다. 기존 38px 헤더·팝업 폭·표/카드 스타일을 유지한다.
- 단건 헤더 응답은 요청 View ID·필수 필드·소속 요약을 확인하고 이중/무소속은 보존한다. 늦은 응답은 query key와 취소 신호로 격리한다.

## 검증

- 전체 단위 테스트17 files/94 tests, 타입 검사(build 포함)·lint·production build 통과.
- 신규 브라우저 테스트는 등록→사이드바 클릭→비기본 View의 최초 본문, Object 표 검색, LIST URL 복원·보기 전환·뒤로가기, 이중/무소속, 404·응답 불일치, 늦은 응답, 하트 해제, 메뉴 조회 시점과 모바일을 검증한다.
- Desktop/390px 모바일 공통 헤더·본문 캡처를 확인했다. React 개발 모드의 취소된 초기 요청과 실제 성공 요청을 구분하고 반응형 전환 자체가 헤더를 다시 조회하지 않는지 확인한다.
- 기존 본문·헤더·메뉴·하트 쓰기를 포함한 Chromium 회귀64개가 모두 통과했다. 신규 즐겨찾기 진입11개와 기존53개를 함께 실행했다.
- 검증을 마친 Backend build로 로컬 서버를 재시작했다. health200과 신규 경로의 인증 없는 요청401을 확인했다. User Web5173/Admin Web5174는 기존 서버를 유지한다.
- Supabase 실제 View24개(TABLE18/KANBAN2/LIST4)에 새 헤더 UseCase와 공개 소유 Port를 적용한 읽기 전용 검증에서 정확한 헤더24개·기존 본문24개·메뉴72개가 모두 통과했다. 실제 로그인 세션을 사용한 브라우저 검증과 구분한다. ENV 파일 해시와 업무 DB 데이터는 변경하지 않았다.
