const fs = require('fs');
const file = 'resources/js/pages/admin/mahasiswa-edit.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Fix Outer Wrapper padding
code = code.replace(
    /className="p-4 md:p-6 lg:p-8 space-y-6 relative min-h-\[calc\(100svh-4rem\)\] overflow-x-hidden text-neutral-900 dark:text-neutral-100"/,
    'className="p-4 lg:p-6 space-y-6 relative min-h-[calc(100svh-4rem)] overflow-x-hidden text-neutral-900 dark:text-neutral-100"'
);

// 2. Fix the <main> double padding
code = code.replace(
    /<main className="mx-auto grid w-full max-w-\[1600px\] grid-cols-1 gap-6 px-4 pt-6 pb-32 lg:grid-cols-10 lg:px-6">/,
    '<main className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-6 pb-32 lg:grid-cols-10">'
);

// Extract the header block to fix text colors
const headerStartIdx = code.indexOf('<motion.div\n                    variants={itemVariants}\n                    className="relative overflow-hidden rounded-3xl p-6 lg:p-8 text-white shadow-2xl mb-6 flex-shrink-0"');
const headerEndIdx = code.indexOf('</motion.div>', headerStartIdx + 300) + 13; // We find the first ending motion.div which is within the header

let headerChunk = code.substring(headerStartIdx, headerEndIdx);
if (headerStartIdx > -1 && headerEndIdx > headerStartIdx) {
    // 3. Fix text colors in the gradient header
    headerChunk = headerChunk.replace(/text-neutral-500 dark:text-neutral-400/g, 'text-white/70');
    headerChunk = headerChunk.replace(/text-neutral-400 dark:text-neutral-500/g, 'text-white/50');
    headerChunk = headerChunk.replace(/text-neutral-700 dark:text-neutral-300/g, 'text-white/90');
    headerChunk = headerChunk.replace(/text-neutral-900 dark:text-white/g, 'text-white');
    headerChunk = headerChunk.replace(/text-emerald-400/g, 'text-emerald-300'); // make emerald lighter on dark bg
    headerChunk = headerChunk.replace(/border-emerald-500\/30 bg-emerald-500\/10/g, 'border-white/20 bg-white/10 text-white');

    // Fix Cancel Button
    headerChunk = headerChunk.replace(
        /border-neutral-200 dark:border-neutral-700 bg-white\/80 dark:bg-neutral-800\/80 px-4 py-2\.5 text-sm font-semibold text-white\/90 transition hover:border-neutral-300 dark:border-neutral-600/,
        'border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20'
    );

    // Fix Delete Button
    headerChunk = headerChunk.replace(
        /border-rose-500\/30 bg-rose-500\/10 px-4 py-2\.5 text-sm font-semibold text-rose-300 transition hover:border-rose-500\/50 hover:bg-rose-500\/20/,
        'border-rose-500/30 bg-rose-500/20 px-4 py-2.5 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/40'
    );

    code = code.substring(0, headerStartIdx) + headerChunk + code.substring(headerEndIdx);
}

fs.writeFileSync(file, code);
console.log('Layout fixed!');
