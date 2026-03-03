# 🎯 PROMPT: TAMBAH TUGAS BARU - ULTRA ADVANCED WITH AUTOMATION (COMPLETE)

## 📋 OVERVIEW

Prompt ini untuk membuat halaman **Tambah Tugas Baru** yang ultra advanced dengan fitur automasi cerdas, AI-powered suggestions, template system, dan workflow automation. Halaman ini akan menjadi 1 halaman baru yang terpisah dengan URL `/user/akademik/tugas/create` atau `/dosen/tugas/create`.

### Target Users:
- **Mahasiswa**: Untuk menambah tugas pribadi/reminder
- **Dosen**: Untuk membuat tugas untuk mahasiswa

### File yang Akan Dibuat:
- `resources/js/pages/user/akademik/tugas-create.tsx` - Mahasiswa create page
- `resources/js/pages/dosen/tugas-create.tsx` - Dosen create page
- `app/Http/Controllers/User/TugasCreateController.php` - Mahasiswa controller
- `app/Http/Controllers/Dosen/TugasCreateController.php` - Dosen controller
- `app/Services/TugasAutomationService.php` - Automation service
- `app/Services/TugasTemplateService.php` - Template service
- `app/Services/TugasAIService.php` - AI suggestions service

### Fokus Utama:
1. **100% Matching Admin Dashboard** - Warna, UI/UX, container, animasi, header
2. **Multi-Step Form** - 4 steps dengan progress indicator
3. **Smart Automation** - Auto-fill, suggestions, templates
4. **AI-Powered** - Smart title/description suggestions
5. **Template System** - Save & reuse templates
6. **Bulk Creation** - Create multiple tasks at once
7. **Schedule Automation** - Auto-publish, reminders
8. **Rich Text Editor** - Advanced WYSIWYG editor

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

## 🚀 MULTI-STEP FORM STRUCTURE

### Step 1: Informasi Dasar (Basic Info)
- Judul tugas
- Mata kuliah (dropdown)
- Kategori (Tugas, Quiz, Ujian, Project, Presentasi)
- Prioritas (Rendah, Sedang, Tinggi, Urgent)
- AI Smart Suggestions untuk judul

### Step 2: Detail & Deskripsi (Details)
- Rich text editor untuk deskripsi
- Deadline (date & time picker)
- Estimasi waktu pengerjaan
- Bobot nilai (untuk dosen)
- Tags/labels

### Step 3: Lampiran & Resources (Attachments)
- Upload files (PDF, images, docs)
- Add links/URLs
- Embed videos
- Reference materials

### Step 4: Automasi & Pengaturan (Automation)
- Auto-publish schedule
- Reminder settings
- Recurring tasks
- Dependencies
- Notifications

---

## 💡 INOVASI ULTRA ADVANCED

### 1️⃣ AI-POWERED SMART SUGGESTIONS

**Konsep**: AI yang memberikan suggestions untuk judul, deskripsi, dan deadline


#### A. Smart Title Suggestions
```typescript
interface TitleSuggestion {
  title: string;
  confidence: number;
  category: string;
  reasoning: string;
}

const SmartTitleInput = () => {
  const [title, setTitle] = useState('');
  const [suggestions, setSuggestions] = useState<TitleSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeTitleContext = async (input: string) => {
    if (input.length < 3) return;
    
    setIsAnalyzing(true);
    try {
      const response = await axios.post('/api/tugas/ai/suggest-title', {
        partial_title: input,
        course_id: selectedCourse,
        context: 'create_task'
      });
      
      setSuggestions(response.data.suggestions);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            analyzeTitleContext(e.target.value);
          }}
          placeholder="Masukkan judul tugas..."
          className="pr-12"
        />
        {isAnalyzing && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
          </div>
        )}
      </div>

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/30 p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">
              AI Suggestions
            </p>
          </div>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, x: 5 }}
                onClick={() => setTitle(suggestion.title)}
                className="w-full text-left p-3 rounded-xl bg-white dark:bg-neutral-800 border border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900 dark:text-white">
                      {suggestion.title}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      {suggestion.reasoning}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    <Zap className="h-3 w-3" />
                    {Math.round(suggestion.confidence * 100)}%
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
```


#### B. Smart Description Generator
```typescript
const SmartDescriptionEditor = () => {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateDescription = async () => {
    setIsGenerating(true);
    try {
      const response = await axios.post('/api/tugas/ai/generate-description', {
        title: formData.title,
        category: formData.category,
        course_id: formData.course_id,
      });
      
      setDescription(response.data.description);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Deskripsi Tugas</Label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={generateDescription}
          disabled={isGenerating}
          className="gap-2"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Generate dengan AI
        </Button>
      </div>

      {/* Rich Text Editor */}
      <RichTextEditor
        value={description}
        onChange={setDescription}
        placeholder="Jelaskan detail tugas, kriteria penilaian, dan instruksi pengerjaan..."
      />
    </div>
  );
};
```

#### C. Smart Deadline Predictor
```typescript
const SmartDeadlinePicker = () => {
  const [deadline, setDeadline] = useState<Date>();
  const [predictions, setPredictions] = useState<DeadlinePrediction[]>([]);

  useEffect(() => {
    if (formData.title && formData.category) {
      predictOptimalDeadline();
    }
  }, [formData.title, formData.category]);

  const predictOptimalDeadline = async () => {
    const response = await axios.post('/api/tugas/ai/predict-deadline', {
      title: formData.title,
      category: formData.category,
      estimated_hours: formData.estimated_hours,
    });
    
    setPredictions(response.data.predictions);
  };

  return (
    <div className="space-y-3">
      <Label>Deadline</Label>
      
      {/* AI Predictions */}
      {predictions.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {predictions.map((pred, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDeadline(new Date(pred.date))}
              className="p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200 dark:border-indigo-800 text-center"
            >
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                {pred.label}
              </p>
              <p className="font-bold text-neutral-900 dark:text-white">
                {format(new Date(pred.date), 'dd MMM')}
              </p>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                {pred.reasoning}
              </p>
            </motion.button>
          ))}
        </div>
      )}

      {/* Date Picker */}
      <DateTimePicker
        value={deadline}
        onChange={setDeadline}
        minDate={new Date()}
      />
    </div>
  );
};
```


---

### 2️⃣ TEMPLATE SYSTEM (Save & Reuse)

**Konsep**: Save tugas sebagai template untuk digunakan kembali

#### A. Template Library
```typescript
interface TugasTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: {
    title_pattern: string;
    description_template: string;
    default_duration: number;
    default_priority: string;
    attachments: string[];
  };
  usage_count: number;
  last_used: string;
  is_favorite: boolean;
}

const TemplateLibrary = () => {
  const [templates, setTemplates] = useState<TugasTemplate[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 text-white">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
              Template Library
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {templates.length} templates tersedia
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTemplates(!showTemplates)}
        >
          {showTemplates ? 'Hide' : 'Show'} Templates
        </Button>
      </div>

      {showTemplates && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <motion.div
              key={template.id}
              whileHover={{ scale: 1.02, y: -4 }}
              className="p-4 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 cursor-pointer"
              onClick={() => applyTemplate(template)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-bold text-neutral-900 dark:text-white mb-1">
                    {template.name}
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                    {template.description}
                  </p>
                </div>
                {template.is_favorite && (
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {template.usage_count} kali digunakan
                </span>
                <span className="px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-semibold">
                  {template.category}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Save as Template Button */}
      <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={saveAsTemplate}
        >
          <Save className="h-4 w-4" />
          Save Current as Template
        </Button>
      </div>
    </motion.div>
  );
};
```


