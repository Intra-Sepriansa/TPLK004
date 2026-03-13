import { useEffect, useState } from 'react';

export const useAutoSave = (data: any, interval: number = 30000) => {
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    useEffect(() => {
        const timer = setInterval(async () => {
            setIsSaving(true);
            try {
                // await axios.post('/api/tugas/draft', data);
                // setLastSaved(new Date());
            } catch (error) {
                console.error('Auto-save failed:', error);
            } finally {
                setIsSaving(false);
            }
        }, interval);

        return () => clearInterval(timer);
    }, [data, interval]);

    return { isSaving, lastSaved };
};
