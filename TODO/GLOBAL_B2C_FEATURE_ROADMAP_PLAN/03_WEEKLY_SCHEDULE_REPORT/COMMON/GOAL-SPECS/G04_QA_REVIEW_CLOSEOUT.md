# G04 QA Review Closeout

상태: Ready

## 1. 목적

03 Weekly Schedule Report가 Global B2C 첫 판매 전 반복 사용 루프 기능으로 안전하게 닫혔는지 검증하고, 구현 결과와 문서를 맞춘다.

## 2. 선행 조건

- G01 Backend Weekly Report API 완료
- G02 Backend Weekly Report Xlsx Export 완료
- G03 User Web Weekly Report UX 완료
- `COMMON/ARCHITECTURE-GUARDRAILS.md` 기준을 확인한다.
- `COMMON/GLOBAL-B2C-ALIGNMENT-REVIEW.md` 기준을 확인한다.

## 3. 포함 범위

- Backend validation, lint, test, build
- User Web typecheck, lint, build, E2E
- API spec 정합성 확인
- ownership isolation 확인
- timezone/weekStart QA
- 다일 일정 QA
- Excel 다운로드 QA
- 보안/민감정보 노출 확인
- 모바일 390px/360px 확인
- 문서와 구현 결과 정합성 점검
- `COMMON/REVIEW-CHECKLIST.md` 기준 검토
- 새 DB 구조/migration 미생성 확인
- DB 관련 코드/문서 한글 주석 확인
- `AGENT/SOFTWARE_AGENT` 아키텍처 기준 확인
- `AGENT/UXUI_AGENT` UX/UI 기준 확인
- Global B2C first-sale gate 포함/제외 범위 확인

## 4. 제외 범위

- `/api/exports` QA
- `ExportJob` QA
- `/app/export` QA
- PDF QA
- 반복 일정 QA
- 제품 요약 QA
- AI 주간 리포트 QA
- 민감정보 포함 export QA

## 5. 수동 QA 시나리오

```text
1. 일정 없는 주 조회 -> 7개 날짜와 empty state 확인
2. 월요일 weekStart 조회 -> 200, summary/days 확인
3. 월요일이 아닌 weekStart 조회 -> 400 확인
4. invalid timeZone 조회 -> 400 확인
5. 월요일 23:00~화요일 01:00 일정 -> 월/화 day bucket 모두 표시 확인
6. 연결 딜 있는 일정 -> 딜 단계/금액/마감일/회사/담당자/다음 행동 표시 확인
7. deleted deal 연결 일정 -> deleted deal 제외 확인
8. 다른 사용자 일정/딜 -> response에 섞이지 않음 확인
9. 일정 메모 있는 일정 -> hasMemo만 표시되고 본문 미노출 확인
10. Excel 다운로드 -> 파일명/header/row 확인
11. Excel row -> ID/private memo/meeting note body 미포함 확인
12. `/app/schedules/week` 모바일 390px/360px 확인
13. `/app/schedules` 진입 버튼 -> 주간 보고서 이동 확인
14. 새 Prisma model/table/column/index/migration 없음 확인
15. DB 관련 repository/projection 코드와 문서의 한글 주석 확인
16. Backend/Frontend 구조가 `AGENT/SOFTWARE_AGENT` 기준과 맞는지 확인
17. UX/UI와 사용자 문구가 `AGENT/UXUI_AGENT` 기준과 맞는지 확인
18. 결제/Admin/앱 전체 다국어/통화 모델/제품 분석이 03 구현에 섞이지 않았는지 확인
19. 날짜/시간/금액 표시가 기존 formatter 또는 `Intl` 기준인지 확인
```

## 6. 검증 명령

Backend:

```powershell
cd BE
pnpm run prisma:validate
pnpm run typecheck
pnpm run lint
pnpm run test -- schedule
pnpm run build
```

User Web:

```powershell
cd FE/user-web
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run test:e2e
```

## 7. 완료 기준

- Backend/User Web 검증 명령이 통과한다.
- 핵심 수동 QA가 통과한다.
- `GET /api/schedules/week`와 xlsx export가 API spec과 일치한다.
- cross-user 데이터가 response/export에 섞이지 않는다.
- 일정 메모 본문, private memo, meeting note body가 response/export/log에 노출되지 않는다.
- `/app/export`, `/api/exports`, PDF, 반복 일정이 03 구현에 섞이지 않았다.
- 새 DB 구조와 migration이 생기지 않았다.
- DB 관련 구현 또는 문서 변경에는 한글 주석이 있다.
- Backend/DB/Frontend 구조가 `AGENT/SOFTWARE_AGENT` 기준과 일치한다.
- UX/UI와 사용자 노출 문구가 `AGENT/UXUI_AGENT` 기준과 일치한다.
- Global B2C 대조 결과가 `COMMON/GLOBAL-B2C-ALIGNMENT-REVIEW.md`와 일치한다.
- `NBA-009` 외 다른 NBA 후보가 03 구현에 섞이지 않았다.
- 구현 결과가 API/DB/FE 문서와 다르면 문서를 갱신한다.
- QA 결과를 TODO_LOG에 남긴다.
