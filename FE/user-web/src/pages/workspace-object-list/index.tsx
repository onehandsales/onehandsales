import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowUpDown,
  Calendar,
  CalendarClock,
  CircleDollarSign,
  Contact,
  Download,
  Globe,
  Hash,
  Kanban,
  Link2,
  ListChecks,
  Mail,
  MapPin,
  MessagesSquare,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  SlidersHorizontal,
  SquareCheck,
  Star,
  Type,
  Upload,
  User,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useOutletContext, useParams } from "react-router-dom";
import type { AppShellOutletContext } from "@/components/layout/app-shell";
import { useAppI18n, type AppLocale } from "@/features/app-i18n";
import { useAuthSession } from "@/features/auth";
import {
  SidebarCrmObjectIcon,
  createWorkspaceObjectRecordDefinition,
  createWorkspaceObjectAttributeDefinition,
  updateWorkspaceObjectRecordAttributeValueDefinition,
  type AttributeDefinitionValueType,
  type CreateWorkspaceObjectAttributeDefinitionResponse,
  type WorkspaceObjectAttributeDefinitionListItem,
  type WorkspaceObjectRecordDefinitionListItem,
  useWorkspaceObjectAttributeDefinitionsQuery,
  useWorkspaceObjectRecordDefinitionsQuery,
  workspaceObjectAttributeDefinitionQueryKeys,
  workspaceObjectRecordDefinitionQueryKeys,
} from "@/features/crm-object";
import {
  RecordAttributeValueCell,
  type RecordAttributeValueCellSaveInput,
} from "@/features/crm-object/components/record-attribute-value-cell";
import {
  getRecordAttributeValueDisplayText,
  type RecordAttributeValueBooleanLabels,
} from "@/features/crm-object/utils/record-attribute-value-display";
import {
  createLucideIconValue,
  type DynamicLucideIconName,
} from "@/features/crm-object/utils/object-definition-icon-value";
import { getApiErrorMessage } from "@/lib/api-client";
import { cn } from "@/utils/cn";

const OBJECT_LIST_SELECT_COLUMN_WIDTH_PX = 44;
const OBJECT_LIST_ADD_ATTRIBUTE_COLUMN_WIDTH_PX = 44;
const OBJECT_LIST_ATTRIBUTE_MIN_WIDTH_PX = 170;
const OBJECT_LIST_ATTRIBUTE_DEFAULT_WIDTH_PX = 170;
const ADD_ATTRIBUTE_DEFINITION_MODAL_TRANSITION_MS = 300;
const ADD_ATTRIBUTE_DEFINITION_MODAL_OPEN_DELAY_MS = 20;
const ADD_ATTRIBUTE_DEFINITION_MODAL_LOADING_CLOSE_DELAY_MS = 2000;
const ADD_ATTRIBUTE_DEFINITION_DESCRIPTION_MAX_LENGTH = 300;
const CREATE_RECORD_DEFINITION_MODAL_TRANSITION_MS = 300;
const CREATE_RECORD_DEFINITION_MODAL_OPEN_DELAY_MS = 20;
const CREATE_RECORD_DEFINITION_MODAL_LOADING_CLOSE_DELAY_MS = 2000;
const CREATE_RECORD_DEFINITION_DESCRIPTION_MAX_LENGTH = 300;
const EMPTY_RECORD_PLACEHOLDER_ROW_COUNT = 3;
const EMPTY_RECORD_PLACEHOLDER_ROW_INDEXES = Array.from(
  { length: EMPTY_RECORD_PLACEHOLDER_ROW_COUNT },
  (_, index) => index,
);

type AddAttributeDefinitionCreateStep = "name" | "type" | "details";
type CreateRecordDefinitionStep = "name" | "details";

type AttributeDefinitionTypeKey = AttributeDefinitionValueType;

type AttributeDefinitionTypeIconKind =
  | "actor"
  | "checkbox"
  | "currency"
  | "date"
  | "domain"
  | "email"
  | "interaction"
  | "location"
  | "name"
  | "number"
  | "phone"
  | "rating"
  | "record"
  | "select"
  | "status"
  | "text"
  | "timestamp";

type AttributeDefinitionTypeOption = {
  readonly iconKind: AttributeDefinitionTypeIconKind;
  readonly key: AttributeDefinitionTypeKey;
  readonly label: string;
};

type AttributeDefinitionTypeOptionGroup = {
  readonly options: readonly AttributeDefinitionTypeOption[];
  readonly title: string;
};

type AddAttributeDefinitionCreateModalCopy = {
  readonly back: string;
  readonly createButtonLabel: string;
  readonly creatingTitle: string;
  readonly descriptionInputLabel: string;
  readonly descriptionPlaceholder: string;
  readonly detailsTitle: string;
  readonly nameInputLabel: string;
  readonly namePlaceholder: string;
  readonly nameTitle: string;
  readonly next: string;
  readonly typeTitle: string;
  readonly typeOptionGroups: readonly AttributeDefinitionTypeOptionGroup[];
};

type CreateRecordDefinitionModalCopy = {
  readonly back: string;
  readonly createButtonLabel: string;
  readonly creatingTitle: string;
  readonly descriptionInputLabel: string;
  readonly descriptionPlaceholder: string;
  readonly detailsTitle: string;
  readonly nameInputLabel: string;
  readonly namePlaceholder: string;
  readonly nameTitle: string;
  readonly next: string;
};

const addAttributeDefinitionCreateModalCopyByLocale: Record<
  AppLocale,
  AddAttributeDefinitionCreateModalCopy
> = {
  "ko-KR": {
    back: "이전",
    createButtonLabel: "생성",
    creatingTitle: "속성을 생성하고 있어요.",
    descriptionInputLabel: "속성 설명 (선택)",
    descriptionPlaceholder: "예: 고객사의 공식 회사 이름을 입력해요.",
    detailsTitle: "설명을 추가해 주세요.",
    nameInputLabel: "속성 이름",
    namePlaceholder: "예: 회사 이름",
    nameTitle: "새 속성 이름을 작성해 주세요.",
    next: "다음",
    typeTitle: "유형을 선택해 주세요.",
    typeOptionGroups: [
      {
        title: "자주 사용",
        options: [
          {
            iconKind: "email",
            key: "EmailAddress",
            label: "이메일",
          },
          {
            iconKind: "phone",
            key: "PhoneNumber",
            label: "전화번호",
          },
          {
            iconKind: "location",
            key: "Location",
            label: "위치",
          },
          {
            iconKind: "number",
            key: "Number",
            label: "숫자",
          },
          {
            iconKind: "currency",
            key: "Currency",
            label: "금액",
          },
          {
            iconKind: "text",
            key: "Text",
            label: "텍스트",
          },
          {
            iconKind: "checkbox",
            key: "Checkbox",
            label: "체크박스",
          },
          {
            iconKind: "select",
            key: "Select",
            label: "선택",
          },
          {
            iconKind: "status",
            key: "Status",
            label: "상태",
          },
          {
            iconKind: "date",
            key: "Date",
            label: "날짜",
          },
          {
            iconKind: "domain",
            key: "Domain",
            label: "도메인",
          },
        ],
      },
      {
        title: "더보기",
        options: [
          {
            iconKind: "record",
            key: "RecordReference",
            label: "기록 연결",
          },
          {
            iconKind: "actor",
            key: "ActorReference",
            label: "담당자",
          },
          {
            iconKind: "name",
            key: "PersonalName",
            label: "사람 이름",
          },
          {
            iconKind: "rating",
            key: "Rating",
            label: "평점",
          },
          {
            iconKind: "timestamp",
            key: "Timestamp",
            label: "날짜와 시간",
          },
          {
            iconKind: "interaction",
            key: "Interaction",
            label: "상호작용",
          },
        ],
      },
    ],
  },
  en: {
    back: "Back",
    createButtonLabel: "Create",
    creatingTitle: "Creating your new property.",
    descriptionInputLabel: "Property description (optional)",
    descriptionPlaceholder: "Example: Enter the company's official name.",
    detailsTitle: "Add a description.",
    nameInputLabel: "Property name",
    namePlaceholder: "company name",
    nameTitle: "Name your new property.",
    next: "Next",
    typeTitle: "Choose a property type.",
    typeOptionGroups: [
      {
        title: "Frequently Used",
        options: [
          {
            iconKind: "email",
            key: "EmailAddress",
            label: "Email",
          },
          {
            iconKind: "phone",
            key: "PhoneNumber",
            label: "Phone",
          },
          {
            iconKind: "location",
            key: "Location",
            label: "Location",
          },
          {
            iconKind: "number",
            key: "Number",
            label: "Number",
          },
          {
            iconKind: "currency",
            key: "Currency",
            label: "Currency",
          },
          {
            iconKind: "text",
            key: "Text",
            label: "Text",
          },
          {
            iconKind: "checkbox",
            key: "Checkbox",
            label: "Checkbox",
          },
          {
            iconKind: "select",
            key: "Select",
            label: "Select",
          },
          {
            iconKind: "status",
            key: "Status",
            label: "Status",
          },
          {
            iconKind: "date",
            key: "Date",
            label: "Date",
          },
          {
            iconKind: "domain",
            key: "Domain",
            label: "Domain",
          },
        ],
      },
      {
        title: "More",
        options: [
          {
            iconKind: "record",
            key: "RecordReference",
            label: "Record",
          },
          {
            iconKind: "actor",
            key: "ActorReference",
            label: "Actor",
          },
          {
            iconKind: "name",
            key: "PersonalName",
            label: "Name",
          },
          {
            iconKind: "rating",
            key: "Rating",
            label: "Rating",
          },
          {
            iconKind: "timestamp",
            key: "Timestamp",
            label: "Date & time",
          },
          {
            iconKind: "interaction",
            key: "Interaction",
            label: "Interaction",
          },
        ],
      },
    ],
  },
};

