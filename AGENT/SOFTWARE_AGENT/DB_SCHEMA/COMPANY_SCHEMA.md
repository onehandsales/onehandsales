# 고정형 고객사 DB Schema 제거 기록

이 문서는 과거 고정형 고객사 schema 결정을 활성 기준으로 설명하지 않는다.

현재 `BE/prisma/schema.prisma`에는 고정형 고객사 관리 모델이 없다.

## 현재 상태

- 고정형 고객사 record 모델 없음
- 고객사 분야/지역 옵션 모델 없음
- 고객사 전용 검색 모델 없음
- 고객사 xlsx export용 schema 없음

## 보존해야 하는 예외

`PublicContactRequest`에는 문의자가 입력하는 회사명과 회사 규모 필드가 남아 있다. 이는 공개 문의 원문 보존 필드이며 고정형 CRM record가 아니다.

## 후속 방향

다음 CRM 코어는 Workspace/Object/Attribute/Record/List/View 기반으로 별도 설계한다.
