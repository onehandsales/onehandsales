# 10 Mobile PWA Field Use

상태: Draft Slot
순서: 10
성격: 기능 구현 전 검토 슬롯

## 1. 목적

모바일 브라우저와 PWA 기반으로 현장에서 명함 촬영, 음성 기록, 빠른 메모, push reminder, 오프라인 draft를 사용할 수 있게 한다. 명함 OCR 고도화와 OCR provider failure 사용자 UX도 이 슬롯에서 다룬다.

## 2. 현재 상태

- 현재 제품은 반응형 Web과 모바일 브라우저 범위다.
- 네이티브 iOS/Android는 범위 밖이다.
- 명함 OCR은 파일 업로드 기반이다.
- 회의록 STT draft는 구현되어 있으나 모바일 현장 flow는 별도 고도화가 필요하다.
- BusinessCard OCR provider failure code/message contract는 아직 정교화되지 않았다.
- Apple login은 iOS/native app 전략과 연결될 수 있다.

## 3. 착수 전 해야 할 일

1. PWA부터 할지, 모바일 Web polish부터 할지 정한다.
2. 카메라 촬영, 음성 녹음, offline draft 범위를 나눈다.
3. browser push는 02 notification과 연결한다.
4. 네이티브 앱 전환 기준을 별도 판단한다.
5. 명함 OCR 실패/재시도/촬영 품질 안내와 provider error redaction 기준을 정한다.

## 4. 참고

- `COMMON/REFERENCES.md`
- `AGENT/PM_AGENT/PLANNING/GLOBAL_B2C_SERIES_A_ROADMAP.md`
