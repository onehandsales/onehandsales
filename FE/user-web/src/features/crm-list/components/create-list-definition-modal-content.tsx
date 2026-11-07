import { ArrowLeft, Columns3, List, Table2, X } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { useAppI18n } from "@/features/app-i18n";
import { useSidebarCrmObjectsQuery } from "@/features/crm-object/hooks/use-sidebar-crm-objects";
import { useWorkspaceObjectAttributeDefinitionsQuery } from "@/features/crm-object/hooks/use-workspace-object-attribute-definitions";
import { IconValuePicker } from "@/components/ui/icon-value-picker";
import { ApiClientError } from "@/lib/api-client";
import { cn } from "@/utils/cn";
import { createListDefinition, type CreateListDefinitionInput, type CreateListDefinitionResponse, type ListInitialViewType } from "../api/list-definition-api";
import { listCreateCopy } from "./list-create-copy";

const inputClass = "h-11 w-full rounded-md border border-[#E4E2DC] bg-white px-3 text-sm outline-none focus:border-[#4880EE] disabled:opacity-50";
const buttonClass = "h-11 w-full rounded-md bg-[#4880EE] px-4 text-sm text-white transition hover:bg-[#336FE0] disabled:cursor-not-allowed disabled:opacity-45";
const layouts = [{ type: "TABLE", Icon: Table2 }, { type: "KANBAN", Icon: Columns3 }, { type: "LIST", Icon: List }] as const;

