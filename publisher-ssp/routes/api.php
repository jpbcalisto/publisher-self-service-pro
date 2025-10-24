<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PublisherController;

Route::get('/health', function() { 
    return response()->json(['status' => 'ok']); 
});

Route::post('/create-asset', [PublisherController::class, 'createAsset']);
Route::post('/save-cpm', [PublisherController::class, 'saveCpm']);
Route::post('/delete-asset', [PublisherController::class, 'deleteAsset']);