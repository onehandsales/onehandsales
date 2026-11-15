# View 컬럼 표시명 수정

2026-11-12: Backend API와 User Web TABLE 메뉴 연결 및 로컬 검증 완료. 운영 배포는 수행하지 않았다.

## 구현

- [API 계약](COMMON/API-SPEC/VIEW_COLUMN_LABEL_UPDATE_API.md): `PATCH /api/users/me/workspaces/:workspaceId/view-definitions/:viewDefinitionId/columns/:viewAttributeSettingDefinitionId`
- `{ "labelOverride": "예상 매출" }`로 현재 View의 표시명을 저장하고 `{ "labelOverride": null }`로 원본 속성 이름을 복원한다.
- View 모듈의 controller → use case → repository port → Prisma adapter 경계를 유지한다. Workspace 접근은 공개 port, transaction 시작과 멱등 판단은 application, 실제 View 잠금/저장은 infrastructure가 담당한다.
- DB 쓰기는 해당 표시 설정의 `labelOverride`, `updatedByActorId`, `updatedAt`에 한정한다. 원본 Attribute/Record/값/다른 View는 변경하지 않는다.
- API는 Object/List의 TABLE/KANBAN/LIST 표시 설정에 공통 적용한다. 이번 편집 UI는 관리항목·업무목록의 TABLE 화면에 연결했고 컬럼 생성 API는 기존 Object TABLE 범위를 유지했다.
- TABLE 헤더 메뉴에서 저장·취소·원본 이름 복원을 제공한다. 한글 조합 중 Enter, 중복 클릭, 실패 후 입력 유지, 저장 후 조회만 재시도, 다른 View 이동 후 늦은 응답을 처리한다.
- 본문·설정 캐시는 요청한 사용자/Workspace/View만 갱신한다. 오래된 페이지/cursor/token을 제거하며 첫 페이지를 다시 읽는다. 너비·순서·숨김은 기존 미리보기다.

## 검증 결과

- Backend 전체: **76 suites / 827 tests 통과**. 전용 로컬 PostgreSQL 17, `127.0.0.1:55442/onehandsales_label_test`에서 실제 Prisma/transaction/조회와 소속 격리·null 복원·감사 정보·멱등성·rollback을 검증했다.
- User Web 단위: 전체 18 files / 104 tests 통과 후 추가된 캐시 격리 테스트 1개도 통과(총 105개). API 입력/응답과 다른 사용자·Workspace·View 캐시 보존을 확인했다.
- Chromium: 신규 표시명 편집 5개 + 기존 본문 회귀 13개 통과. 저장 후 새로고침 유지, 복원, 페이지 커서 초기화, 오류 재시도, 한글 조합, 390px 모바일, 늦은 응답 격리를 포함한다. 브라우저는 제어된 API 응답을 사용했다.
- BE/User Web `typecheck`, `lint`, `build` 통과. `prisma:validate`, `git diff --check` 통과.
- 신규 테스트의 암호화 token 전체 동등성 비교와 반응형 숨김 화면 selector를 보정한 후 관련 테스트를 재실행해 통과했다.

## 환경·기존 안내

- 기본 로컬 DB(`localhost:5432`) 미실행으로 최초 DB 통합 테스트가 실패했다. 기존 Supabase에 쓰지 않고 새 임시 DB를 만들어 전체 재검증했다.
- 기존 migrations의 `20261016010000_align_view_schema_and_add_favorites`는 SQL 파일 없는 폴더다. 테스트 환경 구성 시 SQL이 있는 74개 migration을 임시 bundle로 복사해 적용했다. 저장소 migration/체크섬은 변경하지 않았다.
- Prisma의 기존 SetNull 관계 경고와 Frontend의 기존 큰 청크/Browserslist 안내는 남아 있다. 이번 변경에 스키마·migration·ENV 수정은 없다.
- 기존 서버와 운영 Supabase 데이터는 변경하지 않았다. 테스트용 DB 서버는 검증 후 종료했다. 운영 배포는 수행하지 않았다.
