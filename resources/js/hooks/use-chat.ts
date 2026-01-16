import { useEffect, useState, useCallback } from 'react';
import type { Message, TypingUser } from '@/types/chat';

interface UseChatOptions {
    conversationId: number;
    onNewMessage?: (message: Message) => void;
    onMessageDeleted?: (messageId: number) => void;
    onTyping?: (user: TypingUser, isTyping: boolean) => void;
    onMessageRead?: (userId: number, userType: string, readAt: string) => void;
}

export function useChat({ conversationId, onNewMessage, onMessageDeleted, onTyping, onMessageRead }: UseChatOptions) {
    const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Check if Echo is available
        if (typeof window === 'undefined' || !(window as any).Echo) {
            console.warn('Laravel Echo not initialized');
            return;
        }

        const echo = (window as any).Echo;
        const channel = echo.private(`conversation.${conversationId}`);

        // Listen for new messages
        channel.listen('.message.new', (data: { message: Message }) => {
            onNewMessage?.(data.message);
        });

        // Listen for message deleted
        channel.listen('.message.deleted', (data: { message_id: number }) => {
            onMessageDeleted?.(data.message_id);
        });

        // Listen for typing indicator
        channel.listen('.user.typing', (data: TypingUser & { is_typing: boolean }) => {
            if (data.is_typing) {
                setTypingUsers(prev => {
                    const exists = prev.some(u => u.user_id === data.user_id && u.user_type === data.user_type);
                    if (exists) return prev;
                    return [...prev, { user_id: data.user_id, user_type: data.user_type, user_name: data.user_name }];
                });
            } else {
                setTypingUsers(prev => prev.filter(u => !(u.user_id === data.user_id && u.user_type === data.user_type)));
            }
            onTyping?.(data, data.is_typing);
        });

        // Listen for message read
        channel.listen('.message.read', (data: { user_id: number; user_type: string; read_at: string }) => {
            onMessageRead?.(data.user_id, data.user_type, data.read_at);
        });

        setIsConnected(true);

        return () => {
            echo.leave(`conversation.${conversationId}`);
            setIsConnected(false);
        };
    }, [conversationId, onNewMessage, onMessageDeleted, onTyping, onMessageRead]);

    // Clear typing users after timeout
    useEffect(() => {
        const timer = setInterval(() => {
            setTypingUsers([]);
        }, 5000);

        return () => clearInterval(timer);
    }, []);

    return {
        typingUsers,
        isConnected,
    };
}
