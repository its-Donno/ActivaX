import Link from "next/link";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-[10px] bg-primary text-primary-foreground shadow-sm",
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none">
        <path
          d="M12 3.5 19 20h-3.4l-1.5-3.6H9.9L8.4 20H5L12 3.5Zm0 5.1-1.5 4h3l-1.5-4Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

export function Brand({
  href = "/home",
  showWordmark = true,
  className,
}: {
  href?: string;
  showWordmark?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2.5", className)}
      aria-label="Activa home"
    >
      <BrandMark />
      {showWordmark && (
        <span className="text-lg font-semibold tracking-tight">Activa</span>
      )}
    </Link>
  );
}
