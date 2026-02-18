/**
 * Capture real device information from the browser
 */
export function captureDeviceInfo() {
    const ua = navigator.userAgent;
    const platform = navigator.platform;
    const language = navigator.language;
    const screenResolution = `${window.screen.width}x${window.screen.height}`;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Detect device type
    let deviceType = 'Desktop';
    if (/Mobile|Android|iPhone|iPod/i.test(ua)) {
        deviceType = 'Mobile';
    } else if (/iPad|Tablet/i.test(ua)) {
        deviceType = 'Tablet';
    }

    // Detect OS
    let os = 'Unknown';
    if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
    else if (/Android/i.test(ua)) os = 'Android';
    else if (/Windows/i.test(ua)) os = 'Windows';
    else if (/Mac/i.test(ua)) os = 'macOS';
    else if (/Linux/i.test(ua)) os = 'Linux';
    else if (/CrOS/i.test(ua)) os = 'ChromeOS';

    // Detect Browser
    let browser = 'Unknown';
    if (/Edg\//i.test(ua)) browser = 'Edge';
    else if (/OPR\//i.test(ua) || /Opera/i.test(ua)) browser = 'Opera';
    else if (/SamsungBrowser/i.test(ua)) browser = 'Samsung Internet';
    else if (/Chrome/i.test(ua)) browser = 'Chrome';
    else if (/Firefox/i.test(ua)) browser = 'Firefox';
    else if (/Safari/i.test(ua)) browser = 'Safari';

    // Extract device model from user agent
    let deviceModel = 'Unknown';
    if (/Android/i.test(ua)) {
        const match = ua.match(/;\s*([^;)]+)\s*Build\//);
        if (match) deviceModel = match[1].trim();
    } else if (/iPhone/i.test(ua)) {
        deviceModel = 'iPhone';
    } else if (/iPad/i.test(ua)) {
        deviceModel = 'iPad';
    } else {
        const match = ua.match(/\(([^)]+)\)/);
        if (match) deviceModel = match[1].substring(0, 60);
    }

    return {
        user_agent: ua,
        device_type: deviceType,
        device_model: deviceModel,
        os,
        browser,
        platform,
        language,
        screen_resolution: screenResolution,
        timezone,
    };
}

/**
 * Capture GPS location with high accuracy
 */
export function captureLocation(): Promise<{
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number | null;
    heading: number | null;
    speed: number | null;
}> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    altitude: position.coords.altitude,
                    heading: position.coords.heading,
                    speed: position.coords.speed,
                });
            },
            (error) => reject(new Error(error.message)),
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            },
        );
    });
}
