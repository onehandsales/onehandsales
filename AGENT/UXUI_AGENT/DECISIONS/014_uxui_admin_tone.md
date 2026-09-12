# UX/UI Admin Tone Decision

Date: 2026-09-12

## 1. 결정

Admin Web은 OneHand CRM의 운영자용 확인 화면이다. User Web의 Kit/Record 업무 경험과 섞어 보이지 않게 한다.

현재 Admin Web의 UX 범위는 로그인과 관리자 권한 확인을 중심으로 둔다.

## 2. UX 기준

- 단순하고 신뢰감 있는 흰색/회색 기반 화면을 사용한다.
- 운영자에게 필요한 상태와 오류를 짧게 보여준다.
- User Web의 Kit, Record, Workspace 업무 화면을 Admin Web에서 암시하지 않는다.
- 권한 실패, 세션 만료, 로그인 필요 상태는 명확하게 말한다.

## 3. 문구 기준

Admin Web도 사용자 노출 문구는 해요체 원칙을 따른다.

예:

- `관리자 권한을 확인하고 있어요.`
- `관리자 계정으로 로그인해 주세요.`
- `권한을 확인하지 못했어요. 다시 로그인해 주세요.`

## 4. 제외

- Admin Web에서 CRM Core 화면을 미리 보여주는 것
- 운영자 기능이 확정되기 전에 dashboard를 장식적으로 구성하는 것
- User Web의 navigation을 그대로 가져오는 것

## 5. 관련 문서

- `AGENT/UXUI_AGENT/UX_REVIEW_CHECKLIST.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/ADMIN_WEB.md`
