const fs = require('fs');
const file = 'resources/js/pages/admin/mahasiswa-edit.tsx';
let code = fs.readFileSync(file, 'utf8');

// Add imports
if (!code.includes("import AppLayout")) {
    code = code.replace(
        "import { router, useForm } from '@inertiajs/react';",
        "import { Head, router, useForm } from '@inertiajs/react';\nimport AppLayout from '@/layouts/app-layout';"
    );
}

// Fix typo
code = code.replace(/text-neutral-900 dark:text-neutral-900 dark:text-white/g, "text-neutral-900 dark:text-white");

// Remove the standalone wrapper
// <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
code = code.replace(
    /<div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">/g,
    `<AppLayout>\n            <Head title="Edit Data Mahasiswa" />\n            <div className="relative min-h-[calc(100svh-4rem)] overflow-x-hidden text-neutral-900 dark:text-neutral-100">`
);

// End </div> becomes </div></AppLayout>
// We need to match the very last </div> before the final }
const lastIndex = code.lastIndexOf('</div>');
if (lastIndex !== -1) {
    code = code.substring(0, lastIndex) + '</div>\n        </AppLayout>' + code.substring(lastIndex + 6);
}

fs.writeFileSync(file, code);
console.log('Fixed new wrapper');