#### B. Quick Templates (Preset)
```typescript
const QuickTemplates = () => {
  const quickTemplates = [
    {
      name: 'Essay Assignment',
      icon: FileText,
      color: 'from-blue-500 to-indigo-600',
      fields: {
        category: 'Tugas',
        estimated_hours: 8,
        priority: 'Sedang',
        description_template: '**Instruksi:**\n1. Baca materi referensi\n2. Buat outline\n3. Tulis essay minimal 1000 kata\n4. Review dan edit\n\n**Format:**\n- Font: Times New Roman 12pt\n- Spacing: 1.5\n- Margin: 2.5cm\n\n**Kriteria Penilaian:**\n- Konten (40%)\n- Struktur (30%)\n- Tata Bahasa (20%)\n- Referensi (10%)'
      }
    },
    {
      name: 'Programming Project',
      icon: Code,
      color: 'from-emerald-500 to-teal-600',
      fields: {
        category: 'Project',
        estimated_hours: 20,
        priority: 'Tinggi',
        description_template: '**Deskripsi Project:**\n[Jelaskan tujuan project]\n\n**Requirements:**\n- [ ] Requirement 1\n- [ ] Requirement 2\n- [ ] Requirement 3\n\n**Tech Stack:**\n- Frontend: \n- Backend: \n- Database: \n\n**Deliverables:**\n1. Source code (GitHub)\n2. Documentation\n3. Demo video\n4. Presentation slides'
      }
    },
    {
      name: 'Presentation',
      icon: Presentation,
      color: 'from-purple-500 to-pink-600',
      fields: {
        category: 'Presentasi',
        estimated_hours: 6,
        priority: 'Sedang',
        description_template: '**Topik Presentasi:**\n[Judul presentasi]\n\n**Durasi:** 15-20 menit\n\n**Outline:**\n1. Introduction\n2. Main Content\n3. Conclusion\n4. Q&A\n\n**Requirements:**\n- PowerPoint/Google Slides\n- Minimal 15 slides\n- Include references\n- Practice presentation'
      }
    },
    {
      name: 'Quiz/Exam',
      icon: ClipboardCheck,
      color: 'from-amber-500 to-orange-600',
      fields: {
        category: 'Quiz',
        estimated_hours: 2,
        priority: 'Urgent',
        description_template: '**Jenis:** [Quiz/UTS/UAS]\n\n**Materi:**\n- Chapter 1: \n- Chapter 2: \n- Chapter 3: \n\n**Format:**\n- Multiple Choice: \n- Essay: \n- Total Soal: \n\n**Catatan:**\n- Closed book\n- Durasi: 90 menit\n- Boleh kalkulator'
      }
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {quickTemplates.map((template, index) => (
        <motion.button
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05, y: -4 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => applyQuickTemplate(template)}
          className={`p-4 rounded-2xl bg-gradient-to-br ${template.color} text-white shadow-lg`}
        >
          <template.icon className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm font-bold">{template.name}</p>
        </motion.button>
      ))}
    </div>
  );
};
```


---

### 3️⃣ BULK CREATION (Multiple Tasks at Once)

**Konsep**: Create multiple tasks sekaligus dengan CSV import atau form array

#### A. CSV Import
```typescript
const BulkImportCSV = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setIsProcessing(true);

    const formData = new FormData();
    formData.append('file', uploadedFile);

    try {
      const response = await axios.post('/api/tugas/bulk/preview', formData);
      setPreview(response.data.tasks);
    } finally {
      setIsProcessing(false);
    }
  };

  const processBulkImport = async () => {
    setIsProcessing(true);
    try {
      await axios.post('/api/tugas/bulk/import', {
        tasks: preview
      });
      
      toast.success(`${preview.length} tugas berhasil dibuat!`);
      router.visit('/user/akademik/tugas');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <Upload className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
            Bulk Import dari CSV
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Upload file CSV untuk membuat banyak tugas sekaligus
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <div className="mb-6">
        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl cursor-pointer hover:border-indigo-500 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="h-10 w-10 text-neutral-400 mb-3" />
            <p className="mb-2 text-sm text-neutral-600 dark:text-neutral-400">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-neutral-500">CSV file (MAX. 5MB)</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept=".csv"
            onChange={handleFileUpload}
          />
        </label>

        {/* Download Template */}
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-neutral-500">
            Belum punya template?
          </p>
          <Button
            variant="link"
            size="sm"
            onClick={() => downloadCSVTemplate()}
          >
            <Download className="h-4 w-4 mr-1" />
            Download Template
          </Button>
        </div>
      </div>

      {/* Preview Table */}
      {preview.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
              Preview: {preview.length} tugas akan dibuat
            </p>
            <Button
              onClick={processBulkImport}
              disabled={isProcessing}
              className="gap-2"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Import Semua
            </Button>
          </div>

          <div className="max-h-96 overflow-auto rounded-2xl border border-neutral-200 dark:border-neutral-700">
            <table className="w-full">
              <thead className="bg-neutral-100 dark:bg-neutral-800 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold">Judul</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold">Kategori</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold">Deadline</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold">Prioritas</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((task, index) => (
                  <tr key={index} className="border-t border-neutral-200 dark:border-neutral-700">
                    <td className="px-4 py-3 text-sm">{task.title}</td>
                    <td className="px-4 py-3 text-sm">{task.category}</td>
                    <td className="px-4 py-3 text-sm">{task.deadline}</td>
                    <td className="px-4 py-3 text-sm">{task.priority}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
};
```


#### B. Quick Add Multiple (Form Array)
```typescript
const QuickAddMultiple = () => {
  const [tasks, setTasks] = useState([
    { title: '', deadline: '', priority: 'Sedang' }
  ]);

  const addTaskRow = () => {
    setTasks([...tasks, { title: '', deadline: '', priority: 'Sedang' }]);
  };

  const removeTaskRow = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const createAllTasks = async () => {
    await axios.post('/api/tugas/bulk/create', { tasks });
    toast.success(`${tasks.length} tugas berhasil dibuat!`);
    router.visit('/user/akademik/tugas');
  };

  return (
    <div className="space-y-3">
      {tasks.map((task, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950/30 text-sm font-bold text-indigo-600 dark:text-indigo-400">
            {index + 1}
          </span>
          
          <Input
            placeholder="Judul tugas"
            value={task.title}
            onChange={(e) => {
              const newTasks = [...tasks];
              newTasks[index].title = e.target.value;
              setTasks(newTasks);
            }}
            className="flex-1"
          />

          <Input
            type="date"
            value={task.deadline}
            onChange={(e) => {
              const newTasks = [...tasks];
              newTasks[index].deadline = e.target.value;
              setTasks(newTasks);
            }}
            className="w-40"
          />

          <Select
            value={task.priority}
            onValueChange={(value) => {
              const newTasks = [...tasks];
              newTasks[index].priority = value;
              setTasks(newTasks);
            }}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Rendah">Rendah</SelectItem>
              <SelectItem value="Sedang">Sedang</SelectItem>
              <SelectItem value="Tinggi">Tinggi</SelectItem>
              <SelectItem value="Urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeTaskRow(index)}
            disabled={tasks.length === 1}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </motion.div>
      ))}

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={addTaskRow}
          className="flex-1 gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Row
        </Button>
        <Button
          onClick={createAllTasks}
          className="flex-1 gap-2"
        >
          <CheckCircle className="h-4 w-4" />
          Create All ({tasks.length})
        </Button>
      </div>
    </div>
  );
};
```


