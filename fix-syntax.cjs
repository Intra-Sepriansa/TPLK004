const fs = require('fs');
const file = 'resources/js/pages/admin/mahasiswa-edit.tsx';
let code = fs.readFileSync(file, 'utf8');

// Fix 1: Outer div wrapper
code = code.replace(
    /<div\s+className="relative min-h-\[calc\(100svh-4rem\)\] overflow-x-hidden text-neutral-900 dark:text-neutral-100"\s*<motion\.div\s+variants=\{itemVariants\}/m,
    `<motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="p-4 md:p-6 lg:p-8 space-y-6 relative min-h-[calc(100svh-4rem)] overflow-x-hidden text-neutral-900 dark:text-neutral-100"
            >
                <motion.div
                    variants={itemVariants}`
);

// Fix 2: The dangling '>' left from motion.header
code = code.replace(
    /<div className="relative">\s*>\s*<div className="flex flex-col gap-4 w-full">/m,
    `<div className="relative">
                    <div className="flex flex-col gap-4 w-full">`
);

fs.writeFileSync(file, code);
console.log('Syntax fixed!');
