# PROMPT: CHAT DISKUSI TUGAS - ADMIN DETAIL INFORMASI TUGAS
## Ultra Advanced Implementation - Matching Dosen Version

---

## 🎯 OBJECTIVE
Enhance the Admin's Detail Informasi Tugas page by adding a comprehensive Chat Diskusi feature that matches the implementation from the Dosen's tugas-detail page. This feature enables real-time discussion between admin, dosen, and mahasiswa about assignments.

**Reference File**: `resources/js/pages/dosen/tugas-detail.tsx`  
**Target File**: `resources/js/pages/admin/tugas-detail.tsx`

**IMPORTANT**: Remove the penilaian (grading) section as it's specific to dosen's assignment view.

---

## 📋 CURRENT STATE vs TARGET STATE

### ✅ Already Implemented in Admin
- Basic chat diskusi implementation
- Message sending with visibility control (public/private)
- Reply functionality
- Pin/Unpin messages
- Delete messages
- Real-time message display
- Sender type badges (admin, dosen, mahasiswa)

### ❌ Missing Features (From Dosen Version)
- Image/File attachment support with preview
- Attachment preview before sending
- Emoji picker button (UI only)
- Enhanced message bubble design with proper avatars
- Improved reply indicator UI with animations
- Better mobile responsiveness for chat interface
- Advanced animations and transitions (framer-motion)
- Pinned messages visual indicator (pin badge on message)
- Proper message timestamp formatting
- Avatar images with fallback initials
- Smooth scroll to bottom on new messages
- Better input area with rounded modern design
- Message bubbles with gradient backgrounds
- Action buttons below each message (Reply, Pin, Delete)

---

## 🎨 DESIGN SYSTEM

### Color Palette
```css
/* Match Dashboard Admin Colors */
--bg-dark: #0a0a0a;
--bg-card: rgba(255, 255, 255, 0.05);
--border-light: rgba(255, 255, 255, 0.10);

/* Sender Type Gradients */
--admin: linear-gradient(to bottom right, #667eea, #764ba2);
--dosen: linear-gradient(to bottom right, #334155, #0f172a);
--mahasiswa: linear-gradient(to bottom right, #10b981, #14b8a6);

/* Message Bubbles */
--my-message: linear-gradient(to bottom right, #6366f1, #9333ea);
--other-message: rgba(255, 255, 255, 0.10);
```

### Typography
- Message: `text-[13px] sm:text-sm leading-relaxed`
- Sender Name: `text-xs font-bold`
- Timestamp: `text-[10px]`
- Badge: `text-[9px]`

---

## 🚀 IMPLEMENTATION GUIDE

### STEP 1: Add Required Imports
```typescript
import { Plus, Image as ImageIcon, Smile, CornerDownRight } from 'lucide-react';
import { AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
```

### STEP 2: Update State Management
```typescript
// Add these new states
const [attachmentImage, setAttachmentImage] = useState<File | null>(null);
const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
const fileInputRef = useRef<HTMLInputElement>(null);
```

### STEP 3: Update Diskusi Type
```typescript
type Diskusi = {
    id: number;
    sender_type: string;
    sender_name: string;
    sender_avatar: string | null;  // Add this
    pesan: string;
    visibility: string;
    recipient_name: string | null;
    is_pinned: boolean;
    reply_to_id: number | null;
    reply_to?: { sender_name: string; pesan: string } | null;
    lampiran_url?: string | null;  // Add this
    lampiran_nama?: string | null;  // Add this
    created_at: string;
    time_ago: string;
};
```

### STEP 4: Add Attachment Handlers
```typescript
const handlePickAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        setAttachmentImage(file);
        const reader = new FileReader();
        reader.onloadend = () => setAttachmentPreview(reader.result as string);
        reader.readAsDataURL(file);
    }
};

const clearAttachment = () => {
    setAttachmentImage(null);
    setAttachmentPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
};
```

### STEP 5: Update sendMessage Function
```typescript
const sendMessage = () => {
    if (!message.trim() && !attachmentImage) return;
    
    const formData = new FormData();
    formData.append('pesan', message);
    formData.append('visibility', visibility);
    if (replyTo) formData.append('reply_to_id', replyTo.id.toString());
    if (attachmentImage) formData.append('lampiran', attachmentImage);
    
    router.post(`/admin/tugas/${tugas.id}/message`, formData, {
        onSuccess: () => {
            setMessage('');
            setReplyTo(null);
            clearAttachment();
        },
        preserveScroll: true,
    });
};
```

