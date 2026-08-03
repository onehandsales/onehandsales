# First-sale Gate Map

상태: Gate Baseline / 11 반영
기준일: 2026-08-03

## 1. 목적

이 문서는 `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`과 `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN`에 있는 최종 방향 중, 01~12 기능 순서만으로는 약하게 반영될 수 있는 first-sale gate를 Global roadmap에 고정한다.

아래 항목은 독립 기능이라기보다 Global B2C 첫 판매 전 반드시 확인해야 하는 횡단 기준이다.

이 문서는 UX/UI 전체 polish 계획이 아니다. 기능 로드맵이 진행되는 동안 빠지기 쉬운 DB/보안/정책/업무 흐름 gate를 추적한다.

## 2. Gate 목록

| Gate | 원본 기준 | Global 반영 | 완료 기준 |
|---|---|---|---|
| DB/Prisma 운영 gate | `NBA-014`, `RQA-005`, release blocker | 11에서 system operation gate 구현 완료. 단 신규 Prisma migration이 있는 모든 goal의 선행 체크로 계속 적용 | DB target, migration status, Prisma generate, seed 정책, rollback/backup 영향이 확인됐다. 공유/운영성 DB에 무단 migrate를 실행하지 않는다. |
| Product UX first-sale gate | `USER_WEB_PRODUCTIZATION_GAP_PLAN` Product UX | 01~11 기능 closeout 이후, 첫 판매 전 별도 QA checklist로 적용 | 회사, 담당자, 제품, 딜, 일정, 회의록, 명함, import, search, trash, export, account/data request 영향 흐름이 반복 업무 도구처럼 이어진다. |
| Trust/policy first-sale gate | 약관, 개인정보, 보안, 환불, 계정 삭제, 데이터 export/delete, 보관 기간 | 정책은 11/12, 파일 job 기반은 03과 연결. 첫 판매 전 하나의 checklist로 닫는다 | 판매 국가 기준 약관/개인정보/환불/세금/계정 삭제/데이터 export/delete/retention 정책이 Backend 데이터 처리 기준과 충돌하지 않는다. |
| Trash private memo response gate | `NBA-007` | 11의 Trash/삭제 정책에 포함하되 별도 보안 항목으로 추적 | Trash list/detail/restore 관련 Backend response에서 private memo 원문 노출 여부가 명확히 제한된다. FE 숨김만으로 완료 처리하지 않는다. |

2026-08-01 반영:

- 08 Global Data I18N 구현과 QA closeout은 완료됐다.
- 현재 `BE/.env` 연결 DB는 `pnpm.cmd exec prisma migrate status` 기준 최신 상태다.
- 2026-07-29 사용자 확인 기준 LINE/Apple 실제 OAuth provider 연결과 smoke가 완료됐다.
- 09 Product Analytics 구현과 QA closeout은 완료됐다. Product analytics raw event, route/server event, activation/retention snapshot, AI usage summary foundation은 첫 판매 전 gate에서 닫힌 상태로 본다.
- 10 Mobile PWA Field Use 구현과 QA closeout은 완료됐다. 모바일 명함 촬영, OCR safe failure, 회의 녹음, local draft, browser push permission UX, mobile field analytics는 first-sale Product UX gate에서 닫힌 상태로 본다.
- 11 Admin Operation 구현과 QA closeout은 완료됐다. Admin analytics UI/API, provider failure 운영 조회, Trash/account request/system gate, audit/redaction은 첫 판매 전 운영 gate에서 닫힌 상태로 본다.
- billing/paywall/churn 실제 conversion source와 결제/구독/세금 운영은 12에서 연결한다.
- 12 완료 후에는 `COMMON/POST-12-REVIEW-AND-FOLLOWUP.md` 기준으로 01~12 전체와 입력 계획 2개를 다시 대조하고, first-sale gate에 남은 항목을 새 TODO로 승격한다.

## 3. DB/Prisma 운영 Gate 적용 규칙

`NBA-014`는 11 Admin/Ops 상세 구현에서 system operation gate로 닫혔다. 다만 신규 migration이 생기는 향후 goal에서는 계속 선행 조건으로 적용한다.

다음 작업은 `/goal` 착수 전 `NBA-014` 체크를 선행 조건으로 둔다.

- Prisma schema 변경
- 신규 migration 생성
- seed/generate 정책 변경
- 운영성 DB 또는 공유 DB에 영향을 줄 수 있는 command 실행
- provider log, notification, billing, analytics처럼 보관/retention table이 추가되는 작업

최소 체크:

