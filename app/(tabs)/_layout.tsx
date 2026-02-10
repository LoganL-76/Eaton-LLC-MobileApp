import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";

export default function TabLayout() {
    // Commented out for dev
    // const { user } = useAuth();
    // if (!user) {
    //     return <Redirect href="/login" />;
    // }
    return (
        <Tabs>
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