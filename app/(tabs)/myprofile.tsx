import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../lib/ThemeContext';

export default function MyProfileScreen() {
    const { theme, mode, setMode, isDark } = useTheme();
    const { logout } = useAuth();
    

    const handleToggleTheme = () => {
        setMode(isDark ? 'light' : 'dark');
    };

    const handleLogout = async () => {
        await logout();
        router.replace('/(auth)/login');
    };

    const styles = makeStyles(theme);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Text style={styles.text}>My Profile Screen</Text>
            <Text style={styles.subtext}>This is where your profile information will appear. You can edit your details here.
            </Text>

            <TouchableOpacity style={styles.themeButton} onPress={handleToggleTheme}>
                <Text style={styles.themeButtonText}>
                    Switch to {isDark ? 'Light' : 'Dark'} Mode
                </Text>
            </TouchableOpacity>
            <Text style={styles.currentMode}>
                Current Mode: {mode}
            </Text>
            
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}

function makeStyles(theme: ReturnType<typeof import('../../lib/ThemeContext').useTheme>['theme']) {
    return StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.background,
    },
    text: {
        fontSize: theme.fontSize.xxl,
        fontWeight: theme.fontWeight.bold,
        marginBottom: theme.spacing.sm,
        color: theme.colors.text,
    },
    subtext: {
        fontSize: theme.fontSize.md,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
    themeButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        borderRadius: theme.borderRadius.md,
        marginTop: theme.spacing.lg,
    },
    themeButtonText: {
        color: theme.colors.textInverse,
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.semibold,
    },
    currentMode: {
        marginTop: theme.spacing.md,
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
    },
    logoutButton: {
        borderWidth: 1,
        borderColor: theme.colors.error,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        borderRadius: theme.borderRadius.md,
        marginTop:theme.spacing.md,
    },
    logoutButtonText: {
        color: theme.colors.error,
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.semibold,
    },

});
}