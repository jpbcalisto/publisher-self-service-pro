<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PublisherController;

Route::get('/', function () {
    return redirect('/publisherssp_pro.html');
});

Route::get('/publisherssp_pro.html', function () {
    return response()->file(public_path('publisherssp_pro.html'));
});

Route::get('/cpm-editor.html', function () {
    return response()->file(public_path('cpm-editor.html'));
});

Route::get('/format-manager.html', function () {
    return response()->file(public_path('format-manager.html'));
});

// API Routes
Route::get('/api/health', function() { return response()->json(['status' => 'ok']); });
Route::get('/list-assets', [PublisherController::class, 'listAssets']);
Route::post('/save-formats', [PublisherController::class, 'saveFormats']);
Route::post('/save-cpm', [PublisherController::class, 'saveCpm']);
Route::post('/copy-asset', [PublisherController::class, 'copyAsset']);
Route::post('/delete-asset', [PublisherController::class, 'deleteAsset']);
Route::post('/create-asset', [PublisherController::class, 'createAsset']);
Route::post('/upload-image', [PublisherController::class, 'uploadImage']);

// API routes without CSRF
Route::post('/create-asset', [PublisherController::class, 'createAsset']);
Route::post('/save-cpm', [PublisherController::class, 'saveCpm']);
Route::post('/delete-asset', [PublisherController::class, 'deleteAsset']);