import { NetworkMonitor, type NetworkQuality } from '@/services/NetworkMonitor';
import { Activity, BarChart2, Download, Gauge, Server, Wifi } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export function NetworkAnalyticsPanel() {
    const [quality, setQuality] = useState<NetworkQuality>(NetworkMonitor.getNetworkQuality());

    useEffect(() => {
        return NetworkMonitor.subscribe(setQuality);
    }, []);

    const pingColor = quality.rtt < 50 ? 'text-emerald-500' : quality.rtt < 100 ? 'text-amber-500' : 'text-rose-500';
    const downColor = quality.downlink > 10 ? 'text-emerald-500' : quality.downlink > 2 ? 'text-amber-500' : 'text-rose-500';

    const renderSignalBars = (level: string) => {
        const bars = level === 'excellent' ? 4 : level === 'good' ? 3 : level === 'fair' ? 2 : level === 'poor' ? 1 : 0;
        return (
            <div className="flex gap-0.5 items-end h-5">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className={cn(
                            "w-1.5 rounded-t-sm transition-all",
                            i <= bars 
                                ? "bg-emerald-500" 
                                : "bg-slate-200 dark:bg-slate-700",
                            {
                                "h-2": i === 1,
                                "h-3": i === 2,
                                "h-4": i === 3,
                                "h-5": i === 4,
                            }
                        )}
                    />
                ))}
            </div>
        );
    };

    return (
        <Card className="shadow-lg backdrop-blur-md bg-white/80 dark:bg-neutral-900/80">
            <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Activity className="h-5 w-5 text-indigo-500" />
                            Network Analytics
                        </CardTitle>
                        <CardDescription>Real-time internet quality metrics</CardDescription>
                    </div>
                    {renderSignalBars(quality.signalQuality)}
                </div>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <Server className="h-3.5 w-3.5" />
                        Latency (Ping)
                    </div>
                    <div className="flex items-end gap-1">
                        <span className={cn("text-2xl font-bold font-mono tracking-tight", pingColor)}>
                            {quality.isOnline ? quality.rtt : '--'}
                        </span>
                        <span className="text-xs font-medium text-slate-400 mb-1">ms</span>
                    </div>
                    <Progress value={Math.min(100, Math.max(0, 100 - (quality.rtt / 5)))} className="h-1.5 mt-2" />
                </div>

                <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <Download className="h-3.5 w-3.5" />
                        Speed Limit
                    </div>
                    <div className="flex items-end gap-1">
                        <span className={cn("text-2xl font-bold font-mono tracking-tight", downColor)}>
                            {quality.isOnline ? quality.downlink : '--'}
                        </span>
                        <span className="text-xs font-medium text-slate-400 mb-1">Mbps</span>
                    </div>
                    <Progress value={Math.min(100, quality.downlink * 10)} className="h-1.5 mt-2" />
                </div>

                <div className="col-span-2 flex items-center justify-between p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 mt-2">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">Connection</span>
                        <span className="text-sm font-semibold capitalize text-slate-700 dark:text-slate-200">
                            {quality.isOnline ? quality.connectionType : 'Offline'} 
                            {quality.isOnline && quality.effectiveType !== 'unknown' && ` (${quality.effectiveType})`}
                        </span>
                    </div>
                    <div className="flex items-center justify-center h-8 px-3 rounded-full bg-indigo-100 dark:bg-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-200">
                        {quality.signalQuality.toUpperCase()}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
