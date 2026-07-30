# Architecture Guardrails

상태: Confirmed

## 1. Backend

- User API는 `/api/*`를 사용한다.
- Admin/운영 조회는 `/admin/api/*`로 분리하고 10에서 만들지 않는다.
- BusinessCard OCR safe failure는 User API response에 안전 field만 추가한다.
- provider raw error, prompt, quota detail, stack trace는 User API response에 넣지 않는다.
- OCR/STT provider 호출은 infrastructure adapter 뒤에 둔다.
- application layer가 transaction 경계를 결정한다.
- 외부 provider 호출은 DB transaction 안에서 오래 실행하지 않는다.
- 새 Prisma migration은 기존 migration 파일을 수정하지 않고 신규 migration으로만 만든다.

## 2. Frontend

- User Web은 `/admin/api/*`를 호출하지 않는다.
- API client는 `src/lib/api-client.ts`를 통해 호출한다.
- 서버 상태는 TanStack Query를 사용한다.
- local draft는 서버 상태가 아니며 TanStack Query cache에 넣지 않는다.
- 모바일 record/list는 desktop table을 억지로 유지하지 않는다.
- 버튼과 action에는 lucide icon을 우선 사용한다.
- 사용자 노출 문구는 해요체를 따른다.

## 3. DB/Prisma

- 10 기본 DB 변경은 `BusinessCardScanLog` safe failure field 추가다.
- `ProductAnalyticsEvent`는 eventName string/payloadJson 확장만 사용하고 새 table을 만들지 않는다.
- local draft는 DB에 저장하지 않는다.
- audio/image binary는 DB에 저장하지 않는다.
- provider raw detail은 `BusinessCardScanLog`에 저장하지 않는다.
- Admin provider failure log는 11에서 별도 정책으로 다룬다.

## 4. Privacy / Security

- local draft에는 이미지/audio blob을 저장하지 않는다.
- local draft TTL은 24시간이다.
- transcript는 local draft에 저장하지 않는다.
- analytics payload는 PII/raw text를 금지한다.
- browser push permission은 사용자 명시 클릭으로만 요청한다.
- 회원가입/약관 동의는 browser/OS permission을 대체하지 않는다.

## 5. Native app boundary

- iOS/Android native app은 필수 후속 로드맵이다.
- 10에서 native app 코드를 만들지 않는다.
- 10의 모바일 웹/PWA 구현은 native app 전환 시 재사용 가능한 API/UX 계약을 남긴다.
