import { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Flag } from "lucide-react";

export const ResultNode = memo(({ data, isConnectable }: NodeProps) => {
  return (
    <Card className="w-[150px] shadow-lg border-2 border-indigo-800 bg-zinc-950 text-zinc-50 rounded-full">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-indigo-500"
      />
      <CardHeader className="p-3">
        <CardTitle className="text-sm font-semibold flex items-center justify-center gap-2 text-indigo-400 text-center leading-tight">
          <Flag size={16} />
          {data?.label ? String(data.label) : "Result"}
        </CardTitle>
      </CardHeader>
    </Card>
  );
});

ResultNode.displayName = "ResultNode";