function getCreateRecordDefinitionModalCopy(
  locale: AppLocale,
  objectLabel: string,
): CreateRecordDefinitionModalCopy {
  if (locale === "ko-KR") {
    return {
      back: "이전",
      createButtonLabel: "생성",
      creatingTitle: "새 기록을 생성하고 있어요.",
      descriptionInputLabel: "설명 (선택)",
      descriptionPlaceholder: "예: 이 기록에 대한 메모를 입력해요.",
      detailsTitle: "설명을 추가해 주세요.",
      nameInputLabel: `${objectLabel} 이름`,
      namePlaceholder: `예: ${objectLabel} 이름`,
      nameTitle: `새 ${objectLabel} 이름을 작성해 주세요.`,
      next: "다음",
    };
  }

  return {
    back: "Back",
    createButtonLabel: "Create",
    creatingTitle: `Creating your new ${objectLabel}.`,
    descriptionInputLabel: "Description (optional)",
    descriptionPlaceholder: "Example: Add a memo for this record.",
    detailsTitle: "Add a description.",
    nameInputLabel: `${objectLabel} name`,
    namePlaceholder: `Example: ${objectLabel} name`,
    nameTitle: `Name your new ${objectLabel}.`,
    next: "Next",
  };
}

function getAttributeDefinitionTypeIcon(
  kind: AttributeDefinitionTypeIconKind,
) {
  const iconByKind: Record<AttributeDefinitionTypeIconKind, LucideIcon> = {
    actor: User,
    checkbox: SquareCheck,
    currency: CircleDollarSign,
    date: Calendar,
    domain: Globe,
    email: Mail,
    interaction: MessagesSquare,
    location: MapPin,
    name: Contact,
    number: Hash,
    phone: Phone,
    rating: Star,
    record: Link2,
    select: ListChecks,
    status: Kanban,
    text: Type,
    timestamp: CalendarClock,
  };

  return iconByKind[kind];
}

const ATTRIBUTE_DEFINITION_ICON_BY_TYPE: Record<
  AttributeDefinitionTypeKey,
  DynamicLucideIconName
> = {
  ActorReference: "user",
  Checkbox: "square-check",
  Currency: "circle-dollar-sign",
  Date: "calendar",
  Domain: "globe",
  EmailAddress: "mail",
  Interaction: "messages-square",
  Location: "map-pin",
  Number: "hash",
  PersonalName: "contact",
  PhoneNumber: "phone",
  Rating: "star",
  RecordReference: "link-2",
  Select: "list-checks",
  Status: "kanban",
  Text: "type",
  Timestamp: "calendar-clock",
};

type RenderedObjectListAttributeColumn =
  Pick<
    WorkspaceObjectAttributeDefinitionListItem,
    "id" | "icon" | "title" | "type"
  > & {
    readonly isLoadingPlaceholder: boolean;
  };

type ObjectListAttributeColumnWidthsById = Readonly<Record<string, number>>;

// 기능 : AttributeDefinition 컬럼 폭을 허용 범위 안으로 보정합니다.
function clampObjectListAttributeColumnWidth(width: number) {
  return Math.max(OBJECT_LIST_ATTRIBUTE_MIN_WIDTH_PX, Math.round(width));
}

// 기능 : AttributeDefinition 컬럼별 현재 폭 또는 기본 시작 폭을 조회합니다.
function getObjectListAttributeColumnWidth(
  columnId: string,
  columnWidthsById: ObjectListAttributeColumnWidthsById,
) {
  return (
    columnWidthsById[columnId] ?? OBJECT_LIST_ATTRIBUTE_DEFAULT_WIDTH_PX
  );
}

// 기능 : AttributeDefinition 컬럼 개수에 맞는 Object 목록 grid template을 생성합니다.
function buildObjectListTableGridTemplate(
  columns: readonly RenderedObjectListAttributeColumn[],
  columnWidthsById: ObjectListAttributeColumnWidthsById,
) {
  const dataColumns = columns.map((column) => {
    return `${getObjectListAttributeColumnWidth(column.id, columnWidthsById)}px`;
  });

  const fixedColumns = `${OBJECT_LIST_SELECT_COLUMN_WIDTH_PX}px`;
  const addAttributeColumn = `minmax(${OBJECT_LIST_ADD_ATTRIBUTE_COLUMN_WIDTH_PX}px,1fr)`;

  if (dataColumns.length === 0) {
    return `${fixedColumns} ${addAttributeColumn}`;
  }

  return `${fixedColumns} ${dataColumns.join(" ")} ${addAttributeColumn}`;
}

// 기능 : 현재 컬럼 폭 합계로 Object 목록 table의 최소 가로 폭을 계산합니다.
function getObjectListTableMinWidth(
  columns: readonly RenderedObjectListAttributeColumn[],
  columnWidthsById: ObjectListAttributeColumnWidthsById,
) {
  // 1. 선택 컬럼과 필요한 정보 추가 컬럼처럼 고정으로 필요한 폭을 먼저 더한다.
  const fixedWidth =
    OBJECT_LIST_SELECT_COLUMN_WIDTH_PX +
    OBJECT_LIST_ADD_ATTRIBUTE_COLUMN_WIDTH_PX;

  // 2. AttributeDefinition 컬럼별 현재 폭을 더해 실제 table 최소 폭을 만든다.
  return columns.reduce((totalWidth, column) => {
    return (
      totalWidth +
      getObjectListAttributeColumnWidth(column.id, columnWidthsById)
    );
  }, fixedWidth);
}

// 기능 : API 로딩 중에도 header row 높이와 column 구조를 유지할 임시 컬럼을 생성합니다.
function createLoadingAttributeColumn(): RenderedObjectListAttributeColumn {
  return {
    id: "attribute-definition-loading",
    icon: null,
    title: "",
    type: "Text",
    isLoadingPlaceholder: true,
  };
}

// 기능 : AttributeDefinition API 응답을 header row 렌더링용 컬럼 값으로 변환합니다.
function toRenderedAttributeColumns(
  attributeDefinitions: readonly WorkspaceObjectAttributeDefinitionListItem[],
  isLoading: boolean,
): readonly RenderedObjectListAttributeColumn[] {
  if (attributeDefinitions.length > 0) {
    return attributeDefinitions.map((attributeDefinition) => ({
      id: attributeDefinition.id,
      icon: attributeDefinition.icon,
      title: attributeDefinition.title,
      type: attributeDefinition.type,
      isLoadingPlaceholder: false,
    }));
  }

  if (isLoading) {
    return [createLoadingAttributeColumn()];
  }

  return [];
}

// 기능 : RecordDefinition row의 attribute 값을 attributeDefinitionId 기준 Map으로 변환합니다.
function getRecordAttributeValueMap(
  row: WorkspaceObjectRecordDefinitionListItem,
) {
  return new Map(
    row.recordAttributeValues.map((value) => [
      value.attributeDefinitionId,
      value,
    ]),
  );
}

// 기능 : RecordDefinition row에서 선택 checkbox 접근성 이름으로 사용할 대표 값을 찾습니다.
function getRecordRowLabel(
  row: WorkspaceObjectRecordDefinitionListItem,
  attributeColumns: readonly RenderedObjectListAttributeColumn[],
  booleanLabels: RecordAttributeValueBooleanLabels,
) {
  const valuesByAttributeId = getRecordAttributeValueMap(row);

  for (const column of attributeColumns) {
    const displayText = getRecordAttributeValueDisplayText(
      valuesByAttributeId.get(column.id),
      booleanLabels,
    ).trim();

    if (displayText.length > 0) {
      return displayText;
    }
  }

  return row.id;
}

// 기능 : RecordDefinition row가 현재 검색어와 일치하는지 확인합니다.
function doesRecordRowMatchSearch(
  row: WorkspaceObjectRecordDefinitionListItem,
  searchQuery: string,
  booleanLabels: RecordAttributeValueBooleanLabels,
) {
  if (searchQuery.length === 0) {
    return true;
  }

  return [
    row.createdAt,
    row.updatedAt,
    ...row.recordAttributeValues.map((value) =>
      getRecordAttributeValueDisplayText(value, booleanLabels),
    ),
  ].some((value) => value.toLowerCase().includes(searchQuery));
}

