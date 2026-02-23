import { useEffect } from 'react';

export const useKeyboardShortcuts = ({
    saveDraft,
    publishTask,
    openPreview,
    closeModal,
}: {
    saveDraft: () => void;
    publishTask: () => void;
    openPreview: () => void;
    closeModal: () => void;
}) => {
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                saveDraft();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                publishTask();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                openPreview();
            }
            if (e.key === 'Escape') {
                closeModal();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [saveDraft, publishTask, openPreview, closeModal]);
};
