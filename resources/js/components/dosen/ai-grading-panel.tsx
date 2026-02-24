import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
    Sparkles, X, Minimize2, Maximize2, Zap, Bot, CheckCircle, Clock,
    AlertTriangle, AlertCircle, Brain, ShieldAlert, ExternalLink,
    RefreshCw, Check, Loader2, FileText, TrendingUp, Star, Eye,
    BookOpen, Award, Target, Activity, BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════ */
/*                     TYPES                          */
/* ═══════════════════════════════════════════════════ */
type Submission = {
    id: number;
    mahasiswa: { id: number; nama: string; nim: string };
    content: string | null;
    file_path: string | null;
    file_name: string | null;
    status: string;
    grade: number | null;
    grade_letter: string | null;
    feedback: string | null;
    submitted_at: string;
    graded_at: string | null;
    is_late: boolean;
};

type AIAnalysis = {
    recommended_score: number;
    confidence: number;
    content_score: number;
    technical_score: number;
    presentation_score: number;
    originality_score: number;
    word_count: number;
    reading_level: string;
    complexity_score: number;
    coherence_score: number;
    strengths: string[];
    weaknesses: string[];
    key_topics: string[];
    similarity_score: number;
    matched_sources: { title: string; url: string; match_percentage: number; matched_text: string }[];
    feedback_suggestion: string;
};

type Props = {
    selectedSubmission: Submission | null;
    maxGrade: number;
    onApplyScore: (score: number, feedback: string) => void;
};

/* ═══════════════════════════════════════════════════ */
/*              MOCK AI GENERATOR                     */
/* ═══════════════════════════════════════════════════ */
function seededRandom(seed: number) {
    let s = seed;
    return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}

function generateMockAnalysis(sub: Submission, maxGrade: number): AIAnalysis {
    const rng = seededRandom(sub.id * 137 + sub.mahasiswa.id);
    const r = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min;

    const contentScore = r(55, 98);
    const techScore = r(50, 95);
    const presentScore = r(60, 98);
    const origScore = r(40, 100);
    const weighted = Math.round(contentScore * 0.4 + techScore * 0.3 + presentScore * 0.2 + origScore * 0.1);
    const recommended = Math.min(maxGrade, Math.round((weighted / 100) * maxGrade));
    const confidence = r(72, 98);
    const similarity = r(3, 45);

    const allStrengths = [
        'Struktur argumen yang logis dan terorganisir dengan baik',
        'Penggunaan referensi akademis yang relevan dan terkini',
        'Analisis data yang mendalam dan komprehensif',
        'Penulisan yang jelas dan mudah dipahami',
        'Metodologi penelitian yang tepat dan terstruktur',
        'Kesimpulan yang didukung oleh bukti kuat',
        'Penggunaan visualisasi data yang efektif',
        'Pemahaman konsep yang mendalam',
    ];
    const allWeaknesses = [
        'Beberapa paragraf perlu transisi yang lebih halus',
        'Kutipan perlu format yang lebih konsisten (APA/IEEE)',
        'Bagian pembahasan bisa diperluas dengan contoh tambahan',
        'Perlu penjelasan lebih detail pada bagian metodologi',
        'Beberapa klaim belum didukung referensi yang memadai',
        'Abstrak perlu lebih ringkas dan fokus pada temuan utama',
        'Tabel data perlu label yang lebih jelas',
    ];
    const allTopics = [
        'Machine Learning', 'Data Analysis', 'Neural Networks', 'Deep Learning',
        'Natural Language Processing', 'Computer Vision', 'Statistical Methods',
        'Research Methodology', 'Algorithm Design', 'Database Systems',
        'Cloud Computing', 'Software Engineering', 'Artificial Intelligence',
    ];
    const allSources = [
        { title: 'Jurnal Teknologi Informasi - Universitas Indonesia', url: 'https://jurnal.ui.ac.id/...', matched_text: 'Penggunaan algoritma klasifikasi untuk analisis sentimen...' },
        { title: 'IEEE Conference on Machine Learning 2024', url: 'https://ieeexplore.ieee.org/...', matched_text: 'The proposed method achieves state-of-the-art performance...' },
        { title: 'Wikipedia - Artificial Neural Networks', url: 'https://en.wikipedia.org/wiki/ANN', matched_text: 'Neural networks consist of layers of interconnected nodes...' },
        { title: 'GeeksforGeeks - Data Structures', url: 'https://www.geeksforgeeks.org/...', matched_text: 'Binary search tree is a data structure that maintains...' },
    ];

    const pick = <T,>(arr: T[], count: number): T[] => {
        const shuffled = [...arr].sort(() => rng() - 0.5);
        return shuffled.slice(0, count);
    };

    return {
        recommended_score: recommended,
        confidence,
        content_score: contentScore,
        technical_score: techScore,
        presentation_score: presentScore,
        originality_score: origScore,
        word_count: r(800, 5000),
        reading_level: ['Dasar', 'Menengah', 'Lanjutan', 'Akademis'][r(0, 3)],
        complexity_score: r(4, 10),
        coherence_score: r(65, 98),
        strengths: pick(allStrengths, r(2, 4)),
        weaknesses: pick(allWeaknesses, r(1, 3)),
        key_topics: pick(allTopics, r(3, 6)),
        similarity_score: similarity,
        matched_sources: similarity > 15 ? pick(allSources, r(1, 3)).map(s => ({ ...s, match_percentage: r(5, Math.min(similarity, 40)) })) : [],
        feedback_suggestion: contentScore >= 80
            ? 'Pekerjaan yang sangat baik! Struktur argumen solid dan analisis mendalam. Terus pertahankan kualitas ini.'
            : contentScore >= 60
                ? 'Pekerjaan sudah baik. Beberapa aspek bisa ditingkatkan, terutama pada bagian analisis dan referensi.'
                : 'Pekerjaan perlu perbaikan signifikan. Fokuskan pada pendalaman materi dan struktur penulisan yang lebih terorganisir.',
    };
}

