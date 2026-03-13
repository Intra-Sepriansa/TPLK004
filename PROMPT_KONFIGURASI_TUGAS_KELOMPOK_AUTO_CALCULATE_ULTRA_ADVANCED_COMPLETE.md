# PROMPT: KONFIGURASI TUGAS KELOMPOK AUTO-CALCULATE & FORCE ASSIGN - ULTRA ADVANCED COMPLETE

## 🎯 OBJEKTIF UTAMA
Membuat sistem konfigurasi tugas kelompok yang INTELLIGENT dengan:
- **Auto-calculate jumlah kelompok** berdasarkan total mahasiswa dan ukuran kelompok
- **Validasi maksimal kelompok** - tidak boleh lebih dari hasil perhitungan
- **Force assign mahasiswa** ke kelompok mana pun oleh admin (untuk kasus mendesak)
- **Real-time monitoring** progres pembentukan kelompok dan mahasiswa yang belum masuk kelompok
- **Dashboard kelompok** untuk melihat anggota, status, dan kelompok kosong

---

## 📋 FITUR DETAIL

### 1. KONFIGURASI TUGAS KELOMPOK (Admin/Dosen)

#### A. Form Konfigurasi Mode Kelompok
```typescript
interface GroupConfiguration {
  assignment_id: number;
  total_students: number;        // Auto-detect dari kelas
  min_members_per_group: number; // Misal: 3
  max_members_per_group: number; // Misal: 4
  calculated_max_groups: number; // Auto-calculate
  allow_force_assign: boolean;   // Default: true
  group_formation_deadline: Date;
}
```

#### B. Auto-Calculate Logic
**Formula:**
```
calculated_max_groups = Math.ceil(total_students / min_members_per_group)
```

**Contoh:**
- Total mahasiswa: 35
- Min per kelompok: 3
- Max per kelompok: 4
- **Hasil: Max 12 kelompok** (35 ÷ 3 = 11.67 → dibulatkan ke 12)


#### C. UI Konfigurasi
```tsx
<Card className="p-6">
  <h3 className="text-lg font-semibold mb-4">Konfigurasi Kelompok</h3>
  
  {/* Total Mahasiswa - Auto Detect */}
  <div className="mb-4">
    <Label>Total Mahasiswa Terdaftar</Label>
    <Input value={totalStudents} disabled className="bg-gray-50" />
    <p className="text-xs text-gray-500 mt-1">
      Terdeteksi otomatis dari kelas ini
    </p>
  </div>

  {/* Ukuran Kelompok */}
  <div className="grid grid-cols-2 gap-4 mb-4">
    <div>
      <Label>Min Anggota per Kelompok</Label>
      <Input 
        type="number" 
        min={2} 
        value={minMembers}
        onChange={(e) => handleMinChange(e.target.value)}
      />
    </div>
    <div>
      <Label>Max Anggota per Kelompok</Label>
      <Input 
        type="number" 
        min={minMembers} 
        value={maxMembers}
        onChange={(e) => handleMaxChange(e.target.value)}
      />
    </div>
  </div>

  {/* Auto-Calculate Result */}
  <Alert className="mb-4 bg-blue-50 border-blue-200">
    <Calculator className="h-4 w-4" />
    <AlertTitle>Perhitungan Otomatis</AlertTitle>
    <AlertDescription>
      <div className="mt-2 space-y-1">
        <p className="font-semibold text-lg">
          Maksimal Kelompok: {calculatedMaxGroups} kelompok
        </p>
        <p className="text-sm text-gray-600">
          Dengan {minMembers}-{maxMembers} anggota per kelompok
        </p>
        <p className="text-xs text-gray-500">
          Formula: ⌈{totalStudents} ÷ {minMembers}⌉ = {calculatedMaxGroups}
        </p>
      </div>
    </AlertDescription>
  </Alert>

  {/* Validasi Warning */}
  {totalStudents % minMembers !== 0 && (
    <Alert className="mb-4 bg-yellow-50 border-yellow-200">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        Akan ada {calculatedMaxGroups * minMembers - totalStudents} slot kosong 
        atau kelompok dengan anggota kurang dari {minMembers}
      </AlertDescription>
    </Alert>
  )}

  {/* Force Assign Option */}
  <div className="flex items-center space-x-2 mb-4">
    <Checkbox 
      id="force-assign" 
      checked={allowForceAssign}
      onCheckedChange={setAllowForceAssign}
    />
    <Label htmlFor="force-assign" className="cursor-pointer">
      Izinkan admin memaksa mahasiswa masuk kelompok (untuk kasus mendesak)
    </Label>
  </div>

  {/* Deadline */}
  <div className="mb-4">
    <Label>Batas Waktu Pembentukan Kelompok</Label>
    <Input type="datetime-local" value={deadline} onChange={...} />
  </div>

  <Button onClick={saveConfiguration} className="w-full">
    <Save className="mr-2 h-4 w-4" />
    Simpan Konfigurasi
  </Button>
</Card>
```

