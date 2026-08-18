import { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const DecisionNode = memo(({ data, isConnectable, id }: NodeProps) => {
  return (
    <Card className="w-[300px] shadow-lg border-2 border-zinc-800 bg-zinc-950 text-zinc-50">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-zinc-400"
      />
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          AI Decision Node
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="flex flex-col gap-2">
          <label htmlFor={`prompt-${id}`} className="text-xs text-zinc-400">
            Prompt
          </label>
          <Textarea
            id={`prompt-${id}`}
            className="resize-none h-24 text-sm bg-zinc-900 border-zinc-800"
            placeholder="e.g. Is this a support request?"
            defaultValue={(data?.prompt as string) || ""}
            onChange={(e) => {
              if (data.onChange) {
                // @ts-ignore - calling custom onChange handler
                data.onChange(id, e.target.value);
              }
            }}
          />
        </div>
      </CardContent>

      {/* YES Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="yes"
        style={{ left: "25%", background: "#22c55e", width: "12px", height: "12px" }}
        isConnectable={isConnectable}
      />
      <div className="absolute bottom-[-20px] left-[25%] -translate-x-1/2 text-[10px] font-bold text-green-500">
        YES
      </div>

      {/* NO Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="no"
        style={{ left: "75%", background: "#ef4444", width: "12px", height: "12px" }}
        isConnectable={isConnectable}
      />
      <div className="absolute bottom-[-20px] left-[75%] -translate-x-1/2 text-[10px] font-bold text-red-500">
        NO
      </div>
    </Card>
  );
});

DecisionNode.displayName = "DecisionNode";
