# User Web Features

현재 feature와 target을 구분한다.

| Feature | 현재 책임 |
| --- | --- |
| auth / app-i18n | 인증·세션·locale·표시 형식 |
| workspace | Workspace 탐색·진입 |
| crm-object | Object·Attribute·Record 생성·조회·값 변경 |
| crm-list | List 생성·조회 |
| crm-view | 공통 헤더·본문·메뉴·설정 preview/save |
| sidebar-order | 사이드바 순서 변경 |
| view-favorite | 개인 View 즐겨찾기 |
| error-report / support-request | 지원 접수 |
| public-contact-request / public-site | 공개 문의·locale 공개 화면 |

schedule, meeting-note, trash는 잔여 feature 경계이며 완성된 업무 기능이 아니다.

API client, query key, UI state, route ownership을 feature 경계에서 관리한다. folk 전환은 [CRM_CORE_FRONTEND](../../../../AGENT/SOFTWARE_AGENT/FRONT_AGENT/ARCHITECTURE/CRM_CORE_FRONTEND.md)를 따른다.
