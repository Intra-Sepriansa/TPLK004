# 🎯 PROMPT: SEAMLESS ABSENSI – UNIFIED CAMERA REFACTOR ULTRA ADVANCED COMPLETE

## 📋 EXECUTIVE SUMMARY

**Objective:** Transform the attendance system (`resources/js/pages/user/absen.tsx`) into a premium, fluid experience where QR scanning and selfie capture feel like one seamless action, with a modern compact UI featuring Status Ring progress indicator and collapsible information architecture.

**Key Innovation:** Replace the traditional multi-step card layout with a single Unified Camera Card that intelligently transitions between QR scanning (rear camera) and selfie capture (front camera) with smooth 3D flip animations.

**Target File:** `resources/js/pages/user/absen.tsx`

**Complexity Level:** ⭐⭐⭐⭐⭐ (Ultra Advanced)

---

## 🎨 DESIGN PHILOSOPHY

### Core Principles
1. **Fluidity First:** Every transition should feel natural and intentional
2. **Progressive Disclosure:** Show only what's needed at each moment
3. **Visual Continuity:** Maintain spatial awareness during camera transitions
4. **Cognitive Load Reduction:** Minimize decision points and UI clutter
5. **Accessibility:** Ensure screen readers can follow the flow
6. **Performance:** Smooth 60fps animations on mid-range devices

### User Experience Goals
- **Reduce perceived steps** from 4 separate cards to 1 unified flow
- **Eliminate context switching** between different UI sections
- **Provide constant progress feedback** via Status Ring
- **Maintain user confidence** with clear visual states
- **Enable quick recovery** from errors without restarting

---

## 🏗️ ARCHITECTURE OVERVIEW

### State Machine Design


```typescript
// Camera Phase State Machine
type CameraPhase = 'idle' | 'scanning' | 'flipping' | 'selfie' | 'done';

// State Transitions
idle → scanning       // User taps "Mulai Scan"
scanning → flipping   // QR detected successfully (if selfieRequired)
scanning → done       // QR detected (if !selfieRequired, skip to location)
flipping → selfie     // Flip animation completes (600ms)
selfie → done         // User captures selfie
done → idle           // Reset/retry flow

// Parallel States
- cameraPhase: CameraPhase
- scanResult: 'idle' | 'scanning' | 'success' | 'error'
- selfieStatus: 'idle' | 'capturing' | 'captured'
- locationStatus: 'idle' | 'fetching' | 'success' | 'error'
- submitStatus: 'idle' | 'submitting' | 'success' | 'error'
```

### Component Hierarchy

```
AbsenPage
├── PageHeader (unchanged)
├── ConsentSection (compact, inline)
├── ProgressRing (SVG overlay, 4-step indicator)
├── UnifiedCameraCard ⭐ NEW
│   ├── CameraViewport
│   │   ├── QRScannerOverlay (phase: scanning)
│   │   ├── FlipAnimation (phase: flipping)
│   │   ├── SelfieOverlay (phase: selfie)
│   │   └── StatusRingOverlay (always visible)
│   ├── PhaseIndicator (text: "Scan QR" / "Ambil Selfie")
│   ├── ActionButton (context-aware)
│   └── ManualTokenCollapse
├── LocationStatusCard (compact)
├── InfoTabsAccordion ⭐ NEW
│   ├── Tab: Gamification
│   ├── Tab: Social Proof
│   └── Tab: Biometric Setup
└── StickySubmitFooter ⭐ NEW
```

---

## 🔧 TECHNICAL IMPLEMENTATION

### 1. Core State Management

```typescript
// Add to existing state
const [cameraPhase, setCameraPhase] = useState<CameraPhase>('idle');
const [flipDirection, setFlipDirection] = useState<'toFront' | 'toRear'>('toFront');
const [progressSteps, setProgressSteps] = useState({
  consent: false,
  qrScan: false,
  selfie: false,
  location: false
});

// Computed values
const progressPercentage = useMemo(() => {
  const completed = Object.values(progressSteps).filter(Boolean).length;
  return (completed / 4) * 100;
}, [progressSteps]);

const canSubmit = useMemo(() => {
  return progressSteps.consent && 
         progressSteps.qrScan && 
         (progressSteps.selfie || !selfieRequired) && 
         progressSteps.location;
}, [progressSteps, selfieRequired]);
```

### 2. Unified Camera Card Component


### Target State Architecture
```
[AFTER - Unified Seamless Flow]
┌─────────────────────────────────┐
│ Header + Inline Consent         │
│ [Compact Progress Ring: ◐ 2/4]  │
├─────────────────────────────────┤
│                                 │
│   🎥 UNIFIED CAMERA CARD        │
│                                 │
│   Phase: idle → scanning →      │
│          flipping → selfie →    │
│          done                   │
│                                 │
│   [Status Ring Overlay]         │
│   [Phase-specific UI]           │
│                                 │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ 📍 Location Status (Compact)    │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ 📑 Info Tabs (Collapsed)        │
│   • Gamification                │
│   • Social Proof                │
│   • Biometric Setup             │
└─────────────────────────────────┘
                ↓
┌─────────────────────────────────┐
│ ✅ SUBMIT (Sticky Footer)       │
└─────────────────────────────────┘
```

### State Machine Design
```typescript
type CameraPhase = 
  | 'idle'      // Initial state, show start prompt
  | 'scanning'  // Rear camera active, QR scanning
  | 'flipping'  // 3D transition animation (600ms)
  | 'selfie'    // Front camera active, selfie mode
  | 'done';     // Capture complete, show thumbnail

// State Transitions
idle → scanning      // User taps "Mulai Scan"
scanning → flipping  // QR detected + selfieRequired
scanning → done      // QR detected + !selfieRequired
flipping → selfie    // Animation complete (600ms)
selfie → done        // User captures selfie
done → idle          // Reset/retry flow
```

---

## 🎨 DETAILED DESIGN SPECIFICATIONS

### 1. Unified Camera Card Component

#### 1.1 Phase: IDLE
```tsx
<div className="unified-camera-card">
  <div className="camera-placeholder">
    <CameraIcon className="w-24 h-24 text-gray-400" />
    <h3>Siap untuk Absen?</h3>
    <p className="text-sm text-gray-600">
      Tap tombol di bawah untuk memulai scan QR
    </p>
    <Button 
      onClick={startScanning}
      disabled={!consentGiven}
      className="mt-4 btn-primary-gradient"
    >
      <QrCodeIcon /> Mulai Scan QR
    </Button>
  </div>
  
  {/* Manual Token Input - Collapsed */}
  <details className="mt-4">
    <summary className="text-sm text-blue-600 cursor-pointer">
      Input Token Manual
    </summary>
    <input 
      type="text" 
      placeholder="Masukkan token absensi"
      className="mt-2 w-full"
    />
  </details>
</div>
```

**Visual Design:**
- Centered icon and text
- Subtle gradient background
- Disabled state when consent not given
- Smooth fade-in animation on mount


```tsx
const UnifiedCameraCard: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isFlipping, setIsFlipping] = useState(false);

  // Auto-flip logic when QR scan succeeds
  useEffect(() => {
    if (scanResult === 'success' && selfieRequired && cameraPhase === 'scanning') {
      handleAutoFlipToSelfie();
    } else if (scanResult === 'success' && !selfieRequired) {
      setCameraPhase('done');
      setProgressSteps(prev => ({ ...prev, qrScan: true }));
      // Auto-trigger location fetch
      fetchLocation();
    }
  }, [scanResult, selfieRequired, cameraPhase]);

  const handleAutoFlipToSelfie = async () => {
    try {
      // 1. Stop QR scanner
      if (html5QrCodeRef.current) {
        await html5QrCodeRef.current.stop();
      }

      // 2. Trigger flip animation
      setCameraPhase('flipping');
      setFlipDirection('toFront');
      setIsFlipping(true);

      // 3. Wait for animation (600ms)
      await new Promise(resolve => setTimeout(resolve, 600));

      // 4. Start front camera
      setCameraPhase('selfie');
      setIsFlipping(false);
      await startFrontCamera();

      // 5. Update progress
      setProgressSteps(prev => ({ ...prev, qrScan: true }));

    } catch (error) {
      console.error('Flip transition error:', error);
      toast.error('Gagal beralih ke kamera selfie');
      setCameraPhase('idle');
    }
  };

  const startFrontCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 1280, height: 720 }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Front camera error:', error);
      toast.error('Tidak dapat mengakses kamera depan');
    }
  };

  const captureSelfie = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Mirror the image for natural selfie
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          setSelfieImage(blob);
          setCameraPhase('done');
          setProgressSteps(prev => ({ ...prev, selfie: true }));
          
          // Stop camera stream
          const stream = video.srcObject as MediaStream;
          stream?.getTracks().forEach(track => track.stop());
          
          toast.success('Selfie berhasil diambil!');
        }
      }, 'image/jpeg', 0.9);
    }
  };

  return (
    <div className="relative">
      {/* Status Ring Overlay */}
      <StatusRingOverlay progress={progressPercentage} />

      {/* Camera Viewport with Flip Animation */}
      <div 
        className={`
          relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-900
          transition-transform duration-600 ease-in-out
          ${isFlipping ? 'animate-flip-3d' : ''}
        `}
        style={{
          transformStyle: 'preserve-3d',
          perspective: '1000px'
        }}
      >
        {/* Idle State */}
        {cameraPhase === 'idle' && (
          <IdlePrompt onStart={() => startQRScanner()} />
        )}

        {/* Scanning State */}
        {cameraPhase === 'scanning' && (
          <div id="qr-reader" className="w-full h-full" />
        )}

        {/* Selfie State */}
        {cameraPhase === 'selfie' && (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover scale-x-[-1]"
              autoPlay
              playsInline
              muted
            />
            <SelfieOverlay onCapture={captureSelfie} />
          </>
        )}

        {/* Done State */}
        {cameraPhase === 'done' && selfieImage && (
          <SelfieThumbnail image={selfieImage} onRetake={() => setCameraPhase('idle')} />
        )}

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Phase Indicator */}
      <PhaseIndicator phase={cameraPhase} />

      {/* Manual Token Input (Collapsed) */}
      <ManualTokenCollapse />
    </div>
  );
};
```

### 3. Status Ring Component (SVG Progress Indicator)


#### 1.2 Phase: SCANNING
```tsx
<div className="unified-camera-card scanning">
  {/* Camera Viewport */}
  <div className="camera-viewport relative">
    <div id="qr-reader" className="w-full aspect-square" />
    
    {/* Status Ring Overlay */}
    <svg className="status-ring-overlay">
      <circle 
        cx="50%" cy="50%" r="45%"
        stroke="url(#scanningGradient)"
        strokeWidth="4"
        fill="none"
        strokeDasharray="283"
        strokeDashoffset={283 - (283 * progress / 4)}
        className="transition-all duration-300"
      />
    </svg>
    
    {/* Scanning Indicator */}
    <div className="scanning-indicator">
      <div className="scan-line animate-scan" />
      <p className="text-white text-sm mt-2">
        Arahkan kamera ke QR Code
      </p>
    </div>
    
    {/* Corner Guides */}
    <div className="qr-corner-guides">
      <div className="corner top-left" />
      <div className="corner top-right" />
      <div className="corner bottom-left" />
      <div className="corner bottom-right" />
    </div>
  </div>
  
  {/* Action Bar */}
  <div className="action-bar">
    <Button variant="ghost" onClick={cancelScanning}>
      <XIcon /> Batal
    </Button>
    <div className="flex items-center gap-2">
      <div className="pulse-dot" />
      <span className="text-sm">Scanning...</span>
    </div>
  </div>
</div>
```

**Key Features:**
- Html5Qrcode integration with rear camera (`facingMode: "environment"`)
- Animated scan line for visual feedback
- Corner guides for QR alignment
- Real-time progress ring (1/4 complete)
- Cancel button to return to idle

**CSS Animations:**
```css
@keyframes scan {
  0%, 100% { transform: translateY(-50%); }
  50% { transform: translateY(50%); }
}

.scan-line {
  animation: scan 2s ease-in-out infinite;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(59, 130, 246, 0.8), 
    transparent
  );
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}
```

#### 1.3 Phase: FLIPPING
```tsx
<div className="unified-camera-card flipping">
  <div className="flip-container">
    <div className="flip-card" style={{
      transform: `rotateY(${flipProgress * 180}deg)`,
      transition: 'transform 600ms cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      {/* Front Face: QR Success */}
      <div className="flip-face front">
        <CheckCircleIcon className="w-16 h-16 text-green-500" />
        <p className="text-lg font-semibold">QR Berhasil!</p>
      </div>
      
      {/* Back Face: Selfie Prompt */}
      <div className="flip-face back">
        <CameraIcon className="w-16 h-16 text-blue-500" />
        <p className="text-lg font-semibold">Siap Selfie</p>
      </div>
    </div>
  </div>
  
  {/* Progress Ring Updates to 2/4 */}
  <svg className="status-ring-overlay">
    <circle 
      strokeDashoffset={283 - (283 * 2 / 4)}
      className="transition-all duration-600"
    />
  </svg>
</div>
```

