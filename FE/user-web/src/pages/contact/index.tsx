import { Check, ChevronDown, Quote } from "lucide-react";
import { PublicSitePageShell } from "@/features/public-site/components/public-site-page-shell";
import { publicSiteImages } from "@/features/public-site/constants/public-site-assets";
import { usePublicSiteLanguage } from "@/features/public-site/i18n/public-site-language";

const testimonialImages = [
  publicSiteImages.whiteboardPlanning,
  publicSiteImages.teamPresentation,
  publicSiteImages.salesConversation,
];

export function ContactPage() {
  const { copy } = usePublicSiteLanguage();
  const contact = copy.contact;

  return (
    <PublicSitePageShell>
      <section className="px-4 pb-16 pt-16 md:px-6 md:pb-24 md:pt-20 lg:px-8">
        <div className="mx-auto grid max-w-[1320px] gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <h1 className="break-keep text-[42px] font-black leading-[0.98] tracking-normal md:text-[56px]">
              <span className="block">{contact.title[0]}</span>
              <span className="block">{contact.title[1]}</span>
            </h1>
            <p className="mt-5 max-w-[560px] text-[18px] leading-8 text-[#333330]">
              {contact.description}
            </p>

            <div className="mt-10">
              <p className="text-[13px] font-bold text-[#777770]">
                {contact.trustedLabel}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-6 text-[22px] font-black text-[#555550]">
                {contact.companies.map((name) => (
                  <span key={name}>{name}</span>
                ))}
              </div>
            </div>

            <div className="mt-10 max-w-[560px] rounded-[12px] bg-[#f7f7f5] p-8">
              <img
                alt="고객과 노트북으로 영업 자료를 확인하는 모습"
                className="-mx-2 mb-6 h-40 w-[calc(100%+16px)] rounded-[8px] object-cover"
                decoding="async"
                loading="eager"
                referrerPolicy="no-referrer"
                src={publicSiteImages.salesConversation}
              />
              <p className="text-[32px] font-black">{contact.quoteCompany}</p>
              <Quote className="mt-6 h-6 w-6 text-[#777770]" />
              <p className="mt-4 text-[18px] leading-8 text-[#222220]">
                “{contact.quote}”
              </p>
              <p className="mt-8 text-[13px] font-black">{contact.quotePerson}</p>
              <p className="mt-1 text-[12px] text-[#777770]">{contact.quoteRole}</p>
            </div>
          </div>

          <ContactForm />
        </div>
      </section>

      <section className="px-4 pb-20 md:px-6 md:pb-28 lg:px-8">
        <div className="mx-auto grid max-w-[1320px] gap-6 md:grid-cols-3">
          {contact.testimonials.map((item, index) => (
            <article className="overflow-hidden rounded-[12px] bg-[#f7f7f5]" key={item.company}>
              <img
                alt={`${item.company} 업무 이미지`}
                className="h-36 w-full object-cover"
                decoding="async"
                loading="eager"
                referrerPolicy="no-referrer"
                src={testimonialImages[index] ?? publicSiteImages.salesConversation}
              />
              <div className="p-8">
                <p className="text-[24px] font-black">{item.company}</p>
                <p className="mt-8 text-[18px] leading-8 text-[#222220]">“{item.quote}”</p>
                <p className="mt-10 text-[13px] font-black">{item.person}</p>
                <p className="mt-1 text-[12px] text-[#777770]">{item.role}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PublicSitePageShell>
  );
}

function ContactForm() {
  const { copy } = usePublicSiteLanguage();
  const contact = copy.contact;

  return (
    <form className="grid gap-5">
      <div className="grid gap-5 md:grid-cols-2">
        <FormField label={contact.labels.firstName} placeholder={contact.placeholders.firstName} />
        <FormField label={contact.labels.lastName} placeholder={contact.placeholders.lastName} />
        <FormField label={contact.labels.email} placeholder={contact.placeholders.email} />
        <FormField label={contact.labels.title} placeholder={contact.placeholders.title} />
        <FormField label={contact.labels.company} placeholder={contact.placeholders.company} />
        <SelectField label={contact.labels.companySize} placeholder={contact.placeholders.companySize} />
        <SelectField label={contact.labels.region} placeholder={contact.placeholders.region} />
        <FormField label={contact.labels.phone} placeholder={contact.placeholders.phone} />
      </div>

      <SelectField label={contact.labels.reason} placeholder={contact.placeholders.reason} />

      <label className="grid gap-2 text-[13px] font-bold text-[#333330]">
        {contact.labels.detail}
        <textarea
          className="min-h-[112px] resize-y rounded-[6px] border border-[#dededa] bg-white px-3 py-3 text-[14px] font-medium outline-none placeholder:text-[#aaa9a3] focus:border-[#111111]"
          placeholder={contact.placeholders.detail}
        />
      </label>

      <label className="flex items-start gap-3 text-[13px] leading-6 text-[#333330]">
        <span className="mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-[4px] bg-[#111111] text-white">
          <Check className="h-3 w-3" />
        </span>
        {contact.marketingAgreement}
      </label>

      <div>
        <button
          className="h-10 rounded-[6px] bg-[#111111] px-5 text-[14px] font-bold text-white hover:bg-[#333330]"
          type="button"
        >
          {contact.submit}
        </button>
      </div>

      <p className="max-w-[560px] text-[12px] leading-6 text-[#777770]">
        {contact.finePrint}
      </p>

      <p className="max-w-[560px] text-[13px] leading-6 text-[#777770]">
        {contact.supportPrefix}{" "}
        <a className="font-bold text-[#0077e6]" href="mailto:team@onehandsales.com">
          Onehand team
        </a>
        {contact.supportSuffix}
      </p>
    </form>
  );
}

function FormField({
  label,
  placeholder,
}: {
  readonly label: string;
  readonly placeholder: string;
}) {
  return (
    <label className="grid gap-2 text-[13px] font-bold text-[#333330]">
      {label}
      <input
        className="h-10 rounded-[6px] border border-[#dededa] bg-white px-3 text-[14px] font-medium outline-none placeholder:text-[#aaa9a3] focus:border-[#111111]"
        placeholder={placeholder}
      />
    </label>
  );
}

function SelectField({
  label,
  placeholder,
}: {
  readonly label: string;
  readonly placeholder: string;
}) {
  return (
    <label className="grid gap-2 text-[13px] font-bold text-[#333330]">
      {label}
      <span className="flex h-10 items-center rounded-[6px] border border-[#dededa] bg-white px-3 text-[14px] font-medium text-[#777770]">
        {placeholder}
        <ChevronDown className="ml-auto h-4 w-4 text-[#999993]" />
      </span>
    </label>
  );
}
