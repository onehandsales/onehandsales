# Release QA Follow-up Common

## 1. 목적

이 폴더는 UX/UI 공통 QA 이후 남은 출시 전 품질 작업에서 FE와 BE가 함께 보는 기준을 관리한다.

## 2. 현재 문서

- `USER-FLOW.md`: QA 대상 사용 흐름
- `GOAL-WORK-ORDER.md`: `/goal` 실행 순서
- `PLANNING-REVIEW.md`: 구현 전 계획 검토 결과
- `ISSUE-LOG.md`: 발견 이슈와 미검증 항목
- `QA-RESULTS.md`: goal별 QA 결과 기록
- `API-SPEC/README.md`: 이번 계획의 API 계약 상태와 후속 API 후보
- `GOAL-SPECS/*`: `/goal` 실행 상세 명세

## 3. 공통 판단 기준

- 이번 계획의 기본 대상은 `FE/user-web`과 `BE`다.
- Admin 운영 화면 구현은 포함하지 않는다.
- User Web은 `/api/*`만 호출하고 `/admin/api/*`를 호출하지 않는다.
- 모바일 QA는 네이티브 앱이 아니라 모바일 브라우저 Web QA다.
- Chrome/Edge QA는 최신 설치 브라우저 channel을 기준으로 한다.
- 자동화 QA가 실제 브라우저 channel 부재로 막히면 `Blocked`로 기록하고 수동 Edge 확인 또는 브라우저 설치를 별도 조치로 남긴다.
- API response shape나 DB schema를 바꾸는 수정은 `COMMON/API-SPEC` 계약을 먼저 작성한 뒤 구현한다.
- S0/S1/S2는 기능 추가보다 먼저 처리한다.

## 4. 이슈 기록 규칙

`ISSUE-LOG.md`에는 아래 상태 중 하나를 사용한다.

- `Open`: 아직 처리하지 않은 실제 이슈 또는 미검증 품질 gap
- `Fixed`: 수정과 검증이 끝난 이슈
- `Deferred`: 이번 계획 밖으로 명시 분리한 이슈
- `N/A`: 현재 제품 범위가 아닌 항목
- `Blocked`: 환경, 계정, provider, DB 상태 때문에 확인할 수 없는 항목

심각도는 `AGENT/SOFTWARE_AGENT/COMMON/QA_CHECKLIST.md` 기준을 따른다.

## 5. 관련 문서

- `TODO/USER_WEB_RELEASE_QA_FOLLOWUP_PLAN/README.md`
- `AGENT/SOFTWARE_AGENT/COMMON/QA_CHECKLIST.md`
- `AGENT/PM_AGENT/DECISIONS/029_global_b2c_series_a_priority.md`