// 기능 : Workspace 관리 항목의 공통 목록 화면 UX를 렌더링합니다.
export function WorkspaceObjectListPage() {
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isMoreActionsOpen, setMoreActionsOpen] = useState(false);
  const [
    isAddAttributeDefinitionModalOpen,
    setAddAttributeDefinitionModalOpen,
  ] = useState(false);
  const [
    isCreateRecordDefinitionModalOpen,
    setCreateRecordDefinitionModalOpen,
  ] = useState(false);
  // 상태 : 테이블 하단 생성하기 버튼의 빈 RecordDefinition 생성 진행 여부입니다.
  const [
    isCreatingRecordDefinitionRow,
    setCreatingRecordDefinitionRow,
  ] = useState(false);
  // 상태 : 테이블 하단 생성하기 버튼의 빈 RecordDefinition 생성 실패 메시지입니다.
  const [
    createRecordDefinitionRowErrorMessage,
    setCreateRecordDefinitionRowErrorMessage,
  ] = useState<string | null>(null);
  const [
    activeEmptyRecordPlaceholderRowIndex,
    setActiveEmptyRecordPlaceholderRowIndex,
  ] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [attributeColumnWidthsById, setAttributeColumnWidthsById] =
    useState<Record<string, number>>({});
  const columnResizeCleanupRef = useRef<(() => void) | null>(null);
  const isCreatingRecordDefinitionRowRef = useRef(false);
  const moreActionsRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const queryClient = useQueryClient();
  const { t, formatDate, formatDateTime } = useAppI18n();
  const { user } = useAuthSession();
  const { objectDefinitionId, workspaceId } = useParams<{
    readonly objectDefinitionId?: string;
    readonly workspaceId?: string;
  }>();
  const { selectedSidebarCrmObject, sidebarCrmObjects } =
    useOutletContext<AppShellOutletContext>();

  // 1. 현재 관리 항목의 header AttributeDefinition 목록을 조회한다.
  const attributeDefinitionsQuery = useWorkspaceObjectAttributeDefinitionsQuery({
    userId: user?.id ?? null,
    workspaceId: workspaceId ?? null,
    objectDefinitionId: objectDefinitionId ?? null,
  });

  // 2. 현재 관리 항목의 body row RecordDefinition 목록을 조회한다.
  const recordDefinitionsQuery = useWorkspaceObjectRecordDefinitionsQuery({
    userId: user?.id ?? null,
    workspaceId: workspaceId ?? null,
    objectDefinitionId: objectDefinitionId ?? null,
  });
  const object =
    selectedSidebarCrmObject ??
    sidebarCrmObjects.find((item) => item.id === objectDefinitionId) ??
    null;
  const objectLabel = object?.singularName ?? t("objectList.fallbackObjectLabel");
  const renderedAttributeColumns = useMemo(
    () =>
      toRenderedAttributeColumns(
        attributeDefinitionsQuery.data ?? [],
        attributeDefinitionsQuery.isLoading ||
          (attributeDefinitionsQuery.isFetching &&
            !attributeDefinitionsQuery.data),
      ),
    [
      attributeDefinitionsQuery.data,
      attributeDefinitionsQuery.isFetching,
      attributeDefinitionsQuery.isLoading,
    ],
  );
  const tableGridTemplateColumns = useMemo(
    () =>
      buildObjectListTableGridTemplate(
        renderedAttributeColumns,
        attributeColumnWidthsById,
      ),
    [attributeColumnWidthsById, renderedAttributeColumns],
  );
  const tableMinWidthPx = useMemo(
    () =>
      getObjectListTableMinWidth(
        renderedAttributeColumns,
        attributeColumnWidthsById,
      ),
    [attributeColumnWidthsById, renderedAttributeColumns],
  );
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const searchLabel = t("common.searchName", { values: { name: objectLabel } });
  const booleanLabels = useMemo(
    () => ({
      falseLabel: t("common.no"),
      trueLabel: t("common.yes"),
    }),
    [t],
  );

  // 3. cursor pagination으로 받은 RecordDefinition page들을 화면 row 목록으로 합친다.
  const recordRows = useMemo(
    () => recordDefinitionsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [recordDefinitionsQuery.data?.pages],
  );

  // 4. 현재 검색어와 일치하는 RecordDefinition row만 화면에 남긴다.
  const visibleRows = useMemo(() => {
    return recordRows.filter((row) =>
      doesRecordRowMatchSearch(row, normalizedSearchQuery, booleanLabels),
    );
  }, [booleanLabels, normalizedSearchQuery, recordRows]);

  // 5. 초기 로딩과 background refetch를 분리해 빈 화면 깜빡임을 막는다.
  const isRecordDefinitionsLoading =
    recordDefinitionsQuery.isLoading ||
    (recordDefinitionsQuery.isFetching && !recordDefinitionsQuery.data);

  // 6. 실제 데이터가 없을 때는 생성되지 않은 placeholder row를 먼저 보여준다.
  const shouldShowEmptyRecordPlaceholders =
    !isRecordDefinitionsLoading &&
    !recordDefinitionsQuery.isError &&
    recordRows.length === 0;

  // 7. 검색으로 인해 보이는 row만 사라진 경우는 별도의 빈 검색 상태로 다룬다.
  const shouldShowSearchEmptyState =
    !isRecordDefinitionsLoading &&
    !recordDefinitionsQuery.isError &&
    recordRows.length > 0 &&
    visibleRows.length === 0;

  // 8. 실제 RecordDefinition row가 있을 때만 하단 생성 row를 보여준다.
  const shouldShowCreateRecordDefinitionRow =
    !isRecordDefinitionsLoading &&
    !recordDefinitionsQuery.isError &&
    recordRows.length > 0;

  // 기능 : 실패한 RecordDefinition 목록 조회를 다시 요청합니다.
  function handleRetryLoadRecords() {
    // 1. 현재 query key 기준으로 RecordDefinition 목록을 다시 가져온다.
    void recordDefinitionsQuery.refetch();
  }

  // 기능 : RecordDefinition 목록의 다음 page를 이어서 불러옵니다.
  function handleLoadMoreRecords() {
    // 1. Backend가 내려준 cursor를 사용해 다음 RecordDefinition page를 요청한다.
    void recordDefinitionsQuery.fetchNextPage();
  }

  // 기능 : 테이블 하단 생성하기 버튼에서 빈 RecordDefinition row를 생성합니다.
  async function handleCreateRecordDefinitionRow() {
    // 1. 생성에 필요한 사용자/Workspace/ObjectDefinition 경계 값이 없으면 요청하지 않는다.
    const ownerUserId = user?.id ?? null;
    const currentWorkspaceId = workspaceId ?? null;
    const currentObjectDefinitionId = objectDefinitionId ?? null;

    if (
      !ownerUserId ||
      !currentWorkspaceId ||
      !currentObjectDefinitionId ||
      isCreatingRecordDefinitionRowRef.current
    ) {
      return;
    }

    // 2. 중복 클릭을 막고 빈 RecordDefinition 생성 API를 호출한다.
    setCreateRecordDefinitionRowErrorMessage(null);
    isCreatingRecordDefinitionRowRef.current = true;
    setCreatingRecordDefinitionRow(true);

    try {
      await createWorkspaceObjectRecordDefinition({
        workspaceId: currentWorkspaceId,
        objectDefinitionId: currentObjectDefinitionId,
      });

      // 3. 서버 기준 RecordDefinition 목록을 다시 가져오도록 현재 object list query를 갱신한다.
      await queryClient.invalidateQueries({
        queryKey: workspaceObjectRecordDefinitionQueryKeys.list(
          ownerUserId,
          currentWorkspaceId,
          currentObjectDefinitionId,
        ),
      });
    } catch (error) {
      // 4. 실패하면 API 오류 메시지를 테이블 하단에 표시한다.
      setCreateRecordDefinitionRowErrorMessage(getApiErrorMessage(error));
    } finally {
      isCreatingRecordDefinitionRowRef.current = false;
      setCreatingRecordDefinitionRow(false);
    }
  }

  // 기능 : RecordDefinition 목록 cell 하나의 value 수정 API를 호출하고 목록 query를 갱신합니다.
  async function handleRecordAttributeValueSave(
    row: WorkspaceObjectRecordDefinitionListItem,
    input: RecordAttributeValueCellSaveInput,
  ) {
    // 1. 수정에 필요한 사용자/Workspace/ObjectDefinition 경계 값이 없으면 요청하지 않는다.
    const ownerUserId = user?.id ?? null;
    const currentWorkspaceId = workspaceId ?? null;
    const currentObjectDefinitionId = objectDefinitionId ?? null;

    if (!ownerUserId || !currentWorkspaceId || !currentObjectDefinitionId) {
      return;
    }

    // 2. 현재 cell에 입력된 draft value를 Backend PATCH API 계약 형태로 전달한다.
    await updateWorkspaceObjectRecordAttributeValueDefinition({
      workspaceId: currentWorkspaceId,
      objectDefinitionId: currentObjectDefinitionId,
      recordDefinitionId: row.id,
      recordAttributeValueDefinitionId:
        input.recordAttributeValueDefinitionId,
      value: input.value,
    });

    // 3. 서버 저장값과 RecordDefinition updatedAt을 다시 화면에 반영한다.
    await queryClient.invalidateQueries({
      queryKey: workspaceObjectRecordDefinitionQueryKeys.list(
        ownerUserId,
        currentWorkspaceId,
        currentObjectDefinitionId,
      ),
    });
  }

  // 기능 : header resize handle 드래그로 AttributeDefinition 컬럼 폭을 조절합니다.
  function handleAttributeColumnResizePointerDown(
    columnId: string,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) {
    // 1. 마우스 보조 버튼 입력은 컬럼 resize 시작으로 처리하지 않는다.
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    // 2. header cell 선택이나 상위 클릭 동작으로 전파되지 않게 막는다.
    event.preventDefault();
    event.stopPropagation();

    // 3. 기존 resize listener가 남아 있으면 새 drag 시작 전에 정리한다.
    columnResizeCleanupRef.current?.();

    const startX = event.clientX;
    const startWidth = getObjectListAttributeColumnWidth(
      columnId,
      attributeColumnWidthsById,
    );
    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    // 기능 : pointer 이동 거리만큼 현재 컬럼 폭을 갱신합니다.
    const handlePointerMove = (pointerEvent: PointerEvent) => {
      // 1. drag 시작점과 현재 pointer 위치 차이를 계산한다.
      const deltaX = pointerEvent.clientX - startX;
      // 2. 최소/최대 폭 기준 안에서 다음 컬럼 폭을 계산한다.
      const nextWidth = clampObjectListAttributeColumnWidth(
        startWidth + deltaX,
      );

      // 3. 계산된 폭을 컬럼 ID 기준 state에 반영한다.
      setAttributeColumnWidthsById((currentWidths) => ({
        ...currentWidths,
        [columnId]: nextWidth,
      }));
    };

    // 기능 : resize drag가 끝나면 전역 pointer listener와 body style을 정리합니다.
    const cleanupResize = () => {
      // 1. resize 중에 등록한 전역 pointer listener를 제거한다.
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", cleanupResize);
      window.removeEventListener("pointercancel", cleanupResize);
      // 2. drag 중에 잠시 바꾼 body cursor와 selection style을 복원한다.
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
      // 3. unmount cleanup에서 중복 실행하지 않도록 ref를 비운다.
      columnResizeCleanupRef.current = null;
    };

    columnResizeCleanupRef.current = cleanupResize;
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", cleanupResize);
    window.addEventListener("pointercancel", cleanupResize);
  }

  useEffect(() => {
    return () => {
      columnResizeCleanupRef.current?.();
    };
  }, []);

  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);

  // 기능 : 새로 생성된 AttributeDefinition을 header row 목록 query에 반영합니다.
  async function handleAttributeDefinitionCreated() {
    // 1. 현재 사용자가 선택한 Workspace와 ObjectDefinition이 준비되지 않았으면 갱신을 건너뛴다.
    const ownerUserId = user?.id ?? null;
    const currentWorkspaceId = workspaceId ?? null;
    const currentObjectDefinitionId = objectDefinitionId ?? null;

    if (!ownerUserId || !currentWorkspaceId || !currentObjectDefinitionId) {
      return;
    }

    // 2. 서버 기준 AttributeDefinition 목록을 다시 가져오도록 query cache를 무효화한다.
    await queryClient.invalidateQueries({
      queryKey: workspaceObjectAttributeDefinitionQueryKeys.list(
        ownerUserId,
        currentWorkspaceId,
        currentObjectDefinitionId,
      ),
    });
  }

  // 기능 : 필요한 정보 추가 버튼에서 AttributeDefinition 생성 모달을 엽니다.
  function openAddAttributeDefinitionModal() {
    setMoreActionsOpen(false);
    setAddAttributeDefinitionModalOpen(true);
  }

  // 기능 : 임시 AttributeDefinition 생성 모달을 닫습니다.
  function closeAddAttributeDefinitionModal() {
    setAddAttributeDefinitionModalOpen(false);
  }

  // 기능 : 생성하기 버튼에서 임시 RecordDefinition 생성 모달을 엽니다.
  function openCreateRecordDefinitionModal() {
    setMoreActionsOpen(false);
    setCreateRecordDefinitionModalOpen(true);
  }

  // 기능 : 임시 RecordDefinition 생성 모달을 닫습니다.
  function closeCreateRecordDefinitionModal() {
    setCreateRecordDefinitionModalOpen(false);
  }

  // 기능 : 더보기 메뉴 바깥 입력과 Escape 키로 메뉴를 닫습니다.
  useEffect(() => {
    if (!isMoreActionsOpen) {
      return;
    }

    // 기능 : 더보기 메뉴 바깥 pointer 입력을 처리합니다.
    const handleDocumentPointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (
        target instanceof Node &&
        moreActionsRef.current?.contains(target)
      ) {
        return;
      }

      setMoreActionsOpen(false);
    };

    // 기능 : 더보기 메뉴 닫기 키 입력을 처리합니다.
    const handleDocumentKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMoreActionsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleDocumentPointerDown);
    document.addEventListener("keydown", handleDocumentKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handleDocumentPointerDown);
      document.removeEventListener("keydown", handleDocumentKeyDown);
    };
  }, [isMoreActionsOpen]);

  return (
    <>
      <section
        className="flex h-[calc(100dvh-var(--topbar-height))] min-h-0 flex-col overflow-hidden bg-white"
        data-testid="workspace-object-list-page"
      >
        <div className="flex h-11 shrink-0 items-center gap-2 bg-white px-3">
        {isSearchOpen ? (
          <label className="relative flex h-8 w-full max-w-[360px] items-center">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-2 h-5 w-5 text-[#9CA3AF]"
              strokeWidth={2}
            />
            <input
              aria-label={searchLabel}
              className="h-8 w-full rounded-md bg-[#F3F2EF] pl-9 pr-2 text-[14px] font-medium text-[#111827] outline-none transition placeholder:text-[#9CA3AF] hover:bg-[#EDEBE6] focus:bg-[#EDEBE6]"
              placeholder={t("objectList.searchPlaceholder")}
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onBlur={() => {
                if (searchQuery.trim().length === 0) {
                  setSearchOpen(false);
                }
              }}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setSearchQuery("");
                  setSearchOpen(false);
                }
              }}
            />
          </label>
        ) : (
          <button
            aria-label={searchLabel}
            className="group/object-toolbar-tooltip relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#9CA3AF] transition hover:bg-[#E4E2DC] hover:text-[#6B7280] active:bg-[#D3D1CB]"
            type="button"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-5 w-5" strokeWidth={2} />
            <span className="pointer-events-none absolute left-0 top-[calc(100%+6px)] z-50 whitespace-nowrap rounded-md bg-[#111827] px-2 py-1 text-[14px] font-medium leading-none text-white opacity-0 shadow-lg transition-opacity group-hover/object-toolbar-tooltip:opacity-100">
              {t("objectList.openSearchTooltip")}
            </span>
          </button>
        )}
        <button
          aria-label={t("common.filter")}
          className="group/object-toolbar-tooltip relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#9CA3AF] transition hover:bg-[#E4E2DC] hover:text-[#6B7280] active:bg-[#D3D1CB]"
          type="button"
        >
          <SlidersHorizontal className="h-5 w-5" strokeWidth={2} />
          <span className="pointer-events-none absolute left-1/2 top-[calc(100%+6px)] z-50 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#111827] px-2 py-1 text-[14px] font-medium leading-none text-white opacity-0 shadow-lg transition-opacity group-hover/object-toolbar-tooltip:opacity-100">
            {t("objectList.openFilterTooltip")}
          </span>
        </button>
        <button
          aria-label={t("objectList.viewSortTooltip")}
          className="group/object-toolbar-tooltip relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#9CA3AF] transition hover:bg-[#E4E2DC] hover:text-[#6B7280] active:bg-[#D3D1CB]"
          type="button"
        >
          <ArrowUpDown className="h-5 w-5" strokeWidth={2} />
          <span className="pointer-events-none absolute left-1/2 top-[calc(100%+6px)] z-50 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#111827] px-2 py-1 text-[14px] font-medium leading-none text-white opacity-0 shadow-lg transition-opacity group-hover/object-toolbar-tooltip:opacity-100">
            {t("objectList.viewSortTooltip")}
          </span>
        </button>
        <button
          aria-label={`새 ${objectLabel}`}
          className="group/object-toolbar-tooltip relative ml-auto inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#4880EE] text-white transition hover:bg-[#3B6FDA] active:bg-[#315FC0]"
          type="button"
          onClick={openCreateRecordDefinitionModal}
        >
          <Plus className="h-5 w-5" strokeWidth={2} />
          <span className="pointer-events-none absolute left-1/2 top-[calc(100%+6px)] z-50 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#111827] px-2 py-1 text-[14px] font-medium leading-none text-white opacity-0 shadow-lg transition-opacity group-hover/object-toolbar-tooltip:opacity-100">
            {t("objectList.createTooltip")}
          </span>
        </button>
        <div className="relative" ref={moreActionsRef}>
          <button
            aria-expanded={isMoreActionsOpen}
            aria-haspopup="menu"
            aria-label={t("objectList.moreActionsTooltip")}
            className={`group/object-toolbar-tooltip relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition ${
              isMoreActionsOpen
                ? "bg-[#E4E2DC] text-[#6B7280] active:bg-[#D3D1CB]"
                : "text-[#9CA3AF] hover:bg-[#E4E2DC] hover:text-[#6B7280] active:bg-[#D3D1CB]"
            }`}
            type="button"
            onClick={() => setMoreActionsOpen((open) => !open)}
          >
            <MoreHorizontal className="h-5 w-5" strokeWidth={2} />
            {!isMoreActionsOpen ? (
              <span className="pointer-events-none absolute right-0 top-[calc(100%+6px)] z-50 whitespace-nowrap rounded-md bg-[#111827] px-2 py-1 text-[14px] font-medium leading-none text-white opacity-0 shadow-lg transition-opacity group-hover/object-toolbar-tooltip:opacity-100">
                {t("objectList.moreActionsTooltip")}
              </span>
            ) : null}
          </button>
          <div
            aria-hidden={!isMoreActionsOpen}
            className={`absolute right-0 top-[calc(100%+6px)] z-50 w-40 origin-top-right transition-all duration-150 ease-out ${
              isMoreActionsOpen
                ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                : "pointer-events-none -translate-y-1 scale-[0.98] opacity-0"
            }`}
          >
            <div
              className="overflow-hidden rounded-xl bg-white p-2 text-[#111827] shadow-[0_14px_36px_rgba(15,23,42,0.16)]"
              role="menu"
            >
              <div className="grid gap-px">
                <button
                  className="group flex h-8 w-full items-center gap-2 rounded-lg px-2 text-left text-[14px] font-medium text-[#4B5563] transition hover:bg-[#E4E2DC] hover:text-[#111827] active:bg-[#D3D1CB]"
                  role="menuitem"
                  tabIndex={isMoreActionsOpen ? undefined : -1}
                  type="button"
                  onClick={() => setMoreActionsOpen(false)}
                >
                  <Download
                    className="h-5 w-5 shrink-0 text-[#9CA3AF] group-hover:text-[#6B7280]"
                    strokeWidth={2}
                  />
                  <span className="min-w-0 flex-1 truncate">
                    {t("objectList.exportDataAction")}
                  </span>
                </button>
                <button
                  className="group flex h-8 w-full items-center gap-2 rounded-lg px-2 text-left text-[14px] font-medium text-[#4B5563] transition hover:bg-[#E4E2DC] hover:text-[#111827] active:bg-[#D3D1CB]"
                  role="menuitem"
                  tabIndex={isMoreActionsOpen ? undefined : -1}
                  type="button"
                  onClick={() => setMoreActionsOpen(false)}
                >
                  <Upload
                    className="h-5 w-5 shrink-0 text-[#9CA3AF] group-hover:text-[#6B7280]"
                    strokeWidth={2}
                  />
                  <span className="min-w-0 flex-1 truncate">
                    {t("objectList.importDataAction")}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden bg-white">
        <div className="notion-scrollbar h-full overflow-auto">
          <div
            aria-label={objectLabel}
            className="min-w-full"
            role="table"
            style={{ minWidth: tableMinWidthPx }}
          >
            <div
              className="sticky top-0 z-10 grid h-[36px] items-stretch bg-white text-[14px] font-medium text-[#111827] shadow-[inset_0_-1px_0_#EEEDEA]"
              role="row"
              style={{ gridTemplateColumns: tableGridTemplateColumns }}
            >
              <div
                className="flex h-full items-center justify-center border-r border-white"
                role="columnheader"
              >
                <input
                  aria-label={t("objectList.selectAllRowsLabel")}
                  className="h-4 w-4 rounded border-[#D6D3CD] accent-[#4880EE]"
                  type="checkbox"
                />
              </div>
              {renderedAttributeColumns.map((column) => (
                <div
                  className="relative flex h-full min-w-0 items-center gap-2 border-r border-white px-3"
                  key={column.id}
                  role="columnheader"
                >
                  {column.isLoadingPlaceholder ? (
                    <span
                      aria-hidden="true"
                      className="h-3 w-20 rounded bg-[#F3F2EF]"
                    />
                  ) : (
                    <>
                      {column.icon ? (
                        <SidebarCrmObjectIcon
                          className="h-4 w-4 shrink-0 text-[#9CA3AF]"
                          name={column.icon}
                          strokeWidth={2}
                        />
                      ) : null}
                      <span className="min-w-0 truncate text-[#9CA3AF]">
                        {column.title}
                      </span>
                    </>
                  )}
                  <button
                    aria-label={t("objectList.resizeAttributeDefinitionColumnLabel", {
                      values: {
                        name: column.title || t("common.unknown"),
                      },
                    })}
                    className="absolute right-[-4px] top-0 z-20 h-full w-2 cursor-col-resize touch-none bg-transparent transition hover:bg-[#4880EE]/35 focus-visible:bg-[#4880EE]/50 focus-visible:outline-none"
                    type="button"
                    onPointerDown={(event) =>
                      handleAttributeColumnResizePointerDown(column.id, event)
                    }
                  />
                </div>
              ))}
              <div
                className="flex h-full min-w-0 items-center justify-start px-2"
                role="columnheader"
              >
                <button
                  aria-label={t("objectList.addAttributeDefinitionTooltip")}
                  className="inline-flex h-7 max-w-full items-center justify-center gap-1.5 rounded-md px-2 text-[14px] font-medium text-[#9CA3AF] transition hover:bg-[#E4E2DC] hover:text-[#6B7280] active:bg-[#D3D1CB]"
                  type="button"
                  onClick={openAddAttributeDefinitionModal}
                >
                  <Plus
                    aria-hidden="true"
                    className="h-5 w-5 shrink-0"
                    strokeWidth={2}
                  />
                  <span className="min-w-0 truncate">
                    {t("objectList.addAttributeDefinitionTooltip")}
                  </span>
                </button>
              </div>
            </div>
            <div role="rowgroup">
              {visibleRows.map((row) => {
                const valuesByAttributeId = getRecordAttributeValueMap(row);
                const rowLabel = getRecordRowLabel(
                  row,
                  renderedAttributeColumns,
                  booleanLabels,
                );

                return (
                  <div
                    className="grid h-[40px] items-stretch bg-white text-[14px] text-[#374151] shadow-[inset_0_-1px_0_#F1F0EC] transition hover:bg-[#FAFAF8]"
                    key={row.id}
                    role="row"
                    style={{ gridTemplateColumns: tableGridTemplateColumns }}
                  >
                    <div
                      className="flex h-full items-center justify-center border-r border-[#F1F0EC]"
                      role="cell"
                    >
                      <input
                        aria-label={t("objectList.selectRowLabel", {
                          values: { name: rowLabel },
                        })}
                        className="h-4 w-4 rounded border-[#D6D3CD] accent-[#4880EE]"
                        type="checkbox"
                      />
                    </div>
                    {renderedAttributeColumns.map((column, index) => {
                      const cellValue = valuesByAttributeId.get(column.id);

                      return (
                        <div
                          className="flex h-full min-w-0 items-center border-r border-[#F1F0EC]"
                          key={column.id}
                          role="cell"
                        >
                          <RecordAttributeValueCell
                            attributeTitle={column.title}
                            attributeType={column.type}
                            booleanLabels={booleanLabels}
                            formatDate={formatDate}
                            formatDateTime={formatDateTime}
                            isPrimary={index === 0}
                            value={cellValue}
                            onSave={(input) =>
                              handleRecordAttributeValueSave(row, input)
                            }
                          />
                        </div>
                      );
                    })}
                    <div
                      aria-hidden="true"
                      className="flex h-full items-center justify-center"
                      role="cell"
                    />
                  </div>
                );
              })}
              {isRecordDefinitionsLoading ? (
                <div className="flex h-[80px] items-center px-4 text-[14px] font-medium text-[#6B7280]">
                  {t("objectList.loadingRecords")}
                </div>
              ) : null}
              {!isRecordDefinitionsLoading && recordDefinitionsQuery.isError ? (
                <div className="flex h-[80px] items-center gap-3 px-4 text-[14px] font-medium text-[#6B7280]">
                  <span>{t("objectList.loadRecordsFailed")}</span>
                  <button
                    className="h-8 rounded-md bg-[#F3F2EF] px-2.5 text-[14px] font-medium text-[#374151] transition hover:bg-[#EDEBE6] active:bg-[#D3D1CB]"
                    type="button"
                    onClick={handleRetryLoadRecords}
                  >
                    {t("common.retry")}
                  </button>
                </div>
              ) : null}
              {shouldShowSearchEmptyState ? (
                <div className="flex h-[80px] items-center px-4 text-[14px] font-medium text-[#6B7280]">
                  {t("common.searchEmpty")}
                </div>
              ) : null}
              {shouldShowEmptyRecordPlaceholders
                ? EMPTY_RECORD_PLACEHOLDER_ROW_INDEXES.map((rowIndex) => {
                    const isPlaceholderActionVisible =
                      activeEmptyRecordPlaceholderRowIndex === null
                        ? rowIndex === 0
                        : activeEmptyRecordPlaceholderRowIndex === rowIndex;

                    return (
                      <div
                        className="group/empty-record-row relative grid h-[40px] items-stretch bg-white text-[14px] text-[#374151] shadow-[inset_0_-1px_0_#F1F0EC] transition hover:bg-[#FAFAF8]"
                        key={`empty-record-placeholder-${rowIndex}`}
                        role="row"
                        style={{
                          gridTemplateColumns: tableGridTemplateColumns,
                        }}
                        onBlur={(event) => {
                          if (
                            event.currentTarget.contains(
                              event.relatedTarget as Node | null,
                            )
                          ) {
                            return;
                          }

                          setActiveEmptyRecordPlaceholderRowIndex(null);
                        }}
                        onFocus={() =>
                          setActiveEmptyRecordPlaceholderRowIndex(rowIndex)
                        }
                        onMouseEnter={() =>
                          setActiveEmptyRecordPlaceholderRowIndex(rowIndex)
                        }
                        onMouseLeave={() =>
                          setActiveEmptyRecordPlaceholderRowIndex(null)
                        }
                      >
                        <div
                          className="border-r border-[#F1F0EC]"
                          role="cell"
                        />
                        {renderedAttributeColumns.map(
                          (column, columnIndex) => (
                            <div
                              className="flex h-full min-w-0 items-center border-r border-[#F1F0EC] px-2"
                              key={column.id}
                              role="cell"
                            >
                              {columnIndex === 0 ? (
                                <button
                                  aria-label={`새 ${objectLabel}`}
                                  className={cn(
                                    "inline-flex h-8 max-w-full items-center justify-center gap-1.5 rounded-md px-2 text-[14px] font-medium text-[#4B5563] transition hover:bg-[#E4E2DC] hover:text-[#111827] active:bg-[#D3D1CB]",
                                    isPlaceholderActionVisible
                                      ? "opacity-100"
                                      : "opacity-0 group-hover/empty-record-row:opacity-100 group-focus-within/empty-record-row:opacity-100",
                                  )}
                                  type="button"
                                  onClick={handleCreateRecordDefinitionRow}
                                >
                                  <Plus
                                    aria-hidden="true"
                                    className="h-5 w-5 shrink-0"
                                    strokeWidth={2}
                                  />
                                  <span className="truncate">
                                    {t("objectList.addDataAction")}
                                  </span>
                                </button>
                              ) : null}
                            </div>
                          ),
                        )}
                        <div
                          className="flex h-full min-w-0 items-center px-2"
                          role="cell"
                        >
                          {renderedAttributeColumns.length === 0 ? (
                            <button
                              aria-label={`새 ${objectLabel}`}
                              className={cn(
                                "inline-flex h-8 max-w-full items-center justify-center gap-1.5 rounded-md px-2 text-[14px] font-medium text-[#4B5563] transition hover:bg-[#E4E2DC] hover:text-[#111827] active:bg-[#D3D1CB]",
                                isPlaceholderActionVisible
                                  ? "opacity-100"
                                  : "opacity-0 group-hover/empty-record-row:opacity-100 group-focus-within/empty-record-row:opacity-100",
                              )}
                              type="button"
                              onClick={handleCreateRecordDefinitionRow}
                            >
                              <Plus
                                aria-hidden="true"
                                className="h-5 w-5 shrink-0"
                                strokeWidth={2}
                              />
                              <span className="truncate">
                                {t("objectList.addDataAction")}
                              </span>
                            </button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })
                : null}
              {!isRecordDefinitionsLoading &&
              !recordDefinitionsQuery.isError &&
              recordDefinitionsQuery.hasNextPage ? (
                <div
                  className="flex h-[48px] items-center justify-center bg-white"
                  role="row"
                >
                  <div
                    className="flex h-full items-center justify-center"
                    role="cell"
                  >
                    <button
                      className="h-8 rounded-md bg-[#F3F2EF] px-2.5 text-[14px] font-medium text-[#374151] transition hover:bg-[#EDEBE6] active:bg-[#D3D1CB] disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={recordDefinitionsQuery.isFetchingNextPage}
                      type="button"
                      onClick={handleLoadMoreRecords}
                    >
                      {recordDefinitionsQuery.isFetchingNextPage
                        ? t("common.loading")
                        : t("common.loadMore")}
                    </button>
                  </div>
                </div>
              ) : null}
              {shouldShowCreateRecordDefinitionRow ? (
                <div
                  className="flex h-[40px] items-center justify-center bg-white shadow-[inset_0_-1px_0_#F1F0EC]"
                  role="row"
                >
                  <div
                    className="flex h-full items-center justify-center"
                    role="cell"
                  >
                    <button
                      aria-label={`새 ${objectLabel}`}
                      aria-busy={isCreatingRecordDefinitionRow}
                      className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-[#4880EE] px-2.5 text-[14px] font-medium text-white transition hover:bg-[#3B6FDA] active:bg-[#315FC0] disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={isCreatingRecordDefinitionRow}
                      type="button"
                      onClick={handleCreateRecordDefinitionRow}
                    >
                      <Plus
                        aria-hidden="true"
                        className="h-5 w-5 shrink-0"
                        strokeWidth={2}
                      />
                      <span className="truncate">
                        {t("objectList.addDataAction")}
                      </span>
                    </button>
                  </div>
                </div>
              ) : null}
              {createRecordDefinitionRowErrorMessage ? (
                <div
                  className="flex h-[32px] items-center justify-center bg-white px-4 text-[13px] font-medium text-[#DC2626]"
                  role="row"
                >
                  <div className="min-w-0 truncate" role="cell">
                    {createRecordDefinitionRowErrorMessage}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      </section>

      <AddAttributeDefinitionModal
        open={isAddAttributeDefinitionModalOpen}
        onClose={closeAddAttributeDefinitionModal}
      >
        <AddAttributeDefinitionCreateModalContent
          objectDefinitionId={objectDefinitionId ?? null}
          onClose={closeAddAttributeDefinitionModal}
          onCreated={handleAttributeDefinitionCreated}
          workspaceId={workspaceId ?? null}
        />
      </AddAttributeDefinitionModal>

      <CreateRecordDefinitionModal
        open={isCreateRecordDefinitionModalOpen}
        onClose={closeCreateRecordDefinitionModal}
      >
        <CreateRecordDefinitionModalContent
          objectLabel={objectLabel}
          onClose={closeCreateRecordDefinitionModal}
        />
      </CreateRecordDefinitionModal>
    </>
  );
}

// 기능 : 생성하기 버튼에서 여는 임시 RecordDefinition 생성 모달 shell입니다.
function CreateRecordDefinitionModal({
  children,
  onClose,
  open,
}: {
  readonly children: ReactNode;
  readonly onClose: () => void;
  readonly open: boolean;
}) {
  const [shouldRender, setShouldRender] = useState(open);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let openTimerId: number | null = null;
    let closeTimerId: number | null = null;

    if (open) {
      setShouldRender(true);
      setIsVisible(false);
      openTimerId = window.setTimeout(
        () => setIsVisible(true),
        CREATE_RECORD_DEFINITION_MODAL_OPEN_DELAY_MS,
      );
    } else {
      setIsVisible(false);
      closeTimerId = window.setTimeout(
        () => setShouldRender(false),
        CREATE_RECORD_DEFINITION_MODAL_TRANSITION_MS,
      );
    }

    return () => {
      if (openTimerId !== null) {
        window.clearTimeout(openTimerId);
      }

      if (closeTimerId !== null) {
        window.clearTimeout(closeTimerId);
      }
    };
  }, [open]);

  useEffect(() => {
    if (!shouldRender) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, shouldRender]);

  const onBackdropMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[70] flex items-center justify-center bg-black/35 px-4 py-6 transition-opacity duration-300 ease-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      data-error-report-capture-ignore="true"
      onMouseDown={onBackdropMouseDown}
    >
      <section
        aria-modal="true"
        className={`h-[min(72vh,560px)] w-full max-w-[520px] origin-center overflow-hidden rounded-xl bg-white shadow-2xl transition-all duration-300 ease-out ${
          isVisible
            ? "translate-y-0 scale-100 opacity-100"
            : "-translate-y-3 scale-[0.97] opacity-0"
        }`}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        {children}
      </section>
    </div>
  );
}

// 기능 : RecordDefinition 생성 버튼용 임시 모달 화면을 렌더링합니다.
function CreateRecordDefinitionModalContent({
  objectLabel,
  onClose,
}: {
  readonly objectLabel: string;
  readonly onClose: () => void;
}) {
  const { locale, t } = useAppI18n();
  const copy = getCreateRecordDefinitionModalCopy(locale, objectLabel);
  const [recordDefinitionName, setRecordDefinitionName] = useState("");
  const [step, setStep] = useState<CreateRecordDefinitionStep>("name");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [hasCreatedRecordDefinition, setHasCreatedRecordDefinition] =
    useState(false);
  const [createLoadingModalOpen, setCreateLoadingModalOpen] = useState(false);

  const trimmedRecordDefinitionName = recordDefinitionName.trim();
  const canMoveNext = trimmedRecordDefinitionName.length > 0;
  const canCreateRecordDefinition =
    canMoveNext && !isCreating && !hasCreatedRecordDefinition;

  const onSubmitName = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canMoveNext) {
      return;
    }

    setStep("details");
  };

  const onBackToNameStep = () => {
    if (isCreating || hasCreatedRecordDefinition) {
      return;
    }

    setStep("name");
  };

  const onCreateRecordDefinition = async () => {
    if (!canCreateRecordDefinition) {
      return;
    }

    setIsCreating(true);
    setCreateLoadingModalOpen(true);

    try {
      await waitForCreateRecordDefinitionModalLoadingDelay();
      setHasCreatedRecordDefinition(true);
      onClose();
    } finally {
      setIsCreating(false);
      setCreateLoadingModalOpen(false);
    }
  };

  return (
    <div className="relative h-full overflow-hidden bg-white">
      <button
        aria-label={t("common.close")}
        className="absolute right-4 top-4 z-10 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#64748B] transition hover:bg-[#E4E2DC] hover:text-[#111827] active:bg-[#D3D1CB]"
        onClick={onClose}
        type="button"
      >
        <X className="h-4 w-4" strokeWidth={1.8} />
      </button>
      <div className="h-full min-h-0 overflow-y-auto">
        {step === "name" ? (
          <CreateRecordDefinitionNameStep
            canMoveNext={canMoveNext}
            copy={copy}
            recordDefinitionName={recordDefinitionName}
            onNameChange={setRecordDefinitionName}
            onSubmit={onSubmitName}
          />
        ) : (
          <CreateRecordDefinitionDetailsStep
            canCreate={canCreateRecordDefinition}
            copy={copy}
            description={description}
            locale={locale}
            recordDefinitionName={trimmedRecordDefinitionName}
            onBack={onBackToNameStep}
            onCreate={onCreateRecordDefinition}
            onDescriptionChange={setDescription}
          />
        )}
      </div>
      {createLoadingModalOpen ? (
        <CreateRecordDefinitionLoadingDialog
          overlayClassName="absolute z-20"
          title={copy.creatingTitle}
        />
      ) : null}
    </div>
  );
}

