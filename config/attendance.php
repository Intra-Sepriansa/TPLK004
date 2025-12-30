<?php

return [
    'location' => [
        'sample_count' => (int) env('LOCATION_SAMPLE_COUNT', 3),
        'sample_window_seconds' => (int) env('LOCATION_SAMPLE_WINDOW_SECONDS', 20),
        'sample_max_age_seconds' => (int) env('LOCATION_SAMPLE_MAX_AGE_SECONDS', 60),
        'max_speed_mps' => (float) env('LOCATION_MAX_SPEED_MPS', 35),
        'max_jump_m' => (float) env('LOCATION_MAX_JUMP_M', 150),
        'max_spread_m' => (float) env('LOCATION_MAX_SPREAD_M', 100),
    ],
    'ip_geolocation' => [
        'enabled' => (bool) env('IP_GEOLOCATION_ENABLED', true),
        'url' => env('IP_GEOLOCATION_URL', 'https://ipapi.co/{ip}/json/'),
        'max_distance_m' => (float) env('IP_GEOLOCATION_MAX_DISTANCE_M', 50000),
    ],
    'ai' => [
        'service_url' => env('YOLO_SERVICE_URL', 'http://127.0.0.1:9001'),
        'api_key' => env('YOLO_API_KEY'),
        'min_conf' => (float) env('YOLO_MIN_CONF', 0.6),
        'target_label' => env('YOLO_TARGET_LABEL', ''),
        'maintenance' => (bool) env('YOLO_MAINTENANCE_MODE', true),
    ],
];
