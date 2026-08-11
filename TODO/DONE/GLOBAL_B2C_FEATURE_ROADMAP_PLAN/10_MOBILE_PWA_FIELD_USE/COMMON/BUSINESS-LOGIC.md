# Business Logic

상태: Confirmed

## 0. Software Agent 기준

10의 비즈니스 로직은 `AGENT/SOFTWARE_AGENT` 기준을 따른다.

필수 원칙:

- controller에는 비즈니스 로직을 두지 않는다.
- application layer가 인증, validation, ownership, transaction 경계를 책임진다.
- 외부 OCR/STT provider 호출은 DB transaction 안에서 오래 실행하지 않는다.
- provider raw response, prompt, quota detail, API key, stack trace는 사용자 응답과 log에 남기지 않는다.
- FE local draft는 서버 상태가 아니며 TanStack Query cache에 넣지 않는다.
- 모든 신규/수정 Backend 코드에는 한국어 `역할/API/기능` 주석 규칙을 적용한다.
- 모든 신규/수정 Frontend component/hook/API client에는 `// 기능 : ...` 주석을 적용한다.

## 1. BusinessCard mobile capture

1. FE는 모바일에서 후면 카메라를 유도하는 파일 input을 제공한다.
2. FE는 파일 타입과 크기를 사전 검증한다.
3. 허용 MIME은 1차로 `image/jpeg`, `image/png`, `image/webp`다.
4. HEIC/HEIF는 1차에서 지원하지 않고 safe validation error로 안내한다.
5. FE는 선택한 이미지 file/blob을 local draft에 저장하지 않는다.
6. `POST /api/business-card-scans`는 multipart field `image`만 받는다.
7. Backend는 AuthGuard로 현재 사용자를 확인한다.
8. Backend는 file 존재, MIME, 크기를 검증한다.
9. OCR provider를 transaction 밖에서 호출한다.
10. OCR 성공 시 `BusinessCardScanLog`를 `OCR_SUCCESS`로 저장한다.
11. OCR 실패 시 provider raw detail을 safe failure로 정규화하고 `BusinessCardScanLog`를 `OCR_FAILED`로 저장한다.
12. 사용자 응답에는 `failure.errorCode`, `failure.userMessage`, `failure.retryable`만 포함한다.

## 2. BusinessCard confirm local draft

1. OCR 성공 후 FE는 확인/수정 폼 값을 local draft에 저장한다.
2. 저장 대상은 회사명, 회사분야, 회사지역, 담당자명, 휴대폰, 이메일, 부서, 직급이다.
3. draft envelope은 `schemaVersion`, `draftType`, `draftKey`, `savedAt`, `expiresAt`, `payload`를 가진다.
4. 24시간 TTL이 지나면 복원하지 않고 삭제한다.
5. 사용자가 확정 저장하면 draft를 삭제한다.

## 3. MeetingNote mobile recording

1. FE는 `MediaRecorder` 지원 여부를 확인한다.
2. 지원하면 사용자 클릭으로 microphone permission을 요청한다.
3. 녹음 중 경과 시간과 정지 action을 보여준다.
4. audio blob을 생성한 뒤 기존 `POST /api/meeting-notes/stt-draft`에 `audio` multipart field로 보낸다.
5. Backend는 기존 STT+AI provider log 정책을 사용한다.
6. STT transcript는 응답으로만 반환하고 저장 request에는 포함하지 않는다.
7. 사용자는 초안을 수정한 뒤 기존 `POST /api/meeting-notes`로 저장한다.
8. 권한 거부/미지원이면 음성 파일 업로드 fallback을 제공한다.

## 4. MeetingNote local draft

1. FE는 회의록 작성 폼의 긴 입력을 local draft에 저장한다.
2. 저장 대상은 `title`, `meetingLocalDateTime`, 선택한 회사/담당자/제품/딜 ID, `details`, `nextPlan`, `requiredAction`, `sourceType`이다.
3. transcript, audio blob, provider raw response, follow-up body는 local draft에 저장하지 않는다.
4. 복원은 사용자 확인 후에만 수행한다.
5. 저장 성공, 사용자 버림, TTL 만료 시 삭제한다.

## 5. Mobile notification permission

1. 앱 안 알림은 기존 02 Notification 설정을 사용한다.
2. Browser push는 사용자 클릭으로만 권한 prompt를 띄운다.
3. 권한 허용 후 기존 `GET /api/notifications/browser-push/public-key`와 `POST /api/notifications/browser-subscriptions`를 호출한다.
4. 권한 거부/미지원이면 앱 안 알림과 email fallback을 안내한다.
5. 회원가입/약관 동의는 browser/OS permission을 대체하지 않는다.
6. 마케팅 알림은 서비스 알림과 분리하고 10에서 구현하지 않는다.

## 6. Mobile field-use analytics

1. FE mobile field-use event는 `VITE_PRODUCT_ANALYTICS_ENABLED="true"`일 때만 보낸다.
2. FE는 userId/sessionId/deviceId/targetId를 보내지 않는다.
3. Backend는 09 collector와 server recorder 정책을 재사용한다.
4. event별 payload는 allowlist schema만 허용한다.
5. analytics 저장 실패는 제품 기능 실패로 전파하지 않는다.
6. payload에는 name, email, phone, companyName, meeting note body, OCR raw text, transcript, image/audio metadata 원문을 넣지 않는다.
