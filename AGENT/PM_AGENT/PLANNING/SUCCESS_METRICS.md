# 성공 지표

Status: PM Measurement Baseline
Date: 2026-09-12

## 1. 목적

이 문서는 OneHand CRM의 제품 성공 여부를 PM 관점에서 판단하기 위한 지표를 정의한다.

초기에는 매출보다 activation과 Kit fit을 우선한다. 사용자가 결제하기 전에, 제품이 정말 "내 일에 맞는 CRM이 바로 준비된다"는 가치를 주는지 확인해야 한다.

## 2. 최상위 질문

PM이 가장 먼저 확인해야 할 질문은 아래다.

- 사용자가 CRM을 직접 설계하지 않고 시작했는가?
- 선택한 Kit이 자기 일에 맞는다고 느끼는가?
- 첫 기록을 만들었는가?
- 첫 기록 이후 다시 돌아왔는가?
- 어떤 지점에서 막혔는가?

## 3. Activation 지표

| 지표 | 의미 |
| --- | --- |
| 가입 완료율 | 공개 사이트 또는 초대에서 가입까지 도달하는 비율 |
| Kit 선택 완료율 | 가입 후 업무 유형 또는 Kit을 선택한 비율 |
| Workspace 준비 완료율 | Kit 선택 후 Workspace가 준비된 비율 |
| 첫 Record 생성률 | 신규 사용자가 첫 업무 기록을 만든 비율 |
| 첫 Record 생성까지 걸린 시간 | 제품이 얼마나 빠르게 시작되는지 보는 지표 |
| 두 번째 행동 비율 | 첫 Record 이후 추가 기록, 관계 연결, 다음 행동 입력을 한 비율 |

## 4. Kit Fit 지표

| 지표 | 의미 |
| --- | --- |
| Kit 유지율 | 사용자가 선택한 Kit을 계속 사용하는 비율 |
| 필드 수정 요청 | 기본 필드가 실제 업무와 맞지 않는 정도 |
| Object 추가 요청 | Kit에 빠진 관리 대상이 있는지 확인 |
| 상태 변경 요청 | 기본 상태가 실제 업무 단계와 맞는지 확인 |
| 지원 문의 주제 | 사용자가 어느 개념에서 막히는지 확인 |

## 5. Retention 지표

| 지표 | 의미 |
| --- | --- |
| D1 재방문 | 첫 사용 다음 날 다시 들어오는가 |
| D7 재방문 | 일주일 안에 업무 기록을 다시 확인하는가 |
| 주간 Record 생성 수 | 실제 업무 관리에 반복 사용되는가 |
| 다음 행동 완료율 | CRM이 기록 저장을 넘어 행동 관리까지 돕는가 |

## 6. 품질 지표

| 지표 | 의미 |
| --- | --- |
| 첫 사용 중 오류 신고 | onboarding 또는 CRM Core 품질 문제 |
| 지원 문의 전환율 | 사용자가 셀프 온보딩에 실패한 비율 |
| 로그인/세션 실패율 | foundation 안정성 문제 |
| 모바일 첫 기록 성공률 | 이동 중 사용 가능한지 확인 |

## 7. Beta 판단 기준

베타에서 PM이 확인할 최소 기준:

- 사용자가 제품 설명 없이 Kit 개념을 이해한다.
- 첫 Record 생성까지 큰 설명이 필요하지 않다.
- 첫 Kit의 관리 대상과 상태가 실제 업무와 크게 어긋나지 않는다.
- 사용자가 "직접 CRM을 만든다"보다 "준비된 CRM을 시작한다"고 느낀다.
- 반복 사용 이유가 단순 호기심이 아니라 실제 업무 기록이다.

## 8. 아직 매출을 최우선으로 보지 않는 이유

현재 단계에서 결제 전환율은 후순위다.

이유:

- CRM Core와 첫 Kit fit이 아직 검증되지 않았다.
- 결제를 먼저 붙이면 plan, entitlement, tax, invoice, refund 정책 변경 비용이 크다.
- 초기 PM 리스크는 "돈을 받을 수 있는가"보다 "쓸 만한 제품인가"다.

## 9. 관련 문서

- `README.md`
- `AGENT/PM_AGENT/PLANNING/PRODUCT_DIRECTION.md`
- `AGENT/PM_AGENT/PLANNING/FIRST_USE_EXPERIENCE.md`
- `AGENT/PM_AGENT/PLANNING/KIT_STRATEGY.md`
- `AGENT/PM_AGENT/PLANNING/ROADMAP.md`
- `AGENT/PM_AGENT/DECISIONS/030_billing_paddle_defer_policy.md`
