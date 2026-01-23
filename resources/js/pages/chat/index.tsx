import { useState, useEffect, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
import { MessageCircle, Plus, Search, Users, X, ArrowLeft } from 'lucide-react';
import { ConversationList } from '@/components/chat/conversation-list';
import { ChatWindow } from '@/components/chat/chat-window';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ToastProvider, useToast } from '@/components/ui/toast-notification';
import { MessageInfoModal, ContactInfoModal } from '@/components/ui/info-modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { apiPost, apiPut, apiDelete, apiGet, isCsrfError } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ConversationListItem, ConversationDetail, Message, TypingUser, ChatUser } from '@/types/chat';

interface PageProps {
    conversations: ConversationListItem[];
    activeConversation?: ConversationDetail;
    currentUser: ChatUser;
    auth: {
        user: any;
    };
    dosen: any;
}

function ChatContent({ conversations, activeConversation, currentUser, auth, dosen }: PageProps) {
    const { showSuccess, showError, showInfo } = useToast();
    const [replyTo, setReplyTo] = useState<Message | null>(null);
    const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
    const [showNewChat, setShowNewChat] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<ChatUser[]>([]);
    const [searching, setSearching] = useState(false);
    const [showMobileList, setShowMobileList] = useState(!activeConversation);
    
    // Modal states
    const [messageInfoData, setMessageInfoData] = useState<any>(null);
    const [contactInfoData, setContactInfoData] = useState<any>(null);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; message: Message | null }>({ open: false, message: null });

    // Determine dashboard URL based on user type
    const getDashboardUrl = () => {
        if (auth.user) {
            return '/admin/dashboard'; // Admin user
        } else if (dosen) {
            return '/dosen/dashboard'; // Dosen user
        } else {
            return '/user/dashboard'; // Mahasiswa user
        }
    };

    const handleSelectConversation = (id: number) => {
        router.get(`/chat/${id}`, {}, { preserveState: true });
        setShowMobileList(false);
    };

    const handleSendMessage = async (content: string, attachments: File[]) => {
        if (!activeConversation) return;

        const formData = new FormData();
        formData.append('content', content);
        if (replyTo) {
            formData.append('reply_to_id', replyTo.id.toString());
        }
        attachments.forEach((file, index) => {
            formData.append(`attachments[${index}]`, file);
        });

        try {
            const response = await apiPost(`/api/chat/conversations/${activeConversation.id}/messages`, formData);

            if (response.ok) {
                setReplyTo(null);
                router.reload({ only: ['activeConversation', 'conversations'] });
            } else if (isCsrfError(response)) {
                showError('Sesi kedaluwarsa', 'Halaman akan dimuat ulang...');
                setTimeout(() => window.location.reload(), 1500);
            } else {
                const errorData = await response.json().catch(() => ({}));
                showError('Gagal mengirim pesan', errorData.error || errorData.message || 'Terjadi kesalahan');
            }
        } catch (error) {
            showError('Gagal mengirim pesan', 'Silakan coba lagi');
        }
    };

    const handleTyping = async (isTyping: boolean) => {
        if (!activeConversation) return;
        try {
            await apiPost(`/api/chat/conversations/${activeConversation.id}/typing`, { is_typing: isTyping });
        } catch (error) {}
    };

    const handleReply = (message: Message) => setReplyTo(message);
    const handleCancelReply = () => setReplyTo(null);

    const handleEdit = async (message: Message, newContent: string) => {
        try {
            const response = await apiPut(`/api/chat/messages/${message.id}`, { content: newContent });
            if (response.ok) {
                router.reload({ only: ['activeConversation'] });
            }
        } catch (error) {}
    };

    const openDeleteDialog = (message: Message) => setDeleteDialog({ open: true, message });
    
    const handleDelete = async () => {
        if (!deleteDialog.message) return;
        try {
            const response = await apiDelete(`/api/chat/messages/${deleteDialog.message.id}`);
            if (response.ok) {
                router.reload({ only: ['activeConversation'] });
            }
        } catch (error) {}
        setDeleteDialog({ open: false, message: null });
    };

    const handleForward = async (message: Message) => {
        const targetConvId = prompt('Masukkan ID percakapan tujuan:');
        if (!targetConvId) return;
        
        try {
            const response = await apiPost(`/api/chat/messages/${message.id}/forward`, { conversation_ids: [parseInt(targetConvId)] });
            if (response.ok) {
                const data = await response.json();
                showSuccess('Pesan diteruskan', data.message || 'Berhasil meneruskan pesan', 'forward');
            } else {
                showError('Gagal meneruskan', 'Pesan tidak dapat diteruskan');
            }
        } catch (error) {
            showError('Gagal meneruskan', 'Terjadi kesalahan');
        }
    };

    const handleReact = async (message: Message, emoji: string) => {
        try {
            await apiPost(`/api/chat/messages/${message.id}/reactions`, { emoji });
            router.reload({ only: ['activeConversation'] });
        } catch (error) {}
    };

    const handleLoadMore = () => {};

    const searchContacts = useCallback(async (query: string) => {
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }
        setSearching(true);
        try {
            const response = await apiGet(`/chat/contacts/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            setSearchResults(data.contacts || []);
        } catch (error) {}
        setSearching(false);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => searchContacts(searchQuery), 300);
        return () => clearTimeout(timer);
    }, [searchQuery, searchContacts]);

    const startConversation = (contact: ChatUser) => {
        router.post('/chat', {
            type: 'personal',
            participant_id: contact.id,
            participant_type: contact.type,
        });
        setShowNewChat(false);
        setSearchQuery('');
        setSearchResults([]);
    };

    return (
        <>
            <Head title="Chat" />

            <div className="flex h-screen bg-[#111b21]">
                {/* Header with Back Button */}
                <div className="absolute top-0 left-0 right-0 z-20 bg-[#202c33] border-b border-[#222d34] px-4 py-3 flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.get(getDashboardUrl())}
                        className="h-10 w-10 text-[#aebac1] hover:bg-[#374045]"
                        title="Kembali ke Dashboard"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-lg font-medium text-[#e9edef]">Chat</h1>
                </div>

                {/* Sidebar */}
                <div className={cn(
                    'w-full md:w-[30%] lg:w-[25%] min-w-[300px] max-w-[500px] border-r border-[#222d34] pt-16',
                    'md:block',
                    showMobileList ? 'block' : 'hidden'
                )}>
                    <ConversationList
                        conversations={conversations}
                        activeId={activeConversation?.id}
                        currentUser={currentUser}
                        onSelect={handleSelectConversation}
                        onNewChat={() => setShowNewChat(true)}
                        onArchive={async (conv) => {
                            try {
                                const response = await apiPost(`/api/chat/conversations/${conv.id}/archive`);
                                if (response.ok) {
                                    const data = await response.json();
                                    showSuccess(data.message, undefined, 'archive');
                                    router.reload({ only: ['conversations'] });
                                }
                            } catch (error) {
                                showError('Gagal', 'Tidak dapat mengarsipkan chat');
                            }
                        }}
                        onPin={async (conv) => {
                            try {
                                const response = await apiPost(`/api/chat/conversations/${conv.id}/pin`);
                                if (response.ok) {
                                    const data = await response.json();
                                    showSuccess(data.message, undefined, 'pin');
                                    router.reload({ only: ['conversations'] });
                                }
                            } catch (error) {
                                showError('Gagal', 'Tidak dapat menyematkan chat');
                            }
                        }}
                        onMute={async (conv) => {
                            try {
                                const response = await apiPost(`/api/chat/conversations/${conv.id}/mute`);
                                if (response.ok) {
                                    const data = await response.json();
                                    showSuccess(data.message, undefined, 'mute');
                                    router.reload({ only: ['conversations'] });
                                }
                            } catch (error) {
                                showError('Gagal', 'Tidak dapat membisukan notifikasi');
                            }
                        }}
                        onContactInfo={async (conv) => {
                            try {
                                const response = await apiGet(`/api/chat/conversations/${conv.id}/info`);
                                if (response.ok) {
                                    const data = await response.json();
                                    setContactInfoData(data);
                                }
                            } catch (error) {
                                showError('Gagal', 'Tidak dapat memuat info kontak');
                            }
                        }}
                    />
                </div>

                {/* Main Chat Area */}
                <div className={cn(
                    'flex-1 flex flex-col pt-16',
                    'md:flex',
                    showMobileList ? 'hidden' : 'flex'
                )}>
                    {activeConversation ? (
                        <ChatWindow
                            conversation={activeConversation}
                            typingUsers={typingUsers}
                            onSendMessage={handleSendMessage}
                            onTyping={handleTyping}
                            onReply={handleReply}
                            onEdit={handleEdit}
                            onDelete={openDeleteDialog}
                            onForward={handleForward}
                            onReact={handleReact}
                            onStar={async (message) => {
                                try {
                                    const response = await apiPost(`/api/chat/messages/${message.id}/star`);
                                    if (response.ok) {
                                        const data = await response.json();
                                        showSuccess(data.message, undefined, 'star');
                                        router.reload({ only: ['activeConversation'] });
                                    }
                                } catch (error) {
                                    showError('Gagal', 'Tidak dapat memberi bintang');
                                }
                            }}
                            onPin={async (message) => {
                                try {
                                    const response = await apiPost(`/api/chat/messages/${message.id}/pin`);
                                    if (response.ok) {
                                        const data = await response.json();
                                        showSuccess(data.message, undefined, 'pin');
                                        router.reload({ only: ['activeConversation'] });
                                    }
                                } catch (error) {
                                    showError('Gagal', 'Tidak dapat menyematkan pesan');
                                }
                            }}
                            onInfo={async (message) => {
                                try {
                                    const response = await apiGet(`/api/chat/messages/${message.id}/info`);
                                    if (response.ok) {
                                        const data = await response.json();
                                        setMessageInfoData(data);
                                    }
                                } catch (error) {
                                    showError('Gagal', 'Tidak dapat memuat info pesan');
                                }
                            }}
                            onLoadMore={handleLoadMore}
                            onBack={() => setShowMobileList(true)}
                            replyTo={replyTo}
                            onCancelReply={handleCancelReply}
                        />
                    ) : (
                        /* Empty state - Komunikasi Kelas */
                        <div className="flex-1 flex flex-col items-center justify-center bg-[#222e35]">
                            <div className="text-center max-w-md px-8">
                                {/* Icon Komunikasi Kelas */}
                                <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-[#00a884]/10 flex items-center justify-center">
                                    <svg viewBox="0 0 24 24" className="w-16 h-16 text-[#00a884]" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 0v2m0-2h2m-2 0H10" />
                                    </svg>
                                </div>
                                <h1 className="text-[28px] font-medium text-[#e9edef] mb-3">
                                    Komunikasi Kelas
                                </h1>
                                <p className="text-sm text-[#8696a0] leading-relaxed mb-6">
                                    Mulai percakapan dengan dosen atau mahasiswa lain.
                                    <br />
                                    Diskusi tugas, tanya jawab, dan koordinasi kelas jadi lebih mudah.
                                </p>
                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={() => setShowNewChat(true)}
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-[#00a884] hover:bg-[#06cf9c] text-white rounded-lg font-medium transition-colors"
                                    >
                                        <Plus className="h-5 w-5" />
                                        Mulai Chat Baru
                                    </button>
                                </div>
                                <div className="flex items-center justify-center gap-2 text-[#8696a0] text-xs mt-8">
                                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                                    </svg>
                                    <span>Pesan terenkripsi dan aman</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* New Chat Dialog */}
            <Dialog open={showNewChat} onOpenChange={setShowNewChat}>
                <DialogContent className="sm:max-w-md bg-[#111b21] border-[#222d34] text-[#e9edef]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-[#e9edef]">
                            <Button variant="ghost" size="icon" onClick={() => setShowNewChat(false)} className="text-[#aebac1] hover:bg-[#202c33]">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            Chat baru
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2">
                        <div className="relative px-3">
                            <Search className="absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8696a0]" />
                            <Input
                                placeholder="Cari nama atau NIM"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-[#202c33] border-0 text-[#e9edef] placeholder:text-[#8696a0] rounded-lg h-9"
                                autoFocus
                            />
                        </div>

                        <div className="max-h-80 overflow-y-auto">
                            {searching ? (
                                <div className="flex justify-center py-8">
                                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#00a884] border-t-transparent" />
                                </div>
                            ) : searchResults.length > 0 ? (
                                <div>
                                    {searchResults.map((contact) => (
                                        <button
                                            key={`${contact.type}-${contact.id}`}
                                            onClick={() => startConversation(contact)}
                                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#202c33] transition-colors"
                                        >
                                            {contact.avatar ? (
                                                <img src={contact.avatar} alt={contact.name} className="h-12 w-12 rounded-full object-cover" />
                                            ) : (
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#6b7c85] overflow-hidden">
                                                    <svg viewBox="0 0 212 212" className="h-12 w-12">
                                                        <path fill="#6b7c85" d="M106.251,0.5C164.653,0.5,212,47.846,212,106.25S164.653,212,106.251,212C47.846,212,0.5,164.654,0.5,106.25S47.846,0.5,106.251,0.5z"/>
                                                        <path fill="#cfd8dc" d="M173.561,171.615c-0.601-0.915-1.287-1.907-2.065-2.955c-0.777-1.049-1.645-2.155-2.608-3.299c-0.964-1.144-2.024-2.326-3.184-3.527c-1.741-1.802-3.71-3.646-5.924-5.47c-2.952-2.431-6.339-4.824-10.204-7.026c-1.877-1.07-3.873-2.092-5.98-3.055c-0.062-0.028-0.118-0.059-0.18-0.087c-9.792-4.44-22.106-7.529-37.416-7.529s-27.624,3.089-37.416,7.529c-0.338,0.153-0.653,0.318-0.985,0.474c-1.431,0.674-2.806,1.376-4.128,2.101c-0.716,0.393-1.417,0.792-2.101,1.197c-3.421,2.027-6.475,4.191-9.15,6.395c-2.213,1.823-4.182,3.668-5.924,5.47c-1.161,1.201-2.22,2.384-3.184,3.527c-0.964,1.144-1.832,2.25-2.609,3.299c-0.778,1.049-1.464,2.04-2.065,2.955c-0.557,0.848-1.033,1.622-1.447,2.324c24.167,21.319,55.913,34.261,90.561,34.261c34.648,0,66.394-12.942,90.561-34.261C174.594,173.238,174.117,172.463,173.561,171.615z"/>
                                                        <path fill="#cfd8dc" d="M106.002,125.5c2.645,0,5.212-0.253,7.68-0.737c1.234-0.242,2.443-0.542,3.624-0.896c1.772-0.532,3.482-1.188,5.12-1.958c2.184-1.027,4.242-2.258,6.15-3.67c2.863-2.119,5.39-4.646,7.509-7.509c0.706-0.954,1.367-1.945,1.98-2.971c0.919-1.539,1.729-3.155,2.422-4.84c0.462-1.123,0.872-2.277,1.226-3.458c0.177-0.591,0.341-1.188,0.49-1.792c0.299-1.208,0.542-2.443,0.725-3.701c0.275-1.887,0.417-3.827,0.417-5.811c0-21.533-17.467-39-39-39c-21.533,0-39,17.467-39,39c0,1.983,0.142,3.923,0.417,5.811c0.184,1.258,0.426,2.493,0.725,3.701c0.15,0.604,0.313,1.202,0.49,1.792c0.354,1.181,0.764,2.335,1.226,3.458c0.693,1.685,1.504,3.301,2.422,4.84c0.613,1.026,1.274,2.017,1.98,2.971c2.119,2.863,4.646,5.39,7.509,7.509c1.909,1.412,3.966,2.643,6.15,3.67c1.638,0.77,3.348,1.426,5.12,1.958c1.181,0.354,2.39,0.654,3.624,0.896C100.79,125.247,103.357,125.5,106.002,125.5z"/>
                                                    </svg>
                                                </div>
                                            )}
                                            <div className="flex-1 text-left border-b border-[#222d34] py-2">
                                                <p className="font-normal text-[#e9edef]">{contact.name}</p>
                                                <p className="text-sm text-[#8696a0]">{contact.identifier}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : searchQuery.length >= 2 ? (
                                <div className="text-center py-8 text-[#8696a0]">
                                    Tidak ada hasil ditemukan
                                </div>
                            ) : (
                                <div className="text-center py-8 text-[#8696a0]">
                                    Ketik minimal 2 karakter untuk mencari
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Message Info Modal */}
            <MessageInfoModal
                isOpen={!!messageInfoData}
                onClose={() => setMessageInfoData(null)}
                data={messageInfoData}
            />

            {/* Contact Info Modal */}
            <ContactInfoModal
                isOpen={!!contactInfoData}
                onClose={() => setContactInfoData(null)}
                data={contactInfoData}
            />

            {/* Delete Message Confirmation Dialog */}
            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog({ open, message: open ? deleteDialog.message : null })}
                onConfirm={handleDelete}
                title="Hapus Pesan"
                message="Yakin ingin menghapus pesan ini? Pesan akan dihapus untuk semua orang."
                variant="danger"
                confirmText="Ya, Hapus"
                cancelText="Batal"
            />
        </>
    );
}

export default function ChatIndex(props: PageProps) {
    return (
        <ToastProvider>
            <ChatContent {...props} />
        </ToastProvider>
    );
}
