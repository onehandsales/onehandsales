import { Search } from "lucide-react";
import type { FormEvent } from "react";
import { cn } from "@/utils/cn";

type SearchInputProps = {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  readonly placeholder?: string;
  readonly className?: string;
};

// 기능 : 목록 화면 검색 입력 컴포넌트입니다.
export function SearchInput({
  value,
  onChange,
  onSubmit,
  placeholder = "검색",
  className,
}: SearchInputProps) {
  const input = (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        className="h-10 w-full rounded-md border pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </div>
  );

  if (onSubmit) {
    return (
      <form onSubmit={onSubmit}>
        {input}
      </form>
    );
  }

  return input;
}
