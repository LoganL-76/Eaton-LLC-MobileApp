import { StyleSheet, Text, View } from 'react-native';

export default function MyProfileScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>My Profile Screen</Text>
            <Text style={styles.subtext}>This is where your profile information will appear. You can edit your details here.</Text>
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
