import { forwardRef } from "react";
import type { LucideIcon, LucideProps } from "lucide-react";

export const DataUploadIcon = forwardRef<SVGSVGElement, LucideProps>(
  (
    {
      absoluteStrokeWidth: _absoluteStrokeWidth,
      children,
      color = "currentColor",
      size = 24,
      strokeWidth = 2,
      ...props
    },
    ref
  ) => (
    <svg
      ref={ref}
      fill="none"
      height={size}
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8" />
      <path d="M14 2v6h6" />
      <path d="M20 8v3" />
      <path d="m8 12 5 5" />
      <path d="m13 12-5 5" />
      <path d="M18 22v-8" />
      <path d="m15 17 3-3 3 3" />
      {children}
    </svg>
  )
) as LucideIcon;

DataUploadIcon.displayName = "DataUploadIcon";
