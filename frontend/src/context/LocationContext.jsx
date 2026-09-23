import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import weatherService from '../services/weatherService';
import { useAuth } from './AuthContext';

const LocationContext = createContext(null);
const STORAGE_KEY = 'weathergpt.location';

// Used only until the person searches or shares their location.
const FALLBACK = {
  name: 'Bengaluru',
  city: 'Bengaluru',
  state: 'Karnataka',
  country: 'India',
  latitude: 12.9719,
  longitude: 77.5937,
  label: 'Bengaluru, Karnataka, India',
};

export function LocationProvider({ children }) {
  const { user } = useAuth();
  const [location, setLocationState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : FALLBACK;
    } catch {
      return FALLBACK;
    }
  });
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // A signed-in user's default location wins over the local fallback.
  useEffect(() => {
    const def = user?.defaultLocation;
    if (def && Number.isFinite(Number(def.latitude)) && !localStorage.getItem(STORAGE_KEY)) {
      setLocationState({
        ...def,
        label: [def.name || def.city, def.state, def.country].filter(Boolean).join(', '),
      });
    }
  }, [user]);

  const setLocation = useCallback((next) => {
    if (!next) return;
    const normalised = {
      ...next,
      name: next.name || next.city || 'Selected location',
      label: next.label || [next.name || next.city, next.state, next.country].filter(Boolean).join(', '),
      latitude: Number(next.latitude),
      longitude: Number(next.longitude),
    };
    setLocationState(normalised);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalised));
  }, []);

  const useMyLocation = useCallback(() => {
    setLocationError(null);
    if (!('geolocation' in navigator)) {
      setLocationError('This browser cannot share your location. Search for your city instead.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const place = await weatherService.reverseGeocode(latitude, longitude);
          setLocation(place);
        } catch {
          setLocationError('Found your coordinates but could not name the place. Search for your city instead.');
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        setLocationError('Location permission was denied. Search for your city instead.');
      },
      { timeout: 10000, maximumAge: 300000 }
    );
  }, [setLocation]);

  const value = useMemo(
    () => ({ location, setLocation, useMyLocation, locating, locationError }),
    [location, setLocation, useMyLocation, locating, locationError]
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used inside LocationProvider');
  return ctx;
}

export default LocationContext;
