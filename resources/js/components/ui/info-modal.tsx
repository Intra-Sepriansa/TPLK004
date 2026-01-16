import { X, User, Clock, Star, Pin, MessageCircle, Paperclip, Users, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export function InfoModal({ isOpen, onClose, title, children }: InfoModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="relative bg-[#233138] rounded-2xl shadow-2xl border border-[#374045] w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#374045]">
                    <h3 className="text-lg font-medium text-[#e9edef]">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-[#374045] transition-colors"
                    >
                        <X className="h-5 w-5 text-[#8696a0]" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5">
                    {children}
                </div>

                {/* Footer */}
                <div className="px-5 py-4 border-t border-[#374045]">
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 bg-[#00a884] hover:bg-[#06cf9c] text-white rounded-lg font-medium transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}

interface InfoRowProps {
    icon: React.ReactNode;
    label: string;
    value: string | React.ReactNode;
    highlight?: boolean;
}

export function InfoRow({ icon, label, value, highlight }: InfoRowProps) {
    return (
        <div className="flex items-start gap-3 py-3 border-b border-[#374045] last:border-0">
            <div className="flex-shrink-0 mt-0.5 text-[#8696a0]">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-[#8696a0] mb-0.5">{label}</p>
                <p className={cn(
                    "text-sm",
                    highlight ? "text-[#00a884]" : "text-[#e9edef]"
                )}>
                    {value}
                </p>
            </div>
        </div>
    );
}

interface MessageInfoData {
    sender_name: string;
    sender_avatar?: string | null;
    created_at: string;
    edited_at?: string | null;
    is_edited: boolean;
    is_starred: boolean;
    is_pinned: boolean;
    attachments_count: number;
    reactions_count: number;
    content?: string;
}

export function MessageInfoModal({ 
    isOpen, 
    onClose, 
    data 
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    data: MessageInfoData | null;
}) {
    if (!data) return null;

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <InfoModal isOpen={isOpen} onClose={onClose} title="Info Pesan">
            {/* Sender Info */}
            <div className="flex items-center gap-3 pb-4 border-b border-[#374045]">
                {data.sender_avatar ? (
                    <img 
                        src={data.sender_avatar} 
                        alt={data.sender_name}
                        className="h-12 w-12 rounded-full object-cover"
                    />
                ) : (
                    <div className="h-12 w-12 rounded-full bg-[#6b7c85] flex items-center justify-center">
                        <User className="h-6 w-6 text-[#cfd8dc]" />
                    </div>
                )}
                <div>
                    <p className="text-[#e9edef] font-medium">{data.sender_name}</p>
                    <p className="text-xs text-[#8696a0]">Pengirim</p>
                </div>
            </div>

            {/* Message Preview */}
            {data.content && (
                <div className="py-3 border-b border-[#374045]">
                    <p className="text-xs text-[#8696a0] mb-1">Pesan</p>
                    <p className="text-sm text-[#e9edef] line-clamp-3">{data.content}</p>
                </div>
            )}

            {/* Details */}
            <div className="space-y-0">
                <InfoRow 
                    icon={<Clock className="h-4 w-4" />}
                    label="Dikirim"
                    value={formatDate(data.created_at)}
                />
                
                {data.is_edited && data.edited_at && (
                    <InfoRow 
                        icon={<Clock className="h-4 w-4" />}
                        label="Diedit"
                        value={formatDate(data.edited_at)}
                    />
                )}

                <InfoRow 
                    icon={<Star className="h-4 w-4" />}
                    label="Diberi Bintang"
                    value={data.is_starred ? 'Ya' : 'Tidak'}
                    highlight={data.is_starred}
                />

                <InfoRow 
                    icon={<Pin className="h-4 w-4" />}
                    label="Disematkan"
                    value={data.is_pinned ? 'Ya' : 'Tidak'}
                    highlight={data.is_pinned}
                />

                {data.attachments_count > 0 && (
                    <InfoRow 
                        icon={<Paperclip className="h-4 w-4" />}
                        label="Lampiran"
                        value={`${data.attachments_count} file`}
                    />
                )}

                {data.reactions_count > 0 && (
                    <InfoRow 
                        icon={<MessageCircle className="h-4 w-4" />}
                        label="Reaksi"
                        value={`${data.reactions_count} reaksi`}
                    />
                )}
            </div>
        </InfoModal>
    );
}

interface ContactInfoData {
    id: number;
    type: 'personal' | 'group';
    name: string;
    description?: string | null;
    avatar?: string | null;
    created_at: string;
    participants?: Array<{
        id: number;
        name: string;
        avatar?: string | null;
        role: string;
    }>;
    is_pinned: boolean;
    is_archived: boolean;
    is_muted: boolean;
}

export function ContactInfoModal({ 
    isOpen, 
    onClose, 
    data 
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    data: ContactInfoData | null;
}) {
    if (!data) return null;

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <InfoModal isOpen={isOpen} onClose={onClose} title="Info Kontak">
            {/* Avatar & Name */}
            <div className="flex flex-col items-center pb-4 border-b border-[#374045]">
                {data.avatar ? (
                    <img 
                        src={data.avatar} 
                        alt={data.name}
                        className="h-20 w-20 rounded-full object-cover mb-3"
                    />
                ) : (
                    <div className="h-20 w-20 rounded-full bg-[#6b7c85] flex items-center justify-center mb-3">
                        {data.type === 'group' ? (
                            <Users className="h-10 w-10 text-[#cfd8dc]" />
                        ) : (
                            <User className="h-10 w-10 text-[#cfd8dc]" />
                        )}
                    </div>
                )}
                <p className="text-lg text-[#e9edef] font-medium">{data.name}</p>
                <p className="text-sm text-[#8696a0]">
                    {data.type === 'group' ? 'Grup' : 'Chat Personal'}
                </p>
            </div>

            {/* Description */}
            {data.description && (
                <div className="py-3 border-b border-[#374045]">
                    <p className="text-xs text-[#8696a0] mb-1">Deskripsi</p>
                    <p className="text-sm text-[#e9edef]">{data.description}</p>
                </div>
            )}

            {/* Details */}
            <div className="space-y-0">
                <InfoRow 
                    icon={<Calendar className="h-4 w-4" />}
                    label="Dibuat"
                    value={formatDate(data.created_at)}
                />

                <InfoRow 
                    icon={<Pin className="h-4 w-4" />}
                    label="Disematkan"
                    value={data.is_pinned ? 'Ya' : 'Tidak'}
                    highlight={data.is_pinned}
                />

                <InfoRow 
                    icon={<Star className="h-4 w-4" />}
                    label="Diarsipkan"
                    value={data.is_archived ? 'Ya' : 'Tidak'}
                    highlight={data.is_archived}
                />
            </div>

            {/* Participants for Group */}
            {data.type === 'group' && data.participants && data.participants.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[#374045]">
                    <p className="text-xs text-[#8696a0] mb-3">
                        {data.participants.length} Anggota
                    </p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {data.participants.map((p) => (
                            <div key={p.id} className="flex items-center gap-3 py-2">
                                {p.avatar ? (
                                    <img 
                                        src={p.avatar} 
                                        alt={p.name}
                                        className="h-8 w-8 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="h-8 w-8 rounded-full bg-[#6b7c85] flex items-center justify-center">
                                        <User className="h-4 w-4 text-[#cfd8dc]" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-[#e9edef] truncate">{p.name}</p>
                                </div>
                                {p.role === 'admin' && (
                                    <span className="text-xs text-[#00a884] bg-[#00a884]/10 px-2 py-0.5 rounded">
                                        Admin
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </InfoModal>
    );
}
