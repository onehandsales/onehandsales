# Pending Decisions

## D01. 네이티브 모바일 앱과 User Web 브라우저 모바일의 device slot 경계

상태: Decided on 2026-09-03

결정:

- 네이티브 Mobile App은 API `deviceSlot: "native_mobile"`을 사용한다.
- Backend Prisma enum은 `AuthDeviceSlot.NATIVE_MOBILE`을 추가한다.
- User Web 브라우저 모바일은 기존 `deviceSlot: "mobile"`을 유지한다.
- 세션 정책은 기존처럼 slot당 active device 1개를 유지한다.
- 같은 `native_mobile` slot의 다른 device login은 기존 native mobile device/session을 교체한다.

### 1. 왜 필요한가

현재 User Web 코드는 브라우저 폭이 모바일이면 Backend auth exchange에 `deviceSlot: "mobile"`을 보낸다.

```text
FE/user-web/src/features/auth/auth-service.ts
deviceSlot: isMobile ? "mobile" : "personal_laptop"
```

새 네이티브 Mobile App도 `deviceSlot: "mobile"`을 사용하면, 같은 사용자의 User Web 브라우저 모바일 세션과 네이티브 앱 세션이 같은 slot으로 취급된다.

그 결과 새 네이티브 앱 로그인은 기존 브라우저 모바일 device/session을 교체할 수 있고, 반대로 브라우저 모바일 로그인이 네이티브 앱 세션을 교체할 수 있다.

### 2. 선택지

| 선택지 | 내용 | 장점 | 단점 | 선택 시 결과 |
| --- | --- | --- | --- | --- |
| A | 기존 문서처럼 네이티브 앱도 `deviceSlot: "mobile"`을 쓴다. | DB migration이 필요 없고 구현이 가장 빠르다. | 브라우저 모바일과 네이티브 앱이 서로 세션을 밀어낼 수 있다. | 1차 구현은 빠르지만, 모바일 브라우저와 앱 동시 사용 품질이 낮아진다. |
| B | 네이티브 앱 전용 slot을 새로 만든다. API `deviceSlot: "native_mobile"`, Prisma enum `NATIVE_MOBILE`. | 브라우저 모바일과 네이티브 앱 세션을 명확히 분리한다. Series A급 확장성과 운영 분석에 유리하다. | Prisma migration, Backend enum/mapper/DTO/test, 문서 변경이 필요하다. | User Web 브라우저 모바일은 기존 `mobile`을 유지하고, 네이티브 앱은 `native_mobile`로 독립 관리된다. |
| C | User Web 브라우저 모바일을 `personal_laptop` 같은 브라우저 slot으로 옮기고, `mobile`을 네이티브 앱 전용으로 재해석한다. | 새 DB enum 없이 네이티브 앱과 브라우저 모바일 충돌을 줄인다. | `personal_laptop` 의미가 흐려지고 기존 mobile slot 데이터 해석이 애매해진다. | migration은 피하지만 device analytics와 설정 화면 문구가 혼란스러울 수 있다. |

### 3. 추천

프로젝트 기준 추천은 B다.

OneHand Sales는 User Web 모바일 브라우저와 네이티브 Mobile App을 모두 가질 수 있는 제품이다. Series A급 제품을 목표로 하면 클라이언트 종류별 세션, 보안 이벤트, 기기 관리, 운영 분석이 분리되어야 한다.

B를 선택하면 구현량은 늘지만 다음 구분이 명확해진다.

- 데스크톱 브라우저
- 모바일 브라우저
- 네이티브 모바일 앱
- 향후 회사 노트북 또는 관리형 device

### 4. 결정 후 구현 기준

- G01 Backend 작업에서 `AuthDeviceSlot.NATIVE_MOBILE` enum migration을 추가한다.
- 모바일 앱 exchange request는 `deviceSlot: "native_mobile"`을 고정 사용한다.
- `deviceSlot: "mobile"`은 User Web 브라우저 모바일 slot으로 유지한다.
