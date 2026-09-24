import type { ComponentType, SVGProps } from "react";
import { Card } from "@/components/ui/card";

interface StatTileProps {
  label: string;
  value: string;
  unit?: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export function StatTile({ label, value, unit, icon: Icon }: StatTileProps) {
  return (
    <Card className="gap-0 p-4">
      <div className="text-muted-foreground flex items-center gap-1.5 text-[0.68rem] font-medium tracking-wider uppercase">
        <Icon className="size-3.5" aria-hidden />
        {label}
      </div>
      <div className="tabular mt-2 font-mono text-2xl leading-none font-medium">
        {value}
        {unit ? (
          <span className="text-muted-foreground ml-1 text-xs font-normal">{unit}</span>
        ) : null}
      </div>
    </Card>
  );
}
