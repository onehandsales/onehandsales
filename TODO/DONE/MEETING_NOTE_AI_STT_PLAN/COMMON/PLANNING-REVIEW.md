# 기획 검토 결과

## 1. 결론

- 판정: 통과
- 이유: 회의록 AI/STT 초안 생성은 기존 MeetingNote 저장 API와 분리된 읽기/외부 provider 호출 기능이며, DB 저장 없이 응답으로만 초안을 반환할 수 있다.

## 2. 검토 기준

- Clean Architecture: controller, application service, provider port, infrastructure adapter로 분리한다.
- Provider 경계: AI 초안 생성과 STT를 별도 provider port로 둔다.
- Ownership: 사용자가 선택한 회사/담당자/제품/딜 ID를 현재 사용자 소유 데이터로 검증한다.
- Persistence: 초안 API는 transcript, raw text, provider raw response를 저장하지 않는다.
- Observability: provider 실패 context만 안전하게 남기고 회의 본문, transcript, 음성 내용은 로그에 남기지 않는다.
- Testing: 실제 provider 호출 없이 fake provider로 application/controller 테스트를 작성한다.

## 3. 검토 발견 사항

| 등급 | 항목 | 내용 | 조치 |
|---|---|---|---|
| Major | Provider 분리 | AI는 OpenAI 고정이지만 STT는 향후 Google/AWS로 바뀔 수 있다. | `MeetingNoteAiDraftProvider`와 `MeetingNoteSttProvider`를 분리한다. |
| Minor | 파일 크기 | 브라우저 녹음/업로드 파일 크기와 형식 제한이 필요하다. | Backend 25MB 제한과 audio 계열 mime type 검증을 둔다. |
| Minor | Provider 설정 | 운영 환경에 provider env가 없으면 장애가 명확히 드러나야 한다. | 설정 누락은 503으로 변환한다. |

## 4. 후속 검토 사항

- Google/AWS STT adapter 비교와 품질 테스트
- provider 사용량/비용 추적 테이블
- transcript 영구 저장 여부
- 브라우저 녹음 UX

## 5. 첫 실행 goal

- `G01-BE-MEETING-NOTE-AI-STT-DRAFT`
