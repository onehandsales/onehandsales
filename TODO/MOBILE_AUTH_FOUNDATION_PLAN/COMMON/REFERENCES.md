# References

## 1. 필수 문서

- `AGENT/PM_AGENT/CONVENTION/TODO_SOFTWARE_AGENT_REFERENCE.md`
- `AGENT/PM_AGENT/DECISIONS/032_mobile_auth_foundation_scope.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/README.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/ARCHITECTURE/MOBILE_APP.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/ARCHITECTURE/AUTH_SESSION.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/ARCHITECTURE/NAVIGATION.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/ARCHITECTURE/TESTING.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/CONVENTION/MOBILE_APP.md`
- `AGENT/SOFTWARE_AGENT/MOBILE_AGENT/CONVENTION/AUTH_AND_STORAGE.md`
- `AGENT/UXUI_AGENT/DECISIONS/021_uxui_mobile_auth_native_reference.md`
- `BE/src/modules/auth/README.md`

## 2. Backend 코드 기준

- `BE/src/modules/auth/presentation/http/auth.controller.ts`
- `BE/src/modules/auth/presentation/http/me.controller.ts`
- `BE/src/modules/auth/presentation/http/dto/exchange-external-auth-token.dto.ts`
- `BE/src/modules/auth/application/use-cases/exchange-external-auth-token.use-case.ts`
- `BE/src/modules/auth/application/use-cases/refresh-app-token.use-case.ts`
- `BE/src/modules/auth/application/use-cases/logout.use-case.ts`
- `BE/src/modules/auth/application/ports/auth.repository.ts`
- `BE/src/modules/auth/infrastructure/persistence/prisma-auth.repository.ts`
- `BE/prisma/schema.prisma`

## 3. Mobile App 코드 기준

- `FE/mobile-app/package.json`
- `FE/mobile-app/app.json`
- `FE/mobile-app/App.tsx`
- `FE/mobile-app/index.ts`
- `FE/mobile-app/src/features/auth/screens/login-screen.tsx`
- `FE/mobile-app/assets/brand/logo-mark.png`
- `FE/mobile-app/assets/auth/google-logo.png`
- `FE/mobile-app/assets/auth/line-logo.png`
- `FE/mobile-app/assets/auth/apple-logo.png`

현재 `FE/mobile-app`은 목표 구조와 다르면 재구성할 수 있다. 재구성 시에도 위 asset은 삭제 전 보존 여부를 먼저 확인한다.

## 4. User Web UX reference

- `FE/user-web/src/features/auth`
- `AGENT/UXUI_AGENT/PLANNING/USER_FLOW_AND_SCREENS.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_UI_DIRECTION.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_WRITING_GUIDE.md`

모바일 앱은 User Web 브라우저 모바일 auth 화면의 정보 구조, provider 순서, 문구 톤을 따른다. 구현은 WebView가 아니라 React Native로 한다.
