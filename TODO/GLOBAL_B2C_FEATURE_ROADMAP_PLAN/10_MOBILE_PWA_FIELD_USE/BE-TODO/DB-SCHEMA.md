# DB Schema TODO

상태: Draft

## 모델 후보

- 1차는 새 DB 없이 FE local draft일 수 있다.
- server draft가 필요하면 `UserDraft` 후보를 검토한다.
- audio/provider log는 07과 연결한다.
- BusinessCard provider failure detail은 11 Provider failure log와 연결한다.
- native app device/session 확장이 필요하면 AuthDevice 정책과 연결한다.

## 결정 baseline 반영 후 세부 확인

- offline draft는 client local draft 우선, server draft 예외 여부
- server draft 보관 기간
- 음성 파일은 STT/회의록 저장 이후 장기 보관하지 않는 기준
- PWA push subscription은 02 Notification과 공유한다.
- OCR failure detail을 BusinessCardScanLog에 얼마나 저장할지
- native app device slot이 필요한지

## migration 주의

- 모바일 draft는 민감정보가 포함될 수 있다.
- 장기 보관보다 짧은 TTL을 기본으로 검토한다.
- provider 원문 에러와 사용자 메시지는 분리한다.
