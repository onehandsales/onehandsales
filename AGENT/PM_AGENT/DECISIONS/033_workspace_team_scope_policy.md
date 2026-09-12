# 033 Workspace Team Scope Policy

Date: 2026-09-12
Status: Confirmed

## 1. 결정

Workspace는 후속 CRM Core의 기본 제품 개념으로 둔다.

Team은 향후 협업과 권한을 위한 개념으로 보류한다. MVP에서는 개인 사용자가 기본 Workspace를 받아 Kit 기반 CRM을 시작하는 흐름을 우선한다.

## 2. 이유

OneHand CRM의 초기 제품 가설은 "팀 협업 SaaS"가 아니라 "내 일에 맞는 CRM이 바로 준비된다"는 경험이다.

Team/조직 권한을 먼저 설계하면 다음 문제가 생긴다.

- onboarding이 무거워진다.
- 권한과 초대 정책이 CRM Core보다 먼저 복잡해진다.
- 첫 Kit과 첫 Record 검증이 늦어진다.

따라서 MVP에서는 Workspace를 데이터와 CRM 구조의 기본 단위로만 다루고, Team은 후속 단계로 둔다.

## 3. MVP 범위

MVP에서 허용:

- 개인 사용자 기본 Workspace
- Workspace에 Kit 적용
- Workspace 안에서 Record 생성/조회/수정
- Workspace 단위의 CRM 구조 보존

MVP에서 제외:

- Team 생성/초대
- 역할별 권한
- 조직 소유권 이전
- 팀별 billing
- 고급 permission matrix

## 4. 문서 사용 규칙

- PM 문서에서 Workspace는 후속 CRM Core의 핵심 개념으로 사용할 수 있다.
- PM 문서에서 Team은 확정 기능처럼 쓰지 않는다.
- Team을 구현 대상으로 올리려면 별도 PM 결정, UX/UI 흐름, Software 설계가 필요하다.

## 5. 관련 문서

- `AGENT/PM_AGENT/PLANNING/CRM_CORE_CONCEPT_MODEL.md`
- `AGENT/PM_AGENT/PLANNING/MVP_SCOPE.md`
- `AGENT/PM_AGENT/PLANNING/ROADMAP.md`
