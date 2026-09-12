# UX/UI Internal Terms User Language Decision

Date: 2026-09-12

## 1. 결정

OneHand CRM은 내부 CRM Core 용어와 사용자-facing 표현을 분리한다.

사용자 화면에서는 내부 데이터 모델 용어를 그대로 노출하지 않는다.

## 2. 용어 변환

| 내부 용어 | 사용자-facing 표현 |
| --- | --- |
| Workspace | 내 CRM, 업무 공간 |
| Kit | 부동산 중개 CRM, 헤드헌팅 CRM |
| Object | 관리할 항목, 또는 실제 업무명 |
| Attribute | 필요한 정보 |
| Relationship | 연결 |
| Record | 기록 |
| List | 목록 |
| View | 보기 |
| Status | 상태 |
| Next Action | 다음 행동 |

## 3. 문구 예시

| 피하기 | 권장 |
| --- | --- |
| Object를 생성하세요. | 관리할 항목을 추가해 보세요. |
| Attribute를 추가하세요. | 필요한 정보를 추가해 보세요. |
| Relationship을 설정하세요. | 관련 기록을 연결해 보세요. |
| View를 생성하세요. | 보기 방식을 추가해 보세요. |

Kit 안에서는 더 구체적인 업무 언어를 쓴다.

예:

- `고객과 매물 연결`
- `후보자를 공고에 추천`
- `상담을 계약과 연결`

## 4. 예외

내부 용어는 아래에서 사용할 수 있다.

- 개발 문서
- PM/Software/UXUI 간 내부 문서
- API/DB 명세
- 관리자용 진단/운영 화면 중 기술자가 사용하는 영역

일반 사용자 화면에서는 예외를 두지 않는다.

## 5. 관련 문서

- `AGENT/PM_AGENT/PLANNING/CRM_CORE_CONCEPT_MODEL.md`
- `AGENT/UXUI_AGENT/PLANNING/CRM_CORE_INTERACTION_MODEL.md`
- `AGENT/UXUI_AGENT/PLANNING/UX_WRITING_GUIDE.md`
