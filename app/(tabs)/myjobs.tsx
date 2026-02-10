import { StyleSheet, Text, View } from 'react-native';

export default function MyJobsScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>My Jobs Screen</Text>
            <Text style={styles.subtext}>This is where your job listings will appear. The first page after logging in.</Text>
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