---

### 2. MONITORING DASHBOARD KELOMPOK (Admin)

#### A. Overview Statistics
```tsx
<div className="grid grid-cols-4 gap-4 mb-6">
  {/* Total Kelompok Terbentuk */}
  <Card className="p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">Kelompok Terbentuk</p>
        <p className="text-2xl font-bold">{formedGroups}/{calculatedMaxGroups}</p>
      </div>
      <Users className="h-8 w-8 text-blue-500" />
    </div>
    <Progress value={(formedGroups/calculatedMaxGroups)*100} className="mt-2" />
  </Card>

  {/* Mahasiswa Sudah Bergabung */}
  <Card className="p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">Mahasiswa Bergabung</p>
        <p className="text-2xl font-bold">{assignedStudents}/{totalStudents}</p>
      </div>
      <UserCheck className="h-8 w-8 text-green-500" />
    </div>
    <Progress value={(assignedStudents/totalStudents)*100} className="mt-2" />
  </Card>

  {/* Mahasiswa Belum Bergabung */}
  <Card className="p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">Belum Bergabung</p>
        <p className="text-2xl font-bold text-red-600">
          {totalStudents - assignedStudents}
        </p>
      </div>
      <UserX className="h-8 w-8 text-red-500" />
    </div>
  </Card>

  {/* Kelompok Kosong */}
  <Card className="p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">Kelompok Kosong</p>
        <p className="text-2xl font-bold text-orange-600">{emptyGroups}</p>
      </div>
      <AlertCircle className="h-8 w-8 text-orange-500" />
    </div>
  </Card>
</div>
```


#### B. Daftar Kelompok dengan Detail Anggota
```tsx
<Card className="p-6">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-semibold">Daftar Kelompok</h3>
    <div className="flex gap-2">
      <Button variant="outline" size="sm">
        <Filter className="mr-2 h-4 w-4" />
        Filter
      </Button>
      <Button variant="outline" size="sm">
        <Download className="mr-2 h-4 w-4" />
        Export Excel
      </Button>
    </div>
  </div>

  {/* Filter Tabs */}
  <Tabs defaultValue="all" className="mb-4">
    <TabsList>
      <TabsTrigger value="all">
        Semua ({formedGroups})
      </TabsTrigger>
      <TabsTrigger value="complete">
        Lengkap ({completeGroups})
      </TabsTrigger>
      <TabsTrigger value="incomplete">
        Kurang Anggota ({incompleteGroups})
      </TabsTrigger>
      <TabsTrigger value="empty">
        Kosong ({emptyGroups})
      </TabsTrigger>
    </TabsList>
  </Tabs>

  {/* Group Cards */}
  <div className="space-y-4">
    {groups.map((group) => (
      <Card key={group.id} className={cn(
        "p-4 border-l-4",
        group.members.length === 0 && "border-l-red-500 bg-red-50",
        group.members.length < minMembers && "border-l-orange-500 bg-orange-50",
        group.members.length >= minMembers && "border-l-green-500"
      )}>
        <div className="flex items-start justify-between">
          {/* Group Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="font-semibold text-lg">Kelompok {group.number}</h4>
              
              {/* Status Badge */}
              {group.members.length === 0 ? (
                <Badge variant="destructive">Kosong</Badge>
              ) : group.members.length < minMembers ? (
                <Badge variant="warning">
                  Kurang {minMembers - group.members.length} anggota
                </Badge>
              ) : (
                <Badge variant="success">Lengkap</Badge>
              )}

              {/* Member Count */}
              <span className="text-sm text-gray-500">
                {group.members.length}/{maxMembers} anggota
              </span>
            </div>

            {/* Members List */}
            {group.members.length > 0 ? (
              <div className="space-y-2">
                {group.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between bg-white p-2 rounded border">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.nim}</p>
                      </div>
                      {member.is_leader && (
                        <Badge variant="outline" className="text-xs">
                          <Crown className="h-3 w-3 mr-1" />
                          Ketua
                        </Badge>
                      )}
                    </div>
                    
                    {/* Remove Member */}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeMember(group.id, member.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Belum ada anggota</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="ml-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openForceAssignModal(group.id)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Tambah Anggota Paksa
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => viewGroupDetail(group.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Lihat Detail
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportGroupPDF(group.id)}>
                  <FileText className="mr-2 h-4 w-4" />
                  Export PDF
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => deleteGroup(group.id)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus Kelompok
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>
    ))}
  </div>
</Card>
```


