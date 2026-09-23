import { ArrowLeft, X } from "lucide-react";
import { type FormEvent, useState } from "react";
import { useAppI18n, type AppLocale } from "@/features/app-i18n";
import { createObjectDefinition } from "@/features/crm-object/api/object-definition-api";
import {
  DEFAULT_OBJECT_DEFINITION_ICON,
  ObjectDefinitionIconPicker,
} from "@/features/crm-object/components/object-definition-icon-picker";
import { getApiErrorMessage } from "@/lib/api-client";
import { cn } from "@/utils/cn";

type ObjectDefinitionCreateStep = "name" | "details";

type ObjectDefinitionCreateModalCopy = {
  readonly back: string;
  readonly createButtonLabel: string;
  readonly descriptionInputLabel: string;
  readonly descriptionPlaceholder: string;
  readonly detailsTitle: string;
  readonly emojiSearchClearButtonLabel: string;
  readonly emojiSearchPlaceholder: string;
  readonly emojiTabLabel: string;
  readonly iconInputLabel: string;
  readonly iconNoResultsLabel: string;
  readonly iconSearchPlaceholder: string;
  readonly iconTabLabel: string;
  readonly nameInputLabel: string;
  readonly namePlaceholder: string;
  readonly nameTitle: string;
  readonly next: string;
};

const DESCRIPTION_MAX_LENGTH = 300;

const objectDefinitionCreateModalCopyByLocale: Record<
  AppLocale,
  ObjectDefinitionCreateModalCopy
> = {
  "ko-KR": {
    back: "이전",
    createButtonLabel: "생성",
    descriptionInputLabel: "관리 항목 설명 (선택)",
    descriptionPlaceholder: "예: 거래처와 잠재 고객 회사를 관리해요.",
    detailsTitle: "아이콘과 설명을 정해 주세요.",
    emojiSearchClearButtonLabel: "검색어 지우기",
    emojiSearchPlaceholder: "이모지 검색",
    emojiTabLabel: "이모지",
    iconInputLabel: "아이콘 선택하기",
    iconNoResultsLabel: "검색 결과가 없어요.",
    iconSearchPlaceholder: "아이콘 검색",
    iconTabLabel: "아이콘",
    nameInputLabel: "관리 항목 이름",
    namePlaceholder: "예: 회사",
    nameTitle: "새 관리 항목 이름을 작성해 주세요.",
    next: "다음",
  },
  en: {
    back: "Back",
    createButtonLabel: "Create",
    descriptionInputLabel: "Description (optional)",
    descriptionPlaceholder: "Example: Manage accounts and target companies.",
    detailsTitle: "Choose an icon and description.",
    emojiSearchClearButtonLabel: "Clear search",
    emojiSearchPlaceholder: "Search emojis",
    emojiTabLabel: "Emoji",
    iconInputLabel: "Choose icon",
    iconNoResultsLabel: "No icons found.",
    iconSearchPlaceholder: "Search icons",
    iconTabLabel: "Icon",
    nameInputLabel: "Item name",
    namePlaceholder: "Example: Company",
    nameTitle: "Name your new item.",
    next: "Next",
  },
};

