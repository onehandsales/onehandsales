import {
  ArrowRight,
  Check,
  ChevronDown,
} from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { OneHandLogoMark } from "@/components/brand/onehand-logo-mark";
import {
  getPublicSiteCopyLanguage,
  usePublicSiteLanguage,
  type PublicSiteCopyLanguage,
} from "@/features/public-site/i18n/public-site-language";
import { usePublicSitePath } from "@/features/public-site/i18n/public-site-locale-hooks";

const contactStepIds = ["email", "size", "profile", "context"] as const;

type ContactStepId = (typeof contactStepIds)[number];

type ContactFormValues = {
  readonly email: string;
  readonly companySize: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly company: string;
  readonly title: string;
  readonly region: string;
  readonly phone: string;
  readonly plan: string;
  readonly source: string;
  readonly marketingAgreement: boolean;
};

type ContactFlowCopy = {
  readonly next: string;
  readonly submit: string;
  readonly home: string;
  readonly required: string;
  readonly emailInvalid: string;
  readonly progress: (step: number, total: number) => string;
  readonly email: {
    readonly title: string;
    readonly label: string;
    readonly placeholder: string;
  };
  readonly size: {
    readonly title: string;
    readonly options: readonly ContactOption[];
  };
  readonly profile: {
    readonly title: string;
    readonly descriptionPrefix: string;
    readonly descriptionSuffix: string;
    readonly labels: {
      readonly firstName: string;
      readonly lastName: string;
      readonly company: string;
      readonly title: string;
      readonly region: string;
      readonly phone: string;
    };
    readonly placeholders: {
      readonly firstName: string;
      readonly lastName: string;
      readonly company: string;
      readonly title: string;
      readonly region: string;
      readonly phone: string;
    };
    readonly marketingAgreement: string;
  };
  readonly context: {
    readonly title: string;
    readonly descriptionPrefix: string;
    readonly descriptionSuffix: string;
    readonly planLabel: string;
    readonly planPlaceholder: string;
    readonly sourceLabel: string;
    readonly sourcePlaceholder: string;
    readonly sourceOptions: readonly ContactOption[];
  };
  readonly done: {
    readonly title: string;
    readonly description: string;
    readonly emailLabel: string;
    readonly sizeLabel: string;
  };
};

type ContactOption = {
  readonly value: string;
  readonly label: string;
};

const emptyContactFormValues: ContactFormValues = {
  email: "",
  companySize: "",
  firstName: "",
  lastName: "",
  company: "",
  title: "",
  region: "",
  phone: "",
  plan: "",
  source: "",
  marketingAgreement: true,
};

const contactRegionOptionsByLanguage: Record<
  PublicSiteCopyLanguage,
  readonly ContactOption[]
> = {
  ko: [
    { value: "KR", label: "대한민국" },
    { value: "US", label: "미국" },
    { value: "CA", label: "캐나다" },
  ],
  "en-US": [
    { value: "KR", label: "South Korea" },
    { value: "US", label: "United States" },
    { value: "CA", label: "Canada" },
  ],
};

const contactRegionPlaceholderByLanguage: Record<PublicSiteCopyLanguage, string> = {
  ko: "선택...",
  "en-US": "Select...",
};

