import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../lib/ThemeContext';
import { Driver } from '../../lib/types';
import { api } from '../../services/api';

export default function ProfileDetailsScreen() {
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    const [driver, setDriver] = useState<Driver | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchDriverDetails = async () => {
            try {
                setLoading(true);
                const response = await api.get('/drivers/me/');
                console.log('Driver details response:', response.data);
                setDriver(response.data);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('An unknown error occurred.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDriverDetails();
    }, []);

    if (loading) {
        return <Text>Loading...</Text>;
    }

    if (error) {
        return <Text>Error: {error}</Text>;
    }

    if (!driver) return null;
    
    return (
        <View style={styles.container}>
            <Text style={styles.text}>{driver.name}</Text>
            <Text style={{ color: theme.colors.textSecondary }}>{driver.email_address || 'Not provided'}</Text>
            <Text style={{ color: theme.colors.textSecondary }}>{driver.phone_number || 'Not provided'}</Text>
            <Text style={{ color: theme.colors.textSecondary }}>{driver.address || 'Not provided'}</Text>
            <Text style={{ color: theme.colors.textSecondary }}>{driver.driver_license || 'Not provided'}</Text>
        </View>
    );
}

function makeStyles(theme: ReturnType<typeof import('../../lib/ThemeContext').useTheme>['theme']) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
            padding: theme.spacing.lg,
        },
        text: {
            fontSize: theme.fontSize.xxl,
            fontWeight: theme.fontWeight.bold,
            color: theme.colors.text,
        },
    });
}