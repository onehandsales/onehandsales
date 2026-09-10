# Admin Web / User Web TODO

> 2026-09-11 문서 정리: 현재 BE/FE 기준과 충돌하는 과거 모델/API/페이지/부수 기록 언급은 제거했다.

상태: Implemented / G04 Closeout Confirmed


## 1. Admin Web 구현 route

| Goal | Route | 화면 | 핵심 UI |
|---|---|---|---|
| G02 | `/audit-logs` | 감사 로그 | table, filter, detail drawer |
| G03 | `/users` | 사용자 목록 | search, status filter, country/locale filter, pagination |
| G03 | `/users/:userId` | 사용자 상세 | summary metrics, recent activity timeline, masked profile |
| G04 | `/users/:userId/domain` | 도메인 read-only 탭 | domain tabs, table, detail side panel |
| G06 | `/provider-failures` | Provider failure | provider/type/status filters, safe detail |
| G07 | `/analytics` | 운영 분석 요약 | activation, retention, core events, AI usage |
| G08 | `/account-requests` | 계정/데이터 요청 | deletion/export queue |
| G09 | `/system` | 운영 gate | migration/backup/provider smoke checklist |

## 2. Admin Web UX 기준

- `AGENT/UXUI_AGENT/DECISIONS/014_uxui_admin_tone.md`를 따른다.
- 정보 밀도 높은 table/filter/detail panel 중심으로 만든다.
- 장식적 hero/card layout을 만들지 않는다.
- 위험 action은 확인 modal과 reason field를 사용한다.
- 민감정보는 기본 masked 상태로 보여준다.
- 긴 email/name/provider message가 table을 깨지 않게 truncate + tooltip/detail drawer를 사용한다.
- Admin copy는 짧고 명확하게 쓴다.
- 버튼은 `조회`, `필터`, `닫기`, `사유 입력`, `요청 보기`처럼 행동형으로 쓴다.

## 3. Admin Web 기술 기준

- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/ADMIN_WEB.md`를 따른다.
- `FE/admin-web/src/lib/admin-api-client.ts`만 사용한다.
- Query Key는 `['admin', ...]`로 시작한다.
- User Web feature/API client를 import하지 않는다.
- `/api/*` 일반 User API를 Admin Web에서 호출하지 않는다.
- API response, table row, filter, form payload type을 명시한다.
- Zod 또는 명시 타입으로 reason form을 검증한다.
- 신규/수정 코드에는 필요한 위치에 `// 기능 : ...` 주석을 추가한다.

## 4. User Web 영향 구현 상태

| Goal | Route | 변경 |
|---|---|---|
| G08 | `/app/settings` | 데이터 export 요청, 계정 삭제 요청, 취소 flow |

## 5. User Web 금지

- User Web에서 `/admin/api/*`를 호출하지 않는다.
- 계정 삭제 flow에 결제/구독 상태를 섞지 않는다.

## 6. 검증 후보

```powershell
cd FE/admin-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
```

User Web 영향 goal에서만:

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
```
