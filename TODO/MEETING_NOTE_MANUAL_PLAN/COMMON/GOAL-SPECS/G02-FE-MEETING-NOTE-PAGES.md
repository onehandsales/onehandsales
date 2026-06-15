# G02-FE-MEETING-NOTE-PAGES Spec

## 1. 목적

User Web의 회의록 화면과 `features/meeting-note`를 새 Backend MeetingNote API 계약에 맞게 수정한다.

## 2. 포함 범위

- meeting-note type 재정의
- API client 함수 재작성
- query key와 hook 정리
- 목록 페이지 pagination과 필터 연동
- 상세 페이지 연동
- 생성/수정 form 연동
- 회사/담당자 필수 validation
- 제품/딜 선택 연결 UI
- loading, empty, error, pending 상태 정리

## 3. 제외 범위

- AI Text/STT 화면
- 음성 파일 업로드
- 삭제/복구 버튼
- Admin 화면
- 딜 상세 안에서 회의록 생성/연결

## 4. 구현 기준

- 도메인 feature 폴더는 `features/meeting-note`를 유지한다.
- API 호출은 `src/lib/api-client.ts`를 통해서만 수행한다.
- 서버 상태는 TanStack Query로 관리한다.
- 폼은 React Hook Form + Zod 기준으로 작성한다.
- request에서 `timeZone`, `rawText`, `stageText`, 단일 `dealId`를 보내지 않는다.
- `sourceType`은 보내지 않거나 `MANUAL`만 보낸다.
- 목록 응답은 `totalPages`를 사용하고 `hasNext`를 사용하지 않는다.
- 제품/딜 summary 객체는 연결이 없어도 항상 렌더링한다.

## 5. UX 기준

- `UX Design`의 CRM 화면 톤을 따른다.
- 업무 도구이므로 정보 밀도와 스캔 가능성을 우선한다.
- 불필요한 hero/마케팅형 섹션을 만들지 않는다.
- desktop/mobile 레이아웃에서 텍스트가 버튼/카드 안에서 깨지지 않아야 한다.
- modal, toast, empty/error 상태는 기존 공통 UI 문법을 우선 재사용한다.

## 6. 검증 기준

- `/meeting-notes`에서 목록과 필터가 동작한다.
- 페이지 변경 시 `page`만 바뀌고 `pageSize`는 보내지 않는다.
- 새 회의록 저장 시 회사와 담당자 없이는 제출할 수 없다.
- 제품과 딜 없이 저장할 수 있다.
- 저장 성공 후 상세 화면으로 이동한다.
- 수정 성공 후 상세 query와 목록 query가 갱신된다.
- Backend UTC ISO string은 화면 표시용 local string으로 변환된다.

## 7. 검증 명령

```powershell
cd FE\user-web
npm run typecheck
npm run lint
npm run build
```

프로젝트 package script 이름이 다르면 `FE/user-web/package.json` 기준으로 대체하고 완료 기록에 남긴다.