### STEP 6: Update getSenderStyle Function
```typescript
const getSenderStyle = (type: string) => ({
    admin: 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white',
    dosen: 'bg-gradient-to-br from-slate-700 to-slate-900 text-white',
    mahasiswa: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white',
}[type] || 'bg-slate-100 text-slate-700');
```

---

## 📱 COMPLETE UI IMPLEMENTATION

### CHAT CONTAINER
Keep the existing structure but update the message display section:

```tsx
<div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth">
    <AnimatePresence>
        {diskusi.length === 0 ? (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-full text-center p-8 opacity-50"
            >
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                    <MessageSquare className="h-10 w-10 text-white/20" />
                </div>
                <p className="text-gray-400 font-medium">Belum ada diskusi</p>
                <p className="text-sm text-gray-600">Jadilah yang pertama memulai percakapan ini.</p>
            </motion.div>
        ) : (
            diskusi.map((d) => {
                const replyTarget = getReplyTarget(d.reply_to_id);
                const isMe = d.sender_type === 'admin';
                const chatTime = d.time_ago;

                return (
                    <motion.div
                        key={d.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex w-full flex-col gap-2"
                    >
                        <div className={cn("flex w-full items-end gap-2", isMe ? "flex-row-reverse" : "flex-row")}>
                            {/* Avatar */}
                            {!isMe && (
                                <motion.div whileHover={{ scale: 1.08 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                                    <Avatar className="h-7 w-7 flex-shrink-0 shadow-md ring-2 ring-white/30 dark:ring-neutral-700/60 sm:h-10 sm:w-10">
                                        {d.sender_avatar && <AvatarImage src={d.sender_avatar} alt={d.sender_name} className="object-cover" />}
                                        <AvatarFallback className={getSenderStyle(d.sender_type)}>
                                            {d.sender_name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                </motion.div>
                            )}

                            {/* Message Bubble */}
                            <motion.div
                                whileHover={{ scale: 1.01 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                                className={cn(
                                    "relative max-w-[84%] rounded-2xl px-4 py-3 shadow-lg backdrop-blur-md sm:max-w-[78%] md:max-w-[70%]",
                                    isMe 
                                        ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white" 
                                        : "border border-white/20 bg-white/10 text-slate-100"
                                )}
                            >
                                {/* Pin Indicator */}
                                {d.is_pinned && (
                                    <div className="absolute -right-2 -top-2 rounded-full bg-amber-500 p-1.5 shadow-lg ring-2 ring-amber-400/50">
                                        <Pin className="h-3 w-3 text-white" />
                                    </div>
                                )}

                                {/* Sender Info */}
                                <div className="mb-1.5 flex items-center gap-2">
                                    <span className={cn("text-xs font-bold", isMe ? "text-white/90" : "text-slate-200")}>
                                        {d.sender_name}
                                    </span>
                                    <Badge variant="outline" className="h-4 border-0 bg-black/20 px-1.5 text-[9px] text-white/70">
                                        {d.sender_type}
                                    </Badge>
                                </div>

                                {/* Reply Context */}
                                {replyTarget && (
                                    <div className="mb-2 rounded-lg border-l-2 border-white/40 bg-black/20 p-2">
                                        <div className="mb-0.5 flex items-center gap-1 text-[10px] font-semibold text-white/70">
                                            <CornerDownRight className="h-3 w-3" />
                                            <span>Membalas {replyTarget.sender_name}</span>
                                        </div>
                                        <p className="line-clamp-2 text-xs text-white/60">"{replyTarget.pesan}"</p>
                                    </div>
                                )}

                                {/* Attachment Image */}
                                {d.lampiran_url && (
                                    <a
                                        href={d.lampiran_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mb-2 block overflow-hidden rounded-xl border border-white/20"
                                    >
                                        <img
                                            src={d.lampiran_url}
                                            alt={d.lampiran_nama ?? 'Lampiran gambar'}
                                            className="max-h-72 w-full object-cover"
                                            loading="lazy"
                                        />
                                    </a>
                                )}

                                {/* Message Text */}
                                {d.pesan?.trim() && (
                                    <p className={cn(
                                        "mb-1 text-[13px] leading-relaxed whitespace-pre-wrap break-words sm:text-sm",
                                        isMe ? "text-white/95" : "text-slate-700 dark:text-slate-300"
                                    )}>
                                        {d.pesan}
                                    </p>
                                )}

                                {/* Timestamp */}
                                <div className={cn(
                                    "flex items-center justify-end text-[10px]",
                                    isMe ? "text-indigo-100/90" : "text-slate-500 dark:text-slate-400"
                                )}>
                                    <span>{chatTime}</span>
                                </div>
                            </motion.div>

                            {/* Avatar for "Me" */}
                            {isMe && (
                                <motion.div whileHover={{ scale: 1.08 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                                    <Avatar className="h-7 w-7 flex-shrink-0 shadow-md ring-2 ring-white/30 dark:ring-neutral-700/60 sm:h-10 sm:w-10">
                                        {d.sender_avatar && <AvatarImage src={d.sender_avatar} alt={d.sender_name} className="object-cover" />}
                                        <AvatarFallback className="bg-white/20 text-sm font-bold text-white">
                                            {d.sender_name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                </motion.div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className={cn(
                            "flex w-full max-w-[84%] flex-wrap gap-1 sm:max-w-[78%] md:max-w-[70%]",
                            isMe ? "justify-end pr-9 sm:pr-12" : "justify-start pl-9 sm:pr-12"
                        )}>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleReply(d)}
                                    className="h-6 px-1.5 text-[11px] font-medium text-purple-600 hover:bg-purple-100/50 dark:text-purple-400 dark:hover:bg-purple-900/30 sm:h-7 sm:px-2 sm:text-xs"
                                >
                                    <Reply className="mr-1 h-3 w-3" /> Balas
                                </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => togglePin(d.id)}
                                    className="h-6 px-1.5 text-[11px] font-medium text-amber-600 hover:bg-amber-100/50 dark:text-amber-400 dark:hover:bg-amber-900/30 sm:h-7 sm:px-2 sm:text-xs"
                                >
                                    <Pin className="mr-1 h-3 w-3" /> {d.is_pinned ? 'Unpin' : 'Pin'}
                                </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openDeleteDialog(d.id)}
                                    className="h-6 px-1.5 text-[11px] font-medium text-red-600 hover:bg-red-100/50 dark:text-red-400 dark:hover:bg-red-900/30 sm:h-7 sm:px-2 sm:text-xs"
                                >
                                    <Trash2 className="mr-1 h-3 w-3" /> Hapus
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>
                );
            })
        )}
    </AnimatePresence>
    <div ref={chatEndRef} />
</div>
```

