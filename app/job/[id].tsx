import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../lib/ThemeContext';
import { Job } from '../../lib/types'; // derive types from backend API
import { api } from '../../services/api';

// This screen shows detailed information about a specific job, including addresses, foreman info, truck info, and allows updating job status. 
// It fetches job details from the backend using the job ID from the route params. 
export default function JobDetailScreen() {
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('assigned')
  const STATUS_STEPS = ['assigned', 'en_route', 'on_site', 'completed'];
  const STATUS_LABELS = {
    assigned: 'Assigned',
    en_route: 'En Route',
    on_site: 'On Site',
    completed: 'Completed'
  };
  
  // endpoint to fetch job details by ID, including addresses and driver info
  const fetchJob = useCallback(async () => {
    try {
      const res = await api.get(`/jobs/${id}/`);
      setJob(res.data);
      setStatus(res.data.driver_assignments[0]?.status ?? 'assigned');
      setError(null);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load job details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchJob();
  }, [id]);

  // grabs status through driver assignmets
  const updateStatus = async (newStatus: string) => {
    const assignmentId = job?.driver_assignments[0]?.id;
    if (!assignmentId) return;

    const previousStatus = status;
    setStatus(newStatus);
    try {
      await api.patch(`/job-driver-assignments/${assignmentId}/status/`, { status: newStatus });
    } catch (err: any){
      setStatus(previousStatus);
      Alert.alert('Failed to update status', err.message ?? 'An error occurred while updating the job status. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error || !job) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background, gap: 12 }}>
        <Text style={{ color: theme.colors.textSecondary }}>{error ?? 'Job not found.'}</Text>
        <TouchableOpacity onPress={fetchJob}>
          <Text style={{ color: theme.colors.primary, textDecorationLine: 'underline' }}>Tap to retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const truck = job.driver_assignments[0]?.driver_truck_info;

  // Pop up to choose maps app when address is tapped
  const openMaps = (latitude: string, longitude: string, label: string) => {
    Alert.alert(
      'Open in Maps',
      label,
      [
        { text: 'Google Maps', onPress: () => Linking.openURL(`https://maps.google.com/?q=${latitude},${longitude}`) },
        { text: 'Apple Maps', onPress: () => Linking.openURL(`maps://?q=${latitude},${longitude}`) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  // Helper function to copy addresses to clipboard
  const copyAddress = async (address: string) => {
    await Clipboard.setStringAsync(address);
    Alert.alert('Address Copied', address);
  };

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.section}>
          <Text style={styles.jobNumber}>{job.job_number}</Text>
          <Text style={styles.project}>{job.project}</Text>
          <Text style={styles.detail}>{job.job_date} · {job.shift_start}</Text>
          <Text style={styles.detail}>{job.material}</Text>
        </View>

        {/* Addresses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Addresses</Text>

          {/* Loading Address */}
          <Text style={styles.label}>Loading</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => openMaps(job.loading_address_info.latitude, job.loading_address_info.longitude, job.loading_address_info.location_name)}>
              <Text style={[styles.detail, { color: theme.colors.primary }]}>{job.loading_address_info.location_name}</Text>
              <Text style={[styles.detail, { color: theme.colors.primary }]}>{job.loading_address_info.street_address}, {job.loading_address_info.city}, {job.loading_address_info.state}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginLeft: 12 }} onPress={() => copyAddress(`${job.loading_address_info.street_address}, ${job.loading_address_info.city}, ${job.loading_address_info.state}`)}>
              <MaterialIcons name="content-copy" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Unloading Address */}
          <Text style={styles.label}>Unloading</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => openMaps(job.unloading_address_info.latitude, job.unloading_address_info.longitude, job.unloading_address_info.location_name)}>
              <Text style={[styles.detail, { color: theme.colors.primary }]}>{job.unloading_address_info.location_name}</Text>
              <Text style={[styles.detail, { color: theme.colors.primary }]}>{job.unloading_address_info.street_address}, {job.unloading_address_info.city}, {job.unloading_address_info.state}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginLeft: 12 }} onPress={() => copyAddress(`${job.unloading_address_info.street_address}, ${job.unloading_address_info.city}, ${job.unloading_address_info.state}`)}>
              <MaterialIcons name="content-copy" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Foreman */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Foreman</Text>
          <Text style={styles.detail}>{job.job_foreman_name}</Text>
          <TouchableOpacity onPress={() => Linking.openURL(`tel:${job.job_foreman_contact}`)}>
            <Text style={[styles.detail, { color: theme.colors.primary }]}>{job.job_foreman_contact}</Text>
          </TouchableOpacity>
        </View>

        {/* Truck */}
        {truck ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Truck</Text>
            <Text style={styles.detail}>{truck.truck_type}</Text>
            <TouchableOpacity onPress={() => Linking.openURL(`tel:${truck.driver_phone}`)}>
              <Text style={[styles.detail, { color: theme.colors.primary }]}>{truck.driver} · {truck.driver_phone}</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={styles.statusRow}>
            {STATUS_STEPS.map((step, index) => {
              const currentIndex = STATUS_STEPS.indexOf(status);
              const isCompleted = index < currentIndex;
              const isCurrent = index === currentIndex;
              const isNext = index === currentIndex + 1;
              return (
                <TouchableOpacity
                  key={step}
                  style={[
                    styles.statusStep,
                    isCurrent && styles.statusStepCurrent,
                    isCompleted && styles.statusStepCompleted
                  ]}
                  onPress={() => { if (isNext) updateStatus(step); }}
                  disabled={!isNext}
                >
                  <Text style={[
                    styles.statusStepText,
                    isCurrent && styles.statusStepTextCurrent,
                    isCompleted && styles.statusStepTextCompleted
                  ] as any}>
                    {STATUS_LABELS[step as keyof typeof STATUS_LABELS]}
                  </Text>
                </TouchableOpacity>
              );
            })}
         </View>
        </View>

      </View>
    </ScrollView>
  );
}

function makeStyles(theme: ReturnType<typeof import('../../lib/ThemeContext').useTheme>['theme']) {
  return StyleSheet.create({
    container: {
      padding: theme.spacing.md,
      gap: theme.spacing.md,
    },
    section: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: theme.spacing.xs,
    },
    jobNumber: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.primary,
      fontWeight: theme.fontWeight.semibold,
    },
    project: {
      fontSize: theme.fontSize.xl,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
    },
    sectionTitle: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    label: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textTertiary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    detail: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
    },
    statusRow: {
        flexDirection: 'row',
        gap: theme.spacing.xs,
    },
    statusStep: {
        paddingVertical: theme.spacing.sm,
        flex: 1,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
    },
    statusStepCurrent: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primary,
    },
    statusStepCompleted: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primary,
    },
    statusStepText: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textSecondary,
      fontWeight: theme.fontWeight.medium,
      textAlign: 'center' as const,
    },
    statusStepTextCurrent: {
      color: theme.colors.textInverse,
      fontWeight: theme.fontWeight.bold,
    },
    statusStepTextCompleted: {
        color: theme.colors.textSecondary,
    },
  });
}