# DB Schema TODO

상태: Draft

## 모델/필드 후보

- `User.locale`
- `User.countryCode`
- `Contact.phoneCountryCode`
- `Contact.phoneNationalNumber`
- `Deal.currencyCode`
- `Product.currencyCode`
- address/region normalization 후보
- `OAuthProvider.APPLE`
- `OAuthProvider.LINE`
- Import/Export locale metadata 후보

## 결정 필요

- 기존 `010-0000-0000` 데이터를 어떻게 migration할지
- phone을 E.164로 저장할지
- currency default를 user country로 둘지
- locale은 user profile에 둘지 client preference로 둘지
- Apple/LINE provider account를 기존 `UserOAuthAccount`로 처리할 수 있는지
- provider별 email 미제공/비공개 email을 어떻게 처리할지

## migration 주의

- 기존 한국어/한국 phone 데이터 fallback이 필요하다.
- 금액 column 의미가 바뀌면 export와 import template도 함께 바뀐다.
- OAuth provider enum 추가는 auth flow와 seed/test를 함께 바꿔야 한다.
