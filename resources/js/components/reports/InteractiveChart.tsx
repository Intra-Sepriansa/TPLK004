import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, Download, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChartData {
    name: string;
    value: number;
    [key: string]: any;
}

interface InteractiveChartProps {
    data: ChartData[];
    title: string;
    description?: string;
    defaultType?: 'bar' | 'line' | 'pie';
    colors?: string[];
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export function InteractiveChart({ 
    data, 
    title, 
    description, 
    defaultType = 'bar',
    colors = COLORS 
}: InteractiveChartProps) {
    const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>(defaultType);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const handleDownload = () => {
        // Convert chart to image and download
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        // Implementation for chart download
        console.log('Downloading chart...');
    };

    const renderChart = () => {
        const commonProps = {
            data,
            margin: { top: 5, right: 30, left: 20, bottom: 5 },
        };

        switch (chartType) {
            case 'bar':
                return (
                    <ResponsiveContainer width="100%" height={isFullscreen ? 600 : 300}>
                        <BarChart {...commonProps}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" fill={colors[0]} animationDuration={1000} />
                        </BarChart>
                    </ResponsiveContainer>
                );

            case 'line':
                return (
                    <ResponsiveContainer width="100%" height={isFullscreen ? 600 : 300}>
                        <LineChart {...commonProps}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line 
                                type="monotone" 
                                dataKey="value" 
                                stroke={colors[0]} 
                                strokeWidth={2}
                                animationDuration={1000}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                );

            case 'pie':
                return (
                    <ResponsiveContainer width="100%" height={isFullscreen ? 600 : 300}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={isFullscreen ? 200 : 100}
                                fill="#8884d8"
                                dataKey="value"
                                animationDuration={1000}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                );
        }
    };

    return (
        <Card className={`p-6 ${isFullscreen ? 'fixed inset-4 z-50 overflow-auto' : ''}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold">{title}</h3>
                    {description && (
                        <p className="text-sm text-muted-foreground">{description}</p>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Chart Type Selector */}
                    <div className="flex gap-1 p-1 bg-muted rounded-lg">
                        <Button
                            size="sm"
                            variant={chartType === 'bar' ? 'default' : 'ghost'}
                            onClick={() => setChartType('bar')}
                            className="h-8 w-8 p-0"
                        >
                            <BarChart3 className="h-4 w-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant={chartType === 'line' ? 'default' : 'ghost'}
                            onClick={() => setChartType('line')}
                            className="h-8 w-8 p-0"
                        >
                            <LineChartIcon className="h-4 w-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant={chartType === 'pie' ? 'default' : 'ghost'}
                            onClick={() => setChartType('pie')}
                            className="h-8 w-8 p-0"
                        >
                            <PieChartIcon className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Actions */}
                    <Button size="sm" variant="outline" onClick={handleDownload}>
                        <Download className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setIsFullscreen(!isFullscreen)}>
                        <Maximize2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Chart */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={chartType}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {renderChart()}
                </motion.div>
            </AnimatePresence>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
                <div>
                    <div className="text-sm text-muted-foreground">Total Data</div>
                    <div className="text-2xl font-bold">{data.length}</div>
                </div>
                <div>
                    <div className="text-sm text-muted-foreground">Total Value</div>
                    <div className="text-2xl font-bold">
                        {data.reduce((sum, item) => sum + item.value, 0)}
                    </div>
                </div>
                <div>
                    <div className="text-sm text-muted-foreground">Average</div>
                    <div className="text-2xl font-bold">
                        {(data.reduce((sum, item) => sum + item.value, 0) / data.length).toFixed(1)}
                    </div>
                </div>
                <div>
                    <div className="text-sm text-muted-foreground">Max Value</div>
                    <div className="text-2xl font-bold">
                        {Math.max(...data.map(item => item.value))}
                    </div>
                </div>
            </div>
        </Card>
    );
}
