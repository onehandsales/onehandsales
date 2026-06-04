# Repository Root And Testing Decision

## 결정

기존 `AI_INFRA` 폴더 안에 있던 정본 구조를 저장소 루트로 올린다.

현재 정본 구조:

```text
AGENT/
FE/
BE/
archive/
README.md
```

루트에는 `package.json`과 workspace 설정을 두지 않는다.

## 테스트 자동화

MVP 테스트 자동화는 User Web과 Admin Web을 모두 포함한다.

- User Web: `FE/user-web`에서 Playwright E2E 관리
- Admin Web: `FE/admin-web`에서 Playwright E2E 관리
- Backend: `BE`에서 위험도 높은 도메인/권한/Import/민감정보 중심 테스트 관리

공용 테스트 패키지는 만들지 않는다.

## CI 실행 타이밍

- PR마다 User Web/Admin Web 핵심 smoke E2E만 실행한다.
- `main` merge 후 User Web/Admin Web 전체 E2E를 실행한다.
- 배포 직전 User Web/Admin Web 전체 E2E를 한 번 더 실행한다.

의도:

- PR에서는 리뷰 속도를 해치지 않는 선에서 핵심 흐름만 막는다.
- `main`에서는 통합된 상태의 전체 회귀를 본다.
- 배포 직전에는 실제 릴리즈 게이트로 전체 E2E를 다시 본다.


