import { router } from 'expo-router';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../lib/ThemeContext';

const MOCK_JOBS = [
  {
    id: 1,
    job_number: 'J-001',
    project: 'Highway 14 Expansion',
    job_date: '2026-03-05',
    shift_start: '07:00',
    material: 'Sand',
    loading_address: { city: 'Mankato' },
  },
  {
    id: 2,
    job_number: 'J-002',
    project: 'Bridge Repair',
    job_date: '2026-03-06',
    shift_start: '06:00',
    material: 'Gravel',
    loading_address: { city: 'Rochester' },
  },
];

export default function MyJobsScreen() {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  return (
    <FlatList
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.container}
      data={MOCK_JOBS}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.card} onPress= {() => router.push({ pathname: '/job/[id]', params: { id: item.id } })}>
          <Text style={styles.jobNumber}>{item.job_number}</Text>
          <Text style={styles.project}>{item.project}</Text>
          <Text style={styles.detail}>{item.job_date} · {item.shift_start}</Text>
          <Text style={styles.detail}>{item.material} · {item.loading_address.city}</Text>
        </TouchableOpacity>
      )}
      ListEmptyComponent={<Text style={styles.empty}>No jobs assigned yet</Text>}
      refreshControl={<RefreshControl refreshing={false} onRefresh={() => {}} />}
    />
  );
}

function makeStyles(theme: ReturnType<typeof import('../../lib/ThemeContext').useTheme>['theme']) {
  return StyleSheet.create({
    container: {
      padding: theme.spacing.md,
      gap: theme.spacing.md,
    },
    card: {
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
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
    },
    detail: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    empty: {
      textAlign: 'center',
      color: theme.colors.textSecondary,
      marginTop: 60,
    },
  });
}