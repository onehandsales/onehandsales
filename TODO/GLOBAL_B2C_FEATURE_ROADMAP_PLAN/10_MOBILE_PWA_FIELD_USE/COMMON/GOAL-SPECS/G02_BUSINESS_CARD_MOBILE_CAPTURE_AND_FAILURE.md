# G02 BusinessCard Mobile Capture And Failure

상태: Ready

## 1. 목적

모바일 브라우저에서 명함을 촬영/업로드하고 OCR 실패를 safe response로 처리해 사용자가 즉시 재시도 또는 수동 입력을 할 수 있게 한다.

## 2. 포함 범위

- BusinessCard mobile file/camera input UX
- `POST /api/business-card-scans` mobile upload contract 반영
- `BusinessCardScanLog` safe failure fields migration
- OCR failure safe code/userMessage/retryable mapping
- list/detail response `failure` nullable field
- OCR 실패 analytics server event
- BE/FE/tests

## 3. 제외 범위

- custom `getUserMedia` camera UI
- native app camera module
- Admin provider failure dashboard
- provider raw detail user response
- server draft

## 4. Request 계약

기준 문서: `COMMON/API-SPEC/BUSINESS_CARD_MOBILE_CAPTURE_AND_FAILURE_CONTRACT.md`

`POST /api/business-card-scans`

```ts
type CreateBusinessCardScanRequest = {
  image: File;
};
```

Multipart field:

- `image`: required, max 10MB

Mobile input:

```tsx
<input type="file" accept="image/*" capture="environment" />
```

`POST /api/business-card-scans/:scanLogId/confirm`

- 기존 confirm request DTO 유지
- local draft id를 request에 넣지 않음

## 5. Response 계약

`BusinessCardScanLogResponse`에 아래 field를 추가한다.

```ts
failure: {
  errorCode: string;
  userMessage: string;
  retryable: boolean;
} | null;
```

규칙:

- `OCR_SUCCESS`, `CONFIRMED`: `failure: null`
- `OCR_FAILED`: `failure` 필수
- 과거 failed row에 safe field가 없으면 mapper fallback 적용

## 6. Backend Business Logic

1. image file validation을 controller/pipe 또는 application boundary에서 수행한다.
2. OCR provider 오류를 safe failure code로 map한다.
3. 실패도 scan log로 저장한다.
4. `safeErrorCode`, `safeErrorMessage`, `retryable`을 response mapper에서 반환한다.
5. confirm transaction은 기존 company/contact 연결 로직을 유지한다.
6. `business_card_ocr_failed` server analytics event는 best effort로 기록한다.
7. provider raw detail은 response/log/analytics에 넣지 않는다.

## 7. User Flow

1. `/app/business-cards`에서 촬영/업로드 CTA를 누른다.
2. native file/camera picker에서 이미지를 선택한다.
3. 업로드 중 진행 상태를 표시한다.
4. OCR 성공 시 confirm form으로 이동한다.
5. OCR 실패 시 safe message와 `다시 촬영`, `파일 바꾸기`, `수동 입력`을 표시한다.
6. confirm form 수정값은 G04 local draft와 연동한다.
7. 저장 성공 시 list/detail cache를 갱신하고 draft를 삭제한다.

## 8. DB/Prisma 영향

`BE/prisma/schema.prisma`의 `BusinessCardScanLog`에 추가:

```prisma
safeErrorCode    String?
safeErrorMessage String?
retryable        Boolean @default(false)

@@index([userId, status, safeErrorCode, createdAt])
```

마이그레이션 규칙:

- 기존 migration 수정 금지
- 새 migration 생성
- 추가 field에는 Prisma 한국어 주석을 작성
- migration SQL에는 `COMMENT ON COLUMN`을 작성
- 기존 row는 nullable/default로 보존
- provider raw detail 저장 금지

## 9. 코드 주석 기준

Backend:

- 신규/수정 controller endpoint에 `// API : ...`
- OCR failure mapper/service/repository helper에 `// 기능 : ...`
- response mapper class/interface에 `// 역할 : ...`

Frontend:

- capture component/hook/API client/error mapper에 `// 기능 : ...`

## 10. 검증

권장 command:

```powershell
pnpm --dir BE test -- business-card
pnpm --dir BE prisma validate
pnpm --dir FE/user-web test -- business-card
pnpm --dir FE/user-web test:e2e -- mobile-business-card-capture
```

프로젝트 script명이 다르면 package.json 기준으로 동등한 targeted command를 실행하고 기록한다.

## 11. Goal 검토 체크리스트

- [ ] `BE/prisma/schema.prisma`를 먼저 확인했다.
- [ ] 새 migration만 추가했다.
- [ ] `BusinessCardScanLog` safe failure fields가 있다.
- [ ] 추가 field에 Prisma 한국어 주석이 있다.
- [ ] migration SQL에 `COMMENT ON COLUMN`이 있다.
- [ ] create/list/detail response에 `failure`가 있다.
- [ ] OCR failed response에서 `failure`가 null이 아니다.
- [ ] provider raw error/detail이 response/log/analytics에 없다.
- [ ] mobile input이 `accept="image/*"`와 `capture="environment"`를 사용한다.
- [ ] custom camera UI를 만들지 않았다.
- [ ] 실패 UX에 `다시 촬영`, `파일 바꾸기`, `수동 입력`이 있다.
- [ ] 새로 만들거나 의미 있게 수정한 공개 함수/핵심 함수에 한국어 주석을 적용했다.
- [ ] Global B2C 개인 영업자 모바일 현장 업무 target을 벗어나지 않았다.
- [ ] UX/UI 변경 전 `AGENT/UXUI_AGENT` 기준을 확인했다.
- [ ] Software/architecture 변경 전 `AGENT/SOFTWARE_AGENT` 기준을 확인했다.
- [ ] 360px/390px viewport에서 주요 CTA가 겹치지 않는다.
- [ ] BE/FE/E2E targeted 검증 결과를 기록했다.
- [ ] `COMMON/GOAL-REVIEW-CHECKLIST.md`를 확인했다.

## 12. 실행 결과

구현 후 기록한다.