const contactFlowCopyByLanguage: Record<PublicSiteCopyLanguage, ContactFlowCopy> = {
  ko: {
    next: "다음",
    submit: "제출하기",
    home: "OneHand로 돌아가기",
    required: "필수 입력 항목이에요.",
    emailInvalid: "업무용 이메일 주소를 정확히 입력해 주세요.",
    progress: (step, total) => `${step} / ${total}`,
    email: {
      title: "업무용 이메일 주소를 입력해 주세요.",
      label: "업무용 이메일",
      placeholder: "you@company.com",
    },
    size: {
      title: "직원 수는 몇 명인가요?",
      options: [
        { value: "1-9", label: "직원 1~9명" },
        { value: "10-49", label: "직원 10~49명" },
        { value: "50-199", label: "직원 50~199명" },
        { value: "200+", label: "직원 200명 이상" },
      ],
    },
    profile: {
      title: "연결하려면 몇 가지 상세정보가 더 필요해요.",
      descriptionPrefix: "통화 일정을 잡기 위해 업무용 이메일 ",
      descriptionSuffix:
        "로 연락드릴게요. 아래 정보를 남겨주시면 다음 안내를 더 정확히 준비할 수 있어요.",
      labels: {
        firstName: "이름",
        lastName: "성",
        company: "회사 이름",
        title: "직책",
        region: "국가 또는 지역",
        phone: "전화번호",
      },
      placeholders: {
        firstName: "길동",
        lastName: "홍",
        company: "가나다 주식회사",
        title: "영업 리드",
        region: "대한민국",
        phone: "010-1234-5678",
      },
      marketingAgreement: "OneHand 제품 소식과 도입 안내를 받을게요.",
    },
    context: {
      title: "곧 연락드릴게요.",
      descriptionPrefix: "통화 일정을 잡기 위해 업무용 이메일 ",
      descriptionSuffix:
        "로 연락드릴게요. 기다리는 동안 아래 정보를 남겨주시면 다음 안내가 더 선명해져요.",
      planLabel: "OneHand를 어떻게 사용할 계획인가요?",
      planPlaceholder: "예: 부동산 고객 상담과 팔로업을 한곳에서 관리하고 싶어요.",
      sourceLabel: "OneHand를 알게 된 경로는 무엇인가요?",
      sourcePlaceholder: "선택...",
      sourceOptions: [
        { value: "linkedin", label: "LinkedIn" },
        { value: "peer", label: "동료" },
        { value: "search", label: "검색(Google, ChatGPT)" },
        { value: "newsletter", label: "디지털 뉴스레터" },
        { value: "event", label: "오프라인 행사 또는 컨퍼런스" },
        { value: "webinar", label: "웨비나 또는 디지털 이벤트" },
        { value: "podcast", label: "팟캐스트/라디오/Spotify/오디오" },
        { value: "friend", label: "친구 또는 가족" },
        { value: "naver", label: "네이버" },
        { value: "other", label: "기타" },
      ],
    },
    done: {
      title: "문의가 접수됐어요.",
      description:
        "남겨주신 내용을 확인한 뒤 OneHand 팀이 업무용 이메일로 연락드릴게요.",
      emailLabel: "이메일",
      sizeLabel: "규모",
    },
  },
  "en-US": {
    next: "Next",
    submit: "Submit",
    home: "Back to OneHand",
    required: "This field is required.",
    emailInvalid: "Enter a valid work email address.",
    progress: (step, total) => `${step} / ${total}`,
    email: {
      title: "Enter your work email.",
      label: "Work email",
      placeholder: "you@company.com",
    },
    size: {
      title: "How many people will use OneHand?",
      options: [
        { value: "1-9", label: "1-9 employees" },
        { value: "10-49", label: "10-49 employees" },
        { value: "50-199", label: "50-199 employees" },
        { value: "200+", label: "200+ employees" },
      ],
    },
    profile: {
      title: "A few more details will help us connect you.",
      descriptionPrefix: "We will contact ",
      descriptionSuffix:
        " to schedule a call. Share the details below so we can prepare the right next step.",
      labels: {
        firstName: "First name",
        lastName: "Last name",
        company: "Company name",
        title: "Job title",
        region: "Country or region",
        phone: "Phone number",
      },
      placeholders: {
        firstName: "Jane",
        lastName: "Kim",
        company: "Example Inc.",
        title: "Sales lead",
        region: "United States",
        phone: "(123) 456-7890",
      },
      marketingAgreement:
        "I agree to receive product updates and onboarding messages from OneHand.",
    },
    context: {
      title: "We will be in touch soon.",
      descriptionPrefix: "We will contact ",
      descriptionSuffix:
        " to schedule a call. Add a little more context while we prepare.",
      planLabel: "How do you plan to use OneHand?",
      planPlaceholder:
        "Example: I want to manage customer follow-up for field sales in one place.",
      sourceLabel: "How did you hear about OneHand?",
      sourcePlaceholder: "Select...",
      sourceOptions: [
        { value: "linkedin", label: "LinkedIn" },
        { value: "peer", label: "Peer or coworker" },
        { value: "search", label: "Search(Google, ChatGPT)" },
        { value: "newsletter", label: "Digital newsletter" },
        { value: "event", label: "In-person event or conference" },
        { value: "webinar", label: "Webinar or digital event" },
        { value: "podcast", label: "Podcast/radio/Spotify/audio" },
        { value: "friend", label: "Friend or family" },
        { value: "naver", label: "Naver" },
        { value: "other", label: "Other" },
      ],
    },
    done: {
      title: "Your request was received.",
      description:
        "The OneHand team will review your details and contact you by work email.",
      emailLabel: "Email",
      sizeLabel: "Team size",
    },
  },
};

