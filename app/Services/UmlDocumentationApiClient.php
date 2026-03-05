<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class UmlDocumentationApiClient
{
    public function isEnabled(): bool
    {
        $enabled = (bool) config('services.uml_docs.enabled', false);
        $baseUrl = (string) config('services.uml_docs.base_url', '');

        return $enabled && $baseUrl !== '';
    }

    /**
     * @return array<string, mixed>|null
     */
    public function fetchIndexPayload(): ?array
    {
        $response = $this->request()
            ->get($this->endpoint('index'));

        if (!$response->ok()) {
            return null;
        }

        $payload = $response->json();
        if (!is_array($payload)) {
            return null;
        }

        return $payload;
    }

    /**
     * @return array<string, mixed>|null
     */
    public function fetchHistoryPayload(string $menuId, string $diagramType): ?array
    {
        $response = $this->request()
            ->get($this->endpoint('history'), [
                'menu_id' => $menuId,
                'diagram_type' => $diagramType,
            ]);

        if (!$response->ok()) {
            return null;
        }

        $payload = $response->json();
        if (!is_array($payload)) {
            return null;
        }

        return $payload;
    }

    public function exportDiagram(array $payload): ?Response
    {
        $response = $this->request()
            ->post($this->endpoint('export'), $payload);

        if (!$response->ok()) {
            return null;
        }

        return $response;
    }

    protected function request(): PendingRequest
    {
        $timeout = (int) config('services.uml_docs.timeout', 20);
        $apiKey = (string) config('services.uml_docs.api_key', '');

        $request = Http::timeout($timeout)
            ->acceptJson()
            ->asJson();

        if ($apiKey !== '') {
            $request = $request->withToken($apiKey);
        }

        return $request;
    }

    protected function endpoint(string $key): string
    {
        $baseUrl = rtrim((string) config('services.uml_docs.base_url', ''), '/');
        $path = (string) config("services.uml_docs.endpoints.{$key}", '');
        $path = '/' . ltrim($path, '/');

        if (Str::startsWith($path, 'http://') || Str::startsWith($path, 'https://')) {
            return $path;
        }

        return $baseUrl . $path;
    }
}
