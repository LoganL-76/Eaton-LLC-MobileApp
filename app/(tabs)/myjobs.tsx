import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    setTimeout(() => { 
        setLoading(false);
        setLastRefresh(new Date());
        }, 
        1000);
  }, []);

 // Simulate pull-to-refresh by showing loading indicator for 1 second
  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLastRefresh(new Date());
    setRefreshing(false);
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
    ) : (
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
  });
}