// 기능 : 도입 문의를 단계형 Request Demo 흐름으로 렌더링합니다.
export function ContactPage() {
  const { copy: publicSiteCopy, language } = usePublicSiteLanguage();
  const publicSitePath = usePublicSitePath();
  const copyLanguage = getPublicSiteCopyLanguage(language);
  const copy = contactFlowCopyByLanguage[copyLanguage];
  const regionOptions = contactRegionOptionsByLanguage[copyLanguage];
  const regionPlaceholder = contactRegionPlaceholderByLanguage[copyLanguage];
  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState<ContactFormValues>(
    emptyContactFormValues
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const currentStep = contactStepIds[stepIndex] ?? "email";
  const selectedSize = copy.size.options.find(
    (option) => option.value === values.companySize
  );

  const updateValue = <TField extends keyof ContactFormValues>(
    field: TField,
    value: ContactFormValues[TField]
  ) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrorMessage("");
  };

  const goNext = () => {
    setErrorMessage("");
    setStepIndex((current) => Math.min(contactStepIds.length - 1, current + 1));
  };

  const handleEmailNext = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!values.email.trim()) {
      setErrorMessage("");
      return;
    }

    if (!isValidEmail(values.email)) {
      setErrorMessage(copy.emailInvalid);
      return;
    }

    goNext();
  };

  const handleSizeSelect = (option: ContactOption) => {
    updateValue("companySize", option.value);
    setStepIndex(2);
  };

  const handleProfileNext = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isProfileComplete(values)) {
      setErrorMessage("");
      return;
    }

    goNext();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!values.plan.trim() || !values.source.trim()) {
      setErrorMessage(copy.required);
      return;
    }

    setErrorMessage("");
    setIsSubmitted(true);
  };

  return (
    <main className="min-h-dvh overflow-x-hidden bg-white text-[#050505]">
      <header className="fixed inset-x-0 top-0 z-50 bg-white/95 backdrop-blur">
        <div className="flex h-14 w-full items-center px-4 md:px-5">
          <Link
            aria-label={publicSiteCopy.common.logoAria}
            className="flex h-9 w-9 items-center justify-center text-[#111111]"
            to={publicSitePath("/")}
          >
            <OneHandLogoMark className="h-9 w-9" />
          </Link>
        </div>
      </header>

      <section className="mx-auto grid min-h-dvh w-full max-w-[1100px] items-center gap-10 px-4 py-24 sm:px-6 lg:grid-cols-[minmax(0,520px)_minmax(300px,1fr)] lg:px-8">
        <div className="min-w-0 w-full">
          {isSubmitted ? (
            <ContactDone
              copy={copy}
              email={values.email}
              homePath={publicSitePath("/")}
              sizeLabel={selectedSize?.label ?? values.companySize}
            />
          ) : (
            <>
              <p className="mb-5 text-[13px] font-normal text-[#777770]">
                {copy.progress(stepIndex + 1, contactStepIds.length)}
              </p>

              {currentStep === "email" ? (
                <EmailStep
                  copy={copy}
                  errorMessage={errorMessage}
                  onSubmit={handleEmailNext}
                  onUpdate={(value) => updateValue("email", value)}
                  value={values.email}
                />
              ) : null}

              {currentStep === "size" ? (
                <SizeStep
                  copy={copy}
                  onSelect={handleSizeSelect}
                  selectedValue={values.companySize}
                />
              ) : null}

              {currentStep === "profile" ? (
                <ProfileStep
                  copy={copy}
                  errorMessage={errorMessage}
                  regionOptions={regionOptions}
                  regionPlaceholder={regionPlaceholder}
                  onSubmit={handleProfileNext}
                  onUpdate={updateValue}
                  values={values}
                />
              ) : null}

              {currentStep === "context" ? (
                <ContextStep
                  copy={copy}
                  email={values.email}
                  errorMessage={errorMessage}
                  onSubmit={handleSubmit}
                  onUpdate={updateValue}
                  values={values}
                />
              ) : null}
            </>
          )}
        </div>

        <ContactIllustration step={isSubmitted ? "done" : currentStep} />
      </section>
    </main>
  );
}

