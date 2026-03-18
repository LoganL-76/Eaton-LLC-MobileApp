import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../lib/ThemeContext';
import { Job } from '../../lib/types';
import { api } from '../../services/api';

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  
  // 
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

  const fetchJob = async () => {
    try {
      const res = await api.get(`/jobs/${id}/`);
      setJob(res.data);
      console.log('Adress info: ', res.data.loading_address_info);
      console.log('driver ', res.data.driver_assignments[0]?.driver_truck_info);
      setStatus(res.data.status ?? 'assigned');
      setError(null);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load job details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [id]);

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
          <Text style={styles.label}>Loading</Text>
          <TouchableOpacity onPress={() => Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(job.loading_address_info.full_address)}`)}>
            <Text style={[styles.detail, { color: theme.colors.primary }]}>{job.loading_address_info.full_address}</Text>
          </TouchableOpacity>
          <Text style={styles.label}>Unloading</Text>
          <TouchableOpacity onPress={() => Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(job.unloading_address_info.full_address)}`)}>
            <Text style={[styles.detail, { color: theme.colors.primary }]}>{job.unloading_address_info.full_address}</Text>
          </TouchableOpacity>
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
                  onPress={() => { if (isNext) setStatus(step); }}
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