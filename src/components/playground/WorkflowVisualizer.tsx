import { useState, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Node,
  type Edge,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, RotateCcw, CheckCircle2 } from 'lucide-react';

interface WorkflowVisualizerProps {
  onComplete: () => void;
}

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: '🎯 New Lead Captured' },
    position: { x: 250, y: 0 },
    style: { background: '#14b8a6', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 20px' }
  },
  {
    id: '2',
    data: { label: '🤖 AI Qualification' },
    position: { x: 100, y: 100 },
    style: { background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 20px' }
  },
  {
    id: '3',
    data: { label: '📊 Lead Scoring' },
    position: { x: 400, y: 100 },
    style: { background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 20px' }
  },
  {
    id: '4',
    data: { label: '✅ Qualified?' },
    position: { x: 250, y: 200 },
    style: { background: '#f59e0b', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 20px' }
  },
  {
    id: '5',
    data: { label: '📧 Email Sequence' },
    position: { x: 100, y: 300 },
    style: { background: '#10b981', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 20px' }
  },
  {
    id: '6',
    data: { label: '📅 Book Meeting' },
    position: { x: 400, y: 300 },
    style: { background: '#ef4444', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 20px' }
  },
  {
    id: '7',
    type: 'output',
    data: { label: '🎉 Deal Closed' },
    position: { x: 250, y: 400 },
    style: { background: '#22c55e', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 20px' }
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#14b8a6' } },
  { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: '#14b8a6' } },
  { id: 'e2-4', source: '2', target: '4', animated: true, style: { stroke: '#0ea5e9' } },
  { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: '#8b5cf6' } },
  { id: 'e4-5', source: '4', target: '5', label: 'No', style: { stroke: '#f59e0b' } },
  { id: 'e4-6', source: '4', target: '6', label: 'Yes', animated: true, style: { stroke: '#10b981' } },
  { id: 'e5-7', source: '5', target: '7', style: { stroke: '#10b981' } },
  { id: 'e6-7', source: '6', target: '7', animated: true, style: { stroke: '#22c55e' } },
];

export function WorkflowVisualizer({ onComplete }: WorkflowVisualizerProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const runSimulation = async () => {
    setIsRunning(true);
    setCurrentStep(0);

    const steps = ['1', '2', '3', '4', '6', '7'];
    
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i + 1);
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === steps[i]) {
            return {
              ...node,
              style: {
                ...node.style,
                boxShadow: '0 0 20px rgba(20, 184, 166, 0.5)',
                transform: 'scale(1.1)'
              }
            };
          }
          return node;
        })
      );
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setIsRunning(false);
    setCompleted(true);
    onComplete();
  };

  const resetSimulation = () => {
    setNodes(initialNodes);
    setCurrentStep(0);
    setCompleted(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Lead Automation Workflow</h2>
          <p className="text-muted-foreground">See how we automate lead qualification and nurturing</p>
        </div>
        <div className="flex items-center gap-3">
          {completed && (
            <Badge className="bg-emerald-500 text-white gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Completed
            </Badge>
          )}
          <Button
            onClick={runSimulation}
            disabled={isRunning}
            className="btn-primary gap-2"
          >
            <Play className="h-4 w-4" />
            {isRunning ? 'Running...' : 'Run Simulation'}
          </Button>
          <Button
            onClick={resetSimulation}
            variant="outline"
            disabled={isRunning}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div style={{ height: 500 }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
              attributionPosition="bottom-left"
            >
              <Controls />
              <MiniMap />
              <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-muted/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Step {currentStep} of 6</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {currentStep === 0 && 'Click "Run Simulation" to start'}
              {currentStep === 1 && 'New lead captured from website'}
              {currentStep === 2 && 'AI analyzing lead quality...'}
              {currentStep === 3 && 'Calculating lead score...'}
              {currentStep === 4 && 'Lead qualified! Routing to sales...'}
              {currentStep === 5 && 'Meeting scheduled automatically'}
              {currentStep === 6 && 'Deal closed successfully! 🎉'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Time Saved</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">2.5 hours</p>
            <p className="text-sm text-muted-foreground">per lead on average</p>
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">+47%</p>
            <p className="text-sm text-muted-foreground">with AI qualification</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}