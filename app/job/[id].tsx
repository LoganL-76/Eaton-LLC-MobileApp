import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../lib/ThemeContext';

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
  });
}