#### C. Daftar Mahasiswa Belum Bergabung
```tsx
<Card className="p-6 mt-6">
  <div className="flex items-center justify-between mb-4">
    <div>
      <h3 className="text-lg font-semibold">Mahasiswa Belum Bergabung</h3>
      <p className="text-sm text-gray-500">
        {unassignedStudents.length} mahasiswa belum masuk kelompok mana pun
      </p>
    </div>
    <Button 
      variant="outline" 
      onClick={autoAssignRemaining}
      disabled={unassignedStudents.length === 0}
    >
      <Zap className="mr-2 h-4 w-4" />
      Auto-Assign Semua
    </Button>
  </div>

  {unassignedStudents.length > 0 ? (
    <div className="space-y-2">
      {unassignedStudents.map((student) => (
        <div key={student.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={student.avatar} />
              <AvatarFallback>{student.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{student.name}</p>
              <p className="text-sm text-gray-500">{student.nim}</p>
            </div>
            <Badge variant="destructive">Belum Bergabung</Badge>
          </div>

          {/* Force Assign Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="sm">
                <UserPlus className="mr-2 h-4 w-4" />
                Paksa Masuk Kelompok
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Pilih Kelompok</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {groups.map((group) => (
                <DropdownMenuItem 
                  key={group.id}
                  onClick={() => forceAssignStudent(student.id, group.id)}
                  disabled={group.members.length >= maxMembers}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>Kelompok {group.number}</span>
                    <span className={cn(
                      "text-xs",
                      group.members.length >= maxMembers ? "text-red-500" : "text-gray-500"
                    )}>
                      {group.members.length}/{maxMembers}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  ) : (
    <div className="text-center py-8 text-gray-400">
      <CheckCircle className="h-16 w-16 mx-auto mb-3 text-green-500" />
      <p className="font-medium text-gray-700">Semua mahasiswa sudah bergabung!</p>
      <p className="text-sm">Tidak ada mahasiswa yang belum masuk kelompok</p>
    </div>
  )}
</Card>
```

---

### 3. FORCE ASSIGN MODAL (Admin)

```tsx
<Dialog open={forceAssignModalOpen} onOpenChange={setForceAssignModalOpen}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>Paksa Mahasiswa Masuk Kelompok</DialogTitle>
      <DialogDescription>
        Fitur ini untuk kasus mendesak ketika mahasiswa belum bergabung dan deadline sudah dekat
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-4">
      {/* Selected Group Info */}
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Anda akan menambahkan mahasiswa ke <strong>Kelompok {selectedGroup?.number}</strong>
          <br />
          Anggota saat ini: {selectedGroup?.members.length}/{maxMembers}
        </AlertDescription>
      </Alert>

      {/* Student Selection */}
      <div>
        <Label>Pilih Mahasiswa</Label>
        <Select value={selectedStudent} onValueChange={setSelectedStudent}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih mahasiswa..." />
          </SelectTrigger>
          <SelectContent>
            {unassignedStudents.map((student) => (
              <SelectItem key={student.id} value={student.id}>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={student.avatar} />
                    <AvatarFallback>{student.name[0]}</AvatarFallback>
                  </Avatar>
                  <span>{student.name} - {student.nim}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reason */}
      <div>
        <Label>Alasan Force Assign (Opsional)</Label>
        <Textarea 
          placeholder="Misal: Deadline sudah dekat, mahasiswa tidak responsif, dll."
          value={forceAssignReason}
          onChange={(e) => setForceAssignReason(e.target.value)}
        />
      </div>

      {/* Warning */}
      <Alert className="bg-yellow-50 border-yellow-200">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Mahasiswa akan langsung masuk kelompok tanpa persetujuan. 
          Notifikasi akan dikirim ke mahasiswa tersebut.
        </AlertDescription>
      </Alert>
    </div>

    <DialogFooter>
      <Button variant="outline" onClick={() => setForceAssignModalOpen(false)}>
        Batal
      </Button>
      <Button onClick={handleForceAssign}>
        <UserPlus className="mr-2 h-4 w-4" />
        Paksa Masuk Kelompok
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```


---

### 4. VALIDASI & BUSINESS LOGIC

#### A. Validasi Maksimal Kelompok
```typescript
// Backend Validation
const validateGroupCreation = (assignmentId: number) => {
  const config = getGroupConfiguration(assignmentId);
  const currentGroupCount = countGroups(assignmentId);
  
  if (currentGroupCount >= config.calculated_max_groups) {
    throw new Error(
      `Maksimal ${config.calculated_max_groups} kelompok sudah tercapai. ` +
      `Tidak bisa membuat kelompok baru.`
    );
  }
  
  return true;
};

// Frontend Prevention
const canCreateNewGroup = () => {
  return formedGroups < calculatedMaxGroups;
};
```

