import re

file_path = '/Users/intrasepriansa/Herd/TPLK004/resources/js/pages/admin/jadwal.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# Replace lucide-react imports
new_imports = """import {
    Calendar,
    Clock,
    Plus,
    Edit,
    RefreshCw,
    BookOpen,
    X,
    CheckCircle2,
    Hash,
    Type,
} from 'lucide-react';"""
content = re.sub(r"import \{\n(.*?)\n\} from 'lucide-react';", new_imports, content, flags=re.DOTALL)

# Remove recharts imports
content = re.sub(r"import \{\n(?:\s*[a-zA-Z]+,\n)+\s*\} from 'recharts';\n", "", content, flags=re.DOTALL)

# Replace PageProps interface
new_props = """interface PageProps {
    courses: Course[];
    flash?: { success?: string; error?: string };
}"""
content = re.sub(r"interface PageProps \{.*?\n\}\n", new_props, content, flags=re.DOTALL)

# Replace unused state and functions in AdminJadwal component
state_and_functions_regex = r"    const \[courseId, setCourseId\].*?const handleExportPdf = \(\) => \{\n        window\.open\([^)]+\);\n    \};\n"
content = re.sub(state_and_functions_regex, "", content, flags=re.DOTALL)

# Update AdminJadwal parameters
admin_jadwal_params_regex = r"export default function AdminJadwal\(\{.*?\}: PageProps\) \{"
new_admin_jadwal_params = "export default function AdminJadwal({ courses, flash }: PageProps) {"
content = re.sub(admin_jadwal_params_regex, new_admin_jadwal_params, content, flags=re.DOTALL)

with open(file_path, 'w') as f:
    f.write(content)

print("Imports and unused code cleaned!")
