# Decision Log

상태: Confirmed
작성 기준일: 2026-07-31

## 1. Admin 대상

결정: 11 Admin은 onehand.sales 내부 최종 관리자 전용이다.

- 고객사 관리자, B2B tenant admin, 팀 관리자 기능이 아니다.
- B2C 기반을 먼저 안정화하고, B2B 확장은 후속 제품/권한 모델에서 다룬다.

## 2. 1차 Admin 범위

결정: 최소 운영 Admin + 운영 신뢰 항목을 포함한다.

- 사용자 목록/상세/활동 summary
- 민감정보 masking/raw access reason/audit
- Trash 7일 이후 상태와 복구 문의
- provider failure safe 조회
- 09 Product Analytics와 10 mobile field-use event 기반 Admin summary
- DB/migration/backup operation gate

## 3. 사용자 상세

결정: 기본 화면은 숫자 요약 + 최근 활동 timeline이다.

예시:

- 회사 12개
- 담당자 38명
- 진행 딜 9건
- Trash 3건
- 무료 복구 만료 1건
- browser push 활성 구독 1건
- 최근 delivery 실패 safe code
- 최근 활동: 딜 생성, 일정 연결, 회의록 생성, 명함 확정, export 다운로드

도메인별 read-only 상세 탭은 후속 goal로 분리한다.

## 4. 민감정보

결정: Admin response는 기본 masked다.

원문 접근은 아래 조건을 모두 만족해야 한다.

- 별도 raw access API를 호출한다.
- reason을 입력한다.
- `AdminSensitiveAccessLog`와 `AdminAuditLog`를 남긴다.
- provider raw response, prompt, token, API key, quota detail은 원문 접근 API에서도 제외한다.

## 5. Audit

결정: 모든 클릭을 audit하지 않는다. 운영상 의미 있는 조회와 action만 남긴다.

필수 audit 대상:

- Admin login/access
- 사용자 목록 조회
- 사용자 상세 조회
- 도메인 read-only tab 조회
- provider failure detail 조회
- Trash 만료 목록 조회
- 민감 원문 조회
- 계정 삭제 요청 상태 조회/변경
- 데이터 export 요청 상태 조회/변경
- system operation check 조회/기록

제외:

- 페이지네이션 클릭
- 단순 table column resize
- 필터 UI 열기/닫기
- route hover

## 6. Provider Failure

결정: safe summary/detail만 제공한다.

포함:

- provider type
- feature area
- operation
- status
- safe error code/message
- retryable
- latency
- request id
- target user
- target type/id
- 발생 시각

제외:

- provider raw response
- prompt 전문
- STT transcript 전문
- 회의록 본문 전문
- API key/token
- quota detail
- private memo 원문
- browser push endpoint/key/userAgent 원문

## 7. Trash

결정: 일반 도메인 Trash는 hard delete/purge하지 않는다.

- 0~7일: 사용자가 `/app/trash`에서 무료 self-restore 가능
- 7일 이후: 사용자 무료 복구 버튼 비활성화
- 7일 이후: 사용자에게 `복구 문의`를 제공할 수 있음
- 7일 이후: Admin은 삭제 데이터 목록과 복구 문의 queue를 볼 수 있음
- 11 1차: Admin 직접 복구 실행은 제외
- 복구 비용 정책 연결: 12 또는 후속 recovery goal

`trashExpiresAt`은 물리 삭제 예정 시각이 아니라 사용자 무료 복구 기간 만료 시각으로 본다.

## 8. 계정 삭제

결정: 계정 삭제는 일반 Trash와 별개다.

- 사용자가 계정 삭제를 요청한다.
- G08에서는 유예 기간 내 취소 UX를 유지하기 위해 즉시 접근 차단 또는 세션 revoke를 적용하지 않는다.
- 접근 차단 또는 세션 revoke는 실제 삭제/익명화 job 정책에서 확정한다.
- 30일 유예 기간을 둔다.
- 유예 기간 내 취소할 수 있다.
- 유예 기간 이후 user-linked raw analytics/event/snapshot과 개인 데이터는 실제 삭제 또는 익명화한다.
- 법무/보안/세금/결제 예외 보관은 12 또는 policy 문서와 연결한다.

## 9. Analytics

결정: 11 Admin Analytics는 09 foundation과 10 mobile field-use event를 읽는 운영 요약이다.

포함:

- activation
- retention
- active user count
- route/event count
- core workflow event count
- mobile field-use event count/bucket
- AI usage/cost summary

제외:

- paid conversion
- churn
- ARPU
- LTV/CAC
- subscription status
- plan/revenue
- billing/paywall funnel

## 10. 결제/구독

결정: 11에서는 결제/구독을 구현하지 않는다.

- Admin 사용자 상세에 plan/payment 상태를 넣지 않는다.
- recovery request에서 결제 버튼/paywall을 넣지 않는다.
- analytics에 billing-linked conversion/churn을 넣지 않는다.
- 12번에서 payment/subscription/tax/MoR/refund/invoice를 다룬다.

## 11. ImportJob Cleanup 운영 표시

결정일: 2026-08-03

결정: 01 ImportJob terminal cleanup에는 Admin 화면/API를 추가하지 않는다.

- 01 후속 cleanup은 `CONFIRMED`, `CANCELED`, `EXPIRED`, `FAILED` 상태가 된 뒤 7일 지난 ImportJob 임시 snapshot을 정리하는 Backend 운영 위생 기능이다.
- cleanup 실패는 Admin Web에 별도 목록으로 노출하지 않고 safe summary log로만 남긴다.
- cleanup log에는 import row 원문, 파일명, `storageKey`, 사용자 입력값, provider raw, job ID 목록을 남기지 않는다.
- storage delete가 실패한 job은 DB snapshot을 삭제하지 않고 추적 가능한 metadata를 유지한다.
- cleanup 실패가 운영상 반복되면 post-12 Admin 운영 후속에서 aggregate/system gate 항목으로만 검토한다.

예시:

- 포함: `deletedJobCount`, `fileDeleteRetriedCount`, `fileDeleteFailedCount`
- 제외: `ImportJobRow.rawDataJson`, 업로드 파일명, storage object key, 사용자 email/phone, job ID 배열
