import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';

interface AttendanceRecord {
    date: string;
    course: string;
    status: string;
    checkInTime: string | null;
}

interface StudentInfo {
    id?: number;
    name?: string;
    nama?: string;
    nim: string;
}

interface PDFGeneratorProps {
    student: StudentInfo;
    records: AttendanceRecord[];
    stats: {
        present: number;
        absent: number;
        late: number;
        pending?: number;
        total: number;
        streak?: number;
        longestStreak?: number;
    };
}

export function PDFGenerator({ student, records, stats }: PDFGeneratorProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    const generatePDF = async () => {
        setIsGenerating(true);

        try {
            // Create a printable HTML content
            const studentName = student.name || student.nama || 'Mahasiswa';
            const content = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Rekap Kehadiran - ${studentName}</title>
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { font-family: Arial, sans-serif; padding: 40px; color: #1f2937; }
                        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #10b981; padding-bottom: 20px; }
                        .header h1 { font-size: 24px; color: #10b981; margin-bottom: 5px; }
                        .header p { color: #6b7280; }
                        .student-info { margin-bottom: 30px; }
                        .student-info h2 { font-size: 18px; margin-bottom: 10px; }
                        .student-info p { color: #4b5563; margin-bottom: 5px; }
                        .stats { display: flex; gap: 20px; margin-bottom: 30px; }
                        .stat-box { flex: 1; padding: 15px; border-radius: 8px; text-align: center; }
                        .stat-box.present { background: #d1fae5; color: #065f46; }
                        .stat-box.absent { background: #fee2e2; color: #991b1b; }
                        .stat-box.late { background: #fef3c7; color: #92400e; }
                        .stat-box .value { font-size: 28px; font-weight: bold; }
                        .stat-box .label { font-size: 12px; text-transform: uppercase; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
                        th { background: #f9fafb; font-weight: 600; }
                        .status { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
                        .status.present { background: #d1fae5; color: #065f46; }
                        .status.absent { background: #fee2e2; color: #991b1b; }
                        .status.late { background: #fef3c7; color: #92400e; }
                        .footer { margin-top: 40px; text-align: center; color: #9ca3af; font-size: 12px; }
                        @media print { body { padding: 20px; } }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>TPLK004 - Sistem Absensi AI</h1>
                        <p>Rekap Kehadiran Mahasiswa</p>
                    </div>
                    
                    <div class="student-info">
                        <h2>${studentName}</h2>
                        <p>NIM: ${student.nim}</p>
                        <p>Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}</p>
                    </div>
                    
                    <div class="stats">
                        <div class="stat-box present">
                            <div class="value">${stats.present}</div>
                            <div class="label">Hadir</div>
                        </div>
                        <div class="stat-box late">
                            <div class="value">${stats.late}</div>
                            <div class="label">Terlambat</div>
                        </div>
                        <div class="stat-box absent">
                            <div class="value">${stats.absent}</div>
                            <div class="label">Tidak Hadir</div>
                        </div>
                    </div>
                    
                    <p style="margin-bottom: 10px; color: #6b7280;">
                        Persentase Kehadiran: <strong>${stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : 0}%</strong>
                    </p>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Tanggal</th>
                                <th>Mata Kuliah</th>
                                <th>Waktu Check-in</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${records.map((record, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${new Date(record.date).toLocaleDateString('id-ID')}</td>
                                    <td>${record.course}</td>
                                    <td>${record.checkInTime || '-'}</td>
                                    <td><span class="status ${record.status}">${
                                        record.status === 'present' ? 'Hadir' :
                                        record.status === 'absent' ? 'Tidak Hadir' :
                                        record.status === 'late' ? 'Terlambat' : record.status
                                    }</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <div class="footer">
                        <p>Dokumen ini digenerate secara otomatis oleh sistem TPLK004</p>
                        <p>© ${new Date().getFullYear()} UNPAM - Universitas Pamulang</p>
                    </div>
                </body>
                </html>
            `;

            // Open print dialog
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(content);
                printWindow.document.close();
                printWindow.focus();
                
                // Wait for content to load then print
                setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                }, 250);
            }
        } catch (error) {
            console.error('Failed to generate PDF:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={generatePDF}
            disabled={isGenerating}
        >
            {isGenerating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
                <Download className="h-4 w-4 mr-2" />
            )}
            Export PDF
        </Button>
    );
}
