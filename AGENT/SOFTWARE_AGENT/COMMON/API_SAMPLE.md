# API Sample — 현재 controller 목록

참고 기준 갱신: 2026-11-17. 과거 구현·검증 날짜는 아래 기록을 따른다.

Checked: 2026-11-15
Status: Current source inventory

현재 controller의 HTTP handler 51개를 아래에 기록한다. endpoint 존재가 해당 제품 흐름의 완성을 의미하지 않는다. 상세 request/response·권한·오류는 연결된 controller와 DTO/application 계약을 확인한다.

Object 3 / List 3 / Attribute 5 / Record 4 / View 18개로 CRM 정의 모듈은 33개다. Bonsai 목표 API는 아직 확정하지 않았으며 [전환 설계](../BACKEND_AGENT/ARCHITECTURE/CRM_CORE_BACKEND.md)와 구분한다.

## attribute-definition

| API | 현재 소스 |
| --- | --- |
| `POST /api/users/me/workspaces/:workspaceId/object-definitions/:objectDefinitionId/attribute-definitions` | [controller](../../../BE/src/modules/attribute-definition/presentation/http/user-workspace-object-attribute-definitions.controller.ts) |
| `GET /api/users/me/workspaces/:workspaceId/object-definitions/:objectDefinitionId/attribute-definitions` | [controller](../../../BE/src/modules/attribute-definition/presentation/http/user-workspace-object-attribute-definitions.controller.ts) |
| `GET /api/users/me/workspaces/:workspaceId/object-definitions/:objectDefinitionId/attribute-definitions/:attributeDefinitionId` | [controller](../../../BE/src/modules/attribute-definition/presentation/http/user-workspace-object-attribute-definitions.controller.ts) |
| `PATCH /api/users/me/workspaces/:workspaceId/object-definitions/:objectDefinitionId/attribute-definitions/:attributeDefinitionId/position` | [controller](../../../BE/src/modules/attribute-definition/presentation/http/user-workspace-object-attribute-definitions.controller.ts) |
| `PATCH /api/users/me/workspaces/:workspaceId/object-definitions/:objectDefinitionId/attribute-definitions/:attributeDefinitionId` | [controller](../../../BE/src/modules/attribute-definition/presentation/http/user-workspace-object-attribute-definitions.controller.ts) |

## auth

| API | 현재 소스 |
| --- | --- |
| `GET /api/auth/providers` | [controller](../../../BE/src/modules/auth/presentation/http/auth.controller.ts) |
| `POST /api/auth/exchange` | [controller](../../../BE/src/modules/auth/presentation/http/auth.controller.ts) |
| `POST /api/auth/refresh` | [controller](../../../BE/src/modules/auth/presentation/http/auth.controller.ts) |
| `POST /api/auth/logout` | [controller](../../../BE/src/modules/auth/presentation/http/auth.controller.ts) |
| `GET /api/me` | [controller](../../../BE/src/modules/auth/presentation/http/me.controller.ts) |
| `GET /admin/api/me` | [controller](../../../BE/src/modules/auth/presentation/http/me.controller.ts) |

## error-report

| API | 현재 소스 |
| --- | --- |
| `POST /api/error-reports` | [controller](../../../BE/src/modules/error-report/presentation/http/error-report.controller.ts) |

## health

| API | 현재 소스 |
| --- | --- |
| `GET /api/health` | [controller](../../../BE/src/modules/health/presentation/health.controller.ts) |

## list-definition

| API | 현재 소스 |
| --- | --- |
| `PATCH /api/users/me/sidebar/workspaces/:workspaceId/lists/order` | [controller](../../../BE/src/modules/list-definition/presentation/http/user-sidebar-workspace-lists.controller.ts) |
| `GET /api/users/me/sidebar/workspaces/:workspaceId/lists` | [controller](../../../BE/src/modules/list-definition/presentation/http/user-sidebar-workspace-lists.controller.ts) |
| `POST /api/users/me/workspaces/:workspaceId/list-definitions` | [controller](../../../BE/src/modules/list-definition/presentation/http/user-workspace-list-definitions.controller.ts) |

