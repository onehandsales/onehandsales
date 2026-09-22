import { ArrowLeft, ArrowRight, Check, Minus, Plus, X } from "lucide-react";
import { type FormEvent, useState } from "react";
import { useAppI18n, type AppLocale } from "@/features/app-i18n";
import { createObjectDefinition } from "@/features/crm-object/api/object-definition-api";
import { getApiErrorMessage } from "@/lib/api-client";
import { cn } from "@/utils/cn";

type ObjectDefinitionCreateStep = "name" | "attributes";

type AttributeColumn = {
  readonly id: string;
  readonly title: string;
};

type ObjectDefinitionCreateModalCopy = {
  readonly addColumnLabel: string;
  readonly attributeInputLabel: (index: number) => string;
  readonly attributePlaceholder: (index: number) => string;
  readonly attributePlaceholderCount: number;
  readonly attributeStepTitle: string;
  readonly back: string;
  readonly createButtonLabel: string;
  readonly nameInputLabel: string;
  readonly namePlaceholder: string;
  readonly nameTitle: string;
  readonly next: string;
  readonly removeColumnLabel: (index: number) => string;
};

const objectDefinitionCreateModalCopyByLocale: Record<
  AppLocale,
  ObjectDefinitionCreateModalCopy
> = {
  "ko-KR": {
    addColumnLabel: "정보 추가",
    attributeInputLabel: (index) => `정보 ${index} 이름`,
    attributePlaceholder: (index) =>
      ["Ex. 회사명", "Ex. 주소"][index] ?? "필요한 정보",
    attributePlaceholderCount: 2,
    attributeStepTitle: " 에 필요한 정보를 작성해 주세요.",
    back: "이전",
    createButtonLabel: "생성하기",
    nameInputLabel: "관리 항목 이름",
    namePlaceholder: "예: 회사",
    nameTitle: "새 관리 항목 이름을 작성해 주세요.",
    next: "다음",
    removeColumnLabel: (index) => `정보 ${index} 삭제`,
  },
  en: {
    addColumnLabel: "Add info",
    attributeInputLabel: (index) => `Info ${index} name`,
    attributePlaceholder: (index) =>
      ["Ex. Name", "Ex. Address"][index] ?? "Info",
    attributePlaceholderCount: 2,
    attributeStepTitle: " needs these details.",
    back: "Back",
    createButtonLabel: "Create",
    nameInputLabel: "Item name",
    namePlaceholder: "Example: Company",
    nameTitle: "Name your new item.",
    next: "Next",
    removeColumnLabel: (index) => `Remove info ${index}`,
  },
};

