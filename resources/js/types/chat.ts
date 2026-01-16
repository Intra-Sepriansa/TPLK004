export interface ChatUser {
    id: number;
    type: string;
    name: string;
    identifier: string;
    avatar: string | null;
    is_online?: boolean;
    last_seen?: string | null;
}

export interface Participant {
    id: number;
    participant_id: number;
    participant_type: string;
    name: string;
    avatar: string | null;
    role: 'admin' | 'member';
    is_current: boolean;
    is_online?: boolean;
    last_seen?: string | null;
}

export interface Attachment {
    id: number;
    file_name: string;
    file_type: string;
    file_size: string;
    url: string;
    is_image: boolean;
}

export interface Reaction {
    emoji: string;
    count: number;
    users: string[];
}

export interface ReplyTo {
    id: number;
    content: string;
    sender_name: string;
}

export interface Message {
    id: number;
    conversation_id: number;
    sender_type: string;
    sender_id: number;
    sender_name: string;
    sender_avatar: string | null;
    content: string;
    type: 'text' | 'image' | 'file' | 'system';
    is_own: boolean;
    is_edited: boolean;
    is_deleted: boolean;
    can_edit: boolean;
    is_starred?: boolean;
    is_pinned?: boolean;
    status?: 'sent' | 'delivered' | 'read'; // sent = 1 ceklis, delivered = 2 ceklis abu, read = 2 ceklis biru
    reply_to: ReplyTo | null;
    attachments: Attachment[];
    reactions: Reaction[];
    created_at: string;
}

export interface LastMessage {
    content: string;
    sender_name: string;
    created_at: string;
    is_own?: boolean;
    status?: 'sent' | 'delivered' | 'read'; // untuk menampilkan ceklis di conversation list
}

export interface ConversationListItem {
    id: number;
    type: 'personal' | 'group';
    name: string;
    avatar: string | null;
    last_message: LastMessage | null;
    unread_count: number;
    updated_at: string;
    is_archived?: boolean;
    is_pinned?: boolean;
    is_muted?: boolean;
    is_online?: boolean;
    last_seen?: string | null;
}

export interface ConversationDetail {
    id: number;
    type: 'personal' | 'group';
    name: string;
    description: string | null;
    avatar: string | null;
    participants: Participant[];
    messages: Message[];
    is_admin: boolean;
    is_online?: boolean;
    last_seen?: string | null;
}

export interface TypingUser {
    user_id: number;
    user_type: string;
    user_name: string;
}
