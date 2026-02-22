const fs = require('fs');
const file = 'resources/js/pages/admin/mahasiswa-edit.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Main wrapper backgrounds and inline styles
code = code.replace(
    /className="relative min-h-\[calc\(100svh-4rem\)\] overflow-x-hidden bg-slate-950 text-slate-100"[\s\S]*?opacity-\[0\.18\]" \/>/m,
    `className="relative min-h-[calc(100svh-4rem)] overflow-x-hidden text-neutral-900 dark:text-neutral-100"`
);

// 2. Header
code = code.replace(
    /className="sticky top-0 z-40 border-b border-emerald-500\/20 bg-slate-950\/90 backdrop-blur-xl"/g,
    `className="sticky top-0 z-40 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl"`
);

// 3. Main container cards
code = code.replace(
    /rounded-3xl border border-slate-700\/60 bg-slate-900\/70 p-(4|5) shadow-xl shadow-black\/30/g,
    `rounded-3xl border border-white/20 bg-white/40 dark:border-neutral-800 dark:bg-neutral-900/40 p-$1 shadow-xl backdrop-blur-xl`
);

// 4. Input fields, textareas, simple boxes
// Be careful with exact matches
code = code.replace(/bg-slate-900\/70/g, 'bg-white/60 dark:bg-neutral-800/60');
code = code.replace(/bg-slate-800\/60/g, 'bg-white/50 dark:bg-neutral-800/50');
code = code.replace(/bg-slate-800\/80/g, 'bg-white/80 dark:bg-neutral-800/80');
code = code.replace(/bg-slate-800/g, 'bg-neutral-100 dark:bg-neutral-800');
code = code.replace(/bg-slate-950\/50/g, 'bg-neutral-50/50 dark:bg-neutral-950/50');
code = code.replace(/bg-slate-950/g, 'bg-white dark:bg-neutral-950');
code = code.replace(/bg-slate-900/g, 'bg-white dark:bg-neutral-900');

// Text colors
code = code.replace(/text-slate-100/g, 'text-neutral-900 dark:text-white');
code = code.replace(/text-slate-300/g, 'text-neutral-700 dark:text-neutral-300');
code = code.replace(/text-slate-400/g, 'text-neutral-500 dark:text-neutral-400');
code = code.replace(/text-slate-500/g, 'text-neutral-400 dark:text-neutral-500');
code = code.replace(/text-slate-600/g, 'text-neutral-400 dark:text-neutral-500');

// Borders
code = code.replace(/border-slate-700\/60/g, 'border-neutral-200 dark:border-neutral-700/60');
code = code.replace(/border-slate-700\/70/g, 'border-neutral-200 dark:border-neutral-700/70');
code = code.replace(/border-slate-700/g, 'border-neutral-200 dark:border-neutral-700');
code = code.replace(/border-slate-500/g, 'border-neutral-300 dark:border-neutral-600');

// Specific text-white inside inputs that breaks Light Mode
code = code.replace(/text-white transition outline-none/g, 'text-neutral-900 dark:text-white transition outline-none');
code = code.replace(/text-white placeholder-slate-400\/70/g, 'text-neutral-900 dark:text-white placeholder-neutral-400');

fs.writeFileSync(file, code);
console.log('Transformation complete!');
