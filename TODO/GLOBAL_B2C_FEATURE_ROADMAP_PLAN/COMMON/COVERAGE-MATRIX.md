# Coverage Matrix

상태: Draft / 01~11 Done / 05 G10 Ready / 12 Next / Post-12 Review Planned

## 0. 완료 반영

- [x] 01 `ImportJob 영속화`: Done (2026-07-21)
- [x] `NBA-006 ImportJob persistence/resume API`: `01_IMPORT_JOB_PERSISTENCE`에서 구현 및 QA closeout 완료
- [x] 02 `Notification reminder`: Done (2026-07-22)
- [x] `NBA-010 Notification`: `02_NOTIFICATION_REMINDER`에서 구현 및 QA closeout 완료
- [x] 03 `Weekly Schedule Report`: Done (2026-07-22)
- [x] `NBA-009 Schedule week report`: `03_WEEKLY_SCHEDULE_REPORT`에서 구현 및 QA closeout 완료
- [x] 04 `Google Calendar Integration`: Done (2026-07-23)
- [x] `NBA-015 Google Calendar Integration`: `04_GOOGLE_CALENDAR_INTEGRATION`에서 구현 및 QA closeout 완료
- [x] 05 `AI Weekly Sales Report`: G01-G09 Done (2026-07-24), G10 actual email provider integration Ready (2026-08-05)
- [x] 06 `DealActivity Timeline`: Done (2026-07-26)
- [x] 07 `MeetingNote AI Provider Log`: Done (2026-07-26)
- [x] 08 `Global Data I18N`: Done (2026-07-28, DB 최신 상태 2026-07-29 재확인)
- [x] 09 `Product Analytics`: Done (2026-07-30)
- [x] 10 `Mobile PWA Field Use`: Done (2026-07-31)
- [x] 11 `Admin Operation`: Done (2026-08-01)
- [x] `NBA-007`, `NBA-011` Admin/internal 범위, `NBA-012`, `NBA-013`, 11 범위 `NBA-014`: `11_ADMIN_OPERATION`에서 구현 및 QA closeout 완료
- [x] First-sale gate 반영: `NBA-014`, Product UX gate, Trust/policy gate, `NBA-007`은 `COMMON/FIRST-SALE-GATE-MAP.md`에 선행/횡단 기준으로 고정
- [ ] Post-12 전체 재검토: 12 완료 후 `COMMON/POST-12-REVIEW-AND-FOLLOWUP.md` 기준으로 01~12와 입력 계획 2개를 다시 대조하고 새 TODO 후보를 확정

## 1. 목적

이 문서는 앞으로 만들어야 할 기능이 01~12 슬롯 중 어디에 포함되는지 추적한다.

입력은 `TODO/NEXT_BACKEND_API_BACKLOG_PLAN`의 Backend/API/DB 후보와 `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN`의 제품화 gap이다. 이 matrix는 두 입력 문서를 기능 슬롯으로 배정하는 표이며, UX/UI 전체 polish 작업 목록이 아니다.

12개 폴더는 상위 작업 단위다. 특정 기능이 별도 번호 폴더로 존재하지 않더라도 이 matrix에 슬롯이 배정되어 있으면 해당 번호 착수 시 반드시 검토한다.

## 2. 전체 기능 coverage

