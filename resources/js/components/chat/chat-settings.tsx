import { useState, useRef, useEffect } from 'react';
import { X, Image, Palette, Type, Bell, Shield, Upload, Trash2, Check, Sparkles, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

export interface ChatSettings {
    wallpaper: string | null;
    wallpaperType: 'preset' | 'custom' | 'solid' | 'gradient' | 'pattern' | 'animated';
    solidColor: string;
    gradientId: string;
    patternId: string;
    animatedId: string;
    bubbleColor: string;
    fontSize: number;
    bubbleStyle: 'modern' | 'classic' | 'minimal';
    soundEnabled: boolean;
    vibrationEnabled: boolean;
    messagePreview: boolean;
    readReceipts: boolean;
    lastSeen: boolean;
    enterToSend: boolean;
    animationSpeed: 'slow' | 'normal' | 'fast';
    messageAnimation: 'fade' | 'slide' | 'scale' | 'none';
}

export const DEFAULT_SETTINGS: ChatSettings = {
    wallpaper: null,
    wallpaperType: 'preset',
    solidColor: '#0b141a',
    gradientId: 'aurora',
    patternId: 'dots',
    animatedId: 'wave',
    bubbleColor: '#005c4b',
    fontSize: 14,
    bubbleStyle: 'modern',
    soundEnabled: true,
    vibrationEnabled: true,
    messagePreview: true,
    readReceipts: true,
    lastSeen: true,
    enterToSend: true,
    animationSpeed: 'normal',
    messageAnimation: 'slide',
};

// Solid Colors
const PRESET_WALLPAPERS = [
    { id: 'default', name: 'Default', color: '#0b141a' },
    { id: 'dark', name: 'Dark', color: '#000000' },
    { id: 'navy', name: 'Navy', color: '#1a1a2e' },
    { id: 'forest', name: 'Forest', color: '#1b4332' },
    { id: 'wine', name: 'Wine', color: '#3c1518' },
    { id: 'ocean', name: 'Ocean', color: '#023e8a' },
    { id: 'midnight', name: 'Midnight', color: '#0f0f23' },
    { id: 'charcoal', name: 'Charcoal', color: '#1a1a1a' },
];

// Gradient Presets
const GRADIENT_PRESETS = [
    { id: 'aurora', name: 'Aurora', gradient: 'linear-gradient(135deg, #0b141a 0%, #1a4a3a 50%, #0b141a 100%)' },
    { id: 'sunset', name: 'Sunset', gradient: 'linear-gradient(135deg, #1a1a2e 0%, #4a1942 50%, #1a1a2e 100%)' },
    { id: 'ocean-deep', name: 'Ocean Deep', gradient: 'linear-gradient(180deg, #0b141a 0%, #023e8a 100%)' },
    { id: 'forest-mist', name: 'Forest Mist', gradient: 'linear-gradient(180deg, #1b4332 0%, #0b141a 100%)' },
    { id: 'purple-haze', name: 'Purple Haze', gradient: 'linear-gradient(135deg, #1a1a2e 0%, #4c1d95 50%, #1a1a2e 100%)' },
    { id: 'cosmic', name: 'Cosmic', gradient: 'linear-gradient(135deg, #0f0f23 0%, #1e3a5f 25%, #4c1d95 50%, #1e3a5f 75%, #0f0f23 100%)' },
    { id: 'emerald', name: 'Emerald', gradient: 'linear-gradient(135deg, #064e3b 0%, #0b141a 50%, #064e3b 100%)' },
    { id: 'rose-gold', name: 'Rose Gold', gradient: 'linear-gradient(135deg, #1a1a1a 0%, #4a1942 50%, #1a1a1a 100%)' },
];

// Pattern Presets
const PATTERN_PRESETS = [
    { id: 'dots', name: 'Dots', pattern: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='3' cy='3' r='1.5'/%3E%3C/g%3E%3C/svg%3E")` },
    { id: 'grid', name: 'Grid', pattern: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='0.05'%3E%3Cpath d='M0 20h40M20 0v40'/%3E%3C/g%3E%3C/svg%3E")` },
    { id: 'waves', name: 'Waves', pattern: `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.73-5.139-1.691-8.233-2.928C65.888 13.278 60.562 12 50 12c-10.626 0-16.855 1.397-26.66 5.063l-1.767.662c-2.475.923-4.66 1.674-6.724 2.275h6.335zm0-20C13.258 2.892 8.077 4 0 4V2c5.744 0 9.951-.574 14.85-2h6.334zM77.38 0C85.239 2.966 90.502 4 100 4V2c-6.842 0-11.386-.542-16.396-2h-6.225zM0 14c8.44 0 13.718-1.21 22.272-4.402l1.768-.661C33.64 5.347 39.647 4 50 4c10.271 0 15.362 1.222 24.629 4.928C84.112 12.722 89.438 14 100 14v-2c-10.271 0-15.362-1.222-24.629-4.928C65.888 3.278 60.562 2 50 2 39.374 2 33.145 3.397 23.34 7.063l-1.767.662C13.223 10.84 8.163 12 0 12v2z' fill='%23ffffff' fill-opacity='0.03'/%3E%3C/svg%3E")` },
    { id: 'hexagon', name: 'Hexagon', pattern: `url("data:image/svg+xml,%3Csvg width='28' height='49' viewBox='0 0 28 49' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='0.05'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9z'/%3E%3C/g%3E%3C/svg%3E")` },
    { id: 'circuit', name: 'Circuit', pattern: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z' fill='%23ffffff' fill-opacity='0.04'/%3E%3C/svg%3E")` },
    { id: 'topography', name: 'Topography', pattern: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z' fill='none' stroke='%23ffffff' stroke-opacity='0.03'/%3E%3C/svg%3E")` },
];

// Animated Backgrounds
const ANIMATED_PRESETS = [
    { id: 'wave', name: 'Wave', description: 'Gelombang bergerak' },
    { id: 'particles', name: 'Particles', description: 'Partikel mengambang' },
    { id: 'gradient-shift', name: 'Gradient Shift', description: 'Gradien berubah' },
    { id: 'aurora-borealis', name: 'Aurora', description: 'Cahaya utara' },
    { id: 'starfield', name: 'Starfield', description: 'Bintang berkelip' },
    { id: 'pulse', name: 'Pulse', description: 'Denyut halus' },
];

const BUBBLE_COLORS = [
    { id: 'green', color: '#005c4b', name: 'WhatsApp Green' },
    { id: 'blue', color: '#0088cc', name: 'Telegram Blue' },
    { id: 'purple', color: '#7c3aed', name: 'Purple' },
    { id: 'pink', color: '#db2777', name: 'Pink' },
    { id: 'orange', color: '#ea580c', name: 'Orange' },
    { id: 'red', color: '#dc2626', name: 'Red' },
    { id: 'teal', color: '#0d9488', name: 'Teal' },
    { id: 'indigo', color: '#4f46e5', name: 'Indigo' },
    { id: 'emerald', color: '#059669', name: 'Emerald' },
    { id: 'amber', color: '#d97706', name: 'Amber' },
    { id: 'cyan', color: '#0891b2', name: 'Cyan' },
    { id: 'rose', color: '#e11d48', name: 'Rose' },
];

const MESSAGE_ANIMATIONS = [
    { id: 'slide', name: 'Slide', description: 'Geser dari samping' },
    { id: 'fade', name: 'Fade', description: 'Muncul perlahan' },
    { id: 'scale', name: 'Scale', description: 'Membesar dari kecil' },
    { id: 'none', name: 'None', description: 'Tanpa animasi' },
];

interface ChatSettingsProps {
    settings: ChatSettings;
    onSettingsChange: (settings: ChatSettings) => void;
    onClose: () => void;
}

type SettingsTab = 'wallpaper' | 'theme' | 'animations' | 'notifications' | 'privacy';
type WallpaperSubTab = 'solid' | 'gradient' | 'pattern' | 'animated' | 'custom';

// Animated Background Component
function AnimatedBackground({ animatedId, isPlaying }: { animatedId: string; isPlaying: boolean }) {
    const getAnimationStyle = () => {
        if (!isPlaying) return {};
        
        switch (animatedId) {
            case 'wave':
                return {
                    background: 'linear-gradient(135deg, #0b141a 0%, #1a4a3a 25%, #0b141a 50%, #1a4a3a 75%, #0b141a 100%)',
                    backgroundSize: '400% 400%',
                    animation: 'wave-animation 8s ease infinite',
                };
            case 'particles':
                return {
                    background: 'radial-gradient(circle at 20% 80%, rgba(0, 168, 132, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(0, 168, 132, 0.1) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(0, 168, 132, 0.08) 0%, transparent 30%), #0b141a',
                    animation: 'particles-animation 15s ease infinite',
                };
            case 'gradient-shift':
                return {
                    background: 'linear-gradient(270deg, #0b141a, #1a4a3a, #023e8a, #1a1a2e, #0b141a)',
                    backgroundSize: '1000% 1000%',
                    animation: 'gradient-shift-animation 20s ease infinite',
                };
            case 'aurora-borealis':
                return {
                    background: 'linear-gradient(180deg, #0b141a 0%, #064e3b 30%, #0891b2 50%, #064e3b 70%, #0b141a 100%)',
                    backgroundSize: '100% 300%',
                    animation: 'aurora-animation 10s ease infinite',
                };
            case 'starfield':
                return {
                    background: `radial-gradient(2px 2px at 20px 30px, white, transparent),
                        radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
                        radial-gradient(1px 1px at 90px 40px, white, transparent),
                        radial-gradient(2px 2px at 130px 80px, rgba(255,255,255,0.6), transparent),
                        radial-gradient(1px 1px at 160px 120px, white, transparent),
                        #0f0f23`,
                    animation: 'starfield-animation 3s ease infinite',
                };
            case 'pulse':
                return {
                    background: 'radial-gradient(circle at center, #1a4a3a 0%, #0b141a 70%)',
                    animation: 'pulse-animation 4s ease infinite',
                };
            default:
                return { background: '#0b141a' };
        }
    };

    return <div className="absolute inset-0 transition-all duration-500" style={getAnimationStyle()} />;
}

// Wallpaper Preview Component
function WallpaperPreview({ settings }: { settings: ChatSettings }) {
    const getPreviewStyle = (): React.CSSProperties => {
        switch (settings.wallpaperType) {
            case 'custom':
                return settings.wallpaper ? {
                    backgroundImage: `url(${settings.wallpaper})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                } : { backgroundColor: '#0b141a' };
            case 'solid':
                return { backgroundColor: settings.solidColor };
            case 'gradient':
                const gradient = GRADIENT_PRESETS.find(g => g.id === settings.gradientId);
                return { background: gradient?.gradient || '#0b141a' };
            case 'pattern':
                const pattern = PATTERN_PRESETS.find(p => p.id === settings.patternId);
                return {
                    backgroundColor: '#0b141a',
                    backgroundImage: pattern?.pattern,
                };
            case 'animated':
                return {}; // Handled by AnimatedBackground component
            default:
                return { backgroundColor: '#0b141a' };
        }
    };

    return (
        <div className="relative w-full h-40 rounded-lg overflow-hidden border border-[#2a3942]">
            {settings.wallpaperType === 'animated' ? (
                <AnimatedBackground animatedId={settings.animatedId} isPlaying={true} />
            ) : (
                <div className="absolute inset-0" style={getPreviewStyle()} />
            )}
            
            {/* Preview Messages */}
            <div className="absolute inset-0 p-3 flex flex-col justify-end gap-2">
                {/* Incoming message */}
                <div className="flex">
                    <div className="bg-[#202c33] rounded-lg rounded-tl-none px-3 py-1.5 max-w-[70%]">
                        <p className="text-xs text-[#e9edef]">Halo! Apa kabar?</p>
                        <span className="text-[9px] text-[#8696a0]">10:30</span>
                    </div>
                </div>
                {/* Outgoing message */}
                <div className="flex justify-end">
                    <div 
                        className="rounded-lg rounded-tr-none px-3 py-1.5 max-w-[70%]"
                        style={{ backgroundColor: settings.bubbleColor }}
                    >
                        <p className="text-xs text-[#e9edef]">Baik! Kamu gimana?</p>
                        <span className="text-[9px] text-[#ffffff99]">10:31 ✓✓</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ChatSettingsPanel({ settings, onSettingsChange, onClose }: ChatSettingsProps) {
    const [activeTab, setActiveTab] = useState<SettingsTab>('wallpaper');
    const [wallpaperSubTab, setWallpaperSubTab] = useState<WallpaperSubTab>('gradient');
    const [isAnimationPlaying, setIsAnimationPlaying] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const updateSetting = <K extends keyof ChatSettings>(key: K, value: ChatSettings[K]) => {
        onSettingsChange({ ...settings, [key]: value });
    };

    const handleWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                updateSetting('wallpaper', event.target?.result as string);
                updateSetting('wallpaperType', 'custom');
            };
            reader.readAsDataURL(file);
        }
    };

    const removeCustomWallpaper = () => {
        updateSetting('wallpaper', null);
        updateSetting('wallpaperType', 'gradient');
    };

    const tabs = [
        { id: 'wallpaper' as const, icon: Image, label: 'Wallpaper' },
        { id: 'theme' as const, icon: Palette, label: 'Tema' },
        { id: 'animations' as const, icon: Sparkles, label: 'Animasi' },
        { id: 'notifications' as const, icon: Bell, label: 'Notifikasi' },
        { id: 'privacy' as const, icon: Shield, label: 'Privasi' },
    ];

    const wallpaperSubTabs = [
        { id: 'gradient' as const, label: 'Gradien' },
        { id: 'solid' as const, label: 'Solid' },
        { id: 'pattern' as const, label: 'Pattern' },
        { id: 'animated' as const, label: 'Animasi' },
        { id: 'custom' as const, label: 'Kustom' },
    ];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#111b21] rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-[#202c33] border-b border-[#2a3942]">
                    <h2 className="text-lg font-medium text-[#e9edef]">Pengaturan Chat</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="text-[#aebac1] hover:bg-[#374045] transition-colors">
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[#2a3942] overflow-x-auto scrollbar-hide">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                'flex-1 flex items-center justify-center gap-2 py-3 text-sm transition-all duration-200 min-w-[80px]',
                                activeTab === tab.id
                                    ? 'text-[#00a884] border-b-2 border-[#00a884] bg-[#202c33]/50'
                                    : 'text-[#8696a0] hover:bg-[#202c33]/30'
                            )}
                        >
                            <tab.icon className="h-4 w-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {activeTab === 'wallpaper' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                            {/* Preview */}
                            <div>
                                <h3 className="text-sm font-medium text-[#e9edef] mb-2">Preview</h3>
                                <WallpaperPreview settings={settings} />
                            </div>

                            {/* Wallpaper Sub Tabs */}
                            <div className="flex gap-1 p-1 bg-[#202c33] rounded-lg">
                                {wallpaperSubTabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setWallpaperSubTab(tab.id)}
                                        className={cn(
                                            'flex-1 py-1.5 text-xs rounded-md transition-all duration-200',
                                            wallpaperSubTab === tab.id
                                                ? 'bg-[#00a884] text-white'
                                                : 'text-[#8696a0] hover:text-[#e9edef]'
                                        )}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Gradient Wallpapers */}
                            {wallpaperSubTab === 'gradient' && (
                                <div className="animate-in fade-in duration-200">
                                    <h3 className="text-sm font-medium text-[#e9edef] mb-3">Wallpaper Gradien</h3>
                                    <div className="grid grid-cols-4 gap-2">
                                        {GRADIENT_PRESETS.map((preset) => (
                                            <button
                                                key={preset.id}
                                                onClick={() => {
                                                    updateSetting('gradientId', preset.id);
                                                    updateSetting('wallpaperType', 'gradient');
                                                }}
                                                className={cn(
                                                    'aspect-square rounded-lg border-2 transition-all duration-200 relative overflow-hidden group',
                                                    settings.wallpaperType === 'gradient' && settings.gradientId === preset.id
                                                        ? 'border-[#00a884] scale-105 shadow-lg shadow-[#00a884]/20'
                                                        : 'border-transparent hover:border-[#2a3942] hover:scale-102'
                                                )}
                                                style={{ background: preset.gradient }}
                                                title={preset.name}
                                            >
                                                {settings.wallpaperType === 'gradient' && settings.gradientId === preset.id && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                        <Check className="h-5 w-5 text-[#00a884]" />
                                                    </div>
                                                )}
                                                <span className="absolute bottom-1 left-1 right-1 text-[9px] text-white/80 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {preset.name}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Solid Colors */}
                            {wallpaperSubTab === 'solid' && (
                                <div className="animate-in fade-in duration-200">
                                    <h3 className="text-sm font-medium text-[#e9edef] mb-3">Warna Solid</h3>
                                    <div className="grid grid-cols-4 gap-2">
                                        {PRESET_WALLPAPERS.map((preset) => (
                                            <button
                                                key={preset.id}
                                                onClick={() => {
                                                    updateSetting('solidColor', preset.color);
                                                    updateSetting('wallpaperType', 'solid');
                                                }}
                                                className={cn(
                                                    'aspect-square rounded-lg border-2 transition-all duration-200 relative group',
                                                    settings.wallpaperType === 'solid' && settings.solidColor === preset.color
                                                        ? 'border-[#00a884] scale-105 shadow-lg shadow-[#00a884]/20'
                                                        : 'border-transparent hover:border-[#2a3942] hover:scale-102'
                                                )}
                                                style={{ backgroundColor: preset.color }}
                                                title={preset.name}
                                            >
                                                {settings.wallpaperType === 'solid' && settings.solidColor === preset.color && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <Check className="h-5 w-5 text-[#00a884]" />
                                                    </div>
                                                )}
                                                <span className="absolute bottom-1 left-1 right-1 text-[9px] text-white/80 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {preset.name}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Pattern Wallpapers */}
                            {wallpaperSubTab === 'pattern' && (
                                <div className="animate-in fade-in duration-200">
                                    <h3 className="text-sm font-medium text-[#e9edef] mb-3">Wallpaper Pattern</h3>
                                    <div className="grid grid-cols-3 gap-2">
                                        {PATTERN_PRESETS.map((preset) => (
                                            <button
                                                key={preset.id}
                                                onClick={() => {
                                                    updateSetting('patternId', preset.id);
                                                    updateSetting('wallpaperType', 'pattern');
                                                }}
                                                className={cn(
                                                    'aspect-video rounded-lg border-2 transition-all duration-200 relative overflow-hidden group',
                                                    settings.wallpaperType === 'pattern' && settings.patternId === preset.id
                                                        ? 'border-[#00a884] scale-105 shadow-lg shadow-[#00a884]/20'
                                                        : 'border-transparent hover:border-[#2a3942] hover:scale-102'
                                                )}
                                                style={{ 
                                                    backgroundColor: '#0b141a',
                                                    backgroundImage: preset.pattern,
                                                }}
                                                title={preset.name}
                                            >
                                                {settings.wallpaperType === 'pattern' && settings.patternId === preset.id && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                        <Check className="h-5 w-5 text-[#00a884]" />
                                                    </div>
                                                )}
                                                <span className="absolute bottom-1 left-1 right-1 text-[10px] text-white/80 truncate text-center">
                                                    {preset.name}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Animated Wallpapers */}
                            {wallpaperSubTab === 'animated' && (
                                <div className="animate-in fade-in duration-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-sm font-medium text-[#e9edef]">Wallpaper Animasi</h3>
                                        <button
                                            onClick={() => setIsAnimationPlaying(!isAnimationPlaying)}
                                            className="flex items-center gap-1 text-xs text-[#00a884] hover:text-[#00a884]/80 transition-colors"
                                        >
                                            {isAnimationPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                                            {isAnimationPlaying ? 'Pause' : 'Play'}
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {ANIMATED_PRESETS.map((preset) => (
                                            <button
                                                key={preset.id}
                                                onClick={() => {
                                                    updateSetting('animatedId', preset.id);
                                                    updateSetting('wallpaperType', 'animated');
                                                }}
                                                className={cn(
                                                    'relative h-20 rounded-lg border-2 transition-all duration-200 overflow-hidden',
                                                    settings.wallpaperType === 'animated' && settings.animatedId === preset.id
                                                        ? 'border-[#00a884] scale-105 shadow-lg shadow-[#00a884]/20'
                                                        : 'border-[#2a3942] hover:border-[#3a4a52]'
                                                )}
                                            >
                                                <AnimatedBackground animatedId={preset.id} isPlaying={isAnimationPlaying} />
                                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
                                                    <span className="text-xs font-medium text-white">{preset.name}</span>
                                                    <span className="text-[10px] text-white/70">{preset.description}</span>
                                                </div>
                                                {settings.wallpaperType === 'animated' && settings.animatedId === preset.id && (
                                                    <div className="absolute top-1 right-1">
                                                        <Check className="h-4 w-4 text-[#00a884]" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Custom Wallpaper */}
                            {wallpaperSubTab === 'custom' && (
                                <div className="animate-in fade-in duration-200">
                                    <h3 className="text-sm font-medium text-[#e9edef] mb-3">Wallpaper Kustom</h3>
                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleWallpaperUpload} className="hidden" />
                                    
                                    {settings.wallpaperType === 'custom' && settings.wallpaper ? (
                                        <div className="relative rounded-lg overflow-hidden group">
                                            <img src={settings.wallpaper} alt="Custom wallpaper" className="w-full h-32 object-cover" />
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                                <Button size="sm" onClick={() => fileInputRef.current?.click()} className="bg-[#00a884] hover:bg-[#00a884]/80">
                                                    <Upload className="h-4 w-4 mr-1" /> Ganti
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={removeCustomWallpaper}>
                                                    <Trash2 className="h-4 w-4 mr-1" /> Hapus
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full h-28 border-2 border-dashed border-[#2a3942] rounded-lg flex flex-col items-center justify-center gap-2 text-[#8696a0] hover:border-[#00a884] hover:text-[#00a884] transition-all duration-200 hover:bg-[#00a884]/5"
                                        >
                                            <Upload className="h-8 w-8" />
                                            <span className="text-sm">Upload gambar dari perangkat</span>
                                            <span className="text-xs text-[#8696a0]">JPG, PNG, GIF (max 5MB)</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'theme' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                            {/* Bubble Color */}
                            <div>
                                <h3 className="text-sm font-medium text-[#e9edef] mb-3">Warna Bubble Chat</h3>
                                <div className="grid grid-cols-6 gap-2">
                                    {BUBBLE_COLORS.map((bubble) => (
                                        <button
                                            key={bubble.id}
                                            onClick={() => updateSetting('bubbleColor', bubble.color)}
                                            className={cn(
                                                'aspect-square rounded-full border-2 transition-all duration-200 relative group',
                                                settings.bubbleColor === bubble.color
                                                    ? 'border-white scale-110 shadow-lg'
                                                    : 'border-transparent hover:scale-105'
                                            )}
                                            style={{ backgroundColor: bubble.color }}
                                            title={bubble.name}
                                        >
                                            {settings.bubbleColor === bubble.color && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Check className="h-4 w-4 text-white drop-shadow-lg" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Font Size */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-medium text-[#e9edef]">Ukuran Font</h3>
                                    <span className="text-sm text-[#00a884] font-medium">{settings.fontSize}px</span>
                                </div>
                                <Slider
                                    value={[settings.fontSize]}
                                    onValueChange={([value]) => updateSetting('fontSize', value)}
                                    min={12}
                                    max={20}
                                    step={1}
                                    className="w-full"
                                />
                                <div className="flex justify-between mt-2 text-xs text-[#8696a0]">
                                    <span style={{ fontSize: '12px' }}>Aa</span>
                                    <span style={{ fontSize: '16px' }}>Aa</span>
                                    <span style={{ fontSize: '20px' }}>Aa</span>
                                </div>
                            </div>

                            {/* Bubble Style */}
                            <div>
                                <h3 className="text-sm font-medium text-[#e9edef] mb-3">Gaya Bubble</h3>
                                <div className="space-y-2">
                                    {[
                                        { id: 'modern', name: 'Modern', desc: 'Sudut membulat dengan tail', preview: 'rounded-lg rounded-tr-none' },
                                        { id: 'classic', name: 'Klasik', desc: 'Sudut sedikit membulat', preview: 'rounded-md' },
                                        { id: 'minimal', name: 'Minimal', desc: 'Tanpa tail, bersih', preview: 'rounded-lg' },
                                    ].map((style) => (
                                        <button
                                            key={style.id}
                                            onClick={() => updateSetting('bubbleStyle', style.id as ChatSettings['bubbleStyle'])}
                                            className={cn(
                                                'w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200',
                                                settings.bubbleStyle === style.id
                                                    ? 'border-[#00a884] bg-[#00a884]/10'
                                                    : 'border-[#2a3942] hover:border-[#3a4a52] hover:bg-[#202c33]/50'
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div 
                                                    className={cn('w-12 h-6', style.preview)}
                                                    style={{ backgroundColor: settings.bubbleColor }}
                                                />
                                                <div className="text-left">
                                                    <p className="text-sm font-medium text-[#e9edef]">{style.name}</p>
                                                    <p className="text-xs text-[#8696a0]">{style.desc}</p>
                                                </div>
                                            </div>
                                            {settings.bubbleStyle === style.id && (
                                                <Check className="h-5 w-5 text-[#00a884]" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Enter to Send */}
                            <div className="flex items-center justify-between p-3 rounded-lg bg-[#202c33] transition-colors hover:bg-[#202c33]/80">
                                <div>
                                    <p className="text-sm font-medium text-[#e9edef]">Enter untuk Kirim</p>
                                    <p className="text-xs text-[#8696a0]">Tekan Enter untuk kirim pesan</p>
                                </div>
                                <Switch
                                    checked={settings.enterToSend}
                                    onCheckedChange={(checked) => updateSetting('enterToSend', checked)}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'animations' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                            {/* Message Animation */}
                            <div>
                                <h3 className="text-sm font-medium text-[#e9edef] mb-3">Animasi Pesan</h3>
                                <div className="space-y-2">
                                    {MESSAGE_ANIMATIONS.map((anim) => (
                                        <button
                                            key={anim.id}
                                            onClick={() => updateSetting('messageAnimation', anim.id as ChatSettings['messageAnimation'])}
                                            className={cn(
                                                'w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200',
                                                settings.messageAnimation === anim.id
                                                    ? 'border-[#00a884] bg-[#00a884]/10'
                                                    : 'border-[#2a3942] hover:border-[#3a4a52] hover:bg-[#202c33]/50'
                                            )}
                                        >
                                            <div className="text-left">
                                                <p className="text-sm font-medium text-[#e9edef]">{anim.name}</p>
                                                <p className="text-xs text-[#8696a0]">{anim.description}</p>
                                            </div>
                                            {settings.messageAnimation === anim.id && (
                                                <Check className="h-5 w-5 text-[#00a884]" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Animation Speed */}
                            <div>
                                <h3 className="text-sm font-medium text-[#e9edef] mb-3">Kecepatan Animasi</h3>
                                <div className="flex gap-2">
                                    {[
                                        { id: 'slow', name: 'Lambat' },
                                        { id: 'normal', name: 'Normal' },
                                        { id: 'fast', name: 'Cepat' },
                                    ].map((speed) => (
                                        <button
                                            key={speed.id}
                                            onClick={() => updateSetting('animationSpeed', speed.id as ChatSettings['animationSpeed'])}
                                            className={cn(
                                                'flex-1 py-2 rounded-lg border text-sm transition-all duration-200',
                                                settings.animationSpeed === speed.id
                                                    ? 'border-[#00a884] bg-[#00a884] text-white'
                                                    : 'border-[#2a3942] text-[#8696a0] hover:border-[#3a4a52]'
                                            )}
                                        >
                                            {speed.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Animation Preview */}
                            <div className="p-4 rounded-lg bg-[#202c33] border border-[#2a3942]">
                                <p className="text-xs text-[#8696a0] mb-3">Preview Animasi:</p>
                                <div className="space-y-2">
                                    <div 
                                        className={cn(
                                            'inline-block px-3 py-1.5 rounded-lg text-sm text-[#e9edef]',
                                            settings.messageAnimation === 'slide' && 'animate-slide-in-left',
                                            settings.messageAnimation === 'fade' && 'animate-fade-in',
                                            settings.messageAnimation === 'scale' && 'animate-scale-in',
                                        )}
                                        style={{ 
                                            backgroundColor: '#202c33',
                                            animationDuration: settings.animationSpeed === 'slow' ? '0.5s' : settings.animationSpeed === 'fast' ? '0.15s' : '0.3s'
                                        }}
                                        key={`preview-${Date.now()}`}
                                    >
                                        Pesan masuk
                                    </div>
                                    <div className="flex justify-end">
                                        <div 
                                            className={cn(
                                                'inline-block px-3 py-1.5 rounded-lg text-sm text-[#e9edef]',
                                                settings.messageAnimation === 'slide' && 'animate-slide-in-right',
                                                settings.messageAnimation === 'fade' && 'animate-fade-in',
                                                settings.messageAnimation === 'scale' && 'animate-scale-in',
                                            )}
                                            style={{ 
                                                backgroundColor: settings.bubbleColor,
                                                animationDuration: settings.animationSpeed === 'slow' ? '0.5s' : settings.animationSpeed === 'fast' ? '0.15s' : '0.3s'
                                            }}
                                            key={`preview-own-${Date.now()}`}
                                        >
                                            Pesan keluar
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-right-2 duration-300">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-[#202c33] transition-colors hover:bg-[#202c33]/80">
                                <div>
                                    <p className="text-sm font-medium text-[#e9edef]">Suara Notifikasi</p>
                                    <p className="text-xs text-[#8696a0]">Putar suara saat pesan masuk</p>
                                </div>
                                <Switch
                                    checked={settings.soundEnabled}
                                    onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg bg-[#202c33] transition-colors hover:bg-[#202c33]/80">
                                <div>
                                    <p className="text-sm font-medium text-[#e9edef]">Getaran</p>
                                    <p className="text-xs text-[#8696a0]">Getar saat pesan masuk (mobile)</p>
                                </div>
                                <Switch
                                    checked={settings.vibrationEnabled}
                                    onCheckedChange={(checked) => updateSetting('vibrationEnabled', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg bg-[#202c33] transition-colors hover:bg-[#202c33]/80">
                                <div>
                                    <p className="text-sm font-medium text-[#e9edef]">Preview Pesan</p>
                                    <p className="text-xs text-[#8696a0]">Tampilkan isi pesan di notifikasi</p>
                                </div>
                                <Switch
                                    checked={settings.messagePreview}
                                    onCheckedChange={(checked) => updateSetting('messagePreview', checked)}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'privacy' && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-right-2 duration-300">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-[#202c33] transition-colors hover:bg-[#202c33]/80">
                                <div>
                                    <p className="text-sm font-medium text-[#e9edef]">Tanda Dibaca</p>
                                    <p className="text-xs text-[#8696a0]">Tampilkan centang biru saat pesan dibaca</p>
                                </div>
                                <Switch
                                    checked={settings.readReceipts}
                                    onCheckedChange={(checked) => updateSetting('readReceipts', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg bg-[#202c33] transition-colors hover:bg-[#202c33]/80">
                                <div>
                                    <p className="text-sm font-medium text-[#e9edef]">Terakhir Dilihat</p>
                                    <p className="text-xs text-[#8696a0]">Tampilkan status online/terakhir dilihat</p>
                                </div>
                                <Switch
                                    checked={settings.lastSeen}
                                    onCheckedChange={(checked) => updateSetting('lastSeen', checked)}
                                />
                            </div>

                            <div className="mt-6 p-4 rounded-lg bg-[#182229] border border-[#2a3942]">
                                <p className="text-xs text-[#8696a0] leading-relaxed">
                                    💡 Jika kamu menonaktifkan tanda dibaca, kamu juga tidak akan bisa melihat tanda dibaca dari orang lain.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 bg-[#202c33] border-t border-[#2a3942]">
                    <Button onClick={onClose} className="w-full bg-[#00a884] hover:bg-[#00a884]/80 text-white transition-all duration-200 hover:shadow-lg hover:shadow-[#00a884]/20">
                        Simpan & Tutup
                    </Button>
                </div>
            </div>
        </div>
    );
}
