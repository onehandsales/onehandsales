# Follow-up Email Provider User Flow

상태: confirmed for G10
연결 Goal: G10_FOLLOW_UP_EMAIL_PROVIDER_INTEGRATION
작성일: 2026-08-05

## 1. UX/UI 기준

G10 화면은 `AGENT/UXUI_AGENT`의 Notion식 작업공간 UX와 Attio식 CRM record 관계 UX를 따른다.

적용 방식:

- 설정은 `/app/settings`의 조용한 section으로 유지한다.
- AI 주간 리포트 follow-up suggestion은 record에 연결된 업무 action처럼 보인다.
- 발송 이력은 AI report, Deal, Contact timeline에서 activity처럼 읽힌다.
- 화면은 사용자가 발송 전 판단해야 하는 정보, 즉 발신 계정, 수신자, 제목, 본문, 상태를 우선한다.
- Attio의 연결 계정 기반 CRM 발송 감각은 참고하지만 mailbox sync, sequence, custom CRM builder, Attio 문구/브랜드/화면 복제는 하지 않는다.

## 2. 설정 화면

위치:

- `/app/settings`

흐름:

1. 사용자가 이메일 연결 section을 본다.
2. Gmail과 Microsoft 365 각각의 연결 상태를 확인한다.
3. 연결 전이면 `Gmail 연결`, `Microsoft 365 연결` 버튼을 누를 수 있다.
4. 연결 후에는 연결된 계정 email과 상태를 본다.
5. `RECONNECT_REQUIRED`면 다시 연결 CTA를 보여준다.
6. 연결 해제는 기존 05-B 흐름을 유지한다.

문구 예:

| 상황 | 문구 |
|---|---|
| 미연결 | `Gmail을 연결하면 내 계정으로 이메일을 보낼 수 있어요.` |
| 연결됨 | `Gmail로 보낼 수 있어요.` |
| 재연결 필요 | `이메일 연결이 만료됐어요. 다시 연결해 주세요.` |
| provider 설정 누락 | `이메일 발송 설정을 확인해야 해요.` |

UX 기준:

- provider 설정 누락이나 smoke mode 같은 운영 설명을 일반 사용자에게 길게 노출하지 않는다.
- 연결 계정 email은 사용자의 계정이므로 settings에는 표시하되, log/analytics에는 보내지 않는다.
- 버튼은 짧은 행동형으로 둔다.

## 3. AI 리포트에서 compose 진입

위치:

- `/app/schedules/week`
- AI weekly sales report follow-up suggestion section

흐름:

1. 사용자가 AI 리포트에서 follow-up suggestion을 확인한다.
2. email 연결이 있으면 `이메일 작성`을 누를 수 있다.
3. email 연결이 없으면 설정 이동 CTA를 보여준다.
4. compose는 기존 draft 생성/수정 흐름을 유지한다.
5. SMS 작성 버튼은 기존 구현 상태를 건드리지 않지만 G10 구현 목표에 포함하지 않는다.

문구 예:

- `이메일 작성`
- `이메일 연결이 필요해요`
- `설정으로 이동`

UX 기준:

- AI suggestion은 원본 record를 자동 변경하지 않는다.
- 자동 발송 버튼처럼 보이게 만들지 않는다.
- 사용자가 어떤 고객에게 어떤 내용이 나가는지 확인할 수 있어야 한다.

## 4. Compose 화면

필수 표시:

- 발신 email account
- 수신 담당자 이름과 email
- 제목
- 본문
- 언어
- 첫 발송 주의 안내 상태

흐름:

1. 사용자는 draft 내용을 읽는다.
2. 수신자, 제목, 본문을 수정할 수 있다.
3. 첫 발송 안내가 아직 확인되지 않았으면 확인 dialog를 본다.
4. 사용자가 `보내기`를 누른다.
5. 발송 중에는 중복 클릭을 막고 `보내고 있어요.`를 보여준다.
6. 성공하면 `보냈어요.` 상태와 timeline 이력을 보여준다.
7. 실패하면 safe error와 다음 행동을 보여준다.

문구 예:

