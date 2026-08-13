# User Web QA

## 1. 목적

`FE/user-web`에서 실제 사용자가 핵심 CRM 업무를 끝까지 수행할 수 있는지 확인한다.

## 2. 자동 검증

```powershell
cd D:\workspace_repository\onehandsales\FE\user-web
pnpm.cmd run typecheck
pnpm.cmd run lint
pnpm.cmd run build
pnpm.cmd run test:e2e
pnpm.cmd run test:e2e:mobile
pnpm.cmd run test:e2e:browsers
pnpm.cmd run test:e2e:analytics
```

## 3. Playwright 확인 항목

- Google/LINE/Apple provider button exposure, popup/redirect fallback, and provider smoke result or environment N/A 기록
- protected route redirect
- 회사/담당자/제품/딜/일정/회의록 smoke flow
- API authorization header 누락 없음
- mobile browser QA spec
- browser compatibility QA spec
- analytics route spec
- console error와 민감 정보 노출 없음

## 4. 실제 BE 통합 QA 항목

### 인증/라우팅

- 비로그인 `/app/*` 접근 시 login으로 이동한다.
- 로그인 후 `/app/companies` 또는 기본 앱 화면으로 이동한다.
- 로그아웃 후 보호 라우트 재접근이 차단된다.
- token이 URL query에 노출되지 않는다.

### 회사

- 회사 생성
- 목록 조회
- 상세 조회
- 수정
- 삭제
- Trash에서 복구
- 복구 후 검색/목록에 다시 노출

### 담당자

- 담당자 생성
- 회사 연결
- 목록/상세 조회
- 수정
- 삭제/복구
- 연락처 email/phone 긴 값 표시 깨짐 없음

### 제품

- 제품 생성
- 가격/카테고리/상태 표시
- 목록/상세 조회
- 수정
- 삭제/복구
- XLSX 다운로드 가능 여부

### 딜

- 딜 생성
- 회사/담당자/제품 연결
- 금액, 상태, 예상 마감일 표시
- 상태 변경
- following action 생성/완료
- 상세 패널 또는 상세 화면 이동
- 삭제/복구

### 일정

- 일정 생성
- local date-time과 timeZone 처리
- 딜 연결
- 월/주/목록 화면 표시
- 수정/삭제
- Google Calendar 연결 상태 화면 확인

### 회의록

- 수동 회의록 생성
- 회사/담당자/제품/딜 연결
- 회의록 상세 조회
- 딜 활동으로 연결되는지 확인
- 수정/삭제/복구

### 명함 OCR

- 이미지 업로드 진입
- OCR 진행/실패/성공 상태 표시
- 결과 수정 후 회사/담당자 저장
- provider failure가 사용자에게 안전한 메시지로 표시

### Import

- 회사/담당자/제품/딜 템플릿 다운로드 또는 업로드 진입
- 미리보기
- validation error 표시
- row 수정
- 확정 저장
- 저장 후 각 도메인 목록에서 조회

### Search

- 전역 검색 UI 열림
- 회사/담당자/제품/딜/회의록 결과 표시
- 결과 클릭 시 상세 이동
- 삭제된 데이터가 일반 검색에 노출되지 않음

### Trash

- 삭제 항목 목록 표시
- domain 필터
- 상세 조회
- 복구
- 복구 불가능/만료 상태 표시

### Settings

- 프로필 조회/수정
- 기기 목록 조회
- locale/timeZone 표시
- 로그아웃

## 5. 모바일/UX 확인 항목

Viewport:

- 390px x 844px
- 360px x 740px
- Desktop 1440px x 1000px
- Browser zoom 125%

확인:

- bottom navigation이 주요 앱 화면에서만 보인다.
- dialog가 화면 밖으로 넘치지 않는다.
- form 저장 버튼을 키보드가 가리지 않는다.
- table/list가 모바일에서 읽을 수 있는 card/list로 전환된다.
- 긴 회사명, email, phone, URL이 부모 영역을 깨지 않는다.
- icon-only button에 label 또는 tooltip이 있다.
