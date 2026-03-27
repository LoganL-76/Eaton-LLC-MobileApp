import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../lib/ThemeContext";

export default function NotificationsScreen() { 
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    return (
        <View style={styles.container}>
            <View style={styles.emptyState}>
                <MaterialIcons name="notifications-none" size={64} color={theme.colors.textSecondary} />
                <Text style={styles.emptyTitle}>No notifications yet</Text>
                <Text style={styles.emptySubtext}>We'll let you know when there are updates about your jobs</Text>
            </View>
        </View>
    );
}

function makeStyles(theme: ReturnType<typeof import('../../lib/ThemeContext').useTheme>['theme']) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        emptyState: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: theme.spacing.lg,
            gap: theme.spacing.md,
        },
        emptyTitle: {
            fontSize: theme.fontSize.lg,
            fontWeight: theme.fontWeight.bold,
            color: theme.colors.text,
            marginTop: theme.spacing.sm,
        },
        emptySubtext: {
            fontSize: theme.fontSize.md,
            color: theme.colors.textSecondary,
            textAlign: 'center',
        },
    });
}
