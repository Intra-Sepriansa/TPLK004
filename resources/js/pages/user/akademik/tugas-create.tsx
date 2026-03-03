import { Head } from '@inertiajs/react';
import TugasCreateForm from '@/components/tugas/create/tugas-create-form';
import StudentLayout from '@/layouts/student-layout';

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

interface UserTugasCreateProps {
    courses: CourseOption[];
    templates: TemplateItem[];
    availableTasks: AvailableTask[];
}

export default function UserTugasCreate({ courses, templates, availableTasks }: UserTugasCreateProps) {
    return (
        <StudentLayout>
            <Head title="Tambah Tugas Pribadi" />
            <TugasCreateForm
                mode="mahasiswa"
                pageTitle="Tambah Tugas Pribadi"
                description="Tambahkan pengingat tugas pribadi dengan dukungan AI suggestions, template, dan automasi jadwal."
                backUrl="/user/akademik/tugas"
                listUrl="/user/akademik/tugas"
                basePath="/user/akademik/tugas/create"
                courses={courses}
                templates={templates}
                availableTasks={availableTasks}
                showCollaboration={false}
                showWeight={false}
            />
        </StudentLayout>
    );
}
