# 사이드바 즐겨찾기 기획 검토

- 일자: 2026-10-24
- 기획 판정: 통과 — 계약 확정 후 구현 착수
- 구현 검토: 완료 — 실제 DB 검증 환경 제약은 아래에 명시
- 기준: Backend/Front 엔지니어링 리뷰와 PM 기획 검토 기준

최소 응답과 조회 API 1개·공통 UI 연결 요청에 일치한다. type/부모 소속을 목록에서 제외하고 즐겨찾기 ID와 View ID를 구분한다. 멤버 ID는 인증 사용자에서 도출하고 View Workspace 조건을 명시했다.

새 view-definition 모듈의 읽기 책임과 Workspace 공개 Port 경계, transaction 없음·기존 request id·민감정보 로그 제외가 구체화됐다. 기존 DB를 사용하고 미정인 중복·View 기본 선택·등록/해제 정책을 확정하지 않는다.

Frontend는 기존 SidebarDataSection을 사용한다. 현재 없는 View 상세 API/route를 추가하거나 클릭이 동작하는 것으로 표시하지 않는다. 전체 View 데이터 조회는 후속 범위이며 이번 작업은 합의한 목록 조회·표시 연동이다.

## 구현 검토 결과

- Controller/UseCase/Query Port/Repository/Module 계층과 Workspace 공개 Port 경계를 준수했다. 응답은 4개 필드이며 조회 조건은 서버가 확인한 멤버·Workspace·연결 View의 Workspace다.
- 기존 AuthGuard, UUID 검증, 전역 오류 변환과 apiClient를 재사용했다. 새 제약·권한 등급·DB 변경·추가 endpoint·가짜 View route를 만들지 않았다.
- 세 사이드바 영역은 같은 SidebarDataSection/목록/행/Skeleton을 사용한다. 조회 실패와 빈 목록에 별도 문구·재시도를 추가하지 않았다.
- 컴파일·린트·Prisma 검증, DB를 제외한 BE 테스트 218개, FE 단위 테스트 33개와 관련 브라우저 시나리오 9개가 통과했다.
- 실제 DB 테스트는 localhost:5432 미가동으로 연결 실패했다. DB 비활성화 실행의 skip 14개를 성공으로 계산하지 않는다. 실제 DB 격리·정렬 검증은 테스트 DB 기동 후 재확인이 필요하다.