| 분류 | 기능 | 포함 슬롯 | 비고 |
|---|---|---|---|
| First-sale gate | DB/Prisma/migration 운영 gate | 선행 gate, 11 | Done: 신규 migration goal마다 선행 체크했고 11에서 `AdminOperationCheckRun` 기반 운영 점검 기록을 구현했다. 실제 backup/restore 실행은 Admin API가 직접 수행하지 않는다 |
| First-sale gate | Product UX first-sale QA | 01~11 closeout, 선행 gate | 회사/담당자/제품/딜/일정/회의록/명함/import/search/trash/export/account request 영향 흐름 검토 |
| First-sale gate | Trust/policy first-sale QA | 03, 11, 12, 선행 gate | 약관, 개인정보, 보안, 환불, 계정 삭제, 데이터 export/delete, retention |
| First-sale gate | Trash private memo backend response restriction | 11, 선행 gate | Done: `NBA-007`. User/Admin Trash response에서 private memo 원문을 노출하지 않는 계약과 QA 확인 완료 |
| Import/Data | ImportJob 영속화 | 01 | Done: 확정 전 job, preview row, TTL, resume 구현 완료 |
| Import/Data | Import 원본/preview 보관 정책 | 01 | Done: 개인정보와 cleanup 기준 포함 |
| Import/Data | Import/Export 파일 저장 기반 | 01, 후속 별도 결정 | Import 파일은 01 완료. Export job/file은 03에서 제외하고 Trust/policy/Admin gate와 함께 별도 결정 |
| Notification | In-app notification | 02 | Done: 목록, 읽음, unread count, `/app/notifications` 구현 완료 |
| Notification | Email/browser push | 02 | Done: email/browser push delivery attempt와 settings 구현 완료. 실제 provider smoke는 env 준비 후 운영 확인 |
| Notification | 일정/딜 reminder | 02 | Done: 일정 시작 30분 전, 딜 마감 1일 전 오전 9시 생성/발송 처리 구현 완료 |
| Notification | 다음 행동 reminder | 06 | 02에서 제외. 딜 데이터 구조 변경 가능성이 있어 DealActivity/다음 행동 고도화에서 설계 |
| Notification | 회의록 후속 reminder | 07 | 02에서 제외. MeetingNote AI/provider log와 follow-up 후보 설계에서 검토 |
| Schedule | 주간 일정 보고서 | 03 | Done: `NBA-009` 구현 완료. `/app/schedules/week`, `GET /api/schedules/week`, `weekStart`, `timeZone`, 7일 days report. 새 DB/migration 없음 |
| Schedule | 주간 보고서 Excel | 03 | Done: `GET /api/schedules/week/export/xlsx` 동기식 다운로드 구현 완료 |
| Schedule | 주간 보고서 PDF | 후속 별도 결정 | 03에서 제외. 화면+Excel 안정화 후 print/export 정책으로 별도 확정 |
| Schedule | 범용 ExportJob / 비동기 Export | 후속 별도 결정, 11 | 03에서 제외. `/app/export`, `/api/exports`, 대용량 export, 파일 TTL/권한/삭제/audit는 Trust/policy/Admin gate와 함께 결정 |
| Schedule | 일정/회의록 export | 후속 별도 결정 | 03에서 제외. 기존 domain xlsx 이후 확장 여부를 별도 확정 |
| Schedule | 반복 일정 | 후속 별도 결정 | 03에서 제외. recurrence rule, exception, DST, 알림 재생성, Calendar 연동 영향 검토 후 별도 확정 |
| Calendar | Google Calendar connect/read-only import | 04 | Done: `NBA-015` 구현 완료. login OAuth와 Calendar scope 분리, primary 기본 선택+추가 calendar 선택, 10분 freshness 자동 sync+수동 sync, source badge, meeting URL, all-day 표시, Schedule soft delete/Trash restore 구현. Google export/write, 양방향 sync, webhook, 반복 일정 정식 모델은 제외 |
| Calendar | external calendar sync 실패 처리 | 04, 11 | Done: 04에서 사용자-facing 실패 처리, 11에서 Admin provider failure 운영 조회를 구현했다 |
| AI report | AI 주간 영업 리포트 | 05 | G01-G09 Done: 저장형 AI weekly report와 follow-up delivery foundation 구현 완료. G10 Ready: Gmail/Microsoft 실제 email provider 발송 후속 문서화 |
| AI report | AI follow-up/next action/딜 리스크 | 05, 07 | Done subset: 05 follow-up delivery foundation, 07 회의록 next action/follow-up draft. 05 G10은 실제 email provider 발송을 닫는다. 딜 리스크 고도화는 후속 |
| AI report | AI 데이터 정리 제안 | 05, 07 | 05/07에서 provider log와 후속 draft 기반은 완료. Import/명함 품질 제안은 후속 |
| Core record | DealActivity timeline | 06 | Done: 딜 중심 activity 정본 구현 완료 |
| Core record | Deal list products summary | 06 | Done: NBA-001 |
| Core record | Contact list dealCount | 06 | Done: NBA-002 |
| Core record | latest activity/next action summary | 06 | Partial Done: Deal list latestActivity 완료. Company/Contact/Product latest summary와 MeetingNote 목록 summary는 후속 |
| Core record | 검색/필터 고도화 | 06 | 고급 필터, 정렬, 최근 항목, 진행 중 딜 우선 |
| Core record | page size/pagination 계약 | 06 | Done: NBA-008 |
| Core record | 딜 가능성/확률 고도화 | 06 | pipeline priority |
| Core record | 다음 행동 완료/미루기/일정 연결 | 06 | following action loop |
| MeetingNote AI | AI/STT provider call log | 07 | Done subset: NBA-011 공통 `AiProviderCallLog` 확장 |
| MeetingNote AI | transcript 보관 정책 | 07 | Done for 07: transcript 원문 저장 안 함. Admin/raw retention은 후속 |
| MeetingNote AI | 회의록 next action 추출 | 07 | Done: 후보 추출 후 사용자 확인/수정 저장 |
| MeetingNote AI | 회의록 목록 latest/next summary | 07, 06 | 후속: API field는 07, record summary 표시는 06 |
| Global | `/app` 내부 다국어 | 08 | Done: public/auth locale과 분리된 `ko-KR`/`en` app i18n |
| Global | 다국가 전화번호 | 08 | Done: KR/US phone, E.164, legacy fallback |
| Global | 날짜/시간/timezone 표시 | 08 | Done: API ISO 유지, FE locale/timezone 표시 |
| Global | 통화/금액/currency | 08 | Done: Product/Deal `currencyCode`, KRW/USD 표시 |
| Global | 주소/지역 모델 | 08 | Done: Company country/region/address |
| Global | 글로벌 UX writing | 08 | Done: 핵심 `/app` 문구/에러/empty `ko-KR`/`en`. 직접 keying 축소는 polish 후보 |
| Global auth | Apple login | 08, 후속 native app roadmap | Done for 08 implementation. 2026-07-29 사용자 확인 기준 Apple 운영 설정과 실제 OAuth 동작 완료. iOS native app은 10 완료 범위 밖 후속 로드맵 |
| Global auth | LINE login | 08 | Done for 08 implementation. 2026-07-29 사용자 확인 기준 LINE 운영 설정과 실제 OAuth 동작 완료 |
| Analytics | Event taxonomy | 09 | Done: `app_route_viewed`, signup, core server action, billing reserved taxonomy 분리 완료 |
| Analytics | Activation/retention/funnel/churn | 09, 12 | 09 Done: activation/retention snapshot과 runtime funnel foundation 완료. paid conversion/churn runtime source는 12 Billing 구현 후 연결 |
| Analytics | AI usage/cost/user | 09, 11 | Done: 09 `AiProviderCallLog` 기반 user/day/operation summary foundation 완료, 11 Admin analytics 화면/API 구현 완료 |
| Growth | paywall/trial/coupon/referral/churn survey 실험 | 09, 12 | 09 Done: reserved event 이름과 runtime 제외 경계 확정. 실제 paywall/billing 적용과 churn survey flow는 12 |
| Mobile | PWA | 10, 후속 별도 결정 | 10 Done: 모바일 웹 현장 입력성은 완료. manifest/service worker/install/offline shell은 10 1차 제외 범위라 PWA packaging 후속으로 유지 |
| Mobile | 모바일 명함 촬영 | 10 | Done: `input type=file`, `accept="image/*"`, `capture="environment"` 기반 후면 카메라/앨범 선택, 재촬영/파일 변경/수동 입력 UX 구현 |
| Mobile | BusinessCard OCR provider failure/error contract | 10, 11 | Done: 10 사용자 safe failure 계약과 DB safe failure field 구현, 11 Admin provider failure 운영 조회 구현 |
| Mobile | 모바일 음성 기록 | 10 | Done: `MediaRecorder` 녹음 UX와 기존 STT draft API 재사용, 음성 파일 fallback 구현 |
| Mobile | offline draft | 10 | Done: 서버 draft DB 없이 FE local draft 24시간 TTL, 복원/폐기 UX 구현. full offline sync는 후속 |
| Mobile | iOS/Android native app | 후속 native app roadmap | 10 1차 제외. 현장 사용 지표와 사용자 결정 후 별도 로드맵으로 승격 |
| Mobile | native push/contact/calendar | 후속 native app roadmap | native app 이후 결정 |
| Ops/Admin | Admin 사용자/도메인 조회 | 11 | Done: 사용자 목록/상세, 활동 timeline, 도메인 read-only tab 구현 |
| Ops/Admin | 민감정보 마스킹/원문 조회 사유/audit | 11 | Done: masking, reason validation, append-only audit/sensitive log 구현 |
| Ops/Admin | Trash/삭제 정책 고도화 | 11 | Done: `NBA-012`. 만료 row 유지, User 복구 문의, Admin recovery queue 구현. hard delete/purge와 유료 복구 결제는 제외 |
| Ops/Admin | Trash private memo backend response restriction | 11 | Done: `NBA-007`. private memo 원문 미노출 보안 체크 완료 |
| Ops/Admin | 계정 삭제/데이터 삭제 | 11 | Done: account deletion/data export request API와 Admin queue 구현 |
| Ops/Admin | 사용자 데이터 export 정책 | 11, 03 | Done: 요청/운영 queue 정책은 11. 파일 job/대량 export는 후속 별도 결정 |
| Ops/Admin | 자동 민감정보 감지 | 후속 별도 결정 | 11의 masking/raw access와 별도인 자동 탐지 기능은 아직 계약화하지 않는다 |
| Ops/Admin | DB/Prisma/migration 운영 gate | 선행 gate, 11 | Done: `NBA-014` 11 system operation gate 구현. 이후 migration goal마다 선행 체크는 유지 |
| Ops/Admin | backup/restore/장애 대응 | 11 | Done: Admin system gate에서 점검 결과를 기록한다. 실제 backup/restore 실행 runbook은 운영 절차로 별도 관리 |
| Ops/Admin | Provider failure log | 11 | Done: OpenAI/OCR/STT/Calendar/Push safe summary/detail 운영 조회 구현 |
| Billing | Pricing/plan/trial | 12 | 첫 판매 전 결정 |
| Billing | Subscription/entitlement | 12 | plan별 기능/AI 제한 |
| Billing | Paywall/upgrade flow | 12, 09 | 09에서 reserved taxonomy를 분리했다. 사용자 제한/전환 UX와 실제 billing event 발생은 12 |
| Billing | AI usage plan/overage | 12, 05, 07, 09 | 09에서 비용 분석 foundation 완료. 제한/과금과 overage 정책은 12 |
| Billing | Payment provider/webhook | 12 | Merchant of Record 우선, Stripe 직접 결제 2순위 |
| Billing | Failed payment recovery | 12 | 결제 실패 복구 UX/API와 운영 대응은 12 Billing 도메인에서 결정 |
| Billing | Tax/invoice/refund/chargeback | 12 | 국가별 판매 정책 |
| Billing | Coupon/referral | 12, 09 | 09에서 reserved taxonomy/foundation만 확정했다. 결제 적용과 실험 운영은 12 |
| Billing | Churn survey/cancel reason | 12, 09 | 09에서 reserved taxonomy/foundation만 확정했다. 해지 flow, survey source, billing-linked churn 분석은 12 이후 연결 |
| Billing | Billing Admin 연동 | 12 | 11 Admin 운영은 결제/구독을 제외했다. Billing Admin 화면/API는 12 결제 도메인과 함께 결정 |
| Post-12 review | 01~12 전체 재학습과 후속 TODO 승격 | 12 이후 | `NEXT_BACKEND_API_BACKLOG_PLAN`, `USER_WEB_PRODUCTIZATION_GAP_PLAN`, 실제 BE/FE/Prisma 상태를 다시 대조해 미구현/후속/보류 항목을 새 TODO 폴더로 재배치한다. UX/UI 디자인 유지보수는 이 재검토 이후 별도 계획으로 진행한다 |

## 3. 누락 판단 규칙

- 새 기능 후보가 나오면 이 문서에 먼저 배정한다.
- 기존 12개 슬롯에 자연스럽게 들어가지 않으면 새 번호 폴더를 만들기 전에 사용자 결정이 필요하다.
- 한 기능이 여러 슬롯에 걸치면 사용자-facing 구현 슬롯과 운영/정책 슬롯을 둘 다 적는다.
- 12 완료 후 발견된 미구현/후속 후보는 기존 01~12 완료 폴더를 되돌려 열지 않고 새 TODO 폴더로 승격한다.
