import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ACTION_TYPES, CATEGORIES } from "@/lib/constants";
import type { ActionType, CategoryId } from "@/lib/types";

export function CategoryBadge({
  category,
  className,
}: {
  category: CategoryId;
  className?: string;
}) {
  const config = CATEGORIES[category];
  return (
    <Badge variant="secondary" className={cn("gap-1", className)}>
      <span aria-hidden>{config.emoji}</span>
      {config.label}
    </Badge>
  );
}

export function ActionTypeBadge({
  type,
  className,
}: {
  type: ActionType;
  className?: string;
}) {
  const config = ACTION_TYPES[type];
  return (
    <Badge
      variant="outline"
      className={cn("gap-1 border-primary/30 text-primary", className)}
    >
      <span aria-hidden>{config.emoji}</span>
      {config.label}
    </Badge>
  );
}

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs text-muted-foreground">#{children}</span>
  );
}
