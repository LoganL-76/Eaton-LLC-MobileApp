import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../lib/ThemeContext';
import { api } from '../../services/api';

export default function TicketsScreen() {
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    const [imageUri, setImageUri] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    // Function to handle image selection from camera
    const openCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Camera Permission Required',
                'Camera access is needed to take photos for ticket submission. Enable it in Settings.'
            );
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            // allows editing of the captured image
            allowsEditing: true,
            // compresses image to 70%
            quality: 0.7,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };
    //  gallery image selection function
    const openGallery = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Gallery Permission Required',
                'Photo library access is needed to select images for ticket submission. Enable it in Settings.'
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    // Function to handle ticket submission
    const handleSubmit = async () => {
        if (!imageUri) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('photo', {
                uri: imageUri, 
                name: `ticket_${Date.now()}.jpg`,
                type: 'image/jpeg',
            } as any);

            await api.post('/tickets/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            Alert.alert(
                'Ticket Submitted',
                'Your ticket has been submitted successfully.',
                [{ text: 'Done', onPress: () => router.back() }]
            );
        } catch (error) {
            Alert.alert(
                'Submission Failed',
                'There was an error submitting your ticket. Please try again.'
            );
        } finally {
            setUploading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex:1, backgroundColor: theme.colors.background }}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Submit a Ticket</Text>
                <Text style={styles.subtitle}>
                    Take a photo of your paperwork or pick one from your gallery.
                </Text>
                
                {imageUri ? (
                    // Show preview of selected image
                    <View style={styles.previewContainer}>
                        <Image source={{ uri: imageUri }} style={styles.preview} resizeMode = "contain" />
                        <TouchableOpacity onPress = {() => setImageUri(null)} style={styles.retakeButton}>
                            <Text style={styles.retakeText}>Retake Photo/ Choose Different</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    // No photos yet, show picker buttons
                    <View style={styles.buttonGroup}>
                        <TouchableOpacity style={styles.primaryButton} onPress={openCamera}>
                            <Text style={styles.primaryButtonText}>📷  Open Camera</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.secondaryButton} onPress={openGallery}>
                            <Text style={styles.secondaryButtonText}>🖼  Choose from Gallery</Text>
                        </TouchableOpacity>
                    </View> 
                )}

                {imageUri && (
                    <TouchableOpacity
                        style={[styles.submitButton, uploading && styles.submitDisabled]}
                        onPress={handleSubmit}
                        disabled={uploading}
                    >
                        {uploading
                            ? <ActivityIndicator color={theme.colors.textInverse} />
                            : <Text style={styles.primaryButtonText}>Submit</Text>
                        }
                    </TouchableOpacity>
                )}
                
                <TouchableOpacity style={styles.skipButton} onPress = {() => router.back()}>
                    <Text style={styles.skipText}>Skip for now</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

function makeStyles(theme: ReturnType<typeof import('../../lib/ThemeContext').useTheme>['theme']) {
  return StyleSheet.create({
    container: {
      padding: theme.spacing.lg,
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    title: {
      fontSize: theme.fontSize.xxl,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    buttonGroup: {
      width: '100%',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.md,
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      width: '100%',
    },
    primaryButtonText: {
      color: theme.colors.textInverse,
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.semibold,
    },
    secondaryButton: {
      borderWidth: 2,
      borderColor: theme.colors.primary,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      width: '100%',
    },
    secondaryButtonText: {
      color: theme.colors.primary,
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.semibold,
    },
    previewContainer: {
      width: '100%',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    preview: {
      width: '100%',
      height: 300,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    retakeButton: {
      paddingVertical: theme.spacing.sm,
    },
    retakeText: {
      color: theme.colors.primary,
      fontSize: theme.fontSize.sm,
      textDecorationLine: 'underline',
    },
    submitButton: {
      backgroundColor: theme.colors.success,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      width: '100%',
    },
    submitDisabled: {
      backgroundColor: theme.colors.disabled,
    },
    skipButton: {
      paddingVertical: theme.spacing.sm,
    },
    skipText: {
      color: theme.colors.textSecondary,
      fontSize: theme.fontSize.sm,
    },
  });
}
