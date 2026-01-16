import { useState, useMemo } from 'react';
import { Users, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatAvatarProps {
    name: string;
    avatar?: string | null;
    type?: 'personal' | 'group';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    isOnline?: boolean;
    showOnlineIndicator?: boolean;
    className?: string;
}

// Generate consistent color based on name
function getAvatarColor(name: string): { bg: string; text: string; gradient: string } {
    const colors = [
        { bg: '#00a884', text: '#ffffff', gradient: 'from-[#00a884] to-[#00d4aa]' },
        { bg: '#7c3aed', text: '#ffffff', gradient: 'from-[#7c3aed] to-[#a855f7]' },
        { bg: '#0088cc', text: '#ffffff', gradient: 'from-[#0088cc] to-[#00b4ff]' },
        { bg: '#db2777', text: '#ffffff', gradient: 'from-[#db2777] to-[#f472b6]' },
        { bg: '#ea580c', text: '#ffffff', gradient: 'from-[#ea580c] to-[#fb923c]' },
        { bg: '#059669', text: '#ffffff', gradient: 'from-[#059669] to-[#34d399]' },
        { bg: '#4f46e5', text: '#ffffff', gradient: 'from-[#4f46e5] to-[#818cf8]' },
        { bg: '#0891b2', text: '#ffffff', gradient: 'from-[#0891b2] to-[#22d3ee]' },
        { bg: '#dc2626', text: '#ffffff', gradient: 'from-[#dc2626] to-[#f87171]' },
        { bg: '#d97706', text: '#ffffff', gradient: 'from-[#d97706] to-[#fbbf24]' },
        { bg: '#0d9488', text: '#ffffff', gradient: 'from-[#0d9488] to-[#2dd4bf]' },
        { bg: '#e11d48', text: '#ffffff', gradient: 'from-[#e11d48] to-[#fb7185]' },
    ];
    
    // Generate hash from name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
}

// Get initials from name
function getInitials(name: string): string {
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
};

const onlineIndicatorSizes = {
    sm: 'w-2.5 h-2.5 border',
    md: 'w-3 h-3 border-2',
    lg: 'w-3.5 h-3.5 border-2',
    xl: 'w-4 h-4 border-2',
};

export function ChatAvatar({ 
    name, 
    avatar, 
    type = 'personal', 
    size = 'md',
    isOnline = false,
    showOnlineIndicator = true,
    className,
}: ChatAvatarProps) {
    const [imageError, setImageError] = useState(false);
    const color = useMemo(() => getAvatarColor(name), [name]);
    const initials = useMemo(() => getInitials(name), [name]);

    const handleImageError = () => {
        setImageError(true);
    };

    // If has valid avatar image
    if (avatar && !imageError) {
        return (
            <div className={cn('relative flex-shrink-0', className)}>
                <div className={cn(
                    'rounded-full overflow-hidden ring-2 ring-transparent hover:ring-[#00a884]/30 transition-all duration-200',
                    sizeClasses[size]
                )}>
                    <img 
                        src={avatar} 
                        alt={name} 
                        className="h-full w-full object-cover"
                        onError={handleImageError}
                    />
                </div>
                {/* Online indicator */}
                {showOnlineIndicator && type === 'personal' && isOnline && (
                    <div className={cn(
                        'absolute bottom-0 right-0 bg-[#00a884] rounded-full border-[#111b21] animate-pulse',
                        onlineIndicatorSizes[size]
                    )} />
                )}
            </div>
        );
    }

    // Fallback to initials avatar
    return (
        <div className={cn('relative flex-shrink-0', className)}>
            <div 
                className={cn(
                    'rounded-full flex items-center justify-center font-semibold',
                    'bg-gradient-to-br shadow-lg',
                    'ring-2 ring-transparent hover:ring-[#00a884]/30 transition-all duration-200',
                    'hover:scale-105 cursor-pointer',
                    sizeClasses[size],
                    color.gradient
                )}
                style={{ 
                    background: `linear-gradient(135deg, ${color.bg} 0%, ${color.bg}dd 100%)`,
                }}
            >
                {type === 'group' ? (
                    <Users className={cn(
                        'text-white/90',
                        size === 'sm' && 'h-4 w-4',
                        size === 'md' && 'h-5 w-5',
                        size === 'lg' && 'h-6 w-6',
                        size === 'xl' && 'h-8 w-8',
                    )} />
                ) : (
                    <span className="text-white font-medium tracking-wide drop-shadow-sm">
                        {initials}
                    </span>
                )}
            </div>
            {/* Online indicator */}
            {showOnlineIndicator && type === 'personal' && isOnline && (
                <div className={cn(
                    'absolute bottom-0 right-0 bg-[#00a884] rounded-full border-[#111b21]',
                    onlineIndicatorSizes[size]
                )}>
                    <div className="absolute inset-0 bg-[#00a884] rounded-full animate-ping opacity-75" />
                </div>
            )}
        </div>
    );
}

// Advanced Avatar with status ring
export function ChatAvatarAdvanced({ 
    name, 
    avatar, 
    type = 'personal', 
    size = 'md',
    isOnline = false,
    showOnlineIndicator = true,
    status,
    className,
}: ChatAvatarProps & { status?: 'active' | 'away' | 'busy' | 'offline' }) {
    const [imageError, setImageError] = useState(false);
    const color = useMemo(() => getAvatarColor(name), [name]);
    const initials = useMemo(() => getInitials(name), [name]);

    const handleImageError = () => {
        setImageError(true);
    };

    const statusColors = {
        active: 'ring-[#00a884]',
        away: 'ring-[#d97706]',
        busy: 'ring-[#dc2626]',
        offline: 'ring-[#6b7c85]',
    };

    const statusIndicatorColors = {
        active: 'bg-[#00a884]',
        away: 'bg-[#d97706]',
        busy: 'bg-[#dc2626]',
        offline: 'bg-[#6b7c85]',
    };

    const currentStatus = isOnline ? 'active' : (status || 'offline');

    // If has valid avatar image
    if (avatar && !imageError) {
        return (
            <div className={cn('relative flex-shrink-0 group', className)}>
                {/* Outer glow ring */}
                <div className={cn(
                    'absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                    'bg-gradient-to-r from-[#00a884]/20 to-[#00d4aa]/20 blur-md scale-110'
                )} />
                
                <div className={cn(
                    'relative rounded-full overflow-hidden ring-2 transition-all duration-300',
                    statusColors[currentStatus],
                    'group-hover:ring-4 group-hover:shadow-lg',
                    sizeClasses[size]
                )}>
                    <img 
                        src={avatar} 
                        alt={name} 
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={handleImageError}
                    />
                </div>
                
                {/* Status indicator */}
                {showOnlineIndicator && type === 'personal' && (
                    <div className={cn(
                        'absolute bottom-0 right-0 rounded-full border-[#111b21] transition-all duration-300',
                        statusIndicatorColors[currentStatus],
                        onlineIndicatorSizes[size],
                        currentStatus === 'active' && 'animate-pulse'
                    )} />
                )}
            </div>
        );
    }

    // Fallback to advanced initials avatar
    return (
        <div className={cn('relative flex-shrink-0 group', className)}>
            {/* Outer glow ring */}
            <div 
                className={cn(
                    'absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md scale-125'
                )}
                style={{ background: `${color.bg}40` }}
            />
            
            <div 
                className={cn(
                    'relative rounded-full flex items-center justify-center font-semibold',
                    'ring-2 transition-all duration-300',
                    'group-hover:ring-4 group-hover:shadow-xl group-hover:scale-105',
                    statusColors[currentStatus],
                    sizeClasses[size],
                )}
                style={{ 
                    background: `linear-gradient(135deg, ${color.bg} 0%, ${color.bg}cc 50%, ${color.bg}99 100%)`,
                    boxShadow: `0 4px 15px ${color.bg}40`,
                }}
            >
                {/* Inner shine effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-white/10 to-white/20 opacity-50" />
                
                {type === 'group' ? (
                    <Users className={cn(
                        'text-white relative z-10 drop-shadow-md',
                        size === 'sm' && 'h-4 w-4',
                        size === 'md' && 'h-5 w-5',
                        size === 'lg' && 'h-6 w-6',
                        size === 'xl' && 'h-8 w-8',
                    )} />
                ) : (
                    <span className="text-white font-bold tracking-wide drop-shadow-md relative z-10">
                        {initials}
                    </span>
                )}
            </div>
            
            {/* Status indicator */}
            {showOnlineIndicator && type === 'personal' && (
                <div className={cn(
                    'absolute bottom-0 right-0 rounded-full border-[#111b21] transition-all duration-300',
                    statusIndicatorColors[currentStatus],
                    onlineIndicatorSizes[size],
                )}>
                    {currentStatus === 'active' && (
                        <div className="absolute inset-0 rounded-full animate-ping opacity-75" 
                            style={{ background: statusIndicatorColors[currentStatus].replace('bg-', '') }} 
                        />
                    )}
                </div>
            )}
        </div>
    );
}
