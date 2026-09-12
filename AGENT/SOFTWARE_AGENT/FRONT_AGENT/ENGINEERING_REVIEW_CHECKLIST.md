# Frontend Engineering Review Checklist

- TypeScript 오류가 없는가?
- lint 오류가 없는가?
- 새로 작성하거나 수정한 component/function/hook/API client function에 `// 기능 : ...` 한글 주석이 있는가?
- 로그인, refresh, redirect, API 호출, storage 복원 같은 주요 흐름이 `// 1. ...`, `// 2. ...` numbered step comment로 읽히는가?
- 주석이 함수명 번역이 아니라 사용자 행동, 상태 전환, 처리 의도를 설명하는가?
- route와 navigation이 현재 활성 기능만 노출하는가?
- access token 만료/복구 흐름이 깨지지 않는가?
- 후속 list query key에는 검색, 필터, 정렬, 페이지가 포함되는가?
- mutation 이후 관련 query invalidate가 충분한가?
- 현재 활성 route가 `/app`과 `/app/more` 중심으로 유지되는가?
- 고정형 Contact/Product/Deal route가 현재 의도대로 `/app`으로 redirect되는가?
- 후속 CRM Core 화면을 추가할 때 Kit/Workspace/Record 구조를 따르는가?
- CRM Core query key에 workspace, object/view, page, search, filter, sort 같은 화면 상태가 포함되는가?
- Record 생성 후 list/detail/workspace summary invalidate가 충분한가?
- FE가 API에 없는 최근 활동, 상태, 관계 값을 임의 데이터처럼 꾸미지 않는가?
- 모바일 viewport에서 주요 버튼과 텍스트가 겹치지 않는가?
- E2E smoke가 현재 route 기준으로 갱신되어 있는가?
