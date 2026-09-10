# Frontend Engineering Review Checklist

- TypeScript 오류가 없는가?
- lint 오류가 없는가?
- route와 navigation이 현재 활성 기능만 노출하는가?
- access token 만료/복구 흐름이 깨지지 않는가?
- list query key에 검색, 필터, 정렬, 페이지가 포함되는가?
- mutation 이후 관련 query invalidate가 충분한가?
- 회사/담당자/제품/딜 생성 flow가 `/new`와 `/new/full` 양쪽에서 동작하는가?
- 딜 다음 행동과 활동 로그 UI가 상태 변경 후 즉시 갱신되는가?
- 모바일 viewport에서 주요 버튼과 텍스트가 겹치지 않는가?
- E2E smoke가 현재 route 기준으로 갱신되어 있는가?
