import { Info } from 'lucide-react';
import { NetworkQuality } from '@/services/NetworkMonitor';

interface NetworkRecommendationEngineProps {
    quality: NetworkQuality;
}

export function NetworkRecommendationEngine({ quality }: NetworkRecommendationEngineProps) {
    if (quality.isOnline && quality.signalQuality === 'excellent') {
        return null;
    }

    let message = '';
    let type: 'warning' | 'info' | 'error' = 'info';

    if (!quality.isOnline) {
        message = 'Kamu sedang Offline. Sistem akan beralih ke Mode Offline otomatis. Absen akan disimpan sementara lalu diunggah saat internet menyala.';
        type = 'warning';
    } else if (quality.signalQuality === 'poor') {
        message = 'Sinyal sangat lemah. Pastikan kamu berada di ruangan terbuka, atau gunakan Mode Offline apabila gagal terus-menerus.';
        type = 'error';
    } else if (quality.rtt > 300) {
        message = 'Ping tinggi terdeteksi. Proses upload foto (jika diperlukan) akan membutuhkan waktu lebih lama.';
        type = 'warning';
    } else if (quality.effectiveType === '2g' || quality.effectiveType === 'slow-2g') {
        message = 'Koneksi lambat (EDGE/2G). Jangan keluar dari aplikasi saat memproses absen sampai sukses.';
        type = 'warning';
    } else {
        return null;
    }

    const bgColors = {
        warning: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
        error: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
        info: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20',
    };

    return (
        <div className={`mt-3 flex items-start p-3 text-sm rounded-xl border \${bgColors[type]}`}>
            <Info className="w-5 h-5 mr-3 shrink-0 mt-0.5 opacity-80" />
            <p className="font-medium leading-relaxed">{message}</p>
        </div>
    );
}

