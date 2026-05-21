<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$action = $_GET['action'] ?? 'health';
$storageDir = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'data';
$storageFile = $storageDir . DIRECTORY_SEPARATOR . 'records.json';

if (!is_dir($storageDir)) {
    mkdir($storageDir, 0775, true);
}

if (!file_exists($storageFile)) {
    file_put_contents($storageFile, json_encode([], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

function read_records(string $file): array
{
    $raw = file_get_contents($file);
    $data = json_decode($raw ?: '[]', true);
    return is_array($data) ? $data : [];
}

function write_records(string $file, array $records): void
{
    file_put_contents($file, json_encode($records, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

function request_json(): array
{
    $raw = file_get_contents('php://input');
    $data = json_decode($raw ?: '{}', true);
    return is_array($data) ? $data : [];
}

function response(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

if ($action === 'health') {
    response(['ok' => true, 'service' => 'rrhh-desempeno']);
}

if ($action === 'records') {
    response(read_records($storageFile));
}

if ($action === 'climate' || $action === 'performance') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        response(['error' => 'Metodo no permitido'], 405);
    }

    $payload = request_json();
    if (($payload['type'] ?? '') !== $action) {
        response(['error' => 'Tipo de registro invalido'], 422);
    }

    $payload['id'] = $payload['id'] ?? bin2hex(random_bytes(8));
    $payload['createdAt'] = $payload['createdAt'] ?? gmdate('c');

    $records = read_records($storageFile);
    array_unshift($records, $payload);
    write_records($storageFile, $records);

    response(['ok' => true, 'record' => $payload], 201);
}

if ($action === 'summary') {
    $records = read_records($storageFile);
    $climate = array_values(array_filter($records, fn($item) => ($item['type'] ?? '') === 'climate'));
    $performance = array_values(array_filter($records, fn($item) => ($item['type'] ?? '') === 'performance'));

    response([
        'climateCount' => count($climate),
        'performanceCount' => count($performance),
        'total' => count($records),
    ]);
}

response(['error' => 'Accion no encontrada'], 404);
