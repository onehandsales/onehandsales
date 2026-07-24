# 05 Scope

상태: Confirmed split scope
최종 업데이트: 2026-07-24

## 1. 포함 범위

05는 `05-A AI Weekly Report`와 `05-B Follow-up Delivery`로 나눈다.

| 범위 | 포함 |
|---|---|
| `05-A` | 저장형 AI 주간 리포트, 비동기 job, version, 실패 이력, 입력 snapshot, 리스크/다음 행동/follow-up/data cleanup 제안 |
| `05-B` | Gmail/Microsoft 365 연결, 국제 SMS 발신번호 인증, follow-up compose, 즉시 발송, 발송 이력, timeline |

## 2. 05-A 완료 기준

- 선택한 주의 AI 리포트를 수동 생성할 수 있다.
- 리포트는 version으로 저장된다.
- 실패 version도 저장된다.
- 같은 user/week에 생성 중 job 중복이 차단된다.
- 회의록 본문 전체를 포함한 input snapshot이 저장된다.
- 사용자는 snapshot 요약만 볼 수 있다.
- 리스크, 다음 행동, follow-up 초안, 데이터 정리 제안이 구조화되어 표시된다.
- AI 제안은 실제 record를 자동 변경하지 않는다.

## 3. 05-B 완료 기준

- 사용자는 `/app/settings`에서 Gmail과 Microsoft 365를 연결할 수 있다.
- 사용자는 `/app/settings`에서 국제 SMS 발신번호를 인증할 수 있다.
- AI 리포트 follow-up 제안에서 이메일 또는 문자 compose로 이동할 수 있다.
- 사용자는 수신자, 제목, 본문을 확인/수정한 뒤 즉시 발송할 수 있다.
- 발송 이력은 본문 전체를 영구 보관한다.
- 사용자는 발송 이력을 삭제할 수 없다.
- 발송 이력은 AI 리포트와 딜/담당자 timeline 양쪽에서 볼 수 있다.
- provider 실패는 safe error와 재시도로 처리된다.

## 4. 제외 범위

- 결제 plan별 AI 제한
- 예약 발송
- campaign/bulk marketing 발송
- SMTP 직접 설정
- Admin 민감 원문 조회
- PDF/generic ExportJob
- Google Calendar write/webhook
- 자동 Deal/Schedule/MeetingNote mutation
- 계정 삭제/법적 삭제 요청 정책
