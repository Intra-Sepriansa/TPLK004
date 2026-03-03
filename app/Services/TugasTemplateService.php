<?php

namespace App\Services;

use App\Models\TugasTemplate;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

class TugasTemplateService
{
    /**
     * @return array<int, array<string, mixed>>
     */
    public function getUserTemplates(string $ownerType, int $ownerId): array
    {
        if (!$this->hasTemplateTable()) {
            return [];
        }

        return TugasTemplate::query()
            ->where('owner_type', $ownerType)
            ->where('owner_id', $ownerId)
            ->orderByDesc('is_favorite')
            ->orderByDesc('usage_count')
            ->orderBy('name')
            ->get()
            ->toArray();
    }

    public function saveAsTemplate(string $ownerType, int $ownerId, array $data): TugasTemplate
    {
        $this->ensureTemplateTableExists();

        return TugasTemplate::create([
            'owner_type' => $ownerType,
            'owner_id' => $ownerId,
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'category' => $data['category'] ?? 'Tugas',
            'fields' => [
                'title_pattern' => $data['title_pattern'] ?? '',
                'description_template' => $data['description_template'] ?? '',
                'default_duration' => (int) ($data['default_duration'] ?? 4),
                'default_priority' => $data['default_priority'] ?? 'Sedang',
                'attachments' => $data['attachments'] ?? [],
                'schedule_type' => $data['schedule_type'] ?? 'immediate',
            ],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function applyTemplate(string $ownerType, int $ownerId, int $templateId): array
    {
        $template = $this->findOwnedTemplate($ownerType, $ownerId, $templateId);

        $template->increment('usage_count');
        $template->update(['last_used_at' => now()]);

        $fields = $template->fields ?? [];

        return [
            'id' => $template->id,
            'title' => $fields['title_pattern'] ?? '',
            'description' => $fields['description_template'] ?? '',
            'category' => $template->category ?? 'Tugas',
            'priority' => $fields['default_priority'] ?? 'Sedang',
            'estimated_hours' => (int) ($fields['default_duration'] ?? 4),
            'schedule_type' => $fields['schedule_type'] ?? 'immediate',
            'attachments' => $fields['attachments'] ?? [],
        ];
    }

    public function toggleFavorite(string $ownerType, int $ownerId, int $templateId): bool
    {
        $template = $this->findOwnedTemplate($ownerType, $ownerId, $templateId);

        $template->update([
            'is_favorite' => !$template->is_favorite,
        ]);

        return (bool) $template->is_favorite;
    }

    public function deleteTemplate(string $ownerType, int $ownerId, int $templateId): void
    {
        $template = $this->findOwnedTemplate($ownerType, $ownerId, $templateId);
        $template->delete();
    }

    private function findOwnedTemplate(string $ownerType, int $ownerId, int $templateId): TugasTemplate
    {
        $this->ensureTemplateTableExists();

        $template = TugasTemplate::query()
            ->where('owner_type', $ownerType)
            ->where('owner_id', $ownerId)
            ->find($templateId);

        if (!$template) {
            throw ValidationException::withMessages([
                'template' => 'Template tidak ditemukan atau bukan milik Anda.',
            ]);
        }

        return $template;
    }

    private function hasTemplateTable(): bool
    {
        return Schema::hasTable('tugas_templates');
    }

    private function ensureTemplateTableExists(): void
    {
        if ($this->hasTemplateTable()) {
            return;
        }

        throw ValidationException::withMessages([
            'template' => 'Tabel template belum tersedia. Jalankan php artisan migrate terlebih dahulu.',
        ]);
    }
}
