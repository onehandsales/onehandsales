# FE TODO

## 1. 역할

이 폴더는 `FE/mobile-app`의 Mobile Auth Foundation 작업을 관리한다.

이 계획에서 FE는 User Web이 아니라 네이티브 Mobile App을 의미한다. User Web 브라우저 모바일 화면은 UX reference로만 사용한다.

네이티브 Mobile App은 exchange request에서 `deviceSlot: "native_mobile"`을 사용한다. 실제 Backend API 연동 완료 판정은 `G01-BE-MOBILE-AUTH-API` 완료 뒤에 한다.

## 2. 문서 목록

| 문서 | 목적 |
| --- | --- |
| `MOBILE-APP-TODO.md` | Mobile App 구현 작업 |
| `G02-FE-MOBILE-AUTH-APP.goal.md` | `/goal` 실행 문서 |

## 3. 구현 기준

- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT`를 우선한다.
- Expo Router를 사용한다.
- `src/app`은 route entry와 layout만 담당한다.
- 실제 화면, API, hook, schema, type, business UI는 `src/features/<domain>`에 둔다.
- NativeWind와 Tailwind config token을 사용한다.
- refresh token은 secure storage에만 둔다.
- access token은 memory-only다.
- OAuth와 정책 링크는 WebView가 아니라 Expo AuthSession 또는 OS 시스템 브라우저로 연다.
