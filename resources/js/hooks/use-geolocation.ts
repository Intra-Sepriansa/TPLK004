import { useState, useEffect, useCallback } from 'react';

interface GeolocationState {
    latitude: number | null;
    longitude: number | null;
    accuracy: number | null;
    altitude: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
    timestamp: number | null;
    error: GeolocationPositionError | null;
    loading: boolean;
}

interface UseGeolocationOptions {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
    watch?: boolean;
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
    const {
        enableHighAccuracy = true,
        timeout = 10000,
        maximumAge = 0,
        watch = false,
    } = options;

    const [state, setState] = useState<GeolocationState>({
        latitude: null,
        longitude: null,
        accuracy: null,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
        timestamp: null,
        error: null,
        loading: true,
    });

    const onSuccess = useCallback((position: GeolocationPosition) => {
        setState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp,
            error: null,
            loading: false,
        });
    }, []);

    const onError = useCallback((error: GeolocationPositionError) => {
        setState((prev) => ({
            ...prev,
            error,
            loading: false,
        }));
    }, []);

    const refresh = useCallback(() => {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        navigator.geolocation.getCurrentPosition(onSuccess, onError, {
            enableHighAccuracy,
            timeout,
            maximumAge,
        });
    }, [enableHighAccuracy, timeout, maximumAge, onSuccess, onError]);

    useEffect(() => {
        if (!navigator.geolocation) {
            setState((prev) => ({
                ...prev,
                error: {
                    code: 0,
                    message: 'Geolocation is not supported',
                    PERMISSION_DENIED: 1,
                    POSITION_UNAVAILABLE: 2,
                    TIMEOUT: 3,
                } as GeolocationPositionError,
                loading: false,
            }));
            return;
        }

        if (watch) {
            const watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
                enableHighAccuracy,
                timeout,
                maximumAge,
            });
            return () => navigator.geolocation.clearWatch(watchId);
        } else {
            navigator.geolocation.getCurrentPosition(onSuccess, onError, {
                enableHighAccuracy,
                timeout,
                maximumAge,
            });
        }
    }, [watch, enableHighAccuracy, timeout, maximumAge, onSuccess, onError]);

    const calculateDistance = useCallback(
        (targetLat: number, targetLng: number): number | null => {
            if (state.latitude === null || state.longitude === null) return null;

            const R = 6371e3; // Earth's radius in meters
            const φ1 = (state.latitude * Math.PI) / 180;
            const φ2 = (targetLat * Math.PI) / 180;
            const Δφ = ((targetLat - state.latitude) * Math.PI) / 180;
            const Δλ = ((targetLng - state.longitude) * Math.PI) / 180;

            const a =
                Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

            return R * c;
        },
        [state.latitude, state.longitude]
    );

    const isWithinRadius = useCallback(
        (targetLat: number, targetLng: number, radiusMeters: number): boolean => {
            const distance = calculateDistance(targetLat, targetLng);
            return distance !== null && distance <= radiusMeters;
        },
        [calculateDistance]
    );

    return {
        ...state,
        refresh,
        calculateDistance,
        isWithinRadius,
        isSupported: !!navigator.geolocation,
    };
}
