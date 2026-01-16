import { useState, useEffect, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
import { MessageCircle, Plus, Search, Users, X, ArrowLeft } from 'lucide-react';
import { ConversationList } from '@/components/chat/conversation-list';
import { ChatWindow } from '@/components/chat/chat-window';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { ConversationListItem, ConversationDetail, Message, TypingUser, ChatUser } from '@/types/chat';

interface PageProps {
    conversations: ConversationListItem[];
    activeConversation?: ConversationDetail;
    currentUser: ChatUser;
}

export default function ChatIndex({ conversations, activeConversation, currentUser }: PageProps) {
    const [replyTo, setReplyTo] = useState<Message | null>(null);
    const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
    const [showNewChat, setShowNewChat] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<ChatUser[]>([]);
    const [searching, setSearching] = useState(false);
    const [showMobileList, setShowMobileList] = useState(!activeConversation);

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
            const response = await fetch(`/api/chat/conversations/${activeConversation.id}/messages`, {
                method: 'POST',
                body: formData,
                credentials: 'same-origin',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
            });

            if (response.ok) {
                setReplyTo(null);
                router.reload({ only: ['activeConversation', 'conversations'] });
            } else {
                const errorData = await response.json().catch(() => ({}));
                alert('Gagal mengirim pesan: ' + (errorData.error || errorData.message || 'Unknown error'));
            }
        } catch (error) {
            alert('Gagal mengirim pesan. Silakan coba lagi.');
        }
    };

    const handleTyping = async (isTyping: boolean) => {
        if (!activeConversation) return;
        try {
            await fetch(`/api/chat/conversations/${activeConversation.id}/typing`, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ is_typing: isTyping }),
            });
        } catch (error) {}
    };

    const handleReply = (message: Message) => setReplyTo(message);
    const handleCancelReply = () => setReplyTo(null);

    const handleEdit = async (message: Message, newContent: string) => {
        try {
            const response = await fetch(`/api/chat/messages/${message.id}`, {
                method: 'PUT',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ content: newContent }),
            });
            if (response.ok) {
                router.reload({ only: ['activeConversation'] });
            }
        } catch (error) {}
    };

    const handleDelete = async (message: Message) => {
        if (!confirm('Hapus pesan ini?')) return;
        try {
            const response = await fetch(`/api/chat/messages/${message.id}`, {
                method: 'DELETE',
                credentials: 'same-origin',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
            });
            if (response.ok) {
                router.reload({ only: ['activeConversation'] });
            }
        } catch (error) {}
    };

    const handleForward = (message: Message) => {
        alert('Fitur teruskan pesan akan segera hadir!');
    };

    const handleReact = async (message: Message, emoji: string) => {
        try {
            await fetch(`/api/chat/messages/${message.id}/reactions`, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ emoji }),
            });
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
            const response = await fetch(`/chat/contacts/search?q=${encodeURIComponent(query)}`, {
                credentials: 'same-origin',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
            });
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
                {/* Sidebar */}
                <div className={cn(
                    'w-full md:w-[30%] lg:w-[25%] min-w-[300px] max-w-[500px] border-r border-[#222d34]',
                    'md:block',
                    showMobileList ? 'block' : 'hidden'
                )}>
                    <ConversationList
                        conversations={conversations}
                        activeId={activeConversation?.id}
                        currentUser={currentUser}
                        onSelect={handleSelectConversation}
                        onNewChat={() => setShowNewChat(true)}
                        onArchive={(conv) => {
                            // TODO: Implement archive
                            alert(`${conv.is_archived ? 'Membatalkan arsip' : 'Mengarsipkan'} chat dengan ${conv.name}`);
                        }}
                        onPin={(conv) => {
                            // TODO: Implement pin
                            alert(`${conv.is_pinned ? 'Melepas sematan' : 'Menyematkan'} chat dengan ${conv.name}`);
                        }}
                        onMute={(conv) => {
                            // TODO: Implement mute
                            alert(`${conv.is_muted ? 'Membunyikan' : 'Membisukan'} notifikasi dari ${conv.name}`);
                        }}
                        onContactInfo={(conv) => {
                            alert(`Info Kontak: ${conv.name}\nTipe: ${conv.type === 'group' ? 'Grup' : 'Personal'}`);
                        }}
                    />
                </div>

                {/* Main Chat Area */}
                <div className={cn(
                    'flex-1 flex flex-col',
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
                            onDelete={handleDelete}
                            onForward={handleForward}
                            onReact={handleReact}
                            onLoadMore={handleLoadMore}
                            onBack={() => setShowMobileList(true)}
                            replyTo={replyTo}
                            onCancelReply={handleCancelReply}
                        />
                    ) : (
                        /* WhatsApp style empty state */
                        <div className="flex-1 flex flex-col items-center justify-center bg-[#222e35]">
                            <div className="text-center max-w-md px-8">
                                <div className="w-[320px] h-[188px] mx-auto mb-10 opacity-40">
                                    <svg viewBox="0 0 303 172" fill="none" className="w-full h-full">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M229.565 160.229C262.212 149.245 286.931 118.241 283.39 73.4194C278.009 5.31929 212.365 -11.5738 171.472 8.48673C115.998 35.6999 108.972 40.1612 69.2388 40.1612C39.645 40.1612 9.51318 54.4147 5.7467 92.952C3.0166 120.885 13.9985 145.267 54.6373 157.716C128.599 180.373 198.017 170.844 229.565 160.229Z" fill="#364147"/>
                                        <path fillRule="evenodd" clipRule="evenodd" d="M131.589 68.9422C131.593 68.9422 131.596 68.9422 131.599 68.9422C137.86 68.9422 142.935 63.8667 142.935 57.6057C142.935 51.3446 137.86 46.2692 131.599 46.2692C125.338 46.2692 120.262 51.3446 120.262 57.6057C120.262 63.8667 125.334 68.9393 131.589 68.9422Z" fill="#8696A0"/>
                                        <path fillRule="evenodd" clipRule="evenodd" d="M176.464 68.9422C176.467 68.9422 176.471 68.9422 176.474 68.9422C182.735 68.9422 187.81 63.8667 187.81 57.6057C187.81 51.3446 182.735 46.2692 176.474 46.2692C170.213 46.2692 165.137 51.3446 165.137 57.6057C165.137 63.8667 170.209 68.9393 176.464 68.9422Z" fill="#8696A0"/>
                                        <path d="M154.036 90.9436C165.503 90.9436 174.799 81.6479 174.799 70.1804H133.274C133.274 81.6479 142.569 90.9436 154.036 90.9436Z" fill="#8696A0"/>
                                    </svg>
                                </div>
                                <h1 className="text-[32px] font-light text-[#e9edef] mb-4">
                                    WhatsApp Web
                                </h1>
                                <p className="text-sm text-[#8696a0] leading-relaxed mb-8">
                                    Kirim dan terima pesan tanpa perlu menyimpan ponsel tetap online.
                                    <br />
                                    Gunakan WhatsApp di hingga 4 perangkat tertaut dan 1 ponsel secara bersamaan.
                                </p>
                                <div className="flex items-center justify-center gap-2 text-[#8696a0] text-sm">
                                    <svg viewBox="0 0 10 12" height="12" width="10" className="fill-current">
                                        <path d="M5.00014 1.19995C2.90014 1.19995 1.20014 2.89995 1.20014 4.99995V6.59995L0.400146 7.39995V8.79995H9.60015V7.39995L8.80015 6.59995V4.99995C8.80015 2.89995 7.10015 1.19995 5.00014 1.19995ZM5.00014 10.9999C5.80015 10.9999 6.40015 10.3999 6.40015 9.59995H3.60015C3.60015 10.3999 4.20014 10.9999 5.00014 10.9999Z"/>
                                    </svg>
                                    <span>Terenkripsi secara end-to-end</span>
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
        </>
    );
}
