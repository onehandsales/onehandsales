# 제품 로드맵

Status: Current PM Roadmap
Date: 2026-09-12

## 1. 목적

이 문서는 OneHand CRM의 제품 개발 순서를 PM 관점에서 정의한다.

로드맵은 일정 약속이 아니라 우선순위 기준이다. 각 단계는 이전 단계의 제품 가설과 구현 안정성이 확인된 뒤 다음 단계로 이동한다.

## 2. 현재 기준

현재 코드는 CRM Core가 없는 foundation 상태다.

활성 foundation:

- Auth/User
- Error Report
- Support Request
- Public Contact Request
- Health
- Admin 권한 확인
- User Web `/app`, `/app/more`, 계정 설정, 도움말, 공개 문의

다음 핵심 과제는 결제가 아니라 No Setup CRM 제품 가설 검증이다.

## 3. Phase 0: Foundation 정리

목표:

- 현재 남아 있는 foundation이 안정적으로 동작하게 유지한다.
- 제거된 고정형 CRM 도메인이 문서와 화면에서 활성 기능처럼 보이지 않게 한다.

완료 기준:

- 현재 활성 BE/FE/Prisma 범위가 문서와 일치한다.
- `/app` 이후 route가 활성 기능만 노출한다.
- 공개 문의 회사명/회사 규모는 문의 원문 필드로 유지한다.

## 4. Phase 1: 첫 Kit 결정

목표:

- 첫 출시 Kit을 1개 이상 확정한다.
- Kit이 해결할 사용자 문제와 관리 대상을 확정한다.

완료 기준:

- `034_first_kit_selection_policy.md` 기준으로 첫 Kit이 선택된다.
- 해당 Kit의 관리 대상, 관계, 필수 정보, 상태, 기본 보기, 첫 기록 흐름이 PM 문서에 정리된다.
- UX/UI와 Software가 후속 설계를 시작할 수 있다.

## 5. Phase 2: CRM Core MVP

목표:

- Workspace, Kit, Object, Attribute, Relationship, Record, View의 최소 제품 흐름을 구현할 수 있는 계획을 확정한다.

완료 기준:

- PM 개념 모델이 Software 설계로 변환된다.
- 기본 Workspace 생성 흐름이 정해진다.
- 첫 Kit 적용 후 Record를 생성/조회/수정할 수 있다.
- 기본 List/View가 동작한다.

## 6. Phase 3: First Use Activation

목표:

- 신규 사용자가 가입 후 첫 10분 안에 첫 기록을 만들게 한다.

완료 기준:

- 업무 유형 선택 흐름이 있다.
- Kit 적용 결과가 사용자가 이해할 수 있게 보인다.
- 첫 Record 생성률을 측정할 수 있다.
- 빈 상태가 설정 안내가 아니라 첫 행동 안내로 작동한다.

## 7. Phase 4: Beta

목표:

- 결제 없이 제한된 사용자에게 제품 가설을 검증한다.

완료 기준:

- 100명 내외 베타 운영이 가능하다.
- activation, retention, support issue를 측정한다.
- 첫 Kit의 구조가 실제 사용자 업무와 맞는지 검증한다.
- 결제 없이도 사용자가 반복해서 돌아오는지 확인한다.

## 8. Phase 5: Expansion

목표:

- 첫 Kit에서 검증된 CRM Core를 다른 Kit으로 확장한다.

후보:

- 두 번째 Kit 출시
- Kit별 확장 제안
- 기본 import/export
- 개인 생산성 중심의 알림/리마인더
- 더 정교한 View

## 9. Phase 6: Monetization

목표:

- 제품 사용성과 리텐션이 확인된 뒤 결제/구독을 검토한다.

포함 후보:

- plan
- entitlement
- Paddle Billing
- trial
- invoice/tax
- usage limit

결제는 제품 가설 검증 전 우선순위가 아니다.

## 10. 관련 문서

- `README.md`
- `AGENT/PM_AGENT/PLANNING/PRODUCT_DIRECTION.md`
- `AGENT/PM_AGENT/PLANNING/MVP_SCOPE.md`
- `AGENT/PM_AGENT/PLANNING/KIT_STRATEGY.md`
- `AGENT/PM_AGENT/PLANNING/SUCCESS_METRICS.md`
- `AGENT/PM_AGENT/DECISIONS/030_billing_paddle_defer_policy.md`
