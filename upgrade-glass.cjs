const fs = require('fs');
const file = 'resources/js/pages/admin/mahasiswa-edit.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Upgrade the main form sections that use solid bg
code = code.replace(
    /className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 shadow-xl"/g,
    'className="rounded-3xl border border-white/20 bg-white/40 dark:border-neutral-800 dark:bg-neutral-900/40 p-8 shadow-xl backdrop-blur-xl"'
);

code = code.replace(
    /className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-xl mb-6"/g,
    'className="rounded-xl border border-white/20 bg-white/40 dark:border-neutral-800 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl mb-6"'
);

// Any other rounded-3xl solid bg
code = code.replace(
    /className="([^"]*)rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900([^"]*)"/g,
    'className="$1rounded-3xl border border-white/20 bg-white/40 dark:border-neutral-800 dark:bg-neutral-900/40 backdrop-blur-xl$2"'
);

code = code.replace(
    /className="([^"]*)rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900([^"]*)"/g,
    'className="$1rounded-2xl border border-white/20 bg-white/40 dark:border-neutral-800 dark:bg-neutral-900/40 backdrop-blur-xl$2"'
);

// 2. Upgrade the inputs/textareas to use glass look instead of plain borders
// Wait, currently inputs use Radix UI or a custom Input component.
// The new file doesn't use className="w-full rounded-xl..." it uses <Input ... />
// We can't easily globally restyle <Input /> unless we wrap it or specify className.
// Let's add premium styling to the Input components where className is provided
code = code.replace(
    /<Input([^>]*)className="?([^"]*)"?/g,
    (match, p1, p2) => {
        if (!p2) return match;
        // if not already modified
        if (p2.includes('backdrop-blur')) return match;
        return `<Input${p1}className="${p2} bg-white/50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 focus:border-emerald-500/50 backdrop-blur-sm transition-all text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400"`;
    }
);
// For inputs that don't have className
code = code.replace(
    /(\s)(<Input\s+(?!.*className=)[^>]+)\/>/g,
    '$1$2 className="bg-white/50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 focus:border-emerald-500/50 backdrop-blur-sm transition-all text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400" />'
);

code = code.replace(
    /<Textarea([^>]*)className="?([^"]*)"?/g,
    (match, p1, p2) => {
        if (!p2 || p2.includes('backdrop-blur')) return match;
        return `<Textarea${p1}className="${p2} bg-white/50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 focus:border-emerald-500/50 backdrop-blur-sm transition-all text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400"`;
    }
);
// For textareas without className
code = code.replace(
    /(\s)(<Textarea\s+(?!.*className=)[^>]+)\/>/g,
    '$1$2 className="bg-white/50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 focus:border-emerald-500/50 backdrop-blur-sm transition-all text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400" />'
);

// 3. Upgrade the generic navigation / active box styles
// In the current file, we had things like Select triggers
code = code.replace(
    /<SelectTrigger className="?([^"]*)"?/g,
    (match, p1) => {
        if (!p1 || p1.includes('backdrop-blur')) return match;
        return `<SelectTrigger className="${p1} bg-white/50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 focus:border-emerald-500/50 backdrop-blur-sm transition-all text-neutral-900 dark:text-neutral-100"`;
    }
);
code = code.replace(
    /(\s)(<SelectTrigger\s+(?!.*className=)[^>]+)>/g,
    '$1$2 className="bg-white/50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 focus:border-emerald-500/50 backdrop-blur-sm transition-all text-neutral-900 dark:text-neutral-100">'
);

// Wait, the "drag and drop" zone
code = code.replace(
    /isDragging\s*\?\s*"[^"]*"\s*:\s*"border-neutral-300 dark:border-neutral-700"/g,
    'isDragging ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 backdrop-blur-md" : "border-neutral-300 dark:border-neutral-700 bg-white/50 dark:bg-neutral-800/50 backdrop-blur-md"'
);

// Fix the page container layout, use radial gradients for the background like other advanced pages
// Search for <div className="relative min-h-[calc(100svh-4rem)] overflow-x-hidden text-neutral-900 dark:text-neutral-100">
// We will add the style={{ backgroundImage: ... }} to it
code = code.replace(
    /<div className="relative min-h-\[calc\(100svh-4rem\)\] overflow-x-hidden text-neutral-900 dark:text-neutral-100">/,
    `<div className="relative min-h-[calc(100svh-4rem)] overflow-x-hidden text-neutral-900 dark:text-neutral-100" style={{ backgroundImage: 'radial-gradient(circle at 10% 10%, rgba(99,102,241,0.05) 0%, transparent 35%), radial-gradient(circle at 85% 0%, rgba(236,72,153,0.05) 0%, transparent 40%)' }}>`
);

// Let's add the premium header (Kembali ke Daftar, Edit Data) animation
// The header is currently:
/*
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
*/
// Replace it with an animated gradient header similar to Kas
const premiumHeader = `
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-3xl p-8 shadow-2xl mb-8"
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                        animate={{
                            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        style={{ backgroundSize: '200% 200%' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="relative z-10 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                        <div>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => router.visit('/admin/mahasiswa')}
                                className="mb-4 text-white/80 hover:text-white hover:bg-white/10 -ml-4"
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Kembali ke Daftar
                            </Button>
                            <div className="flex items-center gap-4">
                                <motion.div
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-xl"
                                >
                                    <User className="h-8 w-8 text-white" />
                                </motion.div>
                                <div>
                                    <h1 className="text-3xl font-bold text-white">
                                        Edit Data Mahasiswa
                                    </h1>
                                    <p className="text-white/70">
                                        Perbarui informasi mahasiswa dengan lengkap dan akurat
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Validation Errors Box in Header */}
                        {Object.keys(errors).length > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-rose-500/10 backdrop-blur-md border border-rose-500/30 rounded-2xl p-4 max-w-sm"
                            >
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-rose-300 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-rose-100 text-sm">Validasi Gagal</h3>
                                        <p className="text-xs text-rose-200/80 mt-1">
                                            Mohon periksa kembali form pengisian. Ada {Object.keys(errors).length} kolom yang tidak valid.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>`;

code = code.replace(
    /<motion\.div\s+initial=\{\{ opacity: 0, y: -20 \}\}\s+animate=\{\{ opacity: 1, y: 0 \}\}\s+className="mb-8"\s*>\s*<Button[\s\S]*?<\/Button>\s*<div className="flex items-center gap-4">[\s\S]*?<\/div>\s*<\/div>\s*<\/motion\.div>/m,
    premiumHeader
);

fs.writeFileSync(file, code);
console.log('Glassmorphism upgraded');