## object-definition

| API | 현재 소스 |
| --- | --- |
| `PATCH /api/users/me/sidebar/workspaces/:workspaceId/objects/order` | [controller](../../../BE/src/modules/object-definition/presentation/http/user-sidebar-workspace-objects.controller.ts) |
| `GET /api/users/me/sidebar/workspaces/:workspaceId/objects` | [controller](../../../BE/src/modules/object-definition/presentation/http/user-sidebar-workspace-objects.controller.ts) |
| `POST /api/users/me/workspaces/:workspaceId/object-definitions` | [controller](../../../BE/src/modules/object-definition/presentation/http/user-workspace-object-definitions.controller.ts) |

## public-contact-request

| API | 현재 소스 |
| --- | --- |
| `POST /api/public/contact-requests` | [controller](../../../BE/src/modules/public-contact-request/presentation/http/public-contact-request.controller.ts) |

## record-definition

| API | 현재 소스 |
| --- | --- |
| `POST /api/users/me/workspaces/:workspaceId/object-definitions/:objectDefinitionId/record-definitions` | [controller](../../../BE/src/modules/record-definition/presentation/http/user-workspace-object-record-definitions.controller.ts) |
| `GET /api/users/me/workspaces/:workspaceId/object-definitions/:objectDefinitionId/record-definitions` | [controller](../../../BE/src/modules/record-definition/presentation/http/user-workspace-object-record-definitions.controller.ts) |
| `PATCH /api/users/me/workspaces/:workspaceId/object-definitions/:objectDefinitionId/record-definitions/:recordDefinitionId/record-attribute-values-definitions/:recordAttributeValueDefinitionId` | [controller](../../../BE/src/modules/record-definition/presentation/http/user-workspace-object-record-definitions.controller.ts) |
| `GET /api/users/me/workspaces/:workspaceId/object-definitions/:objectDefinitionId/record-definitions/form` | [controller](../../../BE/src/modules/record-definition/presentation/http/user-workspace-record-form.controller.ts) |

## support-request

| API | 현재 소스 |
| --- | --- |
| `POST /api/support-requests` | [controller](../../../BE/src/modules/support-request/presentation/http/support-request.controller.ts) |

## user

| API | 현재 소스 |
| --- | --- |
| `GET /api/users/me/profile` | [controller](../../../BE/src/modules/user/presentation/http/user-me.controller.ts) |
| `PATCH /api/users/me/profile` | [controller](../../../BE/src/modules/user/presentation/http/user-me.controller.ts) |
| `POST /api/users/me/onboarding/job-selection` | [controller](../../../BE/src/modules/user/presentation/http/user-me.controller.ts) |
| `GET /api/users/me/devices` | [controller](../../../BE/src/modules/user/presentation/http/user-me.controller.ts) |

## view-definition

