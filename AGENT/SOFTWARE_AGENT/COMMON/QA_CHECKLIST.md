# OneHand CRM QA 체크리스트

참고 기준 갱신: 2026-11-17. 과거 구현·검증 날짜는 아래 기록을 따른다.

Date: 2026-11-15

## 검증 선택

변경한 파일과 실제 영향에 맞는 검증을 실행한다. 문서 변경은 링크·경로·구현 사실·이전 결정 충돌·diff 검사를 우선한다. runtime 검증을 실행하지 않았으면 명시한다.

| 변경 | 검증 |
| --- | --- |
| Backend 실행 코드 | typecheck, lint, 관련 unit/integration test, 필요한 build |
| Prisma | validate/generate, migration·데이터·무결성 검증 |
| User Web 실행 코드 | typecheck, lint, 관련 test, build, 영향 흐름 E2E |
| Admin 실행 코드 | typecheck, lint, build, 영향 흐름 E2E |
| 문서·공개 텍스트만 | 링크, 내용, 소스 정합성, 문법·diff 검사 |

명령은 각 package.json과 BE/FE README를 따른다. 테스트가 실제 외부 provider·원격 DB에 연결되는지 먼저 확인한다.

## 현재 구현 회귀

Auth·refresh·logout, Workspace 진입·접근 검사, Object/List 생성, Record 생성·값 수정, View 조회·미리보기·설정 저장·409 복구, 사이드바/즐겨찾기, 계정·지원·공개 문의를 변경 영향에 따라 확인한다.

## Bonsai 전환

- [ ] 고객·거래·견적·문서·프로젝트·청구의 연결과 수정 범위가 일관된다.
- [ ] Workspace·업무 대상·멤버·고객 포털의 소유·공유 범위가 일치한다.
- [ ] 목록·보드 이동·필터·정렬과 화면별 저장·새로고침이 연결된다.
- [ ] 견적·발송 문서·청구·입금의 금액·통화·상태·중복 처리가 계약과 일치한다.
- [ ] 그룹 제외·그룹 삭제·레코드 삭제·View 삭제가 구분된다.
- [ ] 메모·작업·동기화 데이터의 공개 범위와 권한이 유지된다.
- [ ] 이전 데이터·옵션·연결·설정이 유실되지 않는다.
- [ ] mock과 실제 기능, 미확인과 검증 완료가 구분된다.
- [ ] [UX 검토](../../UXUI_AGENT/UX_REVIEW_CHECKLIST.md)와 [기능 대응표](../../PM_AGENT/PLANNING/BONSAI_FEATURE_PARITY_MATRIX.md)가 갱신된다.
