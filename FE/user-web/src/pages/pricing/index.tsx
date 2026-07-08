import { Check, CircleHelp, Sparkles } from "lucide-react";
import { Fragment } from "react";
import { PublicSitePageShell } from "@/features/public-site/components/public-site-page-shell";
import { publicSiteImages } from "@/features/public-site/constants/public-site-assets";
import { usePublicSiteLanguage } from "@/features/public-site/i18n/public-site-language";

export function PricingPage() {
  const { copy } = usePublicSiteLanguage();
  const pricing = copy.pricing;

  return (
    <PublicSitePageShell>
      <section className="bg-white pb-16 pt-16 md:pb-24 md:pt-20">
        <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-[38px] font-black leading-[1.05] tracking-normal md:text-[58px]">
              {pricing.title}
            </h1>
            <p className="mx-auto mt-4 max-w-[620px] text-[15px] leading-7 text-[#666661]">
              {pricing.description}
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-5 text-[13px] font-bold text-[#555550]">
              {pricing.tags.map((item) => (
                <span className="inline-flex items-center gap-2" key={item}>
                  <span className="h-1 w-1 rounded-full bg-[#c8c8c2]" />
                  {item}
                </span>
              ))}
            </div>
            <div className="mx-auto mt-8 grid max-w-[1040px] gap-3 overflow-hidden rounded-[10px] border border-[#eeeeec] bg-white p-2 shadow-sm md:grid-cols-3">
              {[
                {
                  alt: pricing.mediaAlts[0],
                  src: publicSiteImages.salesConversation,
                  title: pricing.mediaCaptions[0],
                },
                {
                  alt: pricing.mediaAlts[1],
                  src: publicSiteImages.whiteboardPlanning,
                  title: pricing.mediaCaptions[1],
                },
                {
                  alt: pricing.mediaAlts[2],
                  src: publicSiteImages.teamPresentation,
                  title: pricing.mediaCaptions[2],
                },
              ].map((image) => (
                <figure className="relative h-28 overflow-hidden rounded-[8px]" key={image.title}>
                  <img
                    alt={image.alt}
                    className="h-full w-full object-cover"
                    decoding="async"
                    loading="eager"
                    referrerPolicy="no-referrer"
                    src={image.src}
                  />
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 pb-2 pt-8 text-left text-[12px] font-black text-white">
                    {image.title}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="rounded-[10px] border border-[#eeeeec] bg-white p-4 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#eeeeec] pb-4">
                <div className="inline-flex rounded-full bg-[#f1f1ef] p-1 text-[12px] font-bold">
                  <span className="rounded-full bg-white px-3 py-1 shadow-sm">{pricing.billingMonthly}</span>
                  <span className="px-3 py-1 text-[#777770]">{pricing.billingAnnual}</span>
                </div>
                <span className="text-[12px] font-bold text-[#777770]">{pricing.currency}</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {pricing.plans.map((plan, planIndex) => (
                  <article
                    className={[
                      "rounded-[8px] border p-4",
                      planIndex === 2 ? "border-[#0077e6] bg-[#eef6ff]" : "border-[#eeeeec] bg-white",
                    ].join(" ")}
                    key={plan.name}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-[18px] font-black">{plan.name}</h2>
                        <p className="mt-1 min-h-[40px] text-[12px] leading-5 text-[#666661]">
                          {plan.description}
                        </p>
                      </div>
                      {planIndex === 2 ? (
                        <span className="rounded-full bg-[#0077e6] px-2 py-1 text-[11px] font-bold text-white">
                          {pricing.recommended}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-5 text-[26px] font-black">
                      {pricing.priceLabels[planIndex]}
                      {pricing.priceLabels[planIndex] ? (
                        <span className="ml-1 text-[12px] font-bold text-[#777770]">
                          {pricing.pricePeriod}
                        </span>
                      ) : null}
                    </p>
                    <button
                      className={[
                        "mt-4 h-9 w-full rounded-[6px] text-[13px] font-bold",
                        planIndex === 2
                          ? "bg-[#0077e6] text-white hover:bg-[#006bd1]"
                          : "bg-[#f1f1ef] text-[#222220] hover:bg-[#e8e8e4]",
                      ].join(" ")}
                      type="button"
                    >
                      {plan.cta}
                    </button>
                    <ul className="mt-4 grid gap-2 text-[12px] text-[#333330]">
                      {plan.features.map((feature) => (
                        <li className="flex items-start gap-2" key={feature}>
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#159447]" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>

            <aside className="rounded-[10px] bg-[#eef6ff] p-5">
              <img
                alt={pricing.aiImageAlt}
                className="mb-5 h-44 w-full rounded-[8px] object-cover"
                decoding="async"
                loading="eager"
                referrerPolicy="no-referrer"
                src={publicSiteImages.teamPresentation}
              />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[12px] font-bold text-[#0077e6]">{pricing.aiLabel}</p>
                  <h2 className="mt-2 text-[28px] font-black leading-tight">
                    {pricing.aiTitle}
                  </h2>
                </div>
                <div className="flex -space-x-2">
                  {pricing.aiAvatarLabels.map((item) => (
                    <span
                      className="grid h-10 w-10 place-items-center rounded-full border-2 border-white bg-[#111111] text-[11px] font-black text-white"
                      key={item}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <p className="mt-4 text-[13px] leading-6 text-[#555550]">
                {pricing.aiDescription}
              </p>
              <button className="mt-5 h-9 rounded-[6px] bg-[#0077e6] px-4 text-[13px] font-bold text-white" type="button">
                {pricing.aiCta}
              </button>
              <div className="mt-8 rounded-[8px] bg-white p-4">
                <Sparkles className="h-5 w-5 text-[#0077e6]" />
                <p className="mt-3 text-[13px] font-black">{pricing.setupTitle}</p>
                <p className="mt-2 text-[12px] leading-5 text-[#666661]">
                  {pricing.setupDescription}
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="bg-white pb-16 md:pb-24">
        <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <h2 className="text-[34px] font-black md:text-[46px]">{pricing.featuresTitle}</h2>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-b border-[#dededa]">
                  <th className="w-[32%] py-3 text-[12px] text-[#777770]">{pricing.featureColumn}</th>
                  {pricing.plans.map((plan) => (
                    <th className="py-3 text-center text-[12px] font-black" key={plan.name}>
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pricing.comparisonGroups.map((group) => (
                  <Fragment key={group.title}>
                    <tr>
                      <td className="pb-2 pt-10 text-[12px] font-black text-[#777770]" colSpan={5}>
                        {group.title}
                      </td>
                    </tr>
                    {group.rows.map((row) => (
                      <tr className="border-b border-[#eeeeec]" key={`${group.title}-${row[0]}`}>
                        {row.map((cell, index) => (
                          <td
                            className={[
                              "py-3",
                              index === 0 ? "font-semibold text-[#333330]" : "text-center text-[#555550]",
                            ].join(" ")}
                            key={`${row[0]}-${index}`}
                          >
                            {pricing.includedValues.includes(cell) ? (
                              <Check className="mx-auto h-4 w-4 text-[#159447]" />
                            ) : (
                              cell || pricing.emptyCell
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="bg-white pb-20 md:pb-28">
        <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <h2 className="text-[34px] font-black md:text-[46px]">{pricing.faqTitle}</h2>
          <div className="mt-8 divide-y divide-[#eeeeec] border-y border-[#eeeeec]">
            {pricing.faqs.map((faq) => (
              <button
                className="flex w-full items-center justify-between gap-6 py-4 text-left text-[14px] font-bold"
                key={faq}
                type="button"
              >
                {faq}
                <CircleHelp className="h-4 w-4 shrink-0 text-[#777770]" />
              </button>
            ))}
          </div>
        </div>
      </section>
    </PublicSitePageShell>
  );
}