// 기능 : 임시 RecordDefinition 생성 모달의 로딩 다이얼로그를 렌더링합니다.
function CreateRecordDefinitionLoadingDialog({
  overlayClassName,
  title,
}: {
  readonly overlayClassName?: string;
  readonly title: string;
}) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-[90] grid place-items-center bg-black/25 px-6",
        overlayClassName,
      )}
    >
      <section
        aria-modal="true"
        className="grid w-full max-w-[360px] justify-items-center rounded-[8px] bg-white px-8 py-9 text-center shadow-[0_18px_50px_rgba(15,23,42,0.18)]"
        role="dialog"
      >
        <span
          aria-hidden="true"
          className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#E4E2DC] border-t-[#4880EE]"
        />
        <h2 className="mt-5 break-keep text-[20px] font-normal leading-[1.3] text-[#050505]">
          {title}
        </h2>
      </section>
    </div>
  );
}

// 기능 : RecordDefinition 생성 로딩 모달을 최소 표시 시간만큼 유지합니다.
function waitForCreateRecordDefinitionModalLoadingDelay() {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, CREATE_RECORD_DEFINITION_MODAL_LOADING_CLOSE_DELAY_MS);
  });
}

// 기능 : 새 RecordDefinition 이름 입력 단계를 렌더링합니다.
function CreateRecordDefinitionNameStep({
  canMoveNext,
  copy,
  recordDefinitionName,
  onNameChange,
  onSubmit,
}: {
  readonly canMoveNext: boolean;
  readonly copy: CreateRecordDefinitionModalCopy;
  readonly recordDefinitionName: string;
  readonly onNameChange: (value: string) => void;
  readonly onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="flex min-h-full items-center bg-white px-8 py-10 md:px-12">
      <form
        className="mx-auto min-w-0 w-full max-w-[508px]"
        onSubmit={onSubmit}
      >
        <h1 className="break-keep text-[20px] font-normal leading-[1.2] tracking-normal text-[#050505]">
          {copy.nameTitle}
        </h1>

        <label className="mt-8 grid gap-2 text-[13px] font-normal text-[#4B5563]">
          {copy.nameInputLabel}
          <input
            autoFocus
            autoComplete="off"
            className="h-10 rounded-[6px] border border-[#dededa] bg-transparent px-3 text-[15px] font-normal text-[#111111] outline-none transition-colors placeholder:text-[#aaa9a3] focus:border-[#dededa] [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_white] [&:-webkit-autofill]:[-webkit-text-fill-color:#111111]"
            maxLength={80}
            name="recordDefinitionName"
            placeholder={copy.namePlaceholder}
            type="text"
            value={recordDefinitionName}
            onChange={(event) => onNameChange(event.target.value)}
          />
        </label>

        <button
          className={cn(
            "mt-14 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[6px] bg-[#4880EE] px-5 text-[15px] font-normal text-white transition-colors",
            canMoveNext
              ? "hover:bg-[#336FE0] active:bg-[#2B63CB]"
              : "cursor-not-allowed opacity-45 hover:bg-[#4880EE]",
          )}
          disabled={!canMoveNext}
          type="submit"
        >
          {copy.next}
        </button>
      </form>
    </section>
  );
}

