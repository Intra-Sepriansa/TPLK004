import React, { useCallback } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';

interface Note {
    id: number;
    title: string;
    course_id: number;
}

interface Course {
    id: number;
    name: string;
}

interface MindMapViewProps {
    notes: Note[];
    courses: Course[];
}

export default function MindMapView({ notes, courses }: MindMapViewProps) {
    const isDark = document.documentElement.classList.contains('dark');
    const theme = isDark ? 'dark' : 'light';

    // Transform notes and courses into nodes and edges
    const initialNodes: Node[] = [];
    const initialEdges: Edge[] = [];

    // Central Root Node
    initialNodes.push({
        id: 'root',
        type: 'input',
        data: { label: 'My Notes' },
        position: { x: 400, y: 50 },
        style: {
            background: 'linear-gradient(to right, #6366f1, #a855f7)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '10px 20px',
            fontWeight: 'bold',
            boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)',
        },
    });

    // Calculate positions
    let courseX = 100;

    courses.forEach((course) => {
        // Check if course has notes
        const courseNotes = notes.filter(n => n.course_id === course.id);
        if (courseNotes.length === 0) return;

        // Course Nodes
        const courseNodeId = `course-${course.id}`;
        initialNodes.push({
            id: courseNodeId,
            data: { label: course.name },
            position: { x: courseX, y: 200 },
            style: {
                background: theme === 'dark' ? '#1e293b' : '#f8fafc',
                color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                border: '2px solid #a855f7',
                borderRadius: '8px',
                padding: '10px',
                fontWeight: 'bold',
            },
        });

        initialEdges.push({
            id: `e-root-${courseNodeId}`,
            source: 'root',
            target: courseNodeId,
            animated: true,
            style: { stroke: '#a855f7' },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7' },
        });

        // Note Nodes
        let noteY = 350;
        courseNotes.forEach((note) => {
            const noteNodeId = `note-${note.id}`;
            initialNodes.push({
                id: noteNodeId,
                data: { label: note.title },
                position: { x: courseX, y: noteY },
                style: {
                    background: theme === 'dark' ? '#0f172a' : 'white',
                    color: theme === 'dark' ? '#cbd5e1' : '#475569',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '8px',
                    fontSize: '12px',
                },
            });

            initialEdges.push({
                id: `e-${courseNodeId}-${noteNodeId}`,
                source: courseNodeId,
                target: noteNodeId,
                style: { stroke: '#cbd5e1' },
            });

            noteY += 80;
        });

        courseX += 250;
    });

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback((params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    return (
        <div style={{ width: '100%', height: '600px' }} className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
                attributionPosition="bottom-right"
            >
                <Controls className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" />
                <MiniMap
                    nodeStrokeColor={(n) => {
                        if (n.id === 'root') return '#6366f1';
                        if (n.id.startsWith('course')) return '#a855f7';
                        return theme === 'dark' ? '#475569' : '#cbd5e1';
                    }}
                    nodeColor={(n) => {
                        if (n.id === 'root') return '#8b5cf6';
                        if (n.id.startsWith('course')) return theme === 'dark' ? '#1e293b' : '#f8fafc';
                        return theme === 'dark' ? '#0f172a' : '#ffffff';
                    }}
                    nodeBorderRadius={2}
                    className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700"
                />
                <Background color={theme === 'dark' ? '#334155' : '#cbd5e1'} gap={16} />
            </ReactFlow>
        </div>
    );
}
