# 08 Global Data I18N

상태: Draft Slot
순서: 08
성격: 기능 구현 전 검토 슬롯
결정 상태: `COMMON/DECISION-LOG.md` 2026-07-21 추천 결정 반영

## 1. 목적

Global B2C 첫 판매를 위해 `/app` 내부 다국어, 날짜/시간, 통화, 전화번호, 주소/지역 표시를 국가별로 자연스럽게 만든다. 일본/대만/iOS 확장에 필요한 Apple/LINE login 후보도 이 슬롯에서 우선 정책을 정한다.

## 2. 현재 상태

- public/auth 진입면은 URL locale을 지원한다.
- `/app` 내부는 한국어 우선이다.
- 전화번호 검증은 한국 휴대폰 형식 중심이다.
- 사용자 timezone 기반 일정 처리는 일부 구현되어 있다.
- Google login만 현재 정식 인증 provider로 본다. Apple/LINE login은 후속 후보로 남아 있다.

## 3. 착수 전 해야 할 일

추천 결정:

- 첫 판매 locale은 `ko`와 `en`을 우선으로 제한하고, 이후 `ja`, `zh-tw`를 확장 후보로 둔다.
- phone은 E.164 기반으로 정리한다.
- Deal/Product 금액에는 `currencyCode`를 추가한다.
- `/app` i18n은 public site locale과 분리한다.
- Apple login은 iOS 전략과 연결하고, LINE login은 일본/대만 확장 시점에 검토한다.

1. 첫 판매 locale은 `ko`, `en`으로 확정하고 `ja`, `zh-tw`는 후속 확장 후보로 둔다.
2. `/app` i18n 적용 범위를 정한다.
3. phone은 E.164, Deal/Product 금액은 `currencyCode` 추가를 기본값으로 둔다.
4. 기존 데이터 migration과 표시 fallback을 설계한다.
5. Apple login은 iOS 전략과 연결하고, LINE login은 일본/대만 확장 시점에 검토한다.

## 4. 참고

- `COMMON/REFERENCES.md`
- `TODO/USER_WEB_PRODUCTIZATION_GAP_PLAN/COMMON/GLOBAL-B2C-FIRST-SALE-GATE.md`
