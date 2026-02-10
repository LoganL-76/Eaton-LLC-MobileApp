import { StyleSheet, Text, View } from 'react-native';

export default function MyScheduleScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>My Schedule Screen</Text>
            <Text style={styles.subtext}>This is where your schedule will appear. You can view your upcoming jobs and appointments here.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtext: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});

