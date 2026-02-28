# 🎯 PROMPT: INFORMASI TUGAS MAHASISWA - ULTRA ADVANCED FEATURES

## 📋 OVERVIEW

Prompt ini untuk meningkatkan menu **Informasi Tugas Mahasiswa** dengan fitur-fitur ultra advanced, inovasi tinggi, dan 100% matching dengan **Dashboard Admin** (bukan dashboard mahasiswa atau dosen). Semua warna, animasi, UI/UX, header, container, icons harus sama persis dengan admin dashboard.

---

## 🎨 DESIGN SYSTEM - HITAM THEME (100% ADMIN MATCHING)

### Color Palette
```typescript
// CONTAINER COLORS (WAJIB)
bg-white/40 dark:bg-neutral-900/40  // Main containers
backdrop-blur-xl                     // Glassmorphism effect

// BORDER COLORS (WAJIB)
border-white/20 dark:border-white/5  // Container borders (NOT border-gray-800)

// GRADIENT HEADER (WAJIB - ADMIN STYLE)
from-indigo-600 via-purple-600 to-pink-500

// TEXT COLORS
text-neutral-900 dark:text-white     // Primary text
text-neutral-500 dark:text-neutral-400  // Secondary text

// ROUNDED CORNERS
rounded-3xl  // Main containers (NOT rounded-2xl)

// SHADOWS
shadow-xl    // Main containers (NOT shadow-sm)
```

### Animation Standards
```typescript
// WAJIB - Consistent dengan admin dashboard
stiffness: 300
damping: 20

// TIDAK BOLEH menggunakan:
stiffness: 100, damping: 15  // Terlalu lambat
stiffness: 200, damping: 25  // Terlalu bouncy
```

---

## 🚀 FITUR YANG SUDAH ADA (CURRENT IMPLEMENTATION)

### ✅ Sudah Matching Admin Dashboard
1. **Header Gradient**: `from-indigo-600 via-purple-600 to-pink-500` ✓
2. **PNG Icons**: tugasHeaderIcon, totalTugasIcon, draftIcon, overdueIcon, publishedIcon ✓
3. **Animations**: stiffness: 300, damping: 20 ✓
4. **Stats Cards**: Glassmorphism dengan backdrop-blur-xl ✓
5. **Container**: bg-white/40 dark:bg-neutral-900/40 ✓
6. **Animated Counter**: Smooth number animations ✓
7. **Priority Badges**: Gradient badges dengan icons ✓
8. **Filter System**: Search, course, status filters ✓

### 📄 Current Files
- `resources/js/pages/user/tugas.tsx` - Main list page
- `resources/js/pages/user/tugas-detail.tsx` - Detail page

---

## 🎯 INOVASI ULTRA ADVANCED (8 MAJOR FEATURES)


### 1️⃣ KANBAN BOARD VIEW (Drag & Drop)

**Deskripsi**: View alternatif dengan Kanban board untuk manage tugas dengan drag & drop

**Features**:
- 4 Kolom: "Belum Dikerjakan", "Sedang Dikerjakan", "Menunggu Review", "Selesai"
- Drag & drop tugas antar kolom
- Auto-save status saat pindah kolom
- Visual feedback saat dragging
- Counter per kolom
- Smooth animations

**Implementation**:
```typescript
// Install: npm install @dnd-kit/core @dnd-kit/sortable

import { DndContext, DragEndEvent, DragOverlay } from '@dnd-kit/core';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface KanbanColumn {
  id: 'todo' | 'in_progress' | 'review' | 'done';
  title: string;
  color: string;
  icon: any;
  tasks: Tugas[];
}

const KanbanBoard = ({ tugasList }: { tugasList: Tugas[] }) => {
  const [columns, setColumns] = useState<KanbanColumn[]>([
    { id: 'todo', title: 'Belum Dikerjakan', color: 'from-gray-500 to-slate-600', icon: FileText, tasks: [] },
    { id: 'in_progress', title: 'Sedang Dikerjakan', color: 'from-blue-500 to-indigo-600', icon: Clock, tasks: [] },
    { id: 'review', title: 'Menunggu Review', color: 'from-amber-500 to-orange-600', icon: Eye, tasks: [] },
    { id: 'done', title: 'Selesai', color: 'from-emerald-500 to-teal-600', icon: CheckCircle, tasks: [] },
  ]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id;
    const newColumnId = over.id as string;

    // Update backend
    router.patch(`/user/tugas/${taskId}/status`, { 
      status: newColumnId 
    }, {
      preserveScroll: true,
      onSuccess: () => {
        // Show success toast
      }
    });
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((column) => (
          <motion.div
            key={column.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-4 shadow-xl backdrop-blur-xl"
          >
            {/* Column Header */}
            <div className={`flex items-center justify-between mb-4 p-3 rounded-2xl bg-gradient-to-r ${column.color} text-white`}>
              <div className="flex items-center gap-2">
                <column.icon className="h-5 w-5" />
                <h3 className="font-bold">{column.title}</h3>
              </div>
              <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-bold">
                {column.tasks.length}
              </span>
            </div>

            {/* Droppable Area */}
            <SortableContext items={column.tasks.map(t => t.id)}>
              <div className="space-y-3 min-h-[400px]">
                {column.tasks.map((task) => (
                  <KanbanCard key={task.id} task={task} />
                ))}
              </div>
            </SortableContext>
          </motion.div>
        ))}
      </div>
    </DndContext>
  );
};

const KanbanCard = ({ task }: { task: Tugas }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: task.id 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      whileHover={{ scale: 1.02, y: -2 }}
      className="rounded-2xl border border-white/20 bg-white/60 dark:bg-neutral-800/60 p-4 shadow-lg backdrop-blur-xl cursor-grab active:cursor-grabbing"
    >
      <h4 className="font-bold text-sm text-neutral-900 dark:text-white mb-2 line-clamp-2">
        {task.judul}
      </h4>
      <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
        <Calendar className="h-3 w-3" />
        {task.deadline_display}
      </div>
      <div className="mt-2 flex items-center gap-2">
        {getPriorityBadge(task.prioritas)}
        {task.is_overdue && (
          <span className="text-xs text-red-600 dark:text-red-400 font-bold">
            Overdue!
          </span>
        )}
      </div>
    </motion.div>
  );
};
```

**Backend Controller** (`app/Http/Controllers/User/TugasController.php`):
```php
public function updateStatus(Request $request, $id)
{
    $validated = $request->validate([
        'status' => 'required|in:todo,in_progress,review,done'
    ]);

    $submission = Submission::where('tugas_id', $id)
        ->where('mahasiswa_id', auth()->id())
        ->first();

    if (!$submission) {
        $submission = Submission::create([
            'tugas_id' => $id,
            'mahasiswa_id' => auth()->id(),
            'status' => $validated['status'],
        ]);
    } else {
        $submission->update(['status' => $validated['status']]);
    }

    return back()->with('success', 'Status tugas berhasil diupdate');
}
```

