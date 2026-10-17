# Sidebar section order and labels

## 상태

완료

## 작업 일자와 요청

- 2026-10-17
- 사이드바 순서를 즐겨찾기 → 업무 목록 → 관리 대상으로 변경한다.
- 빠른 업무를 즐겨찾기로, 관리 항목을 관리 대상으로 변경한다.
- 현재 요청 범위는 사이드바의 순서와 명칭이다.

## 관련 문서

- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/COMMENT_AND_LOGGING.md`
- `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`
- `AGENT/PM_AGENT/DECISIONS/022_goal_completion_review_todo_log.md`
- `TODO/SIDEBAR_AND_VIEW_USER_FLOW.md`

## 예정 범위

- `SidebarNav`의 섹션 순서와 관련 상태·주석을 정리한다.
- 한국어·영어 navigation 문구와 접근성 이름을 맞춘다.
- 기존 E2E의 사이드바 추가 버튼 선택자를 새 이름에 맞춘다.
- 사이드바 사용자 흐름 문서의 순서와 명칭을 맞춘다.

## 진행 기록

- 시작 시 작업 트리는 깨끗했고 main은 origin/main보다 2개 커밋 앞서 있었다.
- 세 섹션의 순서, 공통 접기/추가 버튼, Object 목록과 생성 모달 연결을 확인했다.
- 기존 번역 키는 유지하고 표시 문구를 변경해 호출부 호환성을 보존한다.
- 사이드바 순서를 즐겨찾기 → 업무 목록 → 관리 대상으로 변경했다.
- 한국어·영어 제목과 추가/열기/닫기 접근성 이름을 변경했다. 영어 명칭은 Favorites / Work Lists / Managed Items다.
- 기존 E2E의 추가 버튼 선택자를 navigation 안의 새 이름으로 맞추고 하단 버튼을 선택하도록 명확히 했다.
- 사용자 흐름 문서의 표·화면 예시·본문 명칭을 새 순서에 맞췄다.

## 변경 파일

- `FE/user-web/src/components/navigation/sidebar-nav.tsx`
- `FE/user-web/src/features/app-i18n/resources/ko-KR.ts`
- `FE/user-web/src/features/app-i18n/resources/en.ts`
- `FE/user-web/tests/e2e/create-object-definition-modal.spec.ts`
- `TODO/SIDEBAR_AND_VIEW_USER_FLOW.md`
- 이 작업 로그

## 검증 결과

- `pnpm -C FE/user-web typecheck`: 통과.
- `pnpm -C FE/user-web lint`: 통과.
- `pnpm -C FE/user-web test`: 10개 파일, 33개 테스트 통과.
- `pnpm -C FE/user-web build`: 통과. 500 kB 이상 chunk 크기 경고가 출력되었다.
- Playwright와 로컬 Chrome, 기존 E2E API mock을 사용한 브라우저 smoke: 한국어·영어 각각 섹션 순서, 세 섹션의 독립적인 접기/펼치기, 관리 대상 추가 모달 열기/닫기, Object 이동과 활성 표시 통과.
- 브라우저 확인용 API는 mock으로 처리했고 실제 DB에는 접속하지 않았다. 전체 E2E suite 실행 결과를 의미하지 않는다.
- 한국어 사이드바 캡처를 시각적으로 확인했다. 확인용 로컬 서버와 브라우저는 종료했다.
- `git diff --check`: 통과.
- 로컬 실행 환경은 Node 22.21.1 / pnpm 10.20.0이다. 저장소 선언 환경인 Node 24 / pnpm 8.14.1에서 검증한 결과와 구분한다.

## 검토 결과

- 요청한 사이드바 명칭과 순서를 반영했고 관련 문서와 기존 버튼 선택자를 맞췄다.
- 기존 관리 대상 데이터 조회, 이동, 생성 모달, loading skeleton과 접기/펼치기 연결을 유지했다.
- Backend, DB schema, API, 본문 View 기능 및 생성 모달의 입력 내용은 수정하지 않았다.
- 구현 완료 후 사용자의 명시적인 커밋 요청을 확인하고 위 6개 파일을 커밋 범위로 확정했다.
- 커밋 전 diff와 작업 로그를 재검토했고 `git diff --check`가 통과했다. 앞서 검증한 코드의 추가 변경은 없다.

## 남은 리스크·후속 범위

- 즐겨찾기 및 업무 목록 데이터/API 연결은 이번 요청의 구현 대상이 아니다.
- 대형 bundle 최적화는 별도 범위다.

## 전체 진행 현황과 다음 작업

- 이번 요청의 순서·명칭 변경과 관련 검증은 완료했다. 요청 범위의 미완료 작업은 없다.
- 다음 사이드바 기능 작업은 사용자 지시에 따라 진행한다.
