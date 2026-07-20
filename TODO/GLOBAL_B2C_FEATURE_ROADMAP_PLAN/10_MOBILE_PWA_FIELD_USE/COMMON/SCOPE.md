# Scope

상태: Draft

## 포함 후보

| 항목 | 내용 |
|---|---|
| PWA | install prompt, manifest, offline shell 후보 |
| 모바일 명함 촬영 | camera capture 중심 UX |
| 모바일 음성 기록 | 회의 직후 음성 녹음/STT draft |
| Offline draft | 입력 중 데이터 임시 저장 |
| Browser push | 02 notification과 연결 |
| BusinessCard OCR 고도화 | 촬영 품질 안내, OCR 실패 코드/메시지, 재시도 UX |
| Provider failure UX | OpenAI/OCR/STT 실패를 사용자 안전 문구로 표시 |
| Native app 후보 | iOS/Android, native push, camera, audio, contact/calendar 후보 |

## 제외 후보

| 항목 | 이유 |
|---|---|
| 완전 오프라인 sync | 범위가 큼 |

## 열린 질문

- PWA는 첫 판매 전에 필요한가, Series A 후보인가?
- offline draft는 어떤 데이터까지 저장할지?
- 모바일 카메라 촬영은 business card에만 적용할지?
- 음성 파일을 저장할지, STT 후 폐기할지?
- OCR 실패는 재촬영, 파일 교체, 나중에 다시 시도 중 어떤 UX를 제공할지?
- provider failure code를 FE에 어느 수준으로 노출할지?
- iOS/Android native app 전환 기준은 PWA 지표로 판단할지?

## 완료 기준 초안

- 모바일에서 명함 촬영 흐름이 자연스럽다.
- 회의 직후 음성 기록 draft를 만들 수 있다.
- 입력 중 draft 유실을 줄인다.
- PWA/push 범위가 문서화된다.
- OCR 실패와 provider 장애가 안전하게 안내된다.
- native app 후보와 Apple login 연결 시점이 문서화된다.
