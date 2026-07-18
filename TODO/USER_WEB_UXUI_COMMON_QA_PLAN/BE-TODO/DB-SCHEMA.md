# DB Schema TODO

이번 계획의 DB 변경 상태: 없음.

## 하지 않는 것

- Prisma schema 수정
- migration 추가
- seed 수정
- ImportJob table 추가
- Notification table 추가
- Payment/subscription table 추가
- Product analytics table 추가

## QA 중 DB/운영 이슈로 분리할 조건

- 다중 계정 데이터가 섞인다.
- Trash retention/restore 기준이 화면과 맞지 않는다.
- Export 결과에 다른 사용자 데이터가 포함된다.
- Prisma generate/migration/seed 운영 정합성 문제가 확인된다.
- Company, Contact, Product, Deal, Schedule, MeetingNote의 고정 sales record 관계가 화면 계약과 맞지 않는다.
- Memo 기록과 activity/log 성격의 데이터가 화면에서 구분 불가능할 정도로 schema 의미가 모호하다.

이 경우 `USER_WEB_UXUI_COMMON_QA_PLAN`에서 해결하지 않고 별도 DB/Backend 계획을 만든다.