---

### 4️⃣ SCHEDULE AUTOMATION (Auto-Publish & Reminders)

**Konsep**: Automasi untuk publish tugas dan reminder notifications

#### A. Auto-Publish Scheduler
```typescript
const AutoPublishScheduler = () => {
  const [scheduleType, setScheduleType] = useState<'immediate' | 'scheduled' | 'recurring'>('immediate');
  const [publishDate, setPublishDate] = useState<Date>();
  const [recurringPattern, setRecurringPattern] = useState({
    frequency: 'weekly',
    interval: 1,
    daysOfWeek: [] as number[],
    endDate: null as Date | null,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
          <Calendar className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
            Schedule & Automation
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Atur kapan tugas akan dipublish
          </p>
        </div>
      </div>

      {/* Schedule Type Selector */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { value: 'immediate', label: 'Publish Now', icon: Zap },
          { value: 'scheduled', label: 'Schedule', icon: Clock },
          { value: 'recurring', label: 'Recurring', icon: Repeat },
        ].map((type) => (
          <motion.button
            key={type.value}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setScheduleType(type.value as any)}
            className={`p-4 rounded-2xl border-2 transition-all ${
              scheduleType === type.value
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                : 'border-neutral-200 dark:border-neutral-700 hover:border-indigo-300'
            }`}
          >
            <type.icon className={`h-6 w-6 mx-auto mb-2 ${
              scheduleType === type.value
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-neutral-400'
            }`} />
            <p className={`text-sm font-semibold ${
              scheduleType === type.value
                ? 'text-indigo-900 dark:text-indigo-100'
                : 'text-neutral-600 dark:text-neutral-400'
            }`}>
              {type.label}
            </p>
          </motion.button>
        ))}
      </div>

      {/* Scheduled Options */}
      {scheduleType === 'scheduled' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4"
        >
          <div>
            <Label>Publish Date & Time</Label>
            <DateTimePicker
              value={publishDate}
              onChange={setPublishDate}
              minDate={new Date()}
            />
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Scheduled Publishing
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Tugas akan otomatis dipublish pada {publishDate ? format(publishDate, 'dd MMM yyyy HH:mm') : 'tanggal yang dipilih'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recurring Options */}
      {scheduleType === 'recurring' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Frequency</Label>
              <Select
                value={recurringPattern.frequency}
                onValueChange={(value) => setRecurringPattern({ ...recurringPattern, frequency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Interval</Label>
              <Input
                type="number"
                min="1"
                value={recurringPattern.interval}
                onChange={(e) => setRecurringPattern({ ...recurringPattern, interval: parseInt(e.target.value) })}
              />
            </div>
          </div>

          {recurringPattern.frequency === 'weekly' && (
            <div>
              <Label>Days of Week</Label>
              <div className="grid grid-cols-7 gap-2 mt-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      const days = recurringPattern.daysOfWeek.includes(index)
                        ? recurringPattern.daysOfWeek.filter(d => d !== index)
                        : [...recurringPattern.daysOfWeek, index];
                      setRecurringPattern({ ...recurringPattern, daysOfWeek: days });
                    }}
                    className={`p-2 rounded-lg text-xs font-semibold transition-all ${
                      recurringPattern.daysOfWeek.includes(index)
                        ? 'bg-indigo-500 text-white'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label>End Date (Optional)</Label>
            <DatePicker
              value={recurringPattern.endDate}
              onChange={(date) => setRecurringPattern({ ...recurringPattern, endDate: date })}
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
```


#### B. Smart Reminder System
```typescript
const SmartReminderSystem = () => {
  const [reminders, setReminders] = useState<Reminder[]>([
    { type: 'before_deadline', value: 24, unit: 'hours', enabled: true },
    { type: 'before_deadline', value: 1, unit: 'days', enabled: true },
  ]);

  const reminderPresets = [
    { label: '1 hour before', value: 1, unit: 'hours' },
    { label: '3 hours before', value: 3, unit: 'hours' },
    { label: '1 day before', value: 1, unit: 'days' },
    { label: '3 days before', value: 3, unit: 'days' },
    { label: '1 week before', value: 7, unit: 'days' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Reminder Notifications</Label>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setReminders([...reminders, { type: 'before_deadline', value: 1, unit: 'hours', enabled: true }])}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Reminder
        </Button>
      </div>

      {/* Quick Presets */}
      <div className="flex flex-wrap gap-2">
        {reminderPresets.map((preset, index) => (
          <button
            key={index}
            onClick={() => setReminders([...reminders, { ...preset, type: 'before_deadline', enabled: true }])}
            className="px-3 py-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950/30 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/40 transition-colors"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Reminder List */}
      <div className="space-y-2">
        {reminders.map((reminder, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
          >
            <Switch
              checked={reminder.enabled}
              onCheckedChange={(checked) => {
                const newReminders = [...reminders];
                newReminders[index].enabled = checked;
                setReminders(newReminders);
              }}
            />

            <Bell className={`h-4 w-4 ${reminder.enabled ? 'text-indigo-600' : 'text-neutral-400'}`} />

            <Input
              type="number"
              min="1"
              value={reminder.value}
              onChange={(e) => {
                const newReminders = [...reminders];
                newReminders[index].value = parseInt(e.target.value);
                setReminders(newReminders);
              }}
              className="w-20"
            />

            <Select
              value={reminder.unit}
              onValueChange={(value) => {
                const newReminders = [...reminders];
                newReminders[index].unit = value;
                setReminders(newReminders);
              }}
            >
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minutes">Minutes</SelectItem>
                <SelectItem value="hours">Hours</SelectItem>
                <SelectItem value="days">Days</SelectItem>
                <SelectItem value="weeks">Weeks</SelectItem>
              </SelectContent>
            </Select>

            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              before deadline
            </span>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setReminders(reminders.filter((_, i) => i !== index))}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
```


---

### 5️⃣ RICH TEXT EDITOR (Advanced WYSIWYG)

**Konsep**: Editor yang powerful dengan formatting, code blocks, tables, dan media

#### Implementation dengan TipTap
```typescript
// Install: npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extension-table

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { lowlight } from 'lowlight';

const RichTextEditor = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-neutral-100 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
        {/* Text Formatting */}
        <div className="flex items-center gap-1 pr-2 border-r border-neutral-300 dark:border-neutral-600">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            icon={<Bold className="h-4 w-4" />}
            tooltip="Bold"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            icon={<Italic className="h-4 w-4" />}
            tooltip="Italic"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            icon={<Strikethrough className="h-4 w-4" />}
            tooltip="Strikethrough"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            icon={<Code className="h-4 w-4" />}
            tooltip="Inline Code"
          />
        </div>

        {/* Headings */}
        <div className="flex items-center gap-1 pr-2 border-r border-neutral-300 dark:border-neutral-600">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            icon={<Heading1 className="h-4 w-4" />}
            tooltip="Heading 1"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            icon={<Heading2 className="h-4 w-4" />}
            tooltip="Heading 2"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            icon={<Heading3 className="h-4 w-4" />}
            tooltip="Heading 3"
          />
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 pr-2 border-r border-neutral-300 dark:border-neutral-600">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            icon={<List className="h-4 w-4" />}
            tooltip="Bullet List"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            icon={<ListOrdered className="h-4 w-4" />}
            tooltip="Numbered List"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            icon={<Quote className="h-4 w-4" />}
            tooltip="Blockquote"
          />
        </div>

        {/* Insert */}
        <div className="flex items-center gap-1 pr-2 border-r border-neutral-300 dark:border-neutral-600">
          <ToolbarButton
            onClick={() => {
              const url = window.prompt('Enter image URL');
              if (url) editor.chain().focus().setImage({ src: url }).run();
            }}
            icon={<ImageIcon className="h-4 w-4" />}
            tooltip="Insert Image"
          />
          <ToolbarButton
            onClick={() => {
              const url = window.prompt('Enter link URL');
              if (url) editor.chain().focus().setLink({ href: url }).run();
            }}
            isActive={editor.isActive('link')}
            icon={<Link2 className="h-4 w-4" />}
            tooltip="Insert Link"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()}
            icon={<Table2 className="h-4 w-4" />}
            tooltip="Insert Table"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            icon={<Code2 className="h-4 w-4" />}
            tooltip="Code Block"
          />
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            icon={<AlignLeft className="h-4 w-4" />}
            tooltip="Align Left"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            icon={<AlignCenter className="h-4 w-4" />}
            tooltip="Align Center"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            icon={<AlignRight className="h-4 w-4" />}
            tooltip="Align Right"
          />
        </div>
      </div>

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className="prose prose-sm dark:prose-invert max-w-none p-4 min-h-[300px] focus:outline-none"
      />
    </div>
  );
};

const ToolbarButton = ({ onClick, isActive, icon, tooltip }: any) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-lg transition-colors ${
      isActive
        ? 'bg-indigo-100 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400'
        : 'hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
    }`}
    title={tooltip}
  >
    {icon}
  </button>
);
```


---

### 6️⃣ SMART FILE UPLOAD (Drag & Drop with Preview)

**Konsep**: Upload files dengan drag & drop, preview, dan compression

```typescript
const SmartFileUpload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles([...files, ...droppedFiles]);
  };

  const uploadFiles = async () => {
    setUploading(true);
    
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);

      await axios.post('/api/tugas/upload', formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
        }
      });
    }

    setUploading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white">
          <Paperclip className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
            Lampiran & Resources
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Upload files, images, atau dokumen pendukung
          </p>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="relative border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl p-8 text-center hover:border-indigo-500 transition-colors cursor-pointer"
      >
        <input
          type="file"
          multiple
          onChange={(e) => setFiles([...files, ...Array.from(e.target.files || [])])}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <Upload className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
        <p className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">
          Drop files here or click to browse
        </p>
        <p className="text-xs text-neutral-500">
          Support: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, Images (MAX. 10MB per file)
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
              {files.length} file(s) selected
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setFiles([])}
            >
              Clear All
            </Button>
          </div>

          {files.map((file, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
            >
              {/* File Icon */}
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950/30">
                {getFileIcon(file.type)}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                  {file.name}
                </p>
                <p className="text-xs text-neutral-500">
                  {formatFileSize(file.size)}
                </p>

                {/* Upload Progress */}
                {uploading && uploadProgress[file.name] !== undefined && (
                  <div className="mt-2">
                    <div className="h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress[file.name]}%` }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Remove Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setFiles(files.filter((_, i) => i !== index))}
              >
                <X className="h-4 w-4 text-red-500" />
              </Button>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

const getFileIcon = (type: string) => {
  if (type.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
  if (type.includes('word')) return <FileText className="h-5 w-5 text-blue-500" />;
  if (type.includes('excel') || type.includes('spreadsheet')) return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
  if (type.includes('powerpoint') || type.includes('presentation')) return <Presentation className="h-5 w-5 text-orange-500" />;
  if (type.includes('image')) return <ImageIcon className="h-5 w-5 text-purple-500" />;
  return <File className="h-5 w-5 text-neutral-500" />;
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};
```


---

### 7️⃣ TASK DEPENDENCIES & PREREQUISITES

**Konsep**: Set tugas yang harus diselesaikan terlebih dahulu

```typescript
const TaskDependencies = () => {
  const [availableTasks, setAvailableTasks] = useState<Tugas[]>([]);
  const [selectedDependencies, setSelectedDependencies] = useState<number[]>([]);

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
            Task Dependencies
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Tugas yang harus diselesaikan terlebih dahulu
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="mb-6 p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-1">
              What are dependencies?
            </p>
            <p className="text-xs text-purple-700 dark:text-purple-300">
              Dependencies memastikan mahasiswa menyelesaikan tugas prerequisite sebelum mengerjakan tugas ini. Tugas akan terkunci sampai semua dependencies selesai.
            </p>
          </div>
        </div>
      </div>

      {/* Task Selector */}
      <div className="space-y-3">
        <Label>Select Prerequisite Tasks</Label>
        
        {availableTasks.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {availableTasks.map((task) => (
              <motion.div
                key={task.id}
                whileHover={{ x: 5 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 cursor-pointer"
                onClick={() => {
                  if (selectedDependencies.includes(task.id)) {
                    setSelectedDependencies(selectedDependencies.filter(id => id !== task.id));
                  } else {
                    setSelectedDependencies([...selectedDependencies, task.id]);
                  }
                }}
              >
                <Checkbox
                  checked={selectedDependencies.includes(task.id)}
                  onCheckedChange={() => {}}
                />
                
                <div className="flex-1">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                    {task.judul}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {task.mata_kuliah} • Deadline: {task.deadline_display}
                  </p>
                </div>

                {getPriorityBadge(task.prioritas)}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-neutral-500">
            <GitBranch className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Belum ada tugas yang bisa dijadikan dependency</p>
          </div>
        )}
      </div>

      {/* Selected Dependencies */}
      {selectedDependencies.length > 0 && (
        <div className="mt-6 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
          <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-100 mb-3">
            {selectedDependencies.length} dependencies selected
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedDependencies.map((id) => {
              const task = availableTasks.find(t => t.id === id);
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 text-xs font-semibold"
                >
                  {task?.judul}
                  <button
                    onClick={() => setSelectedDependencies(selectedDependencies.filter(depId => depId !== id))}
                    className="hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};
```


---

### 8️⃣ COLLABORATION SETTINGS (For Dosen)

**Konsep**: Settings untuk kolaborasi mahasiswa (group work, peer review)

```typescript
const CollaborationSettings = () => {
  const [collaborationType, setCollaborationType] = useState<'individual' | 'group' | 'peer_review'>('individual');
  const [groupSettings, setGroupSettings] = useState({
    max_members: 4,
    allow_self_form: true,
    random_assignment: false,
  });
  const [peerReviewSettings, setPeerReviewSettings] = useState({
    reviews_per_student: 2,
    anonymous: true,
    rubric_enabled: true,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <Users className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
            Collaboration Settings
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Atur mode pengerjaan tugas
          </p>
        </div>
      </div>

      {/* Collaboration Type */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { value: 'individual', label: 'Individual', icon: User, desc: 'Dikerjakan sendiri' },
          { value: 'group', label: 'Group Work', icon: Users, desc: 'Kerja kelompok' },
          { value: 'peer_review', label: 'Peer Review', icon: Eye, desc: 'Review antar mahasiswa' },
        ].map((type) => (
          <motion.button
            key={type.value}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCollaborationType(type.value as any)}
            className={`p-4 rounded-2xl border-2 transition-all ${
              collaborationType === type.value
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                : 'border-neutral-200 dark:border-neutral-700 hover:border-indigo-300'
            }`}
          >
            <type.icon className={`h-6 w-6 mx-auto mb-2 ${
              collaborationType === type.value
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-neutral-400'
            }`} />
            <p className={`text-sm font-semibold mb-1 ${
              collaborationType === type.value
                ? 'text-indigo-900 dark:text-indigo-100'
                : 'text-neutral-600 dark:text-neutral-400'
            }`}>
              {type.label}
            </p>
            <p className="text-xs text-neutral-500">{type.desc}</p>
          </motion.button>
        ))}
      </div>

      {/* Group Settings */}
      {collaborationType === 'group' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800"
        >
          <h4 className="font-semibold text-emerald-900 dark:text-emerald-100">
            Group Work Settings
          </h4>

          <div>
            <Label>Maximum Members per Group</Label>
            <Input
              type="number"
              min="2"
              max="10"
              value={groupSettings.max_members}
              onChange={(e) => setGroupSettings({ ...groupSettings, max_members: parseInt(e.target.value) })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Allow Self-Form Groups</Label>
              <p className="text-xs text-neutral-500">Mahasiswa bisa membentuk kelompok sendiri</p>
            </div>
            <Switch
              checked={groupSettings.allow_self_form}
              onCheckedChange={(checked) => setGroupSettings({ ...groupSettings, allow_self_form: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Random Assignment</Label>
              <p className="text-xs text-neutral-500">Sistem akan membagi kelompok secara acak</p>
            </div>
            <Switch
              checked={groupSettings.random_assignment}
              onCheckedChange={(checked) => setGroupSettings({ ...groupSettings, random_assignment: checked })}
            />
          </div>
        </motion.div>
      )}

      {/* Peer Review Settings */}
      {collaborationType === 'peer_review' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4 p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800"
        >
          <h4 className="font-semibold text-blue-900 dark:text-blue-100">
            Peer Review Settings
          </h4>

          <div>
            <Label>Reviews per Student</Label>
            <p className="text-xs text-neutral-500 mb-2">Berapa tugas yang harus direview setiap mahasiswa</p>
            <Input
              type="number"
              min="1"
              max="5"
              value={peerReviewSettings.reviews_per_student}
              onChange={(e) => setPeerReviewSettings({ ...peerReviewSettings, reviews_per_student: parseInt(e.target.value) })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Anonymous Review</Label>
              <p className="text-xs text-neutral-500">Reviewer tidak diketahui identitasnya</p>
            </div>
            <Switch
              checked={peerReviewSettings.anonymous}
              onCheckedChange={(checked) => setPeerReviewSettings({ ...peerReviewSettings, anonymous: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Rubric</Label>
              <p className="text-xs text-neutral-500">Gunakan rubrik penilaian terstruktur</p>
            </div>
            <Switch
              checked={peerReviewSettings.rubric_enabled}
              onCheckedChange={(checked) => setPeerReviewSettings({ ...peerReviewSettings, rubric_enabled: checked })}
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
```


---

## 🗄️ BACKEND IMPLEMENTATION

### A. Database Schema Updates

```sql
-- Add new columns to tugas table
ALTER TABLE tugas ADD COLUMN template_id INT NULL;
ALTER TABLE tugas ADD COLUMN is_template BOOLEAN DEFAULT FALSE;
ALTER TABLE tugas ADD COLUMN schedule_type ENUM('immediate', 'scheduled', 'recurring') DEFAULT 'immediate';
ALTER TABLE tugas ADD COLUMN publish_at DATETIME NULL;
ALTER TABLE tugas ADD COLUMN recurring_pattern JSON NULL;
ALTER TABLE tugas ADD COLUMN collaboration_type ENUM('individual', 'group', 'peer_review') DEFAULT 'individual';
ALTER TABLE tugas ADD COLUMN collaboration_settings JSON NULL;
ALTER TABLE tugas ADD COLUMN estimated_hours INT NULL;
ALTER TABLE tugas ADD COLUMN ai_generated BOOLEAN DEFAULT FALSE;

-- Create tugas_templates table
CREATE TABLE tugas_templates (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    fields JSON NOT NULL,
    usage_count INT DEFAULT 0,
    is_favorite BOOLEAN DEFAULT FALSE,
    last_used_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create tugas_dependencies table
CREATE TABLE tugas_dependencies (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tugas_id BIGINT UNSIGNED NOT NULL,
    depends_on_tugas_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tugas_id) REFERENCES tugas(id) ON DELETE CASCADE,
    FOREIGN KEY (depends_on_tugas_id) REFERENCES tugas(id) ON DELETE CASCADE,
    UNIQUE KEY unique_dependency (tugas_id, depends_on_tugas_id)
);

-- Create tugas_reminders table
CREATE TABLE tugas_reminders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tugas_id BIGINT UNSIGNED NOT NULL,
    type ENUM('before_deadline', 'custom') DEFAULT 'before_deadline',
    value INT NOT NULL,
    unit ENUM('minutes', 'hours', 'days', 'weeks') NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    sent_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tugas_id) REFERENCES tugas(id) ON DELETE CASCADE
);

-- Create tugas_attachments table
CREATE TABLE tugas_attachments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tugas_id BIGINT UNSIGNED NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,
    uploaded_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tugas_id) REFERENCES tugas(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);
```


### B. Controller Implementation

```php
<?php

namespace App\Http\Controllers\Dosen;

use App\Http\Controllers\Controller;
use App\Models\Tugas;
use App\Services\TugasAutomationService;
use App\Services\TugasTemplateService;
use App\Services\TugasAIService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TugasCreateController extends Controller
{
    protected $automationService;
    protected $templateService;
    protected $aiService;

    public function __construct(
        TugasAutomationService $automationService,
        TugasTemplateService $templateService,
        TugasAIService $aiService
    ) {
        $this->automationService = $automationService;
        $this->templateService = $templateService;
        $this->aiService = $aiService;
    }

    public function index()
    {
        $templates = $this->templateService->getUserTemplates(auth()->id());
        $courses = auth()->user()->courses;
        $availableTasks = Tugas::where('dosen_id', auth()->id())
            ->where('status', 'published')
            ->get();

        return Inertia::render('Dosen/TugasCreate', [
            'templates' => $templates,
            'courses' => $courses,
            'availableTasks' => $availableTasks,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'judul' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'mata_kuliah_id' => 'required|exists:mata_kuliah,id',
            'kategori' => 'required|in:Tugas,Quiz,Ujian,Project,Presentasi',
            'prioritas' => 'required|in:Rendah,Sedang,Tinggi,Urgent',
            'deadline' => 'required|date',
            'bobot_nilai' => 'nullable|numeric|min:0|max:100',
            'estimated_hours' => 'nullable|integer|min:1',
            'schedule_type' => 'required|in:immediate,scheduled,recurring',
            'publish_at' => 'nullable|date',
            'recurring_pattern' => 'nullable|array',
            'collaboration_type' => 'required|in:individual,group,peer_review',
            'collaboration_settings' => 'nullable|array',
            'dependencies' => 'nullable|array',
            'reminders' => 'nullable|array',
            'attachments' => 'nullable|array',
        ]);

        // Create tugas
        $tugas = Tugas::create([
            'judul' => $validated['judul'],
            'deskripsi' => $validated['deskripsi'],
            'mata_kuliah_id' => $validated['mata_kuliah_id'],
            'dosen_id' => auth()->id(),
            'kategori' => $validated['kategori'],
            'prioritas' => $validated['prioritas'],
            'deadline' => $validated['deadline'],
            'bobot_nilai' => $validated['bobot_nilai'] ?? 0,
            'estimated_hours' => $validated['estimated_hours'],
            'schedule_type' => $validated['schedule_type'],
            'publish_at' => $validated['publish_at'],
            'recurring_pattern' => $validated['recurring_pattern'],
            'collaboration_type' => $validated['collaboration_type'],
            'collaboration_settings' => $validated['collaboration_settings'],
            'status' => $validated['schedule_type'] === 'immediate' ? 'published' : 'scheduled',
        ]);

        // Handle dependencies
        if (!empty($validated['dependencies'])) {
            $this->automationService->attachDependencies($tugas->id, $validated['dependencies']);
        }

        // Handle reminders
        if (!empty($validated['reminders'])) {
            $this->automationService->createReminders($tugas->id, $validated['reminders']);
        }

        // Handle attachments
        if (!empty($validated['attachments'])) {
            $this->automationService->attachFiles($tugas->id, $validated['attachments']);
        }

        // Schedule automation
        if ($validated['schedule_type'] !== 'immediate') {
            $this->automationService->schedulePublication($tugas);
        }

        return redirect()->route('dosen.tugas.index')
            ->with('success', 'Tugas berhasil dibuat!');
    }

    public function bulkStore(Request $request)
    {
        $validated = $request->validate([
            'tasks' => 'required|array|min:1',
            'tasks.*.judul' => 'required|string',
            'tasks.*.deadline' => 'required|date',
            'tasks.*.kategori' => 'required|string',
            'tasks.*.prioritas' => 'required|string',
        ]);

        $created = [];
        foreach ($validated['tasks'] as $taskData) {
            $tugas = Tugas::create([
                ...$taskData,
                'dosen_id' => auth()->id(),
                'status' => 'published',
            ]);
            $created[] = $tugas;
        }

        return response()->json([
            'success' => true,
            'message' => count($created) . ' tugas berhasil dibuat',
            'tasks' => $created,
        ]);
    }
}
```


### C. AI Service Implementation

```php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class TugasAIService
{
    /**
     * Generate smart title suggestions based on context
     */
    public function suggestTitle(string $partialTitle, int $courseId): array
    {
        // In production, integrate with OpenAI or similar
        // For now, return rule-based suggestions
        
        $suggestions = [];
        
        // Pattern matching
        if (str_contains(strtolower($partialTitle), 'essay')) {
            $suggestions[] = [
                'title' => 'Essay: ' . ucfirst($partialTitle),
                'confidence' => 0.85,
                'category' => 'Tugas',
                'reasoning' => 'Detected essay pattern'
            ];
        }
        
        if (str_contains(strtolower($partialTitle), 'project')) {
            $suggestions[] = [
                'title' => 'Project: ' . ucfirst($partialTitle),
                'confidence' => 0.90,
                'category' => 'Project',
                'reasoning' => 'Detected project pattern'
            ];
        }

        // Add more intelligent suggestions based on course history
        $historicalTitles = $this->getHistoricalTitles($courseId);
        foreach ($historicalTitles as $historical) {
            if (similar_text(strtolower($partialTitle), strtolower($historical['title'])) > 50) {
                $suggestions[] = [
                    'title' => $historical['title'],
                    'confidence' => 0.75,
                    'category' => $historical['category'],
                    'reasoning' => 'Similar to previous assignment'
                ];
            }
        }

        return $suggestions;
    }

    /**
     * Generate description using AI
     */
    public function generateDescription(string $title, string $category, int $courseId): string
    {
        // Template-based generation
        $templates = [
            'Tugas' => "**Deskripsi Tugas:**\n{$title}\n\n**Tujuan:**\n- Memahami konsep...\n- Mengaplikasikan teori...\n\n**Instruksi:**\n1. Baca materi referensi\n2. Kerjakan soal/tugas\n3. Submit sebelum deadline\n\n**Format Pengumpulan:**\n- File PDF\n- Nama file: NIM_Nama_Tugas\n\n**Kriteria Penilaian:**\n- Ketepatan (40%)\n- Kelengkapan (30%)\n- Kerapihan (20%)\n- Ketepatan waktu (10%)",
            
            'Project' => "**Project Overview:**\n{$title}\n\n**Objectives:**\n- Build a functional application\n- Apply best practices\n- Document the process\n\n**Requirements:**\n- [ ] Requirement 1\n- [ ] Requirement 2\n- [ ] Requirement 3\n\n**Deliverables:**\n1. Source code (GitHub repository)\n2. Documentation (README.md)\n3. Demo video\n4. Presentation slides\n\n**Tech Stack:**\n- Frontend: \n- Backend: \n- Database: \n\n**Grading Rubric:**\n- Functionality (40%)\n- Code Quality (30%)\n- Documentation (20%)\n- Presentation (10%)",
        ];

        return $templates[$category] ?? $templates['Tugas'];
    }

    /**
     * Predict optimal deadline
     */
    public function predictDeadline(string $title, string $category, ?int $estimatedHours): array
    {
        $predictions = [];
        $now = now();

        // Conservative (more time)
        $predictions[] = [
            'label' => 'Conservative',
            'date' => $now->copy()->addDays(14)->toDateTimeString(),
            'reasoning' => '2 weeks - Ample time for quality work'
        ];

        // Standard (balanced)
        $predictions[] = [
            'label' => 'Standard',
            'date' => $now->copy()->addDays(7)->toDateTimeString(),
            'reasoning' => '1 week - Balanced timeline'
        ];

        // Tight (less time)
        $predictions[] = [
            'label' => 'Tight',
            'date' => $now->copy()->addDays(3)->toDateTimeString(),
            'reasoning' => '3 days - Quick turnaround'
        ];

        return $predictions;
    }

    private function getHistoricalTitles(int $courseId): array
    {
        return \App\Models\Tugas::where('mata_kuliah_id', $courseId)
            ->select('judul as title', 'kategori as category')
            ->limit(10)
            ->get()
            ->toArray();
    }
}
```


### D. Automation Service Implementation

```php
<?php

namespace App\Services;

use App\Models\Tugas;
use App\Models\TugasDependency;
use App\Models\TugasReminder;
use App\Models\TugasAttachment;
use Illuminate\Support\Facades\Storage;

class TugasAutomationService
{
    /**
     * Attach dependencies to a task
     */
    public function attachDependencies(int $tugasId, array $dependencyIds): void
    {
        foreach ($dependencyIds as $dependencyId) {
            TugasDependency::create([
                'tugas_id' => $tugasId,
                'depends_on_tugas_id' => $dependencyId,
            ]);
        }
    }

    /**
     * Create reminders for a task
     */
    public function createReminders(int $tugasId, array $reminders): void
    {
        foreach ($reminders as $reminder) {
            TugasReminder::create([
                'tugas_id' => $tugasId,
                'type' => $reminder['type'] ?? 'before_deadline',
                'value' => $reminder['value'],
                'unit' => $reminder['unit'],
                'enabled' => $reminder['enabled'] ?? true,
            ]);
        }
    }

    /**
     * Attach files to a task
     */
    public function attachFiles(int $tugasId, array $files): void
    {
        foreach ($files as $file) {
            if ($file instanceof \Illuminate\Http\UploadedFile) {
                $path = $file->store('tugas-attachments', 'public');
                
                TugasAttachment::create([
                    'tugas_id' => $tugasId,
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $path,
                    'file_type' => $file->getMimeType(),
                    'file_size' => $file->getSize(),
                    'uploaded_by' => auth()->id(),
                ]);
            }
        }
    }

    /**
     * Schedule task publication
     */
    public function schedulePublication(Tugas $tugas): void
    {
        if ($tugas->schedule_type === 'scheduled' && $tugas->publish_at) {
            // Queue job to publish at specified time
            \App\Jobs\PublishTugasJob::dispatch($tugas)
                ->delay($tugas->publish_at);
        }

        if ($tugas->schedule_type === 'recurring' && $tugas->recurring_pattern) {
            // Create recurring schedule
            $this->createRecurringSchedule($tugas);
        }
    }

    /**
     * Create recurring schedule
     */
    private function createRecurringSchedule(Tugas $tugas): void
    {
        $pattern = $tugas->recurring_pattern;
        $frequency = $pattern['frequency'] ?? 'weekly';
        $interval = $pattern['interval'] ?? 1;
        $endDate = $pattern['endDate'] ?? null;

        // Calculate next occurrences
        $occurrences = $this->calculateOccurrences($frequency, $interval, $endDate);

        foreach ($occurrences as $date) {
            // Clone tugas for each occurrence
            $newTugas = $tugas->replicate();
            $newTugas->publish_at = $date;
            $newTugas->status = 'scheduled';
            $newTugas->save();

            // Schedule publication
            \App\Jobs\PublishTugasJob::dispatch($newTugas)->delay($date);
        }
    }

    /**
     * Calculate recurring occurrences
     */
    private function calculateOccurrences(string $frequency, int $interval, ?string $endDate): array
    {
        $occurrences = [];
        $current = now();
        $end = $endDate ? \Carbon\Carbon::parse($endDate) : $current->copy()->addYear();

        while ($current->lte($end) && count($occurrences) < 52) { // Max 52 occurrences
            switch ($frequency) {
                case 'daily':
                    $current->addDays($interval);
                    break;
                case 'weekly':
                    $current->addWeeks($interval);
                    break;
                case 'monthly':
                    $current->addMonths($interval);
                    break;
            }

            if ($current->lte($end)) {
                $occurrences[] = $current->copy();
            }
        }

        return $occurrences;
    }

    /**
     * Process reminder notifications
     */
    public function processReminders(): void
    {
        $reminders = TugasReminder::where('enabled', true)
            ->whereNull('sent_at')
            ->with('tugas')
            ->get();

        foreach ($reminders as $reminder) {
            $tugas = $reminder->tugas;
            $deadline = \Carbon\Carbon::parse($tugas->deadline);
            $now = now();

            // Calculate when to send reminder
            $sendAt = match($reminder->unit) {
                'minutes' => $deadline->copy()->subMinutes($reminder->value),
                'hours' => $deadline->copy()->subHours($reminder->value),
                'days' => $deadline->copy()->subDays($reminder->value),
                'weeks' => $deadline->copy()->subWeeks($reminder->value),
            };

            // Send if time has come
            if ($now->gte($sendAt) && $now->lt($deadline)) {
                \App\Jobs\SendTugasReminderJob::dispatch($tugas, $reminder);
                $reminder->update(['sent_at' => now()]);
            }
        }
    }
}
```


### E. Template Service Implementation

```php
<?php

namespace App\Services;

use App\Models\TugasTemplate;

class TugasTemplateService
{
    /**
     * Get user's templates
     */
    public function getUserTemplates(int $userId): array
    {
        return TugasTemplate::where('user_id', $userId)
            ->orderBy('is_favorite', 'desc')
            ->orderBy('usage_count', 'desc')
            ->get()
            ->toArray();
    }

    /**
     * Save task as template
     */
    public function saveAsTemplate(int $userId, array $data): TugasTemplate
    {
        return TugasTemplate::create([
            'user_id' => $userId,
            'name' => $data['name'],
            'description' => $data['description'] ?? '',
            'category' => $data['category'],
            'fields' => [
                'title_pattern' => $data['title_pattern'] ?? '',
                'description_template' => $data['description_template'] ?? '',
                'default_duration' => $data['default_duration'] ?? 7,
                'default_priority' => $data['default_priority'] ?? 'Sedang',
                'attachments' => $data['attachments'] ?? [],
            ],
        ]);
    }

    /**
     * Apply template to new task
     */
    public function applyTemplate(int $templateId): array
    {
        $template = TugasTemplate::findOrFail($templateId);
        
        // Increment usage count
        $template->increment('usage_count');
        $template->update(['last_used_at' => now()]);

        return [
            'title' => $template->fields['title_pattern'] ?? '',
            'description' => $template->fields['description_template'] ?? '',
            'category' => $template->category,
            'priority' => $template->fields['default_priority'] ?? 'Sedang',
            'estimated_hours' => $template->fields['default_duration'] ?? 7,
        ];
    }

    /**
     * Toggle template favorite
     */
    public function toggleFavorite(int $templateId): bool
    {
        $template = TugasTemplate::findOrFail($templateId);
        $template->update(['is_favorite' => !$template->is_favorite]);
        return $template->is_favorite;
    }

    /**
     * Delete template
     */
    public function deleteTemplate(int $templateId): void
    {
        TugasTemplate::findOrFail($templateId)->delete();
    }
}
```

---

## 📱 ROUTES CONFIGURATION

```php
// routes/web.php

// Dosen Routes
Route::middleware(['auth', 'role:dosen'])->prefix('dosen')->name('dosen.')->group(function () {
    Route::get('/tugas/create', [TugasCreateController::class, 'index'])->name('tugas.create');
    Route::post('/tugas', [TugasCreateController::class, 'store'])->name('tugas.store');
    Route::post('/tugas/bulk', [TugasCreateController::class, 'bulkStore'])->name('tugas.bulk-store');
    
    // AI Endpoints
    Route::post('/tugas/ai/suggest-title', [TugasAIController::class, 'suggestTitle']);
    Route::post('/tugas/ai/generate-description', [TugasAIController::class, 'generateDescription']);
    Route::post('/tugas/ai/predict-deadline', [TugasAIController::class, 'predictDeadline']);
    
    // Template Endpoints
    Route::get('/tugas/templates', [TugasTemplateController::class, 'index']);
    Route::post('/tugas/templates', [TugasTemplateController::class, 'store']);
    Route::post('/tugas/templates/{id}/apply', [TugasTemplateController::class, 'apply']);
    Route::patch('/tugas/templates/{id}/favorite', [TugasTemplateController::class, 'toggleFavorite']);
    Route::delete('/tugas/templates/{id}', [TugasTemplateController::class, 'destroy']);
    
    // Bulk Import
    Route::post('/tugas/bulk/preview', [TugasBulkController::class, 'preview']);
    Route::post('/tugas/bulk/import', [TugasBulkController::class, 'import']);
    Route::get('/tugas/bulk/template', [TugasBulkController::class, 'downloadTemplate']);
    
    // File Upload
    Route::post('/tugas/upload', [TugasFileController::class, 'upload']);
});

// Mahasiswa Routes
Route::middleware(['auth', 'role:mahasiswa'])->prefix('user/akademik')->name('user.akademik.')->group(function () {
    Route::get('/tugas/create', [UserTugasCreateController::class, 'index'])->name('tugas.create');
    Route::post('/tugas', [UserTugasCreateController::class, 'store'])->name('tugas.store');
    // Similar endpoints as dosen but for personal tasks
});
```

---

## 🎯 IMPLEMENTATION CHECKLIST

### ✅ Frontend Components
- [ ] Multi-step form with progress indicator
- [ ] AI-powered smart suggestions
- [ ] Template library & quick templates
- [ ] Bulk creation (CSV import & form array)
- [ ] Schedule automation (immediate, scheduled, recurring)
- [ ] Smart reminder system
- [ ] Rich text editor (TipTap)
- [ ] Smart file upload with preview
- [ ] Task dependencies selector
- [ ] Collaboration settings (group work, peer review)
- [ ] Header matching admin dashboard
- [ ] Floating icons animations
- [ ] Glassmorphism containers
- [ ] Mobile responsive

### ✅ Backend Services
- [ ] TugasCreateController
- [ ] TugasAIService
- [ ] TugasAutomationService
- [ ] TugasTemplateService
- [ ] Database migrations
- [ ] API routes
- [ ] Queue jobs (PublishTugasJob, SendReminderJob)

### ✅ Database Tables
- [ ] tugas (updated columns)
- [ ] tugas_templates
- [ ] tugas_dependencies
- [ ] tugas_reminders
- [ ] tugas_attachments


---

## 🎨 COMPLETE PAGE STRUCTURE

### Main Page Layout
```typescript
export default function TugasCreate() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<TugasFormData>({});
  const [showTemplates, setShowTemplates] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);

  return (
    <DosenLayout>
      <Head title="Tambah Tugas Baru" />

      <div className="space-y-6 p-4 md:p-6 lg:p-8">
        {/* ═══════ HEADER ═══════ */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-3xl p-5 text-white shadow-2xl sm:p-6 md:p-8"
        >
          {/* Animated Gradient Background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
            animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            style={{ backgroundSize: '200% 200%' }}
          />

          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          {/* Floating icons */}
          {[Plus, FileText, Calendar, Users, Sparkles].map((Icon, i) => (
            <motion.div
              key={i}
              className="absolute text-white/20"
              animate={{
                y: [0, -20, 0],
                x: [0, Math.sin(i) * 10, 0],
                rotate: [0, 360],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2,
              }}
              style={{
                left: `${15 + i * 18}%`,
                top: `${20 + (i % 2) * 40}%`,
              }}
            >
              <Icon className="h-8 w-8" />
            </motion.div>
          ))}

          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02, x: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.visit('/dosen/tugas')}
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Daftar Tugas
            </motion.button>

            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:gap-6 sm:text-left">
                <motion.div
                  className="relative flex h-20 w-20 shrink-0 sm:h-24 sm:w-24"
                  initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                  whileHover={{ scale: 1.05, rotate: 4 }}
                >
                  <Plus className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]" />
                </motion.div>
                
                <div className="flex-1">
                  <motion.p
                    className="text-sm font-medium tracking-wide text-indigo-100"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Create New Assignment
                  </motion.p>
                  <motion.h1
                    className="mt-1 text-2xl font-bold text-white sm:text-3xl"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    Tambah Tugas Baru
                  </motion.h1>
                  <motion.p
                    className="mt-2 max-w-xl text-sm leading-relaxed text-indigo-100 sm:text-base"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    Buat tugas baru dengan fitur automasi cerdas dan AI-powered suggestions
                  </motion.p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:items-end">
                <Button
                  variant="outline"
                  onClick={() => setShowTemplates(true)}
                  className="gap-2 border-white/20 bg-white/20 text-white hover:bg-white/30"
                >
                  <Layers className="h-4 w-4" />
                  Use Template
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowBulkImport(true)}
                  className="gap-2 border-white/20 bg-white/20 text-white hover:bg-white/30"
                >
                  <Upload className="h-4 w-4" />
                  Bulk Import
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══════ PROGRESS STEPS ═══════ */}
        <MultiStepProgress currentStep={currentStep} totalSteps={4} />

        {/* ═══════ FORM CONTENT ═══════ */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl"
        >
          {currentStep === 1 && <Step1BasicInfo formData={formData} setFormData={setFormData} />}
          {currentStep === 2 && <Step2Details formData={formData} setFormData={setFormData} />}
          {currentStep === 3 && <Step3Attachments formData={formData} setFormData={setFormData} />}
          {currentStep === 4 && <Step4Automation formData={formData} setFormData={setFormData} />}

          {/* Navigation Buttons */}
          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            {currentStep < 4 ? (
              <Button onClick={() => setCurrentStep(currentStep + 1)}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Create Task
              </Button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <TemplateLibraryModal show={showTemplates} onClose={() => setShowTemplates(false)} />
      <BulkImportModal show={showBulkImport} onClose={() => setShowBulkImport(false)} />
    </DosenLayout>
  );
}
```

---

## 🎉 EXPECTED RESULTS

Setelah implementasi lengkap, halaman Tambah Tugas Baru akan memiliki:

### ✅ User Experience
- Multi-step form yang intuitive dengan progress indicator
- AI suggestions yang membantu mempercepat pembuatan tugas
- Template system untuk reuse tugas yang sering dibuat
- Bulk creation untuk efisiensi waktu
- Schedule automation untuk publish otomatis
- Smart reminders untuk notifikasi
- Rich text editor untuk deskripsi yang lengkap
- Drag & drop file upload yang mudah

### ✅ Design & UI
- 100% matching admin dashboard (gradient, colors, animations)
- Floating icons animation yang smooth
- Glassmorphism containers
- Responsive mobile design
- Smooth transitions dan animations
- Loading states dan progress indicators

### ✅ Technical Features
- AI-powered suggestions (title, description, deadline)
- Template library dengan favorites
- Bulk import dari CSV
- Schedule automation (immediate, scheduled, recurring)
- Smart reminder system
- Task dependencies
- Collaboration settings (group work, peer review)
- File attachments dengan preview
- Real-time validation

### ✅ Backend Integration
- RESTful API endpoints
- Service layer architecture
- Queue jobs untuk automation
- Database relationships
- File storage management
- Error handling
- Validation

---

## 📚 ADDITIONAL NOTES

### Performance Optimization
- Lazy load components
- Debounce AI suggestions
- Optimize file uploads with compression
- Cache templates
- Index database queries

### Security
- Validate all inputs
- Sanitize rich text content
- Secure file uploads
- Rate limit AI endpoints
- CSRF protection

### Accessibility
- Keyboard navigation
- Screen reader support
- Focus management
- ARIA labels
- Color contrast

---

**GOOD LUCK WITH THE IMPLEMENTATION! 🚀✨📝**

