# Sales B2C Monorepo

이 저장소 루트는 `한손에 영업 / onehand.sales`의 모노레포 루트다.

루트는 package manager workspace를 사용하지 않는다. Frontend와 Backend 앱은 의도적으로 독립되어 있고, 각 앱이 자기 의존성을 직접 가진다.

## Structure

```text
AGENT/
  PM_AGENT/
  UXUI_AGENT/
  SOFTWARE_AGENT/
FE/
  user-web/
  admin-web/
BE/
archive/
```

## Rules

- 루트에는 `package.json`을 두지 않는다.
- `FE`와 `BE`는 패키지나 의존성을 공유하지 않는다.
- `FE/user-web`과 `FE/admin-web`은 별도 Frontend 앱이다.
- `BE`는 `/api/*`와 `/admin/api/*`를 제공하는 단일 NestJS 서버다.
- 모바일 앱은 아직 만들지 않는다. 웹 MVP 이후 모바일 개발 시 추가한다.
- `AGENT`는 PM, UX/UI, Software 역할별 정본 문서 공간이다.
- `archive`는 참고용이며 `AGENT`를 override하지 않는다.
