import { Handle, Position, NodeProps } from "@xyflow/react";
import { Building2 } from "lucide-react";

export type PersonData = { name: string; image?: string | null; role?: string | null; agency?: string | null; memberId?: string; color?: string };
export type UnitData = { label: string; color?: string };

// Handles on all four sides; ConnectionMode.Loose lets any handle start or end a line.
const Handles = ({ cls }: { cls?: string }) => (
  <>
    <Handle id="t" type="source" position={Position.Top} className={cls} />
    <Handle id="r" type="source" position={Position.Right} className={cls} />
    <Handle id="b" type="source" position={Position.Bottom} className={cls} />
    <Handle id="l" type="source" position={Position.Left} className={cls} />
  </>
);

export const PersonNode = ({ data, selected }: NodeProps) => {
  const d = data as PersonData;
  return (
    <div
      className={`w-56 rounded-2xl bg-card border shadow-md px-3 py-3 flex items-center gap-3 ${selected ? "ring-2 ring-primary" : ""}`}
      style={d.color ? { borderColor: d.color, borderWidth: 2, backgroundColor: `${d.color}1f` } : undefined}
    >
      <Handles cls="!bg-primary" />
      {d.image ? (
        <img src={d.image} alt={d.name} crossOrigin="anonymous" className="h-12 w-12 rounded-full object-cover shrink-0" />
      ) : (
        <div className="h-12 w-12 rounded-full bg-muted shrink-0 flex items-center justify-center text-sm font-semibold text-primary">
          {d.name.split(" ").map(s => s[0]).join("").slice(0, 2)}
        </div>
      )}
      <div className="min-w-0">
        <p className="font-semibold text-sm text-foreground truncate">{d.name}</p>
        {d.role && <p className="text-xs text-muted-foreground truncate">{d.role}</p>}
        {d.agency && <p className="text-[11px] text-primary/80 truncate">{d.agency}</p>}
      </div>
    </div>
  );
};

export const UnitNode = ({ data, selected }: NodeProps) => {
  const d = data as UnitData;
  return (
    <div
      className={`min-w-44 rounded-2xl bg-primary text-primary-foreground shadow-md px-4 py-3 flex items-center gap-2 ${selected ? "ring-2 ring-accent" : ""}`}
      style={d.color ? { backgroundColor: d.color } : undefined}
    >
      <Handles />
      <Building2 className="h-4 w-4" />
      <span className="font-semibold text-sm">{d.label}</span>
    </div>
  );
};

export const nodeTypes = { person: PersonNode, unit: UnitNode };
