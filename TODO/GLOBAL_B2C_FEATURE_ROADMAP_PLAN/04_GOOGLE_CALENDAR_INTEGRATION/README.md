# 04 Google Calendar Integration

상태: Draft Slot
순서: 04
성격: 기능 구현 전 검토 슬롯

## 1. 목적

사용자가 Google Calendar와 연결해 외부 일정을 가져오고, 한손에 영업 일정과 외부 일정의 관계를 관리할 수 있게 한다.

## 2. 현재 상태

- 일정 CRUD와 월/주 calendar view는 구현되어 있다.
- MVP 문서에는 Google Calendar connect/import가 있었지만 현재 Backend API와 DB 모델은 없다.
- 현재 auth provider는 Google OAuth login 중심이며 Calendar scope 연결과는 분리되어야 한다.

## 3. 착수 전 해야 할 일

1. Google login과 Calendar connection scope를 분리한다.
2. read-only import인지, 양방향 sync인지 결정한다.
3. source, externalEventId, sync token, conflict 정책을 정한다.
4. provider failure와 token refresh 보관 기준을 정한다.

## 4. 참고

- `COMMON/REFERENCES.md`
- `TODO/DONE/MVP-STARTER_PLAN/BE-TODO/API-TODO.md` Schedule Google Calendar 항목
