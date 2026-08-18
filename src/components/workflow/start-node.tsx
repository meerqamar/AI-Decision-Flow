import { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Play } from "lucide-react";

export const StartNode = memo(({ isConnectable }: NodeProps) => {
  return (
    <Card className="w-[150px] shadow-lg border-2 border-green-800 bg-zinc-950 text-zinc-50 rounded-full">
      <CardHeader className="p-3">
        <CardTitle className="text-sm font-semibold flex items-center justify-center gap-2 text-green-500">
          <Play size={16} />
          START
        </CardTitle>
      </CardHeader>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-green-500"
      />
    </Card>
  );
});

StartNode.displayName = "StartNode";
