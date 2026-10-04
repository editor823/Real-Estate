import { STAGES } from "@/lib/constants/stages";
import { cn } from "@/lib/utils";

interface StageBadgeProps {
  stageCode: string;
  className?: string;
  showDot?: boolean;
}

export function StageBadge({ stageCode, className, showDot = true }: StageBadgeProps) {
  const stage = STAGES[stageCode] || {
    name: stageCode || "미지정",
    bgClass: "bg-slate-200",
    textClass: "text-slate-800",
    hex: "#94A3B8",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-xs transition-all",
        stage.bgClass,
        stage.textClass,
        className
      )}
    >
      {showDot && (
        <span
          className="w-1.5 h-1.5 rounded-full bg-current opacity-80"
          aria-hidden="true"
        />
      )}
      {stage.name}
    </span>
  );
}
