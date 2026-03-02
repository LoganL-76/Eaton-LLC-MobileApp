import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../lib/ThemeContext';

// replace with const res = await api.get('/jobs/${id}/')
const MOCK_JOB = {
  id: 1,
  job_number: 'J-001',
  project: 'Highway 14 Expansion',
  job_date: '2026-03-05',
  shift_start: '07:00',
  material: 'Sand',
  job_foreman_name: 'Mike Johnson',
  job_foreman_contact: '507-555-0100',
  loading_address: { full: '1234 River Rd, Mankato, MN' },
  unloading_address: { full: '5678 Site Ave, Mankato, MN' },
  truck_number: 'T-12',
  truck_type: 'Dump Truck',
  status: 'assigned',
};

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  
  // 
  const [status, setStatus] = useState(MOCK_JOB.status);
  const STATUS_STEPS = ['assigned', 'en_route', 'on_site', 'completed'];
  const STATUS_LABELS = {
    assigned: 'Assigned',
    en_route: 'En Route',
    on_site: 'On Site',
    completed: 'Completed'
  };

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.section}>
          <Text style={styles.jobNumber}>{MOCK_JOB.job_number}</Text>
          <Text style={styles.project}>{MOCK_JOB.project}</Text>
          <Text style={styles.detail}>{MOCK_JOB.job_date} · {MOCK_JOB.shift_start}</Text>
        </View>

        {/* Addresses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Addresses</Text>
          <Text style={styles.label}>Loading</Text>
          <Text style={styles.detail}>{MOCK_JOB.loading_address.full}</Text>
          <Text style={styles.label}>Unloading</Text>
          <Text style={styles.detail}>{MOCK_JOB.unloading_address.full}</Text>
        </View>

        {/* Foreman */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Foreman</Text>
          <Text style={styles.detail}>{MOCK_JOB.job_foreman_name}</Text>
          <Text style={styles.detail}>{MOCK_JOB.job_foreman_contact}</Text>
        </View>

        {/* Truck */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Truck</Text>
          <Text style={styles.detail}>{MOCK_JOB.truck_number} · {MOCK_JOB.truck_type}</Text>
        </View>
        
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
                        key = {step}
                        style={[
                            styles.statusStep,
                            isCurrent && styles.statusStepCurrent,
                            isCompleted && styles.statusStepCompleted
                        ]}
                        onPress={() => {
                            if (isNext) setStatus(step);
                        }}
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