// 기능 : 새 관리 항목 생성 모달의 이름 입력과 정보 표 단계를 렌더링합니다.
export function CreateObjectDefinitionModalContent({
  onClose,
  workspaceId,
}: {
  readonly onClose: () => void;
  readonly workspaceId: string | null;
}) {
  // 1. 처리 흐름에 필요한 앱 언어와 화면 문구를 준비한다.
  const { locale, t } = useAppI18n();
  const copy = objectDefinitionCreateModalCopyByLocale[locale];
  // 2. 처리 흐름에 필요한 입력값과 버튼 상태를 준비한다.
  const [objectDefinitionName, setObjectDefinitionName] = useState("");
  const [step, setStep] = useState<ObjectDefinitionCreateStep>("name");
  const [isCreating, setIsCreating] = useState(false);
  const [createErrorMessage, setCreateErrorMessage] = useState<string | null>(
    null,
  );
  const [attributeColumns, setAttributeColumns] = useState<AttributeColumn[]>(
    () =>
      Array.from({ length: copy.attributePlaceholderCount }, (_, index) => ({
        id: `initial-${index}`,
        title: "",
      })),
  );
  const canMoveNext = objectDefinitionName.trim().length > 0;
  const hasFilledAttributeColumns = attributeColumns.every(
    (column) => column.title.trim().length > 0,
  );
  const canCreateObjectDefinition =
    Boolean(workspaceId) && hasFilledAttributeColumns && !isCreating;

  // 기능 : 이름 입력을 마친 사용자를 관리 항목 정보 표 단계로 이동시킵니다.
  const onSubmitName = (event: FormEvent<HTMLFormElement>) => {
    // 1. 브라우저 기본 제출 동작을 막는다.
    event.preventDefault();
    // 2. 이름이 비어 있으면 다음 단계로 넘어가지 않는다.
    if (!canMoveNext) {
      return;
    }

    // 3. 관리 항목의 정보 구조를 표 형태로 입력하는 단계로 이동한다.
    setStep("attributes");
  };

  // 기능 : 관리 항목 정보 표 단계에서 이름 입력 단계로 돌아갑니다.
  const onBackToNameStep = () => {
    // 1. 사용자가 입력한 값을 유지한 채 이름 입력 단계로 돌아간다.
    setStep("name");
  };

  // 기능 : 관리 항목 정보 표에 새 정보 칸을 추가합니다.
  const onAddAttributeColumn = () => {
    // 1. 기존 정보 칸 뒤에 빈 이름의 정보 칸을 추가한다.
    setAttributeColumns((currentColumns) => [
      ...currentColumns,
      {
        id: `custom-${currentColumns.length + 1}`,
        title: "",
      },
    ]);
  };

  // 기능 : 입력한 관리 항목 이름과 정보 목록으로 생성 API를 호출합니다.
  const onCreateObjectDefinition = async () => {
    // 1. 생성에 필요한 Workspace와 입력값이 준비되지 않았으면 호출하지 않는다.
    if (!workspaceId || !hasFilledAttributeColumns || isCreating) {
      return;
    }

    // 2. 현재 입력된 관리 항목 이름과 정보 이름 목록으로 Backend 생성 API를 호출한다.
    setCreateErrorMessage(null);
    setIsCreating(true);

    try {
      await createObjectDefinition({
        attributeNames: attributeColumns.map((column) => column.title.trim()),
        objectDefinitionName: objectDefinitionName.trim(),
        workspaceId,
      });
    } catch (error) {
      setCreateErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsCreating(false);
    }
  };

  // 기능 : 관리 항목 정보 표에서 선택한 정보 칸을 삭제합니다.
  const onRemoveAttributeColumn = (columnId: string) => {
    // 1. 최소 하나의 정보 칸은 남겨두고 선택한 정보 칸만 제거한다.
    setAttributeColumns((currentColumns) => {
      if (currentColumns.length <= 1) {
        return currentColumns;
      }

      return currentColumns.filter((column) => column.id !== columnId);
    });
  };

  // 기능 : 관리 항목 정보 표의 정보 이름을 변경합니다.
  const onChangeAttributeColumnTitle = (columnId: string, title: string) => {
    // 1. 사용자가 입력한 정보 이름을 현재 표 상태에 반영한다.
    setAttributeColumns((currentColumns) =>
      currentColumns.map((column) =>
        column.id === columnId ? { ...column, title } : column,
      ),
    );
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
          <ObjectDefinitionNameStep
            canMoveNext={canMoveNext}
            copy={copy}
            objectDefinitionName={objectDefinitionName}
            onNameChange={setObjectDefinitionName}
            onSubmit={onSubmitName}
          />
        ) : (
          <ObjectDefinitionAttributeTableStep
            attributeColumns={attributeColumns}
            canCreate={canCreateObjectDefinition}
            copy={copy}
            createErrorMessage={createErrorMessage}
            objectDefinitionName={objectDefinitionName.trim()}
            onAddColumn={onAddAttributeColumn}
            onBack={onBackToNameStep}
            onCreate={onCreateObjectDefinition}
            onChangeColumnTitle={onChangeAttributeColumnTitle}
            onRemoveColumn={onRemoveAttributeColumn}
          />
        )}
      </div>
    </div>
  );
}

// 기능 : 새 관리 항목 이름 입력 단계를 렌더링합니다.
function ObjectDefinitionNameStep({
  canMoveNext,
  copy,
  objectDefinitionName,
  onNameChange,
  onSubmit,
}: {
  readonly canMoveNext: boolean;
  readonly copy: ObjectDefinitionCreateModalCopy;
  readonly objectDefinitionName: string;
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

        <label className="mt-8 grid gap-2 text-[13px] font-normal text-[#111111]">
          {copy.nameInputLabel}
          <input
            autoFocus
            autoComplete="off"
            className="h-10 rounded-[6px] border border-[#dededa] bg-transparent px-3 text-[15px] font-normal text-[#111111] outline-none transition-colors placeholder:text-[#aaa9a3] focus:border-[#dededa] [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_white] [&:-webkit-autofill]:[-webkit-text-fill-color:#111111]"
            maxLength={80}
            name="objectDefinitionName"
            placeholder={copy.namePlaceholder}
            type="text"
            value={objectDefinitionName}
            onChange={(event) => onNameChange(event.target.value)}
          />
        </label>

        <button
          className={cn(
            "mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[6px] bg-[#4880EE] px-5 text-[15px] font-normal text-white transition-colors sm:mt-14",
            canMoveNext
              ? "hover:bg-[#336FE0] active:bg-[#2B63CB]"
              : "cursor-not-allowed opacity-45 hover:bg-[#4880EE]",
          )}
          disabled={!canMoveNext}
          type="submit"
        >
          {copy.next}
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </form>
    </section>
  );
}