// 기능 : RecordDefinition 생성 모달의 설명 입력 단계를 렌더링합니다.
function CreateRecordDefinitionDetailsStep({
  canCreate,
  copy,
  description,
  locale,
  recordDefinitionName,
  onBack,
  onCreate,
  onDescriptionChange,
}: {
  readonly canCreate: boolean;
  readonly copy: CreateRecordDefinitionModalCopy;
  readonly description: string;
  readonly locale: AppLocale;
  readonly recordDefinitionName: string;
  readonly onBack: () => void;
  readonly onCreate: () => Promise<void>;
  readonly onDescriptionChange: (value: string) => void;
}) {
  return (
    <section className="flex min-h-full items-center bg-white px-8 py-10 md:px-12">
      <button
        className="absolute left-4 top-4 z-10 inline-flex h-8 items-center gap-1.5 rounded-[6px] px-2 text-[14px] font-medium text-[#4B5563] transition hover:bg-[#E4E2DC] hover:text-[#111827] active:bg-[#D3D1CB] active:text-[#111827]"
        type="button"
        onClick={onBack}
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        {copy.back}
      </button>
      <div className="mx-auto min-w-0 w-full max-w-[508px]">
        <h1 className="break-keep text-[20px] font-normal leading-[1.2] tracking-normal text-[#050505]">
          <span className="text-[#4880EE]">{recordDefinitionName}</span>
          {locale === "ko-KR" ? "의 " : " "}
          {copy.detailsTitle}
        </h1>

        <div className="mt-8 grid gap-2 text-[13px] font-normal text-[#111111]">
          <span
            className="text-[#9CA3AF]"
            id="recordDefinitionDescriptionLabel"
          >
            {copy.descriptionInputLabel}
          </span>
          <input
            aria-labelledby="recordDefinitionDescriptionLabel"
            autoComplete="off"
            className="h-10 min-w-0 rounded-[6px] border border-[#dededa] bg-transparent px-3 text-[15px] font-normal text-[#111111] outline-none transition-colors placeholder:text-[#aaa9a3] focus:border-[#dededa] [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_white] [&:-webkit-autofill]:[-webkit-text-fill-color:#111111]"
            maxLength={CREATE_RECORD_DEFINITION_DESCRIPTION_MAX_LENGTH}
            name="recordDefinitionDescription"
            placeholder={copy.descriptionPlaceholder}
            type="text"
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
          />
        </div>

        <button
          className={cn(
            "mt-14 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[6px] bg-[#4880EE] px-5 text-[15px] font-normal text-white transition-colors",
            canCreate
              ? "hover:bg-[#336FE0] active:bg-[#2B63CB]"
              : "cursor-not-allowed opacity-45 hover:bg-[#4880EE]",
          )}
          disabled={!canCreate}
          type="button"
          onClick={() => void onCreate()}
        >
          {copy.createButtonLabel}
        </button>
      </div>
    </section>
  );
}

