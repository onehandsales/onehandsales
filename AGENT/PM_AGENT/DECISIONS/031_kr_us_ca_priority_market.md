# 031 KR US CA Priority Market

Date: 2026-08-24
Updated: 2026-09-12

## 기존 결정과 현재 locale 기반

이전 결정에서 OneHand CRM의 우선 타겟 국가를 한국, 미국, 캐나다로 정했다. 현재 공개 locale 기반은 유지하지만, 이 기록을 folk 전환 제품의 타겟 시장을 새로 확정한 근거로 사용하지 않는다.

공개 홈페이지와 인증 화면의 언어 선택 UI는 다음 3개만 노출한다.

- `ko` / 한국어
- `en-us` / English (US)
- `en-ca` / English (Canada)

기존 공개 사이트 구현과 문서에 남아 있던 일본, 영국, 싱가포르, 호주 관련 locale과 시장은 런타임에서는 비활성화하고 추후 확장 후보로만 보류한다.

보류 locale:

- `ja`
- `en-gb`
- `en-sg`
- `en-au`

## Implementation Boundary

- 로그인 이후 `/app` 내부 언어는 1차로 `ko-KR`, `en`을 유지한다.
- `en-us`, `en-ca` 공개 사이트 문구가 내부 앱 언어를 별도 `en-US`, `en-CA`로 분리한다는 뜻은 아니다.
- 현재 앱 데이터 설정 구현은 `KR/US`, `KRW/USD` 중심이다.
- 기존 KR/US/CA 전략을 데이터 설정까지 확장할 경우 `CA`, `CAD`, 캐나다 전화번호/지역/가격/세금/정책 문구를 함께 검토해야 한다. folk 전환의 필수 선행 구현으로 자동 확정하지 않는다.

## Product Direction Boundary

이 시장 결정은 locale과 공개 사이트 노출 우선순위를 정하는 결정이다.

2026-11-15 갱신: 기존 locale 기반은 유지하되 타겟 시장·직군을 새로 확정하지 않는다. 기능 범위는 `PRODUCT_DIRECTION.md`, `FOLK_FEATURE_PARITY_MATRIX.md`와 036 전환 결정을 따른다.

## Future Expansion Rule

일본, 영국, 싱가포르, 호주는 주석 처리된 공개 언어 옵션과 보류 locale로만 유지한다. 서비스 확장 결정이 다시 나면 해당 국가/언어의 공개 copy, `/app` 내부 언어, 국가/통화/전화/주소/가격/정책 범위를 함께 confirmed 상태로 승격한다.

## Related Documents

- `AGENT/PM_AGENT/DECISIONS/000_확정_결정.md`
- `AGENT/PM_AGENT/PLANNING/PRD.md`
- `AGENT/PM_AGENT/PLANNING/SERVICE_OVERVIEW.md`
- `AGENT/PM_AGENT/PLANNING/PRODUCT_DIRECTION.md`
- `AGENT/SOFTWARE_AGENT/COMMON/NEXT_FEATURE_PRIORITIES.md`
- `FE/user-web/src/features/public-site/i18n/public-site-language.tsx`
