import { useState } from 'react';
import { NetworkMonitor } from '@/services/NetworkMonitor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Activity, Play, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function NetworkDiagnosticsTool() {
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState<{
        ping?: number;
        speed?: number;
        dns?: boolean;
        api?: boolean;
    }>({});
    
    const runDiagnostics = async () => {
        setIsRunning(true);
        setResults({});
        
        // 1. DNS & Connectivity (Basic check using navigator)
        await new Promise(r => setTimeout(r, 600));
        const isOnline = navigator.onLine;
        setResults(prev => ({ ...prev, dns: isOnline }));
        
        if (!isOnline) {
            setIsRunning(false);
            return;
        }

        // 2. API Reachability & Ping
        try {
            const start = performance.now();
            const res = await fetch('/api/network/health', { cache: 'no-store' });
            const rtt = Math.round(performance.now() - start);
            setResults(prev => ({ ...prev, api: res.ok, ping: rtt }));
        } catch (e) {
            setResults(prev => ({ ...prev, api: false }));
        }

        // 3. Speedtest (simulated 1MB download)
        await new Promise(r => setTimeout(r, 500));
        const speedRes = await NetworkMonitor.performSpeedTest();
        setResults(prev => ({ ...prev, speed: speedRes.downloadMbps }));

        setIsRunning(false);
    };

    const isDone = !isRunning && Object.keys(results).length > 0;

    const renderTestItem = (label: string, status: 'pending' | 'running' | 'success' | 'failed', value?: React.ReactNode) => {
        return (
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                    {status === 'pending' && <div className="h-5 w-5 rounded-full border-2 border-slate-200 dark:border-slate-700" />}
                    {status === 'running' && <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />}
                    {status === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                    {status === 'failed' && <XCircle className="h-5 w-5 text-rose-500" />}
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
                </div>
                {value && (
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{value}</span>
                )}
            </div>
        );
    }

    return (
        <Card className="shadow-lg">
            <CardHeader className="pb-3 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-indigo-500" />
                    Network Diagnostics
                </CardTitle>
                <CardDescription>Run a deep test to find connection issues</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col gap-2">
                {renderTestItem(
                    'Local Connectivity', 
                    isRunning && results.dns === undefined ? 'running' : results.dns !== undefined ? (results.dns ? 'success' : 'failed') : 'pending',
                    results.dns ? 'OK' : undefined
                )}
                {renderTestItem(
                    'Server Reachability',
                    isRunning && results.dns !== undefined && results.api === undefined ? 'running' : results.api !== undefined ? (results.api ? 'success' : 'failed') : 'pending',
                    results.ping ? `${results.ping} ms` : undefined
                )}
                {renderTestItem(
                    'Download Speed',
                    isRunning && results.api !== undefined && results.speed === undefined ? 'running' : results.speed !== undefined ? 'success' : 'pending',
                    results.speed !== undefined ? `${results.speed.toFixed(1)} Mbps` : undefined
                )}

                {isDone && results.dns === false && (
                    <div className="mt-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-500/10 flex items-start gap-2 text-rose-700 dark:text-rose-400 text-sm">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        You are completely offline. Turn on Wi-Fi or Cellular Data, or proceed with Offline Absensi.
                    </div>
                )}
                {isDone && results.api === false && results.dns === true && (
                    <div className="mt-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-start gap-2 text-amber-700 dark:text-amber-400 text-sm">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        Connected to network, but server is unreachable. Beralih ke Offline Absensi disarankan.
                    </div>
                )}
                {isDone && results.ping !== undefined && results.ping > 200 && (
                    <div className="mt-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-start gap-2 text-amber-700 dark:text-amber-400 text-sm">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        Ping sangat tinggi ({results.ping}ms). Proses upload foto mungkin terganggu atau sangat lambat.
                    </div>
                )}
            </CardContent>
            <CardFooter className="pt-2">
                <Button 
                    onClick={runDiagnostics} 
                    disabled={isRunning}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                    {isRunning ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Running Analysis...
                        </>
                    ) : isDone ? (
                        <>
                            <Play className="mr-2 h-4 w-4" />
                            Run Again
                        </>
                    ) : (
                        <>
                            <Play className="mr-2 h-4 w-4" />
                            Start Diagnostics
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}

