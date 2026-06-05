# Frontend 아키텍처

`FE`에는 독립적인 frontend 앱 두 개를 둔다.

- `user-web`: 사용자가 직접 쓰는 responsive 영업 workflow 앱
- `admin-web`: desktop-only Admin console

root frontend package와 공유 frontend package는 만들지 않는다. 각 앱은 자기 dependency, API client, UI primitive, test, build config를 소유한다.

두 앱 모두 feature-first 구조를 따른다.

```text
src/
  assets/
  app/
    providers/
    router/
    app.tsx
  components/
    ui/
    layout/
  features/
  hooks/
  lib/
  pages/
  store/
  styles/
  types/
  utils/
  main.tsx
```

User Web API client 위치:

```text
FE/user-web/src/lib/api-client.ts
```

Admin Web API client 위치:

```text
FE/admin-web/src/lib/admin-api-client.ts
```

기능 확장 예시:

```text
src/features/<feature>/
  components/
  api/
  hooks/
  schemas/
  types/
  index.ts
```

page는 route 진입점이며 feature public export만 조합한다.
