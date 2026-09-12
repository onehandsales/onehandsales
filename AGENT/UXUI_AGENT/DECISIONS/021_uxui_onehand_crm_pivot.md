# UX/UI OneHand CRM Pivot Decision

Date: 2026-09-12

## 1. 결정

UXUI_AGENT의 기준 제품명과 화면 방향을 `OneHand CRM`으로 변경한다.

이전의 고정형 개인 영업 CRM 기준은 더 이상 UX/UI 정본이 아니다.

## 2. 의미

OneHand CRM의 화면은 아래 제품 약속을 증명해야 한다.

- Zero Setup: 사용자가 CRM을 직접 만들지 않는다.
- Work-aware: 사용자의 업무에 맞는 Kit이 준비된다.
- Infinite Expansion: 필요할 때 업무 언어로 확장한다.

## 3. UX 영향

- 첫 화면은 고정형 Deal/Product/Contact 중심으로 설계하지 않는다.
- 첫 사용자는 업무 유형을 선택하고 Kit이 적용된 Workspace로 들어간다.
- 내부 CRM Core 용어는 사용자 화면에서 숨긴다.
- 확장은 설정 builder가 아니라 업무 언어 기반 제안으로 다룬다.

## 4. 제거한 기준

- 고정형 Deal pipeline을 전역 기본 구조로 보는 기준
- 모든 사용자에게 같은 Company/Product/Deal navigation을 주는 기준
- 비활성 route의 과거 UI audit report를 정본으로 보는 기준

## 5. 관련 문서

- `README.md`
- `AGENT/PM_AGENT/PLANNING/PRODUCT_DIRECTION.md`
- `AGENT/UXUI_AGENT/README.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
