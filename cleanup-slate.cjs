const fs = require('fs');
const file = 'resources/js/pages/admin/mahasiswa-edit.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/bg-slate-700\/70/g, 'bg-neutral-200 dark:bg-neutral-700/70');
code = code.replace(/bg-slate-700/g, 'bg-neutral-200 dark:bg-neutral-700');
code = code.replace(/text-slate-200/g, 'text-neutral-900 dark:text-neutral-200');
code = code.replace(/hover:text-slate-200/g, 'hover:text-neutral-900 dark:hover:text-neutral-200');
code = code.replace(/border-slate-600/g, 'border-neutral-300 dark:border-neutral-600');
code = code.replace(/hover:bg-slate-700/g, 'hover:bg-neutral-300 dark:hover:bg-neutral-700');
code = code.replace(/hover:border-slate-600/g, 'hover:border-neutral-300 dark:hover:border-neutral-600');

// Fix focus states that were missed
code = code.replace(/focus:border-emerald-500\/50 focus:bg-slate-800\/80 focus:ring-4 focus:ring-emerald-500\/10/g, 'focus:border-emerald-500/50 focus:bg-white dark:focus:bg-neutral-800/80 focus:ring-4 focus:ring-emerald-500/10');

fs.writeFileSync(file, code);
console.log('Final slate replacements executed');
