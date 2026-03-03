# 🎯 PROMPT: GROUP ASSIGNMENT MANAGEMENT - ULTRA ADVANCED (COMPLETE)

## 📋 OVERVIEW

Prompt ini untuk membuat sistem **Manajemen Tugas Kelompok (Group Assignment)** yang ultra advanced dengan 3 mode pembentukan grup, fitur kolaborasi real-time, sistem penilaian fleksibel, dan analytics lengkap. Sistem ini akan menjadi fitur baru yang terintegrasi dengan sistem akademik.

### Target Users:
- **Dosen**: Untuk membuat dan mengelola tugas kelompok
- **Mahasiswa**: Untuk berkolaborasi dalam kelompok

### File yang Akan Dibuat:
- `resources/js/pages/dosen/tugas-kelompok.tsx` - Dosen management page
- `resources/js/pages/dosen/tugas-kelompok-detail.tsx` - Assignment detail & analytics
- `resources/js/pages/user/akademik/tugas-kelompok.tsx` - Mahasiswa group list
- `resources/js/pages/user/akademik/tugas-kelompok-detail.tsx` - Group workspace
- `app/Http/Controllers/Dosen/TugasKelompokController.php` - Dosen controller
- `app/Http/Controllers/User/TugasKelompokController.php` - Mahasiswa controller
- `app/Services/GroupFormationService.php` - Group formation service
- `app/Services/CollaborationService.php` - Chat & collaboration service
- `app/Services/GradingService.php` - Grading service
- `app/Services/AnalyticsService.php` - Analytics service

### Fokus Utama:
1. **100% Matching Admin Dashboard** - Warna, UI/UX, container, animasi, header
2. **3 Formation Modes** - Self-form, Random, Manual
3. **Real-time Collaboration** - Chat, task distribution, file sharing
4. **Flexible Grading** - Same grade, individual, peer evaluation, contribution-based
5. **Comprehensive Analytics** - Progress tracking, contribution metrics
6. **Conflict Resolution** - Tools untuk handle konflik kelompok
7. **Gamification** - Achievements, leaderboards, badges
8. **Mobile Responsive** - Perfect di semua device

---

## 🎨 DESIGN SYSTEM - MATCHING ADMIN DASHBOARD (WAJIB)

### Color Palette (WAJIB)
```typescript
// CONTAINER COLORS
bg-white/40 dark:bg-neutral-900/40  // Main containers
backdrop-blur-xl                     // Glassmorphism effect

// BORDER COLORS
border-white/20 dark:border-white/5  // Container borders

// GRADIENT HEADER (ADMIN STYLE)
from-indigo-600 via-purple-600 to-pink-500

// TEXT COLORS
text-neutral-900 dark:text-white     // Primary text
text-neutral-500 dark:text-neutral-400  // Secondary text

// CATEGORY COLORS
self-form: from-emerald-400 to-teal-600
random: from-blue-400 to-indigo-600
manual: from-purple-400 to-pink-600
grading: from-amber-400 to-orange-600

// ROUNDED & SHADOWS
rounded-3xl  // Main containers
shadow-xl    // Main shadows
```

### Animation Standards (WAJIB)
```typescript
stiffness: 300
damping: 20

// Hover animations
scale: 1.04
y: -4
transition: { type: 'spring', stiffness: 400, damping: 15 }
```

---

## 🚀 FITUR UTAMA - 3 MODE PEMBENTUKAN GRUP

### MODE 1️⃣: SELF-FORM (Mahasiswa Buat Sendiri)

**Konsep**: Mahasiswa bebas membuat dan join grup sendiri

