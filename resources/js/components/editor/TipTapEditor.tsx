import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Link from '@tiptap/extension-link';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { useEffect, useState } from 'react';
import {
    Bold, Italic, Strikethrough, Code, Heading1, Heading2, Heading3,
    List, ListOrdered, Quote, Undo, Redo, CheckSquare, Highlighter, Link as LinkIcon,
    Mic, MicOff
} from 'lucide-react';

// Extend window object for SpeechRecognition
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

const lowlight = createLowlight(common);

interface TipTapEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    editable?: boolean;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-t-xl">
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${editor.isActive('bold') ? 'bg-slate-200 dark:bg-slate-800 text-teal-600' : 'text-slate-600 dark:text-slate-400'}`}
                title="Bold"
            >
                <Bold className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${editor.isActive('italic') ? 'bg-slate-200 dark:bg-slate-800 text-teal-600' : 'text-slate-600 dark:text-slate-400'}`}
                title="Italic"
            >
                <Italic className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                disabled={!editor.can().chain().focus().toggleStrike().run()}
                className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${editor.isActive('strike') ? 'bg-slate-200 dark:bg-slate-800 text-teal-600' : 'text-slate-600 dark:text-slate-400'}`}
                title="Strikethrough"
            >
                <Strikethrough className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${editor.isActive('highlight') ? 'bg-slate-200 dark:bg-slate-800 text-teal-600' : 'text-slate-600 dark:text-slate-400'}`}
                title="Highlight"
            >
                <Highlighter className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1" />

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-slate-200 dark:bg-slate-800 text-teal-600' : 'text-slate-600 dark:text-slate-400'}`}
                title="Heading 1"
            >
                <Heading1 className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-200 dark:bg-slate-800 text-teal-600' : 'text-slate-600 dark:text-slate-400'}`}
                title="Heading 2"
            >
                <Heading2 className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-slate-200 dark:bg-slate-800 text-teal-600' : 'text-slate-600 dark:text-slate-400'}`}
                title="Heading 3"
            >
                <Heading3 className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1" />

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${editor.isActive('bulletList') ? 'bg-slate-200 dark:bg-slate-800 text-teal-600' : 'text-slate-600 dark:text-slate-400'}`}
                title="Bullet List"
            >
                <List className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${editor.isActive('orderedList') ? 'bg-slate-200 dark:bg-slate-800 text-teal-600' : 'text-slate-600 dark:text-slate-400'}`}
                title="Ordered List"
            >
                <ListOrdered className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleTaskList().run()}
                className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${editor.isActive('taskList') ? 'bg-slate-200 dark:bg-slate-800 text-teal-600' : 'text-slate-600 dark:text-slate-400'}`}
                title="Task List"
            >
                <CheckSquare className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1" />

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${editor.isActive('blockquote') ? 'bg-slate-200 dark:bg-slate-800 text-teal-600' : 'text-slate-600 dark:text-slate-400'}`}
                title="Blockquote"
            >
                <Quote className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={`p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${editor.isActive('codeBlock') ? 'bg-slate-200 dark:bg-slate-800 text-teal-600' : 'text-slate-600 dark:text-slate-400'}`}
                title="Code Block"
            >
                <Code className="w-4 h-4" />
            </button>

            <div className="flex-1"></div>

            <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400 disabled:opacity-50"
                title="Undo"
            >
                <Undo className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400 disabled:opacity-50"
                title="Redo"
            >
                <Redo className="w-4 h-4" />
            </button>
        </div>
    );
};

export default function TipTapEditor({ content, onChange, placeholder = 'Mulai menulis catatan...', editable = true }: TipTapEditorProps) {
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognitionInst = new SpeechRecognition();
                recognitionInst.continuous = true;
                recognitionInst.interimResults = true;
                recognitionInst.lang = 'id-ID';

                recognitionInst.onresult = (event: any) => {
                    let finalTranscript = '';
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalTranscript += event.results[i][0].transcript;
                        }
                    }
                    if (finalTranscript && editor) {
                        editor.commands.insertContent(finalTranscript + ' ');
                    }
                };

                recognitionInst.onerror = (event: any) => {
                    console.error('Speech recognition error', event.error);
                    setIsListening(false);
                };

                recognitionInst.onend = () => {
                    if (isListening) {
                        // Restart if still marked as listening
                        try {
                            recognitionInst.start();
                        } catch (e) { }
                    }
                };

                setRecognition(recognitionInst);
            }
        }
    }, [isListening]);

    const toggleListening = () => {
        if (!recognition) {
            alert('Browser tidak mendukung voice-to-text.');
            return;
        }

        if (isListening) {
            recognition.stop();
            setIsListening(false);
        } else {
            try {
                recognition.start();
                setIsListening(true);
            } catch (e) {
                console.error(e);
            }
        }
    };

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder,
            }),
            Highlight,
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Link.configure({
                openOnClick: false,
            }),
            CodeBlockLowlight.configure({
                lowlight,
            }),
        ],
        content: content,
        editable: editable,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[300px] p-4',
            },
        },
    });

    // Fix editor infinite updates loop
    useEffect(() => {
        if (editor && editor.getHTML() !== content) {
            editor.commands.setContent(content, { emitUpdate: false });
        }
    }, [content, editor]);

    return (
        <div className="relative border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-neutral-900 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all shadow-sm">
            {editable && <MenuBar editor={editor} />}
            <div className="overflow-y-auto max-h-[60vh]">
                <EditorContent editor={editor} />
            </div>

            {/* Voice Recording FAB (Floating Action Button) */}
            {editable && (
                <button
                    type="button"
                    onClick={toggleListening}
                    className={`absolute bottom-4 right-4 p-3 rounded-full flex items-center justify-center shadow-lg transition-all ${isListening
                        ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-105'
                        }`}
                    title={isListening ? 'Berhenti merekam' : 'Mulai merekam suara'}
                >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
            )}
        </div>
    );
}
