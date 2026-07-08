# UX/UI Multilingual Font Stack Decision

Date: 2026-07-08

`onehand.sales`의 User Web과 Admin Web은 앞으로 Notion-like typography 기준을 따른다.

이 결정은 Notion의 브랜드나 고유 폰트를 복제한다는 뜻이 아니다. Notion식 작업도구 UX에 맞는 조용하고 읽기 쉬운 타이포그래피 방향을 `onehand.sales`의 다국어 제품 범위에 맞게 적용한다는 뜻이다.

## 결정

기본 UI 폰트는 `Inter`를 1순위로 사용한다.

다국어 fallback은 다음 순서를 따른다.

```text
Inter
Pretendard Variable
Pretendard
ui-sans-serif
system-ui
-apple-system
BlinkMacSystemFont
Segoe UI
Apple SD Gothic Neo
Noto Sans KR
Noto Sans CJK KR
PingFang SC
Microsoft YaHei
Hiragino Sans
Hiragino Kaku Gothic ProN
Yu Gothic
Meiryo
Noto Sans SC
Noto Sans JP
sans-serif
```

## 적용 범위

이 기준은 다음 모든 사용자 노출 언어에 적용한다.

- 한국어
- 중국어
- 일본어
- 영어 US
- 영어 UK

영어와 라틴 문자는 `Inter`를 우선한다. 한국어는 `Pretendard` 계열을 우선 fallback으로 사용한다. 중국어와 일본어는 OS별 CJK 시스템 폰트로 자연스럽게 fallback되도록 한다.

## 구현 기준

- `FE/user-web`과 `FE/admin-web`의 Tailwind `fontFamily.sans`는 같은 스택을 사용한다.
- `Inter`와 `Pretendard Variable` 웹폰트는 각 앱의 `index.html`에서 로드한다.
- 새 화면, 새 컴포넌트, 새 landing/public page, Admin 화면은 모두 `font-sans` 또는 이 스택을 기준으로 한다.
- 특정 장식 목적이 명확하지 않으면 별도 custom font를 추가하지 않는다.
- `font-serif`, `font-mono`는 명시적 의도가 있을 때만 사용하고, 제품 전체 기본 폰트를 대체하지 않는다.

## 금지

- 한국어만 보고 `Pretendard` 단일 기준으로 새 폰트 정책을 작성하지 않는다.
- 영어 US/UK, 중국어, 일본어 화면에서 별도 폰트 시스템을 만들지 않는다.
- Notion의 브랜드, 로고, 문구, 고유 화면을 복제하지 않는다.
- viewport width 기준으로 font size를 스케일링하지 않는다.
