<?php

namespace App\Http\Controllers;

use DateTimeInterface;
use Illuminate\Support\Carbon;

abstract class Controller
{
    protected function formatDisplayTime(
        ?DateTimeInterface $value,
        string $format = 'Y-m-d H:i:s',
        ?string $timezone = null,
    ): ?string
    {
        if (! $value) {
            return null;
        }

        $timezone = $this->resolveDisplayTimezone($timezone);
        $carbon = $value instanceof Carbon ? $value->copy() : Carbon::instance($value);

        return $carbon->setTimezone($timezone)->format($format);
    }

    protected function resolveDisplayTimezone(?string $timezone = null): string
    {
        $candidate = is_string($timezone) ? trim($timezone) : '';
        if ($candidate !== '' && in_array($candidate, timezone_identifiers_list(), true)) {
            return $candidate;
        }

        return (string) config('app.display_timezone', config('app.timezone', 'UTC'));
    }
}