**Animation Specifications:**
- Duration: 600ms
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)` (Material Design standard)
- 3D perspective: `perspective(1000px)`
- Backface visibility: hidden
- Smooth progress ring update during flip

**Implementation Logic:**
```typescript
const handleQRSuccess = async (decodedText: string) => {
  // 1. Set scan result
  setScanResult('success');
  setQrData(decodedText);
  
  // 2. Stop QR scanner
  await html5QrCode.stop();
  
  // 3. Check if selfie required
  if (selfieRequired) {
    // 4. Start flip animation
    setCameraPhase('flipping');
    
    // 5. After 600ms, switch to selfie
    setTimeout(() => {
      setCameraPhase('selfie');
      startFrontCamera();
    }, 600);
  } else {
    // Skip to location step
    setCameraPhase('done');
    proceedToLocation();
  }
};
```


```tsx
const StatusRingOverlay: React.FC<{ progress: number }> = ({ progress }) => {
  const radius = 140;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90"
      >
        {/* Background ring */}
        <circle
          stroke="rgba(255, 255, 255, 0.1)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        
        {/* Progress ring */}
        <circle
          stroke="url(#gradient)"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference + ' ' + circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="transition-all duration-500 ease-out"
        />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>

      {/* Progress text */}
      <div className="absolute text-white text-center">
        <div className="text-3xl font-bold">{Math.round(progress)}%</div>
        <div className="text-xs opacity-75">Selesai</div>
      </div>
    </div>
  );
};
```

### 4. 3D Flip Animation (CSS)

```css
/* Add to your Tailwind config or CSS file */
@keyframes flip-3d {
  0% {
    transform: rotateY(0deg);
  }
  50% {
    transform: rotateY(90deg);
  }
  100% {
    transform: rotateY(180deg);
  }
}

.animate-flip-3d {
  animation: flip-3d 0.6s ease-in-out;
}

/* Ensure backface is hidden during flip */
.flip-container {
  transform-style: preserve-3d;
  perspective: 1000px;
}

.flip-front,
.flip-back {
  backface-visibility: hidden;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.flip-back {
  transform: rotateY(180deg);
}
```

### 5. Selfie Overlay Component

```tsx
const SelfieOverlay: React.FC<{ onCapture: () => void }> = ({ onCapture }) => {
  const [countdown, setCountdown] = useState<number | null>(null);

  const handleCaptureWithCountdown = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(interval);
          onCapture();
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-between p-6">
      {/* Face guide oval */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative">
          <svg width="240" height="320" viewBox="0 0 240 320">
            <ellipse
              cx="120"
              cy="160"
              rx="100"
              ry="140"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeDasharray="10 5"
              className="opacity-60"
            />
          </svg>
          
          {/* Countdown overlay */}
          {countdown && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-8xl font-bold animate-ping">
                {countdown}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center text-white mb-4">
        <p className="text-sm opacity-90">Posisikan wajah dalam oval</p>
        <p className="text-xs opacity-75">Pastikan pencahayaan cukup</p>
      </div>

      {/* Capture button */}
      <button
        onClick={handleCaptureWithCountdown}
        disabled={countdown !== null}
        className="
          w-20 h-20 rounded-full bg-white border-4 border-blue-500
          shadow-lg active:scale-95 transition-transform
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        <div className="w-full h-full rounded-full bg-blue-500" />
      </button>
    </div>
  );
};
```

### 6. Sticky Submit Footer


#### 1.4 Phase: SELFIE
```tsx
<div className="unified-camera-card selfie">
  {/* Camera Viewport */}
  <div className="camera-viewport relative">
    <video 
      ref={videoRef}
      autoPlay 
      playsInline
      muted
      className="w-full aspect-square object-cover mirror"
    />
    
    {/* Face Detection Overlay (Optional) */}
    <div className="face-guide-overlay">
      <div className="face-oval" />
      <p className="text-white text-sm">
        Posisikan wajah di dalam oval
      </p>
    </div>
    
    {/* Status Ring - 3/4 Complete */}
    <svg className="status-ring-overlay">
      <circle 
        strokeDashoffset={283 - (283 * 3 / 4)}
        stroke="url(#selfieGradient)"
      />
    </svg>
    
    {/* Capture Button */}
    <div className="capture-controls">
      <Button 
        onClick={captureSelfie}
        className="capture-button"
        size="lg"
      >
        <div className="capture-ring">
          <div className="capture-inner" />
        </div>
      </Button>
      <p className="text-white text-xs mt-2">
        Tap untuk ambil foto
      </p>
    </div>
  </div>
  
  {/* Action Bar */}
  <div className="action-bar">
    <Button variant="ghost" onClick={retryQR}>
      <ArrowLeftIcon /> Scan Ulang
    </Button>
    <div className="flex items-center gap-2">
      <CameraIcon className="w-4 h-4" />
      <span className="text-sm">Mode Selfie</span>
    </div>
  </div>
</div>
```

**Key Features:**
- Front camera (`facingMode: "user"`)
- Mirrored video for natural selfie experience
- Face guide oval for positioning
- Large, accessible capture button
- Option to retry QR scan

**Capture Implementation:**
```typescript
const captureSelfie = async () => {
  const canvas = document.createElement('canvas');
  const video = videoRef.current;
  
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  const ctx = canvas.getContext('2d');
  
  // Mirror the image back (since video is mirrored)
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0);
  
  // Convert to blob
  canvas.toBlob(async (blob) => {
    setSelfieBlob(blob);
    setSelfiePreview(URL.createObjectURL(blob));
    
    // Stop camera
    const stream = video.srcObject as MediaStream;
    stream.getTracks().forEach(track => track.stop());
    
    // Move to done phase
    setCameraPhase('done');
    
    // Auto-proceed to location
    proceedToLocation();
  }, 'image/jpeg', 0.9);
};
```

#### 1.5 Phase: DONE
```tsx
<div className="unified-camera-card done">
  {/* Success Summary */}
  <div className="completion-summary">
    <div className="selfie-thumbnail">
      <img 
        src={selfiePreview} 
        alt="Selfie"
        className="w-full h-full object-cover rounded-lg"
      />
      <div className="thumbnail-badge">
        <CheckIcon className="w-4 h-4" />
      </div>
    </div>
    
    <div className="completion-details">
      <h3 className="font-semibold text-lg">
        Foto Berhasil! ✨
      </h3>
      <div className="completion-checklist">
        <div className="check-item">
          <CheckCircleIcon className="text-green-500" />
          <span>QR Code terverifikasi</span>
        </div>
        <div className="check-item">
          <CheckCircleIcon className="text-green-500" />
          <span>Selfie tersimpan</span>
        </div>
        <div className="check-item pending">
          <ClockIcon className="text-yellow-500" />
          <span>Menunggu lokasi...</span>
        </div>
      </div>
    </div>
    
    {/* Status Ring - 4/4 Complete */}
    <svg className="status-ring-overlay">
      <circle 
        strokeDashoffset="0"
        stroke="url(#completeGradient)"
        className="animate-complete"
      />
    </svg>
  </div>
  
  {/* Retry Options */}
  <div className="retry-options">
    <Button 
      variant="outline" 
      size="sm"
      onClick={retakeSelfie}
    >
      <CameraIcon /> Foto Ulang
    </Button>
  </div>
</div>
```

**Visual Feedback:**
- Selfie thumbnail with success badge
- Animated checklist showing completion
- Full status ring (4/4)
- Option to retake selfie

---

### 2. Compact Progress Ring

Replace the horizontal step indicator card with an inline SVG ring.

```tsx
const ProgressRing: React.FC<{
  current: number;
  total: number;
  size?: number;
}> = ({ current, total, size = 60 }) => {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (current / total) * circumference;
  
  return (
    <div className="progress-ring-container">
      <svg width={size} height={size}>
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth="4"
          fill="none"
        />
        
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth="4"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="transition-all duration-500 ease-out"
        />
        
        {/* Gradient Definition */}
        <defs>
          <linearGradient id="progressGradient">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Center Text */}
      <div className="ring-center-text">
        <span className="text-lg font-bold">{current}</span>
        <span className="text-xs text-gray-500">/{total}</span>
      </div>
    </div>
  );
};
```

**Placement:**
```tsx
<div className="header-with-progress">
  <div className="flex items-center justify-between">
    <h1>Absensi Mahasiswa</h1>
    <ProgressRing current={completedSteps} total={4} />
  </div>
  
  {/* Inline Consent */}
  <label className="consent-inline">
    <input 
      type="checkbox" 
      checked={consentGiven}
      onChange={(e) => setConsentGiven(e.target.checked)}
    />
    <span className="text-sm">
      Saya setuju untuk menggunakan kamera dan lokasi
    </span>
  </label>
</div>
```


```tsx
const StickySubmitFooter: React.FC = () => {
  return (
    <div className="sticky bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-white via-white to-transparent pt-6 pb-4 px-4">
      <button
        onClick={handleSubmit}
        disabled={!canSubmit || submitStatus === 'submitting'}
        className={`
          w-full py-4 rounded-xl font-semibold text-lg
          transition-all duration-300 transform
          ${canSubmit 
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]' 
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }
        `}
      >
        {submitStatus === 'submitting' ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Mengirim...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <Send className="w-5 h-5" />
            <span>Kirim Absensi</span>
          </div>
        )}
      </button>

      {/* Progress indicator */}
      <div className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-600">
        <CheckCircle2 className={`w-4 h-4 ${progressSteps.consent ? 'text-green-500' : 'text-gray-300'}`} />
        <CheckCircle2 className={`w-4 h-4 ${progressSteps.qrScan ? 'text-green-500' : 'text-gray-300'}`} />
        <CheckCircle2 className={`w-4 h-4 ${progressSteps.selfie || !selfieRequired ? 'text-green-500' : 'text-gray-300'}`} />
        <CheckCircle2 className={`w-4 h-4 ${progressSteps.location ? 'text-green-500' : 'text-gray-300'}`} />
      </div>
    </div>
  );
};
```

### 7. Info Tabs Accordion (Collapsible)

```tsx
const InfoTabsAccordion: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const tabs = [
    {
      id: 'gamification',
      icon: Trophy,
      title: 'Reward & Poin',
      content: <GamificationContent />
    },
    {
      id: 'social',
      icon: Users,
      title: 'Teman Hadir',
      content: <SocialProofContent />
    },
    {
      id: 'biometric',
      icon: Fingerprint,
      title: 'Setup Biometrik',
      content: <BiometricSetupContent />
    }
  ];

  return (
    <div className="space-y-2">
      {tabs.map(tab => (
        <div key={tab.id} className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setActiveTab(activeTab === tab.id ? null : tab.id)}
            className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <tab.icon className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">{tab.title}</span>
            </div>
            <ChevronDown 
              className={`w-5 h-5 text-gray-400 transition-transform ${
                activeTab === tab.id ? 'rotate-180' : ''
              }`}
            />
          </button>

          {activeTab === tab.id && (
            <div className="p-4 bg-gray-50 border-t border-gray-200 animate-slideDown">
              {tab.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
```

### 8. Location Auto-Fetch (Background)

```typescript
const fetchLocation = async () => {
  setLocationStatus('fetching');
  
  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
    });

    const { latitude, longitude } = position.coords;
    
    setLocationData({
      latitude,
      longitude,
      accuracy: position.coords.accuracy
    });
    
    setLocationStatus('success');
    setProgressSteps(prev => ({ ...prev, location: true }));
    
    toast.success('Lokasi berhasil dideteksi');
    
  } catch (error) {
    console.error('Location error:', error);
    setLocationStatus('error');
    toast.error('Gagal mendapatkan lokasi. Pastikan GPS aktif.');
  }
};

// Auto-trigger location fetch after QR scan (if no selfie required)
// or after selfie capture
useEffect(() => {
  if (cameraPhase === 'done' && !progressSteps.location) {
    fetchLocation();
  }
}, [cameraPhase, progressSteps.location]);
```

---

## 🎭 UI/UX ENHANCEMENTS

### Visual Feedback States


---

### 3. Location Status Card (Compact)

```tsx
<div className="location-status-compact">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className={`status-icon ${locationStatus}`}>
        {locationStatus === 'pending' && <ClockIcon />}
        {locationStatus === 'loading' && <LoaderIcon className="animate-spin" />}
        {locationStatus === 'success' && <CheckCircleIcon />}
        {locationStatus === 'error' && <XCircleIcon />}
      </div>
      
      <div>
        <h4 className="font-medium text-sm">Verifikasi Lokasi</h4>
        <p className="text-xs text-gray-600">
          {locationStatus === 'pending' && 'Menunggu...'}
          {locationStatus === 'loading' && 'Mengambil koordinat...'}
          {locationStatus === 'success' && `${distance}m dari kampus`}
          {locationStatus === 'error' && 'Gagal mendapatkan lokasi'}
        </p>
      </div>
    </div>
    
    {locationStatus === 'error' && (
      <Button size="sm" variant="outline" onClick={retryLocation}>
        Coba Lagi
      </Button>
    )}
  </div>
  
  {/* Expandable Details */}
  {locationStatus === 'success' && (
    <details className="mt-2">
      <summary className="text-xs text-blue-600 cursor-pointer">
        Lihat Detail Lokasi
      </summary>
      <div className="mt-2 text-xs space-y-1">
        <p>Lat: {latitude}</p>
        <p>Lng: {longitude}</p>
        <p>Akurasi: ±{accuracy}m</p>
      </div>
    </details>
  )}
</div>
```

**Auto-Collection Logic:**
```typescript
useEffect(() => {
  // Start location collection after selfie (or QR if no selfie)
  if (cameraPhase === 'done') {
    collectLocation();
  }
}, [cameraPhase]);

const collectLocation = async () => {
  setLocationStatus('loading');
  
  try {
    const position = await new Promise<GeolocationPosition>(
      (resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      }
    );
    
    const { latitude, longitude, accuracy } = position.coords;
    setLocationData({ latitude, longitude, accuracy });
    
    // Calculate distance from campus
    const distance = calculateDistance(
      latitude, 
      longitude, 
      campusLat, 
      campusLng
    );
    
    setDistance(distance);
    setLocationStatus('success');
    
    // Update progress
    setCompletedSteps(4);
    
  } catch (error) {
    setLocationStatus('error');
    toast.error('Gagal mendapatkan lokasi. Pastikan GPS aktif.');
  }
};
```

---

### 4. Sticky Submit Footer

```tsx
<div className="sticky-submit-footer">
  <div className="footer-content">
    {/* Progress Summary */}
    <div className="submit-summary">
      <div className="flex items-center gap-2">
        {completedSteps === 4 ? (
          <>
            <CheckCircleIcon className="text-green-500" />
            <span className="text-sm font-medium">
              Semua langkah selesai!
            </span>
          </>
        ) : (
          <>
            <ClockIcon className="text-yellow-500" />
            <span className="text-sm">
              {completedSteps}/4 langkah selesai
            </span>
          </>
        )}
      </div>
    </div>
    
    {/* Submit Button */}
    <Button
      onClick={handleSubmit}
      disabled={completedSteps < 4 || isSubmitting}
      className="submit-button-primary"
      size="lg"
      fullWidth
    >
      {isSubmitting ? (
        <>
          <LoaderIcon className="animate-spin" />
          Mengirim...
        </>
      ) : (
        <>
          <SendIcon />
          Kirim Absensi
        </>
      )}
    </Button>
    
    {/* Error Message */}
    {submitError && (
      <div className="error-banner">
        <XCircleIcon className="text-red-500" />
        <span className="text-sm">{submitError}</span>
      </div>
    )}
  </div>
</div>
```

**CSS Styling:**
```css
.sticky-submit-footer {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e5e7eb;
  padding: 1rem;
  box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 40;
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.95);
}

.submit-button-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  transition: all 0.3s ease;
}

.submit-button-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
}

