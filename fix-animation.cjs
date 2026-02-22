const fs = require('fs');
const file = 'resources/js/pages/admin/mahasiswa-edit.tsx';
let code = fs.readFileSync(file, 'utf8');

const variants = `
const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export default function MahasiswaEdit`;

if (!code.includes('containerVariants')) {
    code = code.replace('export default function MahasiswaEdit', variants);
}

// Replace the main wrapper div
code = code.replace(
    /<div\s+className="relative min-h-\[calc\(100svh-4rem\)\] overflow-x-hidden text-neutral-900 dark:text-neutral-100">\s*<motion\.header/m,
    `<motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="p-4 md:p-6 lg:p-8 space-y-6 relative min-h-[calc(100svh-4rem)] overflow-x-hidden text-neutral-900 dark:text-neutral-100"
            >
                <motion.header`
);
// replace closing tag of the main wrapper div (just before </AppLayout>)
// Find the last </div> before </AppLayout>
const appLayoutIdx = code.lastIndexOf('</AppLayout>');
if (appLayoutIdx !== -1) {
    const lastDivIdx = code.lastIndexOf('</div>', appLayoutIdx);
    if (lastDivIdx !== -1) {
        code = code.substring(0, lastDivIdx) + '</motion.div>' + code.substring(lastDivIdx + 6);
    }
}

// Header replacement
const animatedBg = `
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
                    <div className="relative">
`;

code = code.replace(
    /<motion\.header\s+initial=\{\{ opacity: 0, y: -20 \}\}\s+animate=\{\{ opacity: 1, y: 0 \}\}\s+className="sticky top-0 z-40 border-b border-neutral-200 dark:border-neutral-800 bg-white\/80 dark:bg-neutral-950\/80 backdrop-blur-xl"/m,
    `<motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl p-6 lg:p-8 text-white shadow-2xl mb-6 flex-shrink-0"
                >
${animatedBg}`
);

// Close the inner <div className="relative"> added in the header replacement
code = code.replace(/<\/motion\.header>/, '</div>\n                </motion.div>');

// Now clean up text colors inside the header since it has a dark gradient.
// We'll replace text-neutral-900 dark:text-white with just text-white in that specific block.
// We can't easily do it by regex block, but we know the classes for the header texts.
// Let's use string replacement for standard classes that break the gradient header UI.
// Fortunately, Tailwind cascades text colors well if we drop dark:text-* and text-neutral-*.

code = code.replace(
    /className="mx-auto flex w-full max-w-\[1600px\] flex-col gap-4 px-4 py-4 lg:px-6"/,
    'className="flex flex-col gap-4 w-full"'
);

// Replace sidebars
code = code.replace(
    /<motion\.aside\s+initial=\{\{ opacity: 0, x: -20 \}\}\s+animate=\{\{ opacity: 1, x: 0 \}\}\s+transition=\{\{ duration: 0\.45, delay: 0\.05 \}\}/m,
    '<motion.aside variants={itemVariants}'
);

code = code.replace(
    /<motion\.section\s+initial=\{\{ opacity: 0, x: 24 \}\}\s+animate=\{\{ opacity: 1, x: 0 \}\}\s+transition=\{\{ duration: 0\.45, delay: 0\.08 \}\}/m,
    '<motion.section variants={itemVariants}'
);

fs.writeFileSync(file, code);
console.log('Fixed animations');