// 기능 : 필요한 정보 추가 버튼에서 여는 임시 모달 shell입니다.
function AddAttributeDefinitionModal({
  children,
  onClose,
  open,
}: {
  readonly children: ReactNode;
  readonly onClose: () => void;
  readonly open: boolean;
}) {
  const [shouldRender, setShouldRender] = useState(open);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let openTimerId: number | null = null;
    let closeTimerId: number | null = null;

    if (open) {
      setShouldRender(true);
      setIsVisible(false);
      openTimerId = window.setTimeout(
        () => setIsVisible(true),
        ADD_ATTRIBUTE_DEFINITION_MODAL_OPEN_DELAY_MS,
      );
    } else {
      setIsVisible(false);
      closeTimerId = window.setTimeout(
        () => setShouldRender(false),
        ADD_ATTRIBUTE_DEFINITION_MODAL_TRANSITION_MS,
      );
    }

    return () => {
      if (openTimerId !== null) {
        window.clearTimeout(openTimerId);
      }

      if (closeTimerId !== null) {
        window.clearTimeout(closeTimerId);
      }
    };
  }, [open]);

  useEffect(() => {
    if (!shouldRender) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, shouldRender]);

  const onBackdropMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[70] flex items-center justify-center bg-black/35 px-4 py-6 transition-opacity duration-300 ease-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      data-error-report-capture-ignore="true"
      onMouseDown={onBackdropMouseDown}
    >
      <section
        aria-modal="true"
        className={`h-[min(72vh,560px)] w-full max-w-[520px] origin-center overflow-hidden rounded-xl bg-white shadow-2xl transition-all duration-300 ease-out ${
          isVisible
            ? "translate-y-0 scale-100 opacity-100"
            : "-translate-y-3 scale-[0.97] opacity-0"
        }`}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        {children}
      </section>
    </div>
  );
}