/* ═══════════════════════════════════════════════════ */
/*               ANALYSIS STEPS                       */
/* ═══════════════════════════════════════════════════ */
const analysisSteps = [
    { label: 'Content Analysis', duration: 800 },
    { label: 'Plagiarism Check', duration: 1200 },
    { label: 'Grammar & Style', duration: 600 },
    { label: 'NLP Processing', duration: 900 },
    { label: 'Scoring Model', duration: 700 },
];

/* ═══════════════════════════════════════════════════ */
/*                 MAIN COMPONENT                     */
/* ═══════════════════════════════════════════════════ */
export default function AIGradingPanel({ selectedSubmission, maxGrade, onApplyScore }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
    const [activeSection, setActiveSection] = useState<'score' | 'content' | 'plagiarism'>('score');

    // Reset analysis when submission changes
    useEffect(() => { setAnalysis(null); setAnalysisProgress(0); }, [selectedSubmission?.id]);

    const runAnalysis = () => {
        if (!selectedSubmission) return;
        setIsAnalyzing(true);
        setAnalysisProgress(0);
        setAnalysis(null);

        let step = 0;
        const totalDuration = analysisSteps.reduce((s, st) => s + st.duration, 0);
        let elapsed = 0;

        const tick = () => {
            if (step >= analysisSteps.length) {
                setIsAnalyzing(false);
                setAnalysis(generateMockAnalysis(selectedSubmission, maxGrade));
                return;
            }
            elapsed += analysisSteps[step].duration;
            setAnalysisProgress(Math.round((elapsed / totalDuration) * 100));
            step++;
            setTimeout(tick, analysisSteps[step - 1].duration);
        };
        setTimeout(tick, 300);
    };

    return (
        <>
            {/* ═══ Floating Button ═══ */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 180 }}
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-8 right-8 z-50 h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-2xl shadow-purple-500/40 flex items-center justify-center">
                        <Sparkles className="h-7 w-7" />
                        <motion.div className="absolute inset-0 rounded-full bg-purple-500"
                            animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }} />
                        {selectedSubmission && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                                <span className="text-[8px] font-bold">AI</span>
                            </motion.div>
                        )}
                    </motion.button>
                )}
            </AnimatePresence>

            {/* ═══ Panel ═══ */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ x: 460, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 460, opacity: 0 }}
                        transition={{ type: 'spring' as const, damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-[450px] z-50 flex flex-col">

                        {/* Backdrop */}
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10" />

                        {/* Panel Content */}
                        <div className="h-full bg-gradient-to-br from-purple-50 via-pink-50 to-white dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-950 border-l border-purple-200/50 dark:border-purple-800/30 shadow-2xl flex flex-col overflow-hidden">

                            {/* ─── Header ─── */}
                            <div className="relative overflow-hidden flex-shrink-0">
                                <motion.div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-purple-600"
                                    animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                                    style={{ backgroundSize: '200% 200%' }} />
                                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 70%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                                <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

                                <div className="relative p-5 text-white">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                                                className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
                                                <Sparkles className="h-5 w-5" />
                                            </motion.div>
                                            <div>
                                                <h2 className="text-lg font-bold tracking-tight">AI Grading Assistant</h2>
                                                <p className="text-[11px] text-white/70">Multi-Model Intelligence System</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => setIsMinimized(!isMinimized)} className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8">
                                                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8">
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }}
                                            className="h-2 w-2 rounded-full bg-green-400" />
                                        <span className="text-white/80">7 AI Models Active</span>
                                        <span className="text-white/40">•</span>
                                        <span className="text-white/60">GPT-4 + ML Pipeline</span>
                                    </div>
                                </div>
                            </div>

                            {/* ─── Content ─── */}
                            {!isMinimized && (
                                <div className="flex-1 overflow-y-auto p-5 space-y-5">

                                    {/* Selected Submission Info */}
                                    {selectedSubmission ? (
                                        <div className="p-4 rounded-xl bg-white dark:bg-neutral-800/50 border border-purple-200/50 dark:border-purple-800/30 shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                    {selectedSubmission.mahasiswa.nama[0]}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-sm text-neutral-900 dark:text-white truncate">{selectedSubmission.mahasiswa.nama}</p>
                                                    <p className="text-[11px] text-neutral-500">{selectedSubmission.mahasiswa.nim}</p>
                                                </div>
                                                <div className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold",
                                                    selectedSubmission.status === 'graded' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300")}>
                                                    {selectedSubmission.status === 'graded' ? 'Dinilai' : 'Pending'}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-6 rounded-xl border-2 border-dashed border-purple-200 dark:border-purple-800/30 text-center">
                                            <Eye className="h-8 w-8 mx-auto mb-2 text-purple-300 dark:text-purple-600" />
                                            <p className="text-sm font-medium text-neutral-500">Pilih submission untuk dianalisis</p>
                                            <p className="text-[11px] text-neutral-400 mt-1">Klik submission di tabel untuk memilih</p>
                                        </div>
                                    )}

                                    {/* Quick Actions */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                            <Button onClick={runAnalysis} disabled={!selectedSubmission || isAnalyzing}
                                                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25 h-11">
                                                {isAnalyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
                                                Analyze
                                            </Button>
                                        </motion.div>
                                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                            <Button variant="outline" disabled={isAnalyzing}
                                                className="w-full border-purple-200 dark:border-purple-800/30 h-11">
                                                <Bot className="h-4 w-4 mr-2" /> Auto Grade All
                                            </Button>
                                        </motion.div>
                                    </div>

                                    {/* Analysis Loading */}
                                    {isAnalyzing && (
                                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                            className="rounded-2xl border border-purple-200/50 dark:border-purple-800/30 bg-white dark:bg-neutral-800/50 p-5">
                                            <div className="flex items-center gap-3 mb-4">
                                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                                                    <Loader2 className="h-6 w-6 text-purple-600" />
                                                </motion.div>
                                                <div>
                                                    <p className="font-bold text-sm">Analyzing Submission...</p>
                                                    <p className="text-[11px] text-neutral-500">Running 7 AI models</p>
                                                </div>
                                                <span className="ml-auto text-sm font-bold text-purple-600">{analysisProgress}%</span>
                                            </div>
                                            <div className="h-2 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden mb-4">
                                                <motion.div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                                                    animate={{ width: `${analysisProgress}%` }}
                                                    transition={{ duration: 0.3 }} />
                                            </div>
                                            <div className="space-y-2.5">
                                                {analysisSteps.map((step, i) => {
                                                    const stepEnd = analysisSteps.slice(0, i + 1).reduce((s, st) => s + st.duration, 0);
                                                    const stepStart = stepEnd - step.duration;
                                                    const totalDuration = analysisSteps.reduce((s, st) => s + st.duration, 0);
                                                    const pctEnd = Math.round((stepEnd / totalDuration) * 100);
                                                    const pctStart = Math.round((stepStart / totalDuration) * 100);
                                                    const status = analysisProgress >= pctEnd ? 'complete' : analysisProgress > pctStart ? 'processing' : 'pending';
                                                    return (
                                                        <div key={i} className="flex items-center gap-3">
                                                            {status === 'complete' && <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />}
                                                            {status === 'processing' && <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Loader2 className="h-4 w-4 text-purple-500 flex-shrink-0" /></motion.div>}
                                                            {status === 'pending' && <Clock className="h-4 w-4 text-neutral-300 flex-shrink-0" />}
                                                            <span className={cn("text-xs", status === 'complete' && "text-green-600 dark:text-green-400", status === 'processing' && "text-purple-600 dark:text-purple-400 font-semibold", status === 'pending' && "text-neutral-400")}>{step.label}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* ═══ Analysis Results ═══ */}
                                    {analysis && !isAnalyzing && (
                                        <>
                                            {/* Section Tabs */}
                                            <div className="flex gap-1 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800/50">
                                                {([
                                                    { key: 'score' as const, label: 'Score', icon: Award },
                                                    { key: 'content' as const, label: 'Content', icon: Brain },
                                                    { key: 'plagiarism' as const, label: 'Plagiarism', icon: ShieldAlert },
                                                ]).map(tab => (
                                                    <button key={tab.key} onClick={() => setActiveSection(tab.key)}
                                                        className={cn("flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all",
                                                            activeSection === tab.key ? "bg-white dark:bg-neutral-700 shadow-md text-purple-600 dark:text-purple-400" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300")}>
                                                        <tab.icon className="h-3.5 w-3.5" />
                                                        {tab.label}
                                                    </button>
                                                ))}
                                            </div>

                                            <AnimatePresence mode="wait">
                                                {/* ─── Score Section ─── */}
                                                {activeSection === 'score' && (
                                                    <motion.div key="score" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                                        className="rounded-2xl border border-purple-200/50 dark:border-purple-800/30 bg-white dark:bg-neutral-800/50 p-5 space-y-5">
                                                        {/* Score Display */}
                                                        <div className="flex items-end justify-between">
                                                            <div>
                                                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Recommended Score</p>
                                                                <div className="flex items-end gap-1">
                                                                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' as const, stiffness: 300 }}
                                                                        className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                                                        {analysis.recommended_score}
                                                                    </motion.span>
                                                                    <span className="text-xl text-neutral-300 mb-1">/{maxGrade}</span>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Confidence</p>
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="text-2xl font-extrabold text-purple-600">{analysis.confidence}%</span>
                                                                    {analysis.confidence >= 90 && <CheckCircle className="h-5 w-5 text-green-500" />}
                                                                    {analysis.confidence >= 70 && analysis.confidence < 90 && <AlertCircle className="h-5 w-5 text-amber-500" />}
                                                                    {analysis.confidence < 70 && <AlertTriangle className="h-5 w-5 text-red-500" />}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Confidence Bar */}
                                                        <div className="h-3 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                                                            <motion.div initial={{ width: 0 }} animate={{ width: `${analysis.confidence}%` }} transition={{ duration: 1 }}
                                                                className={cn("h-full rounded-full", analysis.confidence >= 90 ? "bg-gradient-to-r from-green-500 to-emerald-500" : analysis.confidence >= 70 ? "bg-gradient-to-r from-amber-500 to-orange-500" : "bg-gradient-to-r from-red-500 to-rose-500")} />
                                                        </div>

                                                        {/* Breakdown */}
                                                        <div className="space-y-3">
                                                            <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Score Breakdown</p>
                                                            {[
                                                                { label: 'Content Quality', score: analysis.content_score, weight: 40, color: 'from-purple-500 to-indigo-500' },
                                                                { label: 'Technical Accuracy', score: analysis.technical_score, weight: 30, color: 'from-blue-500 to-cyan-500' },
                                                                { label: 'Presentation', score: analysis.presentation_score, weight: 20, color: 'from-emerald-500 to-teal-500' },
                                                                { label: 'Originality', score: analysis.originality_score, weight: 10, color: 'from-amber-500 to-orange-500' },
                                                            ].map((item, i) => (
                                                                <div key={i} className="space-y-1.5">
                                                                    <div className="flex items-center justify-between text-xs">
                                                                        <span className="text-neutral-600 dark:text-neutral-400">{item.label} <span className="text-neutral-400">({item.weight}%)</span></span>
                                                                        <span className="font-bold text-neutral-900 dark:text-white">{item.score}/100</span>
                                                                    </div>
                                                                    <div className="h-2 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                                                                        <motion.div initial={{ width: 0 }} animate={{ width: `${item.score}%` }}
                                                                            transition={{ duration: 0.8, delay: i * 0.15 }}
                                                                            className={`h-full rounded-full bg-gradient-to-r ${item.color}`} />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Feedback Suggestion */}
                                                        <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/15 border border-purple-200/50 dark:border-purple-800/30">
                                                            <p className="text-[10px] font-bold text-purple-500 uppercase tracking-wider mb-1">AI Feedback Suggestion</p>
                                                            <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">{analysis.feedback_suggestion}</p>
                                                        </div>

                                                        {/* Apply Button */}
                                                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                                            <Button onClick={() => onApplyScore(analysis.recommended_score, analysis.feedback_suggestion)}
                                                                className="w-full h-11 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25">
                                                                <Check className="h-4 w-4 mr-2" /> Apply Score & Feedback
                                                            </Button>
                                                        </motion.div>
                                                    </motion.div>
                                                )}

                                                {/* ─── Content Analysis ─── */}
                                                {activeSection === 'content' && (
                                                    <motion.div key="content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                                        className="rounded-2xl border border-purple-200/50 dark:border-purple-800/30 bg-white dark:bg-neutral-800/50 p-5 space-y-5">
                                                        <h3 className="font-bold text-sm flex items-center gap-2"><Brain className="h-4 w-4 text-purple-600" /> Content Analysis (NLP)</h3>

                                                        {/* Metrics Grid */}
                                                        <div className="grid grid-cols-2 gap-3">
                                                            {[
                                                                { label: 'Word Count', val: analysis.word_count.toLocaleString(), bg: 'bg-purple-50 dark:bg-purple-900/20', color: 'text-purple-600' },
                                                                { label: 'Reading Level', val: analysis.reading_level, bg: 'bg-pink-50 dark:bg-pink-900/20', color: 'text-pink-600' },
                                                                { label: 'Complexity', val: `${analysis.complexity_score}/10`, bg: 'bg-indigo-50 dark:bg-indigo-900/20', color: 'text-indigo-600' },
                                                                { label: 'Coherence', val: `${analysis.coherence_score}%`, bg: 'bg-violet-50 dark:bg-violet-900/20', color: 'text-violet-600' },
                                                            ].map((m, i) => (
                                                                <div key={i} className={`p-3 rounded-xl ${m.bg}`}>
                                                                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">{m.label}</p>
                                                                    <p className={`text-xl font-extrabold ${m.color}`}>{m.val}</p>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Strengths */}
                                                        <div>
                                                            <p className="text-xs font-bold flex items-center gap-1.5 mb-2"><CheckCircle className="h-3.5 w-3.5 text-green-500" /> Strengths Detected</p>
                                                            <div className="space-y-1.5">
                                                                {analysis.strengths.map((s, i) => (
                                                                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                                                        className="flex items-start gap-2 text-xs">
                                                                        <div className="mt-1 h-1.5 w-1.5 rounded-full bg-green-500 flex-shrink-0" />
                                                                        <span className="text-neutral-700 dark:text-neutral-300">{s}</span>
                                                                    </motion.div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Weaknesses */}
                                                        <div>
                                                            <p className="text-xs font-bold flex items-center gap-1.5 mb-2"><AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Areas for Improvement</p>
                                                            <div className="space-y-1.5">
                                                                {analysis.weaknesses.map((w, i) => (
                                                                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                                                        className="flex items-start gap-2 text-xs">
                                                                        <div className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                                                                        <span className="text-neutral-700 dark:text-neutral-300">{w}</span>
                                                                    </motion.div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Key Topics */}
                                                        <div>
                                                            <p className="text-xs font-bold mb-2">Key Topics</p>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {analysis.key_topics.map((t, i) => (
                                                                    <motion.span key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                                                                        className="px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-[10px] font-semibold text-purple-700 dark:text-purple-300">
                                                                        {t}
                                                                    </motion.span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}

                                                {/* ─── Plagiarism Detection ─── */}
                                                {activeSection === 'plagiarism' && (
                                                    <motion.div key="plagiarism" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                                        className="rounded-2xl border border-purple-200/50 dark:border-purple-800/30 bg-white dark:bg-neutral-800/50 p-5 space-y-5">
                                                        <h3 className="font-bold text-sm flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-red-600" /> Plagiarism Detection</h3>

                                                        {/* Similarity Score */}
                                                        <div>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-xs font-semibold text-neutral-500">Overall Similarity</span>
                                                                <span className={cn("text-3xl font-extrabold",
                                                                    analysis.similarity_score > 50 ? "text-red-600" : analysis.similarity_score > 30 ? "text-amber-600" : "text-green-600")}>
                                                                    {analysis.similarity_score}%
                                                                </span>
                                                            </div>
                                                            <div className="h-4 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                                                                <motion.div initial={{ width: 0 }} animate={{ width: `${analysis.similarity_score}%` }} transition={{ duration: 1 }}
                                                                    className={cn("h-full rounded-full",
                                                                        analysis.similarity_score > 50 ? "bg-gradient-to-r from-red-500 to-rose-500" :
                                                                            analysis.similarity_score > 30 ? "bg-gradient-to-r from-amber-500 to-orange-500" :
                                                                                "bg-gradient-to-r from-green-500 to-emerald-500")} />
                                                            </div>
                                                        </div>

                                                        {/* Status Badge */}
                                                        <div className={cn("flex items-center gap-2 p-3 rounded-xl text-xs font-semibold",
                                                            analysis.similarity_score > 50 ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 border border-red-200 dark:border-red-800/30" :
                                                                analysis.similarity_score > 30 ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 border border-amber-200 dark:border-amber-800/30" :
                                                                    "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 border border-green-200 dark:border-green-800/30")}>
                                                            {analysis.similarity_score > 50 ? <><AlertTriangle className="h-4 w-4" /> High Similarity — Manual Review Required</> :
                                                                analysis.similarity_score > 30 ? <><AlertCircle className="h-4 w-4" /> Moderate Similarity — Check Sources</> :
                                                                    <><CheckCircle className="h-4 w-4" /> Low Similarity — Likely Original</>}
                                                        </div>

                                                        {/* Matched Sources */}
                                                        {analysis.matched_sources.length > 0 && (
                                                            <div>
                                                                <p className="text-xs font-bold mb-3">Matched Sources ({analysis.matched_sources.length})</p>
                                                                <div className="space-y-2.5">
                                                                    {analysis.matched_sources.map((src, i) => (
                                                                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                                                            className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200/50 dark:border-neutral-700/50">
                                                                            <div className="flex items-start justify-between gap-2 mb-1.5">
                                                                                <p className="text-xs font-semibold text-neutral-900 dark:text-white line-clamp-1">{src.title}</p>
                                                                                <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0",
                                                                                    src.match_percentage > 30 ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300")}>
                                                                                    {src.match_percentage}%
                                                                                </span>
                                                                            </div>
                                                                            <div className="p-2 rounded-lg bg-red-50/50 dark:bg-red-900/10 border border-red-200/30 dark:border-red-800/20 mb-2">
                                                                                <p className="text-[10px] text-neutral-600 dark:text-neutral-400 line-clamp-2 italic">"{src.matched_text}"</p>
                                                                            </div>
                                                                            <button onClick={() => window.open(src.url, '_blank')}
                                                                                className="flex items-center gap-1 text-[10px] text-purple-500 hover:text-purple-700 font-medium">
                                                                                <ExternalLink className="h-3 w-3" /> View Source
                                                                            </button>
                                                                        </motion.div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {analysis.matched_sources.length === 0 && (
                                                            <div className="text-center py-4 text-neutral-400">
                                                                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-400" />
                                                                <p className="text-sm font-medium">Tidak ada sumber yang cocok ditemukan</p>
                                                                <p className="text-[11px] mt-1">Submission ini kemungkinan besar original</p>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
