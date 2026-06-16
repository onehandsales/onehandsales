# Deal Planning Review

## 1. 검토 기준

- 검토일: 2026-06-12
- 기준 문서:
  - `AGENT/PM_AGENT/CONVENTION/PLANNING_REVIEW_CHECKLIST.md`
  - `AGENT/PM_AGENT/CONVENTION/DOCUMENTATION.md`
  - `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_SPEC.md`
  - `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/API_CONTRACT.md`
  - `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/TRANSACTION.md`
  - `AGENT/SOFTWARE_AGENT/BACKEND_AGENT/CONVENTION/OBSERVABILITY.md`
  - `AGENT/SOFTWARE_AGENT/FRONT_AGENT/CONVENTION/FRONTEND_USER_WEB.md`

## 2. 결론

- 판정: 구현 착수 가능
- API 계약: Backend 구현 및 검증 완료, `implemented`
- Backend 상태: 구현 완료
- Frontend 상태: 기존 UI 흔적은 있으나 현재 계약과 불일치, 재연동 필요

## 3. 점검 결과

| 항목 | 결과 | 메모 |
|---|---|---|
| 사용자 흐름 | 통과 | 목록 split view, 상세, 생성, 수정, 로그, export 흐름 정의 |
| DB 모델 | 통과 | Deal 4개 테이블, DealProduct N:M 연결, FK 정의 |
| API 계약 | 통과 | request, response, business logic, error, FE/BE 기준 포함 |
| transaction | 통과 | Deal 생성/수정에서 DealProduct와 다음 행동 로그 처리 transaction 필요 |
| ownership | 통과 | 모든 API는 access token `userId` 기준 |
| observability | 통과 | mutation/export/error event 필요 |
| Frontend 범위 | 통과 | User Web만 포함, Admin Web 제외 |
| 제외 범위 | 통과 | delete, Admin, 일정/회의록/자동화 제외 |

## 4. 확정된 보완 결정

- `dealStaus`는 사용자 입력의 오타로 보고 코드와 DB 필드는 `dealStatus`를 사용한다.
- `expectedEndDate`는 API에서 `YYYY-MM-DD`만 허용하고 응답도 같은 형태로 반환한다.
- DB 저장은 날짜 전용 semantics를 유지하기 위해 Prisma `DateTime @db.Date` 사용을 권장한다.
- Deal 상태는 DB enum이 아니라 코드 enum이다.
- FK 데이터는 flat하게 펼치지 않고 nested object로 반환한다.
- 딜 목록에는 제품을 포함하지 않는다.
- 딜 상세에는 `products` 배열을 포함한다.
- 딜-제품 관계는 `DealProduct` 중간 테이블로 관리한다.
- 딜 생성/수정 시 `productIds` 배열을 사용한다.
- 딜 생성/수정 시 `contact.companyId === companyId`를 검증한다.
- 딜 export도 목록 계약 변경을 따라 제품을 포함하지 않는다.
- 딜 export에는 최근수정일을 포함하지 않는다.
- 다음 행동 단건 생성 API를 별도로 제공한다.

## 5. 위험과 대응

| 위험 | 대응 |
|---|---|
| 기존 FE 딜 타입과 새 API 타입 불일치 | FE goal에서 stale field 제거를 완료 조건으로 둔다. |
| 최신 다음 행동 조회가 N+1로 구현될 위험 | Backend goal에서 repository query 전략과 테스트를 요구한다. |
| 날짜가 timezone으로 밀릴 위험 | API boundary에서 `YYYY-MM-DD` string을 검증하고 응답도 string으로 포맷한다. |
| export와 목록 컬럼 불일치 | export 컬럼을 API 명세에 고정하고 id, 제품, 최근수정일 제외를 검증한다. |
| 다른 사용자 FK 참조 위험 | company/contact/products/log/deal 모두 ownership 검증을 필수로 둔다. |
| 회사와 무관한 담당자를 딜에 연결할 위험 | Deal 생성/수정에서 contact.companyId와 companyId 일치를 검증한다. |

## 6. 착수 조건

- G01은 바로 착수 가능하다.
- G02는 G01 완료 뒤 실제 API를 기준으로 착수한다.
- G01 전에 FE 작업을 병렬 진행한다면 UI skeleton과 타입 정리까지만 허용한다.
