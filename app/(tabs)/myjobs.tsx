import { MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../lib/ThemeContext';
import { Job } from '../../lib/types'; // Importing Job and Address types from lib/types.ts
import { api } from '../../services/api';

// This screen displays a list of jobs assigned to the logged-in driver. 
// It fetches the jobs from the backend API and shows key details like job number, project, date, material, and loading city. 
// Users can tap on a job to see more details on a separate screen. 
// The screen also includes pull-to-refresh functionality and error handling for network issues.

export async function fetchJobs(): Promise<Job[]> {
  const res = await api.get('/drivers/me/jobs/');
  return res.data.results ?? res.data;
}

export default function MyJobsScreen() {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  
  // - on mount: checks cache first, then fetches if stale
  // - while offline: returns whatever is in the persisted cache automatically
  // - isRefetching: true when refetching in background, can be used to show a loading indicator without blocking the UI
  const { data: jobs=[], isLoading, isRefetching, error, refetch } = useQuery({
    queryKey: ['jobs'],
    queryFn: fetchJobs,
  });

  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockLoading, setClockLoading] = useState(false);

  const handleClockToggle = async () => {
    setClockLoading(true);
    try {
      if (isClockedIn) {
        await api.post('/drivers/clock-out/');
        //prompt user to sumbit tickets on clock out
        setIsClockedIn(false);
        Alert.alert(
          'Clocked Out',
          'Do you have tickets to submit for this shift?',
          [
            {
              text: 'Submit Tickets',
              onPress: () => router.push('/(tabs)/tickets'),
            },
            {
              text: 'Submit Later',
              style: 'cancel',
            },
          ]
        );
      } else {
        await api.post('/drivers/clock-in/');
      }
      setIsClockedIn(prev => !prev);
    } catch (err: any) {
      console.error('Clock toggle failed', err.message);
    } finally {
      setClockLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.clockContainer}>
        <TouchableOpacity
          style={[styles.clockButton, isClockedIn ? styles.clockButtonOut : styles.clockButtonIn]}
          onPress={handleClockToggle}
          disabled={clockLoading}
        >
          {clockLoading ? (
            <ActivityIndicator color={theme.colors.textInverse} size="small" />
        ) : (
          <>
            <MaterialIcons
              name={isClockedIn ? 'logout' : 'login'}
              size={20}
              color={theme.colors.textInverse}
            />
            <Text style={styles.clockButtonText}>
              {isClockedIn ? 'Clock Out' : 'Clock In'}
            </Text>
          </>
        )}
      </TouchableOpacity>
      {isClockedIn && (
        <Text style={styles.clockedInLabel}>● Clocked in</Text>
      )}
    </View>
      <View style={styles.header}>
        <Text style={styles.lastRefreshText}>
          {isRefetching ? 'Refreshing...' : `Last updated: ${new Date().toLocaleTimeString()}`}
        </Text>
      <TouchableOpacity onPress={() => refetch()}>
        <MaterialIcons name="refresh" size={24} color={theme.colors.primary} />
      </TouchableOpacity>
    </View>

    {isLoading ? (
      // isLoading is only true on the very first load with no cached data
      // If cached data exists (even stale), isLoading will be false and
      // the cached jobs will render immediately whiel a background refetch runs
      <ActivityIndicator 
        size="large" 
        color={theme.colors.primary} 
        style={{ marginTop: 60 }} 
      />
    ) : error ? (
      <View style={styles.errorContainer}>
        <MaterialIcons name="wifi-off" size={32} color={theme.colors.error} />
        <Text style={styles.errorText}>
          {(error as any).message ?? 'Failed to load jobs'}
        </Text>
        <TouchableOpacity onPress={() => refetch()}>
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
      // refetch() is what pull-to-refresh calls
      // React Query handles the loading state - no need to manage setRefreshing manually
      refreshControl= {
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
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
    clockContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.sm,
      gap: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    clockButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
    },
    clockButtonIn: {
      backgroundColor: theme.colors.success,
    },
    clockButtonOut: {
      backgroundColor: theme.colors.error,
    },
    clockButtonText: {
      color: theme.colors.textInverse,
      fontWeight: theme.fontWeight.semibold,
      fontSize: theme.fontSize.md,
    },
    clockedInLabel: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.success,
      fontWeight: theme.fontWeight.medium,
    },
  });
}