// 기능 : 새 관리 항목 생성 모달의 이름 입력과 세부 정보 입력 단계를 렌더링합니다.
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
  const [selectedIcon, setSelectedIcon] = useState(
    DEFAULT_OBJECT_DEFINITION_ICON,
  );
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createErrorMessage, setCreateErrorMessage] = useState<string | null>(
    null,
  );

  const trimmedObjectDefinitionName = objectDefinitionName.trim();
  const trimmedDescription = description.trim();
  const canMoveNext = trimmedObjectDefinitionName.length > 0;
  const canCreateObjectDefinition =
    Boolean(workspaceId) && canMoveNext && !isCreating;

  // 기능 : 이름 입력을 마친 사용자를 관리 항목 세부 정보 단계로 이동시킵니다.
  const onSubmitName = (event: FormEvent<HTMLFormElement>) => {
    // 1. 브라우저 기본 제출 동작을 막는다.
    event.preventDefault();

    // 2. 이름이 비어 있으면 다음 단계로 넘어가지 않는다.
    if (!canMoveNext) {
      return;
    }

    // 3. 관리 항목의 아이콘과 설명을 입력하는 단계로 이동한다.
    setStep("details");
  };

  // 기능 : 관리 항목 세부 정보 단계에서 이름 입력 단계로 돌아갑니다.
  const onBackToNameStep = () => {
    // 1. 사용자가 입력한 값을 유지한 채 이름 입력 단계로 돌아간다.
    setStep("name");
  };

  // 기능 : 입력한 관리 항목 이름과 세부 정보로 생성 API를 호출합니다.
  const onCreateObjectDefinition = async () => {
    // 1. 생성에 필요한 Workspace와 입력값이 준비되지 않았으면 호출하지 않는다.
    if (!workspaceId || !canMoveNext || isCreating) {
      return;
    }

    // 2. 현재 입력된 ObjectDefinition 값으로 Backend 생성 API를 호출한다.
    setCreateErrorMessage(null);
    setIsCreating(true);

    try {
      await createObjectDefinition({
        description: trimmedDescription.length > 0 ? trimmedDescription : null,
        icon: selectedIcon,
        objectDefinitionName: trimmedObjectDefinitionName,
        workspaceId,
      });
    } catch (error) {
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
          <ObjectDefinitionNameStep
            canMoveNext={canMoveNext}
            copy={copy}
            objectDefinitionName={objectDefinitionName}
            onNameChange={setObjectDefinitionName}
            onSubmit={onSubmitName}
          />
        ) : (
          <ObjectDefinitionDetailsStep
            canCreate={canCreateObjectDefinition}
            copy={copy}
            createErrorMessage={createErrorMessage}
            description={description}
            locale={locale}
            objectDefinitionName={trimmedObjectDefinitionName}
            selectedIcon={selectedIcon}
            onBack={onBackToNameStep}
            onCreate={onCreateObjectDefinition}
            onDescriptionChange={setDescription}
            onIconChange={setSelectedIcon}
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

        <label className="mt-8 grid gap-2 text-[13px] font-normal text-[#4B5563]">
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

// 기능 : 새 관리 항목의 아이콘과 설명 입력 단계를 렌더링합니다.
function ObjectDefinitionDetailsStep({
  canCreate,
  copy,
  createErrorMessage,
  description,
  locale,
  objectDefinitionName,
  selectedIcon,
  onBack,
  onCreate,
  onDescriptionChange,
  onIconChange,
}: {
  readonly canCreate: boolean;
  readonly copy: ObjectDefinitionCreateModalCopy;
  readonly createErrorMessage: string | null;
  readonly description: string;
  readonly locale: AppLocale;
  readonly objectDefinitionName: string;
  readonly selectedIcon: string;
  readonly onBack: () => void;
  readonly onCreate: () => Promise<void>;
  readonly onDescriptionChange: (value: string) => void;
  readonly onIconChange: (value: string) => void;
}) {
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
          <span className="text-[#4880EE]">{objectDefinitionName}</span>
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
            id="objectDefinitionDescriptionLabel"
          >
            {copy.descriptionInputLabel}
          </span>
          <div className="flex min-w-0 items-center gap-2">
            <ObjectDefinitionIconPicker
              emojiSearchClearButtonLabel={copy.emojiSearchClearButtonLabel}
              emojiSearchPlaceholder={copy.emojiSearchPlaceholder}
              emojiTabLabel={copy.emojiTabLabel}
              iconNoResultsLabel={copy.iconNoResultsLabel}
              iconSearchPlaceholder={copy.iconSearchPlaceholder}
              iconTabLabel={copy.iconTabLabel}
              label={copy.iconInputLabel}
              locale={locale}
              value={selectedIcon}
              onChange={onIconChange}
            />
            <input
              aria-labelledby="objectDefinitionDescriptionLabel"
              autoComplete="off"
              className="h-10 min-w-0 flex-1 rounded-[6px] border border-[#dededa] bg-transparent px-3 text-[15px] font-normal text-[#111111] outline-none transition-colors placeholder:text-[#aaa9a3] focus:border-[#dededa] [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_white] [&:-webkit-autofill]:[-webkit-text-fill-color:#111111]"
              maxLength={DESCRIPTION_MAX_LENGTH}
              name="objectDefinitionDescription"
              placeholder={copy.descriptionPlaceholder}
              type="text"
              value={description}
              onChange={(event) => onDescriptionChange(event.target.value)}
            />
          </div>
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
