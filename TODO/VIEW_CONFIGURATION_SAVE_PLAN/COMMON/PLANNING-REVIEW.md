# 보기 설정 저장 규칙 재검토

검토일: 2026-11-12. 대상: 현재 작업 트리의 필터·정렬·보기 설정 저장, 대표 이름 분리, 관련 API/FE/DB 문서. 전체 서비스 출시 검토와는 구분한다.

## 판정

현재 승인된 TABLE/KANBAN/LIST 범위는 보완 후 통과다. 처음부터 모든 규칙을 지켰다고 판정하지 않는다. 아래 코드·상태·문서 누락을 발견하고 수정했다. 특히 TODO의 FE/BE 작업 분리·작업 순서·기획 검토 기록이 빠져 있었다. 이 문서는 **구현 후 재검토**이며 사전 기획 검토를 소급해서 증명하지 않는다.

## 기준과 범위

- [저장소 규칙](../../../AGENTS.md), [BE 규칙](../../../BE/AGENTS.md), [Software 정본](../../../AGENT/SOFTWARE_AGENT/README.md).
- [Backend](../../../AGENT/SOFTWARE_AGENT/BACKEND_AGENT/README.md)의 CONVENTION/ARCHITECTURE/DECISIONS와 ENGINEERING_REVIEW_CHECKLIST: 공개 port, transaction, idempotency, 관측성, 주석·파일명, API 계약.
- [Frontend](../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/README.md)의 컨벤션/아키텍처/결정과 ENGINEERING_REVIEW_CHECKLIST: feature boundary, apiClient, query factory, 상태 격리, 실패 복구.
- [UX 검토](../../../AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md), UX writing/record 목록·상세/CRM interaction 기준, [PM 문서 규칙](../../../AGENT/PM_AGENT/CONVENTION/DOCUMENTATION.md), [필수 선행 정본 목록](../../../AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md), [기획 검토 기준](../../../AGENT/PM_AGENT/CONVENTION/PLANNING_REVIEW_CHECKLIST.md), DB schema와 시간대 정책.
- 기존 일괄 저장·대표 이름 분리 승인, 개발 서버+Supabase 사용, Docker 미사용을 유지했다. 기존 변경을 보존했고 커밋하지 않았다.

## 발견 및 보완

| 등급 | 발견 | 영향 / 보완 근거 |
|---|---|---|
| Major | Object 이름 조회 저장소가 Attribute 관계까지 직접 읽음 | Object 포인터 저장소와 application reader를 분리하고 Attribute 소유 공개 metadata port로 검증. 동일 transaction context, 잘못된 소속/삭제/타입, 순환 없는 DI 8개 테스트 통과 |
| Major | 하나의 busy flag가 다른 보기 편집까지 차단 | 보기별 pending 집합으로 분리. A 저장 중 B 편집/저장 가능, A의 완료가 B의 저장 상태와 본문을 초기화하지 않음 |
| Major | A→B→A 복귀 시 저장 표시가 사라지고 과거 방문 응답을 현재 방문으로 처리 | 방문 식별자와 pending 상태 분리. 복귀한 보기는 자기 저장 완료까지 잠기며 과거 성공 메시지를 복원하지 않음 |
| Major | 최신 설정 조회 도중 입력한 새 변경이 응답 후 삭제됨 | 요청 시 편집 객체와 현재 객체가 같은 경우에만 폐기. 위 세 비동기 문제는 수정 전 테스트 실패를 재현하고 수정 후 통과 |
| Major | 저장 후 workspace 전체 본문 초기화 및 느슨한 메뉴 predicate | 사용자/Workspace/View 단위 query factory로 설정·옵션·본문·메뉴를 한정 |
| Minor | parse/접근 실패가 mutation 실패 로그에서 누락, 내부 오류가 warn | 실패 경계를 확장하고 domain 실패는 warn, 예상 밖 오류는 error. 입력값·토큰·DB message 미노출 테스트 추가 |
| Minor | service 파일명·일부 helper 주석·기존 연결 페이지의 한국어 문체 | application.service 파일 규칙, 역할/기능/API 주석, 해요체 보완 |
| Major / 절차 | API 상태가 confirmed에 머무르고 세부 필드·오류/로그 표·FE/BE 작업 문서 누락 | implemented로 동기화, request/response/nullable/예시/오류와 DB 7개 영향 상세화. 사용자 흐름·작업 순서·BE/FE·DB·검토 기록 추가. 사전 누락은 이력상 남음 |
| Minor | FE 정본/feature README가 설정 저장·미리보기를 후속으로 설명 | 현재 구현과 날짜별 과거 기록을 구분하고 완료 기능·남은 범위를 갱신, 본문 계약의 이동 경로 수정 |

