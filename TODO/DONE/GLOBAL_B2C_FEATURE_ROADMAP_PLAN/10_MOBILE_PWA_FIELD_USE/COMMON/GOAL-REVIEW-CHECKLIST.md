# Goal Review Checklist

상태: Confirmed

## 1. 목적

각 `/goal` final 전에 구현자가 반드시 확인해야 하는 공통 리뷰 항목을 정의한다. 구현자는 이 공통 리뷰와 현재 goal 문서의 `Goal 검토 체크리스트`를 함께 확인한다.

## 2. 공통 리뷰

- [ ] goal 범위 밖 기능을 구현하지 않았다.
- [ ] native iOS/Android app 구현을 10번에서 시작하지 않았다.
- [ ] PWA install/offline shell을 10번에서 핵심 범위로 확장하지 않았다.
- [ ] `/api/drafts/*`, `UserDraft`, server draft sync를 만들지 않았다.
- [ ] 기존 migration 파일을 수정하지 않고 새 migration만 추가했다.
- [ ] DB column/model/table 추가 또는 생성 시 Prisma 한국어 주석과 migration SQL COMMENT를 검토했다.
- [ ] 운영/공유 DB migrate/seed를 무단 실행하지 않았다.
- [ ] 새로 만들거나 의미 있게 수정한 공개 함수/핵심 함수에 한국어 주석 규칙을 적용했다.
- [ ] 새 env var가 있으면 `AGENT/SOFTWARE_AGENT/COMMON/ENVIRONMENT.md` 반영 여부를 검토했다.
- [ ] 실행 command와 결과를 final 또는 closeout에 기록했다.
- [ ] 실행하지 못한 검증이 있으면 사유를 기록했다.

## 3. API 리뷰

- [ ] 관련 `COMMON/API-SPEC/*.md`와 실제 controller path/method/DTO가 일치한다.
- [ ] request body가 user/session/device id를 client에서 받지 않는다.
- [ ] response DTO에 provider raw detail이 없다.
- [ ] safe error code와 userMessage가 계약과 일치한다.
- [ ] analytics 실패가 사용자 작업 성공 UX를 막지 않는다.

## 4. DB 리뷰

- [ ] `BE/prisma/schema.prisma`를 먼저 확인했다.
- [ ] `BusinessCardScanLog` migration 외 신규 DB model을 만들지 않았다.
- [ ] 신규 DB field/model/table에는 한국어 설명 주석이 있다.
- [ ] migration SQL에는 가능한 경우 `COMMENT ON COLUMN` 또는 `COMMENT ON TABLE`이 있다.
- [ ] local draft는 DB에 저장하지 않는다.
- [ ] audio/image binary를 DB에 저장하지 않는다.
- [ ] `ProductAnalyticsEvent.payloadJson`에 PII/raw text가 없다.
- [ ] `UserNotificationSetting.browserPushEnabled`가 browser permission 자동 허용처럼 취급되지 않는다.

## 5. Backend 리뷰

- [ ] provider 호출을 장기 DB transaction 안에 넣지 않았다.
- [ ] provider raw error/prompt/raw response를 log/response에 넣지 않았다.
- [ ] owner scope 검증이 필요한 API에서 인증 사용자 기준을 유지했다.
- [ ] server analytics event 기록 실패가 본 mutation을 rollback하지 않는다.
- [ ] controller/service/repository 경계가 기존 module 패턴을 따른다.

## 6. Frontend 리뷰

- [ ] 모바일 360px/390px에서 주요 CTA와 입력 필드가 겹치지 않는다.
- [ ] 명함 촬영은 native file/camera input을 사용한다.
- [ ] 회의 녹음은 `MediaRecorder`와 audio file fallback을 모두 제공한다.
- [ ] local draft restore prompt에는 `불러오기`, `버리기`가 있다.
- [ ] browser push permission은 사용자 클릭 이후에만 요청한다.
- [ ] `console.log`를 남기지 않았다.

## 7. UX/UI 리뷰

- [ ] Notion/Attio reference에 맞춰 조용하고 작업 중심의 UI를 유지한다.
- [ ] Global B2C 개인 영업자의 모바일 현장 업무를 1차 target으로 유지한다.
- [ ] UX/UI 변경 전 `AGENT/UXUI_AGENT` 기준 문서를 확인했다.
- [ ] Software/architecture 변경 전 `AGENT/SOFTWARE_AGENT` 기준 문서를 확인했다.
- [ ] feature 설명용 landing/hero를 만들지 않았다.
- [ ] 버튼/입력/상태 UI가 반복 사용에 적합하다.
- [ ] 사용자 copy는 짧고 행동 중심이다.
- [ ] 브라우저/권한/녹음 실패 상태를 사용자가 다음 행동으로 이어갈 수 있게 안내한다.

## 8. Privacy 리뷰

- [ ] name/email/phone/companyName/contactName을 analytics payload에 넣지 않았다.
- [ ] memo/details/transcript를 analytics payload에 넣지 않았다.
- [ ] image/audio blob 또는 base64를 local draft에 넣지 않았다.
- [ ] push endpoint/key/token을 log/analytics에 넣지 않았다.
- [ ] 마케팅/광고성 알림 동의를 서비스성 알림과 섞지 않았다.
