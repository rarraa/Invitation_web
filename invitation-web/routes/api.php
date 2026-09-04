<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

use App\Http\Controllers\AuthController;
 
    Route::post('/login', [AuthController::class, 'login']);
 
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });

use App\Http\Controllers\PortalAuthController;

Route::post('/portal/login', [PortalAuthController::class, 'login']);
Route::post('/portal/logout', [PortalAuthController::class, 'logout']);
Route::get('/portal/me', [PortalAuthController::class, 'me']);