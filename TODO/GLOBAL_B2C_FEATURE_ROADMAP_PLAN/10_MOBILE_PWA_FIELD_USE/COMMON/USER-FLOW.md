# User Flow

상태: Confirmed

## 1. 모바일 명함 촬영

1. 사용자가 모바일에서 `/app/business-cards`로 이동한다.
2. 사용자가 `명함스캔`을 누른다.
3. 화면은 `사진 찍기`와 `앨범에서 선택` 행동을 제공한다.
4. `사진 찍기`는 `capture="environment"` 기반으로 후면 카메라를 유도한다.
5. 사용자가 명함 사진을 선택하면 미리보기를 보여준다.
6. 화면은 촬영 품질 안내를 짧게 보여준다.
   - 예: `밝은 곳에서 명함 전체가 보이게 찍어 주세요.`
7. 사용자가 `명함스캔`을 누르면 기존 `POST /api/business-card-scans`로 OCR을 요청한다.
8. 요청 중에는 사진 교체/삭제와 모달 닫기를 막는다.
9. OCR 성공 시 추출 결과 확인/수정 폼을 보여준다.
10. 사용자가 보정 후 저장하면 기존 confirm API로 회사/담당자를 저장한다.
11. OCR 실패 시 safe failure message와 `다시 촬영`, `파일 바꾸기`, `수동 입력` 행동을 제공한다.

## 2. OCR 실패 UX

1. Backend는 실패 원인을 safe error code로 정규화한다.
2. User Web은 `errorCode`, `userMessage`, `retryable`만 사용한다.
3. provider raw error, quota, API key, prompt, stack trace는 사용자에게 보이지 않는다.
4. `retryable=true`면 `다시 촬영`, `파일 바꾸기`, `수동 입력`을 제공한다.
5. 후속 code에서 `retryable=false`가 추가되면 `수동 입력`과 `나중에 다시 시도`를 제공한다.

사용자 문구 예:

- `사진이 흐려서 내용을 읽기 어려워요. 밝은 곳에서 다시 찍어 주세요.`
- `명함을 읽지 못했어요. 다시 찍거나 파일을 바꿔 주세요.`
- `지금은 명함을 읽기 어려워요. 잠시 후 다시 시도해 주세요.`

## 3. 회의 직후 음성 기록

1. 사용자가 모바일에서 `/app/meeting-notes` 또는 `/app/meeting-notes/new/full`로 이동한다.
2. 회의 일시, 회사, 담당자, 필요 시 제품/딜을 선택한다.
3. 사용자가 `녹음 시작`을 누른다.
4. 브라우저가 microphone permission을 요청한다.
5. 권한이 허용되면 녹음 상태와 경과 시간을 보여준다.
6. 사용자가 `정지`를 누른다.
7. 사용자가 `초안 만들기`를 누르면 audio blob을 기존 `/api/meeting-notes/stt-draft`로 전송한다.
8. STT+AI 초안이 `details`, `nextPlan`, `requiredAction`에 채워진다.
9. 사용자는 초안을 확인/수정한 뒤 기존 회의록 생성 API로 저장한다.
10. transcript는 검토용으로만 표시하고 local draft에 저장하지 않는다.

## 4. 녹음 권한 거부/미지원 fallback

1. 사용자가 녹음을 시작한다.
2. 브라우저가 `denied` 또는 unsupported 상태를 반환한다.
3. 화면은 이유를 짧게 말하고 다음 행동을 제공한다.
4. 사용자는 기존 `음성 파일` 업로드로 초안을 만들 수 있다.

문구 예:

- `마이크 권한이 꺼져 있어요. 브라우저 설정에서 권한을 켜거나 음성 파일을 올려 주세요.`
- `이 브라우저에서는 바로 녹음할 수 없어요. 음성 파일을 올려 주세요.`

## 5. local draft 복원

1. 사용자가 명함 확인 폼 또는 회의록 작성 폼을 입력한다.
2. FE가 입력값을 local draft로 저장한다.
3. 사용자가 새로고침하거나 화면을 벗어난 뒤 24시간 안에 돌아온다.
4. 화면은 `작성 중이던 내용을 불러올까요?`를 보여준다.
5. 사용자가 `불러오기`를 누르면 draft를 복원한다.
6. 사용자가 `버리기`를 누르면 draft를 즉시 삭제한다.
7. 저장 성공 시 draft를 삭제한다.
8. 24시간이 지나면 draft를 자동 폐기한다.

## 6. 모바일 push permission

1. 사용자가 `/app/notifications` 또는 모바일 알림 설정 영역에 들어온다.
2. 화면은 알림 이점을 설명한다.
   - 예: `알림을 켜면 일정과 딜 마감을 놓치지 않아요.`
3. 사용자가 `푸시 알림 켜기`를 누른다.
4. 그때만 `Notification.requestPermission()`을 호출한다.
5. 허용되면 browser push subscription을 기존 API에 등록한다.
6. 거부되면 앱 안 알림과 이메일 알림 fallback을 안내한다.
7. 사용자는 설정에서 browser push를 끌 수 있다.

## 7. Native app 후속 흐름

10번 완료 후 별도 native app roadmap에서 iOS/Android 앱을 다룬다.

후속 native app 필수 범위:

- native camera
- native audio recording
- native push
- auth callback
- app store 배포
- mobile device/session 정책