// 기능 : 기존 생성 모달 패턴으로 업무 목록과 첫 보기 설정을 입력하고 저장합니다.
export function CreateListDefinitionModalContent({ isOpen, workspaceId, userId, onClose, onCreated, onCreateObject }: {
  readonly isOpen: boolean;
  readonly workspaceId: string | null;
  readonly userId: string | null;
  readonly onClose: () => void;
  readonly onCreateObject: () => void;
  readonly onCreated: (result: CreateListDefinitionResponse, shouldNavigate: boolean) => void;
}) {
  const { locale } = useAppI18n();
  const copy = listCreateCopy[locale];
  const [step, setStep] = useState<"name" | "details">("name");
  const [name, setName] = useState("");
  const [objectId, setObjectId] = useState("");
  const [titleId, setTitleId] = useState("");
  const [viewType, setViewType] = useState<ListInitialViewType>("TABLE");
  const [icon, setIcon] = useState("lucide:briefcase");
  const [description, setDescription] = useState("");
  const [statusMode, setStatusMode] = useState<"existing" | "new">("new");
  const [statusId, setStatusId] = useState("");
  const [statusTitle, setStatusTitle] = useState("");
  const [stageText, setStageText] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitting = useRef(false);
  const active = useRef(false);
  const generation = useRef(0);

  // 기능 : 닫기·재열기·계정/업무 공간 변경 이후 응답의 화면 이동을 차단합니다.
  useEffect(() => {
    generation.current += 1;
    active.current = isOpen;
    return () => { active.current = false; };
  }, [isOpen, userId, workspaceId]);

  const objects = useSidebarCrmObjectsQuery({ userId, workspaceId, enabled: isOpen });
  const attributes = useWorkspaceObjectAttributeDefinitionsQuery({ userId, workspaceId, objectDefinitionId: objectId || null, enabled: isOpen && Boolean(objectId) });
  const fields = attributes.data ?? [];
  const resolvedTitleId = fields.some(field => field.id === titleId) ? titleId
    : (fields.find(field => field.type === "Text" || field.type === "PersonalName") ?? fields[0])?.id ?? "";
  const statuses = fields.filter(field => !field.isMultiselect && (field.type === "Status" || field.type === "Select"));
  const resolvedStatusId = statuses.some(field => field.id === statusId) ? statusId : statuses[0]?.id ?? "";
  const stages = stageText.split(/\r?\n/).map(value => value.trim()).filter(Boolean);
  const validStages = stages.length > 0 && stages.length <= 50 && new Set(stages).size === stages.length
    && stages.every(value => Array.from(value).length <= 80) && statusTitle.trim().length > 0 && Array.from(statusTitle.trim()).length <= 80;
  const validSource = Boolean(workspaceId && userId && objects.data?.some(item => item.id === objectId) && resolvedTitleId)
    && !objects.isError && !attributes.isError && !attributes.isPending;
  const canNext = validSource && name.trim().length > 0 && Array.from(name.trim()).length <= 80;
  const canCreate = canNext && !pending && (viewType !== "KANBAN" || (statusMode === "existing" ? Boolean(resolvedStatusId) : validStages));

  // 기능 : 관리 항목을 바꾸면 이전 항목의 제목·상태 선택을 초기화합니다.
  function changeObject(value: string) {
    setObjectId(value); setTitleId(""); setStatusId(""); setError(null);
  }

  // 기능 : 이름 단계를 진행하거나 완성된 목록 생성 요청을 한 번만 전송합니다.
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step === "name") { if (canNext) setStep("details"); return; }
    if (!canCreate || !workspaceId || !isOpen || submitting.current) return;
    // 1. React 재렌더 이전의 연속 제출도 막고 요청 시점의 모달 세대를 보관한다.
    submitting.current = true; setPending(true); setError(null);
    const requestGeneration = generation.current;
    // 기능 : 응답을 처리할 원래 모달이 활성 상태인지 확인합니다.
    const isCurrent = () => active.current && requestGeneration === generation.current;
    const kanban: CreateListDefinitionInput["kanban"] = viewType !== "KANBAN" ? undefined
      : statusMode === "existing" ? { attributeDefinitionId: resolvedStatusId }
        : { newStatus: { title: statusTitle.trim(), options: stages } };
    let result: CreateListDefinitionResponse;
    try {
      // 2. 보드가 아니면 숨겨진 단계 입력은 보내지 않는다.
      result = await createListDefinition({ workspaceId, listDefinitionName: name.trim(), objectDefinitionId: objectId,
        titleAttributeDefinitionId: resolvedTitleId, viewType, icon,
        ...(description ? { description } : {}), ...(kanban ? { kanban } : {}) });
    } catch (failure) {
      submitting.current = false;
      if (isCurrent()) {
        setPending(false);
        setError(failure instanceof ApiClientError && failure.statusCode === 409 ? copy.duplicate
          : failure instanceof ApiClientError && failure.statusCode === 404 ? copy.sourceMissing : copy.failed);
      }
      return;
    }
    // 3. 저장 후 cache/route 오류로 재생성이 가능해지지 않도록 성공 처리를 분리한다.
    const shouldNavigate = isCurrent();
    onCreated(result, shouldNavigate);
    if (shouldNavigate) onClose();
  }

  // 기능 : 닫는 즉시 요청 응답의 화면 이동을 금지합니다.
  function close() { active.current = false; onClose(); }

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-white">
      <button aria-label={copy.close} className="absolute right-4 top-4 z-10 rounded-md p-2 text-[#64748B] hover:bg-[#E4E2DC]" onClick={close} type="button"><X className="h-4 w-4" /></button>
      {step === "details" && <button className="absolute left-4 top-4 z-10 flex items-center gap-1 rounded-md px-2 py-1 text-sm text-[#4B5563] hover:bg-[#E4E2DC] disabled:opacity-50" disabled={pending} onClick={() => { setStep("name"); setError(null); }} type="button"><ArrowLeft className="h-4 w-4" />{copy.back}</button>}
      <form aria-label={copy.title} className="min-h-0 flex-1 overflow-y-auto px-8 pb-8 pt-16 md:px-12" onSubmit={submit}>
        <h1 className="mb-7 text-xl font-normal text-[#050505]">{step === "name" ? copy.title : copy.details}</h1>
        {error && <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
        {step === "name" ? <div className="grid gap-5">
          <label className="grid gap-2 text-sm">{copy.name}<input autoFocus className={inputClass} value={name} placeholder={copy.placeholder} onChange={event => setName(event.target.value)} maxLength={160} /></label>
          {objects.isPending ? <p role="status" className="text-sm text-[#6B7280]">{copy.loading}</p>
            : objects.isError ? <p role="alert" className="text-sm">{copy.loadFailed} <button className="text-[#4880EE]" type="button" onClick={() => void objects.refetch()}>{copy.retry}</button></p>
              : !objects.data?.length ? <div className="rounded-md bg-[#F7F7F5] p-4 text-sm"><p>{copy.noObjects}</p><button className="mt-3 text-[#4880EE]" type="button" onClick={onCreateObject}>{copy.addObject}</button></div>
                : <div className="grid gap-2 text-sm"><label htmlFor="list-source">{copy.source}</label><select id="list-source" aria-describedby="list-source-help" className={inputClass} value={objectId} onChange={event => changeObject(event.target.value)}><option value="">{copy.choose}</option>{objects.data.map(item => <option key={item.id} value={item.id}>{item.singularName}</option>)}</select><p id="list-source-help" className="text-xs text-[#6B7280]">{copy.sourceHelp}</p></div>}
          {objectId && (attributes.isPending ? <p role="status" className="text-sm">{copy.loading}</p>
            : attributes.isError ? <p role="alert" className="text-sm">{copy.loadFailed} <button className="text-[#4880EE]" type="button" onClick={() => void attributes.refetch()}>{copy.retry}</button></p>
              : !fields.length ? <p className="text-sm text-[#6B7280]">{copy.noAttributes}</p>
                : <label className="grid gap-2 text-sm">{copy.titleAttribute}<select className={inputClass} value={resolvedTitleId} onChange={event => setTitleId(event.target.value)}>{fields.map(field => <option key={field.id} value={field.id}>{field.title}</option>)}</select></label>)}
          <button className={cn(buttonClass, "mt-4")} disabled={!canNext} type="submit">{copy.next}</button>
        </div> : <fieldset className="grid min-w-0 gap-5" disabled={pending}>
          <fieldset><legend className="mb-2 text-sm">{copy.viewType}</legend><div className="grid grid-cols-3 gap-2">{layouts.map(({ type, Icon }) => <label key={type} className={cn("relative cursor-pointer rounded-md border p-3 text-sm", viewType === type ? "border-[#4880EE] bg-blue-50" : "border-[#E4E2DC]")}><input className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0" type="radio" name="list-view-type" value={type} checked={viewType === type} onChange={() => setViewType(type)} /><div className="rounded-sm peer-focus-visible:ring-2 peer-focus-visible:ring-[#4880EE]"><Icon aria-hidden="true" className="mb-2 h-5 w-5" /><span>{copy[type]}</span><p className="mt-1 text-xs leading-5 text-[#6B7280]">{copy[`${type}Help`]}</p></div></label>)}</div></fieldset>
          {viewType === "KANBAN" && <div className="grid gap-3 rounded-md bg-[#F7F7F5] p-4">
            <label className="grid gap-2 text-sm">{copy.grouping}<select className={inputClass} value={statusMode} onChange={event => setStatusMode(event.target.value as "existing" | "new")}><option value="existing" disabled={!statuses.length}>{copy.existing}</option><option value="new">{copy.newStatus}</option></select></label>
            {statusMode === "existing" ? <label className="grid gap-2 text-sm">{copy.chooseStatus}<select className={inputClass} value={resolvedStatusId} onChange={event => setStatusId(event.target.value)}>{statuses.map(field => <option key={field.id} value={field.id}>{field.title}</option>)}</select>{!statuses.length && <span>{copy.noStatus}</span>}</label>
              : <><label className="grid gap-2 text-sm">{copy.statusTitle}<input className={inputClass} value={statusTitle} placeholder={copy.statusTitlePlaceholder} onChange={event => setStatusTitle(event.target.value)} maxLength={160} /></label><label className="grid gap-2 text-sm">{copy.stages}<textarea className={cn(inputClass, "h-24 py-2")} value={stageText} placeholder={copy.stagesPlaceholder} onChange={event => setStageText(event.target.value)} /><span className="text-xs text-[#6B7280]">{copy.stageHelp}</span></label></>}
          </div>}
          <div><IconValuePicker searchInputName="listDefinitionLucideIconSearch" locale={locale} value={icon} onChange={setIcon} label={copy.icon} emojiSearchClearButtonLabel={copy.emojiSearchClearButtonLabel} emojiSearchPlaceholder={copy.emojiSearchPlaceholder} emojiTabLabel={copy.emojiTabLabel} iconNoResultsLabel={copy.iconNoResultsLabel} iconSearchPlaceholder={copy.iconSearchPlaceholder} iconTabLabel={copy.iconTabLabel} /></div>
          <label className="grid gap-2 text-sm">{copy.description}<textarea className={cn(inputClass, "h-20 py-2")} maxLength={300} value={description} placeholder={copy.descriptionPlaceholder} onChange={event => setDescription(event.target.value)} /></label>
          <button className={buttonClass} disabled={!canCreate} type="submit">{pending ? copy.creating : copy.create}</button>
          {pending && <p role="status" className="text-center text-sm text-[#6B7280]">{copy.creating}</p>}
        </fieldset>}
      </form>
    </div>
  );
}
