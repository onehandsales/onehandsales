import { Check, Trash2, X } from "lucide-react";
import {
  type InputHTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  AttributeDefinitionValueType,
  WorkspaceObjectRecordAttributeValueListItem,
  WorkspaceObjectRecordAttributeValuePatchValue,
} from "@/features/crm-object";
import {
  getRecordAttributeValueDisplayText,
  type RecordAttributeValueBooleanLabels,
} from "@/features/crm-object/utils/record-attribute-value-display";
import { getApiErrorMessage } from "@/lib/api-client";
import { cn } from "@/utils/cn";

type RecordAttributeValueCellDraft = {
  readonly actorId: string;
  readonly amount: string;
  readonly currencyCode: string;
  readonly displayName: string;
  readonly familyName: string;
  readonly givenName: string;
  readonly interactionOccurredAt: string;
  readonly interactionSummary: string;
  readonly interactionType: string;
  readonly locationRaw: Record<string, unknown>;
  readonly locationText: string;
  readonly recordId: string;
  readonly selectOptionId: string;
  readonly statusOptionId: string;
  readonly text: string;
};

// 역할 : RecordAttributeValueCell 저장 요청에 필요한 cell ID와 value 값을 정의합니다.
export type RecordAttributeValueCellSaveInput = {
  readonly recordAttributeValueDefinitionId: string;
  readonly value: WorkspaceObjectRecordAttributeValuePatchValue;
};

type RecordAttributeValueCellProps = {
  readonly attributeTitle: string;
  readonly attributeType: AttributeDefinitionValueType;
  readonly booleanLabels: RecordAttributeValueBooleanLabels;
  readonly formatDate: (value: string) => string;
  readonly formatDateTime: (value: string) => string;
  readonly isPrimary: boolean;
  readonly onSave: (input: RecordAttributeValueCellSaveInput) => Promise<void>;
  readonly value: WorkspaceObjectRecordAttributeValueListItem | null | undefined;
};

const INLINE_TEXT_ATTRIBUTE_TYPES = new Set<AttributeDefinitionValueType>([
  "Date",
  "Domain",
  "EmailAddress",
  "Number",
  "PhoneNumber",
  "Rating",
  "Text",
  "Timestamp",
]);

const POPOVER_ATTRIBUTE_TYPES = new Set<AttributeDefinitionValueType>([
  "ActorReference",
  "Currency",
  "Interaction",
  "Location",
  "PersonalName",
  "RecordReference",
  "Select",
  "Status",
]);

