# G01 Document Contract Sync

상태: Done

## 1. 목적

10번 Mobile/PWA Field Use 문서, API 계약, BE/FE TODO, 체크리스트를 구현 가능한 기준으로 동기화한다.

## 2. 포함 범위

- 10번 공통 문서 정리
- API-SPEC 작성
- GOAL-SPECS 작성
- BE-TODO/FE-TODO 갱신
- Software/UXUI Agent 준수 검토 문서 작성

## 3. 제외 범위

- 실제 BE/FE 코드 구현
- Prisma migration 실행
- native iOS/Android app 구현
- PWA install/offline shell 구현

## 4. Request 계약

서버 API request 변경 없음.

문서 request:

```ts
type GoalDocumentSyncRequest = {
  sourcePlans: [
    "NEXT_BACKEND_API_BACKLOG_PLAN",
    "USER_WEB_PRODUCTIZATION_GAP_PLAN",
    "GLOBAL_B2C_FEATURE_ROADMAP_PLAN/09_PRODUCT_ANALYTICS"
  ];
  targetPlan: "GLOBAL_B2C_FEATURE_ROADMAP_PLAN/10_MOBILE_PWA_FIELD_USE";
  decisions: "confirmed";
};
```

## 5. Response 계약

서버 API response 변경 없음.

문서 완료 response:

```ts
type GoalDocumentSyncResult = {
  apiSpecsCreated: string[];
  goalSpecsCreated: string[];
  checklistsCreated: string[];
  todoDocsUpdated: string[];
  softwareAgentReviewed: boolean;
  uxuiAgentReviewed: boolean;
};
```

## 6. Backend Business Logic

G01은 backend runtime logic을 구현하지 않는다.

단, 이후 goal이 따라야 할 backend business logic 기준을 문서에 고정한다.

- BusinessCard OCR 실패는 safe error fields로 저장한다.
- MeetingNote STT draft는 기존 API를 재사용한다.
- Local draft는 DB에 저장하지 않는다.
- Notification은 기존 02 API를 재사용한다.
- ProductAnalytics는 09 collector/recorder를 재사용한다.

## 7. User Flow

G01은 사용자 화면을 구현하지 않는다.

문서에 고정해야 하는 사용자 흐름:

- 모바일 명함 촬영/업로드
- OCR 실패 재시도/수동 입력
- 모바일 회의 녹음/file upload fallback
- 24h local draft restore prompt
- 명시적 클릭 기반 browser push permission

## 8. DB/Prisma 영향

G01은 DB를 변경하지 않는다.

문서에 명시해야 하는 DB 기준:

- G02에서만 `BusinessCardScanLog` safe failure fields migration을 만든다.
- `UserDraft`는 만들지 않는다.
- `ProductAnalyticsEvent`는 기존 model을 재사용한다.
- `UserNotificationSetting`, `BrowserPushSubscription`은 기존 model을 재사용한다.

## 9. 코드 주석 기준

G01은 코드 수정이 없으므로 코드 주석 변경도 없다.

문서에는 이후 goal에서 사용할 Backend/Frontend 한국어 주석 기준을 포함한다.

## 10. 검증

권장 command:

```powershell
rg --files TODO\GLOBAL_B2C_FEATURE_ROADMAP_PLAN\10_MOBILE_PWA_FIELD_USE
rg -n "Request 계약|Response 계약|Backend Business Logic|User Flow|DB/Prisma|Goal 검토 체크리스트" TODO\GLOBAL_B2C_FEATURE_ROADMAP_PLAN\10_MOBILE_PWA_FIELD_USE\COMMON\GOAL-SPECS
rg -n "safeErrorCode|UserDraft|Notification.requestPermission|MediaRecorder|capture=\"environment\"" TODO\GLOBAL_B2C_FEATURE_ROADMAP_PLAN\10_MOBILE_PWA_FIELD_USE
```

## 11. Goal 검토 체크리스트

