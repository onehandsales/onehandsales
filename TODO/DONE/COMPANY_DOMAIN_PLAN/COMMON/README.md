# Company Common Archive

> 2026-09-11 문서 정리: 현재 BE/FE 기준과 충돌하는 과거 모델/API/페이지/부수 기록 언급은 제거했다.

## 공통 계약

- 회사 목록은 `createdAt DESC`로 정렬한다.
- 회사 목록 응답에는 `updatedAt`을 포함하지 않는다.
- 회사 분야/지역 목록 응답에는 `createdAt`을 포함하지 않는다.
- 회사 상세 응답에는 회사명, 회사 분야, 회사 지역, 주소, 등록일, 최근 수정일을 포함한다.
- 회사 생성과 수정 성공은 `201 Created`와 빈 body를 사용한다.
- 분야/지역 삭제 성공은 `204 No Content`와 빈 body를 사용한다.
- xlsx export는 `200 OK`와 binary body를 사용한다.