// 기능 : AttributeDefinition 생성 모달의 이름, 타입, 설명 입력 흐름을 렌더링합니다.
function AddAttributeDefinitionCreateModalContent({
  objectDefinitionId,
  onClose,
  onCreated,
  workspaceId,
}: {
  readonly objectDefinitionId: string | null;
  readonly onClose: () => void;
  readonly onCreated?: (
    response: CreateWorkspaceObjectAttributeDefinitionResponse,
  ) => Promise<void> | void;
  readonly workspaceId: string | null;
}) {
  const { locale, t } = useAppI18n();
  const copy = addAttributeDefinitionCreateModalCopyByLocale[locale];
  const [attributeDefinitionName, setAttributeDefinitionName] = useState("");
  const [step, setStep] = useState<AddAttributeDefinitionCreateStep>("name");
  const [selectedAttributeType, setSelectedAttributeType] =
    useState<AttributeDefinitionTypeKey | null>(null);
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [hasCreatedAttributeDefinition, setHasCreatedAttributeDefinition] =
    useState(false);
  const [createLoadingModalOpen, setCreateLoadingModalOpen] = useState(false);
  const [createErrorMessage, setCreateErrorMessage] = useState<string | null>(
    null,
  );

  const trimmedAttributeDefinitionName = attributeDefinitionName.trim();
  const canMoveNext = trimmedAttributeDefinitionName.length > 0;
  const canCreateAttributeDefinition =
    Boolean(workspaceId && objectDefinitionId) &&
    canMoveNext &&
    selectedAttributeType !== null &&
    !isCreating &&
    !hasCreatedAttributeDefinition;

  // 기능 : 이름 입력 제출 시 AttributeDefinition 타입 선택 단계로 이동합니다.
  const onSubmitName = (event: FormEvent<HTMLFormElement>) => {
    // 1. 브라우저 기본 제출 동작을 막는다.
    event.preventDefault();

    // 2. 이름이 비어 있으면 다음 단계로 넘어가지 않는다.
    if (!canMoveNext) {
      return;
    }

    // 3. 입력한 이름을 유지한 채 타입 선택 단계로 이동한다.
    setStep("type");
  };

  // 기능 : 타입 선택 단계에서 이름 입력 단계로 돌아갑니다.
  const onBackToNameStep = () => {
    if (isCreating || hasCreatedAttributeDefinition) {
      return;
    }

    // 1. 사용자가 입력한 값을 유지한 채 이름 입력 단계로 돌아간다.
    setStep("name");
  };

  // 기능 : 선택한 AttributeDefinition 타입을 저장하고 설명 입력 단계로 이동합니다.
  const onSelectAttributeType = (type: AttributeDefinitionTypeKey) => {
    if (isCreating || hasCreatedAttributeDefinition) {
      return;
    }

    // 1. 선택한 타입을 request에 사용할 값으로 저장한다.
    setSelectedAttributeType(type);
    // 2. 선택 직후 설명 입력 단계로 이동한다.
    setStep("details");
  };

  // 기능 : 설명 입력 단계에서 타입 선택 단계로 돌아갑니다.
  const onBackToTypeStep = () => {
    if (isCreating || hasCreatedAttributeDefinition) {
      return;
    }

    // 1. 선택한 타입과 입력값을 유지한 채 타입 선택 단계로 돌아간다.
    setStep("type");
  };

  // 기능 : 입력한 AttributeDefinition 값으로 Backend 생성 API를 호출합니다.
  const onCreateAttributeDefinition = async () => {
    // 1. 생성에 필요한 route 값과 입력값이 준비되지 않았으면 요청하지 않는다.
    if (
      !workspaceId ||
      !objectDefinitionId ||
      !selectedAttributeType ||
      !canMoveNext ||
      isCreating ||
      hasCreatedAttributeDefinition
    ) {
      return;
    }

    // 2. 선택한 타입에 대응하는 header row icon 값을 포함해 생성 요청을 시작한다.
    setCreateErrorMessage(null);
    setIsCreating(true);
    setCreateLoadingModalOpen(true);

    try {
      const [response] = await Promise.all([
        createWorkspaceObjectAttributeDefinition({
          attributeDefinitionName: trimmedAttributeDefinitionName,
          attributeType: selectedAttributeType,
          description: description.length > 0 ? description : undefined,
          icon: createLucideIconValue(
            ATTRIBUTE_DEFINITION_ICON_BY_TYPE[selectedAttributeType],
          ),
          objectDefinitionId,
          workspaceId,
        }),
        waitForAddAttributeDefinitionModalLoadingDelay(),
      ]);
      // 3. 생성 성공 후 header row 목록 query 갱신을 실행하고 모달을 닫는다.
      setHasCreatedAttributeDefinition(true);
      await onCreated?.(response);
      onClose();
    } catch (error) {
      // 4. 생성 실패 시 로딩을 닫고 API 에러 메시지를 표시한다.
      setCreateLoadingModalOpen(false);
      setCreateErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="relative h-full overflow-hidden bg-white">
      <button
        aria-label={t("common.close")}
        className="absolute right-4 top-4 z-10 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#64748B] transition hover:bg-[#E4E2DC] hover:text-[#111827] active:bg-[#D3D1CB]"
        onClick={onClose}
        type="button"
      >
        <X className="h-4 w-4" strokeWidth={1.8} />
      </button>
      <div className="h-full min-h-0 overflow-y-auto">
        {step === "name" ? (
          <AddAttributeDefinitionNameStep
            canMoveNext={canMoveNext}
            copy={copy}
            attributeDefinitionName={attributeDefinitionName}
            onNameChange={setAttributeDefinitionName}
            onSubmit={onSubmitName}
          />
        ) : step === "type" ? (
          <AddAttributeDefinitionTypeStep
            copy={copy}
            isSelectionLocked={isCreating || hasCreatedAttributeDefinition}
            locale={locale}
            attributeDefinitionName={trimmedAttributeDefinitionName}
            selectedAttributeType={selectedAttributeType}
            onBack={onBackToNameStep}
            onSelectType={onSelectAttributeType}
          />
        ) : (
          <AddAttributeDefinitionDetailsStep
            canCreate={canCreateAttributeDefinition}
            copy={copy}
            createErrorMessage={createErrorMessage}
            description={description}
            locale={locale}
            attributeDefinitionName={trimmedAttributeDefinitionName}
            onBack={onBackToTypeStep}
            onCreate={onCreateAttributeDefinition}
            onDescriptionChange={setDescription}
          />
        )}
      </div>
      {createLoadingModalOpen ? (
        <AddAttributeDefinitionLoadingDialog
          overlayClassName="absolute z-20"
          title={copy.creatingTitle}
        />
      ) : null}
    </div>
  );
}

// 기능 : 임시 필요한 정보 추가 모달의 로딩 다이얼로그를 렌더링합니다.
function AddAttributeDefinitionLoadingDialog({
  overlayClassName,
  title,
}: {
  readonly overlayClassName?: string;
  readonly title: string;
}) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-[90] grid place-items-center bg-black/25 px-6",
        overlayClassName,
      )}
    >
      <section
        aria-modal="true"
        className="grid w-full max-w-[360px] justify-items-center rounded-[8px] bg-white px-8 py-9 text-center shadow-[0_18px_50px_rgba(15,23,42,0.18)]"
        role="dialog"
      >
        <span
          aria-hidden="true"
          className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#E4E2DC] border-t-[#4880EE]"
        />
        <h2 className="mt-5 break-keep text-[20px] font-normal leading-[1.3] text-[#050505]">
          {title}
        </h2>
      </section>
    </div>
  );
}

