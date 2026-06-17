import { cn } from "@/lib/utils";

export function Marquee({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const unit = `${text}\u00A0\u00A0\u271F\u00A0\u00A0`;
  return (
    <div className={cn("relative flex w-full overflow-hidden", className)}>
      <div className="animate-marquee flex shrink-0">
        <span className="whitespace-nowrap font-display uppercase">{unit.repeat(8)}</span>
        <span className="whitespace-nowrap font-display uppercase" aria-hidden>
          {unit.repeat(8)}
        </span>
      </div>
    </div>
  );
}

export default Marquee;
