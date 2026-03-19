import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../lib/ThemeContext';
import { Job } from '../../lib/types'; // Importing Job and Address types from lib/types.ts
import { api } from '../../services/api';

// This screen displays a list of jobs assigned to the logged-in driver. 
// It fetches the jobs from the backend API and shows key details like job number, project, date, material, and loading city. 
// Users can tap on a job to see more details on a separate screen. 
// The screen also includes pull-to-refresh functionality and error handling for network issues.
export default function MyJobsScreen() {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/drivers/me/jobs/');
      setJobs(res.data);
      setLastRefresh(new Date());
      setError(null); // Clear any previous errors
    } catch (err: any) {
    setError(err.message ?? 'Failed to load jobs.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

// useEffect to fetch jobs when the component mounts
// useEffect cannot be async, so we define an async function inside it and call it immediately
  useEffect(() => {
    fetchJobs();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchJobs();
  };

  return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
    <View style={styles.header}>
      <Text style={styles.lastRefreshText}>Last Refresh: {lastRefresh.toLocaleTimeString()}</Text>
      <TouchableOpacity onPress={handleRefresh}>
        <MaterialIcons name="refresh" size={24} color={theme.colors.primary} />
      </TouchableOpacity>
    </View>

    {loading ? (
      <ActivityIndicator 
        size="large" 
        color={theme.colors.primary} 
        style={{ marginTop: 60 }} 
      />
    ) : error ? (
      <View style={styles.errorContainer}>
        <MaterialIcons name="wifi-off" size={32} color={theme.colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchJobs}>
          <Text style={styles.retryText}>Tap to retry</Text>
        </TouchableOpacity>
      </View>
    ) : (
    <FlatList
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.container}
      data={jobs}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.card} onPress= {() => router.push({ pathname: '/job/[id]', params: { id: item.id } })}>
          <Text style={styles.jobNumber}>{item.job_number}</Text>
          <Text style={styles.project}>{item.project}</Text>
          <Text style={styles.detail}>{item.job_date} · {item.shift_start}</Text>
          <Text style={styles.detail}>{item.material} · {item.loading_address_info.city}</Text>
        </TouchableOpacity>
      )}
      ListEmptyComponent={<Text style={styles.empty}>No jobs assigned yet</Text>}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    />
    )}
    </View>
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
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: theme.fontSize.xl,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
    },
    lastRefreshText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    errorContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.sm,
      padding: theme.spacing.md,
    },
    errorText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    retryText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.primary,
      textDecorationLine: 'underline',
    },
  });
}