// 기능 : 새 관리 항목의 정보 구조를 표 형태로 입력하는 단계를 렌더링합니다.
function ObjectDefinitionAttributeTableStep({
  attributeColumns,
  canCreate,
  copy,
  createErrorMessage,
  objectDefinitionName,
  onAddColumn,
  onBack,
  onCreate,
  onChangeColumnTitle,
  onRemoveColumn,
}: {
  readonly attributeColumns: readonly AttributeColumn[];
  readonly canCreate: boolean;
  readonly copy: ObjectDefinitionCreateModalCopy;
  readonly createErrorMessage: string | null;
  readonly objectDefinitionName: string;
  readonly onAddColumn: () => void;
  readonly onBack: () => void;
  readonly onCreate: () => Promise<void>;
  readonly onChangeColumnTitle: (columnId: string, title: string) => void;
  readonly onRemoveColumn: (columnId: string) => void;
}) {
  const canRemoveColumn = attributeColumns.length > 1;
  const gridTemplateColumns = `repeat(${attributeColumns.length}, minmax(136px, 1fr))`;

  return (
    <section className="flex min-h-full items-center bg-white px-8 py-10 md:px-12">
      <button
        className="absolute left-4 top-4 z-10 inline-flex h-8 items-center gap-1.5 rounded-[6px] px-2 text-[13px] font-medium text-[#4B5563] transition hover:bg-[#E4E2DC] hover:text-[#111827] active:bg-[#D3D1CB]"
        type="button"
        onClick={onBack}
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        {copy.back}
      </button>
      <div className="mx-auto min-w-0 w-full max-w-[508px]">
        <h1 className="break-keep text-[20px] font-normal leading-[1.2] tracking-normal text-[#050505]">
          <span className="text-[#9CA3AF]">{objectDefinitionName}</span>
          {copy.attributeStepTitle}
        </h1>
        {createErrorMessage ? (
          <p
            className="mt-4 rounded-[6px] border border-[#F8D7DA] bg-[#FFF5F5] px-3 py-2 text-[13px] leading-5 text-[#B42318]"
            role="alert"
          >
            {createErrorMessage}
          </p>
        ) : null}

        <div className="mt-8 flex min-w-0 items-stretch gap-4">
          <div className="relative min-w-0 flex-1">
            <div className="overflow-hidden rounded-[4px] border border-[#D8D5D0] bg-white">
              <div className="overflow-x-auto">
                <div
                  className="grid min-w-full"
                  style={{ gridTemplateColumns }}
                >
                  {attributeColumns.map((column, index) => (
                    <div
                      className="relative h-11 border-r border-[#D8D5D0] bg-[#F5F4F1] last:border-r-0"
                      key={`header-${column.id}`}
                    >
                      <button
                        aria-label={copy.removeColumnLabel(index + 1)}
                        className={cn(
                          "absolute left-1 top-1 grid h-4 w-4 place-items-center rounded-full border border-[#F1AFAF] bg-[#F8D2D2] text-[#B42318] transition-colors",
                          canRemoveColumn
                            ? "hover:bg-[#F3B8B8] active:bg-[#EEA2A2]"
                            : "cursor-not-allowed opacity-45",
                        )}
                        disabled={!canRemoveColumn}
                        type="button"
                        onClick={() => onRemoveColumn(column.id)}
                      >
                        <Minus className="h-3 w-3" strokeWidth={2.2} />
                      </button>
                      <input
                        aria-label={copy.attributeInputLabel(index + 1)}
                        className="h-full w-full bg-transparent pl-7 pr-3 text-[14px] font-medium text-[#111111] outline-none transition placeholder:text-[#B8B6B0] focus:bg-white"
                        maxLength={40}
                        placeholder={copy.attributePlaceholder(index)}
                        type="text"
                        value={column.title}
                        onChange={(event) =>
                          onChangeColumnTitle(column.id, event.target.value)
                        }
                      />
                    </div>
                  ))}
                  {attributeColumns.map((column) => (
                    <div
                      aria-hidden="true"
                      className="h-11 border-r border-t border-[#D8D5D0] bg-white last:border-r-0"
                      key={`sample-${column.id}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button
            aria-label={copy.addColumnLabel}
            className="grid w-12 shrink-0 place-items-center rounded-[8px] bg-transparent text-[#4880EE] transition-colors hover:bg-[#E4E2DC] hover:text-[#336FE0] active:bg-[#D3D1CB] active:text-[#2B63CB]"
            type="button"
            onClick={onAddColumn}
          >
            <Plus className="h-5 w-5" strokeWidth={2.2} />
          </button>
        </div>

        <button
          className={cn(
            "mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[6px] bg-[#4880EE] px-5 text-[15px] font-normal text-white transition-colors",
            canCreate
              ? "hover:bg-[#336FE0] active:bg-[#2B63CB]"
              : "cursor-not-allowed opacity-45 hover:bg-[#4880EE]",
          )}
          disabled={!canCreate}
          type="button"
          onClick={() => void onCreate()}
        >
          {copy.createButtonLabel}
          <Check className="h-4 w-4" strokeWidth={2.1} />
        </button>
      </div>
    </section>
  );
}
