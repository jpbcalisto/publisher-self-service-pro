<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class PublisherController extends Controller
{
    public function listAssets()
    {
        $assets = [];
        $assetsPath = public_path('assets');
        
        if (File::exists($assetsPath)) {
            $files = File::files($assetsPath);
            foreach ($files as $file) {
                $extension = strtolower($file->getExtension());
                if (in_array($extension, ['png', 'jpg', 'jpeg', 'gif', 'webp'])) {
                    $assets[] = 'assets/' . $file->getFilename();
                }
            }
        }
        
        return response()->json($assets);
    }

    public function saveFormats(Request $request)
    {
        $data = $request->all();
        $dataPath = public_path('publisherssp_data.json');
        
        // Load existing data
        $existingData = [];
        if (File::exists($dataPath)) {
            $existingData = json_decode(File::get($dataPath), true);
        }
        
        // Update formats
        $existingData['formats'] = $data['formats'];
        
        // Update desktop/mobile format arrays for compatibility
        $desktopFormats = array_filter($data['formats'], function($f) {
            return $f['group'] === 'desktop';
        });
        $mobileFormats = array_filter($data['formats'], function($f) {
            return $f['group'] === 'mobile';
        });
        
        if (!isset($existingData['adFormats'])) {
            $existingData['adFormats'] = [];
        }
        
        $existingData['adFormats']['desktop'] = array_values($desktopFormats);
        $existingData['adFormats']['mobile'] = array_values($mobileFormats);
        
        // Save back to file
        File::put($dataPath, json_encode($existingData, JSON_PRETTY_PRINT));
        
        return response()->json(['status' => 'success']);
    }

    public function saveCpm(Request $request)
    {
        $dataPath = public_path('publisherssp_data.json');
        File::put($dataPath, $request->getContent());
        
        return response()->json(['status' => 'success']);
    }

    public function copyAsset(Request $request)
    {
        // This would typically open a file dialog, but for web we'll return an error
        return response()->json(['error' => 'File selection not available in web version'], 400);
    }

    public function deleteAsset(Request $request)
    {
        $assetPath = $request->input('assetPath');
        $fullPath = public_path($assetPath);
        
        if (File::exists($fullPath)) {
            File::delete($fullPath);
        }
        
        return response()->json(['status' => 'success']);
    }

    public function createAsset(Request $request)
    {
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $assetName = $request->input('assetName');
            
            $assetsPath = public_path('assets');
            if (!File::exists($assetsPath)) {
                File::makeDirectory($assetsPath, 0755, true);
            }
            
            $file->move($assetsPath, $assetName);
            
            return response()->json(['path' => 'assets/' . $assetName]);
        }
        
        return response()->json(['error' => 'No file uploaded'], 400);
    }

    public function uploadImage(Request $request)
    {
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = $file->getClientOriginalName();
            
            $assetsPath = public_path('assets');
            if (!File::exists($assetsPath)) {
                File::makeDirectory($assetsPath, 0755, true);
            }
            
            $file->move($assetsPath, $filename);
            
            return response()->json([
                'filename' => $filename,
                'path' => 'assets/' . $filename
            ]);
        }
        
        return response()->json(['error' => 'No file uploaded'], 400);
    }
}