- [x] `COMMON/API-SPEC`에 5개 contract가 있다.
- [x] G01~G07 goal 문서가 있다.
- [x] 모든 goal 문서에 request/response/backend business logic/user flow/DB 항목이 있다.
- [x] BE-TODO와 FE-TODO가 확정 결정사항을 반영한다.
- [x] Software Agent review 문서가 있다.
- [x] UXUI Agent 기준이 review/checklist에 반영되어 있다.
- [x] UX/UI 기준 확인 경로로 `AGENT/UXUI_AGENT`가 명시되어 있다.
- [x] Software/architecture 기준 확인 경로로 `AGENT/SOFTWARE_AGENT`가 명시되어 있다.
- [x] Global B2C 개인 영업자 모바일 현장 업무 target이 문서에 명시되어 있다.
- [x] DB 추가/생성 시 Prisma 한국어 주석과 migration SQL COMMENT를 확인하도록 문서화되어 있다.
- [x] 코드 작성 시 한국어 주석 기준을 확인하도록 문서화되어 있다.
- [x] G02에서만 DB migration이 필요하다고 명시되어 있다.
- [x] local draft는 DB/server draft가 아니라고 명시되어 있다.

## 12. 실행 결과

- 완료일: 2026-07-31
- 검토 횟수: 2회
- 코드 변경: 없음. G01은 문서 계약 동기화 goal이므로 Backend/Frontend runtime 코드를 수정하지 않았다.
- 코드 주석: 신규 코드가 없어 적용 대상 없음. 이후 G02~G07에서 새로 만들거나 의미 있게 수정하는 공개 함수/핵심 함수에는 Backend `역할/API/기능`, Frontend `// 기능 : ...` 한국어 주석 기준을 적용하도록 문서에 고정되어 있다.
- UX/UI 기준: `AGENT/UXUI_AGENT` 기준 경로가 `GOAL-WORK-ORDER`, `REFERENCES`, `PLANNING-REVIEW`, `UXUI-AGENT-REVIEW`, goal별 checklist에 명시되어 있음을 확인했다.
- Software 기준: `AGENT/SOFTWARE_AGENT` 기준 경로가 `GOAL-WORK-ORDER`, `REFERENCES`, `PLANNING-REVIEW`, `SOFTWARE-AGENT-REVIEW`, goal별 checklist에 명시되어 있음을 확인했다.
- DB 기준: `BE/prisma/schema.prisma`, `BE/prisma/migrations`, `BE/prisma/seed.ts` 확인 경로와 G02 전용 `BusinessCardScanLog` safe failure migration 기준이 문서화되어 있음을 확인했다.

검증 command:

```powershell
rg --files TODO\GLOBAL_B2C_FEATURE_ROADMAP_PLAN\10_MOBILE_PWA_FIELD_USE
rg -n "Request 계약|Response 계약|Backend Business Logic|User Flow|DB/Prisma|Goal 검토 체크리스트" TODO\GLOBAL_B2C_FEATURE_ROADMAP_PLAN\10_MOBILE_PWA_FIELD_USE\COMMON\GOAL-SPECS
rg -n "safeErrorCode|UserDraft|Notification.requestPermission|MediaRecorder|capture=\"environment\"" TODO\GLOBAL_B2C_FEATURE_ROADMAP_PLAN\10_MOBILE_PWA_FIELD_USE
Get-ChildItem TODO\GLOBAL_B2C_FEATURE_ROADMAP_PLAN\10_MOBILE_PWA_FIELD_USE\COMMON\API-SPEC -File -Filter "*_CONTRACT.md"
Get-ChildItem TODO\GLOBAL_B2C_FEATURE_ROADMAP_PLAN\10_MOBILE_PWA_FIELD_USE\COMMON\GOAL-SPECS -File -Filter "G*.md"
Get-ChildItem BE\prisma -Force
```

검증 결과:

- API contract는 README 제외 5개로 확인했다.
- Goal 문서는 G01~G07 총 7개로 확인했다.
- 모든 G01~G07 문서에 request, response, backend business logic, user flow, DB/Prisma, goal checklist 섹션이 있음을 확인했다.
- `safeErrorCode`, `UserDraft` 금지, `Notification.requestPermission`, `MediaRecorder`, `capture="environment"` 기준이 10번 문서 전반에 반영되어 있음을 확인했다.
- `BE/prisma`에는 `schema.prisma`, `migrations`, `seed.ts`가 존재함을 확인했다.
- G01 범위는 문서 동기화라 BE/FE test와 Prisma migration은 실행 대상이 아니다.
