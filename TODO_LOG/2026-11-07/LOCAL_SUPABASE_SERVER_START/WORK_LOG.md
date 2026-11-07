# Supabase 연결 로컬 서버 구동

- 작업 일자: 2026-11-07
- 상태: 완료 — 세 개발 서버 실행 중
- 요청: ENV 값을 변경하지 않고 Docker 없이 Backend와 User/Admin Web을 기존 Supabase에 연결해 실행한다.
- 관련 기준: `BE/AGENTS.md`, `AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md`, `AGENT/PM_AGENT/DECISIONS/022_goal_completion_review_todo_log.md`

## 범위와 진행 기록

- 시작 시 Git 작업 트리는 깨끗했다.
- 3000, 5173, 5174 포트에 실행 중인 서버가 없음을 확인했다.
- 세 앱의 기존 ENV 파일 존재와 해시를 확인했다. 비밀값은 기록하지 않는다.
- Backend DB URL은 원격 Supabase를 가리키고, Frontend API URL은 로컬 Backend를 가리킨다.
- 기본 Node는 22이므로 이미 설치된 Node 24를 서버 프로세스 실행에 사용한다.
- ENV 파일 및 앱 설정 변경, Docker 실행, migration, seed는 범위에 포함하지 않는다.

## 실행 결과

- 기존 Node v24.21.0과 pnpm 10.20.0으로 각 앱의 개발 스크립트를 실행했다. 의존성 설치·버전 변경은 없었다.
- Backend: `fnm exec --using=24.21.0 pnpm run start:dev`, 포트 3000, PID 39545, 실행 세션 47592.
- User Web: `fnm exec --using=24.21.0 pnpm run dev -- --strictPort`, 포트 5173, PID 39415, 실행 세션 53557.
- Admin Web: `fnm exec --using=24.21.0 pnpm run dev -- --strictPort`, 포트 5174, PID 39465, 실행 세션 11871.
- Backend watch compilation 오류 0개 및 Nest 시작 완료를 확인했다.

## 검증 결과

- Backend `/api/health`와 `/api/auth/providers`: HTTP 200.
- User Web `/`, Admin Web `/login`: HTTP 200.
- User Web origin의 API preflight: HTTP 204, origin·credentials 허용 확인.
- 기존 ENV로 Prisma `SELECT 1` 읽기 전용 쿼리 성공: 원격 Supabase DB 연결 확인.
- Backend 인증 issuer와 User Web Supabase URL의 프로젝트 일치 확인.
- Supabase JWKS와 인증 settings endpoint: HTTP 200 및 응답 구조 확인.
- 최초 Playwright 검증은 전용 브라우저 실행 파일이 없어 실행하지 못했다. 추가 설치 없이 기존 Google Chrome을 사용해 재검증했다.
- Chrome headless에서 User Web `/ko/login`, Admin Web `/login` 렌더링 성공, page error 0개, 두 화면에서 Backend health fetch HTTP 200.
- 세 앱 ENV 파일의 실행 전후 SHA-256 해시가 모두 일치했다.
- Docker, migration, seed 및 DB 데이터 쓰기는 실행하지 않았다.
- 소스·설정 파일을 변경하지 않았으며 저장소 변경은 이 작업 로그뿐이다.

## 검토와 남은 범위

- 요청한 서버 실행과 기존 Supabase 연결 확인을 완료했고 세 프로세스를 실행 상태로 유지했다.
- 실제 사용자 OAuth 로그인·로그인 후 업무 기능은 이번 구동 검증 범위에서 실행하지 않았다.
- 접속 주소: User Web `http://localhost:5173`, Admin Web `http://localhost:5174`, Backend `http://localhost:3000`.
- 다음 작업: 사용자가 로컬 화면에서 서비스 방향성 검토를 이어갈 수 있다.