#### A. Create Group Interface
```typescript
const CreateGroupModal = () => {
  const [groupName, setGroupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateGroup = async () => {
    setIsCreating(true);
    try {
      const response = await axios.post(`/api/tugas-kelompok/${assignmentId}/groups`, {
        name: groupName
      });
      
      toast.success('Grup berhasil dibuat! Kamu adalah ketua grup.');
      router.visit(`/user/akademik/tugas-kelompok/${assignmentId}/group/${response.data.id}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <Users className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
            Buat Grup Baru
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Kamu akan menjadi ketua grup
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Nama Grup</Label>
          <Input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Contoh: Tim Hebat"
            maxLength={50}
          />
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {groupName.length}/50 karakter
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Ketentuan Grup
              </p>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Min {assignment.min_members} - Max {assignment.max_members} anggota</li>
                <li>• Deadline pembentukan: {format(new Date(assignment.formation_deadline), 'dd MMM yyyy HH:mm')}</li>
                <li>• Setelah deadline, grup akan terkunci</li>
              </ul>
            </div>
          </div>
        </div>

        <Button
          onClick={handleCreateGroup}
          disabled={!groupName.trim() || isCreating}
          className="w-full gap-2"
        >
          {isCreating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Buat Grup
        </Button>
      </div>
    </motion.div>
  );
};
```

#### B. Available Groups List
```typescript
const AvailableGroupsList = () => {
  const [groups, setGroups] = useState<AvailableGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.leader_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleJoinGroup = async (groupId: string) => {
    try {
      await axios.post(`/api/tugas-kelompok/groups/${groupId}/join`);
      toast.success('Berhasil bergabung dengan grup!');
      router.reload();
    } catch (error) {
      toast.error('Gagal bergabung. Grup mungkin sudah penuh.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <Search className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
              Grup Tersedia
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {filteredGroups.length} grup dapat diikuti
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama grup atau ketua..."
          className="w-full"
        />
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredGroups.map((group) => (
          <motion.div
            key={group.id}
            whileHover={{ scale: 1.02, y: -4 }}
            className="p-4 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-bold text-neutral-900 dark:text-white mb-1">
                  {group.name}
                </h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Ketua: {group.leader_name}
                </p>
              </div>
              {group.is_full ? (
                <span className="px-2 py-1 rounded-full bg-red-100 dark:bg-red-950/30 text-xs font-semibold text-red-700 dark:text-red-300">
                  Penuh
                </span>
              ) : (
                <span className="px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  Tersedia
                </span>
              )}
            </div>

            {/* Members Preview */}
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-neutral-500" />
                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  {group.current_members}/{group.max_members} Anggota
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {group.members.map((member, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-xs text-neutral-700 dark:text-neutral-300"
                  >
                    {member.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="h-2 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(group.current_members / group.max_members) * 100}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-600"
                />
              </div>
            </div>

            {/* Join Button */}
            <Button
              onClick={() => handleJoinGroup(group.id)}
              disabled={group.is_full}
              variant={group.is_full ? 'outline' : 'default'}
              className="w-full gap-2"
              size="sm"
            >
              {group.is_full ? (
                <>
                  <Lock className="h-4 w-4" />
                  Grup Penuh
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Gabung Grup
                </>
              )}
            </Button>
          </motion.div>
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400">
            Tidak ada grup tersedia
          </p>
        </div>
      )}
    </motion.div>
  );
};
```

---

### MODE 2️⃣: RANDOM (Otomatis Acak)

**Konsep**: Sistem otomatis membuat grup secara acak

#### A. Random Formation Trigger (Dosen)
```typescript
const RandomFormationPanel = () => {
  const [isForming, setIsForming] = useState(false);
  const [balancedMode, setBalancedMode] = useState(false);

  const handleFormRandomGroups = async () => {
    setIsForming(true);
    try {
      const response = await axios.post(`/api/dosen/tugas-kelompok/${assignmentId}/form-random`, {
        balanced: balancedMode
      });
      
      toast.success(`${response.data.groups_created} grup berhasil dibuat!`);
      router.reload();
    } finally {
      setIsForming(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
          <Shuffle className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
            Pembentukan Grup Acak
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Sistem akan membuat grup secara otomatis
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Statistics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Total Mahasiswa</p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {statistics.total_students}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">Grup Akan Dibuat</p>
            <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
              {Math.ceil(statistics.total_students / assignment.max_members)}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
            <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">Ukuran Grup</p>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {assignment.min_members}-{assignment.max_members}
            </p>
          </div>
        </div>

        {/* Balanced Mode Toggle */}
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Scale className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <p className="font-semibold text-neutral-900 dark:text-white">
                  Balanced Distribution
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Pertimbangkan GPA untuk distribusi merata
                </p>
              </div>
            </div>
            <Switch
              checked={balancedMode}
              onCheckedChange={setBalancedMode}
            />
          </div>
        </div>

        {/* Warning */}
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1">
                Perhatian
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Grup yang sudah dibuat akan dihapus dan dibuat ulang. Pastikan belum ada submission.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleFormRandomGroups}
            disabled={isForming}
            className="flex-1 gap-2"
          >
            {isForming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Shuffle className="h-4 w-4" />
            )}
            Buat Grup Acak
          </Button>
          <Button
            variant="outline"
            onClick={() => router.reload()}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
```

---

### MODE 3️⃣: MANUAL (Dosen Assign)

**Konsep**: Dosen manually assign mahasiswa ke grup

#### A. Manual Assignment Interface
```typescript
const ManualAssignmentInterface = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [unassignedStudents, setUnassignedStudents] = useState<Student[]>([]);
  const [draggedStudent, setDraggedStudent] = useState<Student | null>(null);

  const handleDragStart = (student: Student) => {
    setDraggedStudent(student);
  };

  const handleDrop = async (groupId: string) => {
    if (!draggedStudent) return;

    try {
      await axios.post(`/api/dosen/tugas-kelompok/groups/${groupId}/assign`, {
        student_id: draggedStudent.id
      });
      
      toast.success(`${draggedStudent.name} ditambahkan ke grup`);
      router.reload();
    } catch (error) {
      toast.error('Gagal menambahkan mahasiswa');
    } finally {
      setDraggedStudent(null);
    }
  };

  const handleCreateGroup = async () => {
    try {
      const response = await axios.post(`/api/dosen/tugas-kelompok/${assignmentId}/groups`, {
        name: `Grup ${groups.length + 1}`
      });
      
      setGroups([...groups, response.data]);
      toast.success('Grup baru berhasil dibuat');
    } catch (error) {
      toast.error('Gagal membuat grup');
    }
  };

  return (
    <div className="space-y-6">
      {/* Unassigned Students Pool */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
                Mahasiswa Belum Ditugaskan
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {unassignedStudents.length} mahasiswa
              </p>
            </div>
          </div>
          <Button onClick={handleCreateGroup} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Buat Grup Baru
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {unassignedStudents.map((student) => (
            <motion.div
              key={student.id}
              draggable
              onDragStart={() => handleDragStart(student)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-xl bg-white dark:bg-neutral-800 border-2 border-dashed border-neutral-300 dark:border-neutral-600 cursor-move"
            >
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center mx-auto mb-2 font-bold">
                  {student.name.charAt(0)}
                </div>
                <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                  {student.name}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {student.nim}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {unassignedStudents.length === 0 && (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
            <p className="text-neutral-500 dark:text-neutral-400">
              Semua mahasiswa sudah ditugaskan
            </p>
          </div>
        )}
      </motion.div>

      {/* Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group, index) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(group.id)}
            className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-neutral-900 dark:text-white">
                  {group.name}
                </h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {group.members.length}/{assignment.max_members} anggota
                </p>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>

            {/* Members */}
            <div className="space-y-2">
              {group.members.map((member) => (
                <div
                  key={member.id}
                  className="p-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-sm font-bold">
                      {member.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                        {member.name}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {member.nim}
                      </p>
                    </div>
                    {member.is_leader && (
                      <Crown className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                </div>
              ))}

              {/* Drop Zone */}
              {group.members.length < assignment.max_members && (
                <div className="p-4 rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-600 text-center">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Drag mahasiswa ke sini
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
```

---

## 💬 REAL-TIME COLLABORATION FEATURES

### 1️⃣ GROUP CHAT (Real-time dengan WebSocket)

**Konsep**: Chat real-time antar anggota kelompok

#### A. Chat Interface
```typescript
const GroupChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Connect to WebSocket
    const channel = Echo.join(`group.${groupId}`)
      .here((users: User[]) => {
        console.log('Users in chat:', users);
      })
      .joining((user: User) => {
        toast.info(`${user.name} bergabung`);
      })
      .leaving((user: User) => {
        toast.info(`${user.name} keluar`);
      })
      .listen('MessageSent', (e: { message: Message }) => {
        setMessages(prev => [...prev, e.message]);
        scrollToBottom();
      })
      .listenForWhisper('typing', (e: { user: string }) => {
        setIsTyping(prev => [...prev, e.user]);
        setTimeout(() => {
          setIsTyping(prev => prev.filter(u => u !== e.user));
        }, 3000);
      });

    return () => {
      channel.leave();
    };
  }, [groupId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await axios.post(`/api/tugas-kelompok/groups/${groupId}/messages`, {
        content: newMessage
      });
      
      setNewMessage('');
    } catch (error) {
      toast.error('Gagal mengirim pesan');
    }
  };

  const handleTyping = () => {
    Echo.join(`group.${groupId}`)
      .whisper('typing', { user: currentUser.name });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl overflow-hidden"
    >
      {/* Chat Header */}
      <div className="p-4 border-b border-white/20 dark:border-white/5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-6 w-6 text-white" />
            <div>
              <h3 className="font-bold text-white">Group Chat</h3>
              <p className="text-xs text-indigo-100">
                {onlineMembers.length} online
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onlineMembers.slice(0, 3).map((member) => (
              <div
                key={member.id}
                className="w-8 h-8 rounded-full bg-white/20 border-2 border-white flex items-center justify-center text-xs font-bold text-white"
                title={member.name}
              >
                {member.name.charAt(0)}
              </div>
            ))}
            {onlineMembers.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-white flex items-center justify-center text-xs font-bold text-white">
                +{onlineMembers.length - 3}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="h-96 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.sender_id === currentUser.id ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[70%] ${message.sender_id === currentUser.id ? 'order-2' : 'order-1'}`}>
              {message.sender_id !== currentUser.id && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1 px-3">
                  {message.sender_name}
                </p>
              )}
              <div
                className={`p-3 rounded-2xl ${
                  message.sender_id === currentUser.id
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                    : 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.sender_id === currentUser.id
                    ? 'text-indigo-100'
                    : 'text-neutral-500 dark:text-neutral-400'
                }`}>
                  {format(new Date(message.created_at), 'HH:mm')}
                </p>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Typing Indicator */}
        {isTyping.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400"
          >
            <div className="flex gap-1">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                className="w-2 h-2 rounded-full bg-neutral-400"
              />
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                className="w-2 h-2 rounded-full bg-neutral-400"
              />
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                className="w-2 h-2 rounded-full bg-neutral-400"
              />
            </div>
            <span className="text-xs">{isTyping[0]} sedang mengetik...</span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/20 dark:border-white/5">
        <div className="flex items-center gap-3">
          <Input
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ketik pesan..."
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            size="icon"
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
```

---

### 2️⃣ TASK DISTRIBUTION

**Konsep**: Distribusi tugas ke anggota kelompok

#### A. Task Management Interface
```typescript
const TaskManagement = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const tasksByStatus = {
    pending: tasks.filter(t => t.status === 'pending'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    completed: tasks.filter(t => t.status === 'completed'),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white">
            <CheckSquare className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
              Task Distribution
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {tasks.length} tasks • {tasksByStatus.completed.length} completed
            </p>
          </div>
        </div>
        {isLeader && (
          <Button onClick={() => setShowCreateModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        )}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pending */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <h4 className="font-semibold text-neutral-900 dark:text-white">
              Pending
            </h4>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/30 text-xs font-bold text-amber-700 dark:text-amber-300">
              {tasksByStatus.pending.length}
            </span>
          </div>
          {tasksByStatus.pending.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>

        {/* In Progress */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <h4 className="font-semibold text-neutral-900 dark:text-white">
              In Progress
            </h4>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/30 text-xs font-bold text-blue-700 dark:text-blue-300">
              {tasksByStatus.in_progress.length}
            </span>
          </div>
          {tasksByStatus.in_progress.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>

        {/* Completed */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <h4 className="font-semibold text-neutral-900 dark:text-white">
              Completed
            </h4>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              {tasksByStatus.completed.length}
            </span>
          </div>
          {tasksByStatus.completed.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <CreateTaskModal
          groupId={groupId}
          members={groupMembers}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            router.reload();
          }}
        />
      )}
    </motion.div>
  );
};

const TaskCard = ({ task }: { task: Task }) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      await axios.patch(`/api/tugas-kelompok/tasks/${task.id}/status`, {
        status: newStatus
      });
      router.reload();
    } catch (error) {
      toast.error('Gagal update status');
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="p-4 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
    >
      <div className="flex items-start justify-between mb-3">
        <h5 className="font-semibold text-neutral-900 dark:text-white">
          {task.title}
        </h5>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setShowMenu(!showMenu)}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>

      {task.description && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
          {task.description}
        </p>
      )}

      {/* Assigned Members */}
      <div className="flex items-center gap-2 mb-3">
        <Users className="h-4 w-4 text-neutral-500" />
        <div className="flex -space-x-2">
          {task.assigned_to.map((member) => (
            <div
              key={member.id}
              className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xs font-bold border-2 border-white dark:border-neutral-800"
              title={member.name}
            >
              {member.name.charAt(0)}
            </div>
          ))}
        </div>
      </div>

      {/* Deadline */}
      {task.deadline && (
        <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mb-3">
          <Clock className="h-3 w-3" />
          {format(new Date(task.deadline), 'dd MMM yyyy')}
        </div>
      )}

      {/* Status Actions */}
      <div className="flex gap-2">
        {task.status === 'pending' && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleUpdateStatus('in_progress')}
            className="flex-1 text-xs"
          >
            Start
          </Button>
        )}
        {task.status === 'in_progress' && (
          <Button
            size="sm"
            onClick={() => handleUpdateStatus('completed')}
            className="flex-1 text-xs gap-1"
          >
            <CheckCircle className="h-3 w-3" />
            Complete
          </Button>
        )}
        {task.status === 'completed' && (
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <CheckCircle className="h-4 w-4" />
            Completed
          </div>
        )}
      </div>
    </motion.div>
  );
};
```

---

### 3️⃣ FILE SHARING

**Konsep**: Upload dan share files dalam kelompok

#### A. File Upload & Management
```typescript
const FileSharing = () => {
  const [files, setFiles] = useState<GroupFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const file = selectedFiles[0];
    
    // Validate file size (max 25MB)
    if (file.size > 25 * 1024 * 1024) {
      toast.error('File terlalu besar! Maksimal 25MB');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(
        `/api/tugas-kelompok/groups/${groupId}/files`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            setUploadProgress(progress);
          },
        }
      );

      setFiles([response.data, ...files]);
      toast.success('File berhasil diupload!');
    } catch (error) {
      toast.error('Gagal upload file');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await axios.delete(`/api/tugas-kelompok/files/${fileId}`);
      setFiles(files.filter(f => f.id !== fileId));
      toast.success('File berhasil dihapus');
    } catch (error) {
      toast.error('Gagal menghapus file');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <FolderOpen className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
              Shared Files
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {files.length} files • {formatBytes(totalSize)} used
            </p>
          </div>
        </div>
        <label>
          <input
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          <Button as="span" className="gap-2 cursor-pointer">
            <Upload className="h-4 w-4" />
            Upload File
          </Button>
        </label>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-center gap-3 mb-2">
            <Loader2 className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin" />
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              Uploading... {uploadProgress}%
            </p>
          </div>
          <div className="h-2 rounded-full bg-blue-200 dark:bg-blue-900 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress}%` }}
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
            />
          </div>
        </motion.div>
      )}

      {/* Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file) => (
          <motion.div
            key={file.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="p-4 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950/30 dark:to-purple-950/30">
                {getFileIcon(file.file_type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-neutral-900 dark:text-white truncate">
                  {file.original_name}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {formatBytes(file.file_size)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mb-3">
              <User className="h-3 w-3" />
              {file.uploaded_by_name}
              <span>•</span>
              {format(new Date(file.uploaded_at), 'dd MMM yyyy')}
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(file.download_url, '_blank')}
                className="flex-1 text-xs gap-1"
              >
                <Download className="h-3 w-3" />
                Download
              </Button>
              {(file.uploaded_by === currentUser.id || isLeader) && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteFile(file.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {files.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="h-16 w-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400">
            Belum ada file yang diupload
          </p>
        </div>
      )}
    </motion.div>
  );
};

const getFileIcon = (fileType: string) => {
  if (fileType.includes('pdf')) return <FileText className="h-5 w-5 text-red-600" />;
  if (fileType.includes('word') || fileType.includes('doc')) return <FileText className="h-5 w-5 text-blue-600" />;
  if (fileType.includes('excel') || fileType.includes('sheet')) return <FileSpreadsheet className="h-5 w-5 text-emerald-600" />;
  if (fileType.includes('powerpoint') || fileType.includes('presentation')) return <FileText className="h-5 w-5 text-orange-600" />;
  if (fileType.includes('image')) return <Image className="h-5 w-5 text-purple-600" />;
  if (fileType.includes('zip') || fileType.includes('rar')) return <Archive className="h-5 w-5 text-amber-600" />;
  return <File className="h-5 w-5 text-neutral-600" />;
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
```

---

## 📊 GRADING SYSTEM (4 Modes)

### MODE 1️⃣: SAME GRADE FOR ALL

**Konsep**: Semua anggota dapat nilai yang sama

```typescript
const SameGradeMode = ({ submission }: { submission: Submission }) => {
  const [grade, setGrade] = useState('');
  const [notes, setNotes] = useState('');
  const [isGrading, setIsGrading] = useState(false);

  const handleGrade = async () => {
    setIsGrading(true);
    try {
      await axios.post(`/api/dosen/tugas-kelompok/submissions/${submission.id}/grade`, {
        mode: 'same',
        grade: parseFloat(grade),
        notes
      });
      
      toast.success('Nilai berhasil disimpan untuk semua anggota!');
      router.reload();
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Nilai Grup (0-100)</Label>
        <Input
          type="number"
          min="0"
          max="100"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          placeholder="85"
        />
      </div>

      <div>
        <Label>Catatan Penilaian</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Feedback untuk grup..."
          rows={4}
        />
      </div>

      <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
        <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Semua anggota akan mendapat nilai: {grade || '0'}
        </p>
        <div className="space-y-1">
          {submission.group.members.map((member) => (
            <div key={member.id} className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
              <CheckCircle className="h-3 w-3" />
              {member.name} → {grade || '0'}
            </div>
          ))}
        </div>
      </div>

      <Button onClick={handleGrade} disabled={!grade || isGrading} className="w-full">
        {isGrading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Simpan Nilai'}
      </Button>
    </div>
  );
};
```

---

### MODE 2️⃣: INDIVIDUAL ADJUSTMENTS

**Konsep**: Base grade + adjustment per anggota

```typescript
const IndividualAdjustmentMode = ({ submission }: { submission: Submission }) => {
  const [baseGrade, setBaseGrade] = useState('');
  const [adjustments, setAdjustments] = useState<Record<string, { adjustment: number; note: string }>>({});

  const handleAdjustmentChange = (memberId: string, adjustment: number, note: string) => {
    setAdjustments({
      ...adjustments,
      [memberId]: { adjustment, note }
    });
  };

  const calculateFinalGrade = (memberId: string) => {
    const base = parseFloat(baseGrade) || 0;
    const adj = adjustments[memberId]?.adjustment || 0;
    return Math.max(0, Math.min(100, base + adj));
  };

  return (
    <div className="space-y-6">
      <div>
        <Label>Base Grade (Nilai Dasar Grup)</Label>
        <Input
          type="number"
          min="0"
          max="100"
          value={baseGrade}
          onChange={(e) => setBaseGrade(e.target.value)}
          placeholder="80"
        />
      </div>

      <div className="space-y-3">
        <h4 className="font-semibold text-neutral-900 dark:text-white">
          Individual Adjustments
        </h4>
        {submission.group.members.map((member) => (
          <div
            key={member.id}
            className="p-4 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold text-neutral-900 dark:text-white">
                  {member.name}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Kontribusi: {member.contribution_percentage}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {calculateFinalGrade(member.id)}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Final Grade
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Adjustment (+/-)</Label>
                <Input
                  type="number"
                  min="-20"
                  max="20"
                  value={adjustments[member.id]?.adjustment || 0}
                  onChange={(e) => handleAdjustmentChange(
                    member.id,
                    parseInt(e.target.value) || 0,
                    adjustments[member.id]?.note || ''
                  )}
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="text-xs">Note</Label>
                <Input
                  value={adjustments[member.id]?.note || ''}
                  onChange={(e) => handleAdjustmentChange(
                    member.id,
                    adjustments[member.id]?.adjustment || 0,
                    e.target.value
                  )}
                  placeholder="Alasan adjustment..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button onClick={handleGrade} disabled={!baseGrade} className="w-full">
        Simpan Semua Nilai
      </Button>
    </div>
  );
};
```

---

### MODE 3️⃣: PEER EVALUATION

**Konsep**: Anggota saling menilai

```typescript
const PeerEvaluationInterface = ({ assignment, group }: Props) => {
  const [evaluations, setEvaluations] = useState<Record<string, Evaluation>>({});

  const teammates = group.members.filter(m => m.id !== currentUser.id);

  const handleEvaluationChange = (memberId: string, criterion: string, score: number) => {
    setEvaluations({
      ...evaluations,
      [memberId]: {
        ...evaluations[memberId],
        [criterion]: score
      }
    });
  };

  const handleSubmit = async () => {
    try {
      await axios.post(`/api/tugas-kelompok/assignments/${assignment.id}/peer-evaluation`, {
        evaluations
      });
      
      toast.success('Evaluasi berhasil dikirim!');
      router.reload();
    } catch (error) {
      toast.error('Gagal mengirim evaluasi');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white">
          <Star className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
            Peer Evaluation
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Nilai kontribusi teman sekelompokmu
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {teammates.map((member) => (
          <div
            key={member.id}
            className="p-5 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-lg font-bold">
                {member.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-neutral-900 dark:text-white">
                  {member.name}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {member.nim}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Contribution */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm">Kontribusi</Label>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {evaluations[member.id]?.contribution || 0}/5
                  </span>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      onClick={() => handleEvaluationChange(member.id, 'contribution', score)}
                      className={`flex-1 p-2 rounded-lg border-2 transition-all ${
                        (evaluations[member.id]?.contribution || 0) >= score
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                          : 'border-neutral-200 dark:border-neutral-700'
                      }`}
                    >
                      <Star
                        className={`h-5 w-5 mx-auto ${
                          (evaluations[member.id]?.contribution || 0) >= score
                            ? 'text-indigo-600 fill-indigo-600'
                            : 'text-neutral-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Communication */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm">Komunikasi</Label>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {evaluations[member.id]?.communication || 0}/5
                  </span>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      onClick={() => handleEvaluationChange(member.id, 'communication', score)}
                      className={`flex-1 p-2 rounded-lg border-2 transition-all ${
                        (evaluations[member.id]?.communication || 0) >= score
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                          : 'border-neutral-200 dark:border-neutral-700'
                      }`}
                    >
                      <MessageCircle
                        className={`h-5 w-5 mx-auto ${
                          (evaluations[member.id]?.communication || 0) >= score
                            ? 'text-blue-600 fill-blue-600'
                            : 'text-neutral-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Reliability */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm">Keandalan</Label>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {evaluations[member.id]?.reliability || 0}/5
                  </span>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      onClick={() => handleEvaluationChange(member.id, 'reliability', score)}
                      className={`flex-1 p-2 rounded-lg border-2 transition-all ${
                        (evaluations[member.id]?.reliability || 0) >= score
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                          : 'border-neutral-200 dark:border-neutral-700'
                      }`}
                    >
                      <Shield
                        className={`h-5 w-5 mx-auto ${
                          (evaluations[member.id]?.reliability || 0) >= score
                            ? 'text-emerald-600 fill-emerald-600'
                            : 'text-neutral-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm">Kualitas Kerja</Label>
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                    {evaluations[member.id]?.quality || 0}/5
                  </span>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      onClick={() => handleEvaluationChange(member.id, 'quality', score)}
                      className={`flex-1 p-2 rounded-lg border-2 transition-all ${
                        (evaluations[member.id]?.quality || 0) >= score
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30'
                          : 'border-neutral-200 dark:border-neutral-700'
                      }`}
                    >
                      <Award
                        className={`h-5 w-5 mx-auto ${
                          (evaluations[member.id]?.quality || 0) >= score
                            ? 'text-purple-600 fill-purple-600'
                            : 'text-neutral-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comments */}
              <div>
                <Label className="text-sm">Komentar (Opsional)</Label>
                <Textarea
                  value={evaluations[member.id]?.comments || ''}
                  onChange={(e) => setEvaluations({
                    ...evaluations,
                    [member.id]: {
                      ...evaluations[member.id],
                      comments: e.target.value
                    }
                  })}
                  placeholder="Feedback untuk teman..."
                  rows={2}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button onClick={handleSubmit} className="w-full mt-6">
        Submit Evaluasi
      </Button>
    </motion.div>
  );
};
```

---

### MODE 4️⃣: CONTRIBUTION-BASED

**Konsep**: Nilai berdasarkan kontribusi otomatis dari activity log

```typescript
const ContributionBasedGrading = ({ submission }: { submission: Submission }) => {
  const [baseGrade, setBaseGrade] = useState('');
  const [contributionScores, setContributionScores] = useState<ContributionScore[]>([]);

  useEffect(() => {
    // Load contribution scores from activity logs
    axios.get(`/api/dosen/tugas-kelompok/groups/${submission.group_id}/contribution-scores`)
      .then(response => setContributionScores(response.data));
  }, [submission.group_id]);

  const calculateFinalGrade = (contributionPercentage: number) => {
    const base = parseFloat(baseGrade) || 0;
    return Math.round(base * (contributionPercentage / 100));
  };

  return (
    <div className="space-y-6">
      <div>
        <Label>Base Grade (Nilai Dasar Grup)</Label>
        <Input
          type="number"
          min="0"
          max="100"
          value={baseGrade}
          onChange={(e) => setBaseGrade(e.target.value)}
          placeholder="85"
        />
      </div>

      <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
        <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Contribution Calculation
        </p>
        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Messages: 1 point each</li>
          <li>• File uploads: 3 points each</li>
          <li>• Tasks completed: 5 points each</li>
        </ul>
      </div>

      <div className="space-y-3">
        {contributionScores.map((score) => (
          <div
            key={score.member_id}
            className="p-4 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold text-neutral-900 dark:text-white">
                  {score.member_name}
                </p>
                <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  <span>{score.messages} messages</span>
                  <span>•</span>
                  <span>{score.files} files</span>
                  <span>•</span>
                  <span>{score.tasks} tasks</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {calculateFinalGrade(score.contribution_percentage)}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  ({score.contribution_percentage}% contribution)
                </p>
              </div>
            </div>

            {/* Contribution Bar */}
            <div className="h-2 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${score.contribution_percentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={`h-full ${
                  score.contribution_percentage >= 80
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                    : score.contribution_percentage >= 50
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
                    : 'bg-gradient-to-r from-amber-500 to-orange-600'
                }`}
              />
            </div>
          </div>
        ))}
      </div>

      <Button onClick={handleGrade} disabled={!baseGrade} className="w-full">
        Simpan Nilai Berdasarkan Kontribusi
      </Button>
    </div>
  );
};
```

---

## 📈 ANALYTICS & MONITORING

### 1️⃣ Assignment Analytics Dashboard (Dosen)

```typescript
const AnalyticsDashboard = ({ assignment, analytics }: Props) => {
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          className="p-5 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl"
        >
          <Users className="h-8 w-8 mb-3" />
          <p className="text-3xl font-bold">{analytics.overview.total_groups}</p>
          <p className="text-sm text-blue-100">Total Groups</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          className="p-5 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl"
        >
          <CheckCircle className="h-8 w-8 mb-3" />
          <p className="text-3xl font-bold">{analytics.overview.submitted_groups}</p>
          <p className="text-sm text-emerald-100">Submitted</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          className="p-5 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-xl"
        >
          <TrendingUp className="h-8 w-8 mb-3" />
          <p className="text-3xl font-bold">{analytics.overview.submission_rate}%</p>
          <p className="text-sm text-purple-100">Submission Rate</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          className="p-5 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xl"
        >
          <Award className="h-8 w-8 mb-3" />
          <p className="text-3xl font-bold">{analytics.overview.average_grade}</p>
          <p className="text-sm text-amber-100">Average Grade</p>
        </motion.div>
      </div>

      {/* Grade Distribution Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl"
      >
        <h3 className="font-bold text-lg text-neutral-900 dark:text-white mb-4">
          Grade Distribution
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analytics.overview.grade_distribution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="url(#colorGradient)" />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Contribution Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl"
      >
        <h3 className="font-bold text-lg text-neutral-900 dark:text-white mb-4">
          Contribution Analysis
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* High Contributors */}
          <div>
            <h4 className="font-semibold text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Contributors
            </h4>
            <div className="space-y-2">
              {analytics.contribution_analysis.high_contributors.map((member, index) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white font-bold text-sm">
                    #{index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-neutral-900 dark:text-white text-sm">
                      {member.name}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {member.contribution_percentage}% contribution
                    </p>
                  </div>
                  <Trophy className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              ))}
            </div>
          </div>

          {/* Low Contributors */}
          <div>
            <h4 className="font-semibold text-amber-600 dark:text-amber-400 mb-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Need Attention
            </h4>
            <div className="space-y-2">
              {analytics.contribution_analysis.low_contributors.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800"
                >
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <div className="flex-1">
                    <p className="font-semibold text-neutral-900 dark:text-white text-sm">
                      {member.name}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {member.contribution_percentage}% contribution
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Activity Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl"
      >
        <h3 className="font-bold text-lg text-neutral-900 dark:text-white mb-4">
          Activity Timeline
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analytics.activity_timeline}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="messages" stroke="#6366f1" strokeWidth={2} />
            <Line type="monotone" dataKey="files" stroke="#10b981" strokeWidth={2} />
            <Line type="monotone" dataKey="tasks" stroke="#f59e0b" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};
```

---

### 2️⃣ Group Progress Tracker (Mahasiswa)

```typescript
const GroupProgressTracker = ({ group }: { group: Group }) => {
  const progressPercentage = (group.completed_tasks / group.total_tasks) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
          <Target className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
            Group Progress
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {group.completed_tasks}/{group.total_tasks} tasks completed
          </p>
        </div>
      </div>

      {/* Progress Circle */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              className="text-neutral-200 dark:text-neutral-700"
            />
            <motion.circle
              cx="96"
              cy="96"
              r="88"
              stroke="url(#progressGradient)"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              initial={{ strokeDashoffset: 553 }}
              animate={{ strokeDashoffset: 553 - (553 * progressPercentage) / 100 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{ strokeDasharray: 553 }}
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-4xl font-bold text-neutral-900 dark:text-white">
              {Math.round(progressPercentage)}%
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Complete
            </p>
          </div>
        </div>
      </div>

      {/* Member Contributions */}
      <div className="space-y-3">
        <h4 className="font-semibold text-neutral-900 dark:text-white">
          Member Contributions
        </h4>
        {group.members.map((member) => (
          <div key={member.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xs font-bold">
                  {member.name.charAt(0)}
                </div>
                <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {member.name}
                </span>
              </div>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {member.contribution_percentage}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${member.contribution_percentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
```

---

## 🎮 GAMIFICATION FEATURES

### 1️⃣ Achievement Badges

```typescript
const AchievementBadges = ({ achievements }: { achievements: Achievement[] }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white">
          <Trophy className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
            Achievements
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {achievements.filter(a => a.unlocked).length}/{achievements.length} unlocked
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {achievements.map((achievement) => (
          <motion.div
            key={achievement.id}
            whileHover={{ scale: achievement.unlocked ? 1.05 : 1 }}
            className={`p-4 rounded-2xl text-center ${
              achievement.unlocked
                ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-2 border-amber-300 dark:border-amber-700'
                : 'bg-neutral-100 dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 opacity-50'
            }`}
          >
            <div className={`text-4xl mb-2 ${achievement.unlocked ? '' : 'grayscale'}`}>
              {achievement.icon}
            </div>
            <p className={`font-bold text-sm ${
              achievement.unlocked
                ? 'text-amber-900 dark:text-amber-100'
                : 'text-neutral-500 dark:text-neutral-400'
            }`}>
              {achievement.name}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              {achievement.description}
            </p>
            {achievement.unlocked && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                Unlocked {format(new Date(achievement.unlocked_at), 'dd MMM yyyy')}
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Example achievements
const achievementsList = [
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Submit before deadline',
    icon: '🌅',
    unlocked: true,
    unlocked_at: '2026-03-01'
  },
  {
    id: 'team-player',
    name: 'Team Player',
    description: 'Send 100+ messages',
    icon: '🤝',
    unlocked: true,
    unlocked_at: '2026-02-28'
  },
  {
    id: 'file-master',
    name: 'File Master',
    description: 'Upload 20+ files',
    icon: '📁',
    unlocked: false
  },
  {
    id: 'task-crusher',
    name: 'Task Crusher',
    description: 'Complete 10+ tasks',
    icon: '⚡',
    unlocked: false
  },
  {
    id: 'perfect-score',
    name: 'Perfect Score',
    description: 'Get 100 grade',
    icon: '💯',
    unlocked: false
  },
  {
    id: 'leader',
    name: 'Leader',
    description: 'Be a group leader',
    icon: '👑',
    unlocked: true,
    unlocked_at: '2026-02-25'
  }
];
```

---

### 2️⃣ Leaderboard

```typescript
const Leaderboard = ({ groups }: { groups: LeaderboardGroup[] }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white">
          <Award className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
            Leaderboard
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Top performing groups
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {groups.map((group, index) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, x: 5 }}
            className={`p-4 rounded-2xl ${
              index === 0
                ? 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border-2 border-amber-300 dark:border-amber-700'
                : index === 1
                ? 'bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-700 border-2 border-neutral-300 dark:border-neutral-600'
                : index === 2
                ? 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-2 border-orange-300 dark:border-orange-700'
                : 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700'
            }`}
          >
            <div className="flex items-center gap-4">
              {/* Rank */}
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl font-bold text-xl ${
                index === 0
                  ? 'bg-gradient-to-br from-amber-500 to-yellow-600 text-white'
                  : index === 1
                  ? 'bg-gradient-to-br from-neutral-400 to-neutral-500 text-white'
                  : index === 2
                  ? 'bg-gradient-to-br from-orange-500 to-amber-600 text-white'
                  : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
              }`}>
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
              </div>

              {/* Group Info */}
              <div className="flex-1">
                <p className="font-bold text-neutral-900 dark:text-white">
                  {group.name}
                </p>
                <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  <span>{group.members_count} members</span>
                  <span>•</span>
                  <span>{group.progress}% progress</span>
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {group.score}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  points
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
```

---

## 🔧 BACKEND IMPLEMENTATION

### 1️⃣ Database Migrations

```php
// Create assignments table
Schema::create('assignments', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('dosen_id');
    $table->uuid('course_id');
    $table->string('title');
    $table->text('description')->nullable();
    $table->enum('formation_mode', ['self-form', 'random', 'manual']);
    $table->enum('grading_mode', ['same', 'individual', 'peer', 'contribution']);
    $table->integer('min_members');
    $table->integer('max_members');
    $table->timestamp('formation_deadline');
    $table->timestamp('submission_deadline');
    $table->json('features');
    $table->decimal('peer_evaluation_weight', 3, 2)->nullable();
    $table->boolean('is_locked')->default(false);
    $table->timestamps();
    
    $table->foreign('dosen_id')->references('id')->on('users')->onDelete('cascade');
    $table->foreign('course_id')->references('id')->on('courses')->onDelete('cascade');
});

// Create groups table
Schema::create('groups', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('assignment_id');
    $table->string('name');
    $table->uuid('leader_id');
    $table->boolean('is_locked')->default(false);
    $table->timestamps();
    
    $table->foreign('assignment_id')->references('id')->on('assignments')->onDelete('cascade');
    $table->foreign('leader_id')->references('id')->on('users')->onDelete('cascade');
});

// Create group_members table
Schema::create('group_members', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('group_id');
    $table->uuid('student_id');
    $table->boolean('is_leader')->default(false);
    $table->timestamp('joined_at')->useCurrent();
    
    $table->foreign('group_id')->references('id')->on('groups')->onDelete('cascade');
    $table->foreign('student_id')->references('id')->on('users')->onDelete('cascade');
    $table->unique(['group_id', 'student_id']);
});

// Create group_messages table
Schema::create('group_messages', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('group_id');
    $table->uuid('sender_id');
    $table->text('content');
    $table->enum('type', ['text', 'system', 'file'])->default('text');
    $table->uuid('reply_to_id')->nullable();
    $table->boolean('is_edited')->default(false);
    $table->boolean('is_deleted')->default(false);
    $table->timestamps();
    
    $table->foreign('group_id')->references('id')->on('groups')->onDelete('cascade');
    $table->foreign('sender_id')->references('id')->on('users')->onDelete('cascade');
    $table->index(['group_id', 'created_at']);
});

// Create group_tasks table
Schema::create('group_tasks', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('group_id');
    $table->string('title');
    $table->text('description')->nullable();
    $table->uuid('created_by');
    $table->enum('status', ['pending', 'in_progress', 'completed'])->default('pending');
    $table->timestamp('deadline')->nullable();
    $table->timestamp('completed_at')->nullable();
    $table->uuid('completed_by')->nullable();
    $table->timestamps();
    
    $table->foreign('group_id')->references('id')->on('groups')->onDelete('cascade');
    $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
});

// Create group_files table
Schema::create('group_files', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('group_id');
    $table->uuid('uploaded_by');
    $table->string('filename');
    $table->string('original_name');
    $table->string('file_path');
    $table->string('file_type');
    $table->bigInteger('file_size');
    $table->timestamp('uploaded_at')->useCurrent();
    
    $table->foreign('group_id')->references('id')->on('groups')->onDelete('cascade');
    $table->foreign('uploaded_by')->references('id')->on('users')->onDelete('cascade');
});

// Create activity_logs table
Schema::create('activity_logs', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('group_id');
    $table->uuid('user_id');
    $table->enum('activity_type', ['message', 'file_upload', 'task_created', 'task_completed']);
    $table->json('activity_metadata')->nullable();
    $table->integer('points')->default(0);
    $table->timestamp('created_at')->useCurrent();
    
    $table->foreign('group_id')->references('id')->on('groups')->onDelete('cascade');
    $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
    $table->index(['group_id', 'created_at']);
});

// Create peer_evaluations table
Schema::create('peer_evaluations', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('assignment_id');
    $table->uuid('evaluator_id');
    $table->uuid('evaluated_id');
    $table->tinyInteger('contribution_score'); // 1-5
    $table->tinyInteger('communication_score'); // 1-5
    $table->tinyInteger('reliability_score'); // 1-5
    $table->tinyInteger('quality_score'); // 1-5
    $table->text('comments')->nullable();
    $table->timestamp('submitted_at')->useCurrent();
    
    $table->foreign('assignment_id')->references('id')->on('assignments')->onDelete('cascade');
    $table->foreign('evaluator_id')->references('id')->on('users')->onDelete('cascade');
    $table->foreign('evaluated_id')->references('id')->on('users')->onDelete('cascade');
    $table->unique(['assignment_id', 'evaluator_id', 'evaluated_id']);
});
```

---

### 2️⃣ Service Classes

```php
// GroupFormationService.php
class GroupFormationService
{
    public function formRandomGroups(string $assignmentId, bool $balanced = false): array
    {
        $assignment = Assignment::findOrFail($assignmentId);
        $students = $assignment->course->students;
        
        // Delete existing groups
        Group::where('assignment_id', $assignmentId)->delete();
        
        if ($balanced) {
            // Sort by GPA for balanced distribution
            $students = $students->sortByDesc('gpa');
        } else {
            // Random shuffle
            $students = $students->shuffle();
        }
        
        $groups = [];
        $groupNumber = 1;
        
        foreach ($students->chunk($assignment->max_members) as $chunk) {
            $group = Group::create([
                'id' => Str::uuid(),
                'assignment_id' => $assignmentId,
                'name' => "Grup {$groupNumber}",
                'leader_id' => $chunk->first()->id,
            ]);
            
            foreach ($chunk as $index => $student) {
                GroupMember::create([
                    'id' => Str::uuid(),
                    'group_id' => $group->id,
                    'student_id' => $student->id,
                    'is_leader' => $index === 0,
                ]);
            }
            
            $groups[] = $group;
            $groupNumber++;
        }
        
        // Notify students
        foreach ($students as $student) {
            event(new GroupAssigned($student->id, $groups));
        }
        
        return $groups;
    }
}

// CollaborationService.php
class CollaborationService
{
    public function sendMessage(string $groupId, string $senderId, string $content): Message
    {
        $message = GroupMessage::create([
            'id' => Str::uuid(),
            'group_id' => $groupId,
            'sender_id' => $senderId,
            'content' => $content,
            'type' => 'text',
        ]);
        
        // Log activity
        $this->logActivity($groupId, $senderId, 'message', ['message_id' => $message->id], 1);
        
        // Broadcast via WebSocket
        broadcast(new MessageSent($groupId, $message))->toOthers();
        
        return $message;
    }
    
    public function uploadFile(string $groupId, string $uploaderId, UploadedFile $file): GroupFile
    {
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs("group-files/{$groupId}", $filename);
        
        $groupFile = GroupFile::create([
            'id' => Str::uuid(),
            'group_id' => $groupId,
            'uploaded_by' => $uploaderId,
            'filename' => $filename,
            'original_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
        ]);
        
        // Log activity
        $this->logActivity($groupId, $uploaderId, 'file_upload', ['file_id' => $groupFile->id], 3);
        
        // Broadcast
        broadcast(new FileUploaded($groupId, $groupFile))->toOthers();
        
        return $groupFile;
    }
    
    protected function logActivity(string $groupId, string $userId, string $type, array $metadata, int $points): void
    {
        ActivityLog::create([
            'id' => Str::uuid(),
            'group_id' => $groupId,
            'user_id' => $userId,
            'activity_type' => $type,
            'activity_metadata' => $metadata,
            'points' => $points,
        ]);
    }
}

// GradingService.php
class GradingService
{
    public function calculateContributionBasedGrades(string $submissionId, float $baseGrade): array
    {
        $submission = GroupSubmission::with('group.members')->findOrFail($submissionId);
        $contributionScores = $this->getContributionScores($submission->group_id);
        
        $grades = [];
        foreach ($submission->group->members as $member) {
            $contribution = $contributionScores[$member->student_id] ?? 0;
            $finalGrade = round($baseGrade * ($contribution / 100));
            
            $grades[] = [
                'student_id' => $member->student_id,
                'base_grade' => $baseGrade,
                'contribution_score' => $contribution,
                'final_grade' => $finalGrade,
            ];
            
            IndividualGrade::create([
                'id' => Str::uuid(),
                'submission_id' => $submissionId,
                'student_id' => $member->student_id,
                'base_grade' => $baseGrade,
                'contribution_score' => $contribution,
                'final_grade' => $finalGrade,
            ]);
        }
        
        return $grades;
    }
    
    protected function getContributionScores(string $groupId): array
    {
        $activities = ActivityLog::where('group_id', $groupId)->get();
        $totalPoints = $activities->sum('points');
        
        $scores = [];
        foreach ($activities->groupBy('user_id') as $userId => $userActivities) {
            $userPoints = $userActivities->sum('points');
            $scores[$userId] = $totalPoints > 0 ? ($userPoints / $totalPoints) * 100 : 0;
        }
        
        return $scores;
    }
}
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 1: Database & Models
- [ ] Create all database migrations (10+ tables)
- [ ] Create Eloquent models with relationships
- [ ] Seed sample data for testing
- [ ] Add database indexes for performance

### Phase 2: Backend Services
- [ ] GroupFormationService (self-form, random, manual)
- [ ] CollaborationService (chat, files, tasks)
- [ ] GradingService (4 grading modes)
- [ ] AnalyticsService (contribution tracking)
- [ ] NotificationService (real-time notifications)

### Phase 3: API Controllers
- [ ] TugasKelompokController (Dosen)
- [ ] TugasKelompokController (Mahasiswa)
- [ ] API routes for all operations
- [ ] Request validation classes
- [ ] API documentation

### Phase 4: Real-time Features
- [ ] Setup Laravel Reverb (WebSocket)
- [ ] Broadcast events (MessageSent, FileUploaded, etc.)
- [ ] Echo client configuration
- [ ] Typing indicators
- [ ] Online status tracking

### Phase 5: Frontend - Dosen Interface
- [ ] Assignment list page
- [ ] Create assignment form (multi-step)
- [ ] Group management interface (3 modes)
- [ ] Grading interface (4 modes)
- [ ] Analytics dashboard
- [ ] Export reports (PDF/Excel)

### Phase 6: Frontend - Mahasiswa Interface
- [ ] Assignment list page
- [ ] Group formation interface (self-form)
- [ ] Group workspace (chat, tasks, files)
- [ ] Progress tracker
- [ ] Peer evaluation form
- [ ] Achievement badges
- [ ] Leaderboard

### Phase 7: UI/UX Polish
- [ ] Floating icons animations (smooth, NOT kedut-kedut)
- [ ] Glassmorphism containers
- [ ] Gradient headers (indigo-purple-pink)
- [ ] Hover animations (scale: 1.04, y: -4)
- [ ] Loading skeletons
- [ ] Toast notifications
- [ ] Mobile responsive
- [ ] Dark mode support

### Phase 8: Testing & Optimization
- [ ] Unit tests for services
- [ ] Integration tests for API
- [ ] E2E tests for critical flows
- [ ] Performance optimization
- [ ] Security audit
- [ ] Load testing

---

## 🎉 EXPECTED RESULTS

Setelah implementasi lengkap:
- ✅ 3 mode pembentukan grup yang fleksibel
- ✅ Real-time collaboration dengan WebSocket
- ✅ 4 mode penilaian yang komprehensif
- ✅ Analytics dan monitoring yang detail
- ✅ Gamification untuk engagement
- ✅ Mobile responsive perfect
- ✅ Design matching admin dashboard 100%
- ✅ Smooth animations (BUKAN kedut-kedut)
- ✅ Contribution tracking otomatis
- ✅ Peer evaluation system
- ✅ Conflict resolution tools
- ✅ Achievement badges & leaderboard

---

**GOOD LUCK WITH THE IMPLEMENTATION! 🚀👥✨**