---

### 2️⃣ TASK DEPENDENCIES (Prerequisite System)

**Deskripsi**: Sistem untuk menandai tugas yang harus diselesaikan terlebih dahulu

**Features**:
- Visual dependency tree
- Lock tugas yang belum bisa dikerjakan
- Progress tracking
- Unlock notification

**Implementation**:
```typescript
interface TugasWithDependencies extends Tugas {
  dependencies: number[];  // Array of tugas IDs
  dependents: number[];    // Tugas yang depend on this
  is_locked: boolean;      // Apakah masih terkunci
  unlock_progress: number; // Progress untuk unlock (0-100)
}

const DependencyTree = ({ tugas }: { tugas: TugasWithDependencies }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 text-white">
          <GitBranch className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
            Dependency Tree
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Tugas yang harus diselesaikan terlebih dahulu
          </p>
        </div>
      </div>

      {/* Locked State */}
      {tugas.is_locked && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800"
        >
          <div className="flex items-center gap-3 mb-3">
            <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <p className="font-bold text-amber-800 dark:text-amber-300">
              Tugas Terkunci
            </p>
          </div>
          <p className="text-sm text-amber-700 dark:text-amber-400 mb-3">
            Selesaikan tugas prerequisite terlebih dahulu untuk membuka tugas ini
          </p>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-amber-700 dark:text-amber-400">Progress Unlock</span>
              <span className="font-bold text-amber-800 dark:text-amber-300">
                {tugas.unlock_progress}%
              </span>
            </div>
            <div className="h-2 bg-amber-200 dark:bg-amber-900/40 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${tugas.unlock_progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Dependency List */}
      <div className="space-y-3">
        {tugas.dependencies.map((depId, index) => {
          const depTugas = tugasList.find(t => t.id === depId);
          if (!depTugas) return null;

          const isCompleted = depTugas.submission?.status === 'done';

          return (
            <motion.div
              key={depId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "flex items-center gap-3 p-4 rounded-2xl border transition-all",
                isCompleted
                  ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                  : "bg-white/60 dark:bg-neutral-800/60 border-white/20 dark:border-white/5"
              )}
            >
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl",
                isCompleted
                  ? "bg-emerald-500 text-white"
                  : "bg-neutral-200 dark:bg-neutral-700 text-neutral-500"
              )}>
                {isCompleted ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Lock className="h-5 w-5" />
                )}
              </div>
              
              <div className="flex-1">
                <p className="font-bold text-sm text-neutral-900 dark:text-white">
                  {depTugas.judul}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {depTugas.course.nama}
                </p>
              </div>

              {isCompleted && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400"
                >
                  <Sparkles className="h-4 w-4" />
                  Selesai
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
```

---

### 3️⃣ COLLABORATION FEATURES (Real-time Discussion)

**Deskripsi**: Fitur kolaborasi real-time untuk diskusi tugas

**Features**:
- Real-time chat dengan dosen & mahasiswa lain
- Typing indicators
- Read receipts
- File sharing dalam chat
- Mention system (@username)
- Emoji reactions
- Pin important messages

**Implementation**:
```typescript
// Install: npm install pusher-js @pusher/pusher-http-node

import Pusher from 'pusher-js';
import { useEffect, useState, useRef } from 'react';

interface Message {
  id: number;
  sender_type: 'dosen' | 'mahasiswa';
  sender_name: string;
  sender_avatar: string | null;
  pesan: string;
  visibility: 'public' | 'private';
  is_pinned: boolean;
  reactions: { emoji: string; count: number; users: string[] }[];
  attachments: { name: string; url: string; type: string }[];
  mentions: string[];
  created_at: string;
  time_ago: string;
  is_read: boolean;
}

const CollaborationPanel = ({ tugasId }: { tugasId: number }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Setup Pusher for real-time
  useEffect(() => {
    const pusher = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
      cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    });

    const channel = pusher.subscribe(`tugas.${tugasId}`);

    // Listen for new messages
    channel.bind('message.sent', (data: Message) => {
      setMessages(prev => [...prev, data]);
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });

    // Listen for typing indicators
    channel.bind('user.typing', (data: { user: string }) => {
      setIsTyping(prev => [...prev, data.user]);
      setTimeout(() => {
        setIsTyping(prev => prev.filter(u => u !== data.user));
      }, 3000);
    });

    return () => {
      pusher.unsubscribe(`tugas.${tugasId}`);
    };
  }, [tugasId]);

  const handleSendMessage = () => {
    if (!newMessage.trim() && attachments.length === 0) return;

    const formData = new FormData();
    formData.append('pesan', newMessage);
    formData.append('visibility', 'public');
    attachments.forEach((file, index) => {
      formData.append(`attachments[${index}]`, file);
    });

    router.post(`/user/tugas/${tugasId}/message`, formData, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        setNewMessage('');
        setAttachments([]);
      },
    });
  };

  const handleTyping = () => {
    // Broadcast typing indicator
    axios.post(`/user/tugas/${tugasId}/typing`);
  };

  const handleReaction = (messageId: number, emoji: string) => {
    router.post(`/user/tugas/${tugasId}/message/${messageId}/react`, {
      emoji,
    }, {
      preserveScroll: true,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/20 dark:border-white/5 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-neutral-900 dark:text-white">
              Diskusi & Kolaborasi
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {messages.length} pesan • Real-time
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="h-[500px] overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "flex gap-3",
                msg.sender_type === 'mahasiswa' ? "flex-row" : "flex-row-reverse"
              )}
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center text-white font-bold",
                  msg.sender_type === 'dosen'
                    ? "bg-gradient-to-br from-purple-500 to-indigo-600"
                    : "bg-gradient-to-br from-emerald-500 to-teal-600"
                )}>
                  {msg.sender_name.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Message Bubble */}
              <div className={cn(
                "flex-1 max-w-[70%]",
                msg.sender_type === 'mahasiswa' ? "items-start" : "items-end"
              )}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    {msg.sender_name}
                  </span>
                  <span className="text-xs text-neutral-400">
                    {msg.time_ago}
                  </span>
                  {msg.is_pinned && (
                    <Pin className="h-3 w-3 text-amber-500" />
                  )}
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={cn(
                    "rounded-2xl p-4 shadow-lg",
                    msg.sender_type === 'dosen'
                      ? "bg-gradient-to-br from-purple-500 to-indigo-600 text-white"
                      : "bg-white/60 dark:bg-neutral-800/60 text-neutral-900 dark:text-white backdrop-blur-xl"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.pesan}</p>

                  {/* Attachments */}
                  {msg.attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.attachments.map((att, i) => (
                        <a
                          key={i}
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                        >
                          <FileText className="h-4 w-4" />
                          <span className="text-xs font-medium">{att.name}</span>
                          <Download className="h-3 w-3 ml-auto" />
                        </a>
                      ))}
                    </div>
                  )}
                </motion.div>

                {/* Reactions */}
                {msg.reactions.length > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    {msg.reactions.map((reaction, i) => (
                      <motion.button
                        key={i}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleReaction(msg.id, reaction.emoji)}
                        className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl text-xs font-medium"
                      >
                        <span>{reaction.emoji}</span>
                        <span>{reaction.count}</span>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400"
          >
            <div className="flex gap-1">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="h-2 w-2 rounded-full bg-neutral-400"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                className="h-2 w-2 rounded-full bg-neutral-400"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                className="h-2 w-2 rounded-full bg-neutral-400"
              />
            </div>
            <span>{isTyping.join(', ')} sedang mengetik...</span>
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/20 dark:border-white/5 bg-white/20 dark:bg-neutral-900/20">
        {/* Attachment Preview */}
        {attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl"
              >
                <FileText className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  {file.name}
                </span>
                <button
                  onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                  className="text-red-500 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          <input
            type="file"
            ref={fileInputRef}
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) {
                setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
              }
            }}
          />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl"
          >
            <Paperclip className="h-5 w-5" />
          </Button>

          <Textarea
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ketik pesan... (Enter untuk kirim, Shift+Enter untuk baris baru)"
            className="flex-1 min-h-[60px] max-h-[120px] rounded-2xl bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl border-white/20 dark:border-white/5 resize-none"
          />

          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() && attachments.length === 0}
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>

        {/* Quick Reactions */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">Quick reactions:</span>
          {['👍', '❤️', '🎉', '🔥', '👏'].map((emoji) => (
            <motion.button
              key={emoji}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="text-lg hover:bg-white/20 dark:hover:bg-neutral-800/20 rounded-lg p-1 transition-colors"
            >
              {emoji}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
```


