<?php

namespace App\Observers;

use App\Models\AdminActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class AdminActivityObserver
{
    /**
     * Handle the Model "created" event.
     */
    public function created(Model $model): void
    {
        if (!Auth::check()) {
            return;
        }

        AdminActivityLog::logCreate($model);
    }

    /**
     * Handle the Model "updated" event.
     */
    public function updated(Model $model): void
    {
        if (!Auth::check()) {
            return;
        }

        // Only log if there are changes
        if (empty($model->getDirty())) {
            return;
        }

        // Get original values only for the changed attributes
        $oldValues = array_intersect_key($model->getOriginal(), $model->getDirty());

        // We want to avoid logging "updated_at" changes only
        if (count($oldValues) === 1 && isset($oldValues['updated_at'])) {
            return;
        }

        AdminActivityLog::logUpdate($model, $oldValues);
    }

    /**
     * Handle the Model "deleted" event.
     */
    public function deleted(Model $model): void
    {
        if (!Auth::check()) {
            return;
        }

        AdminActivityLog::logDelete($model);
    }
}
