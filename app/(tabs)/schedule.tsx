import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../lib/ThemeContext';

export default function MyScheduleScreen() {
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Text style={styles.text}>My Schedule Screen</Text>
            <Text style={styles.subtext}>This is where your schedule will appear. You can view your upcoming jobs and appointments here.</Text>
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
});
}
