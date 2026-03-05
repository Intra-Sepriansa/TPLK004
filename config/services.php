<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'uml_docs' => [
        'enabled' => env('UML_DOCS_API_ENABLED', false),
        'strict' => env('UML_DOCS_API_STRICT', false),
        'base_url' => env('UML_DOCS_API_BASE_URL', ''),
        'api_key' => env('UML_DOCS_API_KEY', ''),
        'timeout' => env('UML_DOCS_API_TIMEOUT', 20),
        'endpoints' => [
            'index' => env('UML_DOCS_API_ENDPOINT_INDEX', '/api/v1/dosen/uml'),
            'history' => env('UML_DOCS_API_ENDPOINT_HISTORY', '/api/v1/dosen/uml/history'),
            'export' => env('UML_DOCS_API_ENDPOINT_EXPORT', '/api/v1/dosen/uml/export'),
        ],
    ],

];
