<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdminActivityLog extends Model
{
    protected $fillable = [
        'user_id',
        'action',
        'model_type',
        'model_id',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
        'description',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Log an activity
     */
    public static function log(
        string $action,
        ?string $description = null,
        ?string $modelType = null,
        ?int $modelId = null,
        ?array $oldValues = null,
        ?array $newValues = null
    ): self {
        return self::create([
            'user_id' => auth()->id(),
            'action' => $action,
            'model_type' => $modelType,
            'model_id' => $modelId,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'description' => $description,
        ]);
    }

    /**
     * Log model creation
     */
    public static function logCreate(Model $model, ?string $description = null): self
    {
        return self::log(
            'create',
            $description ?? "Created " . class_basename($model),
            get_class($model),
            $model->id,
            null,
            $model->toArray()
        );
    }

    /**
     * Log model update
     */
    public static function logUpdate(Model $model, array $oldValues, ?string $description = null): self
    {
        return self::log(
            'update',
            $description ?? "Updated " . class_basename($model),
            get_class($model),
            $model->id,
            $oldValues,
            $model->toArray()
        );
    }

    /**
     * Log model deletion
     */
    public static function logDelete(Model $model, ?string $description = null): self
    {
        return self::log(
            'delete',
            $description ?? "Deleted " . class_basename($model),
            get_class($model),
            $model->id,
            $model->toArray(),
            null
        );
    }
}