#### B. Force Assign Logic
```typescript
const forceAssignStudent = async (studentId: number, groupId: number, reason?: string) => {
  // Validasi
  const group = await getGroup(groupId);
  if (group.members.length >= maxMembers) {
    throw new Error('Kelompok sudah penuh');
  }

  // Check if student already in another group
  const existingGroup = await getStudentGroup(studentId, assignmentId);
  if (existingGroup) {
    // Remove from old group first
    await removeStudentFromGroup(studentId, existingGroup.id);
  }

  // Add to new group
  await addStudentToGroup(studentId, groupId, {
    is_forced: true,
    forced_by: adminId,
    forced_reason: reason,
    forced_at: new Date()
  });

  // Send notification to student
  await sendNotification(studentId, {
    type: 'force_assigned_to_group',
    title: 'Anda Ditambahkan ke Kelompok',
    message: `Admin telah menambahkan Anda ke Kelompok ${group.number}`,
    reason: reason
  });

  // Log activity
  await logActivity({
    type: 'force_assign',
    admin_id: adminId,
    student_id: studentId,
    group_id: groupId,
    reason: reason
  });
};
```

#### C. Auto-Assign Remaining Students
```typescript
const autoAssignRemainingStudents = async (assignmentId: number) => {
  const unassigned = await getUnassignedStudents(assignmentId);
  const groups = await getGroups(assignmentId);
  const config = await getGroupConfiguration(assignmentId);

  // Sort groups by member count (ascending)
  const sortedGroups = groups.sort((a, b) => 
    a.members.length - b.members.length
  );

  let assignedCount = 0;
  
  for (const student of unassigned) {
    // Find group with least members that's not full
    const targetGroup = sortedGroups.find(g => 
      g.members.length < config.max_members_per_group
    );

    if (targetGroup) {
      await forceAssignStudent(student.id, targetGroup.id, 
        'Auto-assigned by system'
      );
      targetGroup.members.push(student); // Update local array
      assignedCount++;
    }
  }

  return {
    success: true,
    assigned_count: assignedCount,
    remaining: unassigned.length - assignedCount
  };
};
```

---

### 5. REAL-TIME UPDATES

#### A. WebSocket Events
```typescript
// Subscribe to group updates
channel.listen('.group.updated', (data) => {
  updateGroupInList(data.group);
  updateStatistics();
});

channel.listen('.student.assigned', (data) => {
  addStudentToGroup(data.group_id, data.student);
  removeFromUnassignedList(data.student.id);
  updateStatistics();
});

channel.listen('.student.force_assigned', (data) => {
  // Show toast notification
  toast({
    title: 'Mahasiswa Dipaksa Masuk Kelompok',
    description: `${data.student.name} ditambahkan ke Kelompok ${data.group.number}`,
    variant: 'info'
  });
  
  updateGroupInList(data.group);
  updateStatistics();
});
```

#### B. Live Statistics Update
```typescript
const updateStatistics = () => {
  const stats = {
    formedGroups: groups.filter(g => g.members.length > 0).length,
    assignedStudents: groups.reduce((sum, g) => sum + g.members.length, 0),
    unassignedStudents: totalStudents - assignedStudents,
    emptyGroups: groups.filter(g => g.members.length === 0).length,
    completeGroups: groups.filter(g => 
      g.members.length >= minMembers && g.members.length <= maxMembers
    ).length,
    incompleteGroups: groups.filter(g => 
      g.members.length > 0 && g.members.length < minMembers
    ).length
  };

  setStatistics(stats);
};
```

---

### 6. NOTIFIKASI MAHASISWA

#### A. Notifikasi Force Assign
```typescript
// Email Template
Subject: Anda Ditambahkan ke Kelompok - [Nama Tugas]

Halo {student_name},

Admin telah menambahkan Anda ke kelompok untuk tugas "{assignment_title}".

Detail Kelompok:
- Kelompok: {group_number}
- Anggota: {member_count}/{max_members}
- Ketua: {leader_name}

{if reason}
Alasan: {reason}
{endif}

Silakan koordinasi dengan anggota kelompok Anda segera.

Lihat Detail: {link_to_group}
```

#### B. In-App Notification
```tsx
<NotificationItem type="force_assigned">
  <div className="flex items-start gap-3">
    <div className="p-2 bg-blue-100 rounded-full">
      <UserPlus className="h-5 w-5 text-blue-600" />
    </div>
    <div className="flex-1">
      <p className="font-medium">Anda Ditambahkan ke Kelompok</p>
      <p className="text-sm text-gray-600">
        Admin telah menambahkan Anda ke Kelompok {groupNumber}
      </p>
      {reason && (
        <p className="text-xs text-gray-500 mt-1">
          Alasan: {reason}
        </p>
      )}
      <Button variant="link" size="sm" className="mt-2 p-0">
        Lihat Kelompok →
      </Button>
    </div>
  </div>
</NotificationItem>
```


