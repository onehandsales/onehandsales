import { cn } from "@/utils/cn";

type SidebarNavProps = {
  readonly className?: string;
};

export function SidebarNav({ className }: SidebarNavProps) {
  return (
    <nav
      aria-label="Workspace navigation"
      className={cn("flex flex-col gap-3", className)}
    />
  );
}
