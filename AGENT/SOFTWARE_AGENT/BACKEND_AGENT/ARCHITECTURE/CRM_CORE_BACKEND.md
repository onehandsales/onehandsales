# CRM Core Backend — 기존 구현과 Bonsai 전환

Updated: 2026-11-17

## 기존 구현 기록

`workspace`, `object-definition`, `attribute-definition`, `record-definition`, `list-definition`, `view-definition` 모듈의 기록은 [API 목록](../../COMMON/API_SAMPLE.md)과 [구현 현황](../../../PM_AGENT/PLANNING/IMPLEMENTATION_STATUS.md)을 따른다. 이번 작업에서 실행 코드를 재검증하지 않았다.

Object/List 생성은 관련 공개 port를 조율해 첫 View·설정을 같은 트랜잭션에 저장한다. 기존 View는 7개 설정 테이블과 미리보기·명시적 저장·버전 충돌 처리를 사용한다.

## 목표 책임 후보

고객·담당자·거래, 견적·단가, 문서·서명, 프로젝트·작업·시간·배정, 비용·예산·청구·입금, 포털·공유, 사용자 필드·보기, 자동화·연동·보고서를 업무 책임에 따라 나눈다. 이는 module/API 경로의 확정 목록이 아니다.

## 계약 요구

- 계정·Workspace·멤버·고객·프로젝트·재무 접근을 application에서 검증한다.
- 견적 수정, 문서 발송·서명, 프로젝트 생성, 청구·입금의 상태와 데이터 snapshot을 구분한다.
- 생성·전환의 원자성과 재시도·중복 방지, 금액·통화·반올림을 명시한다.
- 저장 방식은 화면별 근거를 확인하고 동시 수정·실패 복구를 정의한다.
- 삭제·보관·취소·연결 해제의 영향과 보존 범위를 각각 정한다.
- 외부 발송·서명·결제·동기화는 긴 DB 트랜잭션 밖에서 조율하고 필요한 outbox·멱등성·관측성을 설계한다.
- 다른 모듈의 repository를 직접 사용하지 않는다. 공개 application/query port와 application 소유 transaction을 유지한다.

[DB 계획](../../DB_SCHEMA/BONSAI_SCHEMA_PLAN.md), [전환 영향](../../COMMON/BONSAI_TRANSITION_MATRIX.md), [Bonsai 공개 API 참고](../../COMMON/BONSAI_API_REFERENCE.md)를 따른다. 공개 API 스키마를 우리 내부 DB나 API의 확정 계약으로 복사하지 않는다.