| 상황 | 문구 |
|---|---|
| 발송 전 확인 | `수신자가 연락을 받을 수 있는 관계인지 확인해 주세요.` |
| 발송 중 | `보내고 있어요.` |
| 성공 | `보냈어요.` |
| 일반 실패 | `보내지 못했어요. 다시 시도해 주세요.` |
| 재연결 필요 | `이메일 연결이 만료됐어요. 다시 연결한 뒤 재시도해 주세요.` |
| smoke allowlist 차단 | `검증용 수신자에게만 보낼 수 있어요.` |

UX 기준:

- 실패 문구는 provider 내부 오류를 그대로 보여주지 않는다.
- retryable 실패에는 `재시도`를 보여준다.
- reconnect-required 실패에는 `다시 연결`을 우선한다.
- 본문은 상세에서 볼 수 있지만 목록/timeline에서는 preview 중심으로 둔다.

## 5. 발송 이후 timeline

표시 위치:

- AI report detail
- Deal detail activity/timeline
- Contact detail activity/timeline
- MeetingNote/Schedule 연결 timeline이 있는 경우 기존 05-B 계약을 따른다.

표시 정보:

- channel: `이메일`
- recipient name
- status
- sentAt/failedAt
- provider safe status
- 본문 상세 보기

예:

```text
이메일 · 김민수 · 보냈어요 · 8월 5일 14:10
```

실패 예:

```text
이메일 · 김민수 · 보내지 못했어요 · 다시 연결해 주세요
```

UX 기준:

- timeline item은 Attio식 activity처럼 record 맥락 안에서 읽혀야 한다.
- provider raw, token, 운영 설정값은 timeline에 표시하지 않는다.
- 고객 email은 필요 화면에서만 보이고, Admin/analytics 성격 화면에는 원문으로 확장하지 않는다.

## 6. 모바일

모바일 기준:

- settings email connection은 card/list로 표현한다.
- compose는 full-screen sheet 또는 별도 route처럼 화면을 안정적으로 차지한다.
- 390px/360px에서 발신 계정, 수신자, 제목, 본문, 버튼이 겹치지 않아야 한다.
- 긴 email은 줄바꿈 또는 truncate + 접근 가능한 전체 확인 방식으로 처리한다.
- 버튼 텍스트는 줄바꿈이 어색하면 아이콘+짧은 label을 사용한다.

검증 viewport:

- 390px
- 360px
- 768px
- 1280px
- 1440px
- 125% 확대

## 7. 개인정보 컴플레인 리스크 대응

G10 화면에서 사용자에게 길게 법률 설명을 늘어놓지 않는다. 대신 발송 전 확인과 제품 동작 자체로 위험을 줄인다.

사용자에게 분명해야 하는 것:

- 이 이메일은 사용자가 연결한 본인 Gmail/Microsoft 계정으로 발송된다.
- 고객에게 보내기 전 사용자가 본문을 확인하고 수정한다.
- 자동 발송이나 bulk campaign이 아니다.

사용자에게 노출하지 않을 것:

- provider raw error
- OAuth token/scope 세부값
- 운영 smoke allowlist 설정값
- 고객 email이 포함된 analytics/debug detail

## 8. 제외 흐름

G10에서 만들지 않는다.

- 이메일 자동 발송
- 예약 발송
- SMS 실제 provider 구현
- B2B tenant/admin 정책
- mailbox sync
- email open/click tracking
- sequence/campaign/bulk marketing
- unsubscribe 관리
- 고객 정보 enrichment

## 9. 검토 체크리스트

- [ ] `/app/settings`에서 Gmail/Microsoft 연결 상태와 다시 연결 CTA가 명확하다.
- [ ] compose에서 발신 계정, 수신자, 제목, 본문을 발송 전에 확인한다.
- [ ] 첫 발송 주의 안내가 유지된다.
- [ ] `RECONNECT_REQUIRED`가 사용자에게 다음 행동으로 이어진다.
- [ ] smoke allowlist 차단은 운영 검증 문구로만 짧게 표시된다.
- [ ] provider raw/token/internal error가 화면에 노출되지 않는다.
- [ ] Notion식 page/section 구조와 Attio식 record activity 흐름을 유지한다.
- [ ] 모바일 390px/360px에서 UI 요소가 겹치지 않는다.
- [ ] 새 FE 코드에는 한국어 `// 기능 : ...` 주석이 있다.
