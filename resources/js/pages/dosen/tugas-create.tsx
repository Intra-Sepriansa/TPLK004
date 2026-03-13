import TugasCreateForm from '@/components/tugas/create/tugas-create-form';
import DosenLayout from '@/layouts/dosen-layout';
import { Head } from '@inertiajs/react';

type CourseOption = {
    id: number;
    name: string;
};

type AvailableTask = {
    id: number;
    title: string;
    subtitle?: string;
    priority?: string;
};

type TemplateItem = {
    id: number;
    name: string;
    description?: string | null;
    category?: string | null;
    usage_count?: number;
    is_favorite?: boolean;
    fields?: {
        title_pattern?: string;
        description_template?: string;
        default_duration?: number;
        default_priority?: string;
        schedule_type?: 'immediate' | 'scheduled' | 'recurring';
    };
};

interface DosenTugasCreateProps {
    courses: CourseOption[];
    templates: TemplateItem[];
    availableTasks: AvailableTask[];
}

export default function DosenTugasCreate({
    courses,
    templates,
    availableTasks,
}: DosenTugasCreateProps) {
    return (
        <DosenLayout>
            <Head title="Tambah Tugas Baru" />
            <TugasCreateForm
                mode="dosen"
                pageTitle="Tambah Tugas Baru"
                description="Buat tugas baru dengan fitur automasi cerdas, template system, dan AI-powered suggestions."
                backUrl="/dosen/tugas"
                listUrl="/dosen/tugas"
                basePath="/dosen/tugas/create"
                courses={courses}
                templates={templates}
                availableTasks={availableTasks}
                showCollaboration
                showWeight
            />
        </DosenLayout>
    );
}
