import re

file_path = '/Users/intrasepriansa/Herd/TPLK004/resources/js/pages/admin/jadwal.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# I need to insert the state and form definitions right after `export default function AdminJadwal({ courses, flash }: PageProps) {`
state_code = """
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const addForm = useForm({
        course_id: '',
        meeting_number: 1,
        title: '',
        start_at: '',
        end_at: '',
    });

    const editForm = useForm({
        course_id: '',
        meeting_number: 1,
        title: '',
        start_at: '',
        end_at: '',
    });

    const submitAdd = (e: FormEvent) => {
        e.preventDefault();
        addForm.post('/admin/jadwal', {
            preserveScroll: true,
            onSuccess: () => {
                addForm.reset();
                setShowAddForm(false);
            },
        });
    };

    const submitEdit = (e: FormEvent) => {
        e.preventDefault();
        if (!editingId) return;
        editForm.patch(`/admin/jadwal/${editingId}`, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingId(null);
                setShowEditForm(false);
            },
        });
    };

    const formatLabel = (label: string) =>
        label.replace(/&laquo;/g, '«').replace(/&raquo;/g, '»').replace(/&amp;/g, '&').replace(/<[^>]*>/g, '');
"""

# Insert right after the function declaration
content = re.sub(r'(export default function AdminJadwal\(\{ courses, flash \}: PageProps\) \{)', r'\1\n' + state_code, content)

with open(file_path, 'w') as f:
    f.write(content)

print("Restored state and forms!")
