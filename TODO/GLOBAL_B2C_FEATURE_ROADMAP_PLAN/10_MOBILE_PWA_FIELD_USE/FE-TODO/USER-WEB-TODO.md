# User Web TODO

상태: Confirmed

## 1. 목적

10번 Mobile/PWA Field Use에서 User Web이 구현해야 하는 모바일 현장 입력 UX를 `/goal` 단위로 고정한다.

## 2. 대상 화면

| Goal | Route/Feature | 처리 |
|---|---|---|
| G02 | `/app/business-cards` | mobile capture/upload, OCR failure retry/manual input |
| G02/G04 | BusinessCard confirm form | local draft save/restore/delete |
| G03 | `/app/meeting-notes` 또는 create dialog | mobile recording, audio upload fallback, STT draft |
| G03/G04 | MeetingNote create form | local draft save/restore/delete |
| G05 | `/app/notifications` 또는 settings area | browser push permission UX |
| G06 | analytics helper | mobile field-use client events |

## 3. G02 BusinessCard UI TODO

- [x] 모바일 CTA는 실제 업무 시작 버튼이어야 하며 landing/hero를 만들지 않는다.
- [x] native file/camera input을 사용한다.
- [x] input attribute는 `type="file"`, `accept="image/*"`, `capture="environment"`를 사용한다.
- [x] custom `getUserMedia` camera UI를 만들지 않는다.
- [x] upload loading/progress 상태를 보여준다.
- [x] OCR 실패 시 safe `userMessage`만 표시한다.
- [x] OCR 실패 CTA는 `다시 촬영`, `파일 바꾸기`, `수동 입력`을 제공한다.
- [x] provider/quota/API key/internal error 문구를 사용자에게 표시하지 않는다.

## 4. G03 MeetingNote UI TODO

- [ ] `MediaRecorder` 지원 여부를 감지한다.
- [ ] 녹음 시작/정지/취소/초안 만들기 상태를 제공한다.
- [ ] microphone permission prompt는 사용자 클릭 이후에만 호출한다.
- [ ] permission denied/unsupported 상태에서 audio file upload fallback을 제공한다.
- [ ] STT draft 성공 후 사용자가 저장하기 전까지 자동 저장하지 않는다.
- [ ] audio blob/base64를 local draft에 저장하지 않는다.

## 5. G04 Local Draft UI TODO

- [ ] IndexedDB primary local draft utility를 만든다.
- [ ] IndexedDB unavailable fallback을 제공한다.
- [ ] TTL은 저장 시점 기준 24시간이다.
- [ ] restore prompt copy는 `작성 중이던 내용을 불러올까요?`다.
- [ ] 버튼은 `불러오기`, `버리기`다.
- [ ] 저장 성공/버리기/만료/schema mismatch 시 draft를 삭제한다.
- [ ] BusinessCard confirm form과 MeetingNote create form에 연동한다.
- [ ] image/audio blob/base64, transcript 전문, provider raw response를 저장하지 않는다.

## 6. G05 Notification UI TODO

- [ ] 서비스성 알림과 마케팅성 알림 copy를 분리한다.
- [ ] browser push CTA는 `푸시 알림 켜기`를 사용한다.
- [ ] `Notification.requestPermission()`은 사용자 클릭 이후에만 호출한다.
- [ ] `granted`, `denied`, `default`, unsupported 상태별 UI를 제공한다.
- [ ] denied 상태에서는 브라우저/OS 설정 안내를 제공한다.
- [ ] 회원가입/약관 동의로 browser push 자동 허용 처리했다는 copy를 쓰지 않는다.

## 7. G06 Analytics UI TODO

- [ ] 명함 촬영 시작/재시도 event를 보낸다.
- [ ] 회의 녹음 시작/종료/실패 event를 보낸다.
- [ ] local draft 저장/복구/폐기 event를 보낸다.
- [ ] push permission 안내/결과 event를 보낸다.
- [ ] analytics 실패가 사용자 작업을 막지 않는다.
- [ ] payload에 이름/전화/email/company/memo/details/transcript/audio/image/token을 넣지 않는다.

## 8. UX/UI 기준

- Notion/Attio reference처럼 조용하고 작업 중심 UI를 유지한다.
- 모바일 첫 화면은 실제 작업 화면이어야 한다.
- 카드 남발, 장식용 hero, 설명용 landing을 만들지 않는다.
- CTA와 입력은 360px/390px에서 겹치지 않아야 한다.
- 실패 copy는 짧고 다음 행동이 분명해야 한다.
- 버튼/입력/상태 UI는 반복 사용에 적합해야 한다.

## 9. 검증

권장 command:

```powershell
pnpm --dir FE/user-web test -- business-card
pnpm --dir FE/user-web test -- meeting-note
pnpm --dir FE/user-web test -- local-draft
pnpm --dir FE/user-web test -- notification
pnpm --dir FE/user-web test -- analytics
pnpm --dir FE/user-web test:e2e -- mobile
```

프로젝트 script명이 다르면 `FE/user-web/package.json` 기준으로 동등한 targeted command를 실행하고 결과를 각 goal final에 기록한다.

## 10. 완료 불가 조건

- [ ] 모바일 CTA가 landing/marketing hero로 시작한다.
- [ ] custom camera UI를 만들었다.
- [ ] 녹음 미지원 브라우저 fallback이 없다.
- [ ] local draft가 DB/server API를 사용한다.
- [ ] browser push가 사용자 클릭 없이 요청된다.
- [ ] analytics/local draft에 민감 원문이 저장된다.