---

### 7. DATABASE SCHEMA

```sql
-- Tabel Konfigurasi Kelompok
CREATE TABLE group_configurations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    assignment_id BIGINT NOT NULL,
    total_students INT NOT NULL,
    min_members_per_group INT NOT NULL DEFAULT 3,
    max_members_per_group INT NOT NULL DEFAULT 4,
    calculated_max_groups INT NOT NULL,
    allow_force_assign BOOLEAN DEFAULT TRUE,
    group_formation_deadline TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE
);

-- Tabel Group Members dengan Force Assign Info
ALTER TABLE group_members ADD COLUMN is_forced BOOLEAN DEFAULT FALSE;
ALTER TABLE group_members ADD COLUMN forced_by BIGINT NULL;
ALTER TABLE group_members ADD COLUMN forced_reason TEXT NULL;
ALTER TABLE group_members ADD COLUMN forced_at TIMESTAMP NULL;
ALTER TABLE group_members ADD FOREIGN KEY (forced_by) REFERENCES users(id);

-- Tabel Log Force Assign
CREATE TABLE force_assign_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    assignment_id BIGINT NOT NULL,
    group_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    admin_id BIGINT NOT NULL,
    reason TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index untuk performa
CREATE INDEX idx_group_config_assignment ON group_configurations(assignment_id);
CREATE INDEX idx_force_assign_logs_assignment ON force_assign_logs(assignment_id);
CREATE INDEX idx_group_members_forced ON group_members(is_forced);
```

---

### 8. API ENDPOINTS

```typescript
// GET: Ambil konfigurasi kelompok
GET /api/admin/assignments/{id}/group-configuration
Response: {
  total_students: 35,
  min_members_per_group: 3,
  max_members_per_group: 4,
  calculated_max_groups: 12,
  allow_force_assign: true,
  group_formation_deadline: "2026-03-20T23:59:59Z"
}

// POST: Simpan konfigurasi kelompok
POST /api/admin/assignments/{id}/group-configuration
Body: {
  min_members_per_group: 3,
  max_members_per_group: 4,
  allow_force_assign: true,
  group_formation_deadline: "2026-03-20T23:59:59Z"
}

// GET: Monitoring dashboard data
GET /api/admin/assignments/{id}/group-monitoring
Response: {
  statistics: {
    formed_groups: 8,
    assigned_students: 28,
    unassigned_students: 7,
    empty_groups: 4,
    complete_groups: 6,
    incomplete_groups: 2
  },
  groups: [...],
  unassigned_students: [...]
}

// POST: Force assign mahasiswa
POST /api/admin/groups/{groupId}/force-assign
Body: {
  student_id: 123,
  reason: "Deadline sudah dekat"
}

// POST: Auto-assign semua mahasiswa yang belum bergabung
POST /api/admin/assignments/{id}/auto-assign-remaining
Response: {
  success: true,
  assigned_count: 7,
  remaining: 0
}

// GET: Daftar mahasiswa belum bergabung
GET /api/admin/assignments/{id}/unassigned-students
Response: [
  {
    id: 123,
    name: "John Doe",
    nim: "2021010001",
    avatar: "...",
    email: "john@example.com"
  }
]

// DELETE: Remove mahasiswa dari kelompok
DELETE /api/admin/groups/{groupId}/members/{studentId}

// GET: History force assign
GET /api/admin/assignments/{id}/force-assign-logs
Response: [
  {
    id: 1,
    student_name: "John Doe",
    group_number: 5,
    admin_name: "Admin User",
    reason: "Deadline sudah dekat",
    created_at: "2026-03-13T10:30:00Z"
  }
]
```

---

### 9. FITUR TAMBAHAN

#### A. Export Report Kelompok
```tsx
<Button onClick={exportGroupReport}>
  <Download className="mr-2 h-4 w-4" />
  Export Laporan Kelompok
</Button>

// Excel Export dengan sheet:
// 1. Overview Statistics
// 2. Daftar Kelompok & Anggota
// 3. Mahasiswa Belum Bergabung
// 4. History Force Assign
```

#### B. Bulk Actions
```tsx
<div className="flex gap-2">
  <Button 
    variant="outline"
    onClick={selectAllUnassigned}
  >
    Pilih Semua Mahasiswa Belum Bergabung
  </Button>
  
  <Button 
    onClick={bulkForceAssign}
    disabled={selectedStudents.length === 0}
  >
    Force Assign {selectedStudents.length} Mahasiswa
  </Button>
</div>
```

