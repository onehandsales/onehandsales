# Goal Review Checklist

> 2026-09-11 문서 정리: 현재 BE/FE 기준과 충돌하는 과거 모델/API/페이지/부수 기록 언급은 제거했다.

상태: Confirmed

## 1. Security

- [ ] AdminGuard 없이 Admin API가 열리지 않는다.
- [ ] target user/record 존재 여부를 권한 실패 응답에서 노출하지 않는다.
- [ ] 민감 원문은 일반 response에 섞이지 않는다.
- [ ] raw access reason은 빈 문자열을 허용하지 않는다.
- [ ] audit log에 원문 민감값을 저장하지 않는다.

## 2. Privacy

- [ ] email/phone/provider email은 기본 masked다.
- [ ] provider raw response/prompt/token/quota detail은 조회하지 않는다.
- [ ] browser push endpoint/key/userAgent 원문은 Admin response/log에 노출되지 않는다.
- [ ] mobile analytics raw payload는 Admin response에 dump하지 않는다.

## 3. UX/UI

- [ ] `AGENT/UXUI_AGENT` Admin tone을 따른다.
- [ ] table/filter/detail panel 중심이다.
- [ ] 긴 텍스트가 table layout을 깨지 않는다.
- [ ] empty/error/loading 상태가 있다.
- [ ] 위험 action은 modal과 reason/confirm UI가 있다.

## 4. Software

- [ ] `AGENT/SOFTWARE_AGENT` Backend/Frontend/DB 컨벤션을 따른다.
- [ ] transaction과 audit boundary가 명확하다.
- [ ] 외부 provider 호출을 transaction 안에서 길게 수행하지 않는다.
- [ ] Prisma select가 원문 금지 field를 조회하지 않는다.
- [ ] test가 권한/마스킹/audit 실패 케이스를 포함한다.
