const fs = require('fs');
const path = require('path');

const dir = 'resources/js/pages/admin/tugas/components';
const filesToProcess = ['Step3Grading.tsx', 'Step4Students.tsx', 'Step5Review.tsx', 'SidebarComponents.tsx'];

const colors = [
    { c: 'hover:shadow-amber-500/10', g: 'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10', glow: 'bg-amber-500' },
    { c: 'hover:shadow-violet-500/10', g: 'from-violet-500/5 to-purple-500/5 dark:from-violet-500/10 dark:to-purple-500/10', glow: 'bg-violet-500' },
    { c: 'hover:shadow-rose-500/10', g: 'from-rose-500/5 to-red-500/5 dark:from-rose-500/10 dark:to-red-500/10', glow: 'bg-rose-500' },
    { c: 'hover:shadow-emerald-500/10', g: 'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10', glow: 'bg-emerald-500' },
    { c: 'hover:shadow-fuchsia-500/10', g: 'from-fuchsia-500/5 to-pink-500/5 dark:from-fuchsia-500/10 dark:to-pink-500/10', glow: 'bg-fuchsia-500' },
    { c: 'hover:shadow-indigo-500/10', g: 'from-indigo-500/5 to-blue-500/5 dark:from-indigo-500/10 dark:to-blue-500/10', glow: 'bg-indigo-500' },
    { c: 'hover:shadow-cyan-500/10', g: 'from-cyan-500/5 to-sky-500/5 dark:from-cyan-500/10 dark:to-sky-500/10', glow: 'bg-cyan-500' }
];

let globalColorIdx = 0;

filesToProcess.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    if (!content.includes('GlassCard')) {
        content = content.replace(/(import .* from 'lucide-react';)/, "$1\nimport { GlassCard } from './GlassCard';");
    }

    const regex = /<div className="(?:bg-white\/40 dark:bg-neutral-900\/40 backdrop-blur-xl \s*border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-xl|bg-gradient-to-br from-slate-800\/50 to-slate-900\/50 \s*border border-slate-700 rounded-2xl p-6)(?: overflow-hidden)?">/g;

    let match;
    let matches = [];
    while ((match = regex.exec(content)) !== null) {
        matches.push({ start: match.index, end: match.index + match[0].length, string: match[0] });
    }

    for (let i = matches.length - 1; i >= 0; i--) {
        const m = matches[i];
        const color = colors[globalColorIdx % colors.length];
        globalColorIdx++;

        const hasOverflow = m.string.includes('overflow-hidden') ? ' className="overflow-hidden"' : '';
        const glassTag = `<GlassCard colorClass="${color.c}" gradientClass="${color.g}" glowClass="${color.glow}"${hasOverflow}>`;

        let openDivs = 1;
        let j = m.end;
        while (j < content.length && openDivs > 0) {
            if (content.substring(j, j + 4) === '<div') {
                // check if it's `<div` or `</div>`
                // but actually `</div` is not matched by `<div` because `<` is strictly followed by `div` and not `/`.
                openDivs++;
                j += 4;
            } else if (content.substring(j, j + 6) === '</div>') {
                openDivs--;
                if (openDivs === 0) {
                    content = content.substring(0, j) + '</GlassCard>' + content.substring(j + 6);
                    break;
                }
                j += 6;
            } else {
                j++;
            }
        }

        content = content.substring(0, m.start) + glassTag + content.substring(m.end);
    }

    fs.writeFileSync(filePath, content);
    console.log(`Rewrote ${file} - replaced ${matches.length} wrappers.`);
});
