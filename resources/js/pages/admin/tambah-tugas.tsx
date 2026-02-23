import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

declare const route: any;
import { AnimatePresence } from 'framer-motion';
import { BookOpen, FileText, ClipboardList, Users, Eye } from 'lucide-react';

// Components
import { TugasHeader } from './tugas/components/TugasHeader';
import { StepWizard } from './tugas/components/StepWizard';
import { Step1BasicInfo } from './tugas/components/Step1BasicInfo';
import { Step2Description } from './tugas/components/Step2Description';
import { Step3Grading } from './tugas/components/Step3Grading';
import { Step4Students } from './tugas/components/Step4Students';
import { Step5Review } from './tugas/components/Step5Review';
import { SidebarComponents } from './tugas/components/SidebarComponents';

// Hooks
import { useAutoSave } from './tugas/hooks/useAutoSave';
import { useKeyboardShortcuts } from './tugas/hooks/useKeyboardShortcuts';

interface Props {
    courses: any[];
    templates: any[];
    students?: any[];
    groups?: any[];
}

export default function TambahTugas({ courses = [], templates = [], students = [], groups = [] }: Props) {
    const [currentStep, setCurrentStep] = useState(1);

    const { data, setData, post, processing, errors } = useForm({
        course_id: '',
        title: '',
        description: '',
        type: 'assignment',
        category: 'individual',
        points: 100,
        weight: 10,
        grading_method: 'rubric',
        rubrics: [{ id: 1, criteria: '', description: '', max_score: 100, weight: 100 }],
        selected_students: [],
        selected_groups: [],
        assignment_mode: 'all',
        attachments: [],
        publish_schedule: 'now',
        start_at: '',
        deadline: '',
        allow_late_submission: false,
        late_penalty: 0,
        late_penalty_days: 1,
        learning_objectives: [''],
        notifications: {
            send_notification: true,
            send_reminder: true,
            send_email: false,
        }
    });

    const { isSaving, lastSaved } = useAutoSave(data);

    const handleSaveDraft = async () => {
        // Implement draft saving logic via axios or Inertia route
        console.log('Saving draft...', data);
        // post('/admin/tugas/draft'); 
    };

    const handlePublish = () => {
        post('/admin/tugas', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                console.log('Tugas published successfully');
            }
        });
    };

    const handlePreview = () => {
        console.log('Previewing tugas:', data);
    };

    useKeyboardShortcuts({
        saveDraft: handleSaveDraft,
        publishTask: handlePublish,
        openPreview: handlePreview,
        closeModal: () => router.visit('/admin/tugas')
    });

    const isStepValid = (step: number) => {
        switch (step) {
            case 1:
                return data.course_id && data.title;
            case 2:
                return data.description.length >= 10;
            case 3:
                return data.grading_method === 'points' || (data.rubrics && data.rubrics.length > 0);
            case 4:
                if (data.assignment_mode === 'select') return data.selected_students.length > 0;
                if (data.assignment_mode === 'group') return data.selected_groups.length > 0;
                return true;
            case 5:
                return data.deadline !== '';
            default:
                return true;
        }
    };

    const nextStep = () => {
        if (currentStep < 5 && isStepValid(currentStep)) setCurrentStep(step => step + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(step => step - 1);
    };

    const steps = [
        { id: 1, title: 'Info Dasar', description: 'Mata kuliah & judul', icon: BookOpen, isCompleted: currentStep > 1, isActive: currentStep === 1 },
        { id: 2, title: 'Deskripsi', description: 'Detail & lampiran', icon: FileText, isCompleted: currentStep > 2, isActive: currentStep === 2 },
        { id: 3, title: 'Penilaian', description: 'Rubrik & poin', icon: ClipboardList, isCompleted: currentStep > 3, isActive: currentStep === 3 },
        { id: 4, title: 'Mahasiswa', description: 'Penugasan peserta', icon: Users, isCompleted: currentStep > 4, isActive: currentStep === 4 },
        { id: 5, title: 'Review', description: 'Pratinjau akhir', icon: Eye, isCompleted: currentStep > 5, isActive: currentStep === 5 },
    ];

    const selectedCourse = courses.find(c => c.id === data.course_id);

    return (
        <AppLayout>
            <Head title="Buat Tugas Baru" />

            <div className="space-y-6 p-6 pb-32 max-w-[1600px] mx-auto">

                <TugasHeader
                    currentStep={currentStep}
                    totalSteps={5}
                    isDraft={true}
                    isSaving={isSaving}
                    lastSaved={lastSaved}
                    onBack={() => router.visit('/admin/tugas')}
                    onSaveDraft={handleSaveDraft}
                    onPreview={handlePreview}
                    onPublish={handlePublish}
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        <StepWizard steps={steps} currentStep={currentStep} />

                        {errors && Object.keys(errors).length > 0 && (
                            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm mb-4">
                                Terdapat error pada isian data Anda. Silakan periksa kembali formulir.
                                <ul className="list-disc ml-5 mt-2">
                                    {Object.values(errors).map((err, idx) => (
                                        <li key={idx}>{(err as string)}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="flex-1 min-h-[400px]">
                            <AnimatePresence mode="wait">
                                {currentStep === 1 && <Step1BasicInfo key="step1" data={data} setData={setData} courses={courses} />}
                                {currentStep === 2 && <Step2Description key="step2" data={data} setData={setData} />}
                                {currentStep === 3 && <Step3Grading key="step3" data={data} setData={setData} />}
                                {currentStep === 4 && <Step4Students key="step4" data={data} setData={setData} students={students} groups={groups} />}
                                {currentStep === 5 && <Step5Review key="step5" data={data} setData={setData} courseName={selectedCourse?.name} />}
                            </AnimatePresence>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex items-center gap-4 mt-8 pt-6 border-t border-slate-800">
                            <button
                                onClick={prevStep}
                                disabled={currentStep === 1}
                                className="px-6 py-3 bg-white/40 hover:bg-white/50 dark:bg-neutral-900/40 dark:hover:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 backdrop-blur-xl 
                                    rounded-xl text-neutral-700 dark:text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Sebelumnya
                            </button>

                            <div className="flex-1" />

                            {currentStep < 5 ? (
                                <button
                                    onClick={nextStep}
                                    className={`px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 
                                        hover:from-indigo-500 hover:to-purple-500 rounded-xl text-white font-bold 
                                        shadow-lg shadow-indigo-500/25 transition-all
                                        ${!isStepValid(currentStep) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    Selanjutnya
                                </button>
                            ) : (
                                <button
                                    onClick={handlePublish}
                                    className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 
                                        hover:from-indigo-500 hover:to-purple-500 rounded-xl text-white font-bold 
                                        shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2"
                                >
                                    {processing ? 'Menyimpan...' : 'Publikasikan Tugas'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="lg:col-span-4 h-full">
                        <div className="sticky top-28">
                            <SidebarComponents
                                data={data}
                                courseName={selectedCourse?.name}
                                studentCount={students.length}
                                templates={templates}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
