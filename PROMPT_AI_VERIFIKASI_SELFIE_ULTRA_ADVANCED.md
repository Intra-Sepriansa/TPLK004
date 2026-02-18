# PROMPT: AI VERIFICATION SYSTEM - VERIFIKASI SELFIE KEHADIRAN (ULTRA ADVANCED)

## TUJUAN
Membangun sistem AI verification yang sangat canggih untuk menu Verifikasi Selfie Kehadiran Dosen dengan multi-layer verification, machine learning models, dan real-time analysis. Sistem ini akan memberikan rekomendasi otomatis dengan confidence score tinggi untuk membantu dosen dalam proses verifikasi.

---

## ARSITEKTUR AI SYSTEM

### Multi-Model Architecture
```typescript
interface AIVerificationSystem {
    faceRecognition: FaceRecognitionEngine;
    livenessDetection: LivenessDetectionEngine;
    imageQualityAnalysis: ImageQualityEngine;
    fraudDetection: FraudDetectionEngine;
    deviceFingerprinting: DeviceAnalysisEngine;
    locationVerification: LocationVerificationEngine;
    behavioralAnalysis: BehavioralAnalysisEngine;
}
```

### AI Models & Technologies

**1. Face Recognition Engine**
- **Primary Model:** face-api.js (TensorFlow.js based)
- **Secondary Model:** FaceNet (for embeddings)
- **Tertiary Model:** DeepFace (Python backend)
- **Features:**
  - Face detection dengan bounding box
  - Face landmarks (68 points)
  - Face descriptors (128-dimensional embeddings)
  - Face matching dengan similarity score
  - Multiple face detection
  - Age & gender estimation
  - Emotion recognition

**2. Liveness Detection Engine**
- **Primary Model:** Silent Face Anti-Spoofing (CVPR 2019)
- **Secondary Model:** FAS (Face Anti-Spoofing) model
- **Tertiary Model:** MiDaS (Depth estimation)
- **Features:**
  - Texture analysis (detect printed photos)
  - Motion analysis (detect video replay)
  - Depth map analysis (detect 2D vs 3D)
  - Reflection analysis (detect screen glare)
  - Micro-expression detection
  - Eye blink detection
  - Head movement analysis
  - Challenge-response (optional: ask user to smile, turn head)

**3. Image Quality Analysis Engine**
- **Blur Detection:** Laplacian variance method
- **Lighting Analysis:** Histogram analysis, exposure detection
- **Resolution Check:** Minimum resolution requirements
- **Noise Detection:** SNR (Signal-to-Noise Ratio) calculation
- **Compression Artifacts:** JPEG quality assessment
- **Color Balance:** White balance analysis
- **Sharpness Score:** Edge detection based
- **Contrast Analysis:** Dynamic range assessment

**4. Fraud Detection Engine**
- **Anomaly Detection:** Isolation Forest algorithm
- **Pattern Recognition:** LSTM for temporal patterns
- **Behavioral Biometrics:** Typing patterns, submission timing
- **Device Consistency:** Check device fingerprint consistency
- **Location Consistency:** GPS pattern analysis
- **Network Analysis:** IP address patterns, VPN detection
- **Metadata Analysis:** EXIF data verification
- **Statistical Analysis:** Z-score for outlier detection

**5. Device Fingerprinting Engine**
- **Browser Fingerprinting:** Canvas, WebGL, Audio fingerprinting
- **Hardware Detection:** CPU, GPU, RAM, Screen resolution
- **OS Detection:** Operating system, version, language
- **Sensor Data:** Accelerometer, gyroscope patterns
- **Battery Status:** Charging patterns
- **Network Info:** Connection type, speed
- **Timezone & Locale:** Consistency checks
- **Plugin Detection:** Installed plugins, extensions

**6. Location Verification Engine**
- **GPS Accuracy:** Accuracy radius analysis
- **Geofencing:** Check if within allowed zone
- **Location History:** Pattern analysis
- **Speed Analysis:** Detect impossible travel
- **Cell Tower Triangulation:** Cross-verify GPS
- **WiFi SSID Matching:** Known campus WiFi
- **IP Geolocation:** Cross-verify with GPS
- **Altitude Check:** Detect spoofed locations

**7. Behavioral Analysis Engine**
- **Submission Timing:** Analyze submission patterns
- **Interaction Patterns:** Click patterns, scroll behavior
- **Session Duration:** Time spent on page
- **Mouse Movement:** Trajectory analysis
- **Keystroke Dynamics:** Typing rhythm
- **Camera Permission:** Time to grant permission
- **Retry Patterns:** Number of retakes
- **Historical Behavior:** Compare with past submissions

---

## AI SERVICE IMPLEMENTATION

### Backend Service (app/Services/SelfieVerificationAIService.php)

```php
<?php

namespace App\Services;

use App\Models\AttendanceLog;
use App\Models\Mahasiswa;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class SelfieVerificationAIService
{
    protected $pythonApiUrl;
    protected $faceApiKey;
    
    public function __construct()
    {
        $this->pythonApiUrl = config('services.ai.python_api_url', 'http://localhost:5000');
        $this->faceApiKey = config('services.ai.face_api_key');
    }
    
    /**
     * Comprehensive AI verification
     */
    public function verifyAttendance(AttendanceLog $log): array
    {
        $results = [
            'overall_decision' => 'pending',
            'confidence_score' => 0,
            'face_recognition' => null,
            'liveness_detection' => null,
            'image_quality' => null,
            'fraud_detection' => null,
            'device_analysis' => null,
            'location_verification' => null,
            'behavioral_analysis' => null,
            'recommendations' => [],
            'warnings' => [],
            'timestamp' => now()->toIso8601String(),
        ];
        
        try {
            // 1. Face Recognition
            $results['face_recognition'] = $this->performFaceRecognition($log);
            
            // 2. Liveness Detection
            $results['liveness_detection'] = $this->performLivenessDetection($log);
            
            // 3. Image Quality Analysis
            $results['image_quality'] = $this->analyzeImageQuality($log);
            
            // 4. Fraud Detection
            $results['fraud_detection'] = $this->detectFraud($log);
            
            // 5. Device Analysis
            $results['device_analysis'] = $this->analyzeDevice($log);
            
            // 6. Location Verification
            $results['location_verification'] = $this->verifyLocation($log);
            
            // 7. Behavioral Analysis
            $results['behavioral_analysis'] = $this->analyzeBehavior($log);
            
            // Calculate overall decision
            $results = $this->calculateOverallDecision($results);
            
            // Store results
            $this->storeVerificationResults($log, $results);
            
        } catch (\Exception $e) {
            Log::error('AI Verification Error: ' . $e->getMessage());
            $results['warnings'][] = 'AI verification encountered an error: ' . $e->getMessage();
        }
        
        return $results;
    }