---

### 4️⃣ RICH TEXT EDITOR & FILE ATTACHMENTS

**Deskripsi**: Editor rich text untuk submission dengan support file attachments

**Features**:
- Rich text formatting (bold, italic, underline, lists, links)
- Code syntax highlighting
- Image paste & upload
- Multiple file attachments
- Drag & drop files
- File preview
- Progress upload
- File size validation

**Implementation**:
```typescript
// Install: npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-image

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Image as ImageIcon, Code } from 'lucide-react';

const RichTextSubmissionForm = ({ tugasId }: { tugasId: number }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isDragging, setIsDragging] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Image,
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[300px] p-4',
      },
    },
  });

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const validFiles = Array.from(selectedFiles).filter(file => {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} terlalu besar (max 10MB)`);
        return false;
      }
      return true;
    });

    setFiles(prev => [...prev, ...validFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleSubmit = async () => {
    if (!editor) return;

    const formData = new FormData();
    formData.append('content', editor.getHTML());
    
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });

    // Upload with progress tracking
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100;
        setUploadProgress({ overall: percentComplete });
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        router.reload();
      }
    });

    xhr.open('POST', `/user/tugas/${tugasId}/submit`);
    xhr.setRequestHeader('X-CSRF-TOKEN', document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '');
    xhr.send(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/20 dark:border-white/5 bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-neutral-900 dark:text-white">
              Submit Tugas
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Gunakan rich text editor untuk format yang lebih baik
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      {editor && (
        <div className="p-3 border-b border-white/20 dark:border-white/5 bg-white/20 dark:bg-neutral-900/20">
          <div className="flex flex-wrap items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={cn(
                "p-2 rounded-lg transition-colors",
                editor.isActive('bold')
                  ? "bg-indigo-500 text-white"
                  : "bg-white/60 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 hover:bg-white/80"
              )}
            >
              <Bold className="h-4 w-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={cn(
                "p-2 rounded-lg transition-colors",
                editor.isActive('italic')
                  ? "bg-indigo-500 text-white"
                  : "bg-white/60 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 hover:bg-white/80"
              )}
            >
              <Italic className="h-4 w-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={cn(
                "p-2 rounded-lg transition-colors",
                editor.isActive('bulletList')
                  ? "bg-indigo-500 text-white"
                  : "bg-white/60 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 hover:bg-white/80"
              )}
            >
              <List className="h-4 w-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={cn(
                "p-2 rounded-lg transition-colors",
                editor.isActive('orderedList')
                  ? "bg-indigo-500 text-white"
                  : "bg-white/60 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 hover:bg-white/80"
              )}
            >
              <ListOrdered className="h-4 w-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const url = window.prompt('Enter URL:');
                if (url) {
                  editor.chain().focus().setLink({ href: url }).run();
                }
              }}
              className={cn(
                "p-2 rounded-lg transition-colors",
                editor.isActive('link')
                  ? "bg-indigo-500 text-white"
                  : "bg-white/60 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 hover:bg-white/80"
              )}
            >
              <LinkIcon className="h-4 w-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={cn(
                "p-2 rounded-lg transition-colors",
                editor.isActive('codeBlock')
                  ? "bg-indigo-500 text-white"
                  : "bg-white/60 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 hover:bg-white/80"
              )}
            >
              <Code className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="p-4 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl">
        <EditorContent 
          editor={editor} 
          className="rounded-2xl border border-white/20 dark:border-white/5 bg-white dark:bg-neutral-900 overflow-hidden"
        />
      </div>

      {/* File Upload Area */}
      <div className="p-4">
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          className={cn(
            "rounded-2xl border-2 border-dashed p-8 text-center transition-all",
            isDragging
              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
              : "border-white/20 dark:border-white/5 bg-white/20 dark:bg-neutral-900/20"
          )}
        >
          <input
            type="file"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            id="file-upload"
          />
          
          <motion.div
            animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
              <Upload className="h-8 w-8" />
            </div>
            <div>
              <p className="font-bold text-neutral-900 dark:text-white mb-1">
                Drag & drop files here
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                or{' '}
                <label htmlFor="file-upload" className="text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline">
                  browse files
                </label>
              </p>
              <p className="text-xs text-neutral-400 mt-2">
                Max 10MB per file • PDF, DOC, DOCX, ZIP, Images
              </p>
            </div>
          </motion.div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
              Files ({files.length})
            </p>
            {files.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl"
              >
                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => setFiles(prev => prev.filter((_, i) => i !== index))}
                  className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Upload Progress */}
        {uploadProgress.overall !== undefined && uploadProgress.overall < 100 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-indigo-900 dark:text-indigo-300">
                Uploading...
              </span>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {Math.round(uploadProgress.overall)}%
              </span>
            </div>
            <div className="h-2 bg-indigo-200 dark:bg-indigo-900/40 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress.overall}%` }}
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Submit Button */}
      <div className="p-4 border-t border-white/20 dark:border-white/5 bg-white/20 dark:bg-neutral-900/20">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={!editor?.getText().trim() && files.length === 0}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold shadow-lg hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <div className="flex items-center justify-center gap-2">
            <Send className="h-5 w-5" />
            Submit Tugas
          </div>
        </motion.button>
      </div>
    </motion.div>
  );
};
```

---

### 5️⃣ SMART NOTIFICATIONS & REMINDERS

**Deskripsi**: Sistem notifikasi cerdas dengan reminder otomatis

**Features**:
- Push notifications (browser)
- Email reminders
- Smart scheduling (3 days, 1 day, 1 hour before deadline)
- Custom reminder settings
- Notification preferences
- Digest mode (daily/weekly summary)

**Implementation**:
```typescript
// Notification Service
class NotificationService {
  static async requestPermission() {
    if (!('Notification' in window)) {
      console.log('Browser tidak support notifications');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  static async sendNotification(title: string, options: NotificationOptions) {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/logo.png',
        badge: '/badge.png',
        ...options,
      });
    }
  }

  static scheduleReminder(tugas: Tugas) {
    const deadline = new Date(tugas.deadline);
    const now = new Date();
    
    // 3 days before
    const threeDaysBefore = new Date(deadline.getTime() - 3 * 24 * 60 * 60 * 1000);
    if (threeDaysBefore > now) {
      this.scheduleNotificationAt(threeDaysBefore, {
        title: '⏰ Reminder: Tugas akan deadline dalam 3 hari',
        body: `${tugas.judul} - ${tugas.course.nama}`,
        tag: `tugas-${tugas.id}-3days`,
      });
    }

    // 1 day before
    const oneDayBefore = new Date(deadline.getTime() - 24 * 60 * 60 * 1000);
    if (oneDayBefore > now) {
      this.scheduleNotificationAt(oneDayBefore, {
        title: '🚨 Urgent: Tugas deadline besok!',
        body: `${tugas.judul} - ${tugas.course.nama}`,
        tag: `tugas-${tugas.id}-1day`,
      });
    }

    // 1 hour before
    const oneHourBefore = new Date(deadline.getTime() - 60 * 60 * 1000);
    if (oneHourBefore > now) {
      this.scheduleNotificationAt(oneHourBefore, {
        title: '⚠️ CRITICAL: Tugas deadline dalam 1 jam!',
        body: `${tugas.judul} - ${tugas.course.nama}`,
        tag: `tugas-${tugas.id}-1hour`,
      });
    }
  }

  private static scheduleNotificationAt(date: Date, options: { title: string; body: string; tag: string }) {
    const delay = date.getTime() - Date.now();
    if (delay > 0) {
      setTimeout(() => {
        this.sendNotification(options.title, {
          body: options.body,
          tag: options.tag,
          requireInteraction: true,
        });
      }, delay);
    }
  }
}