function EmailStep({
  copy,
  errorMessage,
  value,
  onSubmit,
  onUpdate,
}: {
  readonly copy: ContactFlowCopy;
  readonly errorMessage: string;
  readonly value: string;
  readonly onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  readonly onUpdate: (value: string) => void;
}) {
  const isNextDisabled = !value.includes("@");

  return (
    <form className="min-w-0 w-full max-w-[508px]" onSubmit={onSubmit}>
      <h1 className="break-keep text-[35px] font-normal leading-[1.12] tracking-normal text-[#050505]">
        {copy.email.title}
      </h1>

      <FieldError message={errorMessage} />

      <label className="mt-8 grid gap-2 text-[13px] font-normal text-[#111111]">
        {copy.email.label}
        <input
          autoComplete="email"
          className="h-10 rounded-[6px] border border-[#dededa] bg-transparent px-3 text-[15px] font-normal text-[#111111] outline-none transition-colors placeholder:text-[#aaa9a3] focus:border-[#dededa] [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_white] [&:-webkit-autofill]:[-webkit-text-fill-color:#111111]"
          name="email"
          onChange={(event) => onUpdate(event.target.value)}
          placeholder={copy.email.placeholder}
          type="email"
          value={value}
        />
      </label>

      <PrimaryButton
        className="mt-14"
        disabled={isNextDisabled}
        label={copy.next}
        type="submit"
      />
    </form>
  );
}

