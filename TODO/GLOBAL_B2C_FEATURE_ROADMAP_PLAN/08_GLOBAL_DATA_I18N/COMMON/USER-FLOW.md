# User Flow

상태: Confirmed

## 1. 신규 가입

1. 사용자가 public/auth locale URL에서 로그인 또는 회원가입 화면에 진입한다.
2. 화면의 소셜 provider 영역에서 Google, LINE, Apple 버튼을 본다.
3. 사용자가 provider를 선택한다.
4. Supabase OAuth와 Backend `/api/auth/exchange`가 app session을 만든다.
5. 신규 User는 브라우저 locale, proxy geo country, 브라우저 timezone으로 기본 설정을 추론한다.
6. 추론 실패 시 `ko-KR`, `KR`, `Asia/Seoul`, `KRW`가 기본값이다.
7. 로그인 후 `/app`으로 이동한다.

## 2. 기존 사용자 다른 Provider 로그인

예시:

```text
기존 Google user@example.com
새 Apple user@example.com
```

흐름:

1. 기존 provider 계정 연결이 없음을 확인한다.
2. Apple verified email을 lowercase로 정규화한다.
3. 같은 email의 User를 찾는다.
4. 기존 User에 Apple `UserOAuthAccount`를 연결한다.
5. 기존 User의 CRM 데이터를 그대로 보여준다.

email이 없으면 가입/로그인을 차단한다.

## 3. 앱 언어 변경

1. 사용자가 `/app/settings`로 이동한다.
2. Language를 Korean 또는 English로 바꾼다.
3. 저장하면 서버 `User.preferredLocale`이 갱신된다.
4. 현재 화면의 navigation, button, form, validation copy가 즉시 바뀐다.
5. URL은 `/app/*` 그대로 유지된다.

## 4. 시간대 변경

1. 사용자가 `/app/settings`에서 Time zone을 바꾼다.
2. 서버 `User.timeZone`이 갱신된다.
3. 일정, 알림, 리포트, 생성/수정 시각 표시가 새 timezone 기준으로 바뀐다.
4. API 원본 ISO string은 변하지 않는다.

## 5. Product/Deal 금액

1. 사용자가 Product를 생성한다.
2. 기본 currency는 `User.defaultCurrencyCode`다.
3. 사용자가 Deal을 생성하고 Product를 선택한다.
4. Deal currency는 Product currency를 기본값으로 가져온다.
5. 사용자는 Deal currency를 KRW 또는 USD로 변경할 수 있다.

## 6. Contact 전화번호

1. 사용자가 Contact를 생성한다.
2. Country에서 KR 또는 US를 선택한다.
3. 국가별 입력 형식에 맞게 전화번호를 입력한다.
4. 저장 시 `phoneCountryCode`, `phoneNationalNumber`, `phoneE164`가 저장된다.
5. 기존 `mobile`만 있는 Contact는 그대로 표시/수정 가능하다.

## 7. Company 지역/주소

1. 사용자가 Company를 생성 또는 수정한다.
2. Country에서 KR 또는 US를 선택한다.
3. Region은 KR 시/도 또는 US State 목록에서 선택한다.
4. Address는 자유 입력한다.
5. 화면과 Export는 locale별 region 표시명을 사용한다.

## 8. Import Template

1. 사용자가 Import 화면에 들어간다.
2. 템플릿 언어에서 Korean 또는 English를 선택한다.
3. 선택한 locale의 XLSX template을 다운로드한다.
4. 기본 선택값은 사용자 `preferredLocale`이다.

## 9. Export

1. 사용자가 Company/Contact/Product/Deal 목록에서 Export를 실행한다.
2. Backend는 사용자 app 설정값을 기준으로 header와 표시값을 만든다.
3. Contact export에는 Phone, Phone Country, Phone E.164가 포함된다.
4. Product/Deal export에는 금액과 currency 의미가 보존된다.
