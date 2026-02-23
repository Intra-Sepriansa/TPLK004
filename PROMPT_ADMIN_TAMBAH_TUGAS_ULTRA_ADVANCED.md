# 📝 PROMPT ULTRA ADVANCED: ADMIN TAMBAH TUGAS
## Full Page Create Assignment dengan UI/UX Dashboard Admin Style

---

## 📋 OVERVIEW SISTEM

### Tujuan Halaman
Halaman **Tambah Tugas** adalah interface full-page yang memungkinkan admin/dosen untuk membuat tugas akademik dengan fitur:
- Form wizard multi-step yang intuitive
- Rich text editor untuk deskripsi tugas
- File attachment dengan drag & drop
- Auto-save draft functionality
- Template tugas yang dapat digunakan kembali
- Preview sebelum publish
- Scheduling & deadline management
- Rubrik penilaian yang customizable
- Notifikasi otomatis ke mahasiswa

### Color Scheme (Dashboard Admin Theme)
```typescript
const tugasColors = {
  primary: {
    indigo: '#6366f1',      // Indigo 500
    indigoDark: '#4f46e5',  // Indigo 600
    indigoLight: '#818cf8', // Indigo 400
    indigoGlow: 'rgba(99, 102, 241, 0.3)',
  },
  secondary: {
    purple: '#8b5cf6',      // Purple 500
    pink: '#ec4899',        // Pink 500
    blue: '#3b82f6',        // Blue 500
  },
  gradients: {
    main: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
    soft: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
    card: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
    header: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
  },
  backgrounds: {
    dark: '#0f172a',
    darker: '#020617',
    card: '#1e293b',
    cardHover: '#334155',
  },
  status: {
    draft: '#64748b',       // Slate
    published: '#10b981',   // Emerald
    scheduled: '#3b82f6',   // Blue
    archived: '#6b7280',    // Gray
  }
}
```

---

## 🎨 LAYOUT STRUCTURE

### Full Page Layout
```
┌─────────────────────────────────────────────────────────────┐
│  HEADER BAR (Fixed Top - Gradient)                          │
│  - Back Button                                              │
│  - Page Title & Icon                                        │
│  - Progress Indicator (Step 1/5)                            │
│  - Action Buttons (Save Draft, Preview, Publish)            │
└─────────────────────────────────────────────────────────────┘
│
├─ MAIN CONTENT (Grid 2 Columns)                              │
│  ┌─────────────────────────┬─────────────────────────────┐ │
│  │ LEFT COLUMN (70%)       │ RIGHT COLUMN (30%)          │ │
│  │                         │                             │ │
│  │ ┌─────────────────────┐ │ ┌─────────────────────────┐ │ │
│  │ │ STEP WIZARD         │ │ │ QUICK INFO CARD         │ │ │
│  │ │ - Step Indicators   │ │ │ - Course Info           │ │ │
│  │ │ - Active Step Form  │ │ │ - Deadline Countdown    │ │ │
│  │ └─────────────────────┘ │ │ - Points/Weight         │ │ │
│  │                         │ └─────────────────────────┘ │ │
│  │ ┌─────────────────────┐ │                             │ │
│  │ │ FORM CONTENT        │ │ ┌─────────────────────────┐ │ │
│  │ │ Step 1: Basic Info  │ │ │ TEMPLATE LIBRARY        │ │ │
│  │ │ Step 2: Description │ │ │ - Quick Templates       │ │ │
│  │ │ Step 3: Attachments │ │ │ - Recent Templates      │ │ │
│  │ │ Step 4: Rubric      │ │ │ - Custom Templates      │ │ │
│  │ │ Step 5: Settings    │ │ └─────────────────────────┘ │ │
│  │ └─────────────────────┘ │                             │ │
│  │                         │ ┌─────────────────────────┐ │ │
│  │ ┌─────────────────────┐ │ │ TIPS & GUIDELINES       │ │ │
│  │ │ NAVIGATION BUTTONS  │ │ │ - Best Practices        │ │ │
│  │ │ - Previous Step     │ │ │ - Common Mistakes       │ │ │
│  │ │ - Next Step         │ │ │ - Help Resources        │ │ │
│  │ │ - Skip Step         │ │ └─────────────────────────┘ │ │
│  │ └─────────────────────┘ │                             │ │
│  └─────────────────────────┴─────────────────────────────┘ │
│
└─ FOOTER BAR (Fixed Bottom)                                 │
   - Auto-save Status                                        │
   - Last Saved Time                                         │
   - Character/Word Count                                    │
```

---

## 🎯 COMPONENT DETAILS

### 1. HEADER BAR COMPONENT

#### Design Specifications
```tsx
interface HeaderBarProps {
  currentStep: number;
  totalSteps: number;
  isDraft: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  onBack: () => void;
  onSaveDraft: () => Promise<void>;
  onPreview: () => void;
  onPublish: () => Promise<void>;
}
```

#### Implementation
```tsx
const TugasHeader: React.FC<HeaderBarProps> = ({
  currentStep,
  totalSteps,
  isDraft,
  isSaving,
  lastSaved,
  onBack,
  onSaveDraft,
  onPreview,
  onPublish
}) => {
  return (
    <div className="fixed top-0 left-0 right-0 h-20 z-50 
      bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500
      border-b border-white/10 shadow-lg shadow-indigo-500/20">
      
      <div className="container mx-auto h-full px-6 flex items-center justify-between">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-4">
          <motion.button
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </motion.button>
          
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm 
              border border-white/20">
              <FileText className="w-6 h-6 text-white" />
            </div>
            
            {/* Title & Progress */}
            <div>
              <h1 className="text-xl font-bold text-white">
                Buat Tugas Baru
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-indigo-100">
                  Langkah {currentStep} dari {totalSteps}
                </span>
                {isDraft && (
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-200 
                    text-xs rounded-full border border-amber-400/30">
                    Draft
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Center: Progress Bar */}
        <div className="hidden md:flex items-center gap-2 flex-1 max-w-md mx-8">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div key={index} className="flex-1">
              <div className={`
                h-2 rounded-full transition-all duration-500
                ${index < currentStep 
                  ? 'bg-white' 
                  : index === currentStep 
                  ? 'bg-white/60' 
                  : 'bg-white/20'
                }
              `} />
            </div>
          ))}
        </div>
        
        {/* Right: Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Auto-save Indicator */}
          {isSaving && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/10 
                rounded-lg backdrop-blur-sm"
            >
              <Loader2 className="w-4 h-4 text-white animate-spin" />
              <span className="text-sm text-white">Menyimpan...</span>
            </motion.div>
          )}
          
          {lastSaved && !isSaving && (
            <div className="text-sm text-indigo-100">
              Tersimpan {formatDistanceToNow(lastSaved, { locale: id })}
            </div>
          )}
          
          {/* Save Draft Button */}
          <motion.button
            onClick={onSaveDraft}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 
              rounded-xl text-white font-medium transition-all 
              border border-white/20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              <span>Simpan Draft</span>
            </div>
          </motion.button>
          
          {/* Preview Button */}
          <motion.button
            onClick={onPreview}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 
              rounded-xl text-white font-medium transition-all 
              border border-white/20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </div>
          </motion.button>
          
          {/* Publish Button */}
          <motion.button
            onClick={onPublish}
            className="group relative px-6 py-2 bg-white rounded-xl 
              text-indigo-600 font-bold shadow-lg shadow-white/20 
              hover:shadow-white/30 transition-all overflow-hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Shine Effect */}
            <div className="absolute inset-0 translate-x-[-100%] 
              group-hover:translate-x-[100%] bg-gradient-to-r 
              from-transparent via-white/30 to-transparent 
              transition-transform duration-1000" />
            
            <div className="relative flex items-center gap-2">
              <Send className="w-4 h-4" />
              <span>Publikasikan</span>
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
};
```

