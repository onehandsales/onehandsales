# Trash Delete Policy Backend Guide

현재 휴지통 정책은 Company, Contact, Product, Deal과 각 도메인의 메모/다음 행동 row에 적용한다.

## 원칙

- 사용자 소유권을 먼저 확인한다.
- 삭제는 `deletedAt`, `deletedByUserId`, `trashExpiresAt`을 설정하는 soft delete로 처리한다.
- 일반 목록, 상세, 검색, export는 `deletedAt IS NULL` row만 대상으로 한다.
- 휴지통 목록은 복구 기간이 남은 row만 보여준다.
- 복구는 원 row의 소유권과 복구 가능 기간을 다시 검증한다.

## 활성 대상

- Company
- CompanyMemoLog
- CompanyUserPrivateMemoLog
- Contact
- ContactMemoLog
- ContactUserPrivateMemoLog
- Product
- ProductMemoLog
- ProductUserPrivateMemoLog
- Deal
- DealFollowingActionLog
- DealMemoLog

## 제외 대상

- 인증/세션 row
- 제품 분석 snapshot
- 오류 신고와 지원 문의 row
- 공개 문의 row
