# User Flow

상태: Confirmed

## 1. 로그인 후 앱 진입

1. 사용자가 Google, LINE, Apple 중 하나로 로그인한다.
2. Backend auth exchange가 신규 사용자라면 `auth_signup_completed` server event를 기록한다.
3. 사용자는 `/app`으로 이동한다.
4. User Web analytics wrapper가 `app_route_viewed` client event를 보낸다.
5. Backend는 사용자, session, device, timezone을 현재 인증 context에서 채워 저장한다.

사용자에게 analytics 동작은 보이지 않는다.

## 2. 딜 생성과 activation

1. 사용자가 `/app/deals` 또는 딜 생성 route에서 딜을 만든다.
2. Backend는 기존 딜 생성 validation과 ownership을 수행한다.
3. 딜 생성이 성공한다.
4. Backend는 `deal_created` server event를 best-effort로 기록한다.
5. 다음 행동이 생성되면 `deal_next_action_created` server event를 기록한다.
6. Snapshot batch가 첫 딜과 첫 meaningful action을 확인한다.
7. 두 조건이 모두 있으면 사용자는 activated 상태가 된다.

Analytics 저장이 실패해도 딜 생성 성공 UX는 유지된다.

## 3. 일정/회의록으로 activation 보강

1. 사용자가 일정을 만들고 딜에 연결한다.
2. Backend는 `schedule_created`, `schedule_deal_linked`를 기록한다.
3. 사용자가 회의록을 만들고 딜에 연결한다.
4. Backend는 `meeting_note_created`, `meeting_note_deal_linked`를 기록한다.
5. 딜 생성이 이미 있었고 일정 또는 회의록 연결이 처음이라면 activation 조건을 만족한다.

## 4. Import / 명함 / Export

1. 사용자가 명함 OCR 결과를 확인하고 저장한다.
2. Backend는 `business_card_scan_confirmed`를 기록한다.
3. 사용자가 import를 확정 저장한다.
4. Backend는 `import_confirmed`를 기록한다.
5. 사용자가 회사/담당자/제품/딜 xlsx export를 실행한다.
6. Backend는 파일 생성 성공 후 `export_downloaded`를 기록한다.

Payload에는 파일명, row 원문, 회사명, 담당자명, 전화번호, 이메일을 넣지 않는다.

## 5. Retention

1. 사용자가 다음 날 다시 `/app`에 들어온다.
2. User Web은 `app_route_viewed`를 보낸다.
3. Backend는 사용자 timezone 기준 `eventDate`를 저장한다.
4. Snapshot batch가 activation date 대비 D1/D7/D30 active 여부를 계산한다.

예:

```text
occurredAt = 2026-07-29T15:30:00Z
timeZone = Asia/Seoul
eventDate = 2026-07-30
```

## 6. AI 사용량

1. 사용자가 회의록 AI 초안, STT, follow-up draft 같은 AI 기능을 실행한다.
2. 기존 AI provider flow가 `AiProviderCallLog`를 남긴다.
3. 09의 AI usage 집계는 이 로그를 읽어 요청 수, 실패율, 추정 비용을 계산한다.
4. 11 Admin에서 사용자별 AI 사용 횟수와 비용을 볼 수 있도록 read model을 준비한다.

## 7. 계정 삭제

1. 사용자가 계정 삭제를 요청한다.
2. 서비스는 즉시 접근을 막고 30일 유예 상태로 둔다.
3. 유예 기간에는 복구 가능하다.
4. 30일이 지나면 user-linked raw analytics event와 user-level snapshot을 실제 삭제한다.
5. 비식별 aggregate snapshot은 유지할 수 있다.

09는 삭제 정책을 analytics schema와 purge 기준에 반영한다. 계정 삭제 UI/API의 전체 구현은 별도 trust/admin/billing 관련 계획과 연결될 수 있다.
