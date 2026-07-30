# Scope

상태: Confirmed

## 1. 포함 범위

| 항목 | 포함 내용 | 1차 구현 기준 |
|---|---|---|
| 모바일 명함 촬영 | 후면 카메라 호출, 앨범 선택, 다시 촬영, 파일 바꾸기, 촬영 품질 안내 | `input type=file`, `accept="image/*"`, `capture="environment"` 기반 |
| BusinessCard OCR 실패 계약 | 사용자 안전 `errorCode`, `userMessage`, `retryable`, 재시도 UX | provider raw detail은 사용자 응답과 FE log에 노출 금지 |
| 회의록 모바일 녹음 | `MediaRecorder` 녹음 시작/정지/초안 만들기 | 기존 `/api/meeting-notes/stt-draft` 재사용 |
| 음성 fallback | 녹음 권한 거부/미지원 시 음성 파일 업로드 | 25MB 이하, `audio/*` 기반 |
| FE local draft | 명함 확인 폼, 회의록 작성 폼 | IndexedDB 우선, 24시간 TTL, 서버 DB 저장 제외 |
| 모바일 알림 permission UX | push 권한 안내, 거부/미지원 fallback, 설정 이동 | 02 Notification API 재사용 |
| 모바일 field-use analytics | 명함 촬영/재시도, OCR 실패, 녹음, draft 복원/폐기, push 권한 결과 | 09 `ProductAnalyticsEvent` foundation 재사용 |
| Native app 위치 | iOS/Android 둘 다 후속 필수 로드맵으로 승격 | 10에서는 구현하지 않음 |

## 2. 제외 범위

| 항목 | 제외 이유 | 후속 위치 |
|---|---|---|
| native iOS/Android 구현 | 10 1차는 모바일 웹/PWA 필수 현장 UX를 빠르게 제공한다 | 별도 native app roadmap |
| custom `getUserMedia` 명함 카메라 preview/crop | browser camera/file capture보다 호환성/테스트 부담이 큼 | mobile advanced capture 후속 |
| 완전 오프라인 sync | 충돌 해결, ownership, server merge 정책이 큼 | 별도 offline sync 계획 |
| server draft DB | 민감정보 보관/삭제/계정 삭제 정책이 커짐 | 10 이후 별도 roadmap/goal에서 재의사결정 |
| 마케팅 push 자동 opt-in | 약관 동의로 browser/OS 권한을 대체할 수 없음 | 12 Billing/Marketing policy |
| Admin provider failure dashboard | 10은 사용자-facing safe failure만 다룸 | 11 Admin Operation |
| PWA install prompt/offline shell 실제 구현 | 10 1차는 현장 입력성 우선 | PWA packaging 후속 goal |

## 3. 품질 기준

- 390px/360px 모바일 브라우저에서 버튼과 입력이 겹치지 않는다.
- 모바일 기본 UI에 desktop table을 억지로 유지하지 않는다.
- 촬영/녹음/권한 요청은 사용자 행동에 직접 연결된다.
- 실패 안내는 해요체와 행동형 문구를 사용한다.
- local draft에는 이미지/audio blob/transcript/provider raw response를 저장하지 않는다.
- analytics payload에는 이름, 전화번호, 이메일, 회사명, 회의록 본문, OCR raw text를 넣지 않는다.
