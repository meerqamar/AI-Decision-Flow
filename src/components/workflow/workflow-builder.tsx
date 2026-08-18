"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { DecisionNode } from "./decision-node";
import { StartNode } from "./start-node";
import { ResultNode } from "./result-node";
import { Button } from "@/components/ui/button";
import { Plus, Play, Trash2, Download, Upload, Activity, Loader2 } from "lucide-react";

const nodeTypes = {
  decision: DecisionNode,
  start: StartNode,
  result: ResultNode,
};

const initialNodes: Node[] = [
  {
    id: "start",
    type: "start",
    position: { x: 400, y: 50 },
    data: {},
  },
];

export function WorkflowBuilder() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Execution State
  const [executionId, setExecutionId] = useState<string | null>(null);
  const [executionStatus, setExecutionStatus] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [visitedNodes, setVisitedNodes] = useState<string[]>([]);
  const [visitedEdges, setVisitedEdges] = useState<string[]>([]);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedNodes = localStorage.getItem("workflow-nodes");
    const savedEdges = localStorage.getItem("workflow-edges");
    if (savedNodes) setNodes(JSON.parse(savedNodes));
    if (savedEdges) setEdges(JSON.parse(savedEdges));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("workflow-nodes", JSON.stringify(nodes));
      localStorage.setItem("workflow-edges", JSON.stringify(edges));
    }
  }, [nodes, edges, isLoaded]);

  // Polling logic
  useEffect(() => {
    if (!executionId || executionStatus === "COMPLETED" || executionStatus === "ERROR") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/workflow/status/${executionId}`);
        if (res.ok) {
          const data = await res.json();
          setExecutionStatus(data.status);
          setLogs(data.logs || []);
          setVisitedNodes(data.visitedNodes || []);
          setVisitedEdges(data.visitedEdges || []);
          setCurrentNodeId(data.currentNodeId);
        }
      } catch (err) {
        console.error("Failed to fetch status:", err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [executionId, executionStatus]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => {
      const color = params.sourceHandle === "yes" ? "#22c55e" : params.sourceHandle === "no" ? "#ef4444" : "#a1a1aa";
      
      const newEdge = {
        ...params,
        type: "smoothstep",
        animated: false,
        style: { stroke: color, strokeWidth: 2 },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    []
  );

  const onNodeDataChange = useCallback((id: string, newPrompt: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, prompt: newPrompt } };
        }
        return node;
      })
    );
  }, []);

  const executeWorkflow = async () => {
    setExecutionStatus("STARTING");
    setLogs(["Starting workflow..."]);
    setVisitedNodes([]);
    setVisitedEdges([]);
    setCurrentNodeId(null);
    setExecutionId(null);

    try {
      const res = await fetch("/api/workflow/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes, edges }),
      });
      const data = await res.json();
      if (data.workflowId) {
        setExecutionId(data.workflowId);
        setExecutionStatus("RUNNING");
      } else {
        setExecutionStatus("ERROR");
        setLogs((l) => [...l, "Error: " + data.error]);
      }
    } catch (err) {
      setExecutionStatus("ERROR");
      setLogs((l) => [...l, "Error starting workflow request"]);
    }
  };

  const exportGraph = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ nodes, edges }));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "ai-decision-workflow.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importGraph = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          if (parsed.nodes && parsed.edges) {
            setNodes(parsed.nodes);
            setEdges(parsed.edges);
          }
        } catch (err) {
          alert("Invalid JSON file");
        }
      };
    }
  };

  const nodesWithHandlers = nodes.map((node) => {
    const isActive = currentNodeId === node.id;
    const isVisited = visitedNodes.includes(node.id);
    
    // Inject animation/styling for active state
    const style = { ...node.style };
    if (isActive) {
      style.boxShadow = "0 0 15px #4f46e5";
      style.border = "2px solid #6366f1";
    } else if (isVisited) {
      style.border = "2px solid #22c55e";
    }

    let nodeData = { ...node.data };
    if (node.type === "decision") {
      nodeData.onChange = onNodeDataChange;
    }

    return { ...node, data: nodeData, style };
  });

  const edgesWithState = edges.map((edge) => {
    const isVisited = visitedEdges.includes(edge.id);
    return {
      ...edge,
      animated: isVisited,
      style: {
        ...edge.style,
        strokeWidth: isVisited ? 4 : 2,
        opacity: isVisited ? 1 : 0.6,
      },
    };
  });

  if (!isLoaded) return null;

  return (
    <div className="flex h-screen w-full bg-zinc-950 overflow-hidden">
      <div className="flex-1 flex flex-col relative h-full">
        <div className="flex flex-wrap items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm z-10">
          <h1 className="text-xl font-bold text-zinc-50 flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-indigo-600 flex items-center justify-center text-white">
              <Activity size={16} />
            </div>
            AI Decision Flow
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <input type="file" accept=".json" ref={fileInputRef} className="hidden" onChange={importGraph} />
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="border-zinc-700 bg-zinc-900 text-zinc-300">
              <Upload size={14} className="mr-2" /> Import
            </Button>
            <Button variant="outline" size="sm" onClick={exportGraph} className="border-zinc-700 bg-zinc-900 text-zinc-300">
              <Download size={14} className="mr-2" /> Export
            </Button>
            <div className="w-px h-6 bg-zinc-800 mx-1" />
            <Button variant="outline" size="sm" onClick={() => {
              setNodes((nds) => [...nds, { id: `decision-${Date.now()}`, type: "decision", position: { x: 350, y: 200 }, data: { prompt: "" } }]);
            }} className="border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 hover:text-white">
              <Plus size={14} className="mr-2" /> Decision
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              const resultName = prompt("Enter result label (e.g. Sales):") || "Result";
              setNodes((nds) => [...nds, { id: `result-${Date.now()}`, type: "result", position: { x: 350, y: 400 }, data: { label: resultName } }]);
            }} className="border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 hover:text-white">
              <Plus size={14} className="mr-2" /> Result
            </Button>
            <div className="w-px h-6 bg-zinc-800 mx-1" />
            <Button variant="destructive" size="sm" onClick={() => confirm("Clear?") && (setNodes(initialNodes), setEdges([]))}>
              <Trash2 size={14} className="mr-2" /> Clear
            </Button>
            <Button variant="default" size="sm" onClick={executeWorkflow} disabled={executionStatus === "RUNNING"} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px]">
              {executionStatus === "RUNNING" ? <Loader2 size={14} className="animate-spin mr-2" /> : <Play size={14} fill="currentColor" className="mr-2" />}
              {executionStatus === "RUNNING" ? "Executing..." : "Execute"}
            </Button>
          </div>
        </div>
        <div className="flex-1 w-full relative">
          <ReactFlow
            nodes={nodesWithHandlers}
            edges={edgesWithState}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            className="bg-zinc-950"
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#27272a" gap={24} size={2} />
            <Controls className="bg-zinc-900 border-zinc-800 fill-zinc-400" />
          </ReactFlow>
        </div>
      </div>
      
      {/* Execution Logs Sidebar */}
      <div className="w-80 border-l border-zinc-800 bg-zinc-950/95 p-4 flex flex-col h-full z-10 shadow-2xl">
        <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4 flex justify-between items-center">
          Execution Logs
          {executionStatus && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              executionStatus === "COMPLETED" ? "bg-green-500/20 text-green-400" :
              executionStatus === "ERROR" ? "bg-red-500/20 text-red-400" :
              "bg-indigo-500/20 text-indigo-400"
            }`}>
              {executionStatus}
            </span>
          )}
        </h3>
        <div className="flex-1 overflow-y-auto space-y-3 font-mono text-xs pr-2 custom-scrollbar">
          {logs.length === 0 ? (
            <div className="text-zinc-600 text-center mt-10 italic">No execution history</div>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 p-2 rounded text-zinc-400 break-words">
                <span className="text-indigo-400 mr-2">[{new Date().toLocaleTimeString()}]</span>
                {log.includes("Error:") ? (
                  <span className="text-red-400 font-semibold">{log}</span>
                ) : log.includes("decided: YES") ? (
                  <span>Node Evaluated. AI decided: <strong className="text-green-500">YES</strong></span>
                ) : log.includes("decided: NO") ? (
                  <span>Node Evaluated. AI decided: <strong className="text-red-500">NO</strong></span>
                ) : log.includes("reached result") ? (
                  <span className="text-green-400 font-semibold">{log}</span>
                ) : (
                  <span>{log}</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
