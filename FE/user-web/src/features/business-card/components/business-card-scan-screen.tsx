import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  FileImage,
  IdCard,
  ImagePlus,
  Loader2,
  RefreshCw,
  Save,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch, type UseFormRegisterReturn } from "react-hook-form";
import { Link } from "react-router-dom";
import {
  useConfirmBusinessCardScanMutation,
  useScanBusinessCardMutation,
} from "@/features/business-card/hooks/use-business-card-mutations";
import { useBusinessCardScanDetail } from "@/features/business-card/hooks/use-business-card-queries";
import {
  businessCardConfirmSchema,
  emptyBusinessCardConfirmFormValues,
  toConfirmFormValues,
  toConfirmInput,
  validateBusinessCardImage,
  type BusinessCardConfirmFormValues,
} from "@/features/business-card/schemas/business-card-schema";
import type {
  BusinessCardCompanyCandidate,
  BusinessCardCompanyMode,
} from "@/features/business-card/types/business-card";
import { getApiErrorMessage } from "@/lib/api-client";

export function BusinessCardScanScreen() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [memo, setMemo] = useState("");
  const [scanId, setScanId] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmedContactId, setConfirmedContactId] = useState<string | null>(null);
  const previewUrl = useObjectUrl(selectedFile);
  const scanMutation = useScanBusinessCardMutation();
  const confirmMutation = useConfirmBusinessCardScanMutation();
  const detailQuery = useBusinessCardScanDetail(scanId);
  const detail = detailQuery.data ?? null;
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BusinessCardConfirmFormValues>({
    resolver: zodResolver(businessCardConfirmSchema),
    defaultValues: emptyBusinessCardConfirmFormValues,
  });
  const companyMode = useWatch({ control, name: "companyMode" });
  const selectedCompanyId = useWatch({ control, name: "companyId" }) ?? "";
  const actionError =
    scanMutation.error ?? confirmMutation.error ?? detailQuery.error ?? null;
  const isProcessing = scanMutation.isPending || detail?.status === "OCR_PROCESSING";
  const canConfirm = detail?.status === "OCR_COMPLETED";

  useEffect(() => {
    if (!detail || detail.status !== "OCR_COMPLETED") {
      return;
    }

    const initialMode: BusinessCardCompanyMode =
      detail.companyCandidates.length > 0 ? "EXISTING" : "NEW";
    reset(toConfirmFormValues(detail, initialMode));
  }, [detail, reset]);

  const selectedCompany = useMemo(
    () =>
      detail?.companyCandidates.find((company) => company.id === selectedCompanyId) ??
      null,
    [detail?.companyCandidates, selectedCompanyId]
  );

  const onFileChange = (file: File | null) => {
    setSelectedFile(file);
    setFileError(validateBusinessCardImage(file));
    setScanId("");
    setNotice(null);
    setConfirmedContactId(null);
    reset(emptyBusinessCardConfirmFormValues);
  };

  const onScan = async () => {
    const validationMessage = validateBusinessCardImage(selectedFile);

    if (validationMessage || !selectedFile) {
      setFileError(validationMessage);
      return;
    }

    setFileError(null);
    setNotice(null);
    setConfirmedContactId(null);
    const scan = await scanMutation.mutateAsync({
      imageFile: selectedFile,
      memo,
    });
    setScanId(scan.scanId);
    setNotice("OCR 처리가 완료되었습니다. 결과를 확인한 뒤 저장하세요.");
  };

  const onConfirm = handleSubmit(async (values) => {
    if (!scanId || !canConfirm) {
      return;
    }

    const confirmed = await confirmMutation.mutateAsync(
      toConfirmInput(scanId, values)
    );
    setNotice("명함 OCR 결과가 담당자로 저장되었습니다.");
    setConfirmedContactId(confirmed.contact.id);
  });

  const chooseCompanyMode = (mode: BusinessCardCompanyMode) => {
    setValue("companyMode", mode, { shouldValidate: true });

    if (mode === "EXISTING") {
      setValue("companyId", detail?.companyCandidates[0]?.id ?? "", {
        shouldValidate: true,
      });
    } else {
      setValue("companyId", "", { shouldValidate: true });
    }
  };

  return (
    <section className="mx-auto grid max-w-[1500px] gap-5 px-5 py-6">
      <header className="flex flex-col gap-4 border-b pb-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold">명함 OCR</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            명함 이미지를 업로드하고 추출 결과를 확인한 뒤 담당자로 저장합니다.
          </p>
        </div>
        {confirmedContactId ? (
          <Link
            className="inline-flex h-10 w-fit items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
            to={`/contacts/${confirmedContactId}`}
          >
            <UserRound className="h-4 w-4" />
            저장된 담당자 보기
          </Link>
        ) : null}
      </header>

      {notice ? (
        <NoticeMessage message={notice} onDismiss={() => setNotice(null)} />
      ) : null}

      {actionError ? <ErrorMessage message={getApiErrorMessage(actionError)} /> : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.15fr)]">
        <section className="grid gap-4 rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">이미지 업로드</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                JPG, PNG, WebP 형식의 10MB 이하 이미지를 지원합니다.
              </p>
            </div>
            <IdCard className="h-5 w-5 text-muted-foreground" />
          </div>

          <label
            className="grid min-h-[320px] cursor-pointer place-items-center rounded-lg border border-dashed bg-muted/30 p-4 text-center hover:bg-muted/50"
            htmlFor="business-card-file"
          >
            {previewUrl ? (
              <img
                alt="명함 미리보기"
                className="max-h-[300px] w-full rounded-md object-contain"
                src={previewUrl}
              />
            ) : (
              <div className="grid gap-3">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-md bg-white">
                  <ImagePlus className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">명함 이미지 선택</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    파일을 선택하면 여기에서 미리볼 수 있습니다.
                  </p>
                </div>
              </div>
            )}
            <input
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              id="business-card-file"
              onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
              type="file"
            />
          </label>

          {selectedFile ? (
            <div className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm">
              <span className="inline-flex min-w-0 items-center gap-2">
                <FileImage className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{selectedFile.name}</span>
              </span>
              <button
                aria-label="선택한 파일 지우기"
                className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-muted"
                onClick={() => onFileChange(null)}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : null}

          {fileError ? <p className="text-sm text-destructive">{fileError}</p> : null}

          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="business-card-memo">
              메모
            </label>
            <textarea
              className="min-h-24 resize-y rounded-md border px-3 py-2 text-sm leading-6 outline-none focus:ring-2 focus:ring-ring"
              id="business-card-memo"
              onChange={(event) => setMemo(event.target.value)}
              placeholder="명함을 받은 상황이나 후속 할 일을 남깁니다."
              value={memo}
            />
          </div>

          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
            disabled={scanMutation.isPending}
            onClick={() => void onScan()}
            type="button"
          >
            {scanMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            OCR 요청
          </button>

          <StatusPanel
            errorMessage={detail?.errorMessage ?? null}
            isLoading={detailQuery.isFetching || isProcessing}
            status={detail?.status ?? null}
          />
        </section>

        <form className="grid gap-5" onSubmit={onConfirm}>
          <section className="grid gap-4 rounded-lg border bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">추출 결과</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  저장 전 담당자 정보를 확인하고 수정합니다.
                </p>
              </div>
              <RefreshCw className="h-5 w-5 text-muted-foreground" />
            </div>

            {!detail ? (
              <EmptyResultState />
            ) : detail.status === "FAILED" ? (
              <ErrorMessage
                message={detail.errorMessage ?? "OCR 처리에 실패했습니다."}
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <TextField
                  errorMessage={errors.contactName?.message}
                  id="business-card-contact"
                  label="담당자"
                  register={register("contactName")}
                />
                <TextField
                  errorMessage={errors.department?.message}
                  id="business-card-department"
                  label="부서"
                  register={register("department")}
                />
                <TextField
                  errorMessage={errors.position?.message}
                  id="business-card-position"
                  label="직책"
                  register={register("position")}
                />
                <TextField
                  errorMessage={errors.phone?.message}
                  id="business-card-phone"
                  label="전화번호"
                  register={register("phone")}
                />
                <TextField
                  errorMessage={errors.email?.message}
                  id="business-card-email"
                  label="이메일"
                  register={register("email")}
                />
                <TextField
                  errorMessage={errors.address?.message}
                  id="business-card-address"
                  label="주소"
                  register={register("address")}
                />
              </div>
            )}
          </section>

          <section className="grid gap-4 rounded-lg border bg-white p-4">
            <div>
              <h2 className="text-base font-semibold">회사 처리</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                기존 회사에 연결하거나 새 회사로 만들 수 있습니다.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <ModeButton
                active={companyMode === "EXISTING"}
                disabled={!detail || detail.companyCandidates.length === 0}
                icon={Building2}
                label="기존 회사"
                onClick={() => chooseCompanyMode("EXISTING")}
              />
              <ModeButton
                active={companyMode === "NEW"}
                disabled={!detail}
                icon={Building2}
                label="새 회사"
                onClick={() => chooseCompanyMode("NEW")}
              />
              <ModeButton
                active={companyMode === "NONE"}
                disabled={!detail}
                icon={UserRound}
                label="회사 없이 저장"
                onClick={() => chooseCompanyMode("NONE")}
              />
            </div>

            {companyMode === "EXISTING" ? (
              <CompanyCandidateList
                candidates={detail?.companyCandidates ?? []}
                errorMessage={errors.companyId?.message}
                onSelect={(company) =>
                  setValue("companyId", company.id, { shouldValidate: true })
                }
                selectedCompanyId={selectedCompanyId}
              />
            ) : null}

            {companyMode === "NEW" ? (
              <TextField
                errorMessage={errors.companyName?.message}
                id="business-card-company"
                label="새 회사명"
                register={register("companyName")}
              />
            ) : null}

            {companyMode === "NONE" ? (
              <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                회사 없이 담당자만 저장합니다. 나중에 담당자 상세에서 회사 연결을
                추가할 수 있습니다.
              </p>
            ) : null}

            {selectedCompany ? (
              <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                {selectedCompany.name} 회사에 연결합니다.
              </p>
            ) : null}

            <button
              className="inline-flex h-10 w-fit items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!canConfirm || confirmMutation.isPending}
              type="submit"
            >
              {confirmMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              담당자로 저장
            </button>
          </section>
        </form>
      </div>
    </section>
  );
}

function StatusPanel({
  status,
  isLoading,
  errorMessage,
}: {
  readonly status: string | null;
  readonly isLoading: boolean;
  readonly errorMessage: string | null;
}) {
  if (isLoading) {
    return (
      <p className="inline-flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        OCR 처리 중
      </p>
    );
  }

  if (!status) {
    return (
      <p className="inline-flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
        <IdCard className="h-4 w-4" />
        이미지 업로드 대기
      </p>
    );
  }

  if (status === "FAILED") {
    return (
      <p className="inline-flex items-center gap-2 rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
        <AlertCircle className="h-4 w-4" />
        {errorMessage ?? "OCR 실패"}
      </p>
    );
  }

  return (
    <p className="inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
      <CheckCircle2 className="h-4 w-4" />
      OCR 결과 확인 가능
    </p>
  );
}

function CompanyCandidateList({
  candidates,
  selectedCompanyId,
  errorMessage,
  onSelect,
}: {
  readonly candidates: BusinessCardCompanyCandidate[];
  readonly selectedCompanyId: string;
  readonly errorMessage?: string;
  readonly onSelect: (company: BusinessCardCompanyCandidate) => void;
}) {
  if (candidates.length === 0) {
    return (
      <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
        검색된 기존 회사 후보가 없습니다.
      </p>
    );
  }

  return (
    <div className="grid gap-2">
      {candidates.map((company) => (
        <button
          className={`grid rounded-md border px-3 py-2 text-left text-sm ${
            selectedCompanyId === company.id
              ? "border-primary bg-primary/5"
              : "hover:bg-muted"
          }`}
          key={company.id}
          onClick={() => onSelect(company)}
          type="button"
        >
          <span className="font-medium">{company.name}</span>
          <span className="mt-1 text-xs text-muted-foreground">
            {[company.industry, company.region].filter(Boolean).join(" · ") || "-"}
          </span>
        </button>
      ))}
      {errorMessage ? <p className="text-xs text-destructive">{errorMessage}</p> : null}
    </div>
  );
}

function ModeButton({
  active,
  disabled,
  icon: Icon,
  label,
  onClick,
}: {
  readonly active: boolean;
  readonly disabled: boolean;
  readonly icon: typeof Building2;
  readonly label: string;
  readonly onClick: () => void;
}) {
  return (
    <button
      className={`inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 ${
        active ? "border-primary bg-primary text-primary-foreground" : "bg-white hover:bg-muted"
      }`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function TextField({
  id,
  label,
  register,
  errorMessage,
}: {
  readonly id: string;
  readonly label: string;
  readonly register: UseFormRegisterReturn;
  readonly errorMessage?: string;
}) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <input
        aria-describedby={errorMessage ? `${id}-error` : undefined}
        aria-invalid={Boolean(errorMessage)}
        className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        id={id}
        {...register}
      />
      {errorMessage ? (
        <p className="text-xs text-destructive" id={`${id}-error`}>
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

function EmptyResultState() {
  return (
    <div className="grid place-items-center rounded-md border bg-muted/30 px-4 py-12 text-center">
      <div className="grid max-w-sm gap-2">
        <RefreshCw className="mx-auto h-5 w-5 text-muted-foreground" />
        <p className="text-sm font-medium">OCR 결과 대기</p>
        <p className="text-sm text-muted-foreground">
          이미지를 업로드하면 추출 결과가 여기에 표시됩니다.
        </p>
      </div>
    </div>
  );
}

function NoticeMessage({
  message,
  onDismiss,
}: {
  readonly message: string;
  readonly onDismiss: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
      <span className="inline-flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4" />
        {message}
      </span>
      <button
        aria-label="알림 닫기"
        className="grid h-7 w-7 place-items-center rounded-md hover:bg-emerald-100"
        onClick={onDismiss}
        type="button"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function ErrorMessage({ message }: { readonly message: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-md border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
      <AlertCircle className="h-4 w-4" />
      {message}
    </div>
  );
}

function useObjectUrl(file: File | null) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return url;
}