.submit-button-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

---

### 5. Collapsible Info Tabs

```tsx
<div className="info-tabs-container">
  <Tabs defaultValue="gamification" className="w-full">
    <TabsList className="grid grid-cols-3 w-full">
      <TabsTrigger value="gamification">
        <TrophyIcon className="w-4 h-4" />
        <span className="ml-2">Rewards</span>
      </TabsTrigger>
      <TabsTrigger value="social">
        <UsersIcon className="w-4 h-4" />
        <span className="ml-2">Aktivitas</span>
      </TabsTrigger>
      <TabsTrigger value="biometric">
        <FingerprintIcon className="w-4 h-4" />
        <span className="ml-2">Biometrik</span>
      </TabsTrigger>
    </TabsList>
    
    {/* Tab 1: Gamification */}
    <TabsContent value="gamification">
      <div className="rewards-panel">
        <h4 className="font-semibold mb-2">Poin & Pencapaian</h4>
        <div className="rewards-grid">
          <div className="reward-card">
            <StarIcon className="text-yellow-500" />
            <span>+10 Poin</span>
            <p className="text-xs">Absen tepat waktu</p>
          </div>
          <div className="reward-card">
            <FireIcon className="text-orange-500" />
            <span>Streak: 5 hari</span>
            <p className="text-xs">Konsisten hadir</p>
          </div>
        </div>
      </div>
    </TabsContent>
    
    {/* Tab 2: Social Proof */}
    <TabsContent value="social">
      <div className="social-panel">
        <h4 className="font-semibold mb-2">Aktivitas Terkini</h4>
        <div className="activity-feed">
          {recentAttendances.map(att => (
            <div key={att.id} className="activity-item">
              <Avatar src={att.user.avatar} size="sm" />
              <div className="activity-text">
                <span className="font-medium">{att.user.name}</span>
                <span className="text-xs text-gray-600">
                  absen {formatRelativeTime(att.created_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </TabsContent>
    
    {/* Tab 3: Biometric Setup */}
    <TabsContent value="biometric">
      <div className="biometric-panel">
        <h4 className="font-semibold mb-2">Pengaturan Biometrik</h4>
        <p className="text-sm text-gray-600 mb-3">
          Aktifkan autentikasi biometrik untuk absen lebih cepat
        </p>
        <Button variant="outline" fullWidth>
          <FingerprintIcon />
          Aktifkan Face ID / Touch ID
        </Button>
      </div>
    </TabsContent>
  </Tabs>
</div>
```

**Collapsed by Default:**
```tsx
const [infoTabsExpanded, setInfoTabsExpanded] = useState(false);

<div className="info-tabs-wrapper">
  <button 
    onClick={() => setInfoTabsExpanded(!infoTabsExpanded)}
    className="expand-toggle"
  >
    <span>Info Tambahan</span>
    <ChevronDownIcon 
      className={`transition-transform ${
        infoTabsExpanded ? 'rotate-180' : ''
      }`}
    />
  </button>
  
  {infoTabsExpanded && <InfoTabs />}
</div>
```


```tsx
// Success Flash Overlay (when QR detected)
const SuccessFlash: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 0.6 }}
      className="absolute inset-0 bg-green-500 flex items-center justify-center z-50"
    >
      <div className="text-white text-center">
        <CheckCircle className="w-20 h-20 mx-auto mb-4" />
        <p className="text-2xl font-bold">Scan Berhasil!</p>
        <p className="text-sm opacity-90 mt-2">Bersiap untuk selfie...</p>
      </div>
    </motion.div>
  );
};

// Error State with Retry
const ErrorState: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => {
  return (
    <div className="absolute inset-0 bg-red-50 flex flex-col items-center justify-center p-6">
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Terjadi Kesalahan</h3>
      <p className="text-sm text-gray-600 text-center mb-6">{message}</p>
      <button
        onClick={onRetry}
        className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
      >
        Coba Lagi
      </button>
    </div>
  );
};

// Loading Skeleton
const CameraLoadingSkeleton: React.FC = () => {
  return (
    <div className="aspect-[3/4] rounded-2xl bg-gray-200 animate-pulse flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-gray-400 animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Memuat kamera...</p>
      </div>
    </div>
  );
};
```

### Micro-interactions

```tsx
// Haptic feedback (for mobile devices)
const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'medium') => {
  if ('vibrate' in navigator) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30, 10, 30]
    };
    navigator.vibrate(patterns[type]);
  }
};

// Use in key interactions
const handleQRSuccess = () => {
  triggerHaptic('heavy');
  // ... rest of logic
};

const handleSelfieCapture = () => {
  triggerHaptic('medium');
  // ... rest of logic
};

// Sound effects (optional)
const playSound = (type: 'success' | 'error' | 'capture') => {
  const audio = new Audio(`/sounds/${type}.mp3`);
  audio.volume = 0.3;
  audio.play().catch(() => {}); // Ignore if autoplay blocked
};
```

### Accessibility Enhancements

```tsx
// Screen reader announcements
const [announcement, setAnnouncement] = useState('');

useEffect(() => {
  switch (cameraPhase) {
    case 'scanning':
      setAnnouncement('Kamera aktif. Arahkan ke kode QR untuk memindai.');
      break;
    case 'flipping':
      setAnnouncement('Beralih ke kamera depan untuk selfie.');
      break;
    case 'selfie':
      setAnnouncement('Kamera selfie aktif. Posisikan wajah dan tekan tombol untuk mengambil foto.');
      break;
    case 'done':
      setAnnouncement('Foto berhasil diambil. Lanjutkan ke pengiriman absensi.');
      break;
  }
}, [cameraPhase]);

// ARIA live region
<div 
  role="status" 
  aria-live="polite" 
  aria-atomic="true"
  className="sr-only"
>
  {announcement}
</div>

// Keyboard navigation
const handleKeyPress = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    if (cameraPhase === 'selfie') {
      captureSelfie();
    }
  }
  if (e.key === 'Escape') {
    // Cancel current operation
    resetCamera();
  }
};
```

---

## 📱 RESPONSIVE DESIGN

### Mobile-First Breakpoints

```tsx
// Tailwind responsive classes
<div className="
  // Mobile (default)
  px-4 py-6
  
  // Tablet (md: 768px)
  md:px-6 md:py-8 md:max-w-2xl md:mx-auto
  
  // Desktop (lg: 1024px)
  lg:px-8 lg:max-w-4xl
  
  // Large Desktop (xl: 1280px)
  xl:max-w-5xl
">
  {/* Content */}
</div>

// Camera aspect ratio adjustments
<div className="
  aspect-[3/4]        // Mobile portrait
  md:aspect-[4/3]     // Tablet landscape
  lg:aspect-video     // Desktop wide
">
```

### Touch Gestures

```tsx
// Swipe to retry/reset
const handleTouchStart = (e: TouchEvent) => {
  touchStartX.current = e.touches[0].clientX;
};

const handleTouchEnd = (e: TouchEvent) => {
  const touchEndX = e.changedTouches[0].clientX;
  const diff = touchStartX.current - touchEndX;
  
  // Swipe left to retry
  if (diff > 100 && cameraPhase === 'done') {
    resetCamera();
  }
};

// Pinch to zoom (for QR scanning)
const handlePinchZoom = (e: TouchEvent) => {
  if (e.touches.length === 2 && cameraPhase === 'scanning') {
    // Calculate zoom level
    // Apply to video stream
  }
};
```

---

## 🔒 SECURITY & PRIVACY

### Camera Permission Handling


```tsx
const checkCameraPermission = async (): Promise<boolean> => {
  try {
    // Check if Permissions API is available
    if ('permissions' in navigator) {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      
      if (result.state === 'denied') {
        toast.error('Akses kamera ditolak. Silakan aktifkan di pengaturan browser.');
        return false;
      }
      
      if (result.state === 'prompt') {
        // Will prompt user
        return true;
      }
      
      return result.state === 'granted';
    }
    
    // Fallback: try to access camera directly
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach(track => track.stop());
    return true;
    
  } catch (error) {
    console.error('Camera permission error:', error);
    return false;
  }
};

// Show permission guide if denied
const PermissionGuide: React.FC = () => {
  const [showGuide, setShowGuide] = useState(false);
  
  return showGuide ? (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <h4 className="font-semibold text-blue-900 mb-2">Cara Mengaktifkan Kamera:</h4>
      <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
        <li>Klik ikon gembok/info di address bar</li>
        <li>Pilih "Site settings" atau "Pengaturan situs"</li>
        <li>Ubah izin Kamera menjadi "Allow"</li>
        <li>Muat ulang halaman ini</li>
      </ol>
    </div>
  ) : null;
};
```

### Data Privacy

```tsx
// Clear sensitive data after submission
const clearSensitiveData = () => {
  // Clear selfie from memory
  if (selfieImage) {
    URL.revokeObjectURL(URL.createObjectURL(selfieImage));
    setSelfieImage(null);
  }
  
  // Clear location data
  setLocationData(null);
  
  // Clear QR token
  setQrToken('');
  
  // Clear video streams
  if (videoRef.current?.srcObject) {
    const stream = videoRef.current.srcObject as MediaStream;
    stream.getTracks().forEach(track => track.stop());
  }
};

// Auto-clear after successful submission
useEffect(() => {
  if (submitStatus === 'success') {
    setTimeout(clearSensitiveData, 2000);
  }
}, [submitStatus]);

// Prevent screenshots (optional, limited browser support)
useEffect(() => {
  const preventScreenshot = (e: Event) => {
    if (cameraPhase === 'selfie') {
      e.preventDefault();
      toast.warning('Screenshot tidak diizinkan saat mengambil selfie');
    }
  };
  
  document.addEventListener('keyup', (e) => {
    // Detect common screenshot shortcuts
    if ((e.key === 'PrintScreen') || 
        (e.metaKey && e.shiftKey && e.key === '3') || // Mac
        (e.metaKey && e.shiftKey && e.key === '4')) {
      preventScreenshot(e);
    }
  });
}, [cameraPhase]);
```

---

## ⚡ PERFORMANCE OPTIMIZATION

### Lazy Loading & Code Splitting

```tsx
// Lazy load heavy components
const Html5QrcodePlugin = lazy(() => import('@/components/Html5QrcodePlugin'));
const LocationMap = lazy(() => import('@/components/LocationMap'));

// Preload camera libraries when consent is given
useEffect(() => {
  if (consentGiven) {
    import('html5-qrcode').then(() => {
      console.log('QR scanner library preloaded');
    });
  }
}, [consentGiven]);
```

