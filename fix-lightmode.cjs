const fs = require('fs');
const file = 'resources/js/pages/admin/mahasiswa-edit.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace all text-white inside cards but AVOID the header block.
// We'll replace it globally except for buttons and the header gradient block.
// Wait, we know the header ends around line 1162. Let's split.

const mainIdx = code.indexOf('<main');
let headerChunk = code.substring(0, mainIdx);
let mainChunk = code.substring(mainIdx);

// In mainChunk, safely replace text-white with adaptive color
mainChunk = mainChunk.replace(/text-white(?! transition)/g, 'text-neutral-900 dark:text-white');
// Wait, the "Save" sticky button at the bottom has text-white, let's restore it
mainChunk = mainChunk.replace(/text-neutral-900 dark:text-white shadow-lg/g, 'text-white shadow-lg');
mainChunk = mainChunk.replace(/text-neutral-900 dark:text-white\s*\n\s*Simpan\s*\n\s*<\/motion\.button>/g, 'text-white\n                        Simpan\n                    </motion.button>');

// Replace text-emerald-300 with emerald-600 in light mode
mainChunk = mainChunk.replace(/text-emerald-300/g, 'text-emerald-600 dark:text-emerald-400');
mainChunk = mainChunk.replace(/text-sky-300/g, 'text-sky-600 dark:text-sky-400');
mainChunk = mainChunk.replace(/text-amber-300/g, 'text-amber-600 dark:text-amber-400');
mainChunk = mainChunk.replace(/text-rose-300/g, 'text-rose-600 dark:text-rose-400');
mainChunk = mainChunk.replace(/text-violet-300/g, 'text-violet-600 dark:text-violet-400');

// Restore the active tabs if they got messed up since they're in mainChunk
// Well, tabs use text-white? Yes, maybe `shadow-emerald-500/30 text-emerald-900 dark:text-white`
// No, the tabs were using text-neutral-500 dark:text-neutral-400

code = headerChunk + mainChunk;
fs.writeFileSync(file, code);
console.log('Fixed text-white visibility issue');
