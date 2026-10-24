# 사이드바 업무 목록 UX를 관리 항목과 통일

상태: 구현·검증 완료 / 2026-10-24

## 1. 목적과 확정 동작

사용자는 업무 목록에도 현재 관리 항목의 UX/UI를 그대로 적용하도록 요청했다. 이전 연동에서 추가한 업무 목록 전용 안내·재시도를 제거한다.

| 상태 | 적용 동작 |
| --- | --- |
| 최초 조회 중 | 관리 항목과 같은 공통 Skeleton. 추가 버튼은 로딩 완료 후 표시 |
| 데이터 존재 | API 순서대로 이름·아이콘 표시. 행 크기·간격·hover 색상 일치 |
| 성공한 빈 배열 | 안내 문구 없이 목록 행을 비우고 기존 추가 버튼만 표시 |
| 최초 조회 실패 | 오류·재시도 UI 없이 관리 항목과 같은 빈 목록 처리 |
| 캐시가 있는 재조회 실패 | 관리 항목처럼 기존 목록 데이터를 유지 |

List 화면 이동·생성·View 연동, Backend/API/DB 변경은 포함하지 않는다.

## 2. 구현과 검증 순서

1. AppShell과 SidebarNav의 업무 목록 전용 오류·재시도 props/handler를 제거한다.
2. 공통 Skeleton을 같은 조건으로 표시하고 빈 목록은 null로 반환한다. 행 스타일을 관리 항목과 맞추고 사용하지 않는 번역을 제거한다.
3. 기존 업무 목록 E2E의 빈 목록·오류 기대값을 사용자 요청에 맞추고 정상/로딩/전환과 기존 헤더를 검증한다.
4. typecheck/lint/test/build와 검토 결과를 기록한다.

## 3. 기준과 관련 문서

- [Frontend 사용 기준](COMMON/API-SPEC/README.md)
- [기획 검토](COMMON/PLANNING-REVIEW.md)
- [작업 로그](../../../TODO_LOG/2026-10-24/SIDEBAR_WORK_LISTS_UX_PARITY/WORK_LOG.md)
- [Software 정본 참조](../../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md)

## 4. 결과

업무 목록 전용 안내/오류/재시도 props·handler·번역을 제거했다. 두 영역이 같은 로딩 분기와 공통 Skeleton을 사용하고 빈 배열에서 목록을 렌더링하지 않는다. 업무 목록 행의 hover/active 배경과 글자·아이콘 색상을 관리 항목과 맞췄다.

typecheck/lint, 단위 테스트 10개 파일·33개, 업무 목록 4건과 기존 헤더 1건의 Playwright, build가 통과했다. 기존 build chunk 크기 경고는 유지된다. API/Query/인증/관리 항목 기능과 업무 화면 route를 변경하지 않았다.
