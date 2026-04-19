import React, { createContext, useContext, useEffect, useState } from 'react';
import { startLocationTracking, stopLocationTracking } from '../lib/locationTracking';
import { api } from '../services/api';


type ClockContextType = {
    isClockedIn: boolean;
    clockLoading: boolean;
    isTracking: boolean; // drives live indicator in the header
    handleClockToggle: () => Promise<void>;
};

const ClockContext = createContext<ClockContextType | undefined>(undefined);

export function ClockProvider({ children }: { children: React.ReactNode }) {
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [clockLoading, setClockLoading] = useState(false);
    const [isTracking, setIsTracking] = useState(false);

    // Hydrate clock status from backend on mount
    useEffect(() => {
        const fetchClockStatus = async () => {
            try {
                const res = await api.get('/drivers/clock-status/');
                const clockedIn = res.data.is_clocked_in;
                setIsClockedIn(res.data.is_clocked_in);

                // If they're already clocked in when the app loads, 
                // restart tracking - the background task may have been killed too
                if (clockedIn) {
                    const started = await startLocationTracking();
                    setIsTracking(started);
                }
            } catch {
                // fail silently — default false is safe
            }
        };
        fetchClockStatus();
    }, []);

    const handleClockToggle = async () => {
        setClockLoading(true);
        try {
            if (isClockedIn) {
                await api.post('/drivers/clock-out/');
                setIsClockedIn(false);
                //stop tracking on clock out
                await stopLocationTracking();
                setIsTracking(false);
            } else {
                await api.post('/drivers/clock-in/');
                setIsClockedIn(true);
                //start tracking on clock in
                const started = await startLocationTracking();
                setIsTracking(started);
            }
        } catch (err: any) {
            console.error('Clock toggle failed', err.message);
        } finally {
            setClockLoading(false);
        }
    };

    return (
        <ClockContext.Provider value={{ isClockedIn, clockLoading, isTracking, handleClockToggle }}>
            {children}
        </ClockContext.Provider>
    );
}

export function useClock() {
    const context = useContext(ClockContext);
    if (!context) throw new Error('useClock must be used within ClockProvider');
    return context;
}