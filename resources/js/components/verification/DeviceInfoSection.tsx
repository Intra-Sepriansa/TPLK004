import { motion } from 'framer-motion';
import {
    Smartphone,
    Monitor,
    Tablet,
    Globe,
    MapPin,
    Shield,
    ShieldCheck,
    ShieldAlert,
    Fingerprint,
    Wifi,
    Clock,
} from 'lucide-react';

interface DeviceInfo {
    type?: string | null;
    model?: string | null;
    os?: string | null;
    browser?: string | null;
    ip_address?: string | null;
    user_agent?: string | null;
    is_trusted?: boolean | null;
    device_id?: string | null;
    screen_resolution?: string | null;
    timezone?: string | null;
    platform?: string | null;
}

interface LocationData {
    latitude?: number | null;
    longitude?: number | null;
    accuracy?: number | null;
    address?: string | null;
    distance_m?: number | null;
}

interface DeviceInfoSectionProps {
    deviceInfo: DeviceInfo | null;
    locationData?: LocationData | null;
}

function DeviceIcon({ type }: { type: string | null | undefined }) {
    const t = (type ?? '').toLowerCase();
    if (t.includes('mobile') || t.includes('phone')) return <Smartphone className="h-4 w-4" />;
    if (t.includes('tablet')) return <Tablet className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
}

function InfoItem({ icon: Icon, label, value, highlight }: {
    icon: typeof Globe;
    label: string;
    value: string | null | undefined;
    highlight?: boolean;
}) {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3 py-2">
            <div className={`p-1.5 rounded-lg ${highlight ? 'bg-cyan-500/20' : 'bg-slate-700/50'}`}>
                <Icon className={`h-3.5 w-3.5 ${highlight ? 'text-cyan-400' : 'text-slate-400'}`} />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[11px] text-slate-500 uppercase tracking-wider">{label}</p>
                <p className="text-xs text-slate-200 mt-0.5 break-all">{value}</p>
            </div>
        </div>
    );
}

export default function DeviceInfoSection({ deviceInfo, locationData }: DeviceInfoSectionProps) {
    if (!deviceInfo) return null;

    const isTrusted = deviceInfo.is_trusted === true;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-800/60 backdrop-blur-xl overflow-hidden"
        >
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/5 bg-gradient-to-r from-indigo-500/10 via-blue-500/5 to-cyan-500/10">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-500/20 ring-1 ring-indigo-500/30">
                        <DeviceIcon type={deviceInfo.type} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-white">Device Information</h3>
                        <p className="text-xs text-slate-400">Data perangkat saat absensi</p>
                    </div>
                    {/* Trust badge */}
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${isTrusted
                        ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30'
                        }`}>
                        {isTrusted ? <ShieldCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                        {isTrusted ? 'Trusted Device' : 'New Device'}
                    </div>
                </div>
            </div>

            {/* Content grid */}
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-0">
                    <InfoItem icon={Smartphone} label="Perangkat" value={deviceInfo.model} highlight />
                    <InfoItem icon={Globe} label="Sistem Operasi" value={deviceInfo.os} />
                    <InfoItem icon={Globe} label="Browser" value={deviceInfo.browser} />
                    <InfoItem icon={Monitor} label="Resolusi Layar" value={deviceInfo.screen_resolution} />
                    <InfoItem icon={Clock} label="Timezone" value={deviceInfo.timezone} />
                    <InfoItem icon={Globe} label="Platform" value={deviceInfo.platform} />
                    <InfoItem icon={Wifi} label="IP Address" value={deviceInfo.ip_address} />
                    <InfoItem icon={Fingerprint} label="Device ID" value={deviceInfo.device_id ? deviceInfo.device_id.substring(0, 16) + '...' : null} />
                </div>

                {/* User Agent - full width */}
                {deviceInfo.user_agent && (
                    <div className="mt-3 pt-3 border-t border-white/5">
                        <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-1">User Agent</p>
                        <p className="text-[11px] text-slate-400 bg-slate-800/50 rounded-lg p-2.5 font-mono leading-relaxed break-all">
                            {deviceInfo.user_agent}
                        </p>
                    </div>
                )}

                {/* Location info */}
                {locationData && (locationData.address || locationData.latitude) && (
                    <div className="mt-3 pt-3 border-t border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                            <p className="text-[11px] text-slate-500 uppercase tracking-wider">Lokasi</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {locationData.address && (
                                <div className="md:col-span-2 text-xs text-slate-300 bg-slate-800/50 rounded-lg p-2.5">
                                    📍 {locationData.address}
                                </div>
                            )}
                            {locationData.latitude != null && locationData.longitude != null && (
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] text-slate-500">Koordinat:</span>
                                    <span className="text-xs text-slate-300 font-mono">
                                        {Number(locationData.latitude).toFixed(6)}, {Number(locationData.longitude).toFixed(6)}
                                    </span>
                                </div>
                            )}
                            {locationData.accuracy != null && (
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] text-slate-500">Akurasi:</span>
                                    <span className="text-xs text-slate-300">{Number(locationData.accuracy).toFixed(1)}m</span>
                                </div>
                            )}
                            {locationData.distance_m != null && (
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] text-slate-500">Jarak:</span>
                                    <span className={`text-xs font-medium ${Number(locationData.distance_m) <= 200 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {Number(locationData.distance_m).toFixed(0)}m
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