1. 현재 DB target이 local/dev/test인지 확인한다.
2. 공유/운영성 DB에는 사용자 명시 결정 없이 migrate/seed를 실행하지 않는다.
3. 기존 migration 파일을 수정하지 않는다.
4. `prisma generate`, migration status, test DB 적용 가능성을 확인한다.
5. rollback 또는 forward-fix 기준을 문서에 남긴다.

## 4. Product UX First-sale Gate 적용 규칙

전체 시각 polish는 후반 계획으로 둔다. 하지만 Product UX first-sale gate는 화면 미감 작업이 아니라 첫 판매 가능한 업무 흐름 검증이다.

검토 대상:

- `/app/companies`
- `/app/contacts`
- `/app/products`
- `/app/deals`
- `/app/schedules`
- `/app/meeting-notes`
- `/app/business-cards`
- `/app/import`
- search/filter
- trash/restore
- export/download

완료 판단:

- 사용자가 핵심 record를 만들고 연결하고 다시 찾을 수 있다.
- API에 없는 summary/count/latest를 FE가 사실처럼 꾸미지 않는다.
- empty/loading/error/success 상태가 업무를 막지 않는다.
- 모바일에서 핵심 확인과 현장 입력이 깨지지 않는다.
- 명함 촬영, 회의 직후 음성 기록, local draft 복원/폐기, browser push permission 안내가 모바일 현장 업무 흐름에서 깨지지 않는다.
- 민감정보와 private memo가 목록 summary나 preview에 섞이지 않는다.

## 5. Trust/Policy First-sale Gate 적용 규칙

Trust/policy는 11과 12의 상세 구현만 기다리면 첫 판매 전 검토에서 빠질 수 있다. 따라서 아래 항목은 첫 판매 전 gate로 별도 추적한다.

- 약관
- 개인정보 처리
- 보안/민감정보 redaction
- 환불/chargeback
- 계정 삭제
- 사용자 데이터 export/delete
- 데이터 보관 기간과 삭제 처리
- 결제/세금/인보이스 정책

연결 슬롯:

- 03: ExportJob, 파일 생성/다운로드, export retention
- 11: Done. 계정 삭제, 데이터 삭제, 사용자 데이터 export 정책, Trash, Admin audit, provider failure
- 12: 결제, 구독, 세금, 환불, invoice, failed payment

## 6. Trash Private Memo Gate 적용 규칙

`NBA-007`은 Trash/삭제 정책의 일부지만, private memo 원문 노출 위험 때문에 독립 보안 gate로 본다.

구현 기준:

- Trash list response에 private memo 원문을 넣지 않는다.
- Trash detail response에서도 복구 전 preview 정책을 별도로 둔다.
- restore 후 원문 접근은 기존 소유권/권한 정책을 따른다.
- FE에서 숨기는 것만으로 완료 처리하지 않는다.
- response type과 test가 private memo 미노출을 검증한다.

## 7. `/goal` 반영 규칙

각 번호 폴더를 `/goal`로 전환할 때 아래 중 하나라도 해당하면 goal spec에 이 문서를 직접 참조한다.

- DB migration이 있다.
- `/app` 핵심 업무 흐름의 route/state/client contract를 바꾼다.
- Trash, export, delete, retention, billing, policy를 건드린다.
- private memo, transcript, provider raw detail, payment detail 같은 민감정보를 다룬다.

## 8. 12 이후 Gate Closeout

12 완료 후에는 first-sale gate를 다시 닫는다. 이때 `NEXT_BACKEND_API_BACKLOG_PLAN`과 `USER_WEB_PRODUCTIZATION_GAP_PLAN`의 잔여 후보가 12 구현 결과와 충돌하지 않는지 확인한다.

검토 순서:

1. Billing, subscription, tax, refund, invoice, failed payment, entitlement, paywall이 12에서 어디까지 구현됐는지 확인한다.
2. paid conversion, churn, ARPU, AI cost/user 분석 source가 12 이후 실제 이벤트와 연결됐는지 확인한다.
3. Product UX first-sale gate에서 회사, 담당자, 제품, 딜, 일정, 회의록, 명함, import, search, trash, export, account/data request, billing 상태 흐름을 다시 확인한다.
4. Trust/policy gate에서 약관, 개인정보, 환불, 세금, 인보이스, chargeback, 계정 삭제, 데이터 export/delete, retention이 실제 Backend 데이터 처리와 충돌하지 않는지 확인한다.
5. 미완성 또는 후속으로 남은 항목은 기존 완료 폴더를 재개하지 않고 새 TODO 폴더로 승격한다.
