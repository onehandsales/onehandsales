# Review Checklist

상태: Confirmed

## 1. Product Analytics 질문

- [ ] 이 event가 Global B2C 첫 판매 판단에 필요한가?
- [ ] 이 event가 activation, retention, AI usage, conversion 준비 중 어디에 쓰이는가?
- [ ] server event와 client event 경계가 명확한가?
- [ ] 같은 사용자 행동이 중복 event로 과대 계산되지 않는가?
- [ ] event 이름이 `snake_case`이고 의미가 안정적인가?
- [ ] eventVersion이 payload schema와 연결되는가?

## 2. Privacy 질문

- [ ] payload에 PII/raw text가 없는가?
- [ ] 이름, 이메일, 전화번호, 회사명, 담당자명이 없는가?
- [ ] 메모, 회의록 본문, AI prompt/raw response가 없는가?
- [ ] payload 원문을 application log에 남기지 않는가?
- [ ] 계정 삭제 30일 유예 후 hard delete 기준과 충돌하지 않는가?
- [ ] raw event 365일 retention purge가 가능한가?

## 3. Global B2C 질문

- [ ] timezone 기준이 미국/한국/일본/유럽 사용자 모두에서 자연스러운가?
- [ ] DB 원본 UTC와 사용자 local `eventDate`가 함께 보존되는가?
- [ ] activation/retention 계산이 현재 timezone 변경이 아니라 event row의 `eventDate`를 기준으로 하는가?
- [ ] public/auth/광고 attribution과 `/app` product usage를 혼동하지 않는가?
- [ ] 12 Billing에서 바뀔 수 있는 event를 09에서 확정처럼 쓰지 않는가?

## 4. Engineering 질문

- [ ] `AGENT/SOFTWARE_AGENT`의 API/transaction/observability 규칙을 따르는가?
- [ ] `AGENT/UXUI_AGENT`의 기존 user flow를 방해하지 않는가?
- [ ] 기존 BE module 구조와 provider wiring을 따른다.
- [ ] 신규/수정 Backend 코드에 `// API : ...`, `// 역할 : ...`, `// 기능 : ...` 한국어 주석이 있다.
- [ ] 신규/수정 Frontend 코드에 `// 기능 : ...` 한국어 주석이 있다.
- [ ] 신규 Prisma enum/model/field에 `/// 기능 : ...` 주석과 migration SQL COMMENT가 있다.
- [ ] test/typecheck/lint/build를 실행했거나 사유를 기록했다.
