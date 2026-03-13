import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { common, createLowlight } from 'lowlight';
import {
    Bold,
    CheckSquare,
    Code,
    Heading1,
    Heading2,
    Heading3,
    Highlighter,
    Italic,
    List,
    ListOrdered,
    Mic,
    MicOff,
    Quote,
    Redo,
    Strikethrough,
    Undo,
} from 'lucide-react';
import { useEffect, useState } from 'react';

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
        <div className="flex flex-wrap items-center gap-1 rounded-t-xl border-b border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-900/50">
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={`rounded p-2 transition-colors hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive('bold') ? 'bg-slate-200 text-teal-600 dark:bg-slate-800' : 'text-slate-600 dark:text-slate-400'}`}
                title="Bold"
            >
                <Bold className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={`rounded p-2 transition-colors hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive('italic') ? 'bg-slate-200 text-teal-600 dark:bg-slate-800' : 'text-slate-600 dark:text-slate-400'}`}
                title="Italic"
            >
                <Italic className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                disabled={!editor.can().chain().focus().toggleStrike().run()}
                className={`rounded p-2 transition-colors hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive('strike') ? 'bg-slate-200 text-teal-600 dark:bg-slate-800' : 'text-slate-600 dark:text-slate-400'}`}
                title="Strikethrough"
            >
                <Strikethrough className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                className={`rounded p-2 transition-colors hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive('highlight') ? 'bg-slate-200 text-teal-600 dark:bg-slate-800' : 'text-slate-600 dark:text-slate-400'}`}
                title="Highlight"
            >
                <Highlighter className="h-4 w-4" />
            </button>

            <div className="mx-1 h-6 w-px bg-slate-300 dark:bg-slate-700" />

            <button
                type="button"
                onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
                className={`rounded p-2 transition-colors hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive('heading', { level: 1 }) ? 'bg-slate-200 text-teal-600 dark:bg-slate-800' : 'text-slate-600 dark:text-slate-400'}`}
                title="Heading 1"
            >
                <Heading1 className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                className={`rounded p-2 transition-colors hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-200 text-teal-600 dark:bg-slate-800' : 'text-slate-600 dark:text-slate-400'}`}
                title="Heading 2"
            >
                <Heading2 className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
                className={`rounded p-2 transition-colors hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive('heading', { level: 3 }) ? 'bg-slate-200 text-teal-600 dark:bg-slate-800' : 'text-slate-600 dark:text-slate-400'}`}
                title="Heading 3"
            >
                <Heading3 className="h-4 w-4" />
            </button>

            <div className="mx-1 h-6 w-px bg-slate-300 dark:bg-slate-700" />

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`rounded p-2 transition-colors hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive('bulletList') ? 'bg-slate-200 text-teal-600 dark:bg-slate-800' : 'text-slate-600 dark:text-slate-400'}`}
                title="Bullet List"
            >
                <List className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`rounded p-2 transition-colors hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive('orderedList') ? 'bg-slate-200 text-teal-600 dark:bg-slate-800' : 'text-slate-600 dark:text-slate-400'}`}
                title="Ordered List"
            >
                <ListOrdered className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleTaskList().run()}
                className={`rounded p-2 transition-colors hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive('taskList') ? 'bg-slate-200 text-teal-600 dark:bg-slate-800' : 'text-slate-600 dark:text-slate-400'}`}
                title="Task List"
            >
                <CheckSquare className="h-4 w-4" />
            </button>

            <div className="mx-1 h-6 w-px bg-slate-300 dark:bg-slate-700" />

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`rounded p-2 transition-colors hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive('blockquote') ? 'bg-slate-200 text-teal-600 dark:bg-slate-800' : 'text-slate-600 dark:text-slate-400'}`}
                title="Blockquote"
            >
                <Quote className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={`rounded p-2 transition-colors hover:bg-slate-200 dark:hover:bg-slate-800 ${editor.isActive('codeBlock') ? 'bg-slate-200 text-teal-600 dark:bg-slate-800' : 'text-slate-600 dark:text-slate-400'}`}
                title="Code Block"
            >
                <Code className="h-4 w-4" />
            </button>

            <div className="flex-1"></div>

            <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                className="rounded p-2 text-slate-600 transition-colors hover:bg-slate-200 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800"
                title="Undo"
            >
                <Undo className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                className="rounded p-2 text-slate-600 transition-colors hover:bg-slate-200 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800"
                title="Redo"
            >
                <Redo className="h-4 w-4" />
            </button>
        </div>
    );
};

export default function TipTapEditor({
    content,
    onChange,
    placeholder = 'Mulai menulis catatan...',
    editable = true,
}: TipTapEditorProps) {
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition =
                window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognitionInst = new SpeechRecognition();
                recognitionInst.continuous = true;
                recognitionInst.interimResults = true;
                recognitionInst.lang = 'id-ID';

                recognitionInst.onresult = (event: any) => {
                    let finalTranscript = '';
                    for (
                        let i = event.resultIndex;
                        i < event.results.length;
                        ++i
                    ) {
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
                        } catch (e) {}
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
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all focus-within:border-transparent focus-within:ring-2 focus-within:ring-indigo-500 dark:border-slate-700 dark:bg-neutral-900">
            {editable && <MenuBar editor={editor} />}
            <div className="max-h-[60vh] overflow-y-auto">
                <EditorContent editor={editor} />
            </div>

            {/* Voice Recording FAB (Floating Action Button) */}
            {editable && (
                <button
                    type="button"
                    onClick={toggleListening}
                    className={`absolute right-4 bottom-4 flex items-center justify-center rounded-full p-3 shadow-lg transition-all ${
                        isListening
                            ? 'animate-pulse bg-rose-500 text-white hover:bg-rose-600'
                            : 'bg-indigo-600 text-white hover:scale-105 hover:bg-indigo-700'
                    }`}
                    title={
                        isListening ? 'Berhenti merekam' : 'Mulai merekam suara'
                    }
                >
                    {isListening ? (
                        <MicOff className="h-5 w-5" />
                    ) : (
                        <Mic className="h-5 w-5" />
                    )}
                </button>
            )}
        </div>
    );
}
