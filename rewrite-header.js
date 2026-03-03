const fs = require('fs');

const tp = 'resources/js/pages/admin/tugas/components/TugasHeader.tsx';
let content = fs.readFileSync(tp, 'utf8');

const targetReplacement = `<div className="fixed top-0 left-0 right-0 h-20 z-50 overflow-hidden
            border-b border-white/10 shadow-lg shadow-indigo-500/20">

            {/* Animated Gradient Background */}
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
                style={{
                    backgroundSize: '200% 200%',
                }}
            />

            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />`;

const newHeader = `<motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
            className="fixed top-4 left-4 right-4 z-50 overflow-hidden rounded-3xl p-4 text-white shadow-2xl"
        >
            {/* Animated Gradient Background */}
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
                style={{
                    backgroundSize: '200% 200%',
                }}
            />

            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30 pointer-events-none" />
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />

            {/* Pulsating Rings */}
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className="absolute right-16 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-white/10 pointer-events-none"
                    animate={{ scale: [1, 3], opacity: [0.3, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: i * 1 }}
                />
            ))}
`;

content = content.replace(targetReplacement, newHeader);

const targetContainer = `<div className="container mx-auto h-full px-6 flex items-center justify-between relative z-10">`;
const newContainer = `<div className="container mx-auto flex items-center justify-between relative z-10">`;
content = content.replace(targetContainer, newContainer);

// Also need to change the final `</div>` to `</motion.div>`
const parts = content.split('</div>');
if (parts.length > 2) {
    // The last `</div>` before the final `);` is the main wrapper closing.
    parts[parts.length - 2] = parts[parts.length - 2].replace(/\n {8}$/, '\n        </motion.div>');
    content = parts.join('</div>');
    // But since `</div>` is split, the join will restore them. 
    // Actually, just a simple replace at the end will do:
}

fs.writeFileSync(tp, content);
