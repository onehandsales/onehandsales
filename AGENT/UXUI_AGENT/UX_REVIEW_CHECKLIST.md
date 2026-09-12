# UX/UI 리뷰 체크리스트

Status: UX Review Baseline
Date: 2026-09-12

## 1. 목적

이 문서는 OneHand CRM의 화면 설계와 Frontend 구현 결과를 검토할 때 사용하는 UX/UI 기준이다.

검수의 핵심 질문은 하나다.

> 사용자가 CRM을 배우거나 설계하지 않고도, 자기 일에 맞는 CRM을 바로 쓸 수 있는가?

## 2. 제품 방향 체크리스트

- 화면이 OneHand CRM의 핵심 문장과 충돌하지 않는가?
- 사용자가 처음부터 Object, Field, Relation, View를 직접 만들도록 밀어내지 않는가?
- 모든 사용자에게 Company/Product/Deal 구조를 전역 기본값처럼 보여주지 않는가?
- Kit이 단순 템플릿 카드가 아니라 업무 구조로 보이는가?
- 첫 10분 안에 첫 Record 생성과 기본 보기 확인으로 이어지는가?
- Team, billing, automation 같은 후속 기능이 첫 사용 흐름을 방해하지 않는가?

## 3. First Use 체크리스트

- 업무 유형 선택 화면이 CRM 설정 화면처럼 보이지 않는가?
- Kit 카드가 누구에게 맞는지와 무엇을 관리하는지 바로 알려주는가?
- Kit 미리보기가 관리 대상, 관계, 첫 행동을 보여주는가?
- Workspace 준비 상태가 빈 builder가 아니라 준비된 CRM 진입처럼 느껴지는가?
- 첫 Record 생성 CTA가 명확한가?
- 첫 Record 생성 필드가 과하지 않은가?
- 저장 후 방금 만든 Record를 목록이나 상세에서 바로 확인할 수 있는가?

## 4. Workspace 체크리스트

- Workspace home에서 현재 적용된 Kit이 분명한가?
- 첫 화면에서 주요 관리 대상과 첫 행동이 보이는가?
- 빈 상태가 설정 안내가 아니라 첫 기록 안내로 이어지는가?
- 샘플 데이터가 실제 데이터처럼 오해되지 않는가?
- 전역 navigation이 고정형 영업 CRM처럼 보이지 않는가?

## 5. Record UX 체크리스트

- 목록에서 Record 이름, 상태, 연결된 Record, 다음 행동이 빠르게 읽히는가?
- 상세 화면에서 핵심 식별 정보와 상태가 먼저 보이는가?
- 연결된 Record가 보조 정보가 아니라 CRM의 핵심 맥락으로 보이는가?
- 생성 flow가 목록 맥락을 끊지 않는가?
- 생성 후 사용자가 방금 만든 Record 위치를 잃지 않는가?
- 검색, 필터, 보기 전환이 Kit의 업무 언어로 되어 있는가?
- FE가 API에 없는 최근 활동이나 상태 값을 임의 데이터처럼 꾸미지 않는가?

## 6. UX Writing 체크리스트

- 사용자 노출 문구가 해요체인가?
- `입니다/습니다/합니다/없습니다/하지 않습니다/수 없습니다/못했습니다/필요합니다/되었습니다` 체가 남아 있지 않은가?
- 내부 용어가 사용자 화면에 그대로 노출되지 않는가?
- `Object`, `Attribute`, `Relationship`, `Schema` 대신 업무 언어를 쓰는가?
- empty state가 사용자의 다음 행동을 알려주는가?
- error state가 문제와 해결 행동을 함께 말하는가?
- validation message가 짧고 구체적인가?
- `해주세요`는 `해 주세요`로 띄어 쓰는가?
- 버튼은 짧은 행동형이고 dialog 왼쪽 버튼은 `닫기`로 통일되어 있는가?

## 7. Visual / Interaction 체크리스트

- Notion처럼 화이트/그레이 기반의 조용한 작업도구 톤을 유지하는가?
- Attio처럼 Record 속성과 연결 관계가 분명히 보이는가?
- 과한 hero, 장식 카드, 마케팅형 섹션보다 실제 업무 화면이 우선인가?
- 카드가 중첩되어 있지 않은가?
- 중요한 값이 낮은 대비의 보조 텍스트로 밀려나지 않았는가?
- hover, 선택, focus, status 색상의 의미가 분명한가?
- 화면이 보라/파랑, 베이지/크림, 다크 네이비, 과한 그라데이션 중 하나로 지배되지 않는가?
- 30~50대 사용자가 반복해서 읽기 편한 글자 크기와 대비인가?

## 8. Mobile 체크리스트

- 첫 Record 생성까지 이동 단계가 짧은가?
- 주요 CTA가 엄지 조작 범위에 있는가?
- desktop table을 억지로 줄이지 않고 compact list/detail 흐름으로 바꿨는가?
- form, modal, panel이 작은 화면에서 겹치거나 잘리지 않는가?
- 하단 navigation이 현재 업무 맥락에서 가장 중요한 항목만 담고 있는가?

## 9. 현재 구현 화면 체크리스트

- `/app` foundation home이 현재 구현 상태와 맞게 존재하지 않는 업무 데이터를 암시하지 않는가?
- `/app/more`에서 계정 설정 진입이 명확한가?
- 계정 설정 모달에서 프로필, 환경설정, 기기 정보가 구분되는가?
- 도움말 모달에서 지원 문의와 오류 신고 흐름이 구분되는가?
- 공개 문의 form에서 실제 API 검증 기준과 입력 항목이 맞는가?
- 현재 활성화되지 않은 Kit/Record 화면이 완성 기능처럼 보이지 않는가?

## 10. Admin UX 체크리스트

- Admin Web은 현재 `/login`과 보호 route `/` 중심인가?
- 관리자 권한 확인 실패 상태가 짧고 명확한가?
- User Web의 Kit/Record 업무 화면을 Admin Web에서 암시하지 않는가?

## 11. 관련 문서

- `AGENT/UXUI_AGENT/PLANNING/FIRST_USE_FLOW.md`
- `AGENT/UXUI_AGENT/PLANNING/KIT_SELECTION_UX.md`
- `AGENT/UXUI_AGENT/PLANNING/WORKSPACE_HOME_UX.md`
- `AGENT/UXUI_AGENT/PLANNING/RECORD_LIST_DETAIL_UX.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_WRITING_GUIDE.md`
- `AGENT/UXUI_AGENT/DECISIONS/020_uxui_notion_attio_reference.md`
- `AGENT/SOFTWARE_AGENT/FRONT_AGENT/ENGINEERING_REVIEW_CHECKLIST.md`
