import { useState, useRef } from 'react';
import { X, Image, Palette, Type, Bell, Shield, ChevronRight, Upload, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

export interface ChatSettings {
    wallpaper: string | null;
    wallpaperType: 'preset' | 'custom' | 'solid';
    solidColor: string;
    bubbleColor: string;
    fontSize: number;
    bubbleStyle: 'modern' | 'classic' | 'minimal';
    soundEnabled: boolean;
    vibrationEnabled: boolean;
    messagePreview: boolean;
    readReceipts: boolean;
    lastSeen: boolean;
    enterToSend: boolean;
}

export const DEFAULT_SETTINGS: ChatSettings = {
    wallpaper: null,
    wallpaperType: 'preset',
    solidColor: '#0b141a',
    bubbleColor: '#005c4b',
    fontSize: 14,
    bubbleStyle: 'modern',
    soundEnabled: true,
    vibrationEnabled: true,
    messagePreview: true,
    readReceipts: true,
    lastSeen: true,
    enterToSend: true,
};

const PRESET_WALLPAPERS = [
    { id: 'default', name: 'Default', color: '#0b141a' },
    { id: 'dark', name: 'Dark', color: '#000000' },
    { id: 'navy', name: 'Navy', color: '#1a1a2e' },
    { id: 'forest', name: 'Forest', color: '#1b4332' },
    { id: 'wine', name: 'Wine', color: '#3c1518' },
    { id: 'ocean', name: 'Ocean', color: '#023e8a' },
];

const BUBBLE_COLORS = [
    { id: 'green', color: '#005c4b', name: 'WhatsApp Green' },
    { id: 'blue', color: '#0088cc', name: 'Telegram Blue' },
    { id: 'purple', color: '#7c3aed', name: 'Purple' },
    { id: 'pink', color: '#db2777', name: 'Pink' },
    { id: 'orange', color: '#ea580c', name: 'Orange' },
    { id: 'red', color: '#dc2626', name: 'Red' },
];

interface ChatSettingsProps {
    settings: ChatSettings;
    onSettingsChange: (settings: ChatSettings) => void;
    onClose: () => void;
}

type SettingsTab = 'wallpaper' | 'theme' | 'notifications' | 'privacy';

export function ChatSettingsPanel({ settings, onSettingsChange, onClose }: ChatSettingsProps) {
    const [activeTab, setActiveTab] = useState<SettingsTab>('wallpaper');
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
        updateSetting('wallpaperType', 'preset');
    };

    const tabs = [
        { id: 'wallpaper' as const, icon: Image, label: 'Wallpaper' },
        { id: 'theme' as const, icon: Palette, label: 'Tema' },
        { id: 'notifications' as const, icon: Bell, label: 'Notifikasi' },
        { id: 'privacy' as const, icon: Shield, label: 'Privasi' },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-[#111b21] rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-[#202c33] border-b border-[#2a3942]">
                    <h2 className="text-lg font-medium text-[#e9edef]">Pengaturan Chat</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="text-[#aebac1] hover:bg-[#374045]">
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[#2a3942]">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                'flex-1 flex items-center justify-center gap-2 py-3 text-sm transition-colors',
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
                        <div className="space-y-6">
                            {/* Custom Wallpaper Upload */}
                            <div>
                                <h3 className="text-sm font-medium text-[#e9edef] mb-3">Wallpaper Kustom</h3>
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleWallpaperUpload} className="hidden" />
                                
                                {settings.wallpaperType === 'custom' && settings.wallpaper ? (
                                    <div className="relative rounded-lg overflow-hidden">
                                        <img src={settings.wallpaper} alt="Custom wallpaper" className="w-full h-32 object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
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
                                        className="w-full h-24 border-2 border-dashed border-[#2a3942] rounded-lg flex flex-col items-center justify-center gap-2 text-[#8696a0] hover:border-[#00a884] hover:text-[#00a884] transition-colors"
                                    >
                                        <Upload className="h-6 w-6" />
                                        <span className="text-sm">Upload gambar</span>
                                    </button>
                                )}
                            </div>

                            {/* Preset Wallpapers */}
                            <div>
                                <h3 className="text-sm font-medium text-[#e9edef] mb-3">Warna Solid</h3>
                                <div className="grid grid-cols-6 gap-2">
                                    {PRESET_WALLPAPERS.map((preset) => (
                                        <button
                                            key={preset.id}
                                            onClick={() => {
                                                updateSetting('solidColor', preset.color);
                                                updateSetting('wallpaperType', 'solid');
                                                updateSetting('wallpaper', null);
                                            }}
                                            className={cn(
                                                'aspect-square rounded-lg border-2 transition-all relative',
                                                settings.wallpaperType === 'solid' && settings.solidColor === preset.color
                                                    ? 'border-[#00a884] scale-110'
                                                    : 'border-transparent hover:border-[#2a3942]'
                                            )}
                                            style={{ backgroundColor: preset.color }}
                                            title={preset.name}
                                        >
                                            {settings.wallpaperType === 'solid' && settings.solidColor === preset.color && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Check className="h-4 w-4 text-[#00a884]" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'theme' && (
                        <div className="space-y-6">
                            {/* Bubble Color */}
                            <div>
                                <h3 className="text-sm font-medium text-[#e9edef] mb-3">Warna Bubble Chat</h3>
                                <div className="grid grid-cols-6 gap-2">
                                    {BUBBLE_COLORS.map((bubble) => (
                                        <button
                                            key={bubble.id}
                                            onClick={() => updateSetting('bubbleColor', bubble.color)}
                                            className={cn(
                                                'aspect-square rounded-full border-2 transition-all relative',
                                                settings.bubbleColor === bubble.color
                                                    ? 'border-white scale-110'
                                                    : 'border-transparent hover:scale-105'
                                            )}
                                            style={{ backgroundColor: bubble.color }}
                                            title={bubble.name}
                                        >
                                            {settings.bubbleColor === bubble.color && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Check className="h-4 w-4 text-white" />
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
                                    <span className="text-sm text-[#8696a0]">{settings.fontSize}px</span>
                                </div>
                                <Slider
                                    value={[settings.fontSize]}
                                    onValueChange={([value]) => updateSetting('fontSize', value)}
                                    min={12}
                                    max={20}
                                    step={1}
                                    className="w-full"
                                />
                                <div className="flex justify-between mt-1 text-xs text-[#8696a0]">
                                    <span>Kecil</span>
                                    <span>Besar</span>
                                </div>
                            </div>

                            {/* Bubble Style */}
                            <div>
                                <h3 className="text-sm font-medium text-[#e9edef] mb-3">Gaya Bubble</h3>
                                <div className="space-y-2">
                                    {[
                                        { id: 'modern', name: 'Modern', desc: 'Sudut membulat dengan tail' },
                                        { id: 'classic', name: 'Klasik', desc: 'Sudut sedikit membulat' },
                                        { id: 'minimal', name: 'Minimal', desc: 'Tanpa tail, bersih' },
                                    ].map((style) => (
                                        <button
                                            key={style.id}
                                            onClick={() => updateSetting('bubbleStyle', style.id as ChatSettings['bubbleStyle'])}
                                            className={cn(
                                                'w-full flex items-center justify-between p-3 rounded-lg border transition-colors',
                                                settings.bubbleStyle === style.id
                                                    ? 'border-[#00a884] bg-[#00a884]/10'
                                                    : 'border-[#2a3942] hover:border-[#3a4a52]'
                                            )}
                                        >
                                            <div className="text-left">
                                                <p className="text-sm font-medium text-[#e9edef]">{style.name}</p>
                                                <p className="text-xs text-[#8696a0]">{style.desc}</p>
                                            </div>
                                            {settings.bubbleStyle === style.id && (
                                                <Check className="h-5 w-5 text-[#00a884]" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Enter to Send */}
                            <div className="flex items-center justify-between p-3 rounded-lg bg-[#202c33]">
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

                    {activeTab === 'notifications' && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-[#202c33]">
                                <div>
                                    <p className="text-sm font-medium text-[#e9edef]">Suara Notifikasi</p>
                                    <p className="text-xs text-[#8696a0]">Putar suara saat pesan masuk</p>
                                </div>
                                <Switch
                                    checked={settings.soundEnabled}
                                    onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg bg-[#202c33]">
                                <div>
                                    <p className="text-sm font-medium text-[#e9edef]">Getaran</p>
                                    <p className="text-xs text-[#8696a0]">Getar saat pesan masuk (mobile)</p>
                                </div>
                                <Switch
                                    checked={settings.vibrationEnabled}
                                    onCheckedChange={(checked) => updateSetting('vibrationEnabled', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg bg-[#202c33]">
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
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-[#202c33]">
                                <div>
                                    <p className="text-sm font-medium text-[#e9edef]">Tanda Dibaca</p>
                                    <p className="text-xs text-[#8696a0]">Tampilkan centang biru saat pesan dibaca</p>
                                </div>
                                <Switch
                                    checked={settings.readReceipts}
                                    onCheckedChange={(checked) => updateSetting('readReceipts', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg bg-[#202c33]">
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
                    <Button onClick={onClose} className="w-full bg-[#00a884] hover:bg-[#00a884]/80 text-white">
                        Simpan & Tutup
                    </Button>
                </div>
            </div>
        </div>
    );
}
