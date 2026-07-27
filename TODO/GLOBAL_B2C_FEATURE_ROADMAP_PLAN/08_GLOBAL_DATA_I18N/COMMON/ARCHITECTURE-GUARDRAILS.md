# Architecture Guardrails

상태: Confirmed

## 1. 공통

- 08 구현은 `AGENT/UXUI_AGENT`와 `AGENT/SOFTWARE_AGENT` 기준을 따른다.
- 기존 한국 사용자 데이터와 기존 `/app/*` URL을 깨지 않는다.
- 기존 migration 파일을 수정하지 않는다.
- 공유/운영성 DB에 무단 migrate/seed를 실행하지 않는다.
- 코드 변경 시 한글 주석 규칙을 적용한다.

## 2. Frontend

- `/app` route에 locale prefix를 붙이지 않는다.
- public-site i18n 리소스에 app 업무 문구를 섞지 않는다.
- app i18n은 도메인별 namespace 구조를 사용한다.
- FE는 `/admin/api/*`를 호출하지 않는다.
- UTC ISO string을 화면에 그대로 노출하지 않는다.
- 긴 영어 문구가 버튼, 테이블, sidebar, dialog를 깨지 않게 한다.
- 로그인/회원가입 화면은 provider 버튼 영역만 변경한다.
- 신규/수정 component, hook, event handler, API client에는 `// 기능 : ...` 한글 주석을 둔다.

## 3. Backend

- API controller 메소드는 `// API : ...` 주석을 사용한다.
- Backend class/interface는 `// 역할 : ...` 주석을 사용한다.
- 내부 use case/service/repository/helper는 `// 기능 : ...` 주석을 사용한다.
- 긴 orchestration 메소드에는 numbered step comment를 둔다.
- mutation은 user ownership과 transaction 경계를 명확히 한다.
- provider raw error, token, secret, email 원문은 log에 남기지 않는다.
- 사용자 에러 응답은 `code`, `field`, safe message 중심으로 유지한다.

## 4. DB / Migration

- DB 변경 goal은 `BE/prisma/schema.prisma`, `BE/prisma/migrations`, `BE/prisma/seed.ts`를 먼저 확인한다.
- 기존 migration은 수정하지 않고 신규 migration을 추가한다.
- Prisma schema에는 새 모델/필드 의도를 설명하는 한글 `/// 기능 : ...` 주석을 남긴다.
- migration SQL에는 의도 주석 또는 COMMENT를 남긴다.
- 새 table을 만들면 table comment, column comment, 주요 index comment를 migration에 남긴다.
- 새 enum 값을 만들면 enum 용도와 runtime mapping을 같이 문서화한다.
- 기존 한국 데이터는 자동 migration 실패 시에도 삭제하지 않는다.
- enum 추가는 application mapping, seed, test까지 같이 갱신한다.

## 5. Auth

- Kakao는 runtime provider로 되살리지 않는다.
- Google, LINE, Apple만 노출한다.
- 버튼 노출 순서는 FE와 BE provider list가 일치해야 한다.
- 같은 verified email 연결은 lowercase 정규화 후 처리한다.
- email 없음 provider 응답은 가입/로그인 차단으로 처리한다.
- provider 설정 실패는 사용자에게 일반 실패 메시지로 보여준다.

## 6. Timezone

- DB는 UTC instant를 저장한다.
- API는 ISO string을 내려준다.
- FE는 사용자 timezone으로 변환한다.
- 날짜 전용 값은 timezone 변환하지 않는다.
- `timeZone`은 IANA timezone ID만 허용한다.

## 7. Import/Export

- Generic ExportJob을 새로 만들지 않는다.
- 기존 도메인별 export API를 locale-aware하게 보강한다.
- Import template locale 선택은 `ko-KR`, `en`만 1차 허용한다.
- Export 값은 사람이 읽기 쉬운 표시값과 재처리 가능한 기준값을 함께 제공해야 한다.
