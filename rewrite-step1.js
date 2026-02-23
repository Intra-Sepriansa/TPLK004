const fs = require('fs');

const file = 'resources/js/pages/admin/tugas/components/Step1BasicInfo.tsx';
let content = fs.readFileSync(file, 'utf-8');

// The basic container is currently:
// <div className="bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl \n                border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-xl">
//
// We want to replace each one with a colorful container. Since there are exactly 6 such containers in Step1BasicInfo.tsx, we can replace them sequentially.

const colors = [
  { name: 'indigo', twfrom: 'from-indigo-500/5', twto: 'to-blue-500/5', darkfrom: 'dark:from-indigo-500/10', darkto: 'dark:to-blue-500/10', glow: 'bg-indigo-500' },
  { name: 'violet', twfrom: 'from-violet-500/5', twto: 'to-purple-500/5', darkfrom: 'dark:from-violet-500/10', darkto: 'dark:to-purple-500/10', glow: 'bg-violet-500' },
  { name: 'emerald', twfrom: 'from-emerald-500/5', twto: 'to-teal-500/5', darkfrom: 'dark:from-emerald-500/10', darkto: 'dark:to-teal-500/10', glow: 'bg-emerald-500' },
  { name: 'fuchsia', twfrom: 'from-fuchsia-500/5', twto: 'to-pink-500/5', darkfrom: 'dark:from-fuchsia-500/10', darkto: 'dark:to-pink-500/10', glow: 'bg-fuchsia-500' },
  { name: 'amber', twfrom: 'from-amber-500/5', twto: 'to-orange-500/5', darkfrom: 'dark:from-amber-500/10', darkto: 'dark:to-orange-500/10', glow: 'bg-amber-500' },
  { name: 'cyan', twfrom: 'from-cyan-500/5', twto: 'to-sky-500/5', darkfrom: 'dark:from-cyan-500/10', darkto: 'dark:to-sky-500/10', glow: 'bg-cyan-500' },
];

let index = 0;
const defaultWrapper = `<div className="bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl \n                border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-xl">`;

const parts = content.split(defaultWrapper);

if (parts.length === 7) {
    let newContent = parts[0];
    for (let i = 1; i < parts.length; i++) {
        const c = colors[i - 1];
        const newWrapper = `<div className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-${c.name}-500/10 dark:border-white/5">
                {/* Glow Background animated */}
                <div className="absolute inset-0 bg-gradient-to-br ${c.twfrom} ${c.twto} ${c.darkfrom} ${c.darkto} opacity-50 transition-opacity duration-500 group-hover:opacity-100" />
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -right-10 -top-10 h-32 w-32 rounded-full ${c.glow} blur-3xl"
                    style={{ pointerEvents: 'none' }}
                />
                <div className="relative z-10 w-full">`;
        
        let p = parts[i];
        
        // We need to close the extra div we opened for z-10. Wait, the original div was just a wrapper.
        // We replaced `<div ...>` with `<div ...><div bg /><motion.div /><div relative z-10>`.
        // We need to append `</div>` just before the closing `</div>` of this block.
        // Finding the matching closing </div> is tricky with string replacing, but we can do it with regex or just trusting the structure.
        // Since the structure of each section is quite straightforward, we can find the end of the div.
        // Wait, the easiest way is to add `</div>` where the section ends.
        
        // Let's use string manipulation to find the last `</div>` before the next wrapper or end of file.
        // Or we can just use `React.createElement` or rewrite the file safely.
    }
}