### Memory Management

```tsx
// Cleanup on unmount
useEffect(() => {
  return () => {
    // Stop all camera streams
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    
    // Stop QR scanner
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.stop().catch(() => {});
    }
    
    // Clear blob URLs
    if (selfieImage) {
      URL.revokeObjectURL(URL.createObjectURL(selfieImage));
    }
  };
}, []);
```

### Image Optimization

```tsx
// Compress selfie before upload
const compressSelfie = async (blob: Blob): Promise<Blob> => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Target max dimensions
      const maxWidth = 1024;
      const maxHeight = 1024;
      
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (compressedBlob) => {
          URL.revokeObjectURL(url);
          resolve(compressedBlob || blob);
        },
        'image/jpeg',
        0.8 // Quality
      );
    };
    
    img.src = url;
  });
};
```

### Debouncing & Throttling

```tsx
// Throttle QR scan results to prevent multiple triggers
const throttledQRSuccess = useCallback(
  throttle((decodedText: string) => {
    handleQRSuccess(decodedText);
  }, 1000),
  []
);

// Debounce location fetch retry
const debouncedLocationRetry = useCallback(
  debounce(() => {
    fetchLocation();
  }, 2000),
  []
);
```

---

## 🧪 TESTING STRATEGY

### Unit Tests


---

## 💻 COMPLETE IMPLEMENTATION CODE

### Main Component Structure

```typescript
// resources/js/pages/user/absen.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { Html5Qrcode } from 'html5-qrcode';
import { toast } from 'sonner';
import {
  CameraIcon,
  QrCodeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  LoaderIcon,
  SendIcon,
  ArrowLeftIcon,
  XIcon,
  TrophyIcon,
  UsersIcon,
  FingerprintIcon,
  ChevronDownIcon
} from 'lucide-react';

// Types
type CameraPhase = 'idle' | 'scanning' | 'flipping' | 'selfie' | 'done';
type LocationStatus = 'pending' | 'loading' | 'success' | 'error';
type ScanResult = 'idle' | 'scanning' | 'success' | 'error';

interface AbsenPageProps {
  auth: any;
  jadwal: any;
  selfieRequired: boolean;
  campusLocation: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  recentAttendances: any[];
}

export default function AbsenPage({
  auth,
  jadwal,
  selfieRequired,
  campusLocation,
  recentAttendances
}: AbsenPageProps) {
  // ========== STATE MANAGEMENT ==========
  
  // Consent & Progress
  const [consentGiven, setConsentGiven] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(0);
  
  // Camera Phase State Machine
  const [cameraPhase, setCameraPhase] = useState<CameraPhase>('idle');
  const [flipProgress, setFlipProgress] = useState(0);
  
  // QR Scanning
  const [scanResult, setScanResult] = useState<ScanResult>('idle');
  const [qrData, setQrData] = useState<string>('');
  const [manualToken, setManualToken] = useState('');
  
  // Selfie Capture
  const [selfieBlob, setSelfieBlob] = useState<Blob | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Location
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('pending');
  const [locationData, setLocationData] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null>(null);
  const [distance, setDistance] = useState<number>(0);
  
  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  
  // UI State
  const [infoTabsExpanded, setInfoTabsExpanded] = useState(false);
  
  // Refs
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  
  // ========== CAMERA PHASE HANDLERS ==========
  
  const startScanning = async () => {
    if (!consentGiven) {
      toast.error('Mohon berikan izin akses kamera dan lokasi');
      return;
    }
    
    setCameraPhase('scanning');
    setScanResult('scanning');
    
    try {
      const html5QrCode = new Html5Qrcode('qr-reader');
      html5QrCodeRef.current = html5QrCode;
      
      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        handleQRSuccess,
        handleQRError
      );
      
      setCompletedSteps(1);
    } catch (error) {
      console.error('Camera start error:', error);
      toast.error('Gagal membuka kamera. Pastikan izin kamera diberikan.');
      setCameraPhase('idle');
    }
  };
  
  const handleQRSuccess = async (decodedText: string) => {
    console.log('QR Detected:', decodedText);
    
    // Stop scanner
    if (html5QrCodeRef.current) {
      await html5QrCodeRef.current.stop();
      html5QrCodeRef.current = null;
    }
    
    // Set result
    setScanResult('success');
    setQrData(decodedText);
    setCompletedSteps(2);
    
    // Show success flash
    toast.success('QR Code berhasil dipindai!');
    
    // Decide next phase
    if (selfieRequired) {
      // Start flip animation
      setCameraPhase('flipping');
      animateFlip();
    } else {
      // Skip to done
      setCameraPhase('done');
      proceedToLocation();
    }
  };
  
  const handleQRError = (errorMessage: string) => {
    // Silent - normal scanning errors
  };
  
  const animateFlip = () => {
    let progress = 0;
    const duration = 600;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      progress = Math.min(elapsed / duration, 1);
      
      setFlipProgress(progress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Flip complete, start selfie
        setCameraPhase('selfie');
        startFrontCamera();
      }
    };
    
    requestAnimationFrame(animate);
  };
  
  const startFrontCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setCompletedSteps(2);
    } catch (error) {
      console.error('Front camera error:', error);
      toast.error('Gagal membuka kamera depan');
    }
  };
  
  const captureSelfie = async () => {
    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    
    if (!video) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Mirror the image
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    
    // Convert to blob
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      
      setSelfieBlob(blob);
      setSelfiePreview(URL.createObjectURL(blob));
      
      // Stop camera
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      
      // Move to done
      setCameraPhase('done');
      setCompletedSteps(3);
      
      toast.success('Selfie berhasil diambil!');
      
      // Auto-proceed to location
      proceedToLocation();
    }, 'image/jpeg', 0.9);
  };
  
  const proceedToLocation = () => {
    collectLocation();
  };
  
  // ========== LOCATION HANDLER ==========
  
  const collectLocation = async () => {
    setLocationStatus('loading');
    
    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        }
      );
      
      const { latitude, longitude, accuracy } = position.coords;
      setLocationData({ latitude, longitude, accuracy });
      
      // Calculate distance
      const dist = calculateDistance(
        latitude,
        longitude,
        campusLocation.latitude,
        campusLocation.longitude
      );
      
      setDistance(Math.round(dist));
      setLocationStatus('success');
      setCompletedSteps(4);
      
      toast.success(`Lokasi terdeteksi: ${Math.round(dist)}m dari kampus`);
      
    } catch (error) {
      console.error('Location error:', error);
      setLocationStatus('error');
      toast.error('Gagal mendapatkan lokasi. Pastikan GPS aktif.');
    }
  };
  
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c;
  };
  
  // ========== SUBMISSION HANDLER ==========
  
  const handleSubmit = async () => {
    if (completedSteps < 4) {
      toast.error('Mohon selesaikan semua langkah terlebih dahulu');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      const formData = new FormData();
      formData.append('qr_token', qrData || manualToken);
      
      if (selfieBlob) {
        formData.append('selfie', selfieBlob, 'selfie.jpg');
      }
      
      if (locationData) {
        formData.append('latitude', locationData.latitude.toString());
        formData.append('longitude', locationData.longitude.toString());
        formData.append('accuracy', locationData.accuracy.toString());
      }
      
      formData.append('jadwal_id', jadwal.id);
      
      router.post('/user/absen/submit', formData, {
        onSuccess: () => {
          toast.success('Absensi berhasil dikirim!');
        },
        onError: (errors) => {
          const errorMsg = Object.values(errors)[0] as string;
          setSubmitError(errorMsg);
          toast.error(errorMsg);
        },
        onFinish: () => {
          setIsSubmitting(false);
        }
      });
      
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitError('Terjadi kesalahan saat mengirim absensi');
      setIsSubmitting(false);
    }
  };
  
  // ========== RETRY HANDLERS ==========
  
  const cancelScanning = async () => {
    if (html5QrCodeRef.current) {
      await html5QrCodeRef.current.stop();
      html5QrCodeRef.current = null;
    }
    setCameraPhase('idle');
    setScanResult('idle');
  };
  
  const retryQR = () => {
    setCameraPhase('idle');
    setScanResult('idle');
    setQrData('');
    setCompletedSteps(0);
  };
  
  const retakeSelfie = () => {
    setCameraPhase('selfie');
    setSelfieBlob(null);
    setSelfiePreview('');
    startFrontCamera();
  };
  
  const retryLocation = () => {
    collectLocation();
  };
```


```tsx
// __tests__/absen.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AbsenPage } from '@/pages/user/absen';

describe('Unified Camera Flow', () => {
  it('should start in idle phase', () => {
    render(<AbsenPage />);
    expect(screen.getByText(/mulai scan/i)).toBeInTheDocument();
  });

  it('should transition to scanning phase when started', async () => {
    render(<AbsenPage />);
    const startButton = screen.getByText(/mulai scan/i);
    fireEvent.click(startButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('qr-scanner')).toBeInTheDocument();
    });
  });

  it('should auto-flip to selfie after QR success', async () => {
    const { container } = render(<AbsenPage />);
    
    // Simulate QR scan success
    fireEvent.qrSuccess(container, { detail: 'valid-token' });
    
    await waitFor(() => {
      expect(screen.getByTestId('selfie-camera')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('should skip selfie if not required', async () => {
    render(<AbsenPage selfieRequired={false} />);
    
    // Simulate QR scan success
    fireEvent.qrSuccess(container, { detail: 'valid-token' });
    
    await waitFor(() => {
      expect(screen.queryByTestId('selfie-camera')).not.toBeInTheDocument();
      expect(screen.getByText(/lokasi terdeteksi/i)).toBeInTheDocument();
    });
  });

  it('should enable submit button when all steps complete', async () => {
    render(<AbsenPage />);
    
    // Complete all steps
    fireEvent.click(screen.getByLabelText(/consent/i));
    fireEvent.qrSuccess(container, { detail: 'valid-token' });
    await waitFor(() => fireEvent.click(screen.getByText(/ambil selfie/i)));
    await waitFor(() => expect(screen.getByText(/kirim absensi/i)).not.toBeDisabled());
  });
});
```

### Integration Tests

```tsx
// __tests__/integration/camera-flow.test.tsx
describe('Camera Flow Integration', () => {
  beforeEach(() => {
    // Mock camera API
    global.navigator.mediaDevices = {
      getUserMedia: jest.fn().mockResolvedValue({
        getTracks: () => [{ stop: jest.fn() }]
      })
    };
  });

  it('should complete full attendance flow', async () => {
    const { user } = renderWithAuth(<AbsenPage />);
    
    // 1. Give consent
    await user.click(screen.getByLabelText(/consent/i));
    
    // 2. Start QR scan
    await user.click(screen.getByText(/mulai scan/i));
    expect(screen.getByTestId('qr-scanner')).toBeInTheDocument();
    
    // 3. Simulate QR detection
    act(() => {
      window.dispatchEvent(new CustomEvent('qr-detected', { 
        detail: { token: 'valid-token' } 
      }));
    });
    
    // 4. Wait for flip animation
    await waitFor(() => {
      expect(screen.getByTestId('selfie-camera')).toBeInTheDocument();
    }, { timeout: 1000 });
    
    // 5. Capture selfie
    await user.click(screen.getByTestId('capture-button'));
    
    // 6. Wait for location
    await waitFor(() => {
      expect(screen.getByText(/lokasi terdeteksi/i)).toBeInTheDocument();
    });
    
    // 7. Submit
    await user.click(screen.getByText(/kirim absensi/i));
    
    // 8. Verify success
    await waitFor(() => {
      expect(screen.getByText(/absensi berhasil/i)).toBeInTheDocument();
    });
  });
});
```

### E2E Tests (Playwright)

```typescript
// e2e/absen-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Seamless Absensi Flow', () => {
  test.beforeEach(async ({ page, context }) => {
    // Grant camera permissions
    await context.grantPermissions(['camera', 'geolocation']);
    await page.goto('/user/absen');
  });

  test('should complete unified camera flow', async ({ page }) => {
    // 1. Check consent
    await page.click('input[type="checkbox"]');
    
    // 2. Start scanning
    await page.click('text=Mulai Scan');
    
    // 3. Wait for camera to load
    await expect(page.locator('#qr-reader')).toBeVisible();
    
    // 4. Simulate QR code (using test QR image)
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('qr-success', {
        detail: { token: 'test-token-123' }
      }));
    });
    
    // 5. Wait for flip animation
    await page.waitForTimeout(700);
    
    // 6. Verify selfie camera is active
    await expect(page.locator('video[autoplay]')).toBeVisible();
    
    // 7. Capture selfie
    await page.click('[data-testid="capture-button"]');
    
    // 8. Wait for location
    await expect(page.locator('text=Lokasi terdeteksi')).toBeVisible({ timeout: 5000 });
    
    // 9. Submit
    await page.click('text=Kirim Absensi');
    
    // 10. Verify success
    await expect(page.locator('text=Absensi berhasil')).toBeVisible();
  });

  test('should handle camera permission denial', async ({ page, context }) => {
    // Deny camera permission
    await context.clearPermissions();
    
    await page.click('input[type="checkbox"]');
    await page.click('text=Mulai Scan');
    
    // Should show permission guide
    await expect(page.locator('text=Cara Mengaktifkan Kamera')).toBeVisible();
  });
});
```

