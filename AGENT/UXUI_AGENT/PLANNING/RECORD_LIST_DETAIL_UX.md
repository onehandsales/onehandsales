# Record List / Detail UX

Status: Target research
Date: 2026-11-15

folk의 Table/Pipeline 및 레코드 상세 흐름을 같은 데이터로 검증한다. 근거는 [조사 문서](FOLK_BENCHMARK_RESEARCH.md)의 F02/F03/F04/F06이다.

## 목록

객체 탭과 View 선택을 구분한다. 컬럼 표시·순서, 필터·정렬, 선택·일괄 작업, 인라인 편집, 추가 버튼, 로딩·빈·오류 상태를 수집한다. 데이터가 많을 때 가로/세로 스크롤과 pagination/infinite loading을 실제 화면에서 확인한다.

## Pipeline

그룹 기준 필드, 옵션별 열, 미분류 값, 카드 표시 필드, drag/drop, 열 숨김·순서, 건수·집계를 확인한다. 카드 이동이 저장하는 필드 값과 실패 시 되돌림을 API 계약에 연결한다.

## 상세와 입력

People/Companies/Custom object별 기본 정보, 그룹별 필드, 연결, 메모·작업·상호작용 탭, 추가·수정·삭제·돌아가기와 포커스를 확인한다. 우측 패널/모달/전체 페이지를 기존 규칙으로 고정하지 않는다.

## 저장·삭제

folk 도움말은 view 설정 자동 저장을 설명한다. 현재 앱의 preview/save/undo와 구분해 전환한다. 삭제 대상·범위·취소·복구는 실제 관찰 전 임의로 확정하지 않는다.

Desktop/mobile 각각 원본 근거와 상태별 차이를 기록하고 API·권한·데이터 요구를 함께 남긴다.