#### C. Timeline Activity
```tsx
<Card className="p-6">
  <h3 className="font-semibold mb-4">Timeline Aktivitas</h3>
  <div className="space-y-3">
    {activities.map((activity) => (
      <div key={activity.id} className="flex gap-3">
        <div className="flex-shrink-0">
          {activity.type === 'force_assign' ? (
            <UserPlus className="h-5 w-5 text-blue-500" />
          ) : activity.type === 'group_created' ? (
            <Users className="h-5 w-5 text-green-500" />
          ) : (
            <Activity className="h-5 w-5 text-gray-500" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm">{activity.description}</p>
          <p className="text-xs text-gray-500">{activity.time}</p>
        </div>
      </div>
    ))}
  </div>
</Card>
```


---

### 10. EDGE CASES & HANDLING

#### A. Kelompok Penuh Semua
```tsx
{groups.every(g => g.members.length >= maxMembers) && unassignedStudents.length > 0 && (
  <Alert className="bg-red-50 border-red-200">
    <AlertTriangle className="h-4 w-4" />
    <AlertTitle>Semua Kelompok Sudah Penuh!</AlertTitle>
    <AlertDescription>
      Masih ada {unassignedStudents.length} mahasiswa belum bergabung, 
      tetapi semua kelompok sudah mencapai kapasitas maksimal ({maxMembers} anggota).
      <div className="mt-3 space-x-2">
        <Button size="sm" onClick={increaseMaxMembers}>
          Naikkan Kapasitas Kelompok
        </Button>
        <Button size="sm" variant="outline" onClick={createNewGroup}>
          Buat Kelompok Baru
        </Button>
      </div>
    </AlertDescription>
  </Alert>
)}
```

#### B. Mahasiswa Pindah Kelompok (Force)
```typescript
const moveStudentToAnotherGroup = async (
  studentId: number, 
  fromGroupId: number, 
  toGroupId: number,
  reason: string
) => {
  // Remove from old group
  await removeStudentFromGroup(studentId, fromGroupId);
  
  // Add to new group with force flag
  await forceAssignStudent(studentId, toGroupId, reason);
  
  // Notify both groups
  await notifyGroupMembers(fromGroupId, {
    message: `${studentName} telah dipindahkan ke kelompok lain oleh admin`
  });
  
  await notifyGroupMembers(toGroupId, {
    message: `${studentName} telah ditambahkan ke kelompok Anda oleh admin`
  });
};
```

#### C. Deadline Terlewat
```tsx
{isDeadlinePassed && unassignedStudents.length > 0 && (
  <Alert className="bg-orange-50 border-orange-200">
    <Clock className="h-4 w-4" />
    <AlertTitle>Deadline Pembentukan Kelompok Terlewat!</AlertTitle>
    <AlertDescription>
      Masih ada {unassignedStudents.length} mahasiswa belum bergabung kelompok.
      <Button 
        size="sm" 
        className="mt-2"
        onClick={autoAssignRemaining}
      >
        <Zap className="mr-2 h-4 w-4" />
        Auto-Assign Sekarang
      </Button>
    </AlertDescription>
  </Alert>
)}
```

#### D. Validasi Sebelum Submit Tugas
```typescript
// Backend validation saat mahasiswa submit tugas
const validateGroupSubmission = (studentId: number, assignmentId: number) => {
  const group = getStudentGroup(studentId, assignmentId);
  
  if (!group) {
    throw new Error('Anda belum bergabung dengan kelompok mana pun');
  }
  
  const config = getGroupConfiguration(assignmentId);
  
  if (group.members.length < config.min_members_per_group) {
    throw new Error(
      `Kelompok Anda hanya memiliki ${group.members.length} anggota. ` +
      `Minimal ${config.min_members_per_group} anggota diperlukan untuk submit tugas.`
    );
  }
  
  return true;
};
```

---

### 11. PERMISSION & AUTHORIZATION

```typescript
// Middleware untuk fitur force assign
const canForceAssign = (user: User, assignment: Assignment) => {
  // Hanya admin dan dosen yang bisa force assign
  if (!['admin', 'dosen'].includes(user.role)) {
    return false;
  }
  
  // Cek apakah fitur force assign diaktifkan
  const config = getGroupConfiguration(assignment.id);
  if (!config.allow_force_assign) {
    return false;
  }
  
  // Dosen hanya bisa force assign di mata kuliah mereka sendiri
  if (user.role === 'dosen') {
    return assignment.course.dosen_id === user.id;
  }
  
  return true;
};

// UI Conditional Rendering
{canForceAssign(currentUser, assignment) && (
  <Button onClick={openForceAssignModal}>
    <UserPlus className="mr-2 h-4 w-4" />
    Paksa Masuk Kelompok
  </Button>
)}
```

---

### 12. TESTING SCENARIOS

