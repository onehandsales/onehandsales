# Coverage Matrix

상태: Draft

## 0. 완료 반영

- [x] 01 `ImportJob 영속화`: Done (2026-07-21)
- [x] `NBA-006 ImportJob persistence/resume API`: `01_IMPORT_JOB_PERSISTENCE`에서 구현 및 QA closeout 완료
- [x] 02 `Notification reminder`: Done (2026-07-22)
- [x] `NBA-010 Notification`: `02_NOTIFICATION_REMINDER`에서 구현 및 QA closeout 완료
- [x] 03 `Weekly Schedule Report`: Done (2026-07-22)
- [x] `NBA-009 Schedule week report`: `03_WEEKLY_SCHEDULE_REPORT`에서 구현 및 QA closeout 완료
- [x] First-sale gate 반영: `NBA-014`, Product UX gate, Trust/policy gate, `NBA-007`은 `COMMON/FIRST-SALE-GATE-MAP.md`에 선행/횡단 기준으로 고정

## 1. 목적

이 문서는 앞으로 만들어야 할 기능이 01~12 슬롯 중 어디에 포함되는지 추적한다.

12개 폴더는 상위 작업 단위다. 특정 기능이 별도 번호 폴더로 존재하지 않더라도 이 matrix에 슬롯이 배정되어 있으면 해당 번호 착수 시 반드시 검토한다.

## 2. 전체 기능 coverage