// 기능 : record table cell 하나의 표시와 inline 편집 UX를 렌더링합니다.
export function RecordAttributeValueCell({
  attributeTitle,
  attributeType,
  booleanLabels,
  formatDate,
  formatDateTime,
  isPrimary,
  onSave,
  value,
}: RecordAttributeValueCellProps) {
  const [isEditing, setEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [draft, setDraft] = useState(() => createDraftFromValue(value));
  const editorRootRef = useRef<HTMLDivElement | null>(null);
  const inlineInputRef = useRef<HTMLInputElement | null>(null);
  const canEdit = Boolean(value?.id);
  const displayText = getRecordAttributeValueDisplayText(
    value,
    booleanLabels,
    {
      formatDate,
      formatDateTime,
    },
  );
  const isInlineTextEditor = INLINE_TEXT_ATTRIBUTE_TYPES.has(attributeType);
  const isPopoverEditor = POPOVER_ATTRIBUTE_TYPES.has(attributeType);
  const isCheckboxEditor = attributeType === "Checkbox";

  const currentDraft = useMemo(() => createDraftFromValue(value), [value]);

  useEffect(() => {
    if (!isEditing) {
      setDraft(currentDraft);
    }
  }, [currentDraft, isEditing]);

  useEffect(() => {
    if (isEditing && isInlineTextEditor) {
      inlineInputRef.current?.focus();
      inlineInputRef.current?.select();
    }
  }, [isEditing, isInlineTextEditor]);

  useEffect(() => {
    if (!isEditing || !isPopoverEditor) {
      return;
    }

    // 기능 : popover 바깥 pointer 입력과 Escape 키로 cell 편집을 닫습니다.
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (
        target instanceof Node &&
        editorRootRef.current?.contains(target)
      ) {
        return;
      }

      setEditing(false);
      setErrorMessage(null);
    };

    // 기능 : popover 편집 취소 키 입력을 처리합니다.
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setEditing(false);
        setErrorMessage(null);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isEditing, isPopoverEditor]);

  // 기능 : cell 편집을 시작합니다.
  function openEditor() {
    if (!canEdit || isSaving) {
      return;
    }

    setDraft(createDraftFromValue(value));
    setErrorMessage(null);
    setEditing(true);
  }

  // 기능 : inline editor 키 입력을 저장 또는 취소로 처리합니다.
  function handleInlineEditorKeyDown(
    event: ReactKeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Enter") {
      event.preventDefault();
      void commitDraft();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setDraft(createDraftFromValue(value));
      setErrorMessage(null);
      setEditing(false);
    }
  }

  // 기능 : 현재 draft 값을 Backend request value 형태로 저장합니다.
  async function commitDraft() {
    if (!value?.id || isSaving) {
      return;
    }

    const nextValue = toPatchValue(attributeType, draft);
    const currentValue = toPatchValue(attributeType, createDraftFromValue(value));

    if (nextValue === null || arePatchValuesEqual(nextValue, currentValue)) {
      setDraft(createDraftFromValue(value));
      setErrorMessage(null);
      setEditing(false);
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    try {
      await onSave({
        recordAttributeValueDefinitionId: value.id,
        value: nextValue,
      });
      setEditing(false);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  // 기능 : 현재 cell 값을 null로 비워 저장합니다.
  async function clearValue() {
    if (!value?.id || isSaving) {
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    try {
      await onSave({
        recordAttributeValueDefinitionId: value.id,
        value: null,
      });
      setDraft(createEmptyDraft());
      setEditing(false);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  // 기능 : Checkbox cell 값을 즉시 반전해 저장합니다.
  async function toggleCheckboxValue() {
    if (!value?.id || isSaving) {
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    try {
      await onSave({
        recordAttributeValueDefinitionId: value.id,
        value: !(value.booleanValue ?? false),
      });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  if (isCheckboxEditor) {
    return (
      <div
        className="relative flex h-full w-full min-w-0 items-center"
        ref={editorRootRef}
      >
        <button
          aria-label={attributeTitle}
          aria-pressed={value?.booleanValue ?? false}
          className={cn(
            "flex h-full w-full min-w-0 items-center gap-2 px-3 text-left text-[#111827] outline-none transition hover:bg-[#F7F6F2] focus-visible:bg-[#F7F6F2] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#4880EE]/45 disabled:cursor-not-allowed disabled:opacity-60",
            isPrimary ? "font-medium" : "font-normal",
          )}
          disabled={!canEdit || isSaving}
          type="button"
          onClick={toggleCheckboxValue}
        >
          <span
            aria-hidden="true"
            className={cn(
              "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
              value?.booleanValue
                ? "border-[#4880EE] bg-[#4880EE] text-white"
                : "border-[#D6D3CD] bg-white text-transparent",
            )}
          >
            <Check className="h-3.5 w-3.5" strokeWidth={2.4} />
          </span>
          <span className="min-w-0 truncate">
            {displayText}
          </span>
        </button>
        {errorMessage ? <CellErrorMessage message={errorMessage} /> : null}
      </div>
    );
  }

  if (isEditing && isInlineTextEditor) {
    return (
      <div
        className="relative flex h-full w-full min-w-0 items-center"
        ref={editorRootRef}
      >
        <input
          aria-label={attributeTitle}
          aria-invalid={Boolean(errorMessage)}
          className={cn(
            "h-full w-full min-w-0 bg-white px-3 text-[14px] text-[#111827] outline-none ring-2 ring-inset ring-[#4880EE]/50 placeholder:text-[#9CA3AF] disabled:cursor-wait disabled:bg-[#FAFAF8]",
            isPrimary ? "font-medium" : "font-normal",
          )}
          disabled={isSaving}
          inputMode={getInlineInputMode(attributeType)}
          max={attributeType === "Rating" ? "5" : undefined}
          min={attributeType === "Rating" ? "0" : undefined}
          placeholder=""
          ref={inlineInputRef}
          step={attributeType === "Rating" ? "1" : undefined}
          type={getInlineInputType(attributeType)}
          value={draft.text}
          onBlur={() => {
            void commitDraft();
          }}
          onChange={(event) =>
            setDraft((currentDraftValue) => ({
              ...currentDraftValue,
              text: event.target.value,
            }))
          }
          onKeyDown={handleInlineEditorKeyDown}
        />
        {errorMessage ? <CellErrorMessage message={errorMessage} /> : null}
      </div>
    );
  }

  return (
    <div
      className="relative flex h-full w-full min-w-0 items-center"
      ref={editorRootRef}
    >
      <button
        aria-label={attributeTitle}
        className={cn(
          "flex h-full w-full min-w-0 items-center px-3 text-left text-[#111827] outline-none transition hover:bg-[#F7F6F2] focus-visible:bg-[#F7F6F2] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#4880EE]/45 disabled:cursor-not-allowed disabled:opacity-60",
          isPrimary ? "font-medium" : "font-normal",
        )}
        disabled={!canEdit || isSaving}
        type="button"
        onClick={openEditor}
      >
        <span className="min-w-0 truncate">
          {displayText}
        </span>
      </button>
      {isEditing && isPopoverEditor ? (
        <CellPopoverEditor
          attributeType={attributeType}
          draft={draft}
          errorMessage={errorMessage}
          isSaving={isSaving}
          onCancel={() => {
            setDraft(createDraftFromValue(value));
            setErrorMessage(null);
            setEditing(false);
          }}
          onChange={setDraft}
          onClear={clearValue}
          onSave={commitDraft}
        />
      ) : null}
      {errorMessage && !isEditing ? (
        <CellErrorMessage message={errorMessage} />
      ) : null}
    </div>
  );
}

type CellPopoverEditorProps = {
  readonly attributeType: AttributeDefinitionValueType;
  readonly draft: RecordAttributeValueCellDraft;
  readonly errorMessage: string | null;
  readonly isSaving: boolean;
  readonly onCancel: () => void;
  readonly onChange: (draft: RecordAttributeValueCellDraft) => void;
  readonly onClear: () => void;
  readonly onSave: () => void;
};

// 기능 : 구조화된 cell 타입을 작은 popover form으로 편집합니다.
function CellPopoverEditor({
  attributeType,
  draft,
  errorMessage,
  isSaving,
  onCancel,
  onChange,
  onClear,
  onSave,
}: CellPopoverEditorProps) {
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
    firstInputRef.current?.select();
  }, []);

  // 기능 : popover 내부 입력 키를 저장 또는 취소로 처리합니다.
  function handlePopoverKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      onSave();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      onCancel();
    }
  }

  return (
    <div
      className="absolute left-1 top-[calc(100%+4px)] z-50 w-[280px] rounded-lg border border-[#E5E1D8] bg-white p-2 text-[#111827] shadow-[0_18px_42px_rgba(15,23,42,0.18)]"
      role="dialog"
      onKeyDown={handlePopoverKeyDown}
    >
      <div className="grid gap-2">
        {renderPopoverFields({
          attributeType,
          draft,
          firstInputRef,
          onChange,
        })}
      </div>
      {errorMessage ? (
        <p className="mt-2 truncate text-[12px] font-medium text-[#DC2626]">
          {errorMessage}
        </p>
      ) : null}
      <div className="mt-2 flex items-center justify-end gap-1">
        <button
          aria-label="비우기"
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[#9CA3AF] transition hover:bg-[#F3F2EF] hover:text-[#6B7280] active:bg-[#E4E2DC] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSaving}
          type="button"
          onClick={onClear}
        >
          <Trash2 className="h-4 w-4" strokeWidth={2} />
        </button>
        <button
          aria-label="닫기"
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[#9CA3AF] transition hover:bg-[#F3F2EF] hover:text-[#6B7280] active:bg-[#E4E2DC] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSaving}
          type="button"
          onClick={onCancel}
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
        <button
          aria-label="저장"
          className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#4880EE] text-white transition hover:bg-[#3B6FDA] active:bg-[#315FC0] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSaving}
          type="button"
          onClick={onSave}
        >
          <Check className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

type RenderPopoverFieldsInput = {
  readonly attributeType: AttributeDefinitionValueType;
  readonly draft: RecordAttributeValueCellDraft;
  readonly firstInputRef: RefObject<HTMLInputElement | null>;
  readonly onChange: (draft: RecordAttributeValueCellDraft) => void;
};

// 기능 : AttributeType에 맞는 popover 입력 필드를 렌더링합니다.
function renderPopoverFields({
  attributeType,
  draft,
  firstInputRef,
  onChange,
}: RenderPopoverFieldsInput) {
  switch (attributeType) {
    case "Select":
      return (
        <CellTextField
          label="selectOptionId"
          inputRef={firstInputRef}
          value={draft.selectOptionId}
          onChange={(selectOptionId) =>
            onChange({
              ...draft,
              selectOptionId,
            })
          }
        />
      );
    case "Status":
      return (
        <CellTextField
          label="statusOptionId"
          inputRef={firstInputRef}
          value={draft.statusOptionId}
          onChange={(statusOptionId) =>
            onChange({
              ...draft,
              statusOptionId,
            })
          }
        />
      );
    case "RecordReference":
      return (
        <CellTextField
          label="targetRecordDefinitionId"
          inputRef={firstInputRef}
          value={draft.recordId}
          onChange={(recordId) =>
            onChange({
              ...draft,
              recordId,
            })
          }
        />
      );
    case "ActorReference":
      return (
        <CellTextField
          label="targetActorId"
          inputRef={firstInputRef}
          value={draft.actorId}
          onChange={(actorId) =>
            onChange({
              ...draft,
              actorId,
            })
          }
        />
      );
    case "Currency":
      return (
        <>
          <CellTextField
            inputMode="decimal"
            inputRef={firstInputRef}
            label="amount"
            value={draft.amount}
            onChange={(amount) =>
              onChange({
                ...draft,
                amount,
              })
            }
          />
          <CellTextField
            label="currencyCode"
            value={draft.currencyCode}
            onChange={(currencyCode) =>
              onChange({
                ...draft,
                currencyCode,
              })
            }
          />
        </>
      );
    case "Location":
      return (
        <CellTextField
          inputRef={firstInputRef}
          label="text"
          value={draft.locationText}
          onChange={(locationText) =>
            onChange({
              ...draft,
              locationText,
            })
          }
        />
      );
    case "PersonalName":
      return (
        <>
          <CellTextField
            inputRef={firstInputRef}
            label="displayName"
            value={draft.displayName}
            onChange={(displayName) =>
              onChange({
                ...draft,
                displayName,
              })
            }
          />
          <CellTextField
            label="familyName"
            value={draft.familyName}
            onChange={(familyName) =>
              onChange({
                ...draft,
                familyName,
              })
            }
          />
          <CellTextField
            label="givenName"
            value={draft.givenName}
            onChange={(givenName) =>
              onChange({
                ...draft,
                givenName,
              })
            }
          />
        </>
      );
    case "Interaction":
      return (
        <>
          <CellTextField
            inputRef={firstInputRef}
            label="type"
            value={draft.interactionType}
            onChange={(interactionType) =>
              onChange({
                ...draft,
                interactionType,
              })
            }
          />
          <CellTextField
            label="summary"
            value={draft.interactionSummary}
            onChange={(interactionSummary) =>
              onChange({
                ...draft,
                interactionSummary,
              })
            }
          />
          <CellTextField
            label="occurredAt"
            type="datetime-local"
            value={draft.interactionOccurredAt}
            onChange={(interactionOccurredAt) =>
              onChange({
                ...draft,
                interactionOccurredAt,
              })
            }
          />
        </>
      );
    default:
      return null;
  }
}

type CellTextFieldProps = {
  readonly inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  readonly inputRef?: RefObject<HTMLInputElement | null>;
  readonly label: string;
  readonly onChange: (value: string) => void;
  readonly type?: "datetime-local" | "text";
  readonly value: string;
};

// 기능 : popover 안에서 사용하는 compact text input을 렌더링합니다.
function CellTextField({
  inputMode,
  inputRef,
  label,
  onChange,
  type = "text",
  value,
}: CellTextFieldProps) {
  return (
    <label className="grid gap-1">
      <span className="text-[12px] font-medium text-[#6B7280]">
        {label}
      </span>
      <input
        className="h-8 min-w-0 rounded-md border border-[#E5E1D8] bg-white px-2 text-[14px] text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#4880EE] focus:ring-2 focus:ring-[#4880EE]/20"
        inputMode={inputMode}
        ref={inputRef}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

// 기능 : cell 저장 오류 메시지를 현재 cell 아래에 표시합니다.
function CellErrorMessage({ message }: { readonly message: string }) {
  return (
    <span className="absolute left-1 top-[calc(100%+4px)] z-50 max-w-[280px] truncate rounded-md border border-[#FECACA] bg-white px-2 py-1 text-[12px] font-medium text-[#DC2626] shadow-[0_10px_26px_rgba(15,23,42,0.12)]">
      {message}
    </span>
  );
}

// 기능 : API 응답의 현재 cell 값을 editor draft 값으로 변환합니다.
function createDraftFromValue(
  value: WorkspaceObjectRecordAttributeValueListItem | null | undefined,
): RecordAttributeValueCellDraft {
  if (!value) {
    return createEmptyDraft();
  }

  const jsonValue = getJsonObject(value.jsonValue);

  return {
    actorId:
      getStringField(jsonValue, "targetActorId") ?? value.targetActorId ?? "",
    amount:
      getStringField(jsonValue, "amount") ??
      value.numberValue ??
      "",
    currencyCode: getStringField(jsonValue, "currencyCode") ?? "KRW",
    displayName:
      getStringField(jsonValue, "displayName") ??
      value.textValue ??
      "",
    familyName: getStringField(jsonValue, "familyName") ?? "",
    givenName: getStringField(jsonValue, "givenName") ?? "",
    interactionOccurredAt: toDateTimeLocalInputValue(
      getStringField(jsonValue, "occurredAt") ?? value.timestampValue ?? "",
    ),
    interactionSummary:
      getStringField(jsonValue, "summary") ??
      value.textValue ??
      "",
    interactionType: getStringField(jsonValue, "type") ?? "",
    locationRaw: getLocationRawValue(jsonValue),
    locationText:
      getStringField(jsonValue, "text") ??
      value.textValue ??
      "",
    recordId:
      getStringField(jsonValue, "targetRecordDefinitionId") ??
      value.targetRecordDefinitionId ??
      "",
    selectOptionId:
      getStringField(jsonValue, "selectOptionId") ??
      value.selectOptionId ??
      "",
    statusOptionId:
      getStringField(jsonValue, "statusOptionId") ??
      value.statusOptionId ??
      "",
    text: getInlineTextDraftValue(value),
  };
}

// 기능 : 비어 있는 editor draft 값을 생성합니다.
function createEmptyDraft(): RecordAttributeValueCellDraft {
  return {
    actorId: "",
    amount: "",
    currencyCode: "KRW",
    displayName: "",
    familyName: "",
    givenName: "",
    interactionOccurredAt: "",
    interactionSummary: "",
    interactionType: "",
    locationRaw: {},
    locationText: "",
    recordId: "",
    selectOptionId: "",
    statusOptionId: "",
    text: "",
  };
}

// 기능 : inline editor에 표시할 현재 문자열 값을 계산합니다.
function getInlineTextDraftValue(
  value: WorkspaceObjectRecordAttributeValueListItem,
) {
  switch (value.attributeType) {
    case "Date":
      return value.dateValue?.slice(0, 10) ?? "";
    case "Number":
    case "Rating":
      return value.numberValue ?? "";
    case "Timestamp":
      return toDateTimeLocalInputValue(value.timestampValue ?? "");
    default:
      return value.textValue ?? "";
  }
}

// 기능 : editor draft 값을 Backend PATCH API의 value 값으로 변환합니다.
function toPatchValue(
  attributeType: AttributeDefinitionValueType,
  draft: RecordAttributeValueCellDraft,
): WorkspaceObjectRecordAttributeValuePatchValue {
  switch (attributeType) {
    case "Date":
    case "Domain":
    case "EmailAddress":
    case "Number":
    case "PhoneNumber":
    case "Rating":
    case "Text":
      return normalizeEmptyString(draft.text);
    case "Timestamp":
      return draft.text.trim().length > 0
        ? dateTimeLocalToIsoString(draft.text)
        : null;
    case "Select":
      return draft.selectOptionId.trim().length > 0
        ? {
            selectOptionId: draft.selectOptionId.trim(),
          }
        : null;
    case "Status":
      return draft.statusOptionId.trim().length > 0
        ? {
            statusOptionId: draft.statusOptionId.trim(),
          }
        : null;
    case "RecordReference":
      return draft.recordId.trim().length > 0
        ? {
            targetRecordDefinitionId: draft.recordId.trim(),
          }
        : null;
    case "ActorReference":
      return draft.actorId.trim().length > 0
        ? {
            targetActorId: draft.actorId.trim(),
          }
        : null;
    case "Currency":
      if (draft.amount.trim().length === 0) {
        return null;
      }

      return {
        amount: draft.amount.trim(),
        currencyCode: draft.currencyCode.trim() || "KRW",
      };
    case "Location":
      return draft.locationText.trim().length > 0
        ? {
            text: draft.locationText.trim(),
            raw: draft.locationRaw,
          }
        : null;
    case "PersonalName":
      return createPersonalNamePatchValue(draft);
    case "Interaction":
      return createInteractionPatchValue(draft);
    case "Checkbox":
      return null;
  }
}

// 기능 : PersonalName draft를 비어 있지 않은 JSON value로 변환합니다.
function createPersonalNamePatchValue(
  draft: RecordAttributeValueCellDraft,
): WorkspaceObjectRecordAttributeValuePatchValue {
  const value: Record<string, unknown> = {};

  if (draft.displayName.trim().length > 0) {
    value.displayName = draft.displayName.trim();
  }

  if (draft.givenName.trim().length > 0) {
    value.givenName = draft.givenName.trim();
  }

  if (draft.familyName.trim().length > 0) {
    value.familyName = draft.familyName.trim();
  }

  return Object.keys(value).length > 0 ? value : null;
}

// 기능 : Interaction draft를 비어 있지 않은 JSON value로 변환합니다.
function createInteractionPatchValue(
  draft: RecordAttributeValueCellDraft,
): WorkspaceObjectRecordAttributeValuePatchValue {
  const value: Record<string, unknown> = {};

  if (draft.interactionType.trim().length > 0) {
    value.type = draft.interactionType.trim();
  }

  if (draft.interactionSummary.trim().length > 0) {
    value.summary = draft.interactionSummary.trim();
  }

  if (draft.interactionOccurredAt.trim().length > 0) {
    value.occurredAt = dateTimeLocalToIsoString(draft.interactionOccurredAt);
  }

  return Object.keys(value).length > 0 ? value : null;
}

// 기능 : 빈 문자열은 null로, 값이 있는 문자열은 원문으로 정규화합니다.
function normalizeEmptyString(value: string) {
  return value.trim().length > 0 ? value : null;
}

// 기능 : 저장 요청을 보내기 전에 draft value가 현재 저장 값과 같은지 비교합니다.
function arePatchValuesEqual(
  left: WorkspaceObjectRecordAttributeValuePatchValue,
  right: WorkspaceObjectRecordAttributeValuePatchValue,
) {
  return JSON.stringify(left) === JSON.stringify(right);
}

// 기능 : AttributeType에 맞는 HTML input type 값을 반환합니다.
function getInlineInputType(attributeType: AttributeDefinitionValueType) {
  switch (attributeType) {
    case "Date":
      return "date";
    case "Timestamp":
      return "datetime-local";
    default:
      return "text";
  }
}

// 기능 : 모바일 키보드에 힌트로 사용할 inputMode 값을 반환합니다.
function getInlineInputMode(attributeType: AttributeDefinitionValueType) {
  switch (attributeType) {
    case "Number":
    case "Rating":
      return "decimal";
    case "EmailAddress":
      return "email";
    case "Domain":
      return "url";
    case "PhoneNumber":
      return "tel";
    default:
      return undefined;
  }
}

// 기능 : JSON object 후보에서 문자열 필드를 안전하게 꺼냅니다.
function getStringField(value: Record<string, unknown> | null, key: string) {
  const fieldValue = value?.[key];

  return typeof fieldValue === "string" ? fieldValue : null;
}

// 기능 : unknown 값이 JSON object 형태인지 확인합니다.
function getJsonObject(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

// 기능 : Location raw 값을 object 형태로 정규화합니다.
function getLocationRawValue(value: Record<string, unknown> | null) {
  const rawValue = value?.["raw"];

  return getJsonObject(rawValue) ?? {};
}

// 기능 : ISO timestamp를 datetime-local input 값으로 변환합니다.
function toDateTimeLocalInputValue(value: string) {
  if (value.length === 0) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

// 기능 : datetime-local input 값을 timezone 정보가 포함된 ISO timestamp로 변환합니다.
function dateTimeLocalToIsoString(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toISOString();
}