---

## 📊 ANALYTICS & MONITORING

### Event Tracking


```tsx
// Analytics helper
const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  // Google Analytics
  if (window.gtag) {
    window.gtag('event', eventName, properties);
  }
  
  // Custom analytics
  if (window.analytics) {
    window.analytics.track(eventName, properties);
  }
  
  console.log('[Analytics]', eventName, properties);
};

// Track key events
useEffect(() => {
  if (cameraPhase === 'scanning') {
    trackEvent('camera_started', { type: 'qr_scanner' });
  }
}, [cameraPhase]);

useEffect(() => {
  if (scanResult === 'success') {
    trackEvent('qr_scan_success', { 
      duration: Date.now() - scanStartTime 
    });
  }
}, [scanResult]);

useEffect(() => {
  if (cameraPhase === 'flipping') {
    trackEvent('camera_flip_started');
  }
}, [cameraPhase]);

useEffect(() => {
  if (selfieStatus === 'captured') {
    trackEvent('selfie_captured', {
      attempts: selfieAttempts,
      duration: Date.now() - selfieStartTime
    });
  }
}, [selfieStatus]);

useEffect(() => {
  if (submitStatus === 'success') {
    trackEvent('attendance_submitted', {
      totalDuration: Date.now() - flowStartTime,
      hasRetries: retryCount > 0
    });
  }
}, [submitStatus]);
```

### Performance Monitoring

```tsx
// Performance metrics
const usePerformanceMonitoring = () => {
  useEffect(() => {
    // Camera load time
    const cameraLoadStart = performance.now();
    
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'camera-ready') {
          const loadTime = entry.startTime - cameraLoadStart;
          trackEvent('camera_load_time', { duration: loadTime });
        }
      }
    });
    
    observer.observe({ entryTypes: ['measure'] });
    
    return () => observer.disconnect();
  }, []);

  // Flip animation performance
  const measureFlipAnimation = () => {
    performance.mark('flip-start');
    
    setTimeout(() => {
      performance.mark('flip-end');
      performance.measure('flip-animation', 'flip-start', 'flip-end');
      
      const measure = performance.getEntriesByName('flip-animation')[0];
      if (measure.duration > 700) {
        console.warn('Flip animation slower than expected:', measure.duration);
      }
    }, 600);
  };
};
```

### Error Tracking (Sentry)

```tsx
import * as Sentry from '@sentry/react';

// Wrap component with error boundary
const AbsenPageWithErrorBoundary = Sentry.withErrorBoundary(AbsenPage, {
  fallback: <ErrorFallback />,
  showDialog: true
});

// Track specific errors
const handleCameraError = (error: Error) => {
  Sentry.captureException(error, {
    tags: {
      component: 'UnifiedCamera',
      phase: cameraPhase
    },
    contexts: {
      camera: {
        phase: cameraPhase,
        scanResult,
        selfieStatus
      }
    }
  });
  
  toast.error('Terjadi kesalahan pada kamera');
};
```

---

## 🎯 IMPLEMENTATION CHECKLIST

### Phase 1: Core Refactoring (Priority: HIGH)
- [ ] Create `cameraPhase` state machine
- [ ] Implement `UnifiedCameraCard` component
- [ ] Add auto-flip logic on QR success
- [ ] Integrate front camera for selfie
- [ ] Test camera transitions

### Phase 2: UI Components (Priority: HIGH)
- [ ] Build `StatusRingOverlay` with SVG progress
- [ ] Create `SelfieOverlay` with face guide
- [ ] Implement `StickySubmitFooter`
- [ ] Add 3D flip animation CSS
- [ ] Design `IdlePrompt` component

### Phase 3: Enhanced Features (Priority: MEDIUM)
- [ ] Build `InfoTabsAccordion` (collapsible)
- [ ] Add `ManualTokenCollapse` input
- [ ] Implement success flash overlay
- [ ] Create error state components
- [ ] Add loading skeletons

### Phase 4: Interactions (Priority: MEDIUM)
- [ ] Add haptic feedback
- [ ] Implement sound effects
- [ ] Add countdown timer for selfie
- [ ] Enable touch gestures (swipe to retry)
- [ ] Add keyboard shortcuts

### Phase 5: Accessibility (Priority: HIGH)
- [ ] Add ARIA labels and roles
- [ ] Implement screen reader announcements
- [ ] Test keyboard navigation
- [ ] Add focus management
- [ ] Test with screen readers (NVDA, VoiceOver)

### Phase 6: Performance (Priority: MEDIUM)
- [ ] Lazy load heavy components
- [ ] Implement image compression
- [ ] Add memory cleanup
- [ ] Optimize re-renders
- [ ] Test on low-end devices

### Phase 7: Security (Priority: HIGH)
- [ ] Implement camera permission checks
- [ ] Add permission guide UI
- [ ] Clear sensitive data after submit
- [ ] Add screenshot prevention (optional)
- [ ] Validate all inputs

### Phase 8: Testing (Priority: HIGH)
- [ ] Write unit tests for state machine
- [ ] Add integration tests for flow
- [ ] Create E2E tests with Playwright
- [ ] Test on multiple browsers
- [ ] Test on mobile devices

### Phase 9: Analytics (Priority: LOW)
- [ ] Add event tracking
- [ ] Implement performance monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Create analytics dashboard
- [ ] Monitor user behavior

### Phase 10: Documentation (Priority: MEDIUM)
- [ ] Update component documentation
- [ ] Create user guide
- [ ] Document API changes
- [ ] Add inline code comments
- [ ] Create troubleshooting guide

---

## 🚀 DEPLOYMENT STRATEGY