### REPLY INDICATOR
Replace the existing reply indicator with this enhanced version:

```tsx
{/* Reply indicator */}
<AnimatePresence>
    {replyTo && (
        <motion.div
            className="border-t border-purple-200/30 bg-purple-50/50 px-4 py-4 backdrop-blur-sm dark:border-purple-800/30 dark:bg-purple-900/20 sm:px-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                        <Reply className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                            Membalas {replyTo.sender_name}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                            "{replyTo.pesan}"
                        </p>
                    </div>
                </div>
                <motion.div whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyTo(null)}
                        className="h-8 w-8 p-0 hover:bg-purple-200/50 dark:hover:bg-purple-800/30 rounded-lg"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </motion.div>
            </div>
        </motion.div>
    )}
</AnimatePresence>
```

### INPUT AREA
Replace the entire input area with this modern design:

```tsx
{/* Input Area */}
<div className="relative border-t border-white/10 bg-black/20 p-3 backdrop-blur-sm sm:p-4">
    <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePickAttachment}
    />

    <div className="mb-2 flex justify-center sm:justify-start">
        <Select value={visibility} onValueChange={setVisibility}>
            <SelectTrigger className="h-8 w-[132px] rounded-full border border-white/20 bg-white/10 text-xs font-semibold text-slate-200 backdrop-blur-sm transition-all duration-300 hover:border-purple-400 dark:border-neutral-700/60 dark:bg-neutral-800/50">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="public">
                    <span className="flex items-center gap-2">
                        <Users className="h-3.5 w-3.5" /> Public
                    </span>
                </SelectItem>
                <SelectItem value="private">
                    <span className="flex items-center gap-2">
                        <Lock className="h-3.5 w-3.5" /> Private
                    </span>
                </SelectItem>
            </SelectContent>
        </Select>
    </div>

    {/* Attachment Preview */}
    {attachmentPreview && (
        <div className="mb-3 flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-2 backdrop-blur-md dark:border-neutral-700/60 dark:bg-neutral-800/50">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/20">
                <img src={attachmentPreview} alt={attachmentImage?.name || 'Preview gambar'} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-slate-100">
                    <ImageIcon className="h-4 w-4 shrink-0 text-emerald-400" />
                    <span className="truncate">{attachmentImage?.name ?? 'Gambar terpilih'}</span>
                </p>
                <p className="text-xs text-slate-400">Tambahkan teks sebagai caption lalu kirim.</p>
            </div>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={clearAttachment}
                className="h-8 w-8 shrink-0 rounded-full text-slate-300 hover:bg-white/15 hover:text-slate-100 dark:hover:bg-neutral-700/60"
                title="Hapus gambar"
            >
                <X className="h-4 w-4" />
            </Button>
        </div>
    )}

    <div className="flex items-center gap-2 rounded-[30px] border border-white/10 bg-black/30 p-2 shadow-inner shadow-black/30">
        <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="h-11 w-11 shrink-0 rounded-full border border-white/20 bg-white/10 text-slate-200 hover:bg-white/20 dark:border-neutral-700/60 dark:bg-neutral-800/50"
            title="Lampiran"
        >
            <Plus className="h-6 w-6" />
        </Button>

        <div className="flex h-11 flex-1 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 backdrop-blur-md dark:border-neutral-700/60 dark:bg-neutral-800/50">
            <Textarea
                ref={inputRef}
                placeholder={replyTo ? `Balas ke ${replyTo.sender_name}...` : "Tulis pesan diskusi..."}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={1}
                className="h-6 min-h-6 max-h-20 flex-1 resize-none border-0 bg-transparent p-0 text-sm text-slate-100 placeholder:text-slate-400 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            />
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-full text-slate-300 hover:bg-white/15 hover:text-slate-100 dark:hover:bg-neutral-700/60"
                title="Emoji"
            >
                <Smile className="h-5 w-5" />
            </Button>
        </div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="shrink-0">
            <Button
                onClick={sendMessage}
                disabled={!message.trim() && !attachmentImage}
                className="h-11 w-11 rounded-full bg-emerald-500 p-0 text-white shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <Send className="h-5 w-5" />
            </Button>
        </motion.div>
    </div>
</div>
```

