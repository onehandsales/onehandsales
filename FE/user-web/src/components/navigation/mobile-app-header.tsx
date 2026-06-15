import { GlobalSearch } from "@/features/search";

type MobileAppHeaderProps = {
  readonly title: string;
};

export function MobileAppHeader({ title }: MobileAppHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white px-4 pb-3 pt-3 md:hidden">
      <div className="flex min-h-[56px] items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            onehand.sales
          </p>
          <h1 className="mt-0.5 text-xl font-semibold tracking-[-0.03em] text-foreground">
            {title}
          </h1>
        </div>
      </div>
      <div className="mt-2.5">
        <GlobalSearch />
      </div>
    </header>
  );
}
