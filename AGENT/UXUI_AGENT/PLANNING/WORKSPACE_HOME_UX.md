# Workspace Home UX

Status: UX Baseline
Date: 2026-09-12

## 1. 목적

이 문서는 Kit이 적용된 Workspace home의 UX 기준을 정의한다.

Workspace home은 사용자가 "빈 CRM에 들어왔다"가 아니라 "내 일에 맞는 CRM이 준비됐다"고 느끼는 첫 업무 화면이다.

## 2. 기본 원칙

- Workspace는 설정 대시보드가 아니라 업무 시작 화면이다.
- Kit의 관리 대상과 첫 행동이 바로 보여야 한다.
- 고급 설정, Team, billing, automation은 첫 화면에서 밀어낸다.
- 빈 상태도 "설정하세요"가 아니라 "첫 기록을 남기세요"로 이어져야 한다.

## 3. 정보 우선순위

Workspace home의 정보 우선순위는 아래 순서를 따른다.

1. 현재 적용된 Kit과 업무 맥락
2. 첫 Record 생성 CTA
3. 주요 관리 대상 진입점
4. 기본 List/View
5. 다음 행동 또는 예정된 일
6. 도움말/설정 진입점

## 4. 첫 진입 상태

첫 진입 화면은 아래를 보여준다.

- `부동산 중개 CRM`처럼 Kit 기반 Workspace 이름
- 이 Kit에서 관리하는 주요 대상
- 첫 Record 생성 버튼
- 예시 또는 empty state

예:

```text
부동산 중개 CRM이 준비됐어요.
고객, 매물, 방문, 계약을 연결해서 관리할 수 있어요.

[고객 추가] [매물 추가]
```

## 5. Empty state

빈 상태는 존재하지 않는 데이터를 있는 것처럼 꾸미지 않는다.

좋은 empty state:

- 현재 기록이 없음을 짧게 말한다.
- 다음 행동을 제안한다.
- 왜 이 행동을 하면 좋은지 한 줄로 설명한다.

피할 것:

- "데이터가 없습니다"로 끝나는 문구
- 설정/필드/권한 안내로 바로 보내는 흐름
- 샘플 데이터를 실제 데이터처럼 보이게 하는 UI

## 6. 기본 Navigation

Workspace navigation은 Kit의 관리 대상 중심으로 구성한다.

예:

- 부동산 중개: 고객, 매물, 방문, 계약
- 헤드헌팅: 후보자, 회사, 공고, 인터뷰
- 프리랜서/컨설팅: 리드, 고객사, 프로젝트, 미팅

단, 전역 navigation에서 모든 사용자에게 `회사`, `상품`, `딜`을 기본으로 고정하지 않는다.

## 7. 모바일 기준

- 첫 행동 CTA는 엄지 조작 범위 안에 둔다.
- 관리 대상 navigation은 하단 탭 또는 compact list로 재구성한다.
- home에서 너무 많은 카드가 쌓이지 않게 한다.
- 첫 Record 생성까지 이동 단계가 2단계를 넘지 않게 설계한다.

## 8. 관련 문서

- `AGENT/PM_AGENT/PLANNING/FIRST_USE_EXPERIENCE.md`
- `AGENT/PM_AGENT/PLANNING/CRM_CORE_CONCEPT_MODEL.md`
- `AGENT/UXUI_AGENT/PLANNING/FIRST_USE_FLOW.md`
- `AGENT/UXUI_AGENT/DECISIONS/005_uxui_home_screen.md`