---

### 2. STEP WIZARD COMPONENT

```tsx
interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType;
  isCompleted: boolean;
  isActive: boolean;
}

const StepWizard: React.FC<{ steps: Step[]; currentStep: number }> = ({
  steps,
  currentStep
}) => {
  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 
      border border-slate-700 rounded-2xl p-6 mb-6">
      
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = step.isCompleted;
          
          return (
            <React.Fragment key={step.id}>
              {/* Step Item */}
              <motion.div
                className="flex flex-col items-center gap-3 flex-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Step Circle */}
                <motion.div
                  className={`
                    relative w-16 h-16 rounded-full flex items-center 
                    justify-center transition-all duration-300
                    ${isActive 
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/50' 
                      : isCompleted
                      ? 'bg-emerald-500'
                      : 'bg-slate-700'
                    }
                  `}
                  whileHover={{ scale: 1.1 }}
                  animate={isActive ? {
                    boxShadow: [
                      '0 0 20px rgba(99, 102, 241, 0.5)',
                      '0 0 40px rgba(99, 102, 241, 0.8)',
                      '0 0 20px rgba(99, 102, 241, 0.5)',
                    ]
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-8 h-8 text-white" />
                  ) : (
                    <Icon className="w-8 h-8 text-white" />
                  )}
                  
                  {/* Step Number Badge */}
                  {!isCompleted && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 
                      bg-white rounded-full flex items-center justify-center 
                      text-xs font-bold text-indigo-600">
                      {step.id}
                    </div>
                  )}
                </motion.div>
                
                {/* Step Info */}
                <div className="text-center">
                  <div className={`
                    text-sm font-semibold transition-colors
                    ${isActive ? 'text-white' : 'text-slate-400'}
                  `}>
                    {step.title}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {step.description}
                  </div>
                </div>
              </motion.div>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-4 relative">
                  <div className="absolute inset-0 bg-slate-700" />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r 
                      from-indigo-500 to-purple-600"
                    initial={{ scaleX: 0 }}
                    animate={{ 
                      scaleX: isCompleted ? 1 : 0 
                    }}
                    transition={{ duration: 0.5 }}
                    style={{ transformOrigin: 'left' }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
```

---

### 3. STEP 1: BASIC INFO FORM

