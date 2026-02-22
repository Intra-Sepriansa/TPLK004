const fs = require('fs');
const file = 'resources/js/pages/admin/mahasiswa-edit.tsx';
let code = fs.readFileSync(file, 'utf8');

const photoBlock = `
                                {/* Photo Preview */}
                                <motion.div
                                    className="relative aspect-square rounded-2xl overflow-hidden mb-4 group bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center border-4 border-white/20"
                                    whileHover={{ scale: 1.02 }}
                                >
                                    {photoPreview ? (
                                        <img
                                            src={photoPreview.startsWith('http') || photoPreview.startsWith('data:') ? photoPreview : \`/storage/\${photoPreview}\`}
                                            alt={data.name || 'Foto Profil'}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-600/10">
                                            <span className="font-display text-7xl text-indigo-400/70">
                                                {(data.name || 'M').charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Camera className="h-4 w-4 mr-2" />
                                            Ganti Foto
                                        </Button>
                                    </div>
                                </motion.div>`;

// Regex to replace the old photo preview block
code = code.replace(
    /\{\/\* Photo Preview \*\/\}[\s\S]*?<div className="absolute inset-0 bg-black\/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">[\s\S]*?<\/div>\s*<\/motion\.div>/m,
    photoBlock
);

fs.writeFileSync(file, code);
console.log('Fixed photo preview');
