import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../lib/ThemeContext';

export default function MyProfileScreen() {
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Text style={styles.text}>My Profile Screen</Text>
            <Text style={styles.subtext}>This is where your profile information will appear. You can edit your details here.</Text>
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