---

## ✅ CHECKLIST

### UI/UX Enhancements
- [ ] Add image attachment support with file input
- [ ] Show attachment preview before sending
- [ ] Display attached images in messages
- [ ] Add emoji button (UI only, no functionality needed)
- [ ] Implement proper avatar display with fallback
- [ ] Add pin indicator badge on pinned messages
- [ ] Show reply context in message bubbles
- [ ] Add action buttons below each message
- [ ] Implement smooth animations with framer-motion
- [ ] Update input area with modern rounded design
- [ ] Add visibility selector (Public/Private)
- [ ] Improve reply indicator with animations

### Functionality
- [ ] Update sendMessage to handle FormData with attachments
- [ ] Add handlePickAttachment function
- [ ] Add clearAttachment function
- [ ] Update Diskusi type to include avatar and attachment fields
- [ ] Ensure smooth scroll to bottom on new messages
- [ ] Test reply functionality with new UI
- [ ] Test pin/unpin with visual indicator
- [ ] Test delete functionality
- [ ] Test attachment upload and display

### Mobile Responsiveness
- [ ] Test chat interface on mobile (320px - 768px)
- [ ] Ensure message bubbles are properly sized
- [ ] Test input area on mobile
- [ ] Verify attachment preview on mobile
- [ ] Check action buttons visibility on mobile

### Design Consistency
- [ ] Match dashboard admin color scheme
- [ ] Use consistent border radius (rounded-2xl, rounded-xl)
- [ ] Apply consistent spacing (gap-2, gap-3, gap-4)
- [ ] Use consistent typography sizes
- [ ] Ensure proper backdrop-blur effects
- [ ] Match gradient styles for sender types

---

## 🎯 KEY DIFFERENCES FROM DOSEN VERSION

1. **NO Penilaian Section**: Remove all grading/scoring functionality
2. **Admin Context**: Messages from admin should show as "isMe = true"
3. **Same Features**: Keep all chat features (reply, pin, delete, attachments)
4. **Same UI/UX**: Match the exact design and animations
5. **Same Interactions**: All user interactions should work identically

---

## 📝 NOTES

- Use `cn()` utility from `@/lib/utils` for conditional classNames
- All animations use framer-motion with spring physics
- Maintain existing backend routes and data structure
- Focus on UI/UX enhancements, not backend changes
- Test thoroughly on different screen sizes
- Ensure accessibility (keyboard navigation, screen readers)

---

## 🚀 IMPLEMENTATION PRIORITY

1. **HIGH**: Image attachment system (most visible feature)
2. **HIGH**: Enhanced message display with avatars
3. **MEDIUM**: Reply indicator improvements
4. **MEDIUM**: Input area redesign
5. **LOW**: Emoji button (UI only)

---

**END OF PROMPT**
