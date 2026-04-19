import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';


type ClockContextType = {
    isClockedIn: boolean;
    clockLoading: boolean;
    handleClockToggle: () => Promise<void>;
};

const ClockContext = createContext<ClockContextType | undefined>(undefined);

export function ClockProvider({ children }: { children: React.ReactNode }) {
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [clockLoading, setClockLoading] = useState(false);

    // Hydrate clock status from backend on mount
    useEffect(() => {
        const fetchClockStatus = async () => {
            try {
                const res = await api.get('/drivers/clock-status/');
                setIsClockedIn(res.data.is_clocked_in);
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
            } else {
                await api.post('/drivers/clock-in/');
                setIsClockedIn(true);
            }
        } catch (err: any) {
            console.error('Clock toggle failed', err.message);
        } finally {
            setClockLoading(false);
        }
    };

    return (
        <ClockContext.Provider value={{ isClockedIn, clockLoading, handleClockToggle }}>
            {children}
        </ClockContext.Provider>
    );
}

export function useClock() {
    const context = useContext(ClockContext);
    if (!context) throw new Error('useClock must be used within ClockProvider');
    return context;
}