```typescript
describe('Group Configuration Auto-Calculate', () => {
  test('should calculate max groups correctly', () => {
    const result = calculateMaxGroups(35, 3, 4);
    expect(result).toBe(12); // 35 ÷ 3 = 11.67 → 12
  });

  test('should prevent creating more groups than calculated', () => {
    const config = { calculated_max_groups: 10 };
    const currentGroups = 10;
    
    expect(() => createNewGroup()).toThrow(
      'Maksimal 10 kelompok sudah tercapai'
    );
  });

  test('should force assign student successfully', async () => {
    const result = await forceAssignStudent(123, 5, 'Deadline dekat');
    
    expect(result.success).toBe(true);
    expect(result.group.members).toContainEqual(
      expect.objectContaining({ id: 123, is_forced: true })
    );
  });

  test('should auto-assign remaining students evenly', async () => {
    const result = await autoAssignRemainingStudents(assignmentId);
    
    expect(result.assigned_count).toBe(7);
    expect(result.remaining).toBe(0);
    
    // Verify distribution is balanced
    const groups = await getGroups(assignmentId);
    const memberCounts = groups.map(g => g.members.length);
    const maxDiff = Math.max(...memberCounts) - Math.min(...memberCounts);
    expect(maxDiff).toBeLessThanOrEqual(1); // Difference max 1
  });
});
```

---

### 13. PERFORMANCE OPTIMIZATION

```typescript
// Cache group statistics
const useGroupStatistics = (assignmentId: number) => {
  return useQuery({
    queryKey: ['group-statistics', assignmentId],
    queryFn: () => fetchGroupStatistics(assignmentId),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000 // Refresh every minute
  });
};

// Optimistic updates untuk force assign
const forceAssignMutation = useMutation({
  mutationFn: forceAssignStudent,
  onMutate: async ({ studentId, groupId }) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(['groups', assignmentId]);
    
    // Snapshot previous value
    const previousGroups = queryClient.getQueryData(['groups', assignmentId]);
    
    // Optimistically update
    queryClient.setQueryData(['groups', assignmentId], (old) => {
      return old.map(group => 
        group.id === groupId 
          ? { ...group, members: [...group.members, student] }
          : group
      );
    });
    
    return { previousGroups };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(['groups', assignmentId], context.previousGroups);
  }
});
```


---

### 14. USER EXPERIENCE ENHANCEMENTS

#### A. Progress Indicator
```tsx
<Card className="p-6 mb-6">
  <div className="flex items-center justify-between mb-2">
    <h4 className="font-semibold">Progres Pembentukan Kelompok</h4>
    <span className="text-sm text-gray-500">
      {Math.round((assignedStudents/totalStudents)*100)}% selesai
    </span>
  </div>
  
  <Progress value={(assignedStudents/totalStudents)*100} className="h-3" />
  
  <div className="flex justify-between mt-2 text-xs text-gray-500">
    <span>{assignedStudents} dari {totalStudents} mahasiswa</span>
    <span>{formedGroups} dari {calculatedMaxGroups} kelompok</span>
  </div>
</Card>
```

#### B. Smart Suggestions
```tsx
{unassignedStudents.length > 0 && (
  <Alert className="bg-blue-50 border-blue-200">
    <Lightbulb className="h-4 w-4" />
    <AlertTitle>Saran Sistem</AlertTitle>
    <AlertDescription>
      {emptyGroups > 0 ? (
        <p>
          Ada {emptyGroups} kelompok kosong. Sebaiknya isi kelompok kosong 
          terlebih dahulu sebelum membuat kelompok baru.
        </p>
      ) : incompleteGroups > 0 ? (
        <p>
          Ada {incompleteGroups} kelompok yang anggotanya kurang dari minimum. 
          Prioritaskan melengkapi kelompok ini terlebih dahulu.
        </p>
      ) : (
        <p>
          Semua kelompok sudah terbentuk dengan baik. 
          Gunakan "Auto-Assign" untuk menempatkan {unassignedStudents.length} mahasiswa tersisa.
        </p>
      )}
    </AlertDescription>
  </Alert>
)}
```

#### C. Keyboard Shortcuts
```tsx
// Implement keyboard shortcuts
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    // Ctrl/Cmd + A: Auto-assign remaining
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      e.preventDefault();
      if (unassignedStudents.length > 0) {
        autoAssignRemaining();
      }
    }
    
    // Ctrl/Cmd + F: Focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      searchInputRef.current?.focus();
    }
  };
  
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, [unassignedStudents]);
```