| 분류 | 기능 | 포함 슬롯 | 비고 |
|---|---|---|---|
| First-sale gate | DB/Prisma/migration 운영 gate | 선행 gate, 11 | `NBA-014`, `RQA-005` release blocker. 신규 migration goal마다 선행 체크하고 상세 closeout은 11 |
| First-sale gate | Product UX first-sale QA | 01~10 closeout, 선행 gate | 회사/담당자/제품/딜/일정/회의록/명함/import/search/trash/export 업무 흐름 검토 |
| First-sale gate | Trust/policy first-sale QA | 03, 11, 12, 선행 gate | 약관, 개인정보, 보안, 환불, 계정 삭제, 데이터 export/delete, retention |
| First-sale gate | Trash private memo backend response restriction | 11, 선행 gate | `NBA-007`. FE 숨김이 아니라 Backend response 원문 제한 여부를 독립 확인 |
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
| Calendar | Google Calendar connect/read-only import | 04 | Goal Ready: login OAuth와 Calendar scope 분리, primary 기본 선택+추가 calendar 선택, 10분 freshness 자동 sync+수동 sync, export/two-way sync 제외 |
| Calendar | external calendar sync 실패 처리 | 04, 11 | Goal Ready: revoked/invalid_grant는 재연결 필요, transient failure는 사용자-facing 실패 표시. 운영 추적은 11 |
| AI report | AI 주간 영업 리포트 | 05 | 일정+딜+회의록 기반 |
| AI report | AI follow-up/next action/딜 리스크 | 05, 07 | 리포트성은 05, 회의록 추출은 07 |
| AI report | AI 데이터 정리 제안 | 05, 07 | Import/명함/회의록 품질 고도화 후보 |
| Core record | DealActivity timeline | 06 | 딜 중심 activity |
| Core record | Deal list products summary | 06 | NBA-001 |
| Core record | Contact list dealCount | 06 | NBA-002 |
| Core record | latest activity/next action summary | 06 | NBA-003/NBA-004와 연결 |
| Core record | 검색/필터 고도화 | 06 | 고급 필터, 정렬, 최근 항목, 진행 중 딜 우선 |
| Core record | page size/pagination 계약 | 06 | NBA-008 |
| Core record | 딜 가능성/확률 고도화 | 06 | pipeline priority |
| Core record | 다음 행동 완료/미루기/일정 연결 | 06 | following action loop |
| MeetingNote AI | AI/STT provider call log | 07 | NBA-011 |
| MeetingNote AI | transcript 보관 정책 | 07 | 민감정보/retention 기준 필요 |
| MeetingNote AI | 회의록 next action 추출 | 07 | 후보 추출 후 사용자 확인 |
| MeetingNote AI | 회의록 목록 latest/next summary | 07, 06 | API field는 07, record summary 표시는 06 |
| Global | `/app` 내부 다국어 | 08 | public/auth locale과 분리 |
| Global | 다국가 전화번호 | 08 | E.164/국가별 입력 |
| Global | 날짜/시간/timezone 표시 | 08 | API ISO, FE locale 표시 |
| Global | 통화/금액/currency | 08 | Deal/Product 금액 모델 영향 |
| Global | 주소/지역 모델 | 08 | 국가별 region/address |
| Global | 글로벌 UX writing | 08 | locale별 문구/에러/empty |
| Global auth | Apple login | 08, 10 | global auth 후보, iOS native 시 10과 연결 |
| Global auth | LINE login | 08 | 일본/대만 확장 후보 |
| Analytics | Event taxonomy | 09 | signup, activation, core action |
| Analytics | Activation/retention/funnel/churn | 09 | paid conversion 포함 |
| Analytics | AI usage/cost/user | 09 | 05/07/12와 연결 |
| Growth | paywall/trial/coupon/referral/churn survey 실험 | 09, 12 | 분석/실험은 09, billing 적용은 12 |
| Mobile | PWA | 10 | manifest, service worker, install |
| Mobile | 모바일 명함 촬영 | 10 | camera capture |
| Mobile | BusinessCard OCR provider failure/error contract | 10, 11 | 사용자 UX는 10, 운영 추적은 11 |
| Mobile | 모바일 음성 기록 | 10 | STT draft와 연결 |
| Mobile | offline draft | 10 | 민감정보 TTL 필요 |
| Mobile | iOS/Android native app | 10 | Series A급 후보 |
| Mobile | native push/contact/calendar | 10 | native app 이후 |
| Ops/Admin | Admin 사용자/도메인 조회 | 11 | 운영 콘솔 |
| Ops/Admin | 민감정보 마스킹/원문 조회 사유/audit | 11 | Admin 필수 |
| Ops/Admin | Trash/삭제 정책 고도화 | 11 | `NBA-012`. 만료, purge, 복구 불가, 유료 복구 후보 |
| Ops/Admin | Trash private memo backend response restriction | 11 | `NBA-007`. private memo 원문 미노출은 Trash 정책과 별도 보안 체크 |
| Ops/Admin | 계정 삭제/데이터 삭제 | 11 | trust/policy/API |
| Ops/Admin | 사용자 데이터 export 정책 | 11, 03 | 정책은 11, 파일 job은 03 |
| Ops/Admin | 자동 민감정보 감지 | 11 | export/admin/meeting note와 연결 |
| Ops/Admin | DB/Prisma/migration 운영 gate | 선행 gate, 11 | `NBA-014`. 11 상세 구현 전에도 migration goal마다 체크 |
| Ops/Admin | backup/restore/장애 대응 | 11 | 운영 신뢰 |
| Ops/Admin | Provider failure log | 11 | OpenAI/OCR/STT/Calendar/Push |
| Billing | Pricing/plan/trial | 12 | 첫 판매 전 결정 |
| Billing | Subscription/entitlement | 12 | plan별 기능/AI 제한 |
| Billing | Paywall/upgrade flow | 12, 09 | 사용자 제한/전환 UX는 12, funnel 분석은 09 |
| Billing | AI usage plan/overage | 12, 05, 07, 09 | 제한/과금은 12, 사용량 발생은 05/07, 비용 분석은 09 |
| Billing | Payment provider/webhook | 12 | Merchant of Record 우선, Stripe 직접 결제 2순위 |
| Billing | Failed payment recovery | 12, 11 | 결제 실패 복구 UX/API는 12, 운영 대응은 11 |
| Billing | Tax/invoice/refund/chargeback | 12 | 국가별 판매 정책 |
| Billing | Coupon/referral | 12, 09 | 결제 적용은 12, 실험/분석은 09 |
| Billing | Churn survey/cancel reason | 12, 09 | 해지 flow는 12, churn 분석은 09 |
| Billing | Billing Admin 연동 | 11, 12 | 화면 운영은 11, 결제 도메인은 12 |

## 3. 누락 판단 규칙

- 새 기능 후보가 나오면 이 문서에 먼저 배정한다.
- 기존 12개 슬롯에 자연스럽게 들어가지 않으면 새 번호 폴더를 만들기 전에 사용자 결정이 필요하다.
- 한 기능이 여러 슬롯에 걸치면 사용자-facing 구현 슬롯과 운영/정책 슬롯을 둘 다 적는다.
