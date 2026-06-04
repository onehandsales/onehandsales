# AGENT 역할 구조 결정

## 결정

`AGENT` 폴더는 역할별 정본 문서 구조로 운영한다.

최종 구조:

```text
AGENT/
  PM_AGENT/
  UXUI_AGENT/
  SOFTWARE_AGENT/
```

## 이유

프로젝트 문서는 제품 기획, UX/UI 방향, 소프트웨어 구현 기준이 모두 섞이면 찾기 어렵고 책임 경계가 흐려진다.

이 프로젝트의 `AGENT`는 PM, UX/UI 리드, Software 리드가 함께 기획과 방향성을 설정하는 회의실 역할을 한다. 따라서 각 역할이 자기 관점의 정본 문서를 관리하되, 루트 `AGENT/README.md`에서 함께 연결한다.

## 역할별 책임

### PM_AGENT

- 제품 문제 정의
- MVP 범위
- 도메인 개념
- 제품 우선순위
- 문서 운영 규칙
- 역할 간 충돌의 최종 결정 기록

### UXUI_AGENT

- 사용자 흐름
- 화면 목록
- UX/UI 방향
- 화면별 정보 우선순위
- 모바일/데스크톱 패턴
- UX/UI 결정 기록

### SOFTWARE_AGENT

- Backend/User Web/Admin Web 아키텍처
- 코드 컨벤션
- 주석과 로깅
- 테스트 전략
- 배포 환경
- 기술 결정 기록

## 문서 이동 기준

- 제품 기획 문서는 `PM_AGENT/PLANNING`에 둔다.
- 사용자 흐름과 UX/UI 방향 문서는 `UXUI_AGENT/PLANNING`에 둔다.
- UX/UI 관련 결정은 `UXUI_AGENT/DECISIONS`에 둔다.
- 아키텍처 문서는 `SOFTWARE_AGENT/ARCHITECTURE`에 둔다.
- 코드/주석/로깅 컨벤션은 `SOFTWARE_AGENT/CONVENTION`에 둔다.
- 문서 작성 규칙은 PM 운영 책임으로 보고 `PM_AGENT/CONVENTION`에 둔다.

## 충돌 처리

- 제품 범위 충돌은 PM 결정이 우선한다.
- 화면 흐름 충돌은 UX/UI 결정이 우선한다.
- 구현 구조 충돌은 Software 결정이 우선한다.
- 역할 간 충돌은 `PM_AGENT/DECISIONS`에 최종 결정을 남기고 관련 역할 문서를 함께 갱신한다.

## 관련 문서

- `AGENT/README.md`
- `AGENT/PM_AGENT/OPERATING_MODEL.md`
- `AGENT/PM_AGENT/CONVENTION/DOCUMENTATION.md`