#### D. Drag & Drop Force Assign
```tsx
// Drag student from unassigned list to group
<DndContext onDragEnd={handleDragEnd}>
  {/* Unassigned Students - Draggable */}
  <div className="space-y-2">
    {unassignedStudents.map((student) => (
      <Draggable key={student.id} id={student.id} data={student}>
        <div className="p-3 bg-red-50 border border-red-200 rounded cursor-move">
          <GripVertical className="inline mr-2 h-4 w-4" />
          {student.name}
        </div>
      </Draggable>
    ))}
  </div>

  {/* Groups - Droppable */}
  <div className="space-y-4">
    {groups.map((group) => (
      <Droppable key={group.id} id={group.id} disabled={group.members.length >= maxMembers}>
        <Card className="p-4">
          <h4>Kelompok {group.number}</h4>
          {/* Group members */}
        </Card>
      </Droppable>
    ))}
  </div>
</DndContext>

const handleDragEnd = (event) => {
  const { active, over } = event;
  if (over) {
    forceAssignStudent(active.id, over.id, 'Drag & drop by admin');
  }
};
```

---

### 15. MOBILE RESPONSIVE

```tsx
// Mobile-optimized layout
<div className="space-y-4">
  {/* Statistics - Stack on mobile */}
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
    {/* Stats cards */}
  </div>

  {/* Groups - Compact view on mobile */}
  <div className="space-y-3">
    {groups.map((group) => (
      <Card key={group.id} className="p-3">
        {/* Mobile: Show summary, tap to expand */}
        <Collapsible>
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Kelompok {group.number}</span>
              <Badge>{group.members.length}/{maxMembers}</Badge>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            {/* Full member list */}
          </CollapsibleContent>
        </Collapsible>
      </Card>
    ))}
  </div>

  {/* Force Assign - Bottom sheet on mobile */}
  <Sheet open={forceAssignOpen} onOpenChange={setForceAssignOpen}>
    <SheetContent side="bottom" className="h-[80vh]">
      {/* Force assign form */}
    </SheetContent>
  </Sheet>
</div>
```

---

## 🎨 DESIGN SYSTEM

### Color Coding
- **Hijau**: Kelompok lengkap (≥ min members)
- **Orange**: Kelompok kurang anggota (< min members)
- **Merah**: Kelompok kosong atau mahasiswa belum bergabung
- **Biru**: Informasi dan aksi force assign

### Icons
- `Users`: Kelompok
- `UserPlus`: Force assign
- `UserCheck`: Mahasiswa sudah bergabung
- `UserX`: Mahasiswa belum bergabung
- `Calculator`: Auto-calculate
- `Zap`: Auto-assign
- `AlertTriangle`: Warning
- `CheckCircle`: Success
- `Crown`: Ketua kelompok

---

## 🚀 IMPLEMENTATION PRIORITY

### Phase 1: Core Features (Week 1)
1. ✅ Auto-calculate max groups
2. ✅ Group configuration form
3. ✅ Basic monitoring dashboard
4. ✅ Force assign single student

### Phase 2: Monitoring & Automation (Week 2)
5. ✅ Real-time statistics
6. ✅ Unassigned students list
7. ✅ Auto-assign remaining students
8. ✅ Notifications

### Phase 3: Advanced Features (Week 3)
9. ✅ Drag & drop force assign
10. ✅ Bulk actions
11. ✅ Export reports
12. ✅ Activity timeline

### Phase 4: Polish & Optimization (Week 4)
13. ✅ Mobile responsive
14. ✅ Performance optimization
15. ✅ Edge case handling
16. ✅ Testing & QA

---

## 📝 NOTES

1. **Auto-calculate** menggunakan pembulatan ke atas (ceiling) untuk memastikan semua mahasiswa bisa masuk kelompok
2. **Force assign** harus dicatat dengan lengkap (siapa, kapan, alasan) untuk audit trail
3. **Real-time updates** penting agar admin bisa monitoring secara live
4. **Validasi ketat** di backend untuk mencegah kelompok melebihi batas
5. **Notifikasi** ke mahasiswa wajib dikirim saat di-force assign
6. **Mobile-friendly** karena admin mungkin monitoring dari HP
7. **Export report** untuk dokumentasi dan laporan ke pimpinan

---

## ✅ CHECKLIST IMPLEMENTASI

- [ ] Database migration untuk group_configurations
- [ ] API endpoints untuk konfigurasi dan monitoring
- [ ] Frontend form konfigurasi dengan auto-calculate
- [ ] Dashboard monitoring dengan real-time stats
- [ ] Force assign modal dan logic
- [ ] Auto-assign remaining students
- [ ] Notifikasi system (email + in-app)
- [ ] WebSocket untuk real-time updates
- [ ] Export Excel report
- [ ] Drag & drop interface
- [ ] Mobile responsive layout
- [ ] Unit tests untuk business logic
- [ ] Integration tests untuk API
- [ ] E2E tests untuk user flows
- [ ] Documentation & user guide

---

**SELESAI! Prompt lengkap dan ultra advanced untuk fitur Konfigurasi Tugas Kelompok dengan Auto-Calculate & Force Assign** 🎉