// Notification Settings Component
const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    enabled: false,
    email_reminders: true,
    push_notifications: false,
    reminder_3days: true,
    reminder_1day: true,
    reminder_1hour: true,
    digest_mode: 'daily' as 'daily' | 'weekly' | 'none',
  });

  const handleEnableNotifications = async () => {
    const granted = await NotificationService.requestPermission();
    if (granted) {
      setSettings(prev => ({ ...prev, enabled: true, push_notifications: true }));
      
      // Save to backend
      router.post('/user/settings/notifications', {
        push_notifications: true,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white">
          <Bell className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
            Notification Settings
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Atur reminder dan notifikasi tugas
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Enable Notifications */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl">
          <div>
            <p className="font-bold text-neutral-900 dark:text-white">
              Push Notifications
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Terima notifikasi di browser
            </p>
          </div>
          <button
            onClick={handleEnableNotifications}
            disabled={settings.enabled}
            className={cn(
              "px-4 py-2 rounded-xl font-bold transition-all",
              settings.enabled
                ? "bg-emerald-500 text-white"
                : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700"
            )}
          >
            {settings.enabled ? '✓ Enabled' : 'Enable'}
          </button>
        </div>

        {/* Email Reminders */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl">
          <div>
            <p className="font-bold text-neutral-900 dark:text-white">
              Email Reminders
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Terima reminder via email
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.email_reminders}
              onChange={(e) => {
                setSettings(prev => ({ ...prev, email_reminders: e.target.checked }));
                router.post('/user/settings/notifications', {
                  email_reminders: e.target.checked,
                });
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {/* Reminder Timing */}
        <div className="p-4 rounded-2xl bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl space-y-3">
          <p className="font-bold text-neutral-900 dark:text-white mb-3">
            Reminder Timing
          </p>
          
          {[
            { key: 'reminder_3days', label: '3 hari sebelum deadline', icon: '📅' },
            { key: 'reminder_1day', label: '1 hari sebelum deadline', icon: '⏰' },
            { key: 'reminder_1hour', label: '1 jam sebelum deadline', icon: '🚨' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                  {item.label}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[item.key as keyof typeof settings] as boolean}
                  onChange={(e) => {
                    setSettings(prev => ({ ...prev, [item.key]: e.target.checked }));
                    router.post('/user/settings/notifications', {
                      [item.key]: e.target.checked,
                    });
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          ))}
        </div>

        {/* Digest Mode */}
        <div className="p-4 rounded-2xl bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl">
          <p className="font-bold text-neutral-900 dark:text-white mb-3">
            Digest Mode
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">
            Terima ringkasan tugas secara berkala
          </p>
          <div className="flex gap-2">
            {[
              { value: 'daily', label: 'Daily', icon: '📆' },
              { value: 'weekly', label: 'Weekly', icon: '📅' },
              { value: 'none', label: 'None', icon: '🚫' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setSettings(prev => ({ ...prev, digest_mode: option.value as any }));
                  router.post('/user/settings/notifications', {
                    digest_mode: option.value,
                  });
                }}
                className={cn(
                  "flex-1 py-2 px-3 rounded-xl font-bold transition-all",
                  settings.digest_mode === option.value
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                    : "bg-white/60 dark:bg-neutral-700/60 text-neutral-700 dark:text-neutral-300 hover:bg-white/80"
                )}
              >
                <span className="mr-1">{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
```


---

### 6️⃣ CALENDAR INTEGRATION & TIMELINE VIEW

**Deskripsi**: Integrasi kalender dengan timeline view untuk visualisasi deadline

**Features**:
- Interactive calendar view
- Timeline visualization
- Deadline clustering
- Export to Google Calendar / iCal
- Month/Week/Day views
- Color-coded by priority
- Quick add from calendar

**Implementation**:
```typescript
// Install: npm install react-big-calendar date-fns

import { Calendar, dateFnsLocalizer, Event } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'id': localeId,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface TugasEvent extends Event {
  tugas: Tugas;
  priority: string;
}

const CalendarView = ({ tugasList }: { tugasList: Tugas[] }) => {
  const [view, setView] = useState<'month' | 'week' | 'day' | 'agenda'>('month');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Convert tugas to calendar events
  const events: TugasEvent[] = tugasList.map(tugas => ({
    title: tugas.judul,
    start: new Date(tugas.deadline),
    end: new Date(tugas.deadline),
    tugas,
    priority: tugas.prioritas,
  }));

  const eventStyleGetter = (event: TugasEvent) => {
    const priorityColors = {
      tinggi: { backgroundColor: '#ef4444', borderColor: '#dc2626' },
      sedang: { backgroundColor: '#f59e0b', borderColor: '#d97706' },
      rendah: { backgroundColor: '#10b981', borderColor: '#059669' },
    };

    return {
      style: {
        ...priorityColors[event.priority as keyof typeof priorityColors],
        borderRadius: '8px',
        border: 'none',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '12px',
        padding: '4px 8px',
      },
    };
  };

  const handleExportToGoogleCalendar = (tugas: Tugas) => {
    const startDate = new Date(tugas.deadline);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration

    const googleCalendarUrl = new URL('https://calendar.google.com/calendar/render');
    googleCalendarUrl.searchParams.set('action', 'TEMPLATE');
    googleCalendarUrl.searchParams.set('text', tugas.judul);
    googleCalendarUrl.searchParams.set('details', tugas.deskripsi);
    googleCalendarUrl.searchParams.set('dates', `${format(startDate, "yyyyMMdd'T'HHmmss")}/${format(endDate, "yyyyMMdd'T'HHmmss")}`);
    googleCalendarUrl.searchParams.set('location', tugas.course.nama);

    window.open(googleCalendarUrl.toString(), '_blank');
  };

  const handleExportToICal = (tugas: Tugas) => {
    const startDate = new Date(tugas.deadline);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    const icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//UNPAM//Tugas//EN',
      'BEGIN:VEVENT',
      `UID:tugas-${tugas.id}@unpam.ac.id`,
      `DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss'Z'")}`,
      `DTSTART:${format(startDate, "yyyyMMdd'T'HHmmss")}`,
      `DTEND:${format(endDate, "yyyyMMdd'T'HHmmss")}`,
      `SUMMARY:${tugas.judul}`,
      `DESCRIPTION:${tugas.deskripsi}`,
      `LOCATION:${tugas.course.nama}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icalContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tugas-${tugas.id}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/20 dark:border-white/5 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 dark:text-white">
                Calendar View
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Visualisasi deadline tugas
              </p>
            </div>
          </div>

          {/* View Switcher */}
          <div className="flex items-center gap-2 bg-white/60 dark:bg-neutral-800/60 rounded-xl p-1 backdrop-blur-xl">
            {(['month', 'week', 'day', 'agenda'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                  view === v
                    ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white"
                    : "text-neutral-700 dark:text-neutral-300 hover:bg-white/80 dark:hover:bg-neutral-700/80"
                )}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="p-4">
        <div className="rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 shadow-lg">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            view={view}
            onView={setView}
            date={selectedDate}
            onNavigate={setSelectedDate}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={(event: TugasEvent) => {
              router.visit(`/user/tugas/${event.tugas.id}`);
            }}
            components={{
              event: ({ event }: { event: TugasEvent }) => (
                <div className="flex items-center gap-1">
                  {event.tugas.is_overdue && (
                    <AlertTriangle className="h-3 w-3" />
                  )}
                  <span className="truncate">{event.title}</span>
                </div>
              ),
            }}
          />
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span className="text-xs text-neutral-600 dark:text-neutral-400">Prioritas Tinggi</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-amber-500" />
            <span className="text-xs text-neutral-600 dark:text-neutral-400">Prioritas Sedang</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-neutral-600 dark:text-neutral-400">Prioritas Rendah</span>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="p-4 border-t border-white/20 dark:border-white/5 bg-white/20 dark:bg-neutral-900/20">
        <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-3">
          Export Deadline
        </p>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              tugasList.forEach(tugas => handleExportToGoogleCalendar(tugas));
            }}
            className="flex-1 py-2 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all"
          >
            <div className="flex items-center justify-center gap-2">
              <Calendar className="h-4 w-4" />
              Google Calendar
            </div>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              tugasList.forEach(tugas => handleExportToICal(tugas));
            }}
            className="flex-1 py-2 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold shadow-lg hover:from-purple-600 hover:to-pink-700 transition-all"
          >
            <div className="flex items-center justify-center gap-2">
              <Download className="h-4 w-4" />
              iCal / Outlook
            </div>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Timeline View Component
const TimelineView = ({ tugasList }: { tugasList: Tugas[] }) => {
  const sortedTugas = [...tugasList].sort((a, b) => 
    new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
          <Clock className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
            Timeline View
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Urutan deadline tugas
          </p>
        </div>
      </div>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500" />

        {/* Timeline Items */}
        <div className="space-y-6">
          {sortedTugas.map((tugas, index) => {
            const daysUntil = tugas.days_until_deadline;
            const isOverdue = tugas.is_overdue;
            const isUrgent = daysUntil <= 3 && !isOverdue;

            return (
              <motion.div
                key={tugas.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative pl-16"
              >
                {/* Timeline Dot */}
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  className={cn(
                    "absolute left-6 top-2 h-5 w-5 rounded-full border-4 border-white dark:border-neutral-900",
                    isOverdue
                      ? "bg-red-500"
                      : isUrgent
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  )}
                >
                  {isOverdue && (
                    <motion.div
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0 rounded-full bg-red-500 opacity-50"
                    />
                  )}
                </motion.div>

                {/* Card */}
                <motion.div
                  whileHover={{ scale: 1.02, x: 5 }}
                  onClick={() => router.visit(`/user/tugas/${tugas.id}`)}
                  className={cn(
                    "rounded-2xl border p-4 cursor-pointer transition-all",
                    isOverdue
                      ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                      : isUrgent
                      ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                      : "bg-white/60 dark:bg-neutral-800/60 border-white/20 dark:border-white/5 backdrop-blur-xl"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-neutral-900 dark:text-white mb-1">
                        {tugas.judul}
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                        {tugas.course.nama}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {getPriorityBadge(tugas.prioritas)}
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          {tugas.deadline_display}
                        </span>
                      </div>
                    </div>

                    {/* Days Counter */}
                    <div className={cn(
                      "flex flex-col items-center justify-center rounded-xl p-3 min-w-[80px]",
                      isOverdue
                        ? "bg-red-500 text-white"
                        : isUrgent
                        ? "bg-amber-500 text-white"
                        : "bg-emerald-500 text-white"
                    )}>
                      <span className="text-2xl font-bold">
                        {isOverdue ? '❌' : daysUntil}
                      </span>
                      <span className="text-xs font-medium">
                        {isOverdue ? 'Lewat' : 'Hari'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
```

---

### 7️⃣ ANALYTICS & INSIGHTS DASHBOARD

**Deskripsi**: Dashboard analytics untuk tracking progress dan insights

**Features**:
- Completion rate chart
- Time management analysis
- Subject performance breakdown
- Submission patterns
- Grade trends
- Productivity insights
- Comparison with class average

**Implementation**:
```typescript
// Install: npm install recharts

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

interface AnalyticsData {
  completion_rate: number;
  avg_grade: number;
  total_submissions: number;
  on_time_submissions: number;
  late_submissions: number;
  pending_tasks: number;
  completion_trend: { date: string; completed: number; total: number }[];
  subject_performance: { subject: string; avg_grade: number; completion_rate: number }[];
  submission_patterns: { hour: number; count: number }[];
  grade_distribution: { range: string; count: number }[];
  productivity_score: number;
  class_average: number;
}

const AnalyticsDashboard = ({ analytics }: { analytics: AnalyticsData }) => {
  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { 
            label: 'Completion Rate', 
            value: `${analytics.completion_rate}%`, 
            icon: CheckCircle, 
            color: 'from-emerald-500 to-teal-600',
            comparison: analytics.class_average 
          },
          { 
            label: 'Avg Grade', 
            value: analytics.avg_grade.toFixed(1), 
            icon: Award, 
            color: 'from-blue-500 to-indigo-600' 
          },
          { 
            label: 'On Time', 
            value: analytics.on_time_submissions, 
            icon: Clock, 
            color: 'from-purple-500 to-violet-600' 
          },
          { 
            label: 'Productivity', 
            value: `${analytics.productivity_score}/100`, 
            icon: TrendingUp, 
            color: 'from-amber-500 to-orange-600' 
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-5 shadow-xl backdrop-blur-xl"
          >
            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white mb-3`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
              {stat.label}
            </p>
            <p className="text-3xl font-bold text-neutral-900 dark:text-white">
              {stat.value}
            </p>
            {stat.comparison && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                Class avg: {stat.comparison}%
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Completion Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl"
      >
        <h3 className="font-bold text-lg text-neutral-900 dark:text-white mb-4">
          Completion Trend
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={analytics.completion_trend}>
            <defs>
              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }} 
            />
            <Area 
              type="monotone" 
              dataKey="completed" 
              stroke="#10b981" 
              fillOpacity={1} 
              fill="url(#colorCompleted)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Subject Performance & Submission Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Performance */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl"
        >
          <h3 className="font-bold text-lg text-neutral-900 dark:text-white mb-4">
            Subject Performance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={analytics.subject_performance}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" stroke="#6b7280" />
              <PolarRadiusAxis stroke="#6b7280" />
              <Radar 
                name="Completion Rate" 
                dataKey="completion_rate" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.6} 
              />
              <Radar 
                name="Avg Grade" 
                dataKey="avg_grade" 
                stroke="#6366f1" 
                fill="#6366f1" 
                fillOpacity={0.6} 
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Submission Patterns */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl"
        >
          <h3 className="font-bold text-lg text-neutral-900 dark:text-white mb-4">
            Submission Patterns
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.submission_patterns}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="hour" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }} 
              />
              <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-3 text-center">
            Peak submission time: {analytics.submission_patterns.reduce((max, p) => p.count > max.count ? p : max).hour}:00
          </p>
        </motion.div>
      </div>

      {/* Insights & Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
              AI Insights & Recommendations
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Personalized tips untuk meningkatkan performa
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            {
              type: 'success',
              icon: CheckCircle,
              color: 'from-emerald-500 to-teal-600',
              message: `Great job! Your completion rate (${analytics.completion_rate}%) is above class average (${analytics.class_average}%)`,
            },
            {
              type: 'warning',
              icon: AlertTriangle,
              color: 'from-amber-500 to-orange-600',
              message: `You have ${analytics.pending_tasks} pending tasks. Consider working on them soon to avoid last-minute rush.`,
            },
            {
              type: 'info',
              icon: Lightbulb,
              color: 'from-blue-500 to-indigo-600',
              message: `Your most productive time is around ${analytics.submission_patterns.reduce((max, p) => p.count > max.count ? p : max).hour}:00. Schedule important tasks during this time.`,
            },
          ].map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3 p-4 rounded-2xl bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl"
            >
              <div className={`p-2 rounded-lg bg-gradient-to-br ${insight.color} text-white flex-shrink-0`}>
                <insight.icon className="h-5 w-5" />
              </div>
              <p className="text-sm text-neutral-700 dark:text-neutral-300">
                {insight.message}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};
```


---

### 8️⃣ GAMIFICATION & ACHIEVEMENTS

**Deskripsi**: Sistem gamifikasi untuk meningkatkan motivasi mahasiswa

**Features**:
- Achievement badges
- Streak tracking
- Leaderboard
- Points system
- Level progression
- Rewards & unlockables
- Challenge system

**Implementation**:
```typescript
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  unlocked: boolean;
  progress: number;
  total: number;
  unlocked_at?: string;
}

interface UserStats {
  level: number;
  total_points: number;
  points_to_next_level: number;
  current_streak: number;
  longest_streak: number;
  rank: number;
  total_users: number;
  achievements_unlocked: number;
  total_achievements: number;
}

const GamificationDashboard = ({ 
  achievements, 
  stats 
}: { 
  achievements: Achievement[]; 
  stats: UserStats;
}) => {
  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-amber-400 to-amber-600',
  };

  const rarityGlow = {
    common: 'shadow-gray-500/20',
    rare: 'shadow-blue-500/30',
    epic: 'shadow-purple-500/40',
    legendary: 'shadow-amber-500/50',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Level & Progress */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl overflow-hidden relative"
      >
        {/* Animated Background */}
        <motion.div
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="relative"
              >
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {stats.level}
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-500"
                />
              </motion.div>
              <div>
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
                  Level {stats.level}
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {stats.total_points.toLocaleString()} total points
                </p>
              </div>
            </div>

            {/* Rank Badge */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold shadow-lg">
                <Award className="h-5 w-5" />
                Rank #{stats.rank}
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Top {Math.round((stats.rank / stats.total_users) * 100)}%
              </p>
            </motion.div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">
                Progress to Level {stats.level + 1}
              </span>
              <span className="font-bold text-neutral-900 dark:text-white">
                {stats.points_to_next_level} points needed
              </span>
            </div>
            <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ 
                  width: `${((stats.total_points % 1000) / 1000) * 100}%` 
                }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full relative overflow-hidden"
              >
                <motion.div
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                />
              </motion.div>
            </div>
          </div>

          {/* Streak Counter */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="text-2xl">🔥</div>
                <span className="text-sm font-bold text-orange-700 dark:text-orange-400">
                  Current Streak
                </span>
              </div>
              <p className="text-3xl font-bold text-orange-900 dark:text-orange-300">
                {stats.current_streak} days
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="text-2xl">🏆</div>
                <span className="text-sm font-bold text-purple-700 dark:text-purple-400">
                  Best Streak
                </span>
              </div>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-300">
                {stats.longest_streak} days
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Achievements Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
                Achievements
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {stats.achievements_unlocked} / {stats.total_achievements} unlocked
              </p>
            </div>
          </div>

          {/* Filter by Rarity */}
          <div className="flex gap-2">
            {(['all', 'common', 'rare', 'epic', 'legendary'] as const).map((rarity) => (
              <button
                key={rarity}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                  rarity === 'all'
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                    : `bg-gradient-to-r ${rarityColors[rarity as keyof typeof rarityColors]} text-white opacity-50 hover:opacity-100`
                )}
              >
                {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className={cn(
                "relative rounded-2xl p-4 cursor-pointer transition-all",
                achievement.unlocked
                  ? `bg-gradient-to-br ${rarityColors[achievement.rarity]} text-white shadow-xl ${rarityGlow[achievement.rarity]}`
                  : "bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600"
              )}
            >
              {/* Rarity Indicator */}
              {achievement.unlocked && (
                <motion.div
                  animate={{
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent"
                />
              )}

              <div className="relative z-10">
                {/* Icon */}
                <div className="text-4xl mb-3 text-center">
                  {achievement.unlocked ? achievement.icon : '🔒'}
                </div>

                {/* Title */}
                <h4 className="font-bold text-sm text-center mb-1">
                  {achievement.title}
                </h4>

                {/* Description */}
                <p className={cn(
                  "text-xs text-center mb-3",
                  achievement.unlocked ? "opacity-90" : "opacity-60"
                )}>
                  {achievement.description}
                </p>

                {/* Progress Bar (if not unlocked) */}
                {!achievement.unlocked && achievement.progress > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span>Progress</span>
                      <span>{achievement.progress}/{achievement.total}</span>
                    </div>
                    <div className="h-1.5 bg-neutral-300 dark:bg-neutral-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                      />
                    </div>
                  </div>
                )}

                {/* Points */}
                <div className="mt-3 text-center">
                  <span className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold",
                    achievement.unlocked
                      ? "bg-white/20"
                      : "bg-neutral-300 dark:bg-neutral-700"
                  )}>
                    <Sparkles className="h-3 w-3" />
                    {achievement.points} pts
                  </span>
                </div>

                {/* Unlocked Date */}
                {achievement.unlocked && achievement.unlocked_at && (
                  <p className="text-xs text-center mt-2 opacity-75">
                    Unlocked {achievement.unlocked_at}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Leaderboard Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
                Leaderboard
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Top performers this week
              </p>
            </div>
          </div>

          <Button
            onClick={() => router.visit('/user/leaderboard')}
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700"
          >
            View Full Leaderboard
          </Button>
        </div>

        <div className="space-y-3">
          {[
            { rank: 1, name: 'Ahmad Rizki', points: 2450, avatar: '👨', medal: '🥇' },
            { rank: 2, name: 'Siti Nurhaliza', points: 2380, avatar: '👩', medal: '🥈' },
            { rank: 3, name: 'Budi Santoso', points: 2310, avatar: '👨', medal: '🥉' },
            { rank: stats.rank, name: 'You', points: stats.total_points, avatar: '⭐', highlight: true },
          ].map((user, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "flex items-center gap-4 p-4 rounded-2xl transition-all",
                user.highlight
                  ? "bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-2 border-indigo-500"
                  : "bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl"
              )}
            >
              <div className="flex items-center gap-3 flex-1">
                <span className="text-2xl">{user.medal || `#${user.rank}`}</span>
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl">
                  {user.avatar}
                </div>
                <div>
                  <p className="font-bold text-neutral-900 dark:text-white">
                    {user.name}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {user.points.toLocaleString()} points
                  </p>
                </div>
              </div>

              {user.highlight && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-2xl"
                >
                  ⭐
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};
```

---

## 📝 BACKEND IMPLEMENTATION

### Database Migrations

```php
// database/migrations/xxxx_add_gamification_to_submissions.php
public function up()
{
    Schema::table('submissions', function (Blueprint $table) {
        $table->enum('status', ['todo', 'in_progress', 'review', 'done'])->default('todo');
        $table->integer('points_earned')->default(0);
        $table->boolean('is_on_time')->default(true);
    });

    Schema::create('achievements', function (Blueprint $table) {
        $table->id();
        $table->string('key')->unique();
        $table->string('title');
        $table->text('description');
        $table->string('icon');
        $table->enum('rarity', ['common', 'rare', 'epic', 'legendary']);
        $table->integer('points');
        $table->json('criteria');
        $table->timestamps();
    });

    Schema::create('user_achievements', function (Blueprint $table) {
        $table->id();
        $table->foreignId('mahasiswa_id')->constrained('mahasiswa')->onDelete('cascade');
        $table->foreignId('achievement_id')->constrained('achievements')->onDelete('cascade');
        $table->integer('progress')->default(0);
        $table->boolean('unlocked')->default(false);
        $table->timestamp('unlocked_at')->nullable();
        $table->timestamps();
    });

    Schema::create('notification_settings', function (Blueprint $table) {
        $table->id();
        $table->foreignId('mahasiswa_id')->constrained('mahasiswa')->onDelete('cascade');
        $table->boolean('push_notifications')->default(false);
        $table->boolean('email_reminders')->default(true);
        $table->boolean('reminder_3days')->default(true);
        $table->boolean('reminder_1day')->default(true);
        $table->boolean('reminder_1hour')->default(true);
        $table->enum('digest_mode', ['daily', 'weekly', 'none'])->default('daily');
        $table->timestamps();
    });

    Schema::create('tugas_dependencies', function (Blueprint $table) {
        $table->id();
        $table->foreignId('tugas_id')->constrained('tugas')->onDelete('cascade');
        $table->foreignId('depends_on_tugas_id')->constrained('tugas')->onDelete('cascade');
        $table->timestamps();
    });
}
```

### Controllers

```php
// app/Http/Controllers/User/TugasController.php

public function updateStatus(Request $request, $id)
{
    $validated = $request->validate([
        'status' => 'required|in:todo,in_progress,review,done'
    ]);

    $submission = Submission::updateOrCreate(
        [
            'tugas_id' => $id,
            'mahasiswa_id' => auth()->id()
        ],
        ['status' => $validated['status']]
    );

    // Award points if completed
    if ($validated['status'] === 'done' && !$submission->points_earned) {
        $tugas = Tugas::find($id);
        $points = $this->calculatePoints($tugas, $submission);
        $submission->update(['points_earned' => $points]);
        
        // Check achievements
        $this->checkAchievements(auth()->id());
    }

    return back()->with('success', 'Status updated');
}

private function calculatePoints($tugas, $submission)
{
    $basePoints = 100;
    
    // Bonus for priority
    $priorityBonus = [
        'tinggi' => 50,
        'sedang' => 30,
        'rendah' => 10,
    ];
    $basePoints += $priorityBonus[$tugas->prioritas] ?? 0;
    
    // Bonus for on-time submission
    if ($submission->is_on_time) {
        $basePoints += 50;
    }
    
    // Bonus for early submission
    $deadline = Carbon::parse($tugas->deadline);
    $submitted = Carbon::parse($submission->submitted_at);
    $daysEarly = $deadline->diffInDays($submitted, false);
    
    if ($daysEarly > 0) {
        $basePoints += min($daysEarly * 10, 100); // Max 100 bonus
    }
    
    return $basePoints;
}

public function analytics()
{
    $mahasiswaId = auth()->id();
    
    $analytics = [
        'completion_rate' => $this->getCompletionRate($mahasiswaId),
        'avg_grade' => $this->getAverageGrade($mahasiswaId),
        'total_submissions' => Submission::where('mahasiswa_id', $mahasiswaId)->count(),
        'on_time_submissions' => Submission::where('mahasiswa_id', $mahasiswaId)->where('is_on_time', true)->count(),
        'late_submissions' => Submission::where('mahasiswa_id', $mahasiswaId)->where('is_on_time', false)->count(),
        'pending_tasks' => Tugas::whereDoesntHave('submissions', function($q) use ($mahasiswaId) {
            $q->where('mahasiswa_id', $mahasiswaId)->where('status', 'done');
        })->count(),
        'completion_trend' => $this->getCompletionTrend($mahasiswaId),
        'subject_performance' => $this->getSubjectPerformance($mahasiswaId),
        'submission_patterns' => $this->getSubmissionPatterns($mahasiswaId),
        'grade_distribution' => $this->getGradeDistribution($mahasiswaId),
        'productivity_score' => $this->calculateProductivityScore($mahasiswaId),
        'class_average' => $this->getClassAverage(),
    ];
    
    return response()->json($analytics);
}
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 1: Core Enhancements (Week 1)
- [ ] Install dependencies (@dnd-kit, @tiptap, pusher-js, react-big-calendar, recharts)
- [ ] Create database migrations for new tables
- [ ] Implement Kanban Board View with drag & drop
- [ ] Add Task Dependencies system
- [ ] Update backend controllers for status management

### Phase 2: Collaboration & Editor (Week 2)
- [ ] Implement Real-time Collaboration features
- [ ] Setup Pusher for real-time messaging
- [ ] Integrate Rich Text Editor (TipTap)
- [ ] Add File Attachments with drag & drop
- [ ] Implement upload progress tracking

### Phase 3: Notifications & Calendar (Week 3)
- [ ] Build Smart Notifications system
- [ ] Implement Browser Push Notifications
- [ ] Add Email Reminder scheduling
- [ ] Integrate Calendar View (react-big-calendar)
- [ ] Add Timeline View visualization
- [ ] Implement Export to Google Calendar / iCal

### Phase 4: Analytics & Gamification (Week 4)
- [ ] Build Analytics Dashboard with Recharts
- [ ] Implement Completion Rate tracking
- [ ] Add Subject Performance analysis
- [ ] Create Gamification system
- [ ] Implement Achievement badges
- [ ] Add Streak tracking
- [ ] Build Leaderboard system
- [ ] Implement Points calculation

### Phase 5: Testing & Polish (Week 5)
- [ ] Test all features end-to-end
- [ ] Fix bugs and edge cases
- [ ] Optimize performance
- [ ] Add loading states
- [ ] Implement error handling
- [ ] Add success/error toasts
- [ ] Test responsive design
- [ ] Cross-browser testing

---

## 🎨 UI/UX CONSISTENCY CHECKLIST

### Colors & Styling
- [ ] All containers use `bg-white/40 dark:bg-neutral-900/40`
- [ ] All borders use `border-white/20 dark:border-white/5`
- [ ] Header gradient: `from-indigo-600 via-purple-600 to-pink-500`
- [ ] All containers use `rounded-3xl` (NOT rounded-2xl)
- [ ] All containers use `shadow-xl` (NOT shadow-sm)
- [ ] All containers use `backdrop-blur-xl`

### Animations
- [ ] All animations use `stiffness: 300, damping: 20`
- [ ] Hover animations use `scale: 1.04, y: -4`
- [ ] Card animations use proper spring physics
- [ ] Loading states have smooth transitions

### Icons & Assets
- [ ] Use PNG icons from `/assets/admin/` folder
- [ ] Icons have `drop-shadow-[0_8px_12px_rgba(0,0,0,0.35)]`
- [ ] Icons scale on hover with `whileHover={{ scale: 1.1 }}`

### Typography
- [ ] Primary text: `text-neutral-900 dark:text-white`
- [ ] Secondary text: `text-neutral-500 dark:text-neutral-400`
- [ ] Font weights: bold for headers, medium for body

---

## 🚀 PERFORMANCE OPTIMIZATION

1. **Lazy Loading**: Use React.lazy() for heavy components
2. **Memoization**: Use useMemo() for expensive calculations
3. **Virtualization**: Use react-window for long lists
4. **Debouncing**: Debounce search and filter inputs
5. **Image Optimization**: Compress PNG icons
6. **Code Splitting**: Split by route
7. **Caching**: Cache API responses with React Query

---

## 📱 RESPONSIVE DESIGN

- Mobile: 1 column layout, stacked cards
- Tablet: 2 column layout, side-by-side
- Desktop: 3-4 column layout, full features
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)

---

## 🔒 SECURITY CONSIDERATIONS

1. **File Upload**: Validate file types and sizes
2. **XSS Protection**: Sanitize rich text content
3. **CSRF Protection**: Include CSRF tokens
4. **Rate Limiting**: Limit API requests
5. **Authentication**: Verify user permissions
6. **SQL Injection**: Use parameterized queries

---

## 📊 ESTIMATED TIME

- **Phase 1**: 40 hours
- **Phase 2**: 35 hours
- **Phase 3**: 30 hours
- **Phase 4**: 35 hours
- **Phase 5**: 20 hours
- **Total**: ~160 hours (4 weeks)

---

## 🎯 SUCCESS METRICS

1. **User Engagement**: 50% increase in task completion rate
2. **Time on Page**: 30% increase in average session duration
3. **Feature Adoption**: 70% of users try new features
4. **Performance**: Page load < 2 seconds
5. **Mobile Usage**: 40% of traffic from mobile
6. **User Satisfaction**: 4.5+ star rating

---

## 📚 DOCUMENTATION

Create comprehensive documentation:
1. User Guide (Bahasa Indonesia)
2. Developer Documentation
3. API Documentation
4. Deployment Guide
5. Troubleshooting Guide

---

## 🎉 SUMMARY

Prompt ini memberikan 8 inovasi ultra advanced untuk menu Informasi Tugas Mahasiswa dengan 100% matching admin dashboard style. Semua fitur dirancang untuk meningkatkan produktivitas, kolaborasi, dan motivasi mahasiswa dalam mengelola tugas kuliah.

**Key Innovations**:
1. Kanban Board dengan drag & drop
2. Task Dependencies system
3. Real-time Collaboration
4. Rich Text Editor & File Attachments
5. Smart Notifications & Reminders
6. Calendar Integration & Timeline
7. Analytics & Insights Dashboard
8. Gamification & Achievements

Semua implementasi menggunakan HITAM theme dengan glassmorphism, smooth animations, dan modern UI/UX yang konsisten dengan dashboard admin.

