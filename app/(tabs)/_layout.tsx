import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";
import { useTheme } from "../../lib/ThemeContext";

export default function TabLayout() {
    const { theme } = useTheme();
    // Commented out for dev
    // const { user } = useAuth();
    // if (!user) {
    //     return <Redirect href="/login" />;
    // }

    return (
        <Tabs
            screenOptions={{
                headerStyle: { backgroundColor: theme.colors.primary },
                headerTitleStyle: { color: theme.colors.pageTitle, fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold },
                headerTintColor: theme.colors.text,
                tabBarStyle: { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textSecondary,
            }}
        >
            <Tabs.Screen
                name="myjobs"
                options = {{
                    title: "My Jobs",
                    tabBarIcon: ({ color }) => <MaterialIcons name="work" size={24} color={color} />
                }}
            />
            <Tabs.Screen
                name="schedule"
                options = {{
                    title: "Schedule",
                    tabBarIcon: ({ color }) => <MaterialIcons name="calendar-today" size={24} color={color} />
                }}
            />
            <Tabs.Screen
                name = "myprofile"
                options = {{
                    title: "My Profile",
                    tabBarIcon: ({ color }) => <MaterialIcons name="person" size={24} color={color} />
                }}
            />
        </Tabs>
    );
}