| API | 현재 소스 |
| --- | --- |
| `PATCH /api/users/me/sidebar/workspaces/:workspaceId/view-favorites/order` | [controller](../../../BE/src/modules/view-definition/presentation/http/user-sidebar-workspace-view-favorites.controller.ts) |
| `GET /api/users/me/sidebar/workspaces/:workspaceId/view-favorites` | [controller](../../../BE/src/modules/view-definition/presentation/http/user-sidebar-workspace-view-favorites.controller.ts) |
| `GET /api/users/me/workspaces/:workspaceId/view-header/list-definitions/:listDefinitionId/view-definitions` | [controller](../../../BE/src/modules/view-definition/presentation/http/user-workspace-list-views.controller.ts) |
| `GET /api/users/me/workspaces/:workspaceId/view-header/object-definitions/:objectDefinitionId/view-definitions` | [controller](../../../BE/src/modules/view-definition/presentation/http/user-workspace-object-views.controller.ts) |
| `PATCH /api/users/me/workspaces/:workspaceId/view-definitions/:viewDefinitionId/columns/:viewAttributeSettingDefinitionId` | [controller](../../../BE/src/modules/view-definition/presentation/http/user-workspace-table-columns.controller.ts) |
| `POST /api/users/me/workspaces/:workspaceId/view-definitions/:viewDefinitionId/columns` | [controller](../../../BE/src/modules/view-definition/presentation/http/user-workspace-table-columns.controller.ts) |
| `GET /api/users/me/workspaces/:workspaceId/view-definitions/:viewDefinitionId/configuration` | [controller](../../../BE/src/modules/view-definition/presentation/http/user-workspace-view-configuration.controller.ts) |
| `GET /api/users/me/workspaces/:workspaceId/view-definitions/:viewDefinitionId/configuration/options` | [controller](../../../BE/src/modules/view-definition/presentation/http/user-workspace-view-configuration.controller.ts) |
| `POST /api/users/me/workspaces/:workspaceId/view-definitions/:viewDefinitionId/data/preview` | [controller](../../../BE/src/modules/view-definition/presentation/http/user-workspace-view-configuration.controller.ts) |
| `PATCH /api/users/me/workspaces/:workspaceId/view-definitions/:viewDefinitionId/configuration` | [controller](../../../BE/src/modules/view-definition/presentation/http/user-workspace-view-configuration.controller.ts) |
| `POST /api/users/me/workspaces/:workspaceId/view-header/view-definitions/:viewDefinitionId/favorite` | [controller](../../../BE/src/modules/view-definition/presentation/http/user-workspace-view-favorite.controller.ts) |
| `DELETE /api/users/me/workspaces/:workspaceId/view-header/view-definitions/:viewDefinitionId/favorite` | [controller](../../../BE/src/modules/view-definition/presentation/http/user-workspace-view-favorite.controller.ts) |
| `GET /api/users/me/workspaces/:workspaceId/view-header/view-definitions/:viewDefinitionId/filters` | [controller](../../../BE/src/modules/view-definition/presentation/http/user-workspace-view-header-menus.controller.ts) |
| `GET /api/users/me/workspaces/:workspaceId/view-header/view-definitions/:viewDefinitionId/sorts` | [controller](../../../BE/src/modules/view-definition/presentation/http/user-workspace-view-header-menus.controller.ts) |
| `GET /api/users/me/workspaces/:workspaceId/view-header/view-definitions/:viewDefinitionId/settings` | [controller](../../../BE/src/modules/view-definition/presentation/http/user-workspace-view-header-menus.controller.ts) |
| `GET /api/users/me/workspaces/:workspaceId/view-header` | [controller](../../../BE/src/modules/view-definition/presentation/http/user-workspace-view-header.controller.ts) |
| `GET /api/users/me/workspaces/:workspaceId/view-header/view-definitions/:viewDefinitionId` | [controller](../../../BE/src/modules/view-definition/presentation/http/user-workspace-view-header.controller.ts) |
| `GET /api/users/me/workspaces/:workspaceId/view-definitions/:viewDefinitionId/data` | [controller](../../../BE/src/modules/view-definition/presentation/http/user-workspace-view-main-content.controller.ts) |

## workspace

| API | 현재 소스 |
| --- | --- |
| `GET /api/users/me/sidebar/workspaces` | [controller](../../../BE/src/modules/workspace/presentation/http/user-sidebar-workspaces.controller.ts) |
| `GET /api/users/me/sidebar/workspaces/default` | [controller](../../../BE/src/modules/workspace/presentation/http/user-sidebar-workspaces.controller.ts) |
| `GET /api/users/me/sidebar/workspaces/:workspaceId` | [controller](../../../BE/src/modules/workspace/presentation/http/user-sidebar-workspaces.controller.ts) |
| `POST /api/users/me/workspaces` | [controller](../../../BE/src/modules/workspace/presentation/http/user-workspaces.controller.ts) |

공개 문의의 회사명/규모는 문의 원문이다. CRM Company 레코드와 혼동하지 않는다. API·DB 삭제는 [전환 영향](BONSAI_TRANSITION_MATRIX.md)을 확인한 후 수행한다.