```tsx
const Step1BasicInfo: React.FC = () => {
  const form = useForm({
    course_id: '',
    title: '',
    type: 'assignment',
    category: 'individual',
    points: 100,
    weight: 10,
  });
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      {/* Course Selection */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 
        border border-slate-700 rounded-2xl p-6">
        
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-500/10 rounded-xl">
            <BookOpen className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Mata Kuliah
            </h3>
            <p className="text-sm text-slate-400">
              Pilih mata kuliah untuk tugas ini
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {courses.map((course) => (
            <motion.button
              key={course.id}
              onClick={() => form.setData('course_id', course.id)}
              className={`
                p-4 rounded-xl border-2 transition-all text-left
                ${form.data.course_id === course.id
                  ? 'bg-indigo-500/20 border-indigo-500 shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center
                    ${form.data.course_id === course.id
                      ? 'bg-indigo-500'
                      : 'bg-slate-700'
                    }
                  `}>
                    <span className="text-white font-bold text-lg">
                      {course.code}
                    </span>
                  </div>
                  <div>
                    <div className="text-white font-semibold">
                      {course.name}
                    </div>
                    <div className="text-sm text-slate-400">
                      {course.semester} • {course.sks} SKS
                    </div>
                  </div>
                </div>
                
                {form.data.course_id === course.id && (
                  <CheckCircle className="w-6 h-6 text-indigo-400" />
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
      
      {/* Title Input */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 
        border border-slate-700 rounded-2xl p-6">
        
        <Label className="flex items-center gap-2 text-white mb-3">
          <Type className="w-5 h-5 text-indigo-400" />
          Judul Tugas
          <span className="text-red-400">*</span>
        </Label>
        
        <Input
          type="text"
          value={form.data.title}
          onChange={(e) => form.setData('title', e.target.value)}
          placeholder="Contoh: Analisis Sistem Informasi Perpustakaan"
          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 
            rounded-xl text-white placeholder-slate-500
            focus:outline-none focus:ring-2 focus:ring-indigo-500/50 
            focus:border-indigo-500/50 transition-all"
        />
        
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-slate-500">
            Gunakan judul yang jelas dan deskriptif
          </p>
          <span className="text-xs text-slate-500">
            {form.data.title.length}/200
          </span>
        </div>
      </div>
      
      {/* Type & Category */}
      <div className="grid grid-cols-2 gap-6">
        {/* Type Selection */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 
          border border-slate-700 rounded-2xl p-6">
          
          <Label className="flex items-center gap-2 text-white mb-3">
            <FileText className="w-5 h-5 text-indigo-400" />
            Jenis Tugas
          </Label>
          
          <div className="space-y-2">
            {[
              { value: 'assignment', label: 'Tugas Biasa', icon: FileText },
              { value: 'quiz', label: 'Kuis', icon: HelpCircle },
              { value: 'project', label: 'Proyek', icon: Briefcase },
              { value: 'presentation', label: 'Presentasi', icon: Presentation },
            ].map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => form.setData('type', type.value)}
                  className={`
                    w-full flex items-center gap-3 p-3 rounded-xl 
                    border-2 transition-all
                    ${form.data.type === type.value
                      ? 'bg-indigo-500/20 border-indigo-500'
                      : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                    }
                  `}
                >
                  <Icon className={`
                    w-5 h-5
                    ${form.data.type === type.value
                      ? 'text-indigo-400'
                      : 'text-slate-400'
                    }
                  `} />
                  <span className={`
                    font-medium
                    ${form.data.type === type.value
                      ? 'text-white'
                      : 'text-slate-300'
                    }
                  `}>
                    {type.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Category Selection */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 
          border border-slate-700 rounded-2xl p-6">
          
          <Label className="flex items-center gap-2 text-white mb-3">
            <Users className="w-5 h-5 text-indigo-400" />
            Kategori
          </Label>
          
          <div className="space-y-2">
            {[
              { value: 'individual', label: 'Individual', icon: User },
              { value: 'group', label: 'Kelompok', icon: Users },
            ].map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.value}
                  onClick={() => form.setData('category', category.value)}
                  className={`
                    w-full flex items-center gap-3 p-3 rounded-xl 
                    border-2 transition-all
                    ${form.data.category === category.value
                      ? 'bg-indigo-500/20 border-indigo-500'
                      : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                    }
                  `}
                >
                  <Icon className={`
                    w-5 h-5
                    ${form.data.category === category.value
                      ? 'text-indigo-400'
                      : 'text-slate-400'
                    }
                  `} />
                  <span className={`
                    font-medium
                    ${form.data.category === category.value
                      ? 'text-white'
                      : 'text-slate-300'
                    }
                  `}>
                    {category.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Points & Weight */}
      <div className="grid grid-cols-2 gap-6">
        {/* Points */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 
          border border-slate-700 rounded-2xl p-6">
          
          <Label className="flex items-center gap-2 text-white mb-3">
            <Award className="w-5 h-5 text-indigo-400" />
            Total Poin
          </Label>
          
          <div className="relative">
            <Input
              type="number"
              value={form.data.points}
              onChange={(e) => form.setData('points', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 
                rounded-xl text-white
                focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 
              text-slate-400">
              poin
            </div>
          </div>
        </div>
        
        {/* Weight */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 
          border border-slate-700 rounded-2xl p-6">
          
          <Label className="flex items-center gap-2 text-white mb-3">
            <Percent className="w-5 h-5 text-indigo-400" />
            Bobot Nilai
          </Label>
          
          <div className="relative">
            <Input
              type="number"
              value={form.data.weight}
              onChange={(e) => form.setData('weight', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 
                rounded-xl text-white
                focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 
              text-slate-400">
              %
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
```

---

### 4. STEP 2: DESKRIPSI & MATERI

```tsx
const Step2Description: React.FC = () => {
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      {/* Rich Text Editor */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 
        border border-slate-700 rounded-2xl p-6">
        
        <Label className="flex items-center gap-2 text-white mb-3">
          <FileText className="w-5 h-5 text-indigo-400" />
          Deskripsi Tugas
          <span className="text-red-400">*</span>
        </Label>
        
        <p className="text-sm text-slate-400 mb-4">
          Jelaskan detail tugas, tujuan pembelajaran, dan instruksi pengerjaan
        </p>
        
        {/* Rich Text Editor Toolbar */}
        <div className="flex items-center gap-2 p-3 bg-slate-900/50 
          border border-slate-700 rounded-t-xl">
          <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <Bold className="w-4 h-4 text-slate-400" />
          </button>
          <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <Italic className="w-4 h-4 text-slate-400" />
          </button>
          <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <Underline className="w-4 h-4 text-slate-400" />
          </button>
          <div className="w-px h-6 bg-slate-700" />
          <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <List className="w-4 h-4 text-slate-400" />
          </button>
          <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <ListOrdered className="w-4 h-4 text-slate-400" />
          </button>
          <div className="w-px h-6 bg-slate-700" />
          <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <Link2 className="w-4 h-4 text-slate-400" />
          </button>
          <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <Image className="w-4 h-4 text-slate-400" />
          </button>
          <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <Code className="w-4 h-4 text-slate-400" />
          </button>
        </div>
        
        {/* Editor Area */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tulis deskripsi tugas di sini..."
          className="w-full min-h-[300px] px-4 py-3 bg-slate-900/50 
            border border-slate-700 border-t-0 rounded-b-xl text-white 
            placeholder-slate-500 focus:outline-none focus:ring-2 
            focus:ring-indigo-500/50 resize-none"
        />
        
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-slate-500">
            Gunakan Markdown untuk formatting
          </p>
          <span className="text-xs text-slate-500">
            {description.length} karakter
          </span>
        </div>
      </div>
      
      {/* File Attachments */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 
        border border-slate-700 rounded-2xl p-6">
        
        <Label className="flex items-center gap-2 text-white mb-3">
          <Paperclip className="w-5 h-5 text-indigo-400" />
          Lampiran Materi
        </Label>
        
        <p className="text-sm text-slate-400 mb-4">
          Upload file pendukung seperti PDF, dokumen, atau gambar
        </p>
        
        {/* Drag & Drop Zone */}
        <div className="border-2 border-dashed border-slate-600 
          hover:border-indigo-500 rounded-xl p-8 text-center 
          transition-all cursor-pointer group">
          <Upload className="w-12 h-12 text-slate-500 group-hover:text-indigo-400 
            mx-auto mb-3 transition-colors" />
          <p className="text-white font-medium mb-1">
            Drag & drop file di sini
          </p>
          <p className="text-sm text-slate-400 mb-3">
            atau klik untuk browse
          </p>
          <p className="text-xs text-slate-500">
            Maksimal 10 file, masing-masing 25MB
          </p>
        </div>
        
        {/* Uploaded Files List */}
        {attachments.length > 0 && (
          <div className="mt-4 space-y-2">
            {attachments.map((file, index) => (
              <div key={index} 
                className="flex items-center justify-between p-3 
                bg-slate-900/50 border border-slate-700 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 rounded-lg">
                    <FileText className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <div className="text-sm text-white font-medium">
                      {file.name}
                    </div>
                    <div className="text-xs text-slate-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>
                <button className="p-2 hover:bg-red-500/10 rounded-lg 
                  transition-colors">
                  <X className="w-4 h-4 text-red-400" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Learning Objectives */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 
        border border-slate-700 rounded-2xl p-6">
        
        <Label className="flex items-center gap-2 text-white mb-3">
          <Target className="w-5 h-5 text-indigo-400" />
          Tujuan Pembelajaran
        </Label>
        
        <p className="text-sm text-slate-400 mb-4">
          Apa yang diharapkan mahasiswa pelajari dari tugas ini?
        </p>
        
        <div className="space-y-3">
          {[1, 2, 3].map((num) => (
            <Input
              key={num}
              placeholder={`Tujuan pembelajaran ${num}`}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 
                rounded-xl text-white placeholder-slate-500
                focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          ))}
          
          <button className="flex items-center gap-2 text-indigo-400 
            hover:text-indigo-300 text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            <span>Tambah Tujuan</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
```

---

### 5. STEP 3: PENGATURAN PENILAIAN

```tsx
const Step3Grading: React.FC = () => {
  const [rubrics, setRubrics] = useState([
    { id: 1, criteria: '', maxScore: 0, weight: 0 }
  ]);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      {/* Grading Method */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 
        border border-slate-700 rounded-2xl p-6">
        
        <Label className="flex items-center gap-2 text-white mb-3">
          <Award className="w-5 h-5 text-indigo-400" />
          Metode Penilaian
        </Label>
        
        <div className="grid grid-cols-2 gap-4">
          {[
            { value: 'rubric', label: 'Rubrik Penilaian', icon: ClipboardList },
            { value: 'points', label: 'Poin Langsung', icon: Award },
          ].map((method) => {
            const Icon = method.icon;
            return (
              <button
                key={method.value}
                className="flex items-center gap-3 p-4 rounded-xl 
                  border-2 border-indigo-500 bg-indigo-500/20 
                  transition-all"
              >
                <Icon className="w-5 h-5 text-indigo-400" />
                <span className="font-medium text-white">
                  {method.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Rubric Builder */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 
        border border-slate-700 rounded-2xl p-6">
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Rubrik Penilaian
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Buat kriteria penilaian yang detail
            </p>
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 
            bg-indigo-500/10 hover:bg-indigo-500/20 border 
            border-indigo-500/30 rounded-xl text-indigo-400 
            transition-all">
            <Plus className="w-4 h-4" />
            <span>Tambah Kriteria</span>
          </button>
        </div>
        
        {/* Rubric Items */}
        <div className="space-y-4">
          {rubrics.map((rubric, index) => (
            <div key={rubric.id} 
              className="p-4 bg-slate-900/50 border border-slate-700 
              rounded-xl">
              
              <div className="flex items-start gap-4">
                <div className="flex-1 space-y-3">
                  <Input
                    placeholder="Nama kriteria (contoh: Kelengkapan Analisis)"
                    className="w-full px-4 py-2 bg-slate-800/50 border 
                      border-slate-600 rounded-lg text-white"
                  />
                  
                  <textarea
                    placeholder="Deskripsi kriteria penilaian..."
                    className="w-full px-4 py-2 bg-slate-800/50 border 
                      border-slate-600 rounded-lg text-white min-h-[80px]"
                  />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-slate-400 mb-1">
                        Skor Maksimal
                      </Label>
                      <Input
                        type="number"
                        placeholder="0"
                        className="w-full px-3 py-2 bg-slate-800/50 border 
                          border-slate-600 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-400 mb-1">
                        Bobot (%)
                      </Label>
                      <Input
                        type="number"
                        placeholder="0"
                        className="w-full px-3 py-2 bg-slate-800/50 border 
                          border-slate-600 rounded-lg text-white"
                      />
                    </div>
                  </div>
                </div>
                
                <button className="p-2 hover:bg-red-500/10 rounded-lg 
                  transition-colors">
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Total Summary */}
        <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/30 
          rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-white font-medium">Total Bobot</span>
            <span className="text-2xl font-bold text-indigo-400">100%</span>
          </div>
        </div>
      </div>
      
      {/* Late Submission Policy */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 
        border border-slate-700 rounded-2xl p-6">
        
        <Label className="flex items-center gap-2 text-white mb-3">
          <Clock className="w-5 h-5 text-indigo-400" />
          Kebijakan Keterlambatan
        </Label>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-slate-600 
                bg-slate-800 text-indigo-500"
            />
            <span className="text-slate-300">
              Terima pengumpulan terlambat
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-slate-400 mb-2">
                Pengurangan Poin
              </Label>
              <Input
                type="number"
                placeholder="10"
                className="w-full px-4 py-2 bg-slate-900/50 border 
                  border-slate-700 rounded-xl text-white"
              />
            </div>
            <div>
              <Label className="text-sm text-slate-400 mb-2">
                Per Hari
              </Label>
              <Input
                type="number"
                placeholder="1"
                className="w-full px-4 py-2 bg-slate-900/50 border 
                  border-slate-700 rounded-xl text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
```


---

### 6. STEP 4: PENGATURAN MAHASISWA

```tsx
const Step4Students: React.FC = () => {
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [groupMode, setGroupMode] = useState<'all' | 'select' | 'group'>('all');
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      {/* Assignment Mode */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 
        border border-slate-700 rounded-2xl p-6">
        
        <Label className="flex items-center gap-2 text-white mb-4">
          <Users className="w-5 h-5 text-indigo-400" />
          Mode Penugasan
        </Label>
        
        <div className="grid grid-cols-3 gap-4">
          {[
            { 
              value: 'all', 
              label: 'Semua Mahasiswa', 
              icon: Users,
              desc: 'Tugas untuk seluruh kelas'
            },
            { 
              value: 'select', 
              label: 'Pilih Manual', 
              icon: UserCheck,
              desc: 'Pilih mahasiswa tertentu'
            },
            { 
              value: 'group', 
              label: 'Per Kelompok', 
              icon: UsersRound,
              desc: 'Berdasarkan kelompok'
            },
          ].map((mode) => {
            const Icon = mode.icon;
            const isActive = groupMode === mode.value;
            
            return (
              <button
                key={mode.value}
                onClick={() => setGroupMode(mode.value)}
                className={`
                  p-4 rounded-xl border-2 transition-all text-left
                  ${isActive
                    ? 'bg-indigo-500/20 border-indigo-500'
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                  }
                `}
              >
                <Icon className={`
                  w-6 h-6 mb-3
                  ${isActive ? 'text-indigo-400' : 'text-slate-400'}
                `} />
                <div className={`
                  font-semibold mb-1
                  ${isActive ? 'text-white' : 'text-slate-300'}
                `}>
                  {mode.label}
                </div>
                <div className="text-xs text-slate-500">
                  {mode.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Student Selection (if mode is 'select') */}
      {groupMode === 'select' && (
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 
          border border-slate-700 rounded-2xl p-6">
          
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">
              Pilih Mahasiswa
            </h3>
            <span className="text-sm text-slate-400">
              {selectedStudents.length} dipilih
            </span>
          </div>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 
              w-4 h-4 text-slate-400" />
            <Input
              placeholder="Cari mahasiswa..."
              className="w-full pl-10 px-4 py-2 bg-slate-900/50 border 
                border-slate-700 rounded-xl text-white"
            />
          </div>
          
          {/* Student List */}
          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {students.map((student) => (
              <div
                key={student.id}
                className="flex items-center gap-3 p-3 bg-slate-900/50 
                  border border-slate-700 rounded-xl hover:border-indigo-500/50 
                  transition-all cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(student.id)}
                  onChange={() => {/* toggle */}}
                  className="w-4 h-4 rounded border-slate-600 
                    bg-slate-800 text-indigo-500"
                />
                <div className="w-10 h-10 rounded-full overflow-hidden 
                  bg-slate-700">
                  {student.foto && (
                    <img src={student.foto} alt={student.nama} 
                      className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium">
                    {student.nama}
                  </div>
                  <div className="text-xs text-slate-400">
                    {student.nim}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Group Selection (if mode is 'group') */}
      {groupMode === 'group' && (
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 
          border border-slate-700 rounded-2xl p-6">
          
          <h3 className="text-white font-semibold mb-4">
            Pilih Kelompok
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            {groups.map((group) => (
              <div
                key={group.id}
                className="p-4 bg-slate-900/50 border border-slate-700 
                  rounded-xl hover:border-indigo-500/50 transition-all 
                  cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-indigo-500/10 rounded-lg">
                    <UsersRound className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <div className="text-white font-medium">
                      {group.name}
                    </div>
                    <div className="text-xs text-slate-400">
                      {group.members.length} anggota
                    </div>
                  </div>
                </div>
                <div className="flex -space-x-2">
                  {group.members.slice(0, 5).map((member) => (
                    <div
                      key={member.id}
                      className="w-8 h-8 rounded-full border-2 
                        border-slate-800 bg-slate-700 overflow-hidden"
                    >
                      {member.foto && (
                        <img src={member.foto} alt={member.nama} />
                      )}
                    </div>
                  ))}
                  {group.members.length > 5 && (
                    <div className="w-8 h-8 rounded-full border-2 
                      border-slate-800 bg-slate-700 flex items-center 
                      justify-center text-xs text-slate-400">
                      +{group.members.length - 5}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
```

---

### 7. STEP 5: REVIEW & PUBLISH

```tsx
const Step5Review: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      {/* Preview Card */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 
        border border-slate-700 rounded-2xl p-6">
        
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-500/10 rounded-xl">
            <Eye className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Preview Tugas
            </h3>
            <p className="text-sm text-slate-400">
              Periksa kembali sebelum publikasi
            </p>
          </div>
        </div>
        
        {/* Summary Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-slate-900/50 rounded-xl">
            <div className="text-xs text-slate-400 mb-1">Mata Kuliah</div>
            <div className="text-white font-medium">
              Sistem Informasi Manajemen
            </div>
          </div>
          <div className="p-4 bg-slate-900/50 rounded-xl">
            <div className="text-xs text-slate-400 mb-1">Jenis Tugas</div>
            <div className="text-white font-medium">Tugas Biasa</div>
          </div>
          <div className="p-4 bg-slate-900/50 rounded-xl">
            <div className="text-xs text-slate-400 mb-1">Total Poin</div>
            <div className="text-white font-medium">100 poin</div>
          </div>
          <div className="p-4 bg-slate-900/50 rounded-xl">
            <div className="text-xs text-slate-400 mb-1">Bobot Nilai</div>
            <div className="text-white font-medium">10%</div>
          </div>
        </div>
        
        {/* Description Preview */}
        <div className="p-4 bg-slate-900/50 rounded-xl mb-4">
          <div className="text-xs text-slate-400 mb-2">Deskripsi</div>
          <div className="text-white text-sm line-clamp-3">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit...
          </div>
        </div>
        
        {/* Attachments */}
        <div className="p-4 bg-slate-900/50 rounded-xl">
          <div className="text-xs text-slate-400 mb-2">Lampiran</div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span className="text-white text-sm">3 file dilampirkan</span>
          </div>
        </div>
      </div>
      
      {/* Schedule Settings */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 
        border border-slate-700 rounded-2xl p-6">
        
        <Label className="flex items-center gap-2 text-white mb-4">
          <Calendar className="w-5 h-5 text-indigo-400" />
          Jadwal Publikasi
        </Label>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="radio"
              name="schedule"
              value="now"
              defaultChecked
              className="w-4 h-4 text-indigo-500"
            />
            <span className="text-slate-300">Publikasikan sekarang</span>
          </div>
          
          <div className="flex items-center gap-3">
            <input
              type="radio"
              name="schedule"
              value="later"
              className="w-4 h-4 text-indigo-500"
            />
            <span className="text-slate-300">Jadwalkan publikasi</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 ml-7">
            <div>
              <Label className="text-xs text-slate-400 mb-2">
                Tanggal Mulai
              </Label>
              <Input
                type="datetime-local"
                className="w-full px-4 py-2 bg-slate-900/50 border 
                  border-slate-700 rounded-xl text-white"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-400 mb-2">
                Deadline
              </Label>
              <Input
                type="datetime-local"
                className="w-full px-4 py-2 bg-slate-900/50 border 
                  border-slate-700 rounded-xl text-white"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Notification Settings */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 
        border border-slate-700 rounded-2xl p-6">
        
        <Label className="flex items-center gap-2 text-white mb-4">
          <Bell className="w-5 h-5 text-indigo-400" />
          Notifikasi
        </Label>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">
              Kirim notifikasi ke mahasiswa
            </span>
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 rounded border-slate-600 
                bg-slate-800 text-indigo-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">
              Kirim reminder H-1 deadline
            </span>
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 rounded border-slate-600 
                bg-slate-800 text-indigo-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">
              Notifikasi email
            </span>
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-slate-600 
                bg-slate-800 text-indigo-500"
            />
          </div>
        </div>
      </div>
      
      {/* Final Actions */}
      <div className="flex items-center gap-4">
        <button className="flex-1 px-6 py-3 bg-slate-700/50 hover:bg-slate-700 
          border border-slate-600 rounded-xl text-white font-medium 
          transition-all">
          Simpan sebagai Draft
        </button>
        <button className="flex-1 px-6 py-3 bg-gradient-to-r 
          from-indigo-600 to-purple-600 hover:from-indigo-700 
          hover:to-purple-700 rounded-xl text-white font-bold 
          shadow-lg shadow-indigo-500/30 transition-all">
          Publikasikan Tugas
        </button>
      </div>
    </motion.div>
  );
};
```


---

## 🎨 RIGHT SIDEBAR COMPONENTS

### 1. QUICK INFO CARD

```tsx
const QuickInfoCard: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 
      border border-slate-700 rounded-2xl p-6 sticky top-24">
      
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <Info className="w-5 h-5 text-indigo-400" />
        Info Cepat
      </h3>
      
      {/* Course Badge */}
      <div className="mb-4 p-3 bg-indigo-500/10 border border-indigo-500/30 
        rounded-xl">
        <div className="text-xs text-indigo-400 mb-1">Mata Kuliah</div>
        <div className="text-white font-medium">
          Sistem Informasi Manajemen
        </div>
      </div>
      
      {/* Deadline Countdown */}
      <div className="mb-4 p-4 bg-gradient-to-br from-amber-500/10 
        to-orange-500/10 border border-amber-500/30 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-amber-400 font-semibold">
            DEADLINE
          </span>
        </div>
        <div className="text-2xl font-bold text-white mb-1">
          7 Hari
        </div>
        <div className="text-xs text-slate-400">
          25 Januari 2026, 23:59
        </div>
      </div>
      
      {/* Points & Weight */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 bg-slate-900/50 rounded-xl text-center">
          <Award className="w-5 h-5 text-violet-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-white">100</div>
          <div className="text-xs text-slate-400">Poin</div>
        </div>
        <div className="p-3 bg-slate-900/50 rounded-xl text-center">
          <Percent className="w-5 h-5 text-blue-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-white">10%</div>
          <div className="text-xs text-slate-400">Bobot</div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-400">Progress</span>
          <span className="text-indigo-400 font-semibold">60%</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
            initial={{ width: 0 }}
            animate={{ width: '60%' }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Mahasiswa</span>
          <span className="text-white font-medium">32 orang</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Lampiran</span>
          <span className="text-white font-medium">3 file</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Rubrik</span>
          <span className="text-white font-medium">5 kriteria</span>
        </div>
      </div>
    </div>
  );
};
```

---

### 2. TEMPLATE LIBRARY CARD

```tsx
const TemplateLibraryCard: React.FC = () => {
  const templates = [
    {
      id: 1,
      name: 'Analisis Kasus',
      category: 'assignment',
      usageCount: 12,
      icon: FileText,
    },
    {
      id: 2,
      name: 'Presentasi Kelompok',
      category: 'presentation',
      usageCount: 8,
      icon: Presentation,
    },
    {
      id: 3,
      name: 'Kuis Mingguan',
      category: 'quiz',
      usageCount: 24,
      icon: HelpCircle,
    },
  ];
  
  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 
      border border-slate-700 rounded-2xl p-6">
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          Template
        </h3>
        <button className="text-xs text-indigo-400 hover:text-indigo-300">
          Lihat Semua
        </button>
      </div>
      
      <div className="space-y-2">
        {templates.map((template) => {
          const Icon = template.icon;
          return (
            <button
              key={template.id}
              className="w-full p-3 bg-slate-900/50 hover:bg-slate-800/50 
                border border-slate-700 hover:border-indigo-500/50 
                rounded-xl transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg 
                  group-hover:bg-indigo-500/20 transition-colors">
                  <Icon className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-white font-medium">
                    {template.name}
                  </div>
                  <div className="text-xs text-slate-400">
                    Digunakan {template.usageCount}x
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 
                  group-hover:text-indigo-400 transition-colors" />
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Create Template Button */}
      <button className="w-full mt-4 px-4 py-2 bg-indigo-500/10 
        hover:bg-indigo-500/20 border border-indigo-500/30 
        rounded-xl text-indigo-400 transition-all flex items-center 
        justify-center gap-2">
        <Plus className="w-4 h-4" />
        <span className="text-sm font-medium">Buat Template Baru</span>
      </button>
    </div>
  );
};
```

---

### 3. TIPS & GUIDELINES CARD

```tsx
const TipsGuidelinesCard: React.FC = () => {
  const tips = [
    {
      icon: Lightbulb,
      title: 'Judul yang Jelas',
      desc: 'Gunakan judul yang deskriptif dan mudah dipahami mahasiswa',
    },
    {
      icon: Target,
      title: 'Tujuan Spesifik',
      desc: 'Jelaskan tujuan pembelajaran yang ingin dicapai',
    },
    {
      icon: Clock,
      title: 'Deadline Realistis',
      desc: 'Berikan waktu yang cukup untuk mahasiswa mengerjakan',
    },
  ];
  
  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 
      border border-slate-700 rounded-2xl p-6">
      
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-indigo-400" />
        Tips & Panduan
      </h3>
      
      <div className="space-y-3">
        {tips.map((tip, index) => {
          const Icon = tip.icon;
          return (
            <div
              key={index}
              className="p-3 bg-slate-900/50 rounded-xl border 
                border-slate-700/50"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg shrink-0">
                  <Icon className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <div className="text-sm text-white font-medium mb-1">
                    {tip.title}
                  </div>
                  <div className="text-xs text-slate-400">
                    {tip.desc}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Help Link */}
      <button className="w-full mt-4 px-4 py-2 bg-slate-700/50 
        hover:bg-slate-700 border border-slate-600 rounded-xl 
        text-slate-300 hover:text-white transition-all flex 
        items-center justify-center gap-2">
        <HelpCircle className="w-4 h-4" />
        <span className="text-sm">Bantuan Lengkap</span>
      </button>
    </div>
  );
};
```

---

## ⚙️ ADVANCED FEATURES

### 1. AUTO-SAVE FUNCTIONALITY

```tsx
const useAutoSave = (data: any, interval: number = 30000) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  useEffect(() => {
    const timer = setInterval(async () => {
      setIsSaving(true);
      
      try {
        await axios.post('/api/tugas/draft', data);
        setLastSaved(new Date());
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsSaving(false);
      }
    }, interval);
    
    return () => clearInterval(timer);
  }, [data, interval]);
  
  return { isSaving, lastSaved };
};
```

---

### 2. KEYBOARD SHORTCUTS

```tsx
const useKeyboardShortcuts = () => {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S: Save Draft
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveDraft();
      }
      
      // Ctrl/Cmd + Enter: Publish
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        publishTask();
      }
      
      // Ctrl/Cmd + P: Preview
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        openPreview();
      }
      
      // Esc: Close Modal
      if (e.key === 'Escape') {
        closeModal();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
};
```

---

### 3. VALIDATION RULES

```typescript
const validationSchema = {
  course_id: {
    required: true,
    message: 'Mata kuliah harus dipilih',
  },
  title: {
    required: true,
    minLength: 10,
    maxLength: 200,
    message: 'Judul harus antara 10-200 karakter',
  },
  description: {
    required: true,
    minLength: 50,
    message: 'Deskripsi minimal 50 karakter',
  },
  points: {
    required: true,
    min: 1,
    max: 1000,
    message: 'Poin harus antara 1-1000',
  },
  weight: {
    required: true,
    min: 1,
    max: 100,
    message: 'Bobot harus antara 1-100%',
  },
  deadline: {
    required: true,
    futureDate: true,
    message: 'Deadline harus di masa depan',
  },
};
```

---

### 4. API ENDPOINTS

```typescript
// POST /api/admin/tugas
// Create new assignment
interface CreateTaskRequest {
  course_id: number;
  title: string;
  description: string;
  type: 'assignment' | 'quiz' | 'project' | 'presentation';
  category: 'individual' | 'group';
  points: number;
  weight: number;
  start_at: string;
  deadline: string;
  attachments: File[];
  rubrics: Rubric[];
  students: number[];
  notifications: {
    send_notification: boolean;
    send_reminder: boolean;
    send_email: boolean;
  };
}

// POST /api/admin/tugas/draft
// Save as draft
interface SaveDraftRequest {
  data: Partial<CreateTaskRequest>;
  step: number;
}

// GET /api/admin/tugas/templates
// Get assignment templates
interface TemplateResponse {
  id: number;
  name: string;
  category: string;
  data: Partial<CreateTaskRequest>;
}

// POST /api/admin/tugas/{id}/publish
// Publish assignment
interface PublishResponse {
  success: boolean;
  task_id: number;
  message: string;
}
```


---

## 🎬 ANIMATIONS & TRANSITIONS

### Framer Motion Variants

```typescript
// Page Entry Animation
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: {
      duration: 0.3,
    }
  },
};

// Step Transition Animation
const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
  }),
};

// Card Hover Animation
const cardHoverVariants = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    }
  },
};

// Button Press Animation
const buttonVariants = {
  tap: { scale: 0.95 },
  hover: { scale: 1.05 },
};

// Progress Bar Animation
const progressVariants = {
  initial: { width: 0 },
  animate: (progress: number) => ({
    width: `${progress}%`,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
    }
  }),
};
```

---

## 🛠️ TECH STACK

### Frontend
```json
{
  "framework": "React 18+ with TypeScript",
  "routing": "Inertia.js",
  "styling": "Tailwind CSS 3.x",
  "animations": "Framer Motion 10+",
  "forms": "React Hook Form + Zod",
  "richText": "TipTap Editor / Quill",
  "charts": "Recharts / Chart.js",
  "icons": "Lucide React",
  "dateTime": "date-fns",
  "fileUpload": "React Dropzone",
  "notifications": "React Hot Toast"
}
```

### Backend
```json
{
  "framework": "Laravel 10+",
  "database": "MySQL 8.0+",
  "storage": "Laravel Storage (S3/Local)",
  "queue": "Laravel Queue (Redis)",
  "notifications": "Laravel Notifications",
  "validation": "Laravel Validation",
  "api": "RESTful API"
}
```

---

## 📦 IMPLEMENTATION GUIDE

### 1. Database Schema

```sql
-- Tabel tugas
CREATE TABLE tugas (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  type ENUM('assignment', 'quiz', 'project', 'presentation') NOT NULL,
  category ENUM('individual', 'group') NOT NULL,
  points INT NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  start_at DATETIME NOT NULL,
  deadline DATETIME NOT NULL,
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  allow_late_submission BOOLEAN DEFAULT FALSE,
  late_penalty INT DEFAULT 0,
  created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_course_status (course_id, status),
  INDEX idx_deadline (deadline)
);

-- Tabel lampiran tugas
CREATE TABLE tugas_attachments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tugas_id BIGINT UNSIGNED NOT NULL,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tugas_id) REFERENCES tugas(id) ON DELETE CASCADE,
  INDEX idx_tugas (tugas_id)
);

-- Tabel rubrik penilaian
CREATE TABLE tugas_rubrics (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tugas_id BIGINT UNSIGNED NOT NULL,
  criteria VARCHAR(200) NOT NULL,
  description TEXT,
  max_score INT NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tugas_id) REFERENCES tugas(id) ON DELETE CASCADE,
  INDEX idx_tugas (tugas_id)
);

-- Tabel penugasan mahasiswa
CREATE TABLE tugas_assignments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tugas_id BIGINT UNSIGNED NOT NULL,
  student_id BIGINT UNSIGNED NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tugas_id) REFERENCES tugas(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_assignment (tugas_id, student_id),
  INDEX idx_student (student_id)
);

-- Tabel template tugas
CREATE TABLE tugas_templates (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL,
  template_data JSON NOT NULL,
  usage_count INT DEFAULT 0,
  created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_category (category)
);
```

---

### 2. Laravel Controller

```php
<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tugas;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TugasController extends Controller
{
    public function create()
    {
        $courses = Course::with('dosen')
            ->where('is_active', true)
            ->get();
        
        $templates = TugasTemplate::where('created_by', auth()->id())
            ->orderBy('usage_count', 'desc')
            ->limit(5)
            ->get();
        
        return Inertia::render('Admin/TambahTugas', [
            'courses' => $courses,
            'templates' => $templates,
        ]);
    }
    
    public function store(Request $request)
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'title' => 'required|string|min:10|max:200',
            'description' => 'required|string|min:50',
            'type' => 'required|in:assignment,quiz,project,presentation',
            'category' => 'required|in:individual,group',
            'points' => 'required|integer|min:1|max:1000',
            'weight' => 'required|numeric|min:1|max:100',
            'start_at' => 'required|date|after:now',
            'deadline' => 'required|date|after:start_at',
            'attachments' => 'nullable|array',
            'attachments.*' => 'file|max:25600', // 25MB
            'rubrics' => 'nullable|array',
            'rubrics.*.criteria' => 'required|string',
            'rubrics.*.max_score' => 'required|integer|min:1',
            'rubrics.*.weight' => 'required|numeric|min:0|max:100',
            'students' => 'nullable|array',
            'students.*' => 'exists:users,id',
        ]);
        
        DB::beginTransaction();
        
        try {
            // Create tugas
            $tugas = Tugas::create([
                ...$validated,
                'created_by' => auth()->id(),
                'status' => 'published',
            ]);
            
            // Handle file uploads
            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    $path = $file->store('tugas-attachments', 'public');
                    
                    $tugas->attachments()->create([
                        'filename' => basename($path),
                        'original_name' => $file->getClientOriginalName(),
                        'file_path' => $path,
                        'file_size' => $file->getSize(),
                        'mime_type' => $file->getMimeType(),
                    ]);
                }
            }
            
            // Create rubrics
            if (!empty($validated['rubrics'])) {
                foreach ($validated['rubrics'] as $index => $rubric) {
                    $tugas->rubrics()->create([
                        ...$rubric,
                        'order_index' => $index,
                    ]);
                }
            }
            
            // Assign to students
            if (!empty($validated['students'])) {
                $tugas->assignments()->createMany(
                    collect($validated['students'])->map(fn($id) => [
                        'student_id' => $id,
                    ])->toArray()
                );
            }
            
            // Send notifications
            if ($request->input('notifications.send_notification')) {
                // Queue notification job
                dispatch(new SendTugasNotification($tugas));
            }
            
            DB::commit();
            
            return redirect()
                ->route('admin.tugas.index')
                ->with('success', 'Tugas berhasil dibuat dan dipublikasikan');
                
        } catch (\Exception $e) {
            DB::rollBack();
            
            return back()
                ->withErrors(['error' => 'Gagal membuat tugas: ' . $e->getMessage()])
                ->withInput();
        }
    }
    
    public function saveDraft(Request $request)
    {
        $data = $request->input('data');
        $step = $request->input('step');
        
        // Save to session or database
        session()->put('tugas_draft', [
            'data' => $data,
            'step' => $step,
            'updated_at' => now(),
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Draft tersimpan',
        ]);
    }
}
```

---

### 3. React Component Structure

```
src/pages/admin/
└── tambah-tugas.tsx          # Main page component
    ├── components/
    │   ├── TugasHeader.tsx    # Header with progress
    │   ├── StepWizard.tsx     # Step indicator
    │   ├── Step1BasicInfo.tsx # Step 1 form
    │   ├── Step2Description.tsx # Step 2 form
    │   ├── Step3Grading.tsx   # Step 3 form
    │   ├── Step4Students.tsx  # Step 4 form
    │   ├── Step5Review.tsx    # Step 5 preview
    │   ├── QuickInfoCard.tsx  # Right sidebar info
    │   ├── TemplateLibrary.tsx # Template selector
    │   └── TipsGuidelines.tsx # Help tips
    ├── hooks/
    │   ├── useAutoSave.ts     # Auto-save hook
    │   ├── useKeyboardShortcuts.ts # Keyboard shortcuts
    │   └── useFormValidation.ts # Form validation
    └── types/
        └── tugas.types.ts     # TypeScript types
```

---

## ✅ FEATURES CHECKLIST

### Core Features
- [x] Multi-step wizard form (5 steps)
- [x] Real-time form validation
- [x] Auto-save draft functionality
- [x] Rich text editor for description
- [x] File upload with drag & drop
- [x] Rubric builder with dynamic criteria
- [x] Student/group assignment
- [x] Schedule & deadline management
- [x] Preview before publish
- [x] Template system

### Advanced Features
- [x] Keyboard shortcuts (Ctrl+S, Ctrl+Enter, Ctrl+P)
- [x] Progress indicator
- [x] Character/word counter
- [x] File size validation
- [x] Deadline countdown
- [x] Late submission policy
- [x] Notification settings
- [x] Template quick load
- [x] Tips & guidelines
- [x] Responsive design

### UI/UX Features
- [x] Animated gradient header
- [x] Glassmorphism effects
- [x] Smooth step transitions
- [x] Hover animations
- [x] Loading states
- [x] Success/error feedback
- [x] Dark theme
- [x] Sticky sidebar
- [x] Mobile responsive

---

## 🎨 COLOR PALETTE REFERENCE

```css
/* Primary Colors */
--indigo-400: #818cf8;
--indigo-500: #6366f1;
--indigo-600: #4f46e5;

--purple-500: #8b5cf6;
--purple-600: #7c3aed;

--pink-500: #ec4899;
--pink-600: #db2777;

/* Background Colors */
--slate-900: #0f172a;
--slate-800: #1e293b;
--slate-700: #334155;

/* Text Colors */
--slate-100: #f1f5f9;
--slate-400: #94a3b8;
--slate-500: #64748b;

/* Status Colors */
--emerald-500: #10b981;
--amber-500: #f59e0b;
--red-500: #ef4444;
```

---

## 📝 USAGE EXAMPLE

```tsx
import TambahTugas from '@/pages/admin/tambah-tugas';

// In your route file
<Route path="/admin/tugas/create" component={TambahTugas} />

// Component usage
export default function TambahTugas({ courses, templates }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  
  const { isSaving, lastSaved } = useAutoSave(formData);
  useKeyboardShortcuts();
  
  return (
    <div className="min-h-screen bg-slate-950">
      <TugasHeader
        currentStep={currentStep}
        totalSteps={5}
        isSaving={isSaving}
        lastSaved={lastSaved}
      />
      
      <div className="container mx-auto px-6 py-8">
        <StepWizard currentStep={currentStep} />
        
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8">
            <AnimatePresence mode="wait">
              {currentStep === 1 && <Step1BasicInfo />}
              {currentStep === 2 && <Step2Description />}
              {currentStep === 3 && <Step3Grading />}
              {currentStep === 4 && <Step4Students />}
              {currentStep === 5 && <Step5Review />}
            </AnimatePresence>
          </div>
          
          <div className="col-span-4 space-y-6">
            <QuickInfoCard />
            <TemplateLibrary templates={templates} />
            <TipsGuidelines />
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 🚀 DEPLOYMENT NOTES

1. Pastikan semua dependencies terinstall
2. Jalankan migrations untuk database schema
3. Configure file storage (S3 atau local)
4. Setup queue worker untuk notifications
5. Test semua validations
6. Test file upload limits
7. Test auto-save functionality
8. Test keyboard shortcuts
9. Test responsive design
10. Deploy ke production

---

## 📚 DOCUMENTATION LINKS

- [React Hook Form](https://react-hook-form.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [TipTap Editor](https://tiptap.dev/)
- [React Dropzone](https://react-dropzone.js.org/)
- [Laravel Validation](https://laravel.com/docs/validation)
- [Inertia.js](https://inertiajs.com/)

---

**CATATAN PENTING:**
Prompt ini dibuat dengan sangat detail dan ultra advanced. Semua komponen, animasi, validasi, dan fitur telah dijelaskan secara mendalam. Implementasi harus mengikuti best practices untuk performa, keamanan, dan user experience yang optimal.

🎯 **Target:** Halaman Tambah Tugas yang professional, intuitive, dan feature-rich dengan UI/UX yang konsisten dengan dashboard admin style.