## 구조·DB·UX 확인

Application은 transaction을 소유하고 Prisma는 infrastructure에 둔다. 설정 7개 테이블은 한 View 잠금 안에서 검증 후 원자적으로 반영한다. 동일 section 재전송은 no-op, 다른 stale 변경은 409다. Object 대표 이름 포인터는 보기 표시 설정과 별개이며 새 권한 등급·Object/List 단일 소속 제약·업무값 덮어쓰기를 추가하지 않았다.

메뉴와 표 편집은 공통 초안을 사용한다. 저장 실패/409는 입력 유지, 최신 사용은 명시 행동이다. 로딩/empty/오류/권한 없음/미지원 상태와 IME·반응형 흐름을 확인했다. 기존 승인된 TABLE/칸반 재사용 범위이며 모바일 기본 본문 재설계는 이번 검토에 포함하지 않는다. 실제 연결 이름은 서버의 canonical 속성 값을 읽고 내부 ID로 라벨을 대체하지 않는다.

## 검증 결과

- Backend: 65 suites / 832 tests 통과. `TEST_DATABASE_URL=`로 전용 DB 의존 14 suites / 53 tests 제외.
- Frontend: 20 files / 112 tests 통과. 추가한 비동기 3개 사례 포함.
- BE/FE typecheck·lint·build 통과. Prisma validate 통과. 기존 SetNull 관계 경고 4개와 FE Browserslist/chunk 크기 안내는 남아 있다.
- 실제 Supabase: `scripts/verify-view-configuration.ts --read-only`로 TABLE/LIST/KANBAN 설정 조회·미리보기·저장 버전 불변 확인. 새 공개 모듈의 실제 조립/조회도 통과. 이번 검토에서는 DB 쓰기나 migration을 실행하지 않았다.
- 브라우저: 설정 저장·컬럼 표시명·11개 유형 메뉴 24개와 컬럼 생성 12개, 총 36개 통과. 새 factory의 컬럼 생성 후 캐시 갱신도 확인했다.
- 계획·연결 README 13개 문서의 상대 링크 검사에서 발견한 3개 오래된 링크를 수정했고 최종 broken link는 0개다. `git diff --check` 통과.

이전 작업의 Supabase 강제 rollback 쓰기 검증은 [README](../README.md)에 별도로 남긴다. mock 단위/E2E 결과를 live DB 쓰기 검증으로 설명하지 않는다. 배포 전 전체 User Web E2E/Admin smoke와 별도 DB 통합 gate는 이번 검토 결과로 대체하지 않는다.

## 남은 범위

별도 테스트 DB의 53개 통합 테스트는 미실행이다. 나머지 8개 타입 저장, 보기 생성/복사, 대표 속성 변경 UI, ListEntry 쓰기는 기존 제외 범위다. 현재 승인 범위에서 추가 제품 의사결정이 필요한 항목은 발견하지 않았다. 사전 문서 누락은 이번 보완으로 과거 준수 사실이 되는 것이 아니며 후속 변경은 [작업 순서](GOAL-WORK-ORDER.md)의 계약부터 확인한다.
