const fs = require('fs');
const file = 'resources/js/pages/admin/mahasiswa-edit.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Add Import
if (!code.includes("import ASCIITreeAnimation")) {
    code = code.replace(
        "import AppLayout from '@/layouts/app-layout';",
        "import AppLayout from '@/layouts/app-layout';\nimport ASCIITreeAnimation from '@/components/ASCIITreeAnimation';"
    );
}

// 2. Change lg:col-span-3 to lg:col-span-2 for the main content
code = code.replace(
    /className="lg:col-span-3"/,
    'className="lg:col-span-2"'
);

// 3. Inject ASCIITreeAnimation
const searchString = `                                {errors.photo && (
                                    <p className="text-sm text-red-500 mt-2">{errors.photo}</p>
                                )}
                            </div>`;

const replaceString = `                                {errors.photo && (
                                    <p className="text-sm text-red-500 mt-2">{errors.photo}</p>
                                )}
                            </div>

                            {/* ASCII Tree Animation Component */}
                            <div className="mt-6">
                                <ASCIITreeAnimation studentName={data.name || 'Student'} />
                            </div>`;

code = code.replace(searchString, replaceString);

fs.writeFileSync(file, code);
console.log('Inserted ASCII Tree and fixed grid.');