// 기능 : AttributeDefinition 생성 모달의 최소 로딩 시간을 유지합니다.
function waitForAddAttributeDefinitionModalLoadingDelay() {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ADD_ATTRIBUTE_DEFINITION_MODAL_LOADING_CLOSE_DELAY_MS);
  });
}

// 기능 : AttributeDefinition 생성 모달의 이름 입력 단계를 렌더링합니다.
function AddAttributeDefinitionNameStep({
  canMoveNext,
  copy,
  attributeDefinitionName,
  onNameChange,
  onSubmit,
}: {
  readonly canMoveNext: boolean;
  readonly copy: AddAttributeDefinitionCreateModalCopy;
  readonly attributeDefinitionName: string;
  readonly onNameChange: (value: string) => void;
  readonly onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="flex min-h-full items-center bg-white px-8 py-10 md:px-12">
      <form
        className="mx-auto min-w-0 w-full max-w-[508px]"
        onSubmit={onSubmit}
      >
        <h1 className="break-keep text-[20px] font-normal leading-[1.2] tracking-normal text-[#050505]">
          {copy.nameTitle}
        </h1>

        <label className="mt-8 grid gap-2 text-[13px] font-normal text-[#4B5563]">
          {copy.nameInputLabel}
          <input
            autoFocus
            autoComplete="off"
            className="h-10 rounded-[6px] border border-[#dededa] bg-transparent px-3 text-[15px] font-normal text-[#111111] outline-none transition-colors placeholder:text-[#aaa9a3] focus:border-[#dededa] [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_white] [&:-webkit-autofill]:[-webkit-text-fill-color:#111111]"
            maxLength={80}
            name="attributeDefinitionName"
            placeholder={copy.namePlaceholder}
            type="text"
            value={attributeDefinitionName}
            onChange={(event) => onNameChange(event.target.value)}
          />
        </label>

        <button
          className={cn(
            "mt-14 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[6px] bg-[#4880EE] px-5 text-[15px] font-normal text-white transition-colors",
            canMoveNext
              ? "hover:bg-[#336FE0] active:bg-[#2B63CB]"
              : "cursor-not-allowed opacity-45 hover:bg-[#4880EE]",
          )}
          disabled={!canMoveNext}
          type="submit"
        >
          {copy.next}
        </button>
      </form>
    </section>
  );
}

// 기능 : AttributeDefinition 타입을 아이콘과 텍스트가 있는 선택 버튼으로 렌더링합니다.
function AddAttributeDefinitionTypeStep({
  copy,
  isSelectionLocked,
  locale,
  attributeDefinitionName,
  selectedAttributeType,
  onBack,
  onSelectType,
}: {
  readonly copy: AddAttributeDefinitionCreateModalCopy;
  readonly isSelectionLocked: boolean;
  readonly locale: AppLocale;
  readonly attributeDefinitionName: string;
  readonly selectedAttributeType: AttributeDefinitionTypeKey | null;
  readonly onBack: () => void;
  readonly onSelectType: (type: AttributeDefinitionTypeKey) => void;
}) {
  return (
    <section className="flex min-h-full items-center bg-white px-8 py-10 md:px-12">
      <button
        className={cn(
          "absolute left-4 top-4 z-10 inline-flex h-8 items-center gap-1.5 rounded-[6px] px-2 text-[14px] font-medium text-[#4B5563] transition hover:bg-[#E4E2DC] hover:text-[#111827] active:bg-[#D3D1CB] active:text-[#111827]",
          isSelectionLocked ? "cursor-not-allowed opacity-55" : "",
        )}
        disabled={isSelectionLocked}
        type="button"
        onClick={onBack}
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        {copy.back}
      </button>
      <div className="mx-auto min-w-0 w-full max-w-[508px]">
        <h1 className="break-keep text-[20px] font-normal leading-[1.2] tracking-normal text-[#050505]">
          <span className="text-[#4880EE]">{attributeDefinitionName}</span>
          {locale === "ko-KR" ? "의 " : " "}
          {copy.typeTitle}
        </h1>

        <div className="mt-8 grid gap-6">
          {copy.typeOptionGroups.map((group) => (
            <section className="grid gap-3" key={group.title}>
              <h2 className="text-[14px] font-medium leading-none text-[#6B7280]">
                {group.title}
              </h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {group.options.map(({ iconKind, key, label }) => {
                  const isSelected = selectedAttributeType === key;
                  const TypeIcon = getAttributeDefinitionTypeIcon(iconKind);

                  return (
                    <button
                      aria-pressed={isSelected}
                      className={cn(
                        "group relative flex h-11 w-full items-center gap-2 rounded-[6px] border bg-white px-3 text-left transition-[background-color,border-color,box-shadow] duration-150 ease-out hover:border-[#D8D5D0] hover:bg-[#E4E2DC] active:border-[#C9C6BF] active:bg-[#D3D1CB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4880EE]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                        isSelected
                          ? "border-[#D8D5D0] bg-[#E4E2DC]"
                          : "border-[#E7E5E1]",
                        isSelectionLocked
                          ? "cursor-not-allowed opacity-70"
                          : "",
                      )}
                      disabled={isSelectionLocked}
                      key={key}
                      type="button"
                      onClick={() => onSelectType(key)}
                    >
                      <span className="grid h-5 w-5 shrink-0 place-items-center">
                        <TypeIcon
                          aria-hidden="true"
                          className={cn(
                            "h-4 w-4 text-[#6B7280] transition-colors",
                            isSelected
                              ? "text-[#374151]"
                              : "group-hover:text-[#374151]",
                          )}
                          strokeWidth={2}
                        />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[14px] font-medium leading-5 text-[#111111]">
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}

// 기능 : AttributeDefinition 생성 모달의 설명 입력 단계를 렌더링합니다.
function AddAttributeDefinitionDetailsStep({
  canCreate,
  copy,
  createErrorMessage,
  description,
  locale,
  attributeDefinitionName,
  onBack,
  onCreate,
  onDescriptionChange,
}: {
  readonly canCreate: boolean;
  readonly copy: AddAttributeDefinitionCreateModalCopy;
  readonly createErrorMessage: string | null;
  readonly description: string;
  readonly locale: AppLocale;
  readonly attributeDefinitionName: string;
  readonly onBack: () => void;
  readonly onCreate: () => Promise<void>;
  readonly onDescriptionChange: (value: string) => void;
}) {
  return (
    <section className="flex min-h-full items-center bg-white px-8 py-10 md:px-12">
      <button
        className="absolute left-4 top-4 z-10 inline-flex h-8 items-center gap-1.5 rounded-[6px] px-2 text-[14px] font-medium text-[#4B5563] transition hover:bg-[#E4E2DC] hover:text-[#111827] active:bg-[#D3D1CB] active:text-[#111827]"
        type="button"
        onClick={onBack}
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        {copy.back}
      </button>
      <div className="mx-auto min-w-0 w-full max-w-[508px]">
        <h1 className="break-keep text-[20px] font-normal leading-[1.2] tracking-normal text-[#050505]">
          <span className="text-[#4880EE]">{attributeDefinitionName}</span>
          {locale === "ko-KR" ? "의 " : " "}
          {copy.detailsTitle}
        </h1>
        {createErrorMessage ? (
          <p
            className="mt-4 rounded-[6px] border border-[#F8D7DA] bg-[#FFF5F5] px-3 py-2 text-[13px] leading-5 text-[#B42318]"
            role="alert"
          >
            {createErrorMessage}
          </p>
        ) : null}

        <div className="mt-8 grid gap-2 text-[13px] font-normal text-[#111111]">
          <span
            className="text-[#9CA3AF]"
            id="attributeDefinitionDescriptionLabel"
          >
            {copy.descriptionInputLabel}
          </span>
          <input
            aria-labelledby="attributeDefinitionDescriptionLabel"
            autoComplete="off"
            className="h-10 min-w-0 rounded-[6px] border border-[#dededa] bg-transparent px-3 text-[15px] font-normal text-[#111111] outline-none transition-colors placeholder:text-[#aaa9a3] focus:border-[#dededa] [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_white] [&:-webkit-autofill]:[-webkit-text-fill-color:#111111]"
            maxLength={ADD_ATTRIBUTE_DEFINITION_DESCRIPTION_MAX_LENGTH}
            name="attributeDefinitionDescription"
            placeholder={copy.descriptionPlaceholder}
            type="text"
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
          />
        </div>

        <button
          className={cn(
            "mt-14 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[6px] bg-[#4880EE] px-5 text-[15px] font-normal text-white transition-colors",
            canCreate
              ? "hover:bg-[#336FE0] active:bg-[#2B63CB]"
              : "cursor-not-allowed opacity-45 hover:bg-[#4880EE]",
          )}
          disabled={!canCreate}
          type="button"
          onClick={() => void onCreate()}
        >
          {copy.createButtonLabel}
        </button>
      </div>
    </section>
  );
}