function SizeStep({
  copy,
  selectedValue,
  onSelect,
}: {
  readonly copy: ContactFlowCopy;
  readonly selectedValue: string;
  readonly onSelect: (option: ContactOption) => void;
}) {
  return (
    <section
      className="min-w-0 w-full max-w-[508px]"
      aria-labelledby="contact-size-title"
    >
      <h1
        className="break-keep text-[35px] font-normal leading-[1.12] tracking-normal text-[#050505]"
        id="contact-size-title"
      >
        {copy.size.title}
      </h1>

      <div className="mt-8 grid gap-2.5">
        {copy.size.options.map((option) => (
          <button
            className={[
              "h-12 rounded-[6px] border border-[#dededa] px-4 text-center text-[15px] font-normal transition-colors",
              selectedValue === option.value
                ? "bg-[#F2F2EF] text-[#050505]"
                : "bg-white text-[#111111] hover:bg-[#F2F2EF]",
            ].join(" ")}
            key={option.value}
            onClick={() => onSelect(option)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
    </section>
  );
}

function ProfileStep({
  copy,
  errorMessage,
  regionOptions,
  regionPlaceholder,
  values,
  onSubmit,
  onUpdate,
}: {
  readonly copy: ContactFlowCopy;
  readonly errorMessage: string;
  readonly regionOptions: readonly ContactOption[];
  readonly regionPlaceholder: string;
  readonly values: ContactFormValues;
  readonly onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  readonly onUpdate: <TField extends keyof ContactFormValues>(
    field: TField,
    value: ContactFormValues[TField]
  ) => void;
}) {
  const isNextDisabled = !isProfileComplete(values);

  return (
    <form className="min-w-0 w-full max-w-[508px]" onSubmit={onSubmit}>
      <h1 className="break-keep text-[35px] font-normal leading-[1.12] tracking-normal text-[#050505]">
        {copy.profile.title}
      </h1>
      <p className="mt-5 max-w-[500px] break-keep text-[15px] font-normal leading-7 text-[#333330]">
        {copy.profile.descriptionPrefix}
        <strong className="break-all font-normal text-[#050505]">
          {values.email}
        </strong>
        {copy.profile.descriptionSuffix}
      </p>

      <FieldError message={errorMessage} />

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <FormField
          autoComplete="given-name"
          label={copy.profile.labels.firstName}
          onChange={(value) => onUpdate("firstName", value)}
          placeholder={copy.profile.placeholders.firstName}
          value={values.firstName}
        />
        <FormField
          autoComplete="family-name"
          label={copy.profile.labels.lastName}
          onChange={(value) => onUpdate("lastName", value)}
          placeholder={copy.profile.placeholders.lastName}
          value={values.lastName}
        />
        <FormField
          autoComplete="organization"
          label={copy.profile.labels.company}
          onChange={(value) => onUpdate("company", value)}
          placeholder={copy.profile.placeholders.company}
          value={values.company}
        />
        <FormField
          autoComplete="organization-title"
          label={copy.profile.labels.title}
          onChange={(value) => onUpdate("title", value)}
          placeholder={copy.profile.placeholders.title}
          value={values.title}
        />
        <RegionSelectField
          label={copy.profile.labels.region}
          onChange={(value) => onUpdate("region", value)}
          options={regionOptions}
          placeholder={regionPlaceholder}
          value={values.region}
        />
        <FormField
          autoComplete="tel"
          inputMode="numeric"
          label={copy.profile.labels.phone}
          onChange={(value) =>
            onUpdate("phone", formatContactPhoneNumber(value))
          }
          placeholder={copy.profile.placeholders.phone}
          value={values.phone}
        />
      </div>

      <label className="mt-6 flex items-start gap-3 text-[13px] font-normal leading-6 text-[#333330]">
        <input
          checked={values.marketingAgreement}
          className="mt-1 h-4 w-4 shrink-0 accent-[#111111]"
          onChange={(event) =>
            onUpdate("marketingAgreement", event.target.checked)
          }
          type="checkbox"
        />
        <span>{copy.profile.marketingAgreement}</span>
      </label>

      <PrimaryButton
        className="mt-10"
        disabled={isNextDisabled}
        label={copy.next}
        type="submit"
      />
    </form>
  );
}

function ContextStep({
  copy,
  email,
  errorMessage,
  values,
  onSubmit,
  onUpdate,
}: {
  readonly copy: ContactFlowCopy;
  readonly email: string;
  readonly errorMessage: string;
  readonly values: ContactFormValues;
  readonly onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  readonly onUpdate: <TField extends keyof ContactFormValues>(
    field: TField,
    value: ContactFormValues[TField]
  ) => void;
}) {
  const isSubmitDisabled = !values.plan.trim() || !values.source.trim();

  return (
    <form className="min-w-0 w-full max-w-[508px]" onSubmit={onSubmit}>
      <h1 className="break-keep text-[35px] font-normal leading-[1.12] tracking-normal text-[#050505]">
        {copy.context.title}
      </h1>
      <p className="mt-5 max-w-[500px] break-keep text-[15px] font-normal leading-7 text-[#333330]">
        {copy.context.descriptionPrefix}
        <strong className="break-all font-normal text-[#050505]">
          {email}
        </strong>
        {copy.context.descriptionSuffix}
      </p>

      <FieldError message={errorMessage} />

      <label className="mt-8 grid gap-2 text-[13px] font-normal text-[#111111]">
        {copy.context.planLabel}
        <textarea
          className="min-h-[174px] resize-y rounded-[6px] border border-[#dededa] bg-white px-3 py-3 text-[15px] font-normal leading-6 text-[#111111] outline-none transition-colors placeholder:text-[#aaa9a3] focus:border-[#2383e2]"
          onChange={(event) => onUpdate("plan", event.target.value)}
          placeholder={copy.context.planPlaceholder}
          value={values.plan}
        />
      </label>

      <SelectField
        label={copy.context.sourceLabel}
        onChange={(value) => onUpdate("source", value)}
        options={copy.context.sourceOptions}
        placeholder={copy.context.sourcePlaceholder}
        value={values.source}
      />

      <PrimaryButton
        className="mt-10"
        disabled={isSubmitDisabled}
        label={copy.submit}
        type="submit"
      />
    </form>
  );
}

function ContactDone({
  copy,
  email,
  homePath,
  sizeLabel,
}: {
  readonly copy: ContactFlowCopy;
  readonly email: string;
  readonly homePath: string;
  readonly sizeLabel: string;
}) {
  return (
    <section
      className="min-w-0 w-full max-w-[508px]"
      aria-labelledby="contact-done-title"
    >
      <div className="grid h-11 w-11 place-items-center rounded-full bg-[#4880EE] text-white">
        <Check className="h-5 w-5" />
      </div>
      <h1
        className="mt-8 break-keep text-[35px] font-normal leading-[1.12] tracking-normal text-[#050505]"
        id="contact-done-title"
      >
        {copy.done.title}
      </h1>
      <p className="mt-5 max-w-[500px] break-keep text-[15px] font-normal leading-7 text-[#333330]">
        {copy.done.description}
      </p>

      <div className="mt-9 grid gap-3 rounded-[8px] border border-[#dededa] bg-[#FAFAF8] p-4 text-[13px] font-normal text-[#333330]">
        <p className="min-w-0">
          <span className="text-[#777770]">{copy.done.emailLabel} : </span>
          <span className="break-all text-[#333330]">{email}</span>
        </p>
        <p>
          <span className="text-[#777770]">{copy.done.sizeLabel} : </span>
          {sizeLabel}
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          className="inline-flex h-10 items-center justify-center rounded-[6px] bg-[#4880EE] px-4 text-[14px] font-normal text-white transition-colors hover:bg-[#336FE0]"
          to={homePath}
        >
          {copy.home}
        </Link>
      </div>
    </section>
  );
}

function FormField({
  autoComplete,
  inputMode,
  label,
  placeholder,
  value,
  onChange,
}: {
  readonly autoComplete: string;
  readonly inputMode?: "numeric";
  readonly label: string;
  readonly placeholder: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-[13px] font-normal text-[#111111]">
      {label}
      <input
        autoComplete={autoComplete}
        className="h-10 rounded-[6px] border border-[#dededa] bg-transparent px-3 text-[15px] font-normal text-[#111111] outline-none transition-colors placeholder:text-[#aaa9a3] focus:border-[#dededa] [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_white] [&:-webkit-autofill]:[-webkit-text-fill-color:#111111]"
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}

function RegionSelectField({
  label,
  options,
  placeholder,
  value,
  onChange,
}: {
  readonly label: string;
  readonly options: readonly ContactOption[];
  readonly placeholder: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    const closeRegionMenu = () => {
      detailsRef.current?.removeAttribute("open");
    };

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (target instanceof Node && !detailsRef.current?.contains(target)) {
        closeRegionMenu();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeRegionMenu();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div className="grid gap-2 text-[13px] font-normal text-[#111111]">
      <span>{label}</span>
      <details className="group relative" ref={detailsRef}>
        <summary
          className="flex h-10 cursor-pointer list-none items-center rounded-[6px] border border-[#dededa] bg-transparent px-3 text-[15px] font-normal outline-none transition-colors focus:border-[#dededa] [&::-webkit-details-marker]:hidden"
          aria-label={label}
        >
          <span
            className={selectedOption ? "text-[#111111]" : "text-[#aaa9a3]"}
          >
            {selectedOption?.label ?? placeholder}
          </span>
          <ChevronDown className="ml-auto h-4 w-4 text-[#777770] transition-transform group-open:rotate-180" />
        </summary>

        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 grid gap-1 rounded-[8px] bg-white p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.14)]">
          {options.map((option) => (
            <button
              className={[
                "min-h-9 rounded-[6px] px-3 py-1.5 text-left text-[13px] font-normal transition-colors hover:bg-[#F2F2EF] hover:text-[#111111]",
                option.value === value
                  ? "bg-[#F2F2EF] text-[#111111]"
                  : "text-[#333330]",
              ].join(" ")}
              key={option.value}
              onClick={() => {
                onChange(option.value);
                detailsRef.current?.removeAttribute("open");
              }}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      </details>
    </div>
  );
}

function SelectField({
  label,
  options,
  placeholder,
  value,
  onChange,
}: {
  readonly label: string;
  readonly options: readonly ContactOption[];
  readonly placeholder: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
}) {
  return (
    <label className="mt-6 grid gap-2 text-[13px] font-normal text-[#111111]">
      {label}
      <span className="relative block">
        <select
          className="h-10 w-full appearance-none rounded-[6px] border border-[#dededa] bg-white px-3 pr-9 text-[14px] font-normal text-[#333330] outline-none transition-colors focus:border-[#2383e2]"
          onChange={(event) => onChange(event.target.value)}
          value={value}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777770]" />
      </span>
    </label>
  );
}

function PrimaryButton({
  className = "",
  disabled = false,
  label,
  type,
}: {
  readonly className?: string;
  readonly disabled?: boolean;
  readonly label: string;
  readonly type: "button" | "submit";
}) {
  return (
    <button
      className={[
        "inline-flex h-12 w-full items-center justify-center gap-2 rounded-[6px] px-5 text-[15px] font-normal text-white transition-colors",
        disabled
          ? "cursor-not-allowed bg-[#4880EE] opacity-45 hover:bg-[#4880EE]"
          : "bg-[#4880EE] hover:bg-[#336FE0]",
        className,
      ].join(" ")}
      disabled={disabled}
      type={type}
    >
      {label}
      <ArrowRight className="h-4 w-4" />
    </button>
  );
}

function FieldError({ message }: { readonly message: string }) {
  if (!message) return null;

  return (
    <p className="mt-3 text-[13px] font-normal text-[#ff3636]" role="alert">
      {message}
    </p>
  );
}

function ContactIllustration({
  step,
}: {
  readonly step: ContactStepId | "done";
}) {
  const isSize = step === "size";
  const isContext = step === "context" || step === "done";

  return (
    <div
      aria-hidden="true"
      className="hidden min-h-[360px] items-center justify-center lg:flex"
    >
      <svg
        className="h-auto w-full max-w-[430px]"
        fill="none"
        viewBox="0 0 430 330"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M102 228c34 31 140 36 220 8"
          stroke="#050505"
          strokeLinecap="round"
          strokeWidth="18"
        />
        <path
          d="M112 103c35-38 100-48 154-18 58 33 81 101 50 145-32 45-119 50-174 15-49-31-61-94-30-142Z"
          fill="#2383e2"
          stroke="#050505"
          strokeWidth="7"
        />
        <path
          d="M130 134h128M118 169h172M142 204h120"
          stroke="#ffffff"
          strokeLinecap="round"
          strokeWidth="7"
        />

        {isSize ? (
          <>
            <path
              d="M183 72h60v60h-60z"
              fill="#fff"
              stroke="#050505"
              strokeWidth="7"
            />
            <path
              d="M243 72c24 0 43 19 43 43h-43V72Z"
              fill="#2383e2"
              stroke="#050505"
              strokeWidth="7"
            />
            <path
              d="M183 132c-24 0-43-19-43-43h43v43Z"
              fill="#2383e2"
              stroke="#050505"
              strokeWidth="7"
            />
            <path
              d="M241 132c0 23-19 42-42 42v-42h42Z"
              fill="#fff"
              stroke="#050505"
              strokeWidth="7"
            />
          </>
        ) : isContext ? (
          <>
            <path
              d="M150 224V123l38-24 35 24v101"
              fill="#ffffff"
              stroke="#050505"
              strokeLinejoin="round"
              strokeWidth="7"
            />
            <path
              d="M223 224V91l44-43 45 43v133"
              fill="#2383e2"
              stroke="#050505"
              strokeLinejoin="round"
              strokeWidth="7"
            />
            <path
              d="M130 224V144l20-13v93M312 224V117l38 22v85"
              stroke="#050505"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="7"
            />
            <path
              d="M245 111h19M245 139h19M245 167h19M337 151v49"
              stroke="#ffffff"
              strokeLinecap="round"
              strokeWidth="6"
            />
            <path
              d="M292 68 345 16M330 18l15-2-2 16"
              stroke="#050505"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="7"
            />
          </>
        ) : (
          <>
            <path
              d="M153 86 226 51l74 35v85l-74 37-73-37V86Z"
              fill="#fff"
              stroke="#050505"
              strokeLinejoin="round"
              strokeWidth="7"
            />
            <path
              d="m153 88 73 35 74-35M226 123v84"
              stroke="#050505"
              strokeLinejoin="round"
              strokeWidth="7"
            />
            <path
              d="M184 132h84v55h-84z"
              fill="#2383e2"
              stroke="#050505"
              strokeLinejoin="round"
              strokeWidth="7"
            />
            <path
              d="M206 160h40"
              stroke="#fff"
              strokeLinecap="round"
              strokeWidth="7"
            />
          </>
        )}
      </svg>
    </div>
  );
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function formatContactPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function isProfileComplete(values: ContactFormValues) {
  return Boolean(
    values.firstName.trim() &&
      values.lastName.trim() &&
      values.company.trim() &&
      values.title.trim() &&
      values.region.trim() &&
      values.phone.trim()
  );
}
