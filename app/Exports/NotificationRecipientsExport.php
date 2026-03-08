<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class NotificationRecipientsExport implements FromCollection, WithHeadings, WithMapping
{
    protected $recipients;

    public function __construct($recipients)
    {
        $this->recipients = collect($recipients);
    }

    public function collection()
    {
        return $this->recipients;
    }

    public function map($recipient): array
    {
        return [
            $recipient['name'],
            $recipient['identifier'],
            $recipient['type'],
            $recipient['status'],
            $recipient['read_at'],
        ];
    }

    public function headings(): array
    {
        return [
            'Nama',
            'NIM/NIDN',
            'Tipe',
            'Status',
            'Waktu Baca',
        ];
    }
}
