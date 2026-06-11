import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DealDetailScreen } from "@/features/deal";
import { MobileDealDetailPage } from "@/features/deal-redesign";

export function DealDetailPage() {
  const { dealId } = useParams();
  const isDesktop = useIsDesktopViewport();

  if (isDesktop) {
    return <DealDetailScreen dealId={dealId ?? ""} />;
  }

  return <MobileDealDetailPage dealId={dealId ?? ""} />;
}

function useIsDesktopViewport() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window === "undefined"
      ? false
      : window.matchMedia("(min-width: 768px)").matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const onChange = () => setIsDesktop(mediaQuery.matches);

    onChange();
    mediaQuery.addEventListener("change", onChange);

    return () => mediaQuery.removeEventListener("change", onChange);
  }, []);

  return isDesktop;
}