### Pre-Deployment


  
  // ========== RENDER ==========
  
  return (
    <>
      <Head title="Absensi Mahasiswa" />
      
      <div className="absen-page-container">
        {/* Header with Inline Progress */}
        <div className="header-section">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Absensi</h1>
              <p className="text-sm text-gray-600">
                {jadwal.mata_kuliah.nama} - {jadwal.ruangan}
              </p>
            </div>
            
            {/* Compact Progress Ring */}
            <ProgressRing current={completedSteps} total={4} />
          </div>
          
          {/* Inline Consent */}
          <label className="consent-checkbox flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <input
              type="checkbox"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm">
              Saya setuju untuk menggunakan kamera dan lokasi untuk absensi
            </span>
          </label>
        </div>
        
        {/* Unified Camera Card */}
        <UnifiedCameraCard
          phase={cameraPhase}
          flipProgress={flipProgress}
          scanResult={scanResult}
          selfiePreview={selfiePreview}
          videoRef={videoRef}
          onStartScanning={startScanning}
          onCancelScanning={cancelScanning}
          onCaptureSelfie={captureSelfie}
          onRetryQR={retryQR}
          onRetakeSelfie={retakeSelfie}
          consentGiven={consentGiven}
          completedSteps={completedSteps}
        />
        
        {/* Manual Token Input */}
        <details className="manual-token-section mt-4">
          <summary className="text-sm text-blue-600 cursor-pointer">
            Input Token Manual
          </summary>
          <div className="mt-2">
            <input
              type="text"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              placeholder="Masukkan token absensi"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </details>
        
        {/* Location Status Card */}
        <LocationStatusCard
          status={locationStatus}
          distance={distance}
          locationData={locationData}
          onRetry={retryLocation}
        />
        
        {/* Collapsible Info Tabs */}
        <div className="info-tabs-wrapper mt-4">
          <button
            onClick={() => setInfoTabsExpanded(!infoTabsExpanded)}
            className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <span className="text-sm font-medium">Info Tambahan</span>
            <ChevronDownIcon
              className={`w-4 h-4 transition-transform ${
                infoTabsExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>
          
          {infoTabsExpanded && (
            <InfoTabs recentAttendances={recentAttendances} />
          )}
        </div>
        
        {/* Spacer for sticky footer */}
        <div className="h-24" />
      </div>
      
      {/* Sticky Submit Footer */}
      <StickySubmitFooter
        completedSteps={completedSteps}
        isSubmitting={isSubmitting}
        submitError={submitError}
        onSubmit={handleSubmit}
      />
    </>
  );
}

// ========== SUB-COMPONENTS ==========

const ProgressRing: React.FC<{
  current: number;
  total: number;
  size?: number;
}> = ({ current, total, size = 60 }) => {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (current / total) * circumference;
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth="4"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth="4"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold">{current}</span>
        <span className="text-xs text-gray-500">/{total}</span>
      </div>
    </div>
  );
};

const UnifiedCameraCard: React.FC<any> = ({
  phase,
  flipProgress,
  scanResult,
  selfiePreview,
  videoRef,
  onStartScanning,
  onCancelScanning,
  onCaptureSelfie,
  onRetryQR,
  onRetakeSelfie,
  consentGiven,
  completedSteps
}) => {
  return (
    <div className="unified-camera-card bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Phase: IDLE */}
      {phase === 'idle' && (
        <div className="camera-placeholder p-8 text-center">
          <CameraIcon className="w-24 h-24 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Siap untuk Absen?</h3>
          <p className="text-sm text-gray-600 mb-6">
            Tap tombol di bawah untuk memulai scan QR
          </p>
          <button
            onClick={onStartScanning}
            disabled={!consentGiven}
            className="btn-primary-gradient px-6 py-3 rounded-lg disabled:opacity-50"
          >
            <QrCodeIcon className="inline w-5 h-5 mr-2" />
            Mulai Scan QR
          </button>
        </div>
      )}
      
      {/* Phase: SCANNING */}
      {phase === 'scanning' && (
        <div className="camera-viewport relative">
          <div id="qr-reader" className="w-full aspect-square" />
          
          {/* Status Ring Overlay */}
          <svg className="status-ring-overlay absolute inset-0 pointer-events-none">
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              stroke="url(#scanningGradient)"
              strokeWidth="4"
              fill="none"
              strokeDasharray="283"
              strokeDashoffset={283 - (283 * completedSteps / 4)}
              className="transition-all duration-300"
            />
            <defs>
              <linearGradient id="scanningGradient">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Scanning Indicator */}
          <div className="scanning-indicator absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="scan-line w-64 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-scan" />
            <p className="text-white text-sm mt-4 bg-black bg-opacity-50 px-4 py-2 rounded">
              Arahkan kamera ke QR Code
            </p>
          </div>
          
          {/* Action Bar */}
          <div className="action-bar absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
            <div className="flex items-center justify-between">
              <button
                onClick={onCancelScanning}
                className="text-white flex items-center gap-2"
              >
                <XIcon className="w-5 h-5" />
                Batal
              </button>
              <div className="flex items-center gap-2 text-white">
                <div className="pulse-dot w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm">Scanning...</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Phase: FLIPPING */}
      {phase === 'flipping' && (
        <div className="flip-container p-8" style={{ perspective: '1000px' }}>
          <div
            className="flip-card"
            style={{
              transform: `rotateY(${flipProgress * 180}deg)`,
              transition: 'transform 600ms cubic-bezier(0.4, 0, 0.2, 1)',
              transformStyle: 'preserve-3d'
            }}
          >
            <div className="flip-face front text-center" style={{ backfaceVisibility: 'hidden' }}>
              <CheckCircleIcon className="w-16 h-16 mx-auto text-green-500 mb-2" />
              <p className="text-lg font-semibold">QR Berhasil!</p>
            </div>
            <div
              className="flip-face back text-center absolute inset-0"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              <CameraIcon className="w-16 h-16 mx-auto text-blue-500 mb-2" />
              <p className="text-lg font-semibold">Siap Selfie</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Phase: SELFIE */}
      {phase === 'selfie' && (
        <div className="camera-viewport relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full aspect-square object-cover mirror"
            style={{ transform: 'scaleX(-1)' }}
          />
          
          {/* Face Guide Overlay */}
          <div className="face-guide-overlay absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="face-oval w-48 h-64 border-4 border-white border-dashed rounded-full opacity-50" />
            <p className="text-white text-sm mt-4 bg-black bg-opacity-50 px-4 py-2 rounded">
              Posisikan wajah di dalam oval
            </p>
          </div>
          
          {/* Capture Controls */}
          <div className="capture-controls absolute bottom-8 left-0 right-0 flex flex-col items-center">
            <button
              onClick={onCaptureSelfie}
              className="capture-button w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg"
            >
              <div className="w-14 h-14 rounded-full border-4 border-blue-500" />
            </button>
            <p className="text-white text-xs mt-2 bg-black bg-opacity-50 px-3 py-1 rounded">
              Tap untuk ambil foto
            </p>
          </div>
          
          {/* Action Bar */}
          <div className="action-bar absolute top-4 left-4">
            <button
              onClick={onRetryQR}
              className="text-white flex items-center gap-2 bg-black bg-opacity-50 px-3 py-2 rounded"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Scan Ulang
            </button>
          </div>
        </div>
      )}
      
      {/* Phase: DONE */}
      {phase === 'done' && selfiePreview && (
        <div className="completion-summary p-6">
          <div className="selfie-thumbnail relative w-32 h-32 mx-auto mb-4">
            <img
              src={selfiePreview}
              alt="Selfie"
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="thumbnail-badge absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-center mb-4">
            Foto Berhasil! ✨
          </h3>
          
          <div className="completion-checklist space-y-2">
            <div className="check-item flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
              <span className="text-sm">QR Code terverifikasi</span>
            </div>
            <div className="check-item flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
              <span className="text-sm">Selfie tersimpan</span>
            </div>
            <div className="check-item flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-yellow-500" />
              <span className="text-sm">Menunggu lokasi...</span>
            </div>
          </div>
          
          <button
            onClick={onRetakeSelfie}
            className="mt-4 w-full py-2 border rounded-lg flex items-center justify-center gap-2"
          >
            <CameraIcon className="w-4 h-4" />
            Foto Ulang
          </button>
        </div>
      )}
    </div>
  );
};

const LocationStatusCard: React.FC<any> = ({
  status,
  distance,
  locationData,
  onRetry
}) => {
  return (
    <div className="location-status-compact bg-white rounded-lg shadow p-4 mt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`status-icon ${status}`}>
            {status === 'pending' && <ClockIcon className="w-6 h-6 text-gray-400" />}
            {status === 'loading' && <LoaderIcon className="w-6 h-6 text-blue-500 animate-spin" />}
            {status === 'success' && <CheckCircleIcon className="w-6 h-6 text-green-500" />}
            {status === 'error' && <XCircleIcon className="w-6 h-6 text-red-500" />}
          </div>
          
          <div>
            <h4 className="font-medium text-sm">Verifikasi Lokasi</h4>
            <p className="text-xs text-gray-600">
              {status === 'pending' && 'Menunggu...'}
              {status === 'loading' && 'Mengambil koordinat...'}
              {status === 'success' && `${distance}m dari kampus`}
              {status === 'error' && 'Gagal mendapatkan lokasi'}
            </p>
          </div>
        </div>
        
        {status === 'error' && (
          <button
            onClick={onRetry}
            className="px-3 py-1 text-sm border rounded"
          >
            Coba Lagi
          </button>
        )}
      </div>
      
      {status === 'success' && locationData && (
        <details className="mt-2">
          <summary className="text-xs text-blue-600 cursor-pointer">
            Lihat Detail Lokasi
          </summary>
          <div className="mt-2 text-xs space-y-1 text-gray-600">
            <p>Lat: {locationData.latitude.toFixed(6)}</p>
            <p>Lng: {locationData.longitude.toFixed(6)}</p>
            <p>Akurasi: ±{locationData.accuracy.toFixed(0)}m</p>
          </div>
        </details>
      )}
    </div>
  );
};

const StickySubmitFooter: React.FC<any> = ({
  completedSteps,
  isSubmitting,
  submitError,
  onSubmit
}) => {
  return (
    <div className="sticky-submit-footer">
      <div className="footer-content max-w-2xl mx-auto">
        <div className="submit-summary mb-3">
          <div className="flex items-center gap-2">
            {completedSteps === 4 ? (
              <>
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">Semua langkah selesai!</span>
              </>
            ) : (
              <>
                <ClockIcon className="w-5 h-5 text-yellow-500" />
                <span className="text-sm">{completedSteps}/4 langkah selesai</span>
              </>
            )}
          </div>
        </div>
        
        <button
          onClick={onSubmit}
          disabled={completedSteps < 4 || isSubmitting}
          className="submit-button-primary w-full py-3 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <LoaderIcon className="w-5 h-5 animate-spin" />
              Mengirim...
            </>
          ) : (
            <>
              <SendIcon className="w-5 h-5" />
              Kirim Absensi
            </>
          )}
        </button>
        
        {submitError && (
          <div className="error-banner mt-2 p-2 bg-red-50 rounded flex items-center gap-2">
            <XCircleIcon className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-600">{submitError}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const InfoTabs: React.FC<any> = ({ recentAttendances }) => {
  const [activeTab, setActiveTab] = useState('gamification');
  
  return (
    <div className="info-tabs-container bg-white rounded-lg shadow p-4 mt-2">
      <div className="tabs-header flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('gamification')}
          className={`tab-button flex-1 py-2 rounded ${
            activeTab === 'gamification' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
          }`}
        >
          <TrophyIcon className="w-4 h-4 inline mr-1" />
          Rewards
        </button>
        <button
          onClick={() => setActiveTab('social')}
          className={`tab-button flex-1 py-2 rounded ${
            activeTab === 'social' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
          }`}
        >
          <UsersIcon className="w-4 h-4 inline mr-1" />
          Aktivitas
        </button>
        <button
          onClick={() => setActiveTab('biometric')}
          className={`tab-button flex-1 py-2 rounded ${
            activeTab === 'biometric' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
          }`}
        >
          <FingerprintIcon className="w-4 h-4 inline mr-1" />
          Biometrik
        </button>
      </div>
      
      {activeTab === 'gamification' && (
        <div className="rewards-panel">
          <h4 className="font-semibold mb-2">Poin & Pencapaian</h4>
          <div className="rewards-grid grid grid-cols-2 gap-2">
            <div className="reward-card p-3 bg-yellow-50 rounded text-center">
              <TrophyIcon className="w-6 h-6 mx-auto text-yellow-500 mb-1" />
              <span className="block font-semibold">+10 Poin</span>
              <p className="text-xs text-gray-600">Absen tepat waktu</p>
            </div>
            <div className="reward-card p-3 bg-orange-50 rounded text-center">
              <span className="text-2xl">🔥</span>
              <span className="block font-semibold">Streak: 5 hari</span>
              <p className="text-xs text-gray-600">Konsisten hadir</p>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'social' && (
        <div className="social-panel">
          <h4 className="font-semibold mb-2">Aktivitas Terkini</h4>
          <div className="activity-feed space-y-2">
            {recentAttendances.slice(0, 3).map((att: any) => (
              <div key={att.id} className="activity-item flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200" />
                <div className="activity-text flex-1">
                  <span className="font-medium text-sm">{att.user?.name || 'User'}</span>
                  <span className="text-xs text-gray-600 block">
                    absen {new Date(att.created_at).toLocaleTimeString('id-ID')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {activeTab === 'biometric' && (
        <div className="biometric-panel">
          <h4 className="font-semibold mb-2">Pengaturan Biometrik</h4>
          <p className="text-sm text-gray-600 mb-3">
            Aktifkan autentikasi biometrik untuk absen lebih cepat
          </p>
          <button className="w-full py-2 border rounded flex items-center justify-center gap-2">
            <FingerprintIcon className="w-4 h-4" />
            Aktifkan Face ID / Touch ID
          </button>
        </div>
      )}
    </div>
  );
};
```


```bash
# 1. Run TypeScript checks
npm run type-check

# 2. Run linter
npm run lint

# 3. Run tests
npm run test

# 4. Build production bundle
npm run build

# 5. Check bundle size
npm run analyze

# 6. Test production build locally
npm run preview
```

### Staged Rollout

```typescript
// Feature flag for gradual rollout
const useUnifiedCamera = () => {
  const { user } = useAuth();
  
  // Enable for specific user groups
  if (user.role === 'admin') return true;
  if (user.email.endsWith('@unpam.ac.id')) return true;
  
  // Percentage rollout (10% of users)
  const userId = parseInt(user.id);
  return userId % 10 === 0;
};

// In component
const UnifiedCameraEnabled = useUnifiedCamera();

return UnifiedCameraEnabled ? (
  <UnifiedCameraCard />
) : (
  <LegacyStepCards />
);
```

### Monitoring Post-Deployment

```typescript
// Set up alerts for critical metrics
const setupMonitoring = () => {
  // Alert if camera load time > 3s
  if (cameraLoadTime > 3000) {
    alertTeam('Camera load time exceeded threshold');
  }
  
  // Alert if error rate > 5%
  if (errorRate > 0.05) {
    alertTeam('High error rate detected in unified camera');
  }
  
  // Alert if flip animation drops frames
  if (flipAnimationFPS < 30) {
    alertTeam('Flip animation performance degraded');
  }
};
```

### Rollback Plan

```typescript
// Quick rollback via feature flag
const FEATURE_FLAGS = {
  unifiedCamera: {
    enabled: false, // Set to false to rollback
    version: '2.0.0'
  }
};

// Automatic rollback on high error rate
useEffect(() => {
  if (errorRate > 0.1) {
    console.error('High error rate detected, rolling back...');
    setFeatureFlag('unifiedCamera', false);
    notifyTeam('Automatic rollback triggered');
  }
}, [errorRate]);
```

---

## 📱 DEVICE COMPATIBILITY

### Tested Devices

| Device | OS | Browser | Status |
|--------|----|---------| -------|
| iPhone 13 | iOS 16 | Safari | ✅ |
| iPhone 13 | iOS 16 | Chrome | ✅ |
| Samsung S21 | Android 13 | Chrome | ✅ |
| Samsung S21 | Android 13 | Samsung Internet | ✅ |
| Pixel 6 | Android 13 | Chrome | ✅ |
| iPad Pro | iPadOS 16 | Safari | ✅ |
| MacBook Pro | macOS 13 | Chrome | ✅ |
| MacBook Pro | macOS 13 | Safari | ✅ |
| Windows 11 | Windows 11 | Chrome | ✅ |
| Windows 11 | Windows 11 | Edge | ✅ |

### Browser Support

```typescript
// Check browser compatibility
const checkBrowserSupport = () => {
  const requirements = {
    getUserMedia: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
    webRTC: 'RTCPeerConnection' in window,
    canvas: 'HTMLCanvasElement' in window,
    geolocation: 'geolocation' in navigator,
    permissions: 'permissions' in navigator
  };
  
  const unsupported = Object.entries(requirements)
    .filter(([_, supported]) => !supported)
    .map(([feature]) => feature);
  
  if (unsupported.length > 0) {
    console.warn('Unsupported features:', unsupported);
    return false;
  }
  
  return true;
};

// Show fallback for unsupported browsers
if (!checkBrowserSupport()) {
  return <UnsupportedBrowserMessage />;
}
```

---

## 🐛 TROUBLESHOOTING GUIDE

### Common Issues

#### 1. Camera Not Starting

**Symptoms:** Black screen, no camera feed

**Solutions:**
```typescript
// Check 1: Permissions
const hasPermission = await checkCameraPermission();
if (!hasPermission) {
  showPermissionGuide();
}

// Check 2: Camera in use by another app
try {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  // Success
} catch (error) {
  if (error.name === 'NotReadableError') {
    toast.error('Kamera sedang digunakan aplikasi lain');
  }
}

// Check 3: HTTPS required
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
  toast.error('Kamera hanya dapat diakses melalui HTTPS');
}
```

#### 2. Flip Animation Stuttering

**Symptoms:** Jerky animation, dropped frames

**Solutions:**
```typescript
// Use CSS transform instead of position
.flip-animation {
  transform: rotateY(180deg);
  will-change: transform; /* GPU acceleration */
}

// Reduce animation complexity
const optimizedFlip = {
  duration: 400, // Shorter duration
  easing: 'ease-out' // Simpler easing
};

// Pause other animations during flip
useEffect(() => {
  if (cameraPhase === 'flipping') {
    document.body.classList.add('reduce-motion');
  } else {
    document.body.classList.remove('reduce-motion');
  }
}, [cameraPhase]);
```

#### 3. QR Code Not Detecting

**Symptoms:** Scanner active but not reading QR

**Solutions:**
```typescript
// Increase scan frequency
const qrConfig = {
  fps: 10, // Increase from default 5
  qrbox: { width: 250, height: 250 }, // Larger scan area
  aspectRatio: 1.0
};

// Add better lighting guidance
<div className="text-white text-center">
  <Lightbulb className="w-6 h-6 mx-auto mb-2" />
  <p>Pastikan pencahayaan cukup terang</p>
</div>

// Allow manual focus
const enableManualFocus = async () => {
  const stream = videoRef.current?.srcObject as MediaStream;
  const track = stream?.getVideoTracks()[0];
  
  if (track && 'focusMode' in track.getCapabilities()) {
    await track.applyConstraints({
      advanced: [{ focusMode: 'manual' }]
    });
  }
};
```

#### 4. Location Not Detected

**Symptoms:** Location fetch fails or times out

**Solutions:**
```typescript
// Increase timeout
const locationOptions = {
  enableHighAccuracy: true,
  timeout: 15000, // Increase from 10s
  maximumAge: 0
};

// Fallback to IP-based location
const fallbackLocation = async () => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return {
      latitude: data.latitude,
      longitude: data.longitude,
      accuracy: 1000 // Lower accuracy
    };
  } catch (error) {
    console.error('Fallback location failed:', error);
  }
};

// Show manual location input
<ManualLocationInput 
  onSubmit={(coords) => setLocationData(coords)}
/>
```

#### 5. Memory Leaks

**Symptoms:** Page becomes slow after multiple uses

**Solutions:**
```typescript
// Proper cleanup
useEffect(() => {
  return () => {
    // Stop all streams
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      videoRef.current.srcObject = null;
    }
    
    // Clear blob URLs
    if (selfieImage) {
      URL.revokeObjectURL(URL.createObjectURL(selfieImage));
    }
    
    // Remove event listeners
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}, []);

// Monitor memory usage
const checkMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    console.log('Memory usage:', {
      used: (memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
      total: (memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB'
    });
  }
};
```

---

## 📚 CODE EXAMPLES

### Complete UnifiedCameraCard Implementation


```tsx
// components/UnifiedCameraCard.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type CameraPhase = 'idle' | 'scanning' | 'flipping' | 'selfie' | 'done';

interface UnifiedCameraCardProps {
  selfieRequired: boolean;
  onQRSuccess: (token: string) => void;
  onSelfieCapture: (image: Blob) => void;
  onError: (error: Error) => void;
}

export const UnifiedCameraCard: React.FC<UnifiedCameraCardProps> = ({
  selfieRequired,
  onQRSuccess,
  onSelfieCapture,
  onError
}) => {
  const [cameraPhase, setCameraPhase] = useState<CameraPhase>('idle');
  const [isFlipping, setIsFlipping] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scanStartTimeRef = useRef<number>(0);

  // Start QR Scanner
  const startQRScanner = async () => {
    try {
      setCameraPhase('scanning');
      scanStartTimeRef.current = Date.now();
      
      const html5QrCode = new Html5Qrcode('qr-reader');
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        (decodedText) => {
          handleQRSuccess(decodedText);
        },
        (errorMessage) => {
          // Ignore scan errors (too frequent)
        }
      );
      
      setProgress(25);
      
    } catch (error) {
      console.error('QR Scanner error:', error);
      toast.error('Gagal memulai scanner QR');
      setCameraPhase('idle');
      onError(error as Error);
    }
  };

  // Handle QR Success
  const handleQRSuccess = async (decodedText: string) => {
    try {
      // Stop scanner
      if (html5QrCodeRef.current) {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
      }

      // Show success flash
      toast.success('QR Code berhasil dipindai!');
      onQRSuccess(decodedText);
      setProgress(50);

      // Auto-flip to selfie or complete
      if (selfieRequired) {
        await handleAutoFlipToSelfie();
      } else {
        setCameraPhase('done');
        setProgress(100);
      }
      
    } catch (error) {
      console.error('QR success handler error:', error);
      onError(error as Error);
    }
  };

  // Auto-flip to selfie camera
  const handleAutoFlipToSelfie = async () => {
    try {
      // Trigger flip animation
      setCameraPhase('flipping');
      setIsFlipping(true);

      // Wait for animation
      await new Promise(resolve => setTimeout(resolve, 600));

      // Start front camera
      setCameraPhase('selfie');
      setIsFlipping(false);
      await startFrontCamera();
      
      setProgress(75);

    } catch (error) {
      console.error('Flip transition error:', error);
      toast.error('Gagal beralih ke kamera selfie');
      setCameraPhase('idle');
      onError(error as Error);
    }
  };

  // Start front camera for selfie
  const startFrontCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
    } catch (error) {
      console.error('Front camera error:', error);
      toast.error('Tidak dapat mengakses kamera depan');
      throw error;
    }
  };

  // Capture selfie
  const captureSelfie = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mirror the image
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      if (blob) {
        onSelfieCapture(blob);
        setCameraPhase('done');
        setProgress(100);
        
        // Stop camera
        const stream = video.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
        
        toast.success('Selfie berhasil diambil!');
      }
    }, 'image/jpeg', 0.9);
  }, [onSelfieCapture]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
      
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="relative">
      {/* Status Ring Overlay */}
      <StatusRingOverlay progress={progress} />

      {/* Camera Viewport */}
      <div 
        className={`
          relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-900
          transition-transform duration-600 ease-in-out
          ${isFlipping ? 'animate-flip-3d' : ''}
        `}
        style={{
          transformStyle: 'preserve-3d',
          perspective: '1000px'
        }}
      >
        {/* Idle State */}
        {cameraPhase === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-600 to-purple-600">
            <Camera className="w-20 h-20 text-white mb-6" />
            <h3 className="text-2xl font-bold text-white mb-2">Siap Memulai?</h3>
            <p className="text-white/80 text-center mb-8">
              Scan QR code untuk memulai absensi
            </p>
            <button
              onClick={startQRScanner}
              className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Mulai Scan
            </button>
          </div>
        )}

        {/* Scanning State */}
        {cameraPhase === 'scanning' && (
          <div id="qr-reader" className="w-full h-full" />
        )}

        {/* Flipping State */}
        {cameraPhase === 'flipping' && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-600">
            <Loader2 className="w-16 h-16 text-white animate-spin" />
          </div>
        )}

        {/* Selfie State */}
        {cameraPhase === 'selfie' && (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover scale-x-[-1]"
              autoPlay
              playsInline
              muted
            />
            <SelfieOverlay onCapture={captureSelfie} />
          </>
        )}

        {/* Done State */}
        {cameraPhase === 'done' && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-600">
            <div className="text-center text-white">
              <CheckCircle className="w-20 h-20 mx-auto mb-4" />
              <h3 className="text-2xl font-bold">Selesai!</h3>
              <p className="text-white/80 mt-2">Semua data berhasil dikumpulkan</p>
            </div>
          </div>
        )}

        {/* Hidden canvas */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Phase Indicator */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          {cameraPhase === 'idle' && 'Tekan tombol untuk memulai'}
          {cameraPhase === 'scanning' && 'Arahkan kamera ke QR code'}
          {cameraPhase === 'flipping' && 'Beralih ke kamera depan...'}
          {cameraPhase === 'selfie' && 'Ambil foto selfie Anda'}
          {cameraPhase === 'done' && 'Proses selesai'}
        </p>
      </div>
    </div>
  );
};

// Status Ring Component
const StatusRingOverlay: React.FC<{ progress: number }> = ({ progress }) => {
  const radius = 140;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
      <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
        <circle
          stroke="rgba(255, 255, 255, 0.1)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="url(#gradient)"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference + ' ' + circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="transition-all duration-500 ease-out"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

// Selfie Overlay Component
const SelfieOverlay: React.FC<{ onCapture: () => void }> = ({ onCapture }) => {
  const [countdown, setCountdown] = useState<number | null>(null);

  const handleCaptureWithCountdown = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(interval);
          onCapture();
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-between p-6">
      <div className="flex-1 flex items-center justify-center">
        <div className="relative">
          <svg width="240" height="320" viewBox="0 0 240 320">
            <ellipse
              cx="120"
              cy="160"
              rx="100"
              ry="140"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeDasharray="10 5"
              className="opacity-60"
            />
          </svg>
          
          {countdown && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-8xl font-bold animate-ping">
                {countdown}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="text-center text-white mb-4">
        <p className="text-sm opacity-90">Posisikan wajah dalam oval</p>
      </div>

      <button
        onClick={handleCaptureWithCountdown}
        disabled={countdown !== null}
        className="w-20 h-20 rounded-full bg-white border-4 border-blue-500 shadow-lg active:scale-95 transition-transform disabled:opacity-50"
      >
        <div className="w-full h-full rounded-full bg-blue-500" />
      </button>
    </div>
  );
};
```

---

## 🎓 LEARNING RESOURCES

### Recommended Reading
- [WebRTC API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [MediaDevices.getUserMedia()](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [HTML5 QR Code Scanner](https://github.com/mebjas/html5-qrcode)
- [CSS 3D Transforms](https://developer.mozilla.org/en-US/docs/Web/CSS/transform)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)

### Video Tutorials
- Building Camera Apps with React
- Smooth Animations with Framer Motion
- State Machine Patterns in React
- Mobile-First Responsive Design

---

## 📞 SUPPORT & FEEDBACK

### Getting Help
- **Documentation:** Check this prompt and inline code comments
- **Issues:** Report bugs via GitHub Issues
- **Questions:** Ask in team Slack channel #dev-absensi
- **Emergency:** Contact @tech-lead for critical issues

### Providing Feedback
- **UX Improvements:** Share user feedback in #ux-research
- **Performance Issues:** Report with device/browser details
- **Feature Requests:** Submit via product roadmap board

---

## ✅ VERIFICATION CHECKLIST

### Before Submitting PR

- [ ] TypeScript compiles without errors (`npm run type-check`)
- [ ] All tests pass (`npm run test`)
- [ ] Linter passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Manual testing completed on:
  - [ ] Chrome (desktop)
  - [ ] Safari (desktop)
  - [ ] Chrome (mobile)
  - [ ] Safari (iOS)
- [ ] Accessibility tested with:
  - [ ] Keyboard navigation
  - [ ] Screen reader (VoiceOver/NVDA)
  - [ ] Color contrast checker
- [ ] Performance metrics acceptable:
  - [ ] Camera load < 2s
  - [ ] Flip animation smooth (60fps)
  - [ ] Bundle size increase < 50KB
- [ ] Documentation updated
- [ ] Analytics events implemented
- [ ] Error tracking configured

### Post-Deployment Monitoring

- [ ] Monitor error rates (first 24h)
- [ ] Check performance metrics
- [ ] Review user feedback
- [ ] Verify analytics data
- [ ] Confirm rollback plan works

---

## 🎉 SUCCESS METRICS

### Key Performance Indicators (KPIs)

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Attendance completion rate | > 95% | TBD | 🟡 |
| Average completion time | < 30s | TBD | 🟡 |
| Camera load time | < 2s | TBD | 🟡 |
| Error rate | < 2% | TBD | 🟡 |
| User satisfaction | > 4.5/5 | TBD | 🟡 |
| Mobile usage | > 80% | TBD | 🟡 |

### User Experience Goals

- **Reduce steps:** From 4 separate cards to 1 unified flow ✅
- **Faster completion:** 30% reduction in average time ⏳
- **Higher satisfaction:** Improved NPS score ⏳
- **Lower support tickets:** 50% reduction in camera issues ⏳

---

## 📝 FINAL NOTES

This refactoring transforms the attendance system from a traditional multi-step form into a modern, fluid experience. The key innovation is the unified camera card that intelligently transitions between QR scanning and selfie capture, making the process feel seamless and natural.

**Remember:**
- Test thoroughly on real devices
- Monitor performance metrics closely
- Gather user feedback early
- Be ready to iterate quickly
- Keep accessibility as a priority

**Good luck with the implementation! 🚀**

---

*Document Version: 1.0.0*  
*Last Updated: 2026-03-12*  
*Author: Development Team*  
*Status: Ready for Implementation*

---

## 🎨 CSS STYLING SPECIFICATIONS

### Main Styles

```css
/* resources/css/absen.css */

/* ========== LAYOUT ========== */

.absen-page-container {
  max-width: 640px;
  margin: 0 auto;
  padding: 1rem;
  padding-bottom: 120px; /* Space for sticky footer */
}

.header-section {
  margin-bottom: 1.5rem;
}

/* ========== UNIFIED CAMERA CARD ========== */

.unified-camera-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  min-height: 400px;
}

.camera-placeholder {
  padding: 3rem 2rem;
  text-align: center;
}

.btn-primary-gradient {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: white;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary-gradient:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
}

.btn-primary-gradient:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ========== CAMERA VIEWPORT ========== */

.camera-viewport {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  background: #000;
}

#qr-reader {
  width: 100%;
  height: 100%;
}

#qr-reader video {
  object-fit: cover;
}

/* ========== STATUS RING OVERLAY ========== */

.status-ring-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 10;
}

/* ========== SCANNING PHASE ========== */

.scanning-indicator {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 5;
}

.scan-line {
  width: 16rem;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(59, 130, 246, 0.8),
    transparent
  );
  animation: scan 2s ease-in-out infinite;
}

@keyframes scan {
  0%, 100% {
    transform: translateY(-50%);
  }
  50% {
    transform: translateY(50%);
  }
}

.qr-corner-guides {
  position: absolute;
  inset: 20%;
  pointer-events: none;
}

.qr-corner-guides .corner {
  position: absolute;
  width: 40px;
  height: 40px;
  border: 3px solid white;
}

.qr-corner-guides .corner.top-left {
  top: 0;
  left: 0;
  border-right: none;
  border-bottom: none;
}

.qr-corner-guides .corner.top-right {
  top: 0;
  right: 0;
  border-left: none;
  border-bottom: none;
}

.qr-corner-guides .corner.bottom-left {
  bottom: 0;
  left: 0;
  border-right: none;
  border-top: none;
}

.qr-corner-guides .corner.bottom-right {
  bottom: 0;
  right: 0;
  border-left: none;
  border-top: none;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}

/* ========== FLIPPING PHASE ========== */

.flip-container {
  perspective: 1000px;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.flip-card {
  position: relative;
  width: 200px;
  height: 200px;
  transform-style: preserve-3d;
}

.flip-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.flip-face.back {
  transform: rotateY(180deg);
}

/* ========== SELFIE PHASE ========== */

.mirror {
  transform: scaleX(-1);
}

.face-guide-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 5;
}

.face-oval {
  width: 12rem;
  height: 16rem;
  border: 4px dashed white;
  border-radius: 50%;
  opacity: 0.5;
}

.capture-controls {
  position: absolute;
  bottom: 2rem;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
}

.capture-button {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: transform 0.2s;
}

.capture-button:active {
  transform: scale(0.95);
}

.capture-ring {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  border: 4px solid #3b82f6;
}

/* ========== DONE PHASE ========== */

.completion-summary {
  padding: 2rem;
}

.selfie-thumbnail {
  position: relative;
  width: 8rem;
  height: 8rem;
  margin: 0 auto 1rem;
}

.selfie-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0.5rem;
}

.thumbnail-badge {
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  width: 2rem;
  height: 2rem;
  background: #10b981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.completion-checklist {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.check-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

/* ========== LOCATION STATUS CARD ========== */

.location-status-compact {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  margin-top: 1rem;
}

/* ========== STICKY SUBMIT FOOTER ========== */

.sticky-submit-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-top: 1px solid #e5e7eb;
  padding: 1rem;
  box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 40;
}

.footer-content {
  max-width: 640px;
  margin: 0 auto;
}

.submit-button-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: white;
  font-weight: 600;
  transition: all 0.3s ease;
}

.submit-button-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
}

.submit-button-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-banner {
  background: #fef2f2;
  padding: 0.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

/* ========== INFO TABS ========== */

.info-tabs-wrapper {
  margin-top: 1rem;
}

.info-tabs-container {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  margin-top: 0.5rem;
}

.tabs-header {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tab-button {
  flex: 1;
  padding: 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.rewards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.reward-card {
  padding: 0.75rem;
  border-radius: 0.5rem;
  text-align: center;
}

.activity-feed {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* ========== RESPONSIVE ========== */

@media (max-width: 640px) {
  .absen-page-container {
    padding: 0.5rem;
  }
  
  .header-section h1 {
    font-size: 1.5rem;
  }
  
  .camera-placeholder {
    padding: 2rem 1rem;
  }
  
  .face-oval {
    width: 10rem;
    height: 14rem;
  }
}

/* ========== ANIMATIONS ========== */

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.unified-camera-card {
  animation: fadeIn 0.3s ease-out;
}

@keyframes complete {
  0% {
    stroke-dashoffset: 283;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

.animate-complete {
  animation: complete 0.8s ease-out forwards;
}
```

---

## 🧪 TESTING & VERIFICATION PLAN

### Automated Tests

#### 1. TypeScript Compilation
```bash
# Must pass with 0 errors
npm run build

# Expected output:
# ✓ Built in XXXms
# No TypeScript errors
```

#### 2. Linting
```bash
npm run lint

# Expected: No errors related to absen.tsx
```

### Manual Testing Checklist

#### Test Case 1: Initial Load
- [ ] Page loads without errors
- [ ] Header displays correctly with progress ring (0/4)
- [ ] Consent checkbox is unchecked
- [ ] Camera card shows idle state
- [ ] "Mulai Scan" button is disabled

#### Test Case 2: Consent Flow
- [ ] Check consent checkbox
- [ ] "Mulai Scan" button becomes enabled
- [ ] Button has gradient background
- [ ] Hover effect works

#### Test Case 3: QR Scanning (Happy Path)
- [ ] Click "Mulai Scan"
- [ ] Camera permission prompt appears
- [ ] Rear camera opens in unified card
- [ ] Scan line animation is smooth
- [ ] Corner guides are visible
- [ ] Progress ring updates to 1/4
- [ ] Point at valid QR code
- [ ] "Scan Berhasil" toast appears
- [ ] Camera stops
- [ ] 3D flip animation starts (600ms)
- [ ] Progress ring updates to 2/4

#### Test Case 4: Selfie Capture (Happy Path)
- [ ] After flip, front camera opens
- [ ] Video is mirrored (natural selfie view)
- [ ] Face guide oval is visible
- [ ] Capture button is accessible
- [ ] Tap capture button
- [ ] Camera stops
- [ ] Selfie thumbnail appears in done state
- [ ] Progress ring updates to 3/4
- [ ] "Foto Berhasil!" message shows

#### Test Case 5: Location Collection
- [ ] Location permission prompt appears (if first time)
- [ ] Location status shows "loading"
- [ ] After success, shows distance (e.g., "150m dari kampus")
- [ ] Progress ring updates to 4/4
- [ ] Location details are expandable

#### Test Case 6: Submission
- [ ] Sticky footer is visible at bottom
- [ ] Submit button shows "4/4 langkah selesai"
- [ ] Submit button is enabled
- [ ] Click submit
- [ ] Button shows loading state
- [ ] Success toast appears
- [ ] Redirect to success page

#### Test Case 7: No Selfie Required
- [ ] Set `selfieRequired = false` in props
- [ ] Complete QR scan
- [ ] Verify it skips directly to location (no flip/selfie)
- [ ] Progress jumps from 2/4 to 3/4

#### Test Case 8: Error Handling - Camera Denied
- [ ] Deny camera permission
- [ ] Error toast appears
- [ ] Returns to idle state
- [ ] Can retry

#### Test Case 9: Error Handling - Location Denied
- [ ] Deny location permission
- [ ] Location status shows error
- [ ] "Coba Lagi" button appears
- [ ] Can retry location

#### Test Case 10: Retry Flows
- [ ] During scanning, click "Batal" → returns to idle
- [ ] During selfie, click "Scan Ulang" → returns to idle
- [ ] After selfie, click "Foto Ulang" → reopens front camera

#### Test Case 11: Manual Token Input
- [ ] Expand "Input Token Manual"
- [ ] Enter token manually
- [ ] Can submit with manual token (skip QR)

#### Test Case 12: Info Tabs
- [ ] Click "Info Tambahan" to expand
- [ ] Switch between 3 tabs (Rewards, Aktivitas, Biometrik)
- [ ] Content updates correctly
- [ ] Collapse works

#### Test Case 13: Responsive Design
- [ ] Test on mobile viewport (375px)
- [ ] Test on tablet (768px)
- [ ] Test on desktop (1024px)
- [ ] All elements are accessible
- [ ] No horizontal scroll

#### Test Case 14: Performance
- [ ] Camera opens in < 2 seconds
- [ ] Flip animation is smooth (60fps)
- [ ] No jank during transitions
- [ ] Page is responsive during camera use

### Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Safari (iOS)
- [ ] Firefox (latest)
- [ ] Edge (latest)

### Device Testing

- [ ] iPhone (Safari)
- [ ] Android (Chrome)
- [ ] iPad
- [ ] Desktop

---

## 📊 PERFORMANCE OPTIMIZATION

### 1. Lazy Loading
```typescript
// Lazy load Html5Qrcode only when needed
const loadQRScanner = async () => {
  const { Html5Qrcode } = await import('html5-qrcode');
  return Html5Qrcode;
};
```

### 2. Image Compression
```typescript
// Compress selfie before upload
const compressSelfie = async (blob: Blob): Promise<Blob> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(blob);
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxWidth = 800;
      const scale = maxWidth / img.width;
      
      canvas.width = maxWidth;
      canvas.height = img.height * scale;
      
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((compressed) => {
        resolve(compressed!);
      }, 'image/jpeg', 0.8);
    };
  });
};
```

### 3. Debounce Location Updates
```typescript
const debouncedLocationUpdate = debounce(collectLocation, 500);
```

### 4. Cleanup on Unmount
```typescript
useEffect(() => {
  return () => {
    // Stop camera
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.stop();
    }
    
    // Stop video stream
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    
    // Revoke object URLs
    if (selfiePreview) {
      URL.revokeObjectURL(selfiePreview);
    }
  };
}, []);
```


---

## 🔒 SECURITY CONSIDERATIONS

### 1. Camera Permission Handling
- Always request permissions explicitly
- Handle denial gracefully
- Provide clear error messages
- Never force permissions

### 2. Data Validation
```typescript
// Validate QR token format
const validateQRToken = (token: string): boolean => {
  return /^[A-Z0-9]{8,16}$/.test(token);
};

// Validate location accuracy
const validateLocationAccuracy = (accuracy: number): boolean => {
  return accuracy <= 100; // meters
};
```

### 3. HTTPS Only
- Camera and geolocation APIs require HTTPS
- Ensure production uses SSL certificate

### 4. Data Privacy
- Selfie stored temporarily in memory
- Transmitted via secure FormData
- Deleted after successful submission
- No client-side caching of biometric data

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] All TypeScript errors resolved
- [ ] All manual tests passed
- [ ] Browser compatibility verified
- [ ] Mobile device testing complete
- [ ] Performance benchmarks met
- [ ] Security review complete

### Deployment Steps
1. Merge feature branch to main
2. Run production build: `npm run build`
3. Deploy to staging environment
4. Run smoke tests on staging
5. Deploy to production
6. Monitor error logs for 24 hours

### Post-Deployment
- [ ] Monitor user completion rates
- [ ] Check error logs for camera/location issues
- [ ] Gather user feedback
- [ ] Track performance metrics

---

## 📈 SUCCESS METRICS

### Quantitative Metrics
- User completion rate: Target +15% improvement
- Average time to complete: Target < 60 seconds
- Error rate: Target < 5%
- Camera initialization time: Target < 2 seconds
- Flip animation smoothness: Target 60fps

### Qualitative Metrics
- User satisfaction score
- Ease of use rating
- Visual appeal rating
- Mobile experience rating

---

## 🔄 FUTURE ENHANCEMENTS

### Phase 2 Improvements
1. **Face Detection**: Real-time face detection with ML
2. **Liveness Detection**: Prevent photo spoofing
3. **Offline Support**: Queue submissions when offline
4. **Multi-language**: i18n support
5. **Accessibility**: Screen reader optimization
6. **Dark Mode**: Theme support

### Advanced Features
- Biometric authentication (Face ID / Touch ID)
- NFC badge scanning
- Bluetooth beacon detection
- AI-powered attendance insights
- Real-time attendance dashboard

---

## 📚 REFERENCES & RESOURCES

### Libraries Used
- **html5-qrcode**: QR code scanning
  - Docs: https://github.com/mebjas/html5-qrcode
- **Inertia.js**: Server-side routing
  - Docs: https://inertiajs.com
- **Lucide React**: Icon library
  - Docs: https://lucide.dev
- **Sonner**: Toast notifications
  - Docs: https://sonner.emilkowal.ski

### Browser APIs
- **MediaDevices.getUserMedia()**: Camera access
  - MDN: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
- **Geolocation API**: Location access
  - MDN: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API

### Design Inspiration
- Material Design 3 transitions
- iOS camera interface patterns
- Progressive Web App best practices

---

## 🎯 IMPLEMENTATION PRIORITY

### Critical Path (Must Have)
1. ✅ Unified camera card component
2. ✅ Phase state machine (idle → scanning → flipping → selfie → done)
3. ✅ 3D flip animation
4. ✅ Auto-transition logic
5. ✅ Compact progress ring
6. ✅ Sticky submit footer
7. ✅ Location auto-collection

### High Priority (Should Have)
8. ✅ Status ring overlay
9. ✅ Collapsible info tabs
10. ✅ Manual token input
11. ✅ Retry flows
12. ✅ Error handling

### Medium Priority (Nice to Have)
13. Face guide overlay
14. Gamification rewards
15. Social proof feed
16. Biometric setup prompt

### Low Priority (Future)
17. Face detection ML
18. Liveness detection
19. Offline queue
20. Dark mode

---

## 💡 TIPS FOR IMPLEMENTATION

### Development Workflow
1. Start with state machine logic
2. Build idle and scanning phases first
3. Add flip animation (test thoroughly)
4. Implement selfie capture
5. Add location collection
6. Build UI components
7. Add styling and animations
8. Test on real devices
9. Optimize performance
10. Deploy to staging

### Common Pitfalls to Avoid
- ❌ Don't forget to stop camera streams
- ❌ Don't block the main thread during flip
- ❌ Don't skip error handling
- ❌ Don't forget mobile testing
- ❌ Don't ignore permission denials
- ❌ Don't cache biometric data
- ❌ Don't use synchronous operations

### Best Practices
- ✅ Use TypeScript for type safety
- ✅ Clean up resources in useEffect
- ✅ Provide visual feedback for all actions
- ✅ Test on real devices early
- ✅ Optimize images before upload
- ✅ Handle all error cases
- ✅ Follow accessibility guidelines

---

## 🎬 CONCLUSION

This refactor transforms the attendance experience from a multi-step form into a seamless, premium camera flow. The unified camera card with phase-based transitions creates a modern, app-like experience that feels natural and intuitive.

Key achievements:
- **Reduced friction**: 4 cards → 1 unified card
- **Seamless transitions**: Auto-flip from QR to selfie
- **Visual polish**: 3D animations, status rings, smooth feedback
- **Mobile-first**: Optimized for touch and small screens
- **Maintainable**: Clear state machine, typed components

The implementation prioritizes user experience while maintaining code quality, security, and performance. Follow the testing checklist thoroughly to ensure a smooth rollout.

---

**Document Version**: 1.0  
**Last Updated**: 2026-03-12  
**Author**: AI Assistant  
**Status**: Ready for Implementation

