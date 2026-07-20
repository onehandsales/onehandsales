# User Web Productization Guide

상태: Draft Guide

## 1. 목적

이 문서는 `FE/user-web`을 최종 서비스 형태와 비교할 때 보는 화면/UX 기준이다.

이 문서는 구현 지시서가 아니다. 화면을 고치기 전에 무엇을 확인해야 하는지 정리한다.

## 2. User Web 판단 기준

| 기준 | 확인할 내용 |
|---|---|
| Work-first | 로그인 후 화면이 마케팅 사이트가 아니라 반복 업무 도구처럼 보이는가 |
| Notion + Attio | sidebar/page/database/detail 문법과 CRM linked record 맥락이 살아 있는가 |
| Deal-first | 딜 단계, 금액, 다음 행동, 마감일, 연결 record가 빨리 보이는가 |
| Mobile browser | 390px/360px에서 table을 억지로 유지하지 않고 card/list로 쓸 수 있는가 |
| State UX | loading, empty, error, success, validation, delete/restore 상태가 해요체와 행동형 기준을 따르는가 |
| Data honesty | API 응답에 없는 최신 활동/summary/count를 FE에서 사실처럼 꾸미지 않는가 |

## 3. 화면별 제품화 gap 체크

| 화면 | 현재 상태 | 제품화 점검 질문 | API/BE 영향 |
|---|---|---|---|
| Public/auth | locale 진입면 구현 | 개인 영업자 B2C 가치 제안이 충분한가 | 낮음 |
| `/app` | home dashboard 구현 | 오늘 해야 할 일과 진행 딜이 바로 읽히는가 | 중간 |
| `/app/deals` | pipeline/list/detail 구현 | 딜 비교, 다음 행동, 연결 회사/담당자/제품 맥락이 충분한가 | `NBA-001`, `NBA-008` 후보 |
| `/app/companies` | 목록/상세/생성/메모/export 구현 | 담당자/진행 딜/최근 활동 맥락이 충분한가 | `NBA-003` 후보 |
| `/app/contacts` | 목록/상세/생성/export 구현 | 연결 딜 수와 회사 맥락이 충분한가 | `NBA-002`, `NBA-003` 후보 |
| `/app/products` | 목록/상세/생성/export 구현 | 제품이 어느 딜에서 쓰이는지 빠르게 보이는가 | `NBA-003` 후보 |
| `/app/schedules` | 목록/월간/상세 구현 | 일정과 딜이 하루/주 단위 영업 판단으로 연결되는가 | `NBA-009` 후보 |
| `/app/meeting-notes` | 수동/AI/STT draft/딜 연결 구현 | 회의록에서 다음 행동과 딜 맥락이 충분히 보이는가 | `NBA-004`, `NBA-011` 후보 |
| `/app/business-cards` | OCR/upload/confirm 구현 | provider 실패, 모바일 촬영, 다국가 연락처가 자연스러운가 | `NBA-005` 후보 |
| `/app/import` | template/upload/mapping/confirm/log 구현 | 새로고침/탭 이동/배포 중 유실을 어떻게 안내하는가 | `NBA-006` 후보 |
| `/app/trash` | list/detail/restore 구현 | private memo preview와 7일 이후 정책이 안전한가 | `NBA-007`, `NBA-012` 후보 |
| `/app/settings` | profile/devices 구현 | 유료화 전 계정/언어/데이터 관리가 충분한가 | 후속 |
| `/app/more` | 보조 메뉴 구현 | 숨긴 기능이 잘못 노출되지 않는가 | 낮음 |
| `/app/notifications` | `/app` redirect | 알림이 MVP 직후 필요한 리텐션 기능인지 판단 필요 | `NBA-010` 후보 |
| `/app/export` | `/app` redirect | 범용 export가 정말 필요한지 정책 결정 필요 | 낮음 |

## 4. 지금 바로 FE에서 하지 말 것

- Notification route/sidebar를 Backend 없이 다시 노출하지 않는다.
- `/app/export` generic export를 다시 노출하지 않는다.
- page size를 FE 단독으로 바꾸지 않는다.
- API 응답에 없는 latest activity, next action summary, product summary, dealCount를 임의로 계산해 사실처럼 표시하지 않는다.
- Admin Web 운영 화면을 User Web feature와 섞지 않는다.

## 5. FE 변경이 필요하다고 판단되면

1. 화면에서 해결 가능한 UX 문제인지 확인한다.
2. API 응답이 부족한 문제인지 분리한다.
3. API가 필요하면 `TODO/NEXT_BACKEND_API_BACKLOG_PLAN` 후보와 연결한다.
4. 구현은 별도 TODO 계획과 `/goal`로 분리한다.
