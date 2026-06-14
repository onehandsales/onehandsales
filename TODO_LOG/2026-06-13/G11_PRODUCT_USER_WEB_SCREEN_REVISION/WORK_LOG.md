# G11 Product User Web 화면 재작업 로그

## 작업 상태

- 상태: 완료 (UX 개선 추가 반영 포함)
- 작업 일자: 2026-06-13
- 관련 goal: `G11. Product User Web 화면` (재작업 — API 스키마 불일치 수정 + 디자인 정합 + UX 개선)
- 브랜치: `fe/contact`

## 요청 내용

1. **400 Bad Request 수정** — BE `ListProductsQueryDto`와 FE 파라미터 불일치(`pageSize`, `search`, `includeDeleted` → `productName`, `productCategoryId`, `productStatusId`)
2. **전체 제품 기능 재구현** — 카테고리/상태 인라인 CRUD, 메모 로그/비밀 메모 무한 스크롤, xlsx 내보내기
3. **pen 디자인 파일 기준 스타일 정합**
4. **페이지네이션 전 도메인 적용**
5. **제품 상세 TopBar를 공통 app-shell TopBar로 이전**
6. **제품 등록 모달 카테고리/상태 드롭다운 전환** — 항상 열린 목록 → 클릭 트리거 드롭다운

## 변경 파일

### 공통
- `src/components/layout/app-shell.tsx` — `/products/:id` 경로 감지 → 상세 전용 TopBar 렌더링 (브레드크럼 + 뒤로가기 + 수정/삭제 버튼), 제품 목록 TopBar에 내보내기 버튼 추가, `?action=export|create` 처리
- `src/components/ui/pagination.tsx` — `totalPages` / `hasNext` 둘 다 지원하도록 확장
- `src/components/ui/modal-shell.tsx` — `headerClassName`, `titleClassName` prop 추가

### 제품 도메인
- `src/features/product/types/product.ts` — BE 실제 응답 스키마로 전면 재작성 (`productName`, `productCategory`, `productStatus`, `productPrice` 등)
- `src/features/product/api/product-api.ts` — 올바른 쿼리 파라미터 전송, void 반환 API, 메모 로그/비밀 메모/카테고리·상태 CRUD, xlsx 내보내기 추가
- `src/features/product/api/product-query-keys.ts` — 키 구조 정비
- `src/features/product/hooks/use-product-list.ts` — `page` 파라미터 지원
- `src/features/product/hooks/use-product-detail.ts` — `useProductCategories`, `useProductStatuses`, `useProductMemoLogsInfinite`, `useProductPrivateMemoLogsInfinite` 추가
- `src/features/product/hooks/use-product-mutations.ts` — 전면 재작성 (카테고리·상태·메모 로그·비밀 메모 mutation 추가)
- `src/features/product/components/product-list-screen.tsx` — 카테고리/상태 필터 API 연동, 페이지네이션, 내보내기 버튼 제거(TopBar 이전), 카테고리 배지 스타일(파란색 rounded-full)
- `src/features/product/components/product-detail-screen.tsx` — 내부 TopBar 제거, `isEditing`/`onEditingChange` prop화, 기본 정보 필드 재구성(분류/단위), 제품 로그 카드, 판매 현황 카드, Memo 기록 카드
- `src/features/product/components/product-create-dialog.tsx` — 헤더 amber(`#b45309`), 타이틀 "새 제품 등록", 단가 ₩/KRW 입력 그룹, 카테고리·상태 인라인 CRUD 패널
- `src/features/product/components/product-edit-form.tsx` — BE 필드명 정합
- `src/pages/products/detail.tsx` — `?edit=1` URL 파라미터로 편집 상태 관리

### 페이지네이션 (전 도메인)
- `src/features/deal/components/deal-list-screen.tsx` — `page` state, 필터 변경 시 리셋, `<Pagination hasNext>` 추가
- `src/features/meeting-note/components/meeting-note-list-screen.tsx` — 동일
- `src/features/trash/components/trash-screen.tsx` — 커스텀 `PaginationControls` → 공통 `<Pagination>` 교체

### 제품 등록 모달 UX 개선 (추가)
- `src/features/product/components/product-create-dialog.tsx`
  - `CategoryPanel` → `CategoryDropdown`: 항상 열린 목록 → 트리거 버튼 + 절대위치 드롭다운
  - `StatusPanel` → `StatusDropdown`: 동일 패턴
  - 트리거: 선택된 항목명 표시 + `ChevronDown` 아이콘 (열리면 180도 회전)
  - 외부 클릭(`mousedown`) + `Escape` 키로 드롭다운 닫힘
  - 항목 선택 시 드롭다운 자동 닫힘
  - 드롭다운 내부: 상단 "관리" 헤더 + `+ 추가` 버튼, 인라인 추가 폼, 항목 목록 (기존 CRUD 기능 유지)
  - 섹션 타이틀: "카테고리 / 상태 선택 + 관리" → "카테고리 / 상태"

### 삭제
- `src/features/product/components/product-connection-section.tsx`
- `src/features/product/components/product-log-section.tsx`
- `src/features/product/components/product-target-field.tsx`
- `src/features/product/schemas/product-schema.ts`
- `src/features/product/hooks/use-product-target-options.ts`

## 주요 버그 수정

- **400 Bad Request**: FE가 `pageSize`, `search`, `includeDeleted`를 전송하던 것을 `productName`, `productCategoryId`, `productStatusId`로 수정
- **TS 타입 오류**: `z.string().refine(...).default("0")` → `.default()` 제거로 `useForm<FormValues>` Resolver 타입 충돌 해소

## 검증 결과

- `npx tsc --noEmit`: 통과 (오류 없음)

## pen 디자인 대비 적용된 변경

| 항목 | 변경 내용 |
|------|-----------|
| 목록 카테고리 배지 | `bg-[#F3F4F6]` → `bg-[#DBEAFE] text-[#2568D8] rounded-full` |
| 목록 상태 컬럼 너비 | 150px → 100px |
| 상세 TopBar | 내부 header → 공통 app-shell TopBar (브레드크럼 + 수정/삭제) |
| 상세 기본 정보 필드 | "카테고리"→"분류", "상태" 제거, "단가"→"단위", 순서 재정렬 |
| 상세 좌측 로그 카드 | "메모 기록" → "제품 로그" |
| 상세 우측 | 판매 현황 카드 추가, "비밀 메모" → "Memo 기록" |
| 등록 모달 헤더 | `#1D4ED8` → `#b45309` amber, 타이틀 "새 제품 등록" |
| 등록 모달 저장 버튼 | `#1D4ED8` → `#b45309`, 텍스트 "제품 추가" |
| 등록 모달 단가 | ₩ prefix + KRW suffix 입력 그룹 |

## 남은 리스크 또는 보류 사항

- BE `GET /api/products` 응답에 `totalPages` 필드 미포함 → BE에 추가 요청 필요 (`Math.ceil(totalCount / pageSize)`)
- 판매 현황 카드 (연결 딜 수, 이번 달 사용)는 API 없어 정적 `-` 표시 중
- 상세 TopBar 삭제 버튼은 UI만 있고 실제 DELETE API 미연결

## 다음 권장 작업

- 다음 작업: 딜(`deal`) 도메인 FE 화면 pen 기준 디자인 정합 및 상세 기능 완성
- 전체 진행 현황:
  - 완료: G00-G11 (G11 재작업 포함)
  - 진행